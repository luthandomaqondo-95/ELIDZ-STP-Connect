import React, { useCallback, useEffect, useState } from 'react';
import { View, Pressable, ScrollView, Image, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ScreenScrollView } from '@/components/ScreenScrollView';
import { useAuthContext } from '@/hooks/use-auth-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { OpportunityService } from '@/services/opportunity.service';
import { EventService , Event } from '@/services/event.service';
import { tenantService } from '@/services/tenant.service';
import { Opportunity , Tenant } from '@/types';
import { useColorScheme } from '@/hooks/use-theme-color';
import { COLORS } from '@/theme/colors';
import { TenantLogo } from '@/components/TenantLogo';
import { TabsLayoutHeader } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { verificationService } from '@/services/verification.service';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
    const { isLoggedIn, isLoading , profile} = useAuthContext();
    const { colorScheme } = useColorScheme();
    const colors = COLORS[colorScheme ?? 'light'];

    // Check if user is guest (from route params or context)
    const isGuest = !profile;

    const [latestOpportunities, setLatestOpportunities] = useState<Opportunity[]>([]);
    const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
    const [featuredTenants, setFeaturedTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    // Kept for Hot Reload compatibility (Centers of Excellence section removed)
    const [centersOfExcellence] = useState<Tenant[]>([]);
    const [loadingVerification, setLoadingVerification] = useState(false);
    const [verificationDocCount, setVerificationDocCount] = useState(0);
    const [verificationStatus, setVerificationStatus] = useState<'verified' | 'rejected' | 'pending' | 'incomplete' | 'not_submitted'>('not_submitted');
    const [featuredOpportunity, setFeaturedOpportunity] = useState<Opportunity | null>(null);

    const checkVerificationStatus = useCallback(async () => {
        if (profile?.role !== 'SMME' || !profile?.id) return;

        setLoadingVerification(true);
        try {
            const [statusDoc, allDocs] = await Promise.all([
                verificationService.getVerificationStatus(profile.id),
                verificationService.getAllVerifications(profile.id),
            ]);

            const requiredTypes = ['Business Registration', 'ID Document', 'Business Profile'];
            // Only count documents that have actually been uploaded: non-empty URL and a valid storage URL
            // (avoids counting placeholder or stray rows that might have a non-empty document_url)
            const isValidStorageUrl = (url: string | undefined) => {
                const u = url?.trim?.() ?? '';
                return u.length > 0 && (u.includes('verification-documents') || u.includes('/storage/'));
            };
            const requiredDocs = allDocs.filter(
                doc => requiredTypes.includes(doc.document_type) && isValidStorageUrl(doc.document_url)
            );
            const docCount = requiredDocs.length;
            setVerificationDocCount(docCount);

            // If profile is verified (or all docs verified), hide banner by setting verified.
            if (statusDoc?.status === 'verified') {
                setVerificationStatus('verified');
                return;
            }

            if (docCount === 0) {
                setVerificationStatus('not_submitted');
                return;
            }

            const anyRejected = requiredDocs.some(doc => doc.status === 'rejected');
            if (anyRejected) {
                setVerificationStatus('rejected');
                return;
            }

            if (docCount < 3) {
                setVerificationStatus('incomplete');
                return;
            }

            setVerificationStatus('pending');
        } catch (error) {
            console.error('Error checking verification status:', error);
            // Fall back to prompting verification if we can't confirm.
            setVerificationDocCount(0);
            setVerificationStatus('not_submitted');
        } finally {
            setLoadingVerification(false);
        }
    }, [profile?.id, profile?.role]);

    // Refresh verification banner whenever Home regains focus
    useFocusEffect(
        useCallback(() => {
            checkVerificationStatus();
        }, [checkVerificationStatus])
    );

    // Initial load (and when user changes)
    useEffect(() => {
        checkVerificationStatus();
    }, [checkVerificationStatus]);

    const pickFeaturedOpportunity = useCallback((opps: Opportunity[]) => {
        if (!opps || opps.length === 0) return null;

        // Prefer explicit featured flag if it exists in DB (even if not typed)
        const explicitFeatured = opps.find((o: any) => Boolean(o?.is_featured) || Boolean(o?.featured) || Boolean(o?.isFeatured));
        if (explicitFeatured) return explicitFeatured;

        // Prefer newest Funding opportunity, otherwise newest overall (list already sorted desc)
        return opps.find((o) => o.type === 'Funding') || opps[0];
    }, []);

    const loadDashboardData = useCallback(async () => {
        try {
            setLoading(true);

            // Load opportunities
            const opportunities = await OpportunityService.getOpportunities();
            const latest = opportunities.slice(0, 5);
            setLatestOpportunities(latest);
            setFeaturedOpportunity(pickFeaturedOpportunity(latest));

            // Load events (upcoming first; if none, show recent past)
            const all = await EventService.getAllEvents();
            const now = new Date().toISOString();
            const upcoming = all.filter((e) => e.date >= now).sort((a, b) => (a.date < b.date ? -1 : 1)).slice(0, 5);
            const past = all.filter((e) => e.date < now).sort((a, b) => (a.date > b.date ? -1 : 1));
            setUpcomingEvents(upcoming.length > 0 ? upcoming : past.slice(0, 5));

            // Load featured tenants
            const tenants = await tenantService.getTenants(6);
            setFeaturedTenants(tenants);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            setLatestOpportunities([]);
            setFeaturedOpportunity(null);
            setUpcomingEvents([]);
        } finally {
            setLoading(false);
        }
    }, [pickFeaturedOpportunity]);

    // Initial load
    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    // Refresh dashboard whenever Home regains focus (keeps hero banner dynamic)
    useFocusEffect(
        useCallback(() => {
            loadDashboardData();
        }, [loadDashboardData])
    );

    return (
        <ScreenScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            <TabsLayoutHeader title="Home" className="sticky top-0 z-10" profile={profile} notificationIconColor={colors.text} noExtraPaddingTop reducePaddingTop={90} />
            
            {/* SMME Verification Banner - Dynamic status */}
            {profile?.role === 'SMME' && profile?.id && verificationStatus !== 'verified' && (
                <View className="mx-5 mb-3 rounded-lg bg-accent/10 border border-accent/20 p-3">
                    <View className="flex-row items-center">
                        <Feather name="info" size={14} color={colors.accent} />
                        <Text className="text-accent text-xs font-medium ml-2 flex-1">
                            {loadingVerification
                                ? 'Checking verification status...'
                                : verificationStatus === 'not_submitted'
                                    ? 'Verification required to access all features'
                                    : verificationStatus === 'incomplete'
                                        ? `${verificationDocCount} of 3 documents uploaded — ${3 - verificationDocCount} remaining`
                                        : verificationStatus === 'rejected'
                                            ? 'Verification rejected — update your documents'
                                            : 'Verification submitted — pending review (24–48h)'}
                        </Text>
                        {!loadingVerification && (
                            <Pressable
                                onPress={() => router.push('/smme-verification')}
                                className="ml-2"
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <Text className="text-accent text-xs font-semibold underline">
                                    {verificationStatus === 'not_submitted'
                                        ? 'Verify'
                                        : verificationStatus === 'incomplete'
                                            ? 'Continue'
                                            : verificationStatus === 'rejected'
                                                ? 'Fix'
                                                : 'View'}
                                </Text>
                            </Pressable>
                        )}
                    </View>
                </View>
            )}
            
            {/* Hero Banner */}
            <View className="mx-5 mb-6 shadow-md rounded-3xl overflow-hidden">
                <LinearGradient
                    colors={[colors.primary, colors.gradientMessageEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="p-6"
                >
                    <View className="flex-row items-center mb-3">
                        <View className="px-2.5 py-1 rounded-md bg-accent mr-3">
                            <Text className="text-white text-xs font-bold uppercase tracking-wider">Featured</Text>
                        </View>
                        <View className="flex-row items-center flex-1">
                            <View className="w-6 h-6 rounded-full bg-white/20 mr-2 overflow-hidden justify-center items-center">
                                <TenantLogo
                                    logoUrl={featuredOpportunity?.tenant?.logo_url ?? undefined}
                                    name={featuredOpportunity?.tenant ? (featuredOpportunity.tenant.name || featuredOpportunity.org || 'ELIDZ-STP') : 'ELIDZ-STP'}
                                    size={12}
                                    className="w-5 h-5"
                                />
                            </View>
                            <Text className="text-white/80 text-xs font-medium uppercase tracking-widest">
                                {featuredOpportunity?.tenant?.name || featuredOpportunity?.org || 'ELIDZ-STP'}
                            </Text>
                        </View>
                    </View>
                    {loading ? (
                        <>
                            <View className="h-8 bg-white/10 rounded-lg mb-3 w-4/5" />
                            <View className="h-4 bg-white/10 rounded-lg mb-2 w-full" />
                            <View className="h-4 bg-white/10 rounded-lg mb-6 w-3/4" />
                        </>
                    ) : (
                        <>
                            <Text className="text-white text-2xl font-bold mb-3 leading-tight">
                                {featuredOpportunity?.title || 'Innovation Opportunities Await'}
                            </Text>
                            <Text className="text-white/90 text-sm mb-6 leading-relaxed" numberOfLines={2}>
                                {featuredOpportunity?.description || 'Discover funding, incubation, and partnership opportunities at ELIDZ-STP.'}
                            </Text>
                            {featuredOpportunity && (
                                <Pressable
                                    className="bg-white py-2.5 px-5 rounded-full self-start active:opacity-90 shadow-sm flex-row items-center"
                                    onPress={() => router.push({ pathname: '/opportunity-detail', params: { id: featuredOpportunity.id } })}
                                >
                                    <Text className="text-primary font-bold text-sm mr-2">Explore Opportunity</Text>
                                    <Feather name="arrow-right" size={16} color={colorScheme === 'dark' ? colors.secondary : colors.primary} />
                                </Pressable>
                            )}
                        </>
                    )}
                </LinearGradient>
            </View>

            {/* Explore Section */}
            <View className="mb-8 mx-5">
                <Text className="text-xl font-bold text-foreground tracking-tight mb-4">
                    Explore
                </Text>
                <View className="flex-row flex-wrap" style={{ marginHorizontal: -4 }}>
                     <Pressable
                        className="flex-1 min-w-[45%] m-1 bg-card p-4 rounded-2xl border border-border/50 active:opacity-90 shadow-sm"
                        onPress={() => router.push('/(tabs)/verified-smmes')}
                    >
                        <View className={`w-10 h-10 rounded-full justify-center items-center mb-2 ${colorScheme === 'dark' ? 'bg-secondary/15' : 'bg-blue-100'}`}>
                            <Feather name="shield" size={20} color={colorScheme === 'dark' ? colors.secondary : colors.primary} />
                        </View>
                        <Text className="text-sm font-bold text-foreground">Verified SMMEs</Text>
                    </Pressable>
                     <Pressable
                        className="flex-1 min-w-[45%] m-1 bg-card p-4 rounded-2xl border border-border/50 active:opacity-90 shadow-sm"
                        onPress={() => router.push('/(tabs)/services')}
                    >
                        <View className="w-10 h-10 rounded-full bg-accent/15 justify-center items-center mb-2">
                            <Feather name="globe" size={20} color={colors.accent} />
                        </View>
                        <Text className="text-sm font-bold text-foreground">Virtual Tours</Text>
                    </Pressable>
                </View>
            </View>

            {/* Latest Opportunities */}
            <View className="mb-8">
                <View className="flex-row justify-between items-center mx-5 mb-4">
                    <Text className="text-xl font-bold text-foreground tracking-tight">Latest Opportunities</Text>
                    <Pressable onPress={() => router.push('/opportunities')}>
                        <Text className="text-accent text-sm font-semibold">View All</Text>
                    </Pressable>
                </View>
                <View className="mx-5">
                    {latestOpportunities.slice(0, 3).map((opp, index) => (
                        <Pressable
                            key={opp.id}
                            className={`flex-row items-center p-4 mb-3 rounded-2xl bg-card active:opacity-95 border border-border/40 shadow-sm ${index === 2 ? 'mb-0' : ''}`}
                            onPress={() => router.push({ pathname: '/opportunity-detail', params: { id: opp.id } })}
                        >
                            <View className={`w-10 h-10 rounded-full justify-center items-center mr-3 border border-border/40 ${colorScheme === 'dark' ? 'bg-secondary/10' : 'bg-primary/10'}`}>
                                <Feather name="briefcase" size={20} color={colorScheme === 'dark' ? colors.secondary : colors.primary} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-sm font-bold text-foreground mb-0.5" numberOfLines={1}>{opp.title}</Text>
                                <Text className="text-muted-foreground text-xs">
                                    {opp.org} • {opp.deadline ? new Date(opp.deadline).toLocaleDateString() : 'No deadline'}
                                </Text>
                            </View>
                            <Feather name="chevron-right" size={20} color={colors.iconGray} />
                        </Pressable>
                    ))}
                </View>
            </View>

            {/* Upcoming Events */}
            <View className="mb-8">
                <View className="flex-row justify-between items-center mx-5 mb-4">
                    <Text className="text-xl font-bold text-foreground tracking-tight">Upcoming Events</Text>
                    <Pressable onPress={() => router.push('/events')}>
                        <Text className="text-accent text-sm font-semibold">Calendar</Text>
                    </Pressable>
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20 }}
                >
                    {upcomingEvents.map((event) => {
                        const eventDate = new Date(event.date);
                        const formattedDate = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                        
                        return (
                            <Pressable
                                key={event.id}
                                className="p-4 mr-4 rounded-2xl bg-card active:opacity-90 shadow-sm border border-border/40"
                                style={{ width: Math.min(256, width * 0.75), minHeight: 140 }}
                                onPress={() => router.push({ pathname: '/event-detail', params: { id: event.id } })}
                            >
                                <View className="flex-row justify-between items-start mb-3">
                                    <View className={`px-2.5 py-1 rounded-md ${colorScheme === 'dark' ? 'bg-secondary/10' : 'bg-primary/10'}`}>
                                        <Text className={`text-xs font-bold ${colorScheme === 'dark' ? 'text-secondary' : 'text-primary'}`}>Free</Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <Feather name="calendar" size={12} color={colors.iconGrayDark} />
                                        <Text className="text-muted-foreground text-xs ml-1">{formattedDate}</Text>
                                    </View>
                                </View>
                                <Text className="text-base font-bold mb-2 text-foreground leading-tight" numberOfLines={2}>
                                    {event.title}
                                </Text>
                                {event.location && (
                                    <View className="flex-row items-center mt-1">
                                        <Feather name="map-pin" size={12} color={colors.iconGrayDark} />
                                        <Text className="text-muted-foreground text-xs ml-1" numberOfLines={1}>
                                            {event.location}
                                        </Text>
                                    </View>
                                )}
                            </Pressable>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Who's Here - Featured Tenants */}
            <View className="mb-8">
                <View className="flex-row justify-between items-center mx-5 mb-4">
                    <Text className="text-xl font-bold text-foreground tracking-tight">Network</Text>
                    <Pressable onPress={() => router.push('/tenants')}>
                        <Text className="text-accent text-sm font-semibold">View All</Text>
                    </Pressable>
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20 }}
                >
                    {featuredTenants.map((tenant) => (
                        <Pressable
                            key={tenant.id}
                            className="mr-4 items-center active:opacity-90"
                            style={{ width: Math.min(112, width * 0.25), minWidth: 80 }}
                            onPress={() => router.push({ pathname: '/tenant-detail', params: { id: tenant.id } })}
                        >
                            <View className="w-16 h-16 rounded-full bg-white border border-border/60 justify-center items-center mb-2 overflow-hidden shadow-sm">
                                <TenantLogo logoUrl={tenant.logo_url} name={tenant.name} />
                            </View>
                            <Text className="text-xs font-bold text-center mb-0.5 text-foreground" numberOfLines={1}>
                                {tenant.name}
                            </Text>
                            <Text className="text-[10px] text-muted-foreground text-center" numberOfLines={1}>
                                {tenant.industry || 'Partner'}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            {/* Premium Upgrade Banner (disabled) */}
            {/* {profile && !isGuest && (
              <View className="mx-5 mb-8 rounded-2xl overflow-hidden shadow-sm">
                <LinearGradient
                  colors={['#F38C1E', '#FF8533']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="p-5"
                >
                  <View className="flex-row items-center mb-2">
                    <View className="bg-white/20 p-1.5 rounded-full mr-2">
                      <Feather name="star" size={16} color="white" />
                    </View>
                    <Text className="text-lg font-bold text-white">
                      Upgrade to Premium
                    </Text>
                  </View>
                  <Text className="text-white/90 text-sm mb-4 leading-relaxed">
                    Get priority access to opportunities and advanced analytics.
                  </Text>
                  <Pressable
                    className="bg-white py-2.5 px-4 rounded-xl self-start active:opacity-90"
                    onPress={() => router.push('/(modals)/premium-upgrade')}
                  >
                    <Text className="text-[#F38C1E] text-xs font-bold uppercase tracking-wide">
                      Upgrade Now
                    </Text>
                  </Pressable>
                </LinearGradient>
              </View>
            )} */}

            {/* Welcome message for guest users - only show when not logged in and not loading */}
            {!isLoggedIn && !isLoading ? (
                <View className="mx-5 mb-8 p-5 rounded-3xl">
                    <Text className="text-lg font-bold mb-2 text-foreground">
                        Welcome to ELIDZ-STP! 👋
                    </Text>
                    <Text className="text-muted-foreground text-sm mb-4 leading-relaxed">
                        Create an account to unlock premium features like direct messaging and priority listings.
                    </Text>
                    <Button
                        className="bg-primary py-3 px-5 rounded-full self-start active:opacity-90 shadow-sm"
                        onPress={() => router.push('/(auth)/signup')}
                    >
                        <Text className="text-white text-sm font-bold">Sign Up Free</Text>
                    </Button>
                </View>
            ) : null}
        </ScreenScrollView>
    );
}

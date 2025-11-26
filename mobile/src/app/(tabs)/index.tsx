import React, { useState, useEffect } from 'react';
import { View, Pressable, ScrollView, Image, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ScreenScrollView } from '@/components/ScreenScrollView';
import { useAuthContext } from '@/hooks/use-auth-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { OpportunityService } from '@/services/opportunity.service';
import { EventService } from '@/services/event.service';
import { tenantService } from '@/services/tenant.service';
import { Opportunity } from '@/types';
import { Event } from '@/services/event.service';
import { Tenant } from '@/types';
import { TenantLogo } from '@/components/TenantLogo';
import { TabsLayoutHeader } from '@/components/Header';
import { Button } from '@/components/ui/button';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
    const { isLoggedIn, isLoading , profile} = useAuthContext();

    // Check if user is guest (from route params or context)
    const isGuest = !profile;

    const [latestOpportunities, setLatestOpportunities] = useState<Opportunity[]>([]);
    const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
    const [featuredTenants, setFeaturedTenants] = useState<Tenant[]>([]);
    const [centersOfExcellence, setCentersOfExcellence] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);

    // Load dashboard data
    useEffect(() => {
        async function loadDashboardData() {
            try {
                setLoading(true);
                
                // Load opportunities
                const opportunities = await OpportunityService.getOpportunities();
                setLatestOpportunities(opportunities.slice(0, 5));

                // Load events
                const events = await EventService.getUpcomingEvents(5);
                setUpcomingEvents(events);

                // Load tenants (centers of excellence)
                const centers = await tenantService.getCentersOfExcellence();
                setCentersOfExcellence(centers);

                // Load featured tenants
                const tenants = await tenantService.getTenants(6);
                setFeaturedTenants(tenants);

            } catch (error) {
                console.error('Error loading dashboard data:', error);
            } finally {
                setLoading(false);
            }
        }

        loadDashboardData();
    }, []);

    // Map centers to product lines format
    const productLines = centersOfExcellence.map((center) => {
        const nameLower = center.name.toLowerCase();
        let icon = 'briefcase';
        if (nameLower.includes('food') || nameLower.includes('water') || nameLower.includes('lab')) icon = 'droplet';
        else if (nameLower.includes('design')) icon = 'pen-tool';
        else if (nameLower.includes('digital') || nameLower.includes('tech')) icon = 'monitor';
        else if (nameLower.includes('automotive')) icon = 'settings';
        else if (nameLower.includes('energy')) icon = 'zap';

        return {
            id: center.id,
            name: center.name,
            icon,
            description: center.description || 'Innovation center at ELIDZ STP',
            image: require('../../../assets/images/connect-solve.png'),
        };
    });

    return (
        <ScreenScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            <TabsLayoutHeader title="Home" className="sticky top-0 z-10" />
            {/* Hero Banner */}
            <View className="mx-5 mb-6 shadow-md rounded-3xl overflow-hidden">
                <LinearGradient
                    colors={['#002147', '#003366']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="p-6"
                >
                    {(() => {
                        const featuredOpp = latestOpportunities.find(opp => opp.type === 'Funding') || latestOpportunities[0];

                        return (
                            <>
                                <View className="flex-row items-center mb-3">
                                    <View className="px-2.5 py-1 rounded-md bg-[#FF6600] mr-3">
                                        <Text className="text-white text-xs font-bold uppercase tracking-wider">
                                            Featured
                                        </Text>
                                    </View>
                                    <Text className="text-white/80 text-xs font-medium uppercase tracking-widest">
                                        {featuredOpp?.org || 'ELIDZ-STP'}
                                    </Text>
                                </View>
                                <Text className="text-white text-2xl font-bold mb-3 leading-tight">
                                    {featuredOpp?.title || 'Innovation Opportunities Await'}
                                </Text>
                                <Text className="text-white/90 text-sm mb-6 leading-relaxed" numberOfLines={2}>
                                    {featuredOpp?.description || 'Discover funding, incubation, and partnership opportunities at ELIDZ-STP.'}
                                </Text>
                                {featuredOpp && (
                                    <Pressable
                                        className="bg-white py-2.5 px-5 rounded-full self-start active:opacity-90 shadow-sm flex-row items-center"
                                        onPress={() => router.push({ pathname: '/opportunity-detail', params: { id: featuredOpp.id } })}
                                    >
                                        <Text className="text-[#002147] font-bold text-sm mr-2">
                                            Explore Opportunity
                                        </Text>
                                        <Feather name="arrow-right" size={16} color="#002147" />
                                    </Pressable>
                                )}
                            </>
                        );
                    })()}
                </LinearGradient>
            </View>

            {/* Quick Access Cards - Product Lines */}
            <View className="mb-8">
                <View className="flex-row justify-between items-end mx-5 mb-4">
                    <Text className="text-xl font-bold text-foreground tracking-tight">
                        Centers of Excellence
                    </Text>
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20 }}
                >
                    {productLines.map((line) => (
                        <Pressable
                            key={line.id}
                            className="w-36 mr-4 rounded-2xl bg-card active:opacity-90 shadow-sm p-3 border border-border/50"
                            onPress={() => router.push({ pathname: '/center-detail', params: { name: line.name } })}
                        >
                            <View className="w-12 h-12 rounded-full bg-primary/5 justify-center items-center mb-3">
                                <Feather name={line.icon as any} size={20} color="#002147" />
                            </View>
                            <Text className="text-sm font-bold mb-1 text-foreground leading-tight" numberOfLines={2}>
                                {line.name}
                            </Text>
                            <Text className="text-muted-foreground text-xs leading-tight" numberOfLines={2}>
                                {line.description}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            {/* Explore Section */}
            <View className="mb-8 mx-5">
                <Text className="text-xl font-bold text-foreground tracking-tight mb-4">
                    Explore
                </Text>
                <View className="flex-row justify-between">
                     <Pressable
                        className="flex-1 mr-2 bg-card p-4 rounded-2xl border border-border/50 active:opacity-90 shadow-sm"
                        onPress={() => router.push('/(tabs)/verified-smmes')}
                    >
                        <View className="w-10 h-10 rounded-full bg-blue-100 justify-center items-center mb-2">
                            <Feather name="shield" size={20} color="#002147" />
                        </View>
                        <Text className="text-sm font-bold text-foreground">Verified SMMEs</Text>
                    </Pressable>
                     <Pressable
                        className="flex-1 ml-2 bg-card p-4 rounded-2xl border border-border/50 active:opacity-90 shadow-sm"
                        onPress={() => router.push('/(tabs)/vr-tours')}
                    >
                        <View className="w-10 h-10 rounded-full bg-purple-100 justify-center items-center mb-2">
                            <Feather name="globe" size={20} color="#002147" />
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
                        <Text className="text-[#FF6600] text-sm font-semibold">View All</Text>
                    </Pressable>
                </View>
                <View className="mx-5">
                    {latestOpportunities.slice(0, 3).map((opp, index) => (
                        <Pressable
                            key={opp.id}
                            className={`flex-row items-center p-4 mb-3 rounded-2xl bg-card active:opacity-95 border border-border/40 shadow-sm ${index === 2 ? 'mb-0' : ''}`}
                            onPress={() => router.push({ pathname: '/opportunity-detail', params: { id: opp.id } })}
                        >
                            <View className={`w-10 h-10 rounded-full justify-center items-center mr-3 ${opp.type === 'Funding' ? 'bg-green-100' : 'bg-blue-100'}`}>
                                <Feather 
                                    name={opp.type === 'Funding' ? 'dollar-sign' : 'briefcase'} 
                                    size={18} 
                                    color={opp.type === 'Funding' ? '#28A745' : '#002147'} 
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-sm font-bold text-foreground mb-0.5" numberOfLines={1}>{opp.title}</Text>
                                <Text className="text-muted-foreground text-xs">
                                    {opp.org} • {opp.deadline ? new Date(opp.deadline).toLocaleDateString() : 'No deadline'}
                                </Text>
                            </View>
                            <Feather name="chevron-right" size={20} color="#CBD5E0" />
                        </Pressable>
                    ))}
                </View>
            </View>

            {/* Upcoming Events */}
            <View className="mb-8">
                <View className="flex-row justify-between items-center mx-5 mb-4">
                    <Text className="text-xl font-bold text-foreground tracking-tight">Upcoming Events</Text>
                    <Pressable onPress={() => router.push('/events')}>
                        <Text className="text-[#FF6600] text-sm font-semibold">Calendar</Text>
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
                                className="w-64 p-4 mr-4 rounded-2xl bg-card active:opacity-90 shadow-sm border border-border/40"
                                onPress={() => router.push({ pathname: '/event-detail', params: { id: event.id } })}
                            >
                                <View className="flex-row justify-between items-start mb-3">
                                    <View className="bg-primary/10 px-2.5 py-1 rounded-md">
                                        <Text className="text-[#002147] text-xs font-bold">Free</Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <Feather name="calendar" size={12} color="#6C757D" className="mr-1" />
                                        <Text className="text-muted-foreground text-xs">{formattedDate}</Text>
                                    </View>
                                </View>
                                <Text className="text-base font-bold mb-2 text-foreground leading-tight" numberOfLines={2}>
                                    {event.title}
                                </Text>
                                {event.location && (
                                    <View className="flex-row items-center mt-1">
                                        <Feather name="map-pin" size={12} color="#6C757D" className="mr-1" />
                                        <Text className="text-muted-foreground text-xs" numberOfLines={1}>
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
                        <Text className="text-[#FF6600] text-sm font-semibold">View All</Text>
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
                            className="w-28 mr-4 items-center active:opacity-90"
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

            {/* Premium Upgrade Banner */}
            {profile && !isGuest && (
                <View className="mx-5 mb-8 rounded-2xl overflow-hidden shadow-sm">
                    <LinearGradient
                         colors={['#FF6600', '#FF8533']}
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
                            <Text className="text-[#FF6600] text-xs font-bold uppercase tracking-wide">
                                Upgrade Now
                            </Text>
                        </Pressable>
                    </LinearGradient>
                </View>
            )}

            {/* Welcome message for guest users */}
            {!isLoggedIn ? (
                <View className="mx-5 mb-8 p-5 rounded-3xl bg-muted/30 border border-border/50">
                    <Text className="text-lg font-bold mb-2 text-[#002147]">
                        Welcome to ELIDZ-STP! 👋
                    </Text>
                    <Text className="text-muted-foreground text-sm mb-4 leading-relaxed">
                        Create an account to unlock premium features like direct messaging and priority listings.
                    </Text>
                    <Button
                        className="bg-[#002147] py-3 px-5 rounded-full self-start active:opacity-90 shadow-sm"
                        onPress={() => router.push('/(auth)/signup')}
                    >
                        <Text className="text-white text-sm font-bold">
                            Sign Up Free
                        </Text>
                    </Button>
                </View>
            ) : null}
        </ScreenScrollView>
    );
}

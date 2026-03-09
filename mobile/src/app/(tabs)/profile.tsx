import React, { useState, useEffect, useCallback } from 'react';
import { View, Pressable, ScrollView, Alert, Linking, Image } from 'react-native';
import { Text } from '@/components/ui/text';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthContext } from '@/hooks/use-auth-context';
import { TabsLayoutHeader } from '@/components/Header';
import { verificationService } from '@/services/verification.service';
import type { SMMEVerification } from '@/services/verification.service';
import { smmmeService, SMMEServiceProduct } from '@/services/smme.service';
import { useColorScheme } from '@/hooks/use-theme-color';
import { COLORS } from '@/theme/colors';
import { useAvatarUri } from '@/hooks/use-avatar-uri';

interface MenuItemProps {
    icon: string;
    title: string;
    subtitle: string;
    onPress: () => void;
    isDestructive?: boolean;
    disabled?: boolean;
    premium?: boolean;
    colors: any;
}

const ProfileMenuItem = React.memo(
    ({ icon, title, subtitle, onPress, isDestructive = false, disabled = false, premium = false, colors }: MenuItemProps) => (
        <Pressable
            onPress={disabled ? undefined : onPress}
            className={`flex-row items-center py-4 border-b border-border active:opacity-70 ${disabled ? 'opacity-50' : ''}`}
        >
            <View
                className={`w-10 h-10 rounded-full justify-center items-center mr-4 ${
                    isDestructive ? 'bg-destructive/10' : 'bg-accent/10'
                }`}
            >
                <Feather name={icon as any} size={20} color={isDestructive ? colors.destructive : colors.accent} />
            </View>
            <View className="flex-1">
                <View className="flex-row items-center">
                    <Text className={`text-base font-semibold ${isDestructive ? 'text-destructive' : 'text-foreground'}`}>
                        {title}
                    </Text>
                    {premium && (
                        <View className="ml-2 px-2 py-0.5 bg-accent/10 rounded-md">
                            <Text className="text-accent text-[10px] font-bold uppercase">PRO</Text>
                        </View>
                    )}
                </View>
                {subtitle && <Text className="text-muted-foreground text-xs mt-0.5">{subtitle}</Text>}
            </View>
            <Feather name="chevron-right" size={20} color={colors.text} />
        </Pressable>
    )
);

ProfileMenuItem.displayName = 'ProfileMenuItem';

function ProfileScreen() {
    const { profile, isLoggedIn, isLoading, logout } = useAuthContext();
    const { colorScheme } = useColorScheme();
    const colors = COLORS[colorScheme];
    const { uri: avatarUri } = useAvatarUri(profile?.avatar);
    const [verificationStatus, setVerificationStatus] = useState<SMMEVerification | null>(null);
    const [loadingVerification, setLoadingVerification] = useState(false);

    const [allVerifications, setAllVerifications] = useState<SMMEVerification[]>([]);
    const [servicesProducts, setServicesProducts] = useState<{ services: SMMEServiceProduct[]; products: SMMEServiceProduct[] }>({ services: [], products: [] });
    const [loadingServicesProducts, setLoadingServicesProducts] = useState(false);

    // Load verification status for SMME users
    useEffect(() => {
        if (isLoggedIn && profile?.id && profile?.role === 'SMME') {
            loadVerificationStatus();
            loadServicesProducts();
        }
    }, [isLoggedIn, profile?.id, profile?.role]);

    const loadServicesProducts = async () => {
        if (!profile?.id) return;
        setLoadingServicesProducts(true);
        try {
            const data = await smmmeService.getServicesProductsBySMME(profile.id);
            setServicesProducts(data);
        } catch (error) {
            console.error('Error loading services/products:', error);
        } finally {
            setLoadingServicesProducts(false);
        }
    };

    const loadVerificationStatus = async () => {
        if (!profile?.id) return;
        setLoadingVerification(true);
        try {
            const status = await verificationService.getVerificationStatus(profile.id);
            setVerificationStatus(status);
            
            // Load all documents
            const allDocs = await verificationService.getAllVerifications(profile.id);
            setAllVerifications(allDocs);
        } catch (error) {
            console.error('Error loading verification status:', error);
        } finally {
            setLoadingVerification(false);
        }
    };

    // Only count documents that have a valid storage URL (actually uploaded), not placeholders
    const isValidStorageUrl = (url: string | undefined) => {
        const u = url?.trim?.() ?? '';
        return u.length > 0 && (u.includes('verification-documents') || u.includes('/storage/'));
    };

    const requiredTypes = ['Business Registration', 'ID Document', 'Business Profile'];
    const requiredDocsWithValidUrl = allVerifications.filter(
        doc => requiredTypes.includes(doc.document_type) && isValidStorageUrl(doc.document_url)
    );

    // Only show "pending" / "under review" when user has actually uploaded all 3 documents
    const effectiveStatus = ((): string | undefined => {
        if (requiredDocsWithValidUrl.length < 3) {
            return requiredDocsWithValidUrl.length === 0 ? 'not_submitted' : 'incomplete';
        }
        return verificationStatus?.status;
    })();

    const getDocumentCount = () => requiredDocsWithValidUrl.length;

    const getVerificationStatusColor = (status?: string) => {
        switch (status) {
            case 'verified':
                return colors.constructive;
            case 'rejected':
                return colors.destructive;
            case 'pending':
                return colors.accent;
            case 'incomplete':
                return colors.accent;
            case 'not_submitted':
            default:
                return colors.textSecondary;
        }
    };

    const getVerificationStatusText = (status?: string) => {
        switch (status) {
            case 'verified':
                return 'Verified';
            case 'rejected':
                return 'Rejected';
            case 'pending':
                return 'Pending Review';
            case 'incomplete':
                return requiredDocsWithValidUrl.length > 0
                    ? `${requiredDocsWithValidUrl.length} of 3 uploaded`
                    : 'Incomplete';
            case 'not_submitted':
            default:
                return 'Not Submitted';
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                        router.replace('/(auth)');
                    },
                },
            ]
        );
    };

    const handleHelpPress = async () => {
        const url = 'https://www.elidz.co.za/contact-us/';
        const supported = await Linking.canOpenURL(url);

        if (supported) {
            await Linking.openURL(url);
        } else {
            Alert.alert("Error", "Don't know how to open this URL: " + url);
        }
    };

    const renderMenuItem = useCallback(
        (
            icon: string,
            title: string,
            subtitle: string,
            onPress: () => void,
            isDestructive = false,
            disabled = false,
            premium = false
        ) => (
            <ProfileMenuItem
                icon={icon}
                title={title}
                subtitle={subtitle}
                onPress={onPress}
                isDestructive={isDestructive}
                disabled={disabled}
                premium={premium}
                colors={colors}
            />
        ),
        [colors]
    );

    return (
        <View className="flex-1 bg-background">
            <View className="bg-background">
                <TabsLayoutHeader title="Profile" variant="navy" />
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Card */}
                <View className="px-6 mb-6 pt-16">
                    <View className="bg-card p-6 rounded-3xl shadow-sm items-center relative -mt-8">
                        {/* Edit Button Absolute */}
                        {isLoggedIn && (
                            <Pressable
                                className="absolute top-4 right-4 p-2 bg-background rounded-full"
                                onPress={() => router.push('/edit-profile')}
                            >
                                <Feather name="edit-2" size={16} color={colors.accent} />
                            </Pressable>
                        )}

                        {/* Avatar */}
                        <View className="w-24 h-24 rounded-full bg-background p-1 mb-4 -mt-16 border-4 border-card shadow-sm">
                            <View className="w-full h-full rounded-full justify-center items-center overflow-hidden bg-muted">
                                {avatarUri ? (
                                    <Image 
                                        source={{ uri: avatarUri }} 
                                        style={{ width: '100%', height: '100%' }}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <Text className="text-foreground text-4xl font-bold">
                                        {profile?.name?.charAt(0).toUpperCase() || 'G'}
                                    </Text>
                                )}
                            </View>
                            {/* Premium Badge on Avatar */}
                            {profile?.isPremium && (
                                <View className="absolute bottom-0 right-0 bg-secondary w-6 h-6 rounded-full items-center justify-center border-2 border-white">
                                    <Feather name="star" size={12} color="white" />
                                </View>
                            )}
                        </View>

                        {/* Name & Role */}
                        <Text className="text-2xl font-bold text-foreground mb-1 text-center">
                            {profile?.name || 'Guest User'}
                        </Text>
                        <View className="flex-row items-center mb-2">
                            <View className="px-3 py-1 bg-accent/10 rounded-full">
                                <Text className="text-foreground text-xs font-medium">
                                    {profile?.role || 'Visitor'}
                                </Text>
                            </View>
                        </View>
                        {isLoggedIn && profile?.email && (
                            <Text className="text-muted-foreground text-sm mb-4">
                                {profile.email}
                            </Text>
                        )}

                        {/* Guest CTA inside card */}
                        {!isLoggedIn && (
                            <Pressable
                                className="w-full bg-accent py-3 rounded-xl items-center mt-2 active:opacity-90"
                                
                                onPress={() => router.push('/(auth)')}
                            >
                                <Text className="text-white font-bold text-sm">Sign Up / Login</Text>
                            </Pressable>
                        )}
                    </View>
                </View>

                {/* SMME Business: Verification + Products & Services (single entry point) */}
                {isLoggedIn && profile?.role === 'SMME' && (
                    <View className="mx-6 mb-6">
                        <View className="bg-card rounded-2xl p-5 shadow-sm border border-border">
                            <View className="flex-row items-center justify-between mb-3">
                                <View className="flex-row items-center flex-1">
                                    <View className="w-10 h-10 rounded-full bg-accent/10 items-center justify-center mr-3">
                                        <Feather name="shield" size={18} color={colors.accent} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-foreground font-bold text-base">Business Profile</Text>
                                        <Text className="text-muted-foreground text-xs mt-0.5">
                                            Verification & listings
                                        </Text>
                                    </View>
                                </View>

                                {effectiveStatus && (
                                    <View
                                        className="px-3 py-1 rounded-full"
                                        style={{ backgroundColor: `${getVerificationStatusColor(effectiveStatus)}20` }}
                                    >
                                        <Text
                                            className="text-xs font-semibold"
                                            style={{ color: getVerificationStatusColor(effectiveStatus) }}
                                        >
                                            {getVerificationStatusText(effectiveStatus)}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            <View className="flex-row items-center justify-between mb-4">
                                <Text className="text-muted-foreground text-sm">
                                    Products & Services
                                </Text>
                                <Text className="text-foreground text-sm font-semibold">
                                    {loadingServicesProducts ? 'Loading...' : `${servicesProducts.products.length + servicesProducts.services.length} item(s)`}
                                </Text>
                            </View>

                            <Pressable
                                onPress={() => router.push('/smme-verification')}
                                className="bg-accent py-3 rounded-xl items-center active:opacity-90"
                            >
                                <Text className="text-white font-bold text-sm">
                                    {effectiveStatus ? 'Manage Business Profile' : 'Upload Documents'}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                )}

                {/* SMME Progress Reports Section */}
                {isLoggedIn && profile?.role === 'SMME' && (
                    <View className="mx-6 mb-6">
                        <Pressable
                            onPress={() => router.push('/progress-reports')}
                            className="bg-card rounded-2xl p-4 shadow-sm border border-border active:opacity-95"
                        >
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center flex-1">
                                    <View className="w-10 h-10 rounded-full bg-accent/10 items-center justify-center mr-3">
                                        <Feather name="file-text" size={18} color={colors.accent} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-foreground font-bold text-sm">Progress Reports</Text>
                                        <Text className="text-muted-foreground text-xs mt-0.5">
                                            Submit funding progress reports
                                        </Text>
                                    </View>
                                </View>
                                <Feather name="chevron-right" size={20} color={colors.text} />
                            </View>
                        </Pressable>
                    </View>
                )}

                {/* (Verification + Products & Services merged above) */}

                {/* Premium Banner (disabled) */}
                {/* {!profile?.isPremium && isLoggedIn && (
                  <Pressable
                    className="mx-6 mb-6 rounded-2xl overflow-hidden shadow-sm active:opacity-95"
                    onPress={() => router.push('/(modals)/premium-upgrade')}
                  >
                    <LinearGradient
                      colors={['#F38C1E', '#FF8533']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      className="p-5 flex-row items-center"
                    >
                      <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-4" />
                      <View className="flex-1">
                        <Text className="text-white font-bold text-lg mb-0.5">Upgrade to Premium</Text>
                        <Text className="text-white/90 text-xs">Unlock exclusive features & analytics</Text>
                      </View>
                      <Feather name="chevron-right" size={24} color="white" />
                    </LinearGradient>
                  </Pressable>
                )} */}

                {/* Menu Groups */}
                <View className="px-6">
                    {/* Account Section */}
                    <View className="mb-6">
                        <Text className="text-foreground/50 text-xs font-bold uppercase tracking-wider mb-3 ml-1">
                            Account
                        </Text>
                        <View className="bg-card rounded-2xl px-4 shadow-sm">
                            {renderMenuItem('user', 'Personal Information', 'Manage your profile details', () => router.push('/edit-profile'), false, !isLoggedIn)}
                            {renderMenuItem('bell', 'Notifications', 'View admin communications', () => router.push('/(tabs)/notifications'), false, !isLoggedIn)}
                            {renderMenuItem('mail', 'My Enquiries', 'View and track your enquiries', () => router.push('/my-enquiries'), false, !isLoggedIn)}
                            {renderMenuItem('settings', 'Settings', 'Notifications, privacy & more', () => router.push('/settings'), false, !isLoggedIn)}
                            {/* Premium Features (disabled) */}
                            {/* {renderMenuItem('star', 'Premium Features', 'Manage subscription', () => router.push('/(modals)/premium-upgrade'), false, !isLoggedIn, true)} */}
                        </View>
                    </View>

                    {/* Support Section */}
                    <View className="mb-6">
                        <Text className="text-foreground/50 text-xs font-bold uppercase tracking-wider mb-3 ml-1">
                            Support
                        </Text>
                        <View className="bg-card rounded-2xl px-4 shadow-sm">
                            {renderMenuItem('help-circle', 'Help & Support', 'FAQ and contact us', handleHelpPress, false, false)}
                            {renderMenuItem('info', 'About ELIDZ-STP', 'Version 1.0.0', () => router.push('/about'), false, false)}
                        </View>
                    </View>

                    {/* Logout */}
                    {isLoggedIn && (
                        <View className="bg-card rounded-2xl px-4 shadow-sm mb-6">
                            {renderMenuItem('log-out', 'Log Out', 'Sign out of your account', handleLogout, true, false)}
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

export default ProfileScreen;
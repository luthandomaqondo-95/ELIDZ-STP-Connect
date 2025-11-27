import React, { useState, useEffect } from 'react';
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

function ProfileScreen() {
    const { profile, isLoggedIn, isLoading, logout } = useAuthContext();
    const [verificationStatus, setVerificationStatus] = useState<SMMEVerification | null>(null);
    const [loadingVerification, setLoadingVerification] = useState(false);

    console.log(' ---- profile', profile);

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

    const getDocumentCount = () => {
        const requiredTypes = ['Business Registration', 'ID Document', 'Business Profile'];
        return allVerifications.filter(doc => requiredTypes.includes(doc.document_type)).length;
    };

    const getOverallStatus = () => {
        const requiredTypes = ['Business Registration', 'ID Document', 'Business Profile'];
        const requiredDocs = allVerifications.filter(doc => requiredTypes.includes(doc.document_type));
        
        if (requiredDocs.length < 3) return 'incomplete';
        
        const allVerified = requiredDocs.every(doc => doc.status === 'verified');
        const anyRejected = requiredDocs.some(doc => doc.status === 'rejected');
        
        if (allVerified) return 'verified';
        if (anyRejected) return 'rejected';
        return 'pending';
    };

    const getVerificationStatusColor = (status?: string) => {
        switch (status) {
            case 'verified':
                return '#28A745';
            case 'rejected':
                return '#EF4444';
            case 'pending':
            default:
                return '#FFA500';
        }
    };

    const getVerificationStatusText = (status?: string) => {
        switch (status) {
            case 'verified':
                return 'Verified';
            case 'rejected':
                return 'Rejected';
            case 'pending':
            default:
                return 'Pending Review';
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

    const renderMenuItem = (icon: string, title: string, subtitle: string, onPress: () => void, isDestructive = false, disabled = false, premium = false) => (
        <Pressable
            onPress={disabled ? undefined : onPress}
            className={`flex-row items-center py-4 border-b border-border active:opacity-70 ${disabled ? 'opacity-50' : ''}`}
        >
            <View className={`w-10 h-10 rounded-full justify-center items-center mr-4 ${isDestructive ? 'bg-red-50' : 'bg-[#002147]/5'}`}>
                <Feather name={icon as any} size={20} color={isDestructive ? '#EF4444' : '#002147'} />
            </View>
            <View className="flex-1">
                <View className="flex-row items-center">
                    <Text className={`text-base font-semibold ${isDestructive ? 'text-destructive' : 'text-foreground'}`}>
                        {title}
                    </Text>
                    {premium && (
                        <View className="ml-2 px-2 py-0.5 bg-[#FF6600]/10 rounded-md">
                            <Text className="text-[#FF6600] text-[10px] font-bold uppercase">PRO</Text>
                        </View>
                    )}
                </View>
                {subtitle && <Text className="text-muted-foreground text-xs mt-0.5">{subtitle}</Text>}
            </View>
            <Feather name="chevron-right" size={20} color="#CBD5E0" />
        </Pressable>
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
                                <Feather name="edit-2" size={16} color="#002147" />
                            </Pressable>
                        )}

                        {/* Avatar */}
                        <View className="w-24 h-24 rounded-full bg-background p-1 mb-4 -mt-16 border-4 border-card shadow-sm">
                            <View className="w-full h-full rounded-full justify-center items-center overflow-hidden bg-[#002147]/5">
                                {profile?.avatar && (profile.avatar.startsWith('http://') || profile.avatar.startsWith('https://')) ? (
                                    <Image 
                                        source={{ uri: profile.avatar }} 
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
                                <View className="absolute bottom-0 right-0 bg-[#FFD700] w-6 h-6 rounded-full items-center justify-center border-2 border-white">
                                    <Feather name="star" size={12} color="white" />
                                </View>
                            )}
                        </View>

                        {/* Name & Role */}
                        <Text className="text-2xl font-bold text-foreground mb-1 text-center">
                            {profile?.name || 'Guest User'}
                        </Text>
                        <View className="flex-row items-center mb-2">
                            <View className="px-3 py-1 bg-[#002147]/5 rounded-full">
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
                                className="w-full bg-[#002147] py-3 rounded-xl items-center mt-2 active:opacity-90"
                                onPress={() => router.push('/(auth)')}
                            >
                                <Text className="text-white font-bold text-sm">Sign Up / Login</Text>
                            </Pressable>
                        )}
                    </View>
                </View>

                {/* SMME Products & Services Section */}
                {isLoggedIn && profile?.role === 'SMME' && (
                    <View className="mx-6 mb-6">
                        <View className="bg-card rounded-2xl p-4 shadow-sm border border-border">
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center flex-1">
                                    <View className="w-10 h-10 rounded-full bg-[#002147]/5 items-center justify-center mr-3">
                                        <Feather name="briefcase" size={18} color="#002147" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-foreground font-bold text-sm">Products & Services</Text>
                                        <Text className="text-muted-foreground text-xs mt-0.5">
                                            {loadingServicesProducts ? 'Loading...' : `${servicesProducts.products.length + servicesProducts.services.length} items listed`}
                                        </Text>
                                    </View>
                                </View>
                                <Pressable
                                    onPress={() => router.push('/smme-verification')}
                                    className="px-3 py-2 bg-[#002147] rounded-lg active:opacity-90 ml-2"
                                >
                                    <View className="flex-row items-center">
                                        <Feather name="edit" size={14} color="white" />
                                        <Text className="text-white font-semibold text-xs ml-1">Manage</Text>
                                    </View>
                                </Pressable>
                            </View>
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
                                        <Feather name="file-text" size={18} color="#FF6600" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-foreground font-bold text-sm">Progress Reports</Text>
                                        <Text className="text-muted-foreground text-xs mt-0.5">
                                            Submit funding progress reports
                                        </Text>
                                    </View>
                                </View>
                                <Feather name="chevron-right" size={20} color="#6C757D" />
                            </View>
                        </Pressable>
                    </View>
                )}

                {/* SMME Verification Status Banner */}
                {isLoggedIn && profile?.role === 'SMME' && (
                    <View className="mx-6 mb-6">
                        <View className="bg-card rounded-2xl p-5 shadow-sm border border-border">
                            <View className="flex-row items-center justify-between mb-3">
                                <View className="flex-row items-center">
                                    <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
                                        <Feather name="shield" size={20} color="#002147" />
                                    </View>
                                    <View>
                                        <Text className="text-foreground font-bold text-base">Business Verification</Text>
                                        <Text className="text-muted-foreground text-xs mt-0.5">
                                            {verificationStatus 
                                                ? getVerificationStatusText(verificationStatus.status)
                                                : 'Not Submitted'}
                                        </Text>
                                    </View>
                                </View>
                                {verificationStatus && (
                                    <View 
                                        className="px-3 py-1 rounded-full"
                                        style={{ backgroundColor: `${getVerificationStatusColor(verificationStatus.status)}20` }}
                                    >
                                        <Text 
                                            className="text-xs font-semibold"
                                            style={{ color: getVerificationStatusColor(verificationStatus.status) }}
                                        >
                                            {getVerificationStatusText(verificationStatus.status)}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            
                            {verificationStatus?.status === 'rejected' && verificationStatus.rejection_reason && (
                                <View className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 mb-3">
                                    <Text className="text-destructive text-xs font-medium mb-1">Rejection Reason:</Text>
                                    <Text className="text-destructive/90 text-xs">{verificationStatus.rejection_reason}</Text>
                                </View>
                            )}

                            {verificationStatus?.status === 'pending' && (
                                <View className="bg-warning/10 border border-warning/30 rounded-lg p-3 mb-3">
                                    <Text className="text-warning text-xs">
                                        Your documents are under review. This process usually takes 24-48 hours.
                                    </Text>
                                </View>
                            )}

                            {verificationStatus?.status === 'verified' && (
                                <View className="bg-constructive/10 border border-constructive/30 rounded-lg p-3 mb-3">
                                    <Text className="text-constructive text-xs">
                                        Your business has been verified! You now have access to exclusive SMME benefits.
                                    </Text>
                                </View>
                            )}

                            <Pressable
                                onPress={() => router.push('/smme-verification')}
                                className="bg-[#002147] py-3 rounded-xl items-center active:opacity-90"
                            >
                                <Text className="text-white font-bold text-sm">
                                    {verificationStatus ? 'Update Documents' : 'Upload Documents'}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                )}

                {/* Premium Banner */}
                {!profile?.isPremium && isLoggedIn && (
                    <Pressable
                        className="mx-6 mb-6 rounded-2xl overflow-hidden shadow-sm active:opacity-95"
                        onPress={() => router.push('/(modals)/premium-upgrade')}
                    >
                        <LinearGradient
                            colors={['#FF6600', '#FF8533']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="p-5 flex-row items-center"
                        >
                            <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-4">
                                {/* <Feather name="crown" size={20} color="white" /> */}
                            </View>
                            <View className="flex-1">
                                <Text className="text-white font-bold text-lg mb-0.5">Upgrade to Premium</Text>
                                <Text className="text-white/90 text-xs">Unlock exclusive features & analytics</Text>
                            </View>
                            <Feather name="chevron-right" size={24} color="white" />
                        </LinearGradient>
                    </Pressable>
                )}

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
                            {renderMenuItem('settings', 'Settings', 'Notifications, privacy & more', () => router.push('/settings'), false, !isLoggedIn)}
                            {renderMenuItem('star', 'Premium Features', 'Manage subscription', () => router.push('/(modals)/premium-upgrade'), false, !isLoggedIn, true)}
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
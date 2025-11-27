import React, { useState, useEffect } from 'react';
import { View, Pressable, ScrollView, Alert, Linking } from 'react-native';
import { Text } from '@/components/ui/text';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthContext } from '@/hooks/use-auth-context';
import { HeaderAvatar } from '@/components/HeaderAvatar';
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
                        // router.replace('/(auth)');
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
            className={`flex-row items-center py-4 border-b border-gray-100 active:opacity-70 ${disabled ? 'opacity-50' : ''}`}
        >
            <View className={`w-10 h-10 rounded-full justify-center items-center mr-4 ${isDestructive ? 'bg-red-50' : 'bg-[#002147]/5'}`}>
                <Feather name={icon as any} size={20} color={isDestructive ? '#EF4444' : '#002147'} />
            </View>
            <View className="flex-1">
                <View className="flex-row items-center">
                    <Text className={`text-base font-semibold ${isDestructive ? 'text-red-600' : 'text-[#002147]'}`}>
                        {title}
                    </Text>
                    {premium && (
                        <View className="ml-2 px-2 py-0.5 bg-[#FF6600]/10 rounded-md">
                            <Text className="text-[#FF6600] text-[10px] font-bold uppercase">PRO</Text>
                        </View>
                    )}
                </View>
                {subtitle && <Text className="text-gray-400 text-xs mt-0.5">{subtitle}</Text>}
            </View>
            <Feather name="chevron-right" size={20} color="#CBD5E0" />
        </Pressable>
    );

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header Background */}
            <View className="h-64 w-full absolute top-0 left-0 z-0">
                <LinearGradient
                    colors={['#002147', '#003366']}
                    className="w-full h-full"
                />
                {/* Decorative circles */}
                <View className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5" />
                <View className="absolute top-10 -left-10 w-32 h-32 rounded-full bg-white/5" />
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Card */}
                <View className="pt-28 px-6 mb-6">
                    <View className="bg-white p-6 rounded-3xl shadow-sm items-center relative">
                        {/* Edit Button Absolute */}
                        {isLoggedIn && (
                            <Pressable
                                className="absolute top-4 right-4 p-2 bg-gray-50 rounded-full"
                                onPress={() => router.push('/edit-profile')}
                            >
                                <Feather name="edit-2" size={16} color="#002147" />
                            </Pressable>
                        )}

                        {/* Avatar */}
                        <View className="w-24 h-24 rounded-full bg-gray-50 p-1 mb-4 -mt-16 border-4 border-white shadow-sm">
                            <View className="w-full h-full rounded-full justify-center items-center overflow-hidden">
                                {/* Placeholder for user image or initial */}
                                <HeaderAvatar className="w-full h-full" />
                            </View>
                            {/* Premium Badge on Avatar */}
                            {profile?.isPremium && (
                                <View className="absolute bottom-0 right-0 bg-[#FFD700] w-6 h-6 rounded-full items-center justify-center border-2 border-white">
                                    <Feather name="star" size={12} color="white" />
                                </View>
                            )}
                        </View>

                        {/* Name & Role */}
                        <Text className="text-2xl font-bold text-[#002147] mb-1 text-center">
                            {profile?.name || 'Guest User'}
                        </Text>
                        <View className="flex-row items-center mb-2">
                            <View className="px-3 py-1 bg-[#002147]/5 rounded-full">
                                <Text className="text-[#002147] text-xs font-medium">
                                    {profile?.role || 'Visitor'}
                                </Text>
                            </View>
                        </View>
                        {isLoggedIn && profile?.email && (
                            <Text className="text-gray-400 text-sm mb-4">
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
                        <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                            <View className="flex-row items-center justify-between mb-4">
                                <View className="flex-row items-center">
                                    <View className="w-10 h-10 rounded-full bg-[#002147]/5 items-center justify-center mr-3">
                                        <Feather name="briefcase" size={20} color="#002147" />
                                    </View>
                                    <View>
                                        <Text className="text-[#002147] font-bold text-base">Products & Services</Text>
                                        <Text className="text-gray-500 text-xs mt-0.5">
                                            {servicesProducts.products.length + servicesProducts.services.length} items listed
                                        </Text>
                                    </View>
                                </View>
                                <Pressable
                                    onPress={() => router.push('/smme-verification')}
                                    className="px-4 py-2 bg-[#002147] rounded-lg active:opacity-90"
                                >
                                    <View className="flex-row items-center">
                                        <Feather name="edit" size={16} color="white" />
                                        <Text className="text-white font-semibold text-sm ml-1">Manage</Text>
                                    </View>
                                </Pressable>
                            </View>

                            {loadingServicesProducts ? (
                                <Text className="text-gray-400 text-sm text-center py-4">Loading...</Text>
                            ) : servicesProducts.products.length === 0 && servicesProducts.services.length === 0 ? (
                                <View className="items-center py-6">
                                    <Feather name="package" size={32} color="#CBD5E0" />
                                    <Text className="text-gray-400 text-sm mt-2 text-center">
                                        No products or services listed yet
                                    </Text>
                                    <Text className="text-gray-400 text-xs mt-1 text-center">
                                        Add your offerings to appear in the verified SMMEs directory
                                    </Text>
                                </View>
                            ) : (
                                <View>
                                    {servicesProducts.products.length > 0 && (
                                        <View className="mb-4">
                                            <Text className="text-gray-600 text-xs font-semibold mb-2 uppercase tracking-wide">
                                                Products ({servicesProducts.products.length})
                                            </Text>
                                            {servicesProducts.products.slice(0, 3).map((product) => (
                                                <View key={product.id} className="bg-gray-50 rounded-lg p-3 mb-2 border border-gray-100">
                                                    <Text className="text-[#002147] font-semibold text-sm">{product.name}</Text>
                                                    <Text className="text-gray-500 text-xs mt-1" numberOfLines={1}>{product.description}</Text>
                                                    {product.price && (
                                                        <Text className="text-[#FF6600] text-xs font-bold mt-1">{product.price}</Text>
                                                    )}
                                                </View>
                                            ))}
                                            {servicesProducts.products.length > 3 && (
                                                <Text className="text-gray-400 text-xs text-center mt-1">
                                                    +{servicesProducts.products.length - 3} more products
                                                </Text>
                                            )}
                                        </View>
                                    )}

                                    {servicesProducts.services.length > 0 && (
                                        <View>
                                            <Text className="text-gray-600 text-xs font-semibold mb-2 uppercase tracking-wide">
                                                Services ({servicesProducts.services.length})
                                            </Text>
                                            {servicesProducts.services.slice(0, 3).map((service) => (
                                                <View key={service.id} className="bg-gray-50 rounded-lg p-3 mb-2 border border-gray-100">
                                                    <Text className="text-[#002147] font-semibold text-sm">{service.name}</Text>
                                                    <Text className="text-gray-500 text-xs mt-1" numberOfLines={1}>{service.description}</Text>
                                                </View>
                                            ))}
                                            {servicesProducts.services.length > 3 && (
                                                <Text className="text-gray-400 text-xs text-center mt-1">
                                                    +{servicesProducts.services.length - 3} more services
                                                </Text>
                                            )}
                                        </View>
                                    )}

                                    <Pressable
                                        onPress={() => router.push('/smme-verification')}
                                        className="mt-4 py-2 border border-[#002147] rounded-lg active:opacity-90"
                                    >
                                        <Text className="text-[#002147] font-semibold text-sm text-center">
                                            Manage All Products & Services
                                        </Text>
                                    </Pressable>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* SMME Verification Status Banner */}
                {isLoggedIn && profile?.role === 'SMME' && (
                    <View className="mx-6 mb-6">
                        <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                            <View className="flex-row items-center justify-between mb-3">
                                <View className="flex-row items-center">
                                    <View className="w-10 h-10 rounded-full bg-[#002147]/5 items-center justify-center mr-3">
                                        <Feather name="shield" size={20} color="#002147" />
                                    </View>
                                    <View>
                                        <Text className="text-[#002147] font-bold text-base">Business Verification</Text>
                                        <Text className="text-gray-500 text-xs mt-0.5">
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
                                <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                                    <Text className="text-red-700 text-xs font-medium mb-1">Rejection Reason:</Text>
                                    <Text className="text-red-600 text-xs">{verificationStatus.rejection_reason}</Text>
                                </View>
                            )}

                            {verificationStatus?.status === 'pending' && (
                                <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                                    <Text className="text-yellow-800 text-xs">
                                        Your documents are under review. This process usually takes 24-48 hours.
                                    </Text>
                                </View>
                            )}

                            {verificationStatus?.status === 'verified' && (
                                <View className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                                    <Text className="text-green-800 text-xs">
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
                        <Text className="text-[#002147] text-xs font-bold uppercase tracking-wider mb-3 ml-1 opacity-50">
                            Account
                        </Text>
                        <View className="bg-white rounded-2xl px-4 shadow-sm">
                            {renderMenuItem('user', 'Personal Information', 'Manage your profile details', () => router.push('/edit-profile'), false, isLoggedIn)}
                            {renderMenuItem('settings', 'Settings', 'Notifications, privacy & more', () => router.push('/settings'), false, false)}
                            {renderMenuItem('star', 'Premium Features', 'Manage subscription', () => router.push('/(modals)/premium-upgrade'), false, isLoggedIn, true)}
                        </View>
                    </View>

                    {/* Support Section */}
                    <View className="mb-6">
                        <Text className="text-[#002147] text-xs font-bold uppercase tracking-wider mb-3 ml-1 opacity-50">
                            Support
                        </Text>
                        <View className="bg-white rounded-2xl px-4 shadow-sm">
                            {renderMenuItem('help-circle', 'Help & Support', 'FAQ and contact us', handleHelpPress, false, false)}
                            {renderMenuItem('info', 'About ELIDZ-STP', 'Version 1.0.0', () => router.push('/about'), false, false)}
                        </View>
                    </View>

                    {/* Logout */}
                    {isLoggedIn && (
                        <View className="bg-white rounded-2xl px-4 shadow-sm mb-6">
                            {renderMenuItem('log-out', 'Log Out', 'Sign out of your account', handleLogout, true, false)}
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

export default ProfileScreen;
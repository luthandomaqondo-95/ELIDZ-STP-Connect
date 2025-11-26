import React from 'react';
import { View, Pressable, ScrollView, Alert, Linking } from 'react-native';
import { Text } from '@/components/ui/text';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthContext } from '@/hooks/use-auth-context';
import { withAuthGuard } from '@/components/withAuthGuard';
import { HeaderAvatar } from '@/components/HeaderAvatar';

function ProfileScreen() {
    const { profile, isLoggedIn, isLoading, logout } = useAuthContext();

    console.log(' ---- profile', profile);

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

export default withAuthGuard(ProfileScreen);
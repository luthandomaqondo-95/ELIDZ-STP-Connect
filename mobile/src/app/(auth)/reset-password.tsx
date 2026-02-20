import React, { useState, useEffect, useCallback } from 'react';
import { View, Pressable, Alert, Linking, Dimensions, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ScreenKeyboardAwareScrollView } from '@/components/ScreenKeyboardAwareScrollView';
import { Ionicons } from '@expo/vector-icons';
import { Stars } from '@/components/Stars';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useColorScheme } from '@/hooks/use-theme-color';
import { COLORS } from '@/theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { validatePassword, validateConfirmPassword } from '@/utils/validation';
import { authBack } from '@/utils/navigation';
import { PasswordField } from '@/components/PasswordField';

const { height } = Dimensions.get('window');

function getAuthParamsFromUrl(url: string): {
    access_token?: string;
    refresh_token?: string;
    code?: string;
    token_hash?: string;
    type?: string;
} {
    // Avoid relying on `new URL()` which can be unreliable across runtimes and deep-link formats.
    try {
        const [baseAndQuery, hashRaw = ''] = url.split('#');
        const queryRaw = baseAndQuery.includes('?') ? baseAndQuery.split('?').slice(1).join('?') : '';
        const hash = hashRaw.startsWith('?') ? hashRaw.slice(1) : hashRaw;

        const hashParams = new URLSearchParams(hash);
        const searchParams = new URLSearchParams(queryRaw);
        const get = (key: string) => hashParams.get(key) ?? searchParams.get(key) ?? undefined;

        return {
            access_token: get('access_token'),
            refresh_token: get('refresh_token'),
            code: get('code'),
            token_hash: get('token_hash'),
            type: get('type'),
        };
    } catch {
        return {};
    }
}

export default function ResetPasswordScreen() {
    const { colorScheme } = useColorScheme();
    const colors = COLORS[colorScheme];
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSettingSession, setIsSettingSession] = useState(true);
    const [canReset, setCanReset] = useState(false);

    const trySetSessionFromUrl = useCallback(async (url: string | null) => {
        try {
            if (!url) {
                const { data: { session } } = await supabase.auth.getSession();
                setCanReset(!!session);
                setIsSettingSession(false);
                return;
            }
            const { access_token, refresh_token, code, token_hash, type } = getAuthParamsFromUrl(url);
            if (access_token && refresh_token) {
                const { error } = await supabase.auth.setSession({
                    access_token,
                    refresh_token,
                });
                if (!error) setCanReset(true);
            } else if (code) {
                const { error } = await supabase.auth.exchangeCodeForSession(code);
                if (!error) setCanReset(true);
            } else if (token_hash && type === 'recovery') {
                const { error } = await supabase.auth.verifyOtp({
                    type: 'recovery',
                    token_hash,
                });
                if (!error) setCanReset(true);
            } else {
                const { data: { session } } = await supabase.auth.getSession();
                setCanReset(!!session);
            }
        } finally {
            setIsSettingSession(false);
        }
    }, []);

    useEffect(() => {
        Linking.getInitialURL().then(trySetSessionFromUrl);
        const sub = Linking.addEventListener('url', ({ url }) => trySetSessionFromUrl(url));
        return () => sub.remove();
    }, [trySetSessionFromUrl]);

    const handleResetPassword = async () => {
        const pwdCheck = validatePassword(newPassword, { minLength: 6 });
        if (!pwdCheck.valid) {
            Alert.alert('Error', pwdCheck.message ?? 'Please enter a new password');
            return;
        }
        const confirmCheck = validateConfirmPassword(newPassword.trim(), confirmPassword.trim());
        if (!confirmCheck.valid) {
            Alert.alert('Error', confirmCheck.message ?? 'Passwords do not match');
            return;
        }
        const trimmed = newPassword.trim();

        setIsLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: trimmed });
            if (error) throw error;
            await supabase.auth.signOut();
            Alert.alert('Success', 'Your password has been updated. You can now sign in.', [
                { text: 'OK', onPress: () => router.replace('/(auth)') },
            ]);
        } catch (err: any) {
            Alert.alert('Error', err?.message ?? 'Failed to update password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToLogin = authBack;

    if (isSettingSession) {
        return (
            <View className="flex-1 bg-background justify-center items-center">
                <Text className="text-muted-foreground">Loading…</Text>
            </View>
        );
    }

    if (!canReset) {
        return (
            <View className="flex-1 bg-background justify-center items-center px-6">
                <Text className="text-center text-muted-foreground mb-4">
                    Invalid or expired reset link. Please request a new one from the Forgot Password screen.
                </Text>
                <Button onPress={handleBackToLogin} className="rounded-full">
                    <Text className="text-white font-semibold">Back to Login</Text>
                </Button>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-background">
            <LinearGradient
                colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
                className="absolute inset-0"
                style={{ height: height * 0.4 }}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
            />
            <Stars />
            <SafeAreaView className="flex-1" edges={['top']}>
                <View className="px-6 pt-2 rounded-3xl" style={{ height: height * 0.24 }}>
                    <TouchableOpacity
                        className="w-10 h-10 rounded-full flex-row justify-center items-center mt-2"
                        onPress={handleBackToLogin}
                    >
                        <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
                        <Text className="text-white text-sm ml-1">Back</Text>
                    </TouchableOpacity>
                    <View className="items-center mt-2">
                        <Image
                            source={require('../../../assets/logos/blue text-idz logo.png')}
                            style={{ width: 240, height: 100 }}
                            resizeMode="contain"
                        />
                        <Text className="text-white text-3xl font-bold mt-4 mb-2">Reset Password</Text>
                        <Text className="text-white/80 text-base text-center px-4">Enter your new password below.</Text>
                    </View>
                </View>

                <ScreenKeyboardAwareScrollView contentContainerClassName="flex-grow rounded-3xl" style={{ zIndex: 2 }}>
                    <View className="flex-1 px-6 pb-10 pt-6 rounded-3xl bg-background mt-4">
                    <PasswordField
                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholder="New password (min 6 characters)"
                        accentColor={colors.accent}
                        placeholderColor={colors.placeholder}
                        editable={!isLoading}
                        autoComplete="password-new"
                        containerClassName="flex-row items-center bg-input rounded-full mb-4 px-4 h-14 border border-border"
                    />
                    <PasswordField
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Confirm new password"
                        accentColor={colors.accent}
                        placeholderColor={colors.placeholder}
                        editable={!isLoading}
                        autoComplete="password-new"
                        containerClassName="flex-row items-center bg-input rounded-full mb-6 px-4 h-14 border border-border"
                    />

                    <Button
                        className="h-14 rounded-full bg-accent justify-center items-center mb-4"
                        onPress={handleResetPassword}
                        disabled={isLoading}
                    >
                        <Text className="text-lg font-bold text-white">{isLoading ? 'Updating…' : 'Reset Password'}</Text>
                    </Button>

                    <View className="flex-row justify-center mt-2">
                        <Text className="text-muted-foreground">Remember your password? </Text>
                        <Pressable onPress={handleBackToLogin}>
                            <Text className="text-accent font-bold">Log In</Text>
                        </Pressable>
                    </View>
                    </View>
                </ScreenKeyboardAwareScrollView>
            </SafeAreaView>
        </View>
    );
}

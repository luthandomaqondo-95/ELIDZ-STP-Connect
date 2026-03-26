import React, { useState, useEffect, useCallback } from 'react';
import { View, Pressable, Alert, Linking, Dimensions, TouchableOpacity, Image, Platform } from 'react-native';
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
import { validatePassword, validateConfirmPassword, MIN_PASSWORD_LENGTH } from '@/utils/validation';
import { authBack } from '@/utils/navigation';
import { PasswordField } from '@/components/PasswordField';
import { useAuthContext } from '@/hooks/use-auth-context';

const { height } = Dimensions.get('window');

function getAuthParamsFromUrl(url: string): {
    access_token?: string;
    refresh_token?: string;
    code?: string;
    token_hash?: string;
    type?: string;
} {
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

export default function ChangePasswordScreen() {
    const { colorScheme } = useColorScheme();
    const colors = COLORS[colorScheme];
    const { session } = useAuthContext();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
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
        // Opened from Settings while logged in: skip link parsing and allow immediate reset.
        if (session?.user) {
            setCanReset(true);
            setIsSettingSession(false);
            return;
        }

        Linking.getInitialURL().then((url) => {
            if (url) {
                trySetSessionFromUrl(url);
            } else if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.href) {
                trySetSessionFromUrl(window.location.href);
            } else {
                trySetSessionFromUrl(null);
            }
        });
        const sub = Linking.addEventListener('url', ({ url }) => trySetSessionFromUrl(url));
        return () => sub.remove();
    }, [session?.user, trySetSessionFromUrl]);

    const handleChangePassword = async () => {
        const withTimeout = async <T,>(promise: Promise<T>, ms: number, message: string): Promise<T> => {
            const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => reject(new Error(message)), ms);
            });
            return Promise.race([promise, timeoutPromise]);
        };

        setError(null);
        const pwdCheck = validatePassword(newPassword, { minLength: MIN_PASSWORD_LENGTH });
        if (!pwdCheck.valid) {
            setError(pwdCheck.message ?? `Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
            return;
        }
        const confirmCheck = validateConfirmPassword(newPassword.trim(), confirmPassword.trim());
        if (!confirmCheck.valid) {
            setError(confirmCheck.message ?? 'Passwords do not match');
            return;
        }
        const trimmed = newPassword.trim();

        setIsLoading(true);
        try {
            const { error: updateError } = await withTimeout(
                supabase.auth.updateUser({ password: trimmed }),
                15000,
                'Request timed out. Please try again.'
            );
            if (updateError) throw updateError;
            // Local sign-out is enough here and avoids unnecessary network delay.
            await supabase.auth.signOut({ scope: 'local' });
            Alert.alert(
                'Password Changed',
                'Your password has been successfully updated. You can now sign in with your new password.',
                [{ text: 'OK', onPress: () => router.replace('/(auth)') }]
            );
        } catch (err: any) {
            setError(err?.message ?? 'Failed to change password. Please try again.');
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
                <Button onPress={handleBackToLogin} className="min-h-[56px] rounded-full px-6 py-3.5">
                    <Text className="text-base leading-6 text-white font-semibold text-center">Back to Login</Text>
                </Button>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-background">
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
                <LinearGradient
                    colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.4 }}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                />
                <Stars />
            </View>
            <SafeAreaView className="flex-1" edges={['top']} style={{ zIndex: 1, position: 'relative' }}>
                <View className="px-6 pt-2 rounded-3xl" style={{ height: height * 0.24, zIndex: 1 }}>
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
                        <Text className="text-white text-3xl font-bold mt-4 mb-2">Change Password</Text>
                        <Text className="text-white/80 text-base text-center px-4">Enter your new password below.</Text>
                    </View>
                </View>

                <ScreenKeyboardAwareScrollView contentContainerClassName="flex-grow rounded-3xl" contentContainerStyle={{ flexGrow: 1 }} style={{ flex: 1, zIndex: 2 }}>
                    <View className="flex-1 px-6 pb-10 pt-6 rounded-3xl mt-4" style={{ backgroundColor: colors.background }}>
                    <View className="mb-4">
                        <PasswordField
                            value={newPassword}
                            onChangeText={(t) => { setNewPassword(t); setError(null); }}
                            placeholder={`New password (min ${MIN_PASSWORD_LENGTH} characters)`}
                            accentColor={colors.accent}
                            placeholderColor={colors.placeholder}
                            editable={!isLoading}
                            autoComplete="password-new"
                            containerClassName="flex-row items-center bg-input rounded-full px-4 h-14 border border-border"
                        />
                    </View>
                    <View className="mb-6">
                        <PasswordField
                            value={confirmPassword}
                            onChangeText={(t) => { setConfirmPassword(t); setError(null); }}
                            placeholder="Confirm new password"
                            accentColor={colors.accent}
                            placeholderColor={colors.placeholder}
                            editable={!isLoading}
                            autoComplete="password-new"
                            containerClassName="flex-row items-center bg-input rounded-full px-4 h-14 border border-border"
                        />
                        {error && (
                            <View className="mt-2 rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3">
                                <Text className="text-destructive text-sm">{error}</Text>
                            </View>
                        )}
                    </View>

                    <Button
                        className="min-h-[56px] rounded-full bg-accent justify-center items-center mb-4 px-6 py-3.5"
                        onPress={handleChangePassword}
                        disabled={isLoading}
                    >
                        <Text className="text-base leading-6 font-bold text-white text-center">
                            {isLoading ? 'Updating…' : 'Change Password'}
                        </Text>
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

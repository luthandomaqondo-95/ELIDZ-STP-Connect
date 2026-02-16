import React, { useState, useEffect, useCallback } from 'react';
import { View, TextInput, Pressable, Alert, Linking, Dimensions, TouchableOpacity, Image } from 'react-native';
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

const { height } = Dimensions.get('window');

function getAuthParamsFromUrl(url: string): {
    access_token?: string;
    refresh_token?: string;
    code?: string;
    token_hash?: string;
    type?: string;
} {
    try {
        const parsed = new URL(url);
        const hashParams = new URLSearchParams(parsed.hash.replace(/^#/, ''));
        const searchParams = new URLSearchParams(parsed.search);
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
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        const trimmed = newPassword.trim();
        if (!trimmed) {
            Alert.alert('Error', 'Please enter a new password');
            return;
        }
        if (trimmed.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }
        if (trimmed !== confirmPassword.trim()) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

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

    const handleBackToLogin = () => {
        if (router.canDismiss()) router.dismiss();
        else router.replace('/(auth)');
    };

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
                colors={['#0a1628', '#122a4d', '#1a3a5c']}
                className="absolute inset-0"
                style={{ height: height * 0.35 }}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
            />
            <Stars />
            <View className="px-4 pt-1" style={{ height: height * 0.22 }}>
                <TouchableOpacity className="flex-row items-center mt-10 w-20" onPress={handleBackToLogin}>
                    <Ionicons name="chevron-back" size={24} color={colors.white} />
                    <Text className="text-white text-sm">Back</Text>
                </TouchableOpacity>
                <View className="items-center mt-4">
                    <Text className="text-2xl font-bold text-white mb-2">Reset Password</Text>
                    <Text className="text-center text-white/80 px-4">Enter your new password below.</Text>
                    <Image
                        source={require('../../../assets/logos/blue text-idz logo.png')}
                        style={{ width: 260, height: 110, marginTop: 12 }}
                        resizeMode="contain"
                    />
                </View>
            </View>

            <ScreenKeyboardAwareScrollView contentContainerClassName="flex-grow mt-4 rounded-3xl" style={{ zIndex: 2 }}>
                <View className="flex-1 px-6 pb-10 pt-6 rounded-3xl bg-background" style={{ marginTop: 24, paddingTop: 40 }}>
                    <View className="flex-row items-center bg-input rounded-full mb-4 px-4 h-14 border border-border">
                        <Ionicons name="lock-closed-outline" size={20} color={colors.accent} style={{ marginRight: 12 }} />
                        <TextInput
                            className="flex-1 text-base text-foreground h-full"
                            value={newPassword}
                            onChangeText={setNewPassword}
                            placeholder="New password (min 6 characters)"
                            placeholderTextColor={colors.placeholder}
                            secureTextEntry={!showNewPassword}
                            autoCapitalize="none"
                            autoComplete="password-new"
                            editable={!isLoading}
                        />
                        <Pressable onPress={() => setShowNewPassword((p) => !p)} className="p-1">
                            <Ionicons name={showNewPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.accent} />
                        </Pressable>
                    </View>

                    <View className="flex-row items-center bg-input rounded-full mb-6 px-4 h-14 border border-border">
                        <Ionicons name="lock-closed-outline" size={20} color={colors.accent} style={{ marginRight: 12 }} />
                        <TextInput
                            className="flex-1 text-base text-foreground h-full"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Confirm new password"
                            placeholderTextColor={colors.placeholder}
                            secureTextEntry={!showConfirmPassword}
                            autoCapitalize="none"
                            autoComplete="password-new"
                            editable={!isLoading}
                        />
                        <Pressable onPress={() => setShowConfirmPassword((p) => !p)} className="p-1">
                            <Ionicons name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.accent} />
                        </Pressable>
                    </View>

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
        </View>
    );
}

import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Pressable, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ScreenKeyboardAwareScrollView } from '@/components/ScreenKeyboardAwareScrollView';
import { useAuthContext } from '@/hooks/use-auth-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/button';
import { Stars } from '@/components/Stars';
import { verificationService } from '@/services/verification.service';
import { useColorScheme } from '@/hooks/use-theme-color';
import { COLORS } from '@/theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { validateEmail } from '@/utils/validation';
import { PasswordField } from '@/components/PasswordField';
import { TermsAndPrivacyNotice } from '@/components/TermsAndPrivacyNotice';
import { ErrorAlert } from '@/components/Error';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';

export default function LoginScreen() {
    const { login, signInWithGoogle, signInWithApple, resendSignupConfirmation, profile } = useAuthContext();
    const { colorScheme } = useColorScheme();
    const colors = COLORS[colorScheme ?? 'light'];
    const params = useLocalSearchParams<{ signupSuccess?: string; email?: string }>();
    const { isLoading, error, errorTitle, execute, clearError, setError } = useAsyncOperation();
    const [email, setEmail] = useState(params.email ?? '');
    const [password, setPassword] = useState('');
    const [cooldownSeconds, setCooldownSeconds] = useState(0);
    const [hasCheckedVerification, setHasCheckedVerification] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [showVerificationAlert, setShowVerificationAlert] = useState(false);

    // Show success message when redirected from signup (email confirmation required)
    const hasShownSignupSuccess = useRef(false);
    useEffect(() => {
        if (params.signupSuccess === '1' && !hasShownSignupSuccess.current) {
            hasShownSignupSuccess.current = true;
            setError(
                'Account created! Please check your email to confirm your account before signing in.',
                'Confirm Your Email'
            );
        }
    }, [params.signupSuccess]);
    useEffect(() => {
        if (params.email) setEmail(params.email);
    }, [params.email]);

    useEffect(() => {
        async function checkSMMEVerification() {
            if (!hasCheckedVerification && profile?.role === 'SMME' && profile?.id) {
                setHasCheckedVerification(true);
                try {
                    const allDocs = await verificationService.getAllVerifications(profile.id);
                    const requiredTypes = ['Business Registration', 'ID Document', 'Business Profile'];
                    const requiredDocs = allDocs.filter(doc => requiredTypes.includes(doc.document_type));
                    const allVerified = requiredDocs.length === 3 && requiredDocs.every(doc => doc.status === 'verified');
                    if (!allVerified) {
                        setTimeout(() => {
                            setShowVerificationAlert(true);
                        }, 1000);
                    }
                } catch (error) {
                    console.error('Error checking verification status:', error);
                }
            }
        }
        if (profile && !hasCheckedVerification) {
            checkSMMEVerification();
        }
    }, [profile, hasCheckedVerification]);

    useEffect(() => {
        if (cooldownSeconds <= 0) return;
        const id = setInterval(() => {
            setCooldownSeconds((s) => (s > 0 ? s - 1 : 0));
        }, 1000);
        return () => clearInterval(id);
    }, [cooldownSeconds]);

    async function handleLogin() {
        if (!email || !password) {
            setError('Please enter both email and password', 'Missing fields');
            return;
        }
        if (cooldownSeconds > 0) {
            setError(`Too many attempts. Try again in ${cooldownSeconds}s.`, 'Rate limited');
            return;
        }
        const emailCheck = validateEmail(email);
        if (!emailCheck.valid) {
            setError(emailCheck.message ?? 'Please enter a valid email address', 'Invalid Email');
            return;
        }

        await execute(
            () => login(email.trim().toLowerCase(), password),
            {
                onSuccess: () => {
                    clearError();
                    router.replace('/(tabs)');
                },
                onError: (error: any) => {
                    const message = error?.message ?? '';
                    if (/too many|rate limit|over_email_send_rate_limit|over_request_rate_limit|429/i.test(message)) {
                        setCooldownSeconds(60);
                    }
                    // Never show raw Supabase "Email not confirmed" / AuthApiError to the user
                    if (/AuthApiError|email not confirmed|email_not_confirmed/i.test(message) && !/confirm your account/i.test(message)) {
                        setError('Please check your email and confirm your account before logging in.', 'Email not confirmed');
                    }
                },
            }
        );
    }

    return (
        <View className="flex-1 bg-background">
            <View className="absolute inset-0 z-0">
                <LinearGradient
                    colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
                    className="absolute top-0 left-0 right-0 h-2/5"
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                />
                <Stars />
            </View>
            <SafeAreaView className="flex-1 z-10 relative" edges={['top']}>
                {/* Header stays on top when scrolling (z-20 above scroll content z-0) */}
                <View className="px-6 pt-2 rounded-3xl h-1/4 z-20">
                    <TouchableOpacity
                        className="w-10 h-10 rounded-full flex-row justify-center items-center mt-2"
                        onPress={() => router.back()}
                    >
                        <Ionicons name="chevron-back" size={24} color={colors.white} />
                        <Text className="text-white text-sm ml-1">Back</Text>
                    </TouchableOpacity>
                    <View className="items-center mt-2">
                        <Image
                            source={require('../../../assets/logos/blue text-idz logo.png')}
                            className="w-60 h-[100px]"
                            resizeMode="contain"
                        />
                        <Text className="text-white text-3xl font-bold mt-4 mb-2">Sign In</Text>
                        <Text className="text-white/80 text-base mb-2">Welcome to ELIDZ-STP</Text>
                        <Text className="text-white/70 text-xs text-center mt-1 px-4">
                            New user? Confirm your email after signing up before you can sign in.
                        </Text>
                    </View>
                </View>

                <ScreenKeyboardAwareScrollView
                    contentContainerClassName="flex-grow rounded-3xl"
                    className="flex-1 z-0"
                >
                    <View className="w-full px-6 pb-10 pt-6 rounded-3xl mt-4 bg-background flex flex-col">
                        <View className="flex-row items-center bg-input rounded-xl mb-4 px-4 h-14 border border-border overflow-hidden">
                            <View className="mr-3">
                                <Ionicons name="mail-outline" size={20} color={colors.accent} />
                            </View>
                            <TextInput
                                className="flex-1 min-h-0 py-0 text-base text-foreground"
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Email"
                                placeholderTextColor={colors.placeholder}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                            />
                        </View>
                        <PasswordField
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Password"
                            accentColor={colors.accent}
                            placeholderColor={colors.placeholder}
                            editable={!isLoading}
                            containerClassName="flex-row items-center bg-input rounded-xl mb-2 px-4 h-14 border border-border overflow-hidden"
                        />
                        <View className="flex-row justify-end mb-6">
                            <Pressable onPress={() => router.push('/(auth)/forgot-password')}>
                                <Text className="text-accent text-sm">Forgot Password?</Text>
                            </Pressable>
                        </View>
                        <TermsAndPrivacyNotice
                            accepted={acceptedTerms}
                            onToggle={() => setAcceptedTerms(!acceptedTerms)}
                        />
                        <Button
                            className="rounded-xl bg-secondary justify-center rounded-full items-center mb-6 py-3.5 px-6 min-h-[48px]"
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            <Text className="text-secondary-foreground min-h-10 text-lg font-semibold">
                                {isLoading ? 'Signing In...' : 'Sign In'}
                            </Text>
                        </Button>
                        <View className="flex-row items-center my-6">
                            <View className="flex-1 h-px bg-border" />
                            <Text className="text-muted-foreground mx-4 text-sm font-medium">Or continue with</Text>
                            <View className="flex-1 h-px bg-border" />
                        </View>
                        <Pressable
                            className="min-h-[48px] py-3.5 px-6 rounded-xl bg-card border border-border flex-row items-center justify-center mb-4 active:opacity-80"
                            onPress={async () => {
                                await execute(() => signInWithGoogle());
                            }}
                        >
                            <Image
                                source={require('../../../assets/logos/search.png')}
                                className="w-[22px] h-[22px] mr-3"
                                resizeMode="contain"
                            />
                            <Text className="text-base font-semibold text-foreground">Continue with Google</Text>
                        </Pressable>
                        <Pressable
                            className="min-h-[48px] py-3.5 px-6 rounded-xl bg-card border border-border flex-row items-center justify-center mb-6 active:opacity-80"
                            onPress={async () => {
                                await execute(() => signInWithApple());
                            }}
                        >
                            <Image
                                source={require('../../../assets/logos/apple-logo.png')}
                                className="w-[22px] h-[22px] mr-3"
                                resizeMode="contain"
                            />
                            <Text className="text-base font-semibold text-foreground">Continue with Apple</Text>
                        </Pressable>
                        <View className="flex-row justify-center items-center">
                            <Text className="text-sm text-muted-foreground">Don&apos;t have an account? </Text>
                            <Pressable onPress={() => router.push('/(auth)/signup')}>
                                <Text className="text-sm font-semibold text-accent">Sign Up</Text>
                            </Pressable>
                        </View>
                    </View>
                </ScreenKeyboardAwareScrollView>
            </SafeAreaView>

            {/* Error Alert */}
            <ErrorAlert
                visible={!!error}
                title={errorTitle}
                message={error ?? ''}
                onDismiss={clearError}
                severity={
                    error?.includes('Rate limited') ? 'warning'
                        : error?.includes('Account created!') || error?.includes('confirm your account') ? 'info'
                        : error?.includes('Email') ? 'info'
                        : 'error'
                }
                autoDismissMs={error?.includes('Account created!') ? 5000 : 6000}
            />

            {/* Resend confirmation link when login fails due to unconfirmed email */}
            {error?.includes('confirm your account') && !error?.includes('Account created!') && email && (
                <View className="absolute top-28 left-4 right-4 z-40">
                    <Pressable
                        onPress={async () => {
                            try {
                                await resendSignupConfirmation(email);
                                clearError();
                                setError('Confirmation email sent. Check your inbox (and spam folder).', 'Email Sent');
                            } catch (e: any) {
                                setError(e?.message ?? 'Failed to resend', 'Error');
                            }
                        }}
                        className="py-2 px-4 bg-primary/10 rounded-lg border border-primary/30"
                    >
                        <Text className="text-primary text-sm font-medium text-center">
                            Resend confirmation email
                        </Text>
                    </Pressable>
                </View>
            )}

            {/* Verification Alert Modal */}
            {showVerificationAlert && (
                <View className="absolute inset-0 justify-center items-center bg-black/40 z-50">
                    <View className="bg-card rounded-2xl p-6 mx-6 border border-border">
                        <Text className="text-lg font-bold text-foreground mb-3">
                            Verification Required
                        </Text>
                        <Text className="text-sm text-muted-foreground mb-6 leading-5">
                            To access all features and appear in the Verified SMMEs directory, you need to complete business verification. This requires uploading 3 documents: Business Registration, ID Document, and Business Profile.{'\n\n'}You can start the verification process from your profile page.
                        </Text>
                        <View className="flex-row gap-3">
                            <Pressable
                                className="flex-1 py-3 px-4 rounded-lg bg-destructive/10"
                                onPress={() => setShowVerificationAlert(false)}
                            >
                                <Text className="text-center text-destructive font-semibold text-sm">
                                    Later
                                </Text>
                            </Pressable>
                            <Pressable
                                className="flex-1 py-3 px-4 rounded-lg bg-primary"
                                onPress={() => {
                                    setShowVerificationAlert(false);
                                    router.push('/(tabs)/profile');
                                }}
                            >
                                <Text className="text-center text-primary-foreground font-semibold text-sm">
                                    Go to Profile
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
}

import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Pressable, TouchableOpacity, Image, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import Constants from 'expo-constants';
import { Text } from '@/components/ui/text';
import { ScreenKeyboardAwareScrollView } from '@/components/ScreenKeyboardAwareScrollView';
import { useAuthContext } from '@/hooks/use-auth-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/button';
import { Stars } from '@/components/Stars';
import { verificationService } from '@/services/verification.service';
import { useColorScheme } from '@/hooks/use-theme-color';
import { COLORS } from '@/theme/colors';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { validateEmail } from '@/utils/validation';
import { PasswordField } from '@/components/PasswordField';
import { TermsAndPrivacyNotice } from '@/components/TermsAndPrivacyNotice';
import { ErrorAlert } from '@/components/Error';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import { authBack } from '@/utils/navigation';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

export default function LoginScreen() {
    const insets = useSafeAreaInsets();
    const { login, signInWithApple, socialSignIn, resendSignupConfirmation, profile } = useAuthContext();
    const { colorScheme } = useColorScheme();
    const colors = COLORS[colorScheme ?? 'light'];
    const params = useLocalSearchParams<{ signupSuccess?: string; email?: string }>();
    const { isLoading, error, errorTitle, execute, clearError, setError } = useAsyncOperation();
    const [email, setEmail] = useState(params.email ?? '');
    const [password, setPassword] = useState('');
    const [cooldownSeconds, setCooldownSeconds] = useState(0);
    const [providerLoading, setProviderLoading] = useState<'google' | 'apple' | null>(null);
    const [hasCheckedVerification, setHasCheckedVerification] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [showVerificationAlert, setShowVerificationAlert] = useState(false);
    const [isResending, setIsResending] = useState(false);

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
        const googleAuth = Constants.expoConfig?.extra?.googleAuth as { webClientId?: string } | undefined;
        const webClientId = googleAuth?.webClientId;
        GoogleSignin.configure({
            webClientId,
            scopes: ['openid', 'email', 'profile'],
        });
    }, []);

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

        const normalizedEmail = email.trim().toLowerCase();
        console.log('LoginScreen: starting login', { email: normalizedEmail });

        await execute(
            () => login(normalizedEmail, password),
            {
                onSuccess: () => {
                    console.log('LoginScreen: login success, navigating to /(tabs)');
                    clearError();
                    router.replace('/(tabs)');
                },
                onError: (error: any) => {
                    const message = error?.message ?? '';
                    console.log('LoginScreen: login failed', { message, error });
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

    const isSuccessResponse = (response: unknown): response is { data: { idToken?: string | null } } => {
        if (!response || typeof response !== 'object') return false;
        const data = (response as { data?: { idToken?: string | null } }).data;
        return !!data && typeof data === 'object';
    };

    const handleSocialLogin = async (provider: 'google') => {
        clearError();
        setProviderLoading(provider);
        try {
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            const response = await GoogleSignin.signIn();

            if (!isSuccessResponse(response)) {
                setError('Google Sign-In failed', 'Error');
                return;
            }

            const idToken = response.data.idToken;
            if (!idToken) {
                setError('Google Sign-In failed - no idToken', 'Error');
                return;
            }

            const { error } = await socialSignIn('google', idToken);
            if (error) {
                setError(error.message || 'Failed to login with Google', 'Error');
                return;
            }

            router.replace('/(tabs)');
        } catch (error: any) {
            if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
                return;
            }
            if (error?.code === statusCodes.IN_PROGRESS) {
                setError('Google Sign-In already in progress', 'Error');
                return;
            }
            if (error?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                setError('Google Play Services unavailable', 'Error');
                return;
            }
            setError('Google Sign-In failed', 'Error');
        } finally {
            setProviderLoading(null);
        }
    };

    const handleBack = authBack;

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
            <SafeAreaView className="flex-1 z-10 relative" edges={['top', 'bottom', 'left', 'right']}>
                {/* Header: padding-driven height so short/tall phones and iOS/Android align; no fixed h-1/4 */}
                <View className="px-6 pt-1 pb-3 rounded-3xl z-20">
                    <TouchableOpacity
                        className="flex-row items-center self-start mt-1 py-2 pr-3 pl-0 active:opacity-80"
                        onPress={handleBack}
                        accessibilityRole="button"
                        accessibilityLabel="Go back"
                    >
                        <Ionicons name="chevron-back" size={24} color={colors.white} />
                        <Text className="text-white text-sm ml-0.5">Back</Text>
                    </TouchableOpacity>
                    <View className="items-center mt-2">
                        <Image
                            source={require('../../../assets/logos/blue text-idz logo.png')}
                            className="w-60 h-[100px]"
                            resizeMode="contain"
                        />
                        <Text className="text-white text-3xl font-bold mt-4 mb-2">Sign In</Text>
                        <Text className="text-white/80 text-base mb-2">Welcome to ELIDZ-STP</Text>
                      
                    </View>
                </View>

                <ScreenKeyboardAwareScrollView
                    contentContainerClassName="flex-grow rounded-3xl"
                    className="flex-1 z-0"
                    insetTop={false}
                    insetBottom={false}
                >
                    <View className="w-full px-6 pt-5 pb-8 rounded-3xl mt-2 bg-background flex flex-col">
                        <View className="flex-row items-center bg-input rounded-xl mb-4 px-4 h-14 border border-border overflow-hidden">
                            <View className="mr-3">
                                <Ionicons name="mail-outline" size={20} color={colors.accent} />
                            </View>
                            <TextInput
                                className="flex-1 min-h-0 py-0 text-base text-foreground"
                                value={email}
                                onChangeText={(t) => { setEmail(t); clearError(); }}
                                placeholder="Email"
                                placeholderTextColor={colors.placeholder}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                            />
                        </View>
                        <PasswordField
                            value={password}
                            onChangeText={(t) => { setPassword(t); clearError(); }}
                            placeholder="Password"
                            accentColor={colors.accent}
                            placeholderColor={colors.placeholder}
                            editable={!isLoading}
                            containerClassName="flex-row items-center bg-input rounded-xl mb-2 px-4 h-14 border border-border overflow-hidden"
                        />
                        <View className="flex-row justify-end mb-4">
                            <Pressable onPress={() => router.push('/(auth)/forgot-password')}>
                                <Text className="text-accent text-sm">Forgot Password?</Text>
                            </Pressable>
                        </View>
                        <TermsAndPrivacyNotice
                            accepted={true}
                            onToggle={() => {}}
                            showCheckbox={false}
                            context="signin"
                        />
                        {error && !error?.includes('Account created!') && !error?.includes('Confirmation email sent') && (
                            <View className="mb-4 rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3">
                                <Text className="text-destructive text-sm">{error}</Text>
                            </View>
                        )}
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
                            className="h-14 rounded-full bg-card border-2 border-border flex-row items-center justify-center mb-3 active:opacity-80 active:scale-95"
                            onPress={() => handleSocialLogin('google')}
                            disabled={providerLoading !== null}
                        >
                            <Image
                                source={require('../../../assets/logos/search.png')}
                                className="w-[22px] h-[22px] mr-3"
                                resizeMode="contain"
                            />
                            <Text className="text-base font-semibold text-foreground">
                                {providerLoading === 'google' ? 'Signing in...' : 'Continue with Google'}
                            </Text>
                        </Pressable>
                        {Platform.OS === 'ios' && (
                            <Pressable
                                className="h-14 rounded-full bg-card border-2 border-border flex-row items-center justify-center mb-3 active:opacity-80 active:scale-95"
                                onPress={async () => {
                                    await execute(() => signInWithApple(), {
                                        onSuccess: () => {
                                            clearError();
                                            router.replace('/(tabs)');
                                        },
                                    });
                                }}
                                disabled={isLoading}
                            >
                                <Image
                                    source={require('../../../assets/logos/apple-logo.png')}
                                    className="w-[22px] h-[22px] mr-3"
                                    resizeMode="contain"
                                />
                                <Text className="text-base font-semibold text-foreground">
                                    {isLoading ? 'Signing in...' : 'Continue with Apple'}
                                </Text>
                            </Pressable>
                        )}
                        <View className="flex-row justify-center items-center mt-1">
                            <Text className="text-sm text-muted-foreground">Don&apos;t have an account? </Text>
                            <Pressable onPress={() => router.push('/(auth)/signup')}>
                                <Text className="text-sm font-semibold text-accent">Sign Up</Text>
                            </Pressable>
                        </View>
                    </View>
                </ScreenKeyboardAwareScrollView>
            </SafeAreaView>

            {/* Error Alert - only for success/info messages (Account created, Confirmation email sent) */}
            <ErrorAlert
                visible={!!error && (error?.includes('Account created!') || error?.includes('Confirmation email sent'))}
                title={errorTitle}
                message={error ?? ''}
                onDismiss={clearError}
                severity={
                    error?.includes('Confirmation email sent') ? 'success'
                        : error?.includes('Account created!') || error?.includes('confirm your account') ? 'info'
                        : 'error'
                }
                autoDismissMs={error?.includes('Account created!') ? 5000 : 6000}
            />

            {/* Resend confirmation: show after signup ("Account created!") or when login fails due to unconfirmed email */}
            {error?.includes('confirm your account') && email && (
                <View
                    className="absolute left-4 right-4 z-40"
                    style={{ top: insets.top + 52 }}
                >
                    <Pressable
                        onPress={async () => {
                            if (cooldownSeconds > 0 || isResending) return;
                            setIsResending(true);
                            try {
                                await resendSignupConfirmation(email.trim().toLowerCase());
                                clearError();
                                setCooldownSeconds(60);
                                setError(
                                    'Confirmation email sent. Check your inbox and spam folder.',
                                    'Email Sent'
                                );
                            } catch (e: any) {
                                const msg = e?.message ?? 'Failed to resend';
                                if (/rate limit|over_email_send_rate_limit/i.test(msg)) {
                                    setCooldownSeconds(60);
                                    setError('Too many requests. Please wait a minute and try again.', 'Rate Limited');
                                } else {
                                    setError(msg, 'Error');
                                }
                            } finally {
                                setIsResending(false);
                            }
                        }}
                        disabled={cooldownSeconds > 0 || isResending}
                        className="py-2 px-4 bg-primary/10 rounded-lg border border-primary/30"
                    >
                        <Text className="text-primary text-sm font-medium text-center">
                            {isResending
                                ? 'Sending…'
                                : cooldownSeconds > 0
                                    ? `Resend in ${cooldownSeconds}s`
                                    : 'Resend confirmation email'}
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

import React, { useState, useEffect } from 'react';
import { View, TextInput, Pressable, Alert, Dimensions, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
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

const { height } = Dimensions.get('window');

export default function LoginScreen() {
    const { login, signInWithGoogle, resendSignupConfirmation, profile } = useAuthContext();
    const { colorScheme } = useColorScheme();
    const colors = COLORS[colorScheme ?? 'light'];
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [cooldownSeconds, setCooldownSeconds] = useState(0);
    const [hasCheckedVerification, setHasCheckedVerification] = useState(false);

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
                            Alert.alert(
                                'Verification Required',
                                'To access all features and appear in the Verified SMMEs directory, you need to complete business verification. This requires uploading 3 documents: Business Registration, ID Document, and Business Profile.\n\nYou can start the verification process from your profile page.',
                                [
                                    { text: 'Go to Profile', onPress: () => router.push('/(tabs)/profile') },
                                    { text: 'Later', style: 'cancel' },
                                ]
                            );
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
            Alert.alert('Error', 'Please enter email and password');
            return;
        }
        if (cooldownSeconds > 0) {
            Alert.alert('Please wait', `Too many attempts. Try again in ${cooldownSeconds}s.`);
            return;
        }
        const emailCheck = validateEmail(email);
        if (!emailCheck.valid) {
            Alert.alert('Invalid Email', emailCheck.message ?? 'Please enter a valid email address');
            return;
        }
        setIsLoading(true);
        try {
            await login(email.trim().toLowerCase(), password);
            router.replace('/(tabs)');
        } catch (error: any) {
            const message = error?.message || 'Failed to login. Please check your credentials and try again.';
            if (/too many|rate limit|over_email_send_rate_limit|over_request_rate_limit|429/i.test(message)) {
                setCooldownSeconds(60);
            }
            if (/confirm your account|email not confirmed/i.test(message)) {
                Alert.alert(
                    'Email Not Confirmed',
                    'Please confirm your email before logging in. You can resend the confirmation email below.',
                    [
                        {
                            text: 'Resend Email',
                            onPress: async () => {
                                try {
                                    await resendSignupConfirmation(email.trim().toLowerCase());
                                    Alert.alert('Sent', 'Confirmation email sent. Please check your inbox and spam folder.');
                                } catch (resendError: any) {
                                    const resendMsg = resendError?.message || 'Could not resend confirmation email.';
                                    if (/too many|rate limit|over_email_send_rate_limit|429/i.test(resendMsg)) {
                                        setCooldownSeconds(60);
                                    }
                                    Alert.alert('Resend Failed', resendError?.message || 'Could not resend confirmation email.');
                                }
                            },
                        },
                        { text: 'OK', style: 'cancel' },
                    ]
                );
                return;
            }
            Alert.alert('Login Failed', message);
        } finally {
            setIsLoading(false);
        }
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
                        onPress={() => router.back()}
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
                        <Text className="text-white text-3xl font-bold mt-4 mb-2">Sign In</Text>
                        <Text className="text-white/80 text-base mb-2">Welcome to ELIDZ-STP</Text>
                    </View>
                </View>

                <ScreenKeyboardAwareScrollView
                    contentContainerClassName="flex-grow rounded-3xl"
                    style={{ zIndex: 2 }}
                >
                    <View className="w-full px-6 pb-10 pt-6 rounded-3xl bg-background mt-4">
                        <View className="flex-row items-center bg-input rounded-xl mb-4 px-4 h-14 border border-border">
                            <Ionicons name="mail-outline" size={20} color={colors.accent} style={{ marginRight: 12 }} />
                            <TextInput
                                className="flex-1 text-base text-foreground"
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
                            containerClassName="flex-row items-center bg-input rounded-xl mb-2 px-4 h-14 border border-border"
                        />
                        <View className="flex-row justify-end mb-6">
                            <Pressable onPress={() => router.push('/(auth)/forgot-password')}>
                                <Text className="text-accent text-sm">Forgot Password?</Text>
                            </Pressable>
                        </View>
                        <Button
                            className="rounded-xl bg-secondary justify-center items-center mb-6 py-3.5 px-6"
                            style={{ minHeight: 48 }}
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            <Text className="text-secondary-foreground text-lg font-semibold">
                                {isLoading ? 'Signing In...' : 'Sign In'}
                            </Text>
                        </Button>
                        <View className="flex-row items-center my-6">
                            <View className="flex-1 h-px bg-border" />
                            <Text className="text-muted-foreground mx-4 text-sm font-medium">Or continue with</Text>
                            <View className="flex-1 h-px bg-border" />
                        </View>
                        <Pressable
                            style={{ minHeight: 48 }}
                            className="py-3.5 px-6 rounded-xl bg-card border border-border flex-row items-center justify-center mb-6 active:opacity-80"
                            onPress={async () => {
                                try {
                                    await signInWithGoogle();
                                } catch (error: any) {
                                    Alert.alert('Error', error?.message || 'Failed to sign in with Google');
                                }
                            }}
                        >
                            <Image
                                source={require('../../../assets/logos/search.png')}
                                style={{ width: 22, height: 22, marginRight: 12 }}
                                resizeMode="contain"
                            />
                            <Text className="text-base font-semibold text-foreground">Continue with Google</Text>
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
        </View>
    );
}

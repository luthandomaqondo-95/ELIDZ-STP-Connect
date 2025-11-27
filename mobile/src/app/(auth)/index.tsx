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

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
    const { login, signInWithGoogle, profile } = useAuthContext();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Track if we've already shown the verification alert for this session
    const [hasCheckedVerification, setHasCheckedVerification] = useState(false);

    // Check verification status for SMME users after login
    useEffect(() => {
        async function checkSMMEVerification() {
            // Only check once per session and only if user is SMME and logged in
            if (!hasCheckedVerification && profile?.role === 'SMME' && profile?.id) {
                setHasCheckedVerification(true);
                try {
                    const allDocs = await verificationService.getAllVerifications(profile.id);
                    const requiredTypes = ['Business Registration', 'ID Document', 'Business Profile'];
                    const requiredDocs = allDocs.filter(doc => requiredTypes.includes(doc.document_type));
                    const allVerified = requiredDocs.length === 3 && requiredDocs.every(doc => doc.status === 'verified');
                    
                    if (!allVerified) {
                        // Small delay to ensure navigation is complete
                        setTimeout(() => {
                            Alert.alert(
                                'Verification Required',
                                'To access all features and appear in the Verified SMMEs directory, you need to complete business verification. This requires uploading 3 documents: Business Registration, ID Document, and Business Profile.\n\nYou can start the verification process from your profile page.',
                                [
                                    {
                                        text: 'Go to Profile',
                                        onPress: () => {
                                            router.push('/(tabs)/profile');
                                        }
                                    },
                                    {
                                        text: 'Later',
                                        style: 'cancel'
                                    }
                                ]
                            );
                        }, 1000);
                    }
                } catch (error) {
                    // Silently fail - verification check is not critical for login
                    console.error('Error checking verification status:', error);
                }
            }
        }
        
        // Only check if we have a profile (user is logged in) and haven't checked yet
        if (profile && !hasCheckedVerification) {
            checkSMMEVerification();
        }
    }, [profile, hasCheckedVerification]);

    async function handleLogin() {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+(\.[^\s@]+)*$/;
        if (!emailRegex.test(email.trim())) {
            Alert.alert('Invalid Email', 'Please enter a valid email address (e.g., yourname@example.com)');
            return;
        }
        setIsLoading(true);
        try {
            // Email is normalized in the login function, but we can also normalize here for consistency
            await login(email.trim().toLowerCase(), password);
            // Redirect to main app after successful login
            router.replace('/(tabs)');
        } catch (error: any) {
            // Show the error message which now includes helpful hints about email confirmation
            Alert.alert('Login Failed', error?.message || 'Failed to login. Please check your credentials and try again.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <View className="flex-1 bg-background">
            <LinearGradient
                colors={['#0a1628', '#122a4d', '#1a3a5c']}
                className="absolute inset-0"
                style={{ height: height * 0.4 }}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
            />
            <Stars />
            {/* Header Section */}
            <View className="px-6 pt-1 rounded-3xl" style={{ height: height * 0.25 }}>
                {/* Back Button - Optional, if needed */}
                <TouchableOpacity
                    className="w-10 h-10 rounded-full flex-row justify-center items-center"
                    style={{ marginTop: 40 }}
                    onPress={() => router.push('/(tabs)')}
                >
                    <Ionicons name="chevron-back" size={24} color="#fff" />
                    <Text className="text-white text-sm">Back</Text>
                </TouchableOpacity>

                {/* Title */}
                <View className="items-center mt-4">
                    <Text className="text-3xl font-bold text-white mb-2">Sign In</Text>
                    <Text className="text-white/80 text-base mb-4">Welcome to ELIDZ-STP</Text>
                    <Image
                        source={require('../../../assets/logos/blue text-idz logo.png')}
                        style={{ width: 300, height: 130 }}
                        resizeMode="contain"
                    />
                </View>
            </View>

            <ScreenKeyboardAwareScrollView
                contentContainerClassName="flex-grow mt-4 rounded-3xl"
                style={{ zIndex: 2 }}
            >
                {/* Form Fields */}
                <View className="w-full px-6 pb-10 pt-6 rounded-3xl bg-background" style={{ marginTop: 10 }}>
                    {/* Email Input */}
                    <View className="flex-row items-center bg-input rounded-full mb-4 px-4 h-14 border border-border">
                        <Ionicons name="mail-outline" size={20} color="#FF6600" style={{ marginRight: 12 }} />
                        <TextInput
                            className="flex-1 text-base text-foreground"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Email"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                        />
                    </View>

                    {/* Password Input */}
                    <View className="flex-row items-center bg-input rounded-full mb-2 px-4 h-14 border border-border">
                        <Ionicons name="lock-closed-outline" size={20} color="#FF6600" style={{ marginRight: 12 }} />
                        <TextInput
                            className="flex-1 text-base text-foreground"
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Password"
                            placeholderTextColor="#9CA3AF"
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            autoComplete="password"
                        />
                        <Pressable
                            className="p-1"
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            <Ionicons
                                name={showPassword ? "eye-outline" : "eye-off-outline"}
                                size={20}
                                color="#FF6600"
                            />
                        </Pressable>
                    </View>

                    {/* Forgot Password */}
                    <View className="flex-row justify-end mb-6">
                        <Pressable onPress={() => router.push('/(auth)/forgot-password')}>
                            <Text className="text-accent text-sm">
                                Forgot Password?
                            </Text>
                        </Pressable>
                    </View>

                    {/* Sign In Button */}
                    <Button
                        className="h-14 rounded-full bg-accent justify-center items-center mb-8 shadow-lg"
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        <Text className="text-lg font-semibold text-white">
                            {isLoading ? 'Signing In...' : 'Sign In'}
                        </Text>
                    </Button>

                    {/* Divider */}
                    <View className="flex-row items-center my-6">
                        <View className="flex-1 h-px bg-border" />
                        <Text className="text-muted-foreground mx-4 text-sm font-medium">
                            Or continue with
                        </Text>
                        <View className="flex-1 h-px bg-border" />
                    </View>

                    {/* Google Sign In Button */}
                    <Pressable
                        className="h-14 rounded-full bg-card border-2 border-border flex-row items-center justify-center mb-6 active:opacity-80 active:scale-95"
                        onPress={async () => {
                            try {
                                await signInWithGoogle();
                            } catch (error: any) {
                                Alert.alert('Error', error?.message || 'Failed to sign in with Google');
                            }
                        }}
                    >
                        <Ionicons name="logo-google" size={20} color="#4285F4" style={{ marginRight: 12 }} />
                        <Text className="text-base font-semibold text-foreground">
                            Continue with Google
                        </Text>
                    </Pressable>

                    {/* Sign Up Link */}
                    <View className="flex-row justify-center items-center">
                        <Text className="text-sm text-muted-foreground">Don't have an account? </Text>
                        <Pressable onPress={() => router.push('/(auth)/signup')}>
                            <Text className="text-sm font-semibold text-accent underline">Sign Up</Text>
                        </Pressable>
                    </View>
                </View>
            </ScreenKeyboardAwareScrollView>
        </View>
    );
}
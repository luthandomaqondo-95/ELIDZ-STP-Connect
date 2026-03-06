import React, { useState } from 'react';
import { View, TextInput, Pressable, Alert, Dimensions, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ExpoLinking from 'expo-linking';
import Constants from 'expo-constants';
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
import { validateEmail } from '@/utils/validation';
import { authBack } from '@/utils/navigation';

const { height } = Dimensions.get('window');

export default function ForgotPasswordScreen() {
    const { colorScheme } = useColorScheme();
    const colors = COLORS[colorScheme];
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isEmailSent, setIsEmailSent] = useState(false);

    const handleResetPassword = async () => {
        const trimmedEmail = email.trim();
        const emailCheck = validateEmail(trimmedEmail);
        if (!emailCheck.valid) {
            Alert.alert('Error', emailCheck.message ?? 'Please enter your email address');
            return;
        }

        setIsLoading(true);

        try {
            // In Expo Go, prefer the generated exp://... deep link.
            // In dev-client / standalone builds, use the stable custom scheme.
            const redirectTo =
                Constants.appOwnership === 'expo'
                    ? ExpoLinking.createURL('reset-password')
                    : 'elidzstp://reset-password';

            const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                // Route groups like "(auth)" are not part of deep-link paths in expo-router.
                redirectTo,
            });

            if (error) {
                throw error;
            }

            setIsEmailSent(true);
        } catch (error: any) {
            console.error('Password reset error:', error);
            Alert.alert('Error', error.message || 'Failed to send reset email. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToLogin = authBack;

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
						<Text className="text-white text-3xl font-bold mt-4 mb-2">Forgot Password</Text>
						<Text className="text-white/80 text-base text-center px-4">
							Enter your email and we&apos;ll send you a link to reset your password.
						</Text>
					</View>
				</View>

				<ScreenKeyboardAwareScrollView
					contentContainerClassName="flex-grow rounded-3xl"
					contentContainerStyle={{ flexGrow: 1 }}
					style={{ flex: 1, zIndex: 2 }}
				>
					<View className="w-full px-6 pb-10 pt-6 rounded-3xl mt-4" style={{ backgroundColor: colors.background }}>
                    {!isEmailSent ? (
                        <>
                            {/* Email Input */}
                            <View className="flex-row items-center bg-input rounded-full mb-6 px-4 h-14 border border-border">
                                <Ionicons name="mail-outline" size={20} color={colors.accent} style={{ marginRight: 12 }} />
                                <TextInput
                                    className="flex-1 text-base text-foreground h-full"
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="Your email address"
                                    placeholderTextColor={colors.placeholder}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    editable={!isLoading}
                                />
                            </View>

                            {/* Reset Button */}
                            <Button
                                className="h-14 rounded-full bg-accent justify-center items-center mb-6 active:opacity-80 active:scale-95 shadow-sm"
                                onPress={handleResetPassword}
                                disabled={isLoading}
                            >
                                <Text className="text-lg font-bold text-white">
                                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                                </Text>
                            </Button>

                            {/* Back to Login Link */}
                            <View className="flex-row justify-center mt-2">
                                <Text className="text-muted-foreground">Remember your password? </Text>
                                <Pressable onPress={handleBackToLogin}>
                                    <Text className="text-accent font-bold">Log In</Text>
                                </Pressable>
                            </View>
                        </>
                    ) : (
                        <View className="items-center pt-4">
                            {/* Success State */}
                            <View className="items-center mb-6 bg-accent/10 p-6 rounded-full">
                                <Ionicons name="mail-open-outline" size={60} color={colors.accent} />
                            </View>

                            <Text className="text-2xl font-bold text-center text-foreground mb-3">Check Your Email</Text>
                            <Text className="text-center text-muted-foreground mb-8 px-4 leading-6">
                                We&apos;ve sent a password reset link to{'\n'}
                                <Text className="font-bold text-foreground">{email}</Text>
                            </Text>

                            {/* Back to Login Button */}
                            <Pressable
                                className="w-full h-14 rounded-full bg-accent justify-center items-center mb-4 active:opacity-80 active:scale-95 shadow-sm"
                                onPress={handleBackToLogin}
                            >
                                <Text className="text-lg font-bold text-white">Back to Login</Text>
                            </Pressable>

                            {/* Try Different Email */}
                            <Pressable
                                className="w-full h-14 rounded-full border-2 border-accent justify-center items-center active:opacity-80 active:scale-95"
                                onPress={() => setIsEmailSent(false)}
                            >
                                <Text className="text-lg font-bold text-accent">Try Different Email</Text>
                            </Pressable>
                        </View>
                    )}
					</View>
				</ScreenKeyboardAwareScrollView>
			</SafeAreaView>
		</View>
    );
}

import React, { useState } from 'react';
import { View, TextInput, Pressable, Alert, Image } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ScreenKeyboardAwareScrollView } from '@/components/ScreenKeyboardAwareScrollView';
import { useAuthContext } from '@/hooks/use-auth-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/button';

export default function LoginScreen() {
	const { login } = useAuthContext();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const player = useVideoPlayer(require('../../../assets/videos/ELIDZ from above.mp4'), (player) => {
		player.loop = true;
		player.muted = true;
		player.play();
	});


	async function handleLogin() {
		if (!email || !password) {
			Alert.alert('Error', 'Please enter email and password');
			return;
		}

		// Basic email validation (allows multiple dots in domain like .co.za)
		// Pattern: username@domain.tld (with optional subdomains and multi-part TLDs)
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+(\.[^\s@]+)*$/;
		if (!emailRegex.test(email.trim())) {
			Alert.alert('Invalid Email', 'Please enter a valid email address (e.g., yourname@example.com)');
			return;
		}

		setIsLoading(true);
		try {
			await login(email, password);
		} catch (error: any) {
			Alert.alert('Error', error?.message || 'Failed to login. Please check your credentials and try again.');
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<View className="flex-1 bg-transparent">
			{/* Video Background */}
			<VideoView
				player={player}
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					bottom: 0,
					right: 0,
					width: '100%',
					height: '100%',
					zIndex: 0,
					opacity: 0.4,
				}}
				contentFit="cover"
				nativeControls={false}
				pointerEvents="none"
			/>

			{/* Semi-transparent overlay for readability */}
			<View
				className="absolute inset-0 bg-black/70"
				style={{ zIndex: 1 }}
				pointerEvents="none"
			/>

			{/* Content */}
			<ScreenKeyboardAwareScrollView
				contentContainerClassName="flex-grow"
				style={{ zIndex: 2 }}
			>
				<View className="flex-1 justify-center px-6">
					{/* Logo */}
					<View className="items-center mb-8">
						<Image
							source={require('../../../assets/logos/blue text-idz logo.png')}
							style={{ width: 320, height: 140, opacity: 1 }}
							resizeMode="contain"
						/>
					</View>

					<Text className="text-white opacity-100 mb-3 text-shadow-lg font-bold text-2xl" style={{ textShadowColor: 'rgba(0, 0, 0, 0.9)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 }}>
						Welcome to ELIDZ-STP
					</Text>
					<Text className="text-white opacity-100 mb-8 text-shadow-md text-base" style={{ textShadowColor: 'rgba(0, 0, 0, 0.9)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 }}>
						Connect with innovators and access resources
					</Text>

					<View className="w-full">
						{/* Email Input */}
						<View className="flex-row items-center bg-[#D4A03B]/10 rounded-full mb-4 px-4 h-14">
							<Ionicons name="mail-outline" size={20} color="#D4A03B" style={{ marginRight: 12 }} />
							<TextInput
								className="flex-1 text-base text-black dark:text-white"
								value={email}
								onChangeText={setEmail}
								placeholder="Your mail"
								placeholderTextColor="#D4A03B"
								keyboardType="email-address"
								autoCapitalize="none"
								autoComplete="email"
							/>
						</View>


						<View className="flex-row justify-end mt-2">
							<Pressable onPress={() => router.push('/(auth)/forgot-password')}>
								<Text className="text-white" style={{ textShadowColor: 'rgba(0, 0, 0, 0.9)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}>
									Forgot Password?
								</Text>
							</Pressable>
						</View>
						{/* Password Input */}
						<View className="flex-row items-center bg-[#D4A03B]/10 rounded-full mb-4 px-4 h-14">
							<Ionicons name="lock-closed-outline" size={20} color="#D4A03B" style={{ marginRight: 12 }} />
							<TextInput
								className="flex-1 text-base text-black dark:text-white"
								value={password}
								onChangeText={setPassword}
								placeholder="Password"
								placeholderTextColor="#D4A03B"
								secureTextEntry={!showPassword}
								autoCapitalize="none"
								autoComplete="password-new"
							/>
							<Pressable
								className="p-1"
								onPress={() => setShowPassword(!showPassword)}
							>
								<Ionicons
									name={showPassword ? "eye-outline" : "eye-off-outline"}
									size={20}
									color="#D4A03B"
								/>
							</Pressable>
						</View>

						{/* Sign Up Button */}
						<Button
							className="h-14 rounded-full bg-[#D4A03B] justify-center items-center mb-6 active:opacity-80 active:scale-95"
							onPress={handleLogin}
							disabled={isLoading}
						>
							<Text className="text-lg font-semibold text-white">
								{isLoading ? 'Submitting...' : 'Sign in'}
							</Text>
						</Button>
						<View className="flex-row items-center my-6">
							<View className="flex-1 h-0.5 bg-white/60" />
							<Text className="text-white opacity-100 mx-3 font-semibold text-sm text-shadow" style={{ textShadowColor: 'rgba(0, 0, 0, 0.9)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}>
								OR
							</Text>
							<View className="flex-1 h-0.5 bg-white/60" />
						</View>

						<Pressable
							className="hidden h-13 rounded-lg flex-row justify-center items-center border-2 mt-4 bg-white/30 border-white/60"
							style={({ pressed }) => ({
								opacity: pressed ? 0.8 : 1,
							})}
						>
							<Text className="text-white opacity-100 font-bold ml-3 text-shadow" style={{ textShadowColor: 'rgba(0, 0, 0, 0.7)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}>
								Continue with Google
							</Text>
						</Pressable>

						<View className="flex-row justify-center items-center mb-2">
							<Text className='text-white' style={{ textShadowColor: 'rgba(0, 0, 0, 0.9)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}>
								Don't have an account?{' '}
							</Text>
						</View>

						<Button
							variant="outline"
							className="h-14 rounded-full bg-[#D4A03B] justify-center items-center mb-6 active:opacity-80 active:scale-95"
							onPress={() => router.push('/(auth)/signup')}
						>
							<Text className="text-lg font-semibold text-white">
								{isLoading ? 'Creating Account...' : 'Sign Up'}
							</Text>
						</Button>
					</View>
				</View>
			</ScreenKeyboardAwareScrollView>
		</View>
	);
}
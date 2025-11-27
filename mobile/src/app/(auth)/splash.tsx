import React, { useEffect } from 'react';
import { View, Image, Animated } from 'react-native';
import { Text } from '@/components/ui/text';
import { useAuthContext } from '@/hooks/use-auth-context';
import { router } from 'expo-router';

export default function SplashScreen() {
	const auth = useAuthContext();
	const { isLoggedIn, isLoading } = auth || {};
	const fadeAnim = new Animated.Value(0);
	const logoScale = new Animated.Value(0.8);

	useEffect(() => {
		// Start animations
		Animated.parallel([
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 1000,
				useNativeDriver: true,
			}),
			Animated.spring(logoScale, {
				toValue: 1,
				tension: 10,
				friction: 3,
				useNativeDriver: true,
			}),
		]).start();

		// Navigate based on authentication state
		const timer = setTimeout(() => {
			if (auth && isLoggedIn) {
				router.replace('/(tabs)');
			} else {
				router.replace('/(auth)/welcome');
			}
		}, 3000);

		return () => clearTimeout(timer);
	}, [auth, isLoggedIn]);

	return (
		<View className="flex-1 justify-center items-center bg-background">
			<Animated.View
				style={{
					opacity: fadeAnim,
					transform: [{ scale: logoScale }],
					alignItems: 'center',
				}}
			>
				{/* ELIDZ Logo */}
				<Image
					source={require('../../../assets/logos/blue text-idz logo.png')}
					style={{
						width: 350,
						height: 150,
						marginBottom: 40,
					}}
					resizeMode="contain"
				/>

				{/* Subtitle */}
				<Text className="text-primary text-center mb-5 text-xl font-semibold">
					Science & Technology Park
				</Text>

				{/* Loading indicator */}
				<View className="flex-row mt-10">
					{[0, 1, 2].map((index) => (
						<Animated.View
							key={index}
							style={{
								width: 8,
								height: 8,
								borderRadius: 4,
								backgroundColor: 'rgb(var(--primary))',
								marginHorizontal: 4,
								opacity: fadeAnim.interpolate({
									inputRange: [0, 0.3, 0.6, 1],
									outputRange: [0.3, 1, 0.3, 0.3],
								}),
								transform: [{
									scale: fadeAnim.interpolate({
										inputRange: [0, 0.3, 0.6, 1],
										outputRange: [0.8, 1.2, 0.8, 0.8],
									}),
								}],
							}}
						/>
					))}
				</View>
			</Animated.View>
		</View>
	);
}

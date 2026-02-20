import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthContext } from '@/hooks/use-auth-context';
import { useColorScheme } from '@/hooks/use-theme-color';
import { COLORS } from '@/theme/colors';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stars } from '@/components/Stars';

const { height } = Dimensions.get('window');

export default function AuthSplashScreen() {
	const auth = useAuthContext();
	const { isLoggedIn } = auth || {};
	const { colorScheme } = useColorScheme();
	const colors = COLORS[colorScheme ?? 'light'];
	const fadeAnim = useRef(new Animated.Value(0)).current;
	const logoScale = useRef(new Animated.Value(0.8)).current;

	useEffect(() => {
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

		const timer = setTimeout(() => {
			if (auth && isLoggedIn) {
				router.replace('/(tabs)');
			} else {
				router.replace('/(auth)/welcome');
			}
		}, 2500);

		return () => clearTimeout(timer);
	}, [auth, isLoggedIn, fadeAnim, logoScale]);

	return (
		<View className="flex-1 bg-background">
			<LinearGradient
				colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
				className="absolute inset-0"
				style={{ height }}
				start={{ x: 0.5, y: 0 }}
				end={{ x: 0.5, y: 1 }}
			/>
			<Stars />
			<SafeAreaView className="flex-1" edges={['top', 'bottom']}>
			<View className="flex-1 justify-center items-center">
				<Animated.View
					style={{
						opacity: fadeAnim,
						transform: [{ scale: logoScale }],
						alignItems: 'center',
					}}
				>
					<Image
						source={require('../../../assets/logos/blue text-idz logo.png')}
						style={{ width: 280, height: 120, marginBottom: 40 }}
						resizeMode="contain"
					/>
					<View className="flex-row items-center justify-center mt-10 gap-1">
						{[0, 1, 2].map((index) => (
							<Animated.View
								key={index}
								style={{
									width: 8,
									height: 8,
									borderRadius: 4,
									backgroundColor: colors.primary,
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
			</SafeAreaView>
		</View>
	);
}

import { useEffect } from 'react';
import { View, ActivityIndicator, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Text } from '@/components/ui/text';
import { useColorScheme } from '@/hooks/use-theme-color';
import { COLORS } from '@/theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stars } from '@/components/Stars';

const { height } = Dimensions.get('window');

export default function OAuthCallbackScreen() {
	const router = useRouter();
	const params = useLocalSearchParams();
	const { colorScheme } = useColorScheme();
	const colors = COLORS[colorScheme ?? 'light'];

	useEffect(() => {
		const handleCallback = async () => {
			try {
				const code = params.code as string;
				if (code) {
					const { data, error } = await supabase.auth.exchangeCodeForSession(code);
					if (error) {
						console.error('OAuth callback error:', error);
						router.replace('/(auth)');
						return;
					}
					if (data?.session) {
						router.replace('/(tabs)');
					} else {
						router.replace('/(auth)');
					}
				} else {
					router.replace('/(auth)');
				}
			} catch (error) {
				console.error('OAuth callback error:', error);
				router.replace('/(auth)');
			}
		};
		handleCallback();
	}, [params, router]);

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
			<SafeAreaView className="flex-1 justify-center items-center" edges={['top']}>
				<Image
					source={require('../../../assets/logos/blue text-idz logo.png')}
					style={{ width: 200, height: 84 }}
					resizeMode="contain"
				/>
				<ActivityIndicator size="large" color="#FFFFFF" style={{ marginTop: 32 }} />
				<Text className="mt-4 text-white/90 text-base">Completing sign in...</Text>
			</SafeAreaView>
		</View>
	);
}


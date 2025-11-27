import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Text } from '@/components/ui/text';

export default function OAuthCallbackScreen() {
	const router = useRouter();
	const params = useLocalSearchParams();

	useEffect(() => {
		const handleCallback = async () => {
			try {
				// Extract code from URL parameters
				const code = params.code as string;
				
				if (code) {
					// Exchange code for session
					const { data, error } = await supabase.auth.exchangeCodeForSession(code);
					
					if (error) {
						console.error('OAuth callback error:', error);
						router.replace('/(auth)');
						return;
					}

					if (data?.session) {
						// Successfully authenticated, redirect to main app
						router.replace('/(tabs)');
					} else {
						router.replace('/(auth)');
					}
				} else {
					// No code parameter, redirect to login
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
		<View className="flex-1 justify-center items-center bg-white">
			<ActivityIndicator size="large" color="#D4A03B" />
			<Text className="mt-4 text-gray-600">Completing sign in...</Text>
		</View>
	);
}


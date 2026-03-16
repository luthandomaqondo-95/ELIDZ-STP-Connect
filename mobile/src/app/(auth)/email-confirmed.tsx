import React, { useState, useEffect, useCallback } from 'react';
import { View, Pressable, Linking, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Ionicons } from '@expo/vector-icons';
import { Stars } from '@/components/Stars';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useColorScheme } from '@/hooks/use-theme-color';
import { COLORS } from '@/theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';

function getAuthParamsFromUrl(url: string): {
	access_token?: string;
	refresh_token?: string;
	code?: string;
	token_hash?: string;
	type?: string;
} {
	try {
		const [baseAndQuery, hashRaw = ''] = url.split('#');
		const queryRaw = baseAndQuery.includes('?') ? baseAndQuery.split('?').slice(1).join('?') : '';
		const hash = hashRaw.startsWith('?') ? hashRaw.slice(1) : hashRaw;

		const hashParams = new URLSearchParams(hash);
		const searchParams = new URLSearchParams(queryRaw);
		const get = (key: string) => hashParams.get(key) ?? searchParams.get(key) ?? undefined;

		return {
			access_token: get('access_token'),
			refresh_token: get('refresh_token'),
			code: get('code'),
			token_hash: get('token_hash'),
			type: get('type'),
		};
	} catch {
		return {};
	}
}

export default function EmailConfirmedScreen() {
	const { colorScheme } = useColorScheme();
	const colors = COLORS[colorScheme ?? 'light'];
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [confirmed, setConfirmed] = useState(false);

	const trySetSessionFromUrl = useCallback(async (url: string | null) => {
		try {
			if (!url) {
				const { data: { session } } = await supabase.auth.getSession();
				if (session) {
					setConfirmed(true);
				} else {
					setError('No confirmation data found. The link may have expired.');
				}
				return;
			}
			const { access_token, refresh_token, code, token_hash, type } = getAuthParamsFromUrl(url);
			if (access_token && refresh_token) {
				const { error: sessionError } = await supabase.auth.setSession({
					access_token,
					refresh_token,
				});
				if (!sessionError) {
					setConfirmed(true);
				} else {
					setError(sessionError.message);
				}
			} else if (code) {
				const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
				if (!sessionError) {
					setConfirmed(true);
				} else {
					setError(sessionError.message);
				}
			} else if (token_hash && (type === 'signup' || type === 'email')) {
				const { error: verifyError } = await supabase.auth.verifyOtp({
					type: type as 'signup' | 'email',
					token_hash,
				});
				if (!verifyError) {
					setConfirmed(true);
				} else {
					setError(verifyError.message);
				}
			} else {
				const { data: { session } } = await supabase.auth.getSession();
				if (session) {
					setConfirmed(true);
				} else {
					setError('Invalid or expired confirmation link.');
				}
			}
		} catch (err: any) {
			setError(err?.message ?? 'Something went wrong.');
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		Linking.getInitialURL().then(trySetSessionFromUrl);
		const sub = Linking.addEventListener('url', ({ url }) => trySetSessionFromUrl(url));
		return () => sub.remove();
	}, [trySetSessionFromUrl]);

	useEffect(() => {
		if (confirmed) {
			router.replace('/(tabs)');
		}
	}, [confirmed]);

	if (isLoading) {
		return (
			<View className="flex-1 bg-background justify-center items-center">
				<ActivityIndicator size="large" color={colors.accent} />
				<Text className="text-muted-foreground mt-4">Confirming your email…</Text>
			</View>
		);
	}

	if (error) {
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
				<SafeAreaView className="flex-1 z-10 justify-center items-center px-6">
					<Ionicons name="alert-circle-outline" size={64} color={colors.destructive} />
					<Text className="text-foreground text-lg font-semibold mt-4 text-center">Confirmation Failed</Text>
					<Text className="text-muted-foreground text-center mt-2">{error}</Text>
					<Button
						className="mt-8 rounded-full px-8"
						onPress={() => router.replace('/(auth)')}
					>
						<Text className="text-white font-semibold">Back to Sign In</Text>
					</Button>
				</SafeAreaView>
			</View>
		);
	}

	return null;
}

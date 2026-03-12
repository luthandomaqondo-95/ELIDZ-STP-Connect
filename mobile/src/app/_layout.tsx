import { useEffect } from "react";
import { StatusBar, View } from "react-native";
import * as Linking from 'expo-linking';
import "@/theme/global.css";
import { NAV_THEME } from '@/theme/colors';
import { ThemeProvider } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useColorScheme } from "@/hooks/use-theme-color";
import { store } from "@/state";
import * as Sentry from '@sentry/react-native';
import ProtectedAppRoutes from "@/components/ProtectedAppRoutes";
import AuthProvider from '@/providers/auth-provider';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

ExpoSplashScreen.preventAutoHideAsync();

/** Extracts auth tokens from Supabase redirect URL (hash or query) and sets the session. */
async function createSessionFromUrl(url: string) {
	try {
		const [baseAndQuery, hashRaw = ''] = url.split('#');
		const queryRaw = baseAndQuery.includes('?') ? baseAndQuery.split('?').slice(1).join('?') : '';
		const hash = hashRaw.startsWith('?') ? hashRaw.slice(1) : hashRaw;

		const hashParams = new URLSearchParams(hash);
		const searchParams = new URLSearchParams(queryRaw);
		const get = (key: string) => hashParams.get(key) ?? searchParams.get(key) ?? null;

		const access_token = get('access_token');
		const refresh_token = get('refresh_token');
		if (!access_token || !refresh_token) return;

		const { error } = await supabase.auth.setSession({
			access_token,
			refresh_token,
		});
		if (error) throw error;
	} catch (err) {
		console.error('Error creating session from URL:', err);
	}
}

export {
	// Catch any errors thrown by the Layout component.
	ErrorBoundary
} from 'expo-router';



Sentry.init({
	dsn: 'https://091563b9a05c0524f9a8f88c750e3b55@o4509637349277697.ingest.us.sentry.io/4510425767936000',

	// Adds more context data to events (IP address, cookies, user, etc.)
	// For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
	sendDefaultPii: true,

	// Enable Logs
	enableLogs: true,

	// Configure Session Replay
	replaysSessionSampleRate: 0.1,
	replaysOnErrorSampleRate: 1,
	integrations: [
		// Sentry.mobileReplayIntegration(), 
		// Sentry.feedbackIntegration()
	],

	// uncomment the line below to enable Spotlight (https://spotlightjs.com)
	// spotlight: __DEV__,
})


function RootLayout() {
	const { colorScheme, isDarkColorScheme } = useColorScheme();
	const queryClient = new QueryClient();
	const url = Linking.useURL();

	useEffect(() => {
		ExpoSplashScreen.hideAsync();
	}, []);

	// Handle password reset deep link: extract tokens from URL and set session before auth check
	useEffect(() => {
		if (url) {
			createSessionFromUrl(url);
		}
	}, [url]);

	useEffect(() => {
		Linking.getInitialURL().then((initialUrl) => {
			if (initialUrl) {
				createSessionFromUrl(initialUrl);
			}
		});
	}, []);

	return (
		<>
			<StatusBar
				key={`root-status-bar-${isDarkColorScheme ? 'light' : 'dark'}`}
				barStyle={isDarkColorScheme ? 'light-content' : 'dark-content'}
				translucent={true}
				backgroundColor="transparent"
			/>
			<SafeAreaProvider>
				<GestureHandlerRootView style={{ flex: 1 }}>
					<View className={cn('flex-1', isDarkColorScheme && 'dark')} style={{ flex: 1 }}>
						<QueryClientProvider client={queryClient}>
							<Provider store={store}>
								<ThemeProvider value={NAV_THEME[colorScheme]}>
									<BottomSheetModalProvider>
										<AuthProvider>
											<ProtectedAppRoutes />
										</AuthProvider>
									</BottomSheetModalProvider>
								</ThemeProvider>
							</Provider>
						</QueryClientProvider>
					</View>
				</GestureHandlerRootView>
			</SafeAreaProvider>
		</>
	);
}

export default Sentry.wrap(RootLayout);
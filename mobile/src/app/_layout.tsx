import { StatusBar } from "react-native";
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
import AuthProvider from '@/providers/auth-provider'
import { useState } from "react";
import { SplashScreen } from "@/components/SplashScreenController";
import * as ExpoSplashScreen from 'expo-splash-screen';

// Prevent the splash screen from auto-hiding before asset loading is complete.
ExpoSplashScreen.preventAutoHideAsync();

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
	const [showSplash, setShowSplash] = useState(true);

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
					<QueryClientProvider client={queryClient}>
						<Provider store={store}>
							<ThemeProvider value={NAV_THEME[colorScheme]}>
								<BottomSheetModalProvider>
									<AuthProvider>
										{
											showSplash ?
												<SplashScreen onComplete={() => setShowSplash(false)} />
												:
												<ProtectedAppRoutes />
										}
									</AuthProvider>
								</BottomSheetModalProvider>
							</ThemeProvider>
						</Provider>
					</QueryClientProvider>
				</GestureHandlerRootView>
			</SafeAreaProvider >
		</>
	);
}

export default Sentry.wrap(RootLayout);
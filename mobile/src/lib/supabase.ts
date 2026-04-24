import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Get Supabase URL and Anon Key from environment variables
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
if (!supabaseUrl || !supabaseAnonKey) {
	console.warn('Supabase URL and Anon Key are required. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file or app.json');
}

/**
 * `eas update` / `expo export` builds a web bundle and runs static rendering in Node.
 * There is no `window` and AsyncStorage is not a real browser store there — Supabase
 * session init can throw. Use a no-op adapter only for that environment.
 */
const isExpoWebExportNode = Platform.OS === 'web' && typeof window === 'undefined';

const noopAuthStorage = {
	getItem: async (_key: string) => null as string | null,
	setItem: async (_key: string, _value: string) => {},
	removeItem: async (_key: string) => {},
};

const ExpoWebSecureStoreAdapter = {
	getItem: (key: string) => {
		return AsyncStorage.getItem(key);
	},
	setItem: (key: string, value: string) => {
		return AsyncStorage.setItem(key, value);
	},
	removeItem: (key: string) => {
		return AsyncStorage.removeItem(key);
	},
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		storage: isExpoWebExportNode ? noopAuthStorage : ExpoWebSecureStoreAdapter,
		autoRefreshToken: !isExpoWebExportNode,
		persistSession: !isExpoWebExportNode,
		detectSessionInUrl: false,
		flowType: 'pkce',
	},
});
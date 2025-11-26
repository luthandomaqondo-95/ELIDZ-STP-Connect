import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get Supabase URL and Anon Key from environment variables
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
	console.warn('Supabase URL and Anon Key are required. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file or app.json');
}

const ExpoWebSecureStoreAdapter = {
	getItem: (key: string) => {
		// console.debug("getItem", { key })
		return AsyncStorage.getItem(key)
	},
	setItem: (key: string, value: string) => {
		return AsyncStorage.setItem(key, value)
	},
	removeItem: (key: string) => {
		return AsyncStorage.removeItem(key)
	},
};


export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		storage: ExpoWebSecureStoreAdapter,
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: false,
	},
});


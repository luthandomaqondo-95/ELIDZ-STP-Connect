import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/use-theme-color';
import { COLORS } from '@/theme/colors';

/**
 * Auth index: redirect to welcome (onboarding) then user can go to auth-choice.
 */
export default function AuthIndexScreen() {
    const { colorScheme } = useColorScheme();
    const colors = COLORS[colorScheme ?? 'light'];

    useEffect(() => {
        router.replace('/(auth)/welcome');
    }, []);

    return (
        <View className="flex-1 bg-background items-center justify-center">
            <ActivityIndicator size="large" color={colors.primary} />
        </View>
    );
}

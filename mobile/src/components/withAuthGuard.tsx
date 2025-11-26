import React from "react";
import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuthContext } from "@/hooks/use-auth-context";
import { useColorScheme } from "@/hooks/use-theme-color";
import { NAV_THEME } from "@/theme/colors";

/**
 * Higher-Order Component that wraps a screen with authentication protection.
 * If the user is not authenticated, they are redirected to the auth screens.
 */
export function withAuthGuard<P extends object>(
    WrappedComponent: React.ComponentType<P>
): React.FC<P> {
    return function AuthGuardedComponent(props: P) {
        const { isLoggedIn, isLoading } = useAuthContext();
        const { colorScheme } = useColorScheme();
        const theme = NAV_THEME[colorScheme];

        if (isLoading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            );
        }

        if (!isLoggedIn) {
            return <Redirect href="/(auth)" />;
        }

        return <WrappedComponent {...props} />;
    };
}

/**
 * Hook version for use within components
 * Returns { isAllowed, isLoading } - use isAllowed to conditionally render
 */
export function useAuthGuard() {
    const { isLoggedIn: isAuthenticated, isLoading } = useAuthContext();
    const { colorScheme } = useColorScheme();
    const theme = NAV_THEME[colorScheme];

    return {
        isAllowed: isAuthenticated,
        isLoading,
        theme,
        LoadingComponent: () => (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        ),
        RedirectComponent: () => <Redirect href="/(auth)" />,
    };
}


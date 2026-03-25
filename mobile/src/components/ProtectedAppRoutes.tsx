import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { useAuthContext } from '@/hooks/use-auth-context'
import { View, ActivityIndicator } from "react-native";
import { useColorScheme } from "@/hooks/use-theme-color";
import { NAV_THEME } from "@/theme/index";
import * as Updates from 'expo-updates';

export default function ProtectedAppRoutes() {
    const { isLoggedIn, isLoading } = useAuthContext();
    const { colorScheme } = useColorScheme();
    const theme = NAV_THEME[colorScheme];
    const { isUpdatePending } = Updates.useUpdates();

    useEffect(() => {
        if (isUpdatePending) {
            Updates.reloadAsync().catch((error) => {
                console.warn('Failed to reload app after OTA update download:', error);
            });
        }
    }, [isUpdatePending]);

    // Show loading indicator while checking auth state
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

            <Stack.Screen name="change-password" options={{ title: 'Change Password', headerShown: false }} />

            <Stack.Protected guard={!isLoggedIn} >
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            </Stack.Protected>

            {/* Standalone protected screens - each uses withAuthGuard HOC for auth protection */}
            <Stack.Screen name="opportunities" options={{ headerShown: false }} />
            <Stack.Screen name="opportunity-detail" options={{ title: 'Opportunity Details', headerShown: false }} />
            <Stack.Screen name="resources" options={{ title: 'Resources', headerShown: false }} />
            <Stack.Screen name="resource-detail" options={{ title: 'Resource Details', headerShown: false }} />
            <Stack.Screen name="settings" options={{ title: 'Settings', headerShown: false }} />
            <Stack.Screen name="user-profile" options={{ title: 'Profile', headerShown: false }} />
            <Stack.Screen name="edit-profile" options={{ title: 'Edit Profile', headerShown: false }} />
            <Stack.Screen name="center-detail" options={{ title: 'Center Details', headerShown: false }} />
            <Stack.Screen name="tenant-detail" options={{ title: 'Tenant Details', headerShown: false }} />
            <Stack.Screen name="news-detail" options={{ title: 'News Article', headerShown: false }} />
            <Stack.Screen name="event-detail" options={{ title: 'Event Details', headerShown: false }} />
            <Stack.Screen name="vr-tour" options={{ title: 'VR Tour', headerShown: false }} />
            <Stack.Screen name="viewer" options={{ title: '360° Viewer', headerShown: false }} />
            <Stack.Screen name="chat" options={{ title: 'Chat', headerShown: false }} />
            <Stack.Screen name="message" options={{ title: 'Messages', headerShown: false }} />
            <Stack.Screen name="opportunities-chat" options={{ title: 'Opportunities Chat', headerShown: false }} />
            <Stack.Screen name="application-form" options={{ title: 'Apply Now', headerShown: false }} />
            <Stack.Screen name="document-saver" options={{ title: 'Document Saver', headerShown: false }} />
            {/* <Stack.Screen name="dashboard" options={{ title: 'Dashboard' }} /> */}

            {/* Not Found Screen */}
            <Stack.Screen name="+not-found" />
        </Stack>
    );
}

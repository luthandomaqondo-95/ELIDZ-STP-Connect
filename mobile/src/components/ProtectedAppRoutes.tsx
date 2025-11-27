import React from "react";
import { Stack } from "expo-router";
import { useAuthContext } from '@/hooks/use-auth-context'
import { View, ActivityIndicator } from "react-native";
import { useColorScheme } from "@/hooks/use-theme-color";
import { NAV_THEME } from "@/theme/index";

export default function ProtectedAppRoutes() {
    const { isLoggedIn, isLoading } = useAuthContext();
    const { colorScheme } = useColorScheme();
    const theme = NAV_THEME[colorScheme];

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


            <Stack.Protected guard={!isLoggedIn} >
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)/welcome" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)/auth-choice" options={{ headerShown: false }} />
            </Stack.Protected>

            {/* Standalone protected screens - each uses withAuthGuard HOC for auth protection */}
            <Stack.Screen name="opportunities" options={{ title: 'Opportunities', headerShown: true }} />
            <Stack.Screen name="opportunity-detail" options={{ title: 'Opportunity Details', headerShown: false }} />
            <Stack.Screen name="resources" options={{ title: 'Resources', headerShown: true }} />
            <Stack.Screen name="resource-detail" options={{ title: 'Resource Details', headerShown: true }} />
            <Stack.Screen name="settings" options={{ title: 'Settings', headerShown: true }} />
            <Stack.Screen name="user-profile" options={{ title: 'Profile', headerShown: true }} />
            <Stack.Screen name="edit-profile" options={{ title: 'Edit Profile', headerShown: false }} />
            <Stack.Screen name="center-detail" options={{ title: 'Center Details', headerShown: false }} />
            <Stack.Screen name="tenant-detail" options={{ title: 'Tenant Details', headerShown: false }} />
            <Stack.Screen name="news-detail" options={{ title: 'News Article', headerShown: true }} />
            <Stack.Screen name="event-detail" options={{ title: 'Event Details', headerShown: true }} />
            <Stack.Screen name="vr-tours" options={{ title: 'VR Tours', headerShown: true }} />
            <Stack.Screen name="vr-tour" options={{ title: 'VR Tour', headerShown: false }} />
            <Stack.Screen name="chat" options={{ title: 'Chat', headerShown: true }} />
            <Stack.Screen name="message" options={{ title: 'Messages', headerShown: true }} />
            <Stack.Screen name="opportunities-chat" options={{ title: 'Opportunities Chat', headerShown: true }} />
            <Stack.Screen name="application-form" options={{ title: 'Apply Now', headerShown: true }} />
            <Stack.Screen name="document-saver" options={{ title: 'Document Saver', headerShown: true }} />
            {/* <Stack.Screen name="dashboard" options={{ title: 'Dashboard' }} /> */}

            {/* Not Found Screen */}
            <Stack.Screen name="+not-found" />
        </Stack>
    );
}

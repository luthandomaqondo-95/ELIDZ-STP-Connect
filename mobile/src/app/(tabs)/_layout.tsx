import React from 'react';
import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useColorScheme } from '@/hooks/use-theme-color';
import { NAV_THEME } from '@/theme/colors';
import { HeaderAvatar } from '@/components/HeaderAvatar';

export default function TabLayout() {
    const { colorScheme } = useColorScheme();
    const theme = NAV_THEME[colorScheme];

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                headerStyle: {
                    backgroundColor: theme.colors.background,
                },
                headerTintColor: theme.colors.text,
                tabBarStyle: {
                    backgroundColor: theme.colors.background,
                    borderTopColor: theme.colors.border,
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textSecondary,
                headerRight: () => <HeaderAvatar />,
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <Feather name="home" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="services"
                options={{
                    title: 'Services',
                    tabBarIcon: ({ color }) => <Feather name="grid" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="news"
                options={{
                    title: 'News',
                    tabBarIcon: ({ color }) => <Feather name="file-text" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="verified-smmes"
                options={{
                    title: 'Verified SMMEs',
                    tabBarLabel: "SMME's",
                    tabBarIcon: ({ color }) => <Feather name="shield" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="messages"
                options={{
                    title: 'Messages',
                    tabBarIcon: ({ color }) => <Feather name="message-circle" size={24} color={color} />,
                }}
            />
            
            {/* Hidden Tabs (accessible via navigation but not on the tab bar) */}
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    href: null,
                }}
            />
            <Tabs.Screen
                name="vr-tours"
                options={{
                    title: 'Virtual Tours',
                    href: null,
                }}
            />
        </Tabs>
    );
}

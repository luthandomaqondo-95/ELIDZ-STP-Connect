import React, { useEffect, useState } from 'react';
import { Pressable, View, Text } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuthContext } from '@/hooks/use-auth-context';
import { notificationService } from '@/services/notification.service';
import { cn } from '@/lib/utils';

export const HeaderNotificationIcon = ({
    className = ""
}: {
    className?: string;
}) => {
    const { profile, isLoggedIn } = useAuthContext();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!isLoggedIn || !profile?.id) {
            setUnreadCount(0);
            return;
        }

        // Load unread count
        const loadUnreadCount = async () => {
            try {
                const count = await notificationService.getUnreadCount(profile.id);
                setUnreadCount(count);
            } catch (error) {
                console.error('Error loading unread count:', error);
            }
        };

        loadUnreadCount();

        // Refresh count every 30 seconds
        const interval = setInterval(loadUnreadCount, 30000);

        return () => {
            clearInterval(interval);
        };
    }, [profile?.id, isLoggedIn]);

    if (!isLoggedIn) return null;

    return (
        <Pressable
            onPress={() => router.push('/(tabs)/notifications')}
            className={cn("relative active:opacity-70 mr-3", className)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
            <Feather name="bell" size={20} color="#1F2937" />
            {unreadCount > 0 && (
                <View className="absolute -top-1 -right-1 bg-[#FF6600] rounded-full justify-center items-center min-w-[18px] px-1 h-[18px]">
                    <Text className="text-white text-[10px] font-bold">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                </View>
            )}
        </Pressable>
    );
};


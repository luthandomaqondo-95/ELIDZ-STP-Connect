import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useAuthContext } from '@/hooks/use-auth-context';
import { notificationService } from '@/services/notification.service';

interface NotificationBadgeProps {
    size?: number;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ size = 8 }) => {
    const { profile } = useAuthContext();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!profile?.id) {
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
    }, [profile?.id]);

    if (unreadCount === 0) return null;

    return (
        <View
            className="absolute -top-1 -right-1 bg-[#FF6600] rounded-full justify-center items-center min-w-[18px] px-1"
            style={{ height: size * 2.25 }}
        >
            <Text className="text-white text-[10px] font-bold">
                {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
        </View>
    );
};


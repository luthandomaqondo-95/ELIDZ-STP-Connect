import React, { useState, useEffect } from 'react';
import { View, Pressable, ScrollView, RefreshControl, Alert, Dimensions } from 'react-native';
import { Text } from '@/components/ui/text';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthContext } from '@/hooks/use-auth-context';
import { notificationService, Notification, NotificationType } from '@/services/notification.service';
import { TabsLayoutHeader } from '@/components/Header';
import { ScreenScrollView } from '@/components/ScreenScrollView';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function NotificationsScreen() {
    const { profile, isLoggedIn } = useAuthContext();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (profile?.id) {
            loadNotifications();
            loadUnreadCount();
        }
    }, [profile?.id]);

    const loadNotifications = async () => {
        if (!profile?.id) return;
        
        try {
            setLoading(true);
            const data = await notificationService.getNotifications(profile.id);
            setNotifications(data);
        } catch (error) {
            console.error('Error loading notifications:', error);
            Alert.alert('Error', 'Failed to load notifications. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const loadUnreadCount = async () => {
        if (!profile?.id) return;
        
        try {
            const count = await notificationService.getUnreadCount(profile.id);
            setUnreadCount(count);
        } catch (error) {
            console.error('Error loading unread count:', error);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([loadNotifications(), loadUnreadCount()]);
    };

    const handleMarkAsRead = async (notification: Notification) => {
        if (!profile?.id || notification.read_at) return;

        try {
            await notificationService.markAsRead(notification.id, profile.id);
            // Update local state
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notification.id
                        ? { ...n, read_at: new Date().toISOString() }
                        : n
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        if (!profile?.id || unreadCount === 0) return;

        try {
            await notificationService.markAllAsRead(profile.id);
            // Update local state
            setNotifications(prev =>
                prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
            Alert.alert('Error', 'Failed to mark all notifications as read.');
        }
    };

    const handleDelete = async (notification: Notification) => {
        if (!profile?.id) return;

        Alert.alert(
            'Delete Notification',
            'Are you sure you want to delete this notification?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await notificationService.deleteNotification(notification.id, profile.id);
                            setNotifications(prev => prev.filter(n => n.id !== notification.id));
                            if (!notification.read_at) {
                                setUnreadCount(prev => Math.max(0, prev - 1));
                            }
                        } catch (error) {
                            console.error('Error deleting notification:', error);
                            Alert.alert('Error', 'Failed to delete notification.');
                        }
                    },
                },
            ]
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 8640000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const renderNotification = (notification: Notification) => {
        const isUnread = !notification.read_at;
        const icon = notificationService.getNotificationIcon(notification.type);
        const color = notificationService.getNotificationColor(notification.type);

        return (
            <Pressable
                key={notification.id}
                onPress={() => handleMarkAsRead(notification)}
                className={`bg-card mb-3 rounded-2xl border ${isUnread ? 'border-[#FF6600]/50 border-l-4' : 'border-border'} shadow-sm overflow-hidden active:opacity-95`}
            >
                <View className="p-4">
                    <View className="flex-row items-start">
                        <View
                            className="w-12 h-12 rounded-full justify-center items-center mr-3"
                            style={{ backgroundColor: `${color}20` }}
                        >
                            <Feather name={icon as any} size={20} color={color} />
                        </View>
                        <View className="flex-1">
                            <View className="flex-row items-start justify-between mb-1">
                                <Text className={`text-base font-bold flex-1 ${isUnread ? 'text-foreground' : 'text-foreground/80'}`}>
                                    {notification.title}
                                </Text>
                                {isUnread && (
                                    <View className="w-2.5 h-2.5 rounded-full bg-[#FF6600] ml-2 mt-1" />
                                )}
                            </View>
                            <Text className={`text-sm mb-2 ${isUnread ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {notification.message}
                            </Text>
                            <View className="flex-row items-center justify-between">
                                <Text className="text-xs text-muted-foreground">
                                    {formatDate(notification.created_at)}
                                </Text>
                                <Pressable
                                    onPress={() => handleDelete(notification)}
                                    className="p-2"
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                >
                                    <Feather name="trash-2" size={16} color="#EF4444" />
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </View>
            </Pressable>
        );
    };

    if (!isLoggedIn || !profile) {
        return (
            <View className="flex-1 bg-background">
                <View className="pt-12 pb-6 mb-6 bg-background">
                    <TabsLayoutHeader title="Notifications" />
                    <View 
                        style={{ paddingHorizontal: isTablet ? 24 : 20, maxWidth: isTablet ? 1200 : '100%', alignSelf: 'center', width: '100%' }}
                    >
                        <Text className="text-muted-foreground" style={{ fontSize: isTablet ? 14 : 14 }}>
                            Stay updated with important communications.
                        </Text>
                    </View>
                </View>
                <View className="mx-5 p-5 rounded-2xl bg-card border border-border shadow-sm">
                    <View className="flex-row items-center mb-2">
                        <View className="bg-[#FF6600]/10 p-2 rounded-full mr-3">
                            <Feather name="lock" size={18} color="#FF6600" />
                        </View>
                        <Text className="text-foreground text-lg font-bold">
                            Sign In Required
                        </Text>
                    </View>
                    <Text className="text-muted-foreground text-sm mb-4 ml-1">
                        Please sign in to view your notifications.
                    </Text>
                    <Pressable
                        className="bg-[#002147] py-3 px-4 rounded-xl items-center active:opacity-90"
                        onPress={() => router.push('/(auth)')}
                    >
                        <Text className="text-white font-bold text-sm">
                            Sign In
                        </Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-background">
            <ScreenScrollView
                contentContainerStyle={{ paddingBottom: 40 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            >
                {/* Header */}
                <View className="pt-12 pb-6 bg-background">
                    <TabsLayoutHeader title="Notifications" />
                    <View 
                        style={{ paddingHorizontal: isTablet ? 24 : 20, maxWidth: isTablet ? 1200 : '100%', alignSelf: 'center', width: '100%' }}
                    >
                        <Text className="text-muted-foreground" style={{ fontSize: isTablet ? 14 : 14 }}>
                            {unreadCount > 0
                                ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                                : 'All caught up!'}
                        </Text>

                        {/* Mark All as Read Button */}
                        {unreadCount > 0 && (
                            <Pressable
                                onPress={handleMarkAllAsRead}
                                className="bg-muted border border-border px-4 py-2 rounded-xl self-start active:opacity-80 mt-4"
                            >
                                <View className="flex-row items-center">
                                    <Feather name="check" size={16} color="#1F2937" />
                                    <Text className="text-foreground text-sm font-semibold ml-2">
                                        Mark All as Read
                                    </Text>
                                </View>
                            </Pressable>
                        )}
                    </View>
                </View>

                {/* Notifications List */}
                <View 
                  className="mt-6"
                  style={{ 
                    paddingHorizontal: isTablet ? 24 : 20,
                    maxWidth: isTablet ? 1200 : '100%',
                    alignSelf: 'center',
                    width: '100%'
                  }}
                >
                    {loading ? (
                        <View className="items-center py-12">
                            <Text className="text-muted-foreground">Loading notifications...</Text>
                        </View>
                    ) : notifications.length === 0 ? (
                        <View className="items-center py-12 bg-card rounded-2xl border border-border border-dashed">
                            <Feather name="bell-off" size={48} color="#CBD5E0" />
                            <Text className="text-muted-foreground text-base mt-4 text-center font-medium">
                                No notifications yet
                            </Text>
                            <Text className="text-muted-foreground text-sm mt-2 text-center">
                                You'll see important updates and communications here
                            </Text>
                        </View>
                    ) : (
                        notifications.map(renderNotification)
                    )}
                </View>
            </ScreenScrollView>
        </View>
    );
}


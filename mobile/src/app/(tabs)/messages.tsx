import React, { useState, useMemo, useEffect } from 'react';
import { View, TextInput, Pressable, ScrollView, Alert, Dimensions, Image } from 'react-native';
import { Text } from '@/components/ui/text';
import { useAuthContext } from '../../hooks/use-auth-context';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { chatService, ChatWithDetails } from '@/services/chat.service';
import { connectionService, ContactWithConnection, ConnectionRequest } from '@/services/connection.service';
import { withAuthGuard } from '@/components/withAuthGuard';
import { useContactsSearch, useChatSearch } from '@/hooks/useSearch';
import { useDebounce } from '@/hooks/useDebounce';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { TabsLayoutHeader } from '@/components/Header';
import { useColorScheme } from '@/hooks/use-theme-color';
import { COLORS } from '@/theme/colors';
import { ListSkeleton } from '@/components/Loading';
import { useAvatarUri } from '@/hooks/use-avatar-uri';
import { DEFAULT_AVATAR } from '@/constants/avatars';

const { width } = Dimensions.get('window');

function ContactAvatar({ avatar, size = 48 }: { avatar?: string; size?: number }) {
    const { uri } = useAvatarUri(avatar);
    const source = uri ? { uri } : DEFAULT_AVATAR;
    return (
        <Image
            source={source as any}
            style={{ width: size, height: size, borderRadius: size / 2 }}
            resizeMode="cover"
        />
    );
}
const isTablet = width >= 768;

type UserRole = 'Entrepreneur' | 'Researcher' | 'SMME' | 'Student' | 'Investor' | 'Tenant';

type TabType = 'messages' | 'requests' | 'discover';

function MessagesScreen() {
    const params = useLocalSearchParams<{ tab?: string }>();
    const { colorScheme } = useColorScheme();
    const colors = COLORS[colorScheme ?? 'light'];
    const isDarkMode = colorScheme === 'dark';
    const { profile, isLoggedIn } = useAuthContext();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRole, setSelectedRole] = useState<UserRole | 'All'>('All');
    const initialTabParam = (params.tab as TabType | undefined) ?? 'messages';
    const [activeTab, setActiveTab] = useState<TabType>(
        initialTabParam === 'requests' || initialTabParam === 'discover' ? initialTabParam : 'messages'
    );
    const queryClient = useQueryClient();

    const debouncedSearch = useDebounce(searchQuery, 300);

    const { data: contacts, isLoading: contactsLoading } = useContactsSearch(profile?.id || '', debouncedSearch);
    const { data: chats, isLoading: chatsLoading } = useChatSearch(profile?.id || '', debouncedSearch);

    const loading = contactsLoading || chatsLoading;

    useEffect(() => {
        if (!profile?.id) return;

        // Subscribe to new messages to update the list in real-time
        let invalidationTimeout: ReturnType<typeof setTimeout>;
        let connectionsTimeout: ReturnType<typeof setTimeout>;

        const channel = supabase
            .channel('public:messages-and-connections')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages' },
                () => {
                    // Invalidate on any new message (sent or received) so last message preview and unread badge update immediately
                    clearTimeout(invalidationTimeout);
                    invalidationTimeout = setTimeout(() => {
                        queryClient.invalidateQueries({ queryKey: ['contacts'] });
                        queryClient.invalidateQueries({ queryKey: ['chats'] });
                    }, 300);
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'messages' },
                () => {
                    // When messages are marked read (read_at updated), refresh to clear unread badge
                    clearTimeout(invalidationTimeout);
                    invalidationTimeout = setTimeout(() => {
                        queryClient.invalidateQueries({ queryKey: ['contacts'] });
                        queryClient.invalidateQueries({ queryKey: ['chats'] });
                    }, 300);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'connections',
                },
                () => {
                    // Connection created, updated, or deleted - refetch contacts to stay in sync with Supabase
                    clearTimeout(connectionsTimeout);
                    connectionsTimeout = setTimeout(() => {
                        queryClient.refetchQueries({ queryKey: ['contacts'] });
                    }, 300);
                }
            )
            .subscribe();

        return () => {
            clearTimeout(invalidationTimeout);
            clearTimeout(connectionsTimeout);
            supabase.removeChannel(channel);
        };
    }, [profile?.id, queryClient]);

    const roles: (UserRole | 'All')[] = useMemo(() => {
        if (!contacts) return ['All'];
        const roleSet = new Set<UserRole>();
        contacts.forEach(contact => {
            if (contact.role) {
                roleSet.add(contact.role as UserRole);
            }
        });
        return ['All', ...Array.from(roleSet).sort()];
    }, [contacts]);

    // Filter contacts based on role (search is handled by hook)
    const filteredContacts = useMemo(() => {
        if (!contacts) return [];
        return contacts.filter((contact) => {
            const matchesRole = selectedRole === 'All' || contact.role === selectedRole;
            return matchesRole;
        });
    }, [contacts, selectedRole]);

    // Separate contacts by connection status
    const connectedContacts = filteredContacts.filter(c => c.connectionStatus === 'connected');
    const pendingSentContacts = filteredContacts.filter(c => c.connectionStatus === 'pending_sent');
    const pendingReceivedContacts = filteredContacts.filter(c => c.connectionStatus === 'pending_received');
    const availableContacts = filteredContacts.filter(c => c.connectionStatus === 'available');

    function getRoleColor(role: UserRole): string {
        const roleColors: Record<UserRole, string> = {
            Entrepreneur: colors.constructive,
            Researcher: colors.primary,
            SMME: colors.accent,
            Student: colors.purple,
            Investor: colors.pink,
            Tenant: colors.teal,
        };
        return roleColors[role] || colors.primary;
    }

    function getRoleIcon(role: UserRole): string {
        const roleIcons: Record<UserRole, string> = {
            Entrepreneur: 'zap',
            Researcher: 'search',
            SMME: 'briefcase',
            Student: 'book-open',
            Investor: 'trending-up',
            Tenant: 'home',
        };
        return roleIcons[role] || 'user';
    }

    async function handleConnect(contact: ContactWithConnection) {
        if (!isLoggedIn || !profile) {
            Alert.alert('Sign Up Required', 'Please sign up to connect with other users.');
            return;
        }
        try {
            await connectionService.sendConnectionRequest(profile.id, contact.id);
            Alert.alert('Success', `Connection request sent to ${contact.name}!`);
            queryClient.invalidateQueries({ queryKey: ['contacts'] });
        } catch (error: any) {
            console.error('Error sending connection request:', error);
            Alert.alert('Error', error.message || 'Failed to send connection request.');
        }
    }

    async function handleAcceptConnection(contact: ContactWithConnection) {
        if (!profile?.id || !contact.connectionId) {
            Alert.alert('Error', 'Unable to accept this connection right now.');
            return;
        }

        try {
            await connectionService.acceptConnectionRequest(contact.connectionId);

            // Create (or reuse) a direct chat so the conversation
            // immediately appears in the Messages tab.
            try {
                const chat = await chatService.createDirectChat(profile.id, contact.id);

                // Switch to Messages tab and refresh lists so the new chat is visible
                setActiveTab('messages');
                queryClient.invalidateQueries({ queryKey: ['contacts', profile.id] });
                queryClient.invalidateQueries({ queryKey: ['chats', profile.id] });

                Alert.alert(
                    'Success',
                    `You are now connected with ${contact.name}! A conversation has been created in Messages.`,
                    [
                        {
                            text: 'Open Chat',
                            onPress: () => {
                                router.push(`/message?chatId=${chat.id}&userName=${encodeURIComponent(contact.name)}`);
                            },
                        },
                        { text: 'OK' },
                    ]
                );
            } catch (chatError: any) {
                console.error('Error creating chat after accepting connection:', chatError);
                // Even if chat creation fails, keep the connection accepted
                setActiveTab('messages');
                queryClient.invalidateQueries({ queryKey: ['contacts', profile.id] });
                queryClient.invalidateQueries({ queryKey: ['chats', profile.id] });
                Alert.alert(
                    'Connection Accepted',
                    `You are now connected with ${contact.name}, but we could not start a conversation automatically. You can start one from the Messages tab.`
                );
            }
        } catch (error: any) {
            console.error('Error accepting connection:', error);
            Alert.alert('Error', error.message || 'Failed to accept connection request.');
        }
    }

    async function handleDeclineConnection(connectionId: string, userName: string) {
        try {
            await connectionService.declineConnectionRequest(connectionId);
            Alert.alert('Request Declined', `Connection request from ${userName} has been declined.`);
            queryClient.invalidateQueries({ queryKey: ['contacts'] });
        } catch (error: any) {
            console.error('Error declining connection:', error);
            Alert.alert('Error', error.message || 'Failed to decline connection request.');
        }
    }

    async function handleCancelRequest(connectionId: string, userName: string) {
        const userId = profile?.id;
        try {
            // 1. Delete from Supabase (source of truth)
            await connectionService.cancelConnectionRequest(connectionId);

            // 2. Optimistically update cache - move contact from pending_sent to available
            if (userId) {
                queryClient.setQueriesData(
                    { queryKey: ['contacts'] },
                    (old: ContactWithConnection[] | undefined) => {
                        if (!Array.isArray(old)) return old;
                        return old.map((c) =>
                            c.connectionId === connectionId
                                ? { ...c, connectionStatus: 'available' as const, connectionId: undefined }
                                : c
                        );
                    }
                );
            }
            // 3. Switch to Discover tab immediately so user sees the updated list
            setActiveTab('discover');

            // 4. Show alert - refetch ONLY when user dismisses, so we don't overwrite optimistic update with stale data
            Alert.alert(
                'Request Cancelled',
                `Connection request to ${userName} has been cancelled.`,
                [
                    {
                        text: 'OK',
                        onPress: async () => {
                            setActiveTab('discover');
                            await queryClient.refetchQueries({ queryKey: ['contacts'] });
                        },
                    },
                ]
            );
        } catch (error: any) {
            console.error('Error cancelling connection request:', error);
            Alert.alert('Error', error.message || 'Failed to cancel connection request.');
        }
    }

    async function handleMessage(contact: ContactWithConnection) {
        if (contact.connectionStatus !== 'connected') {
            Alert.alert('Connection Required', 'You need to be connected first before messaging.');
            return;
        }
        try {
            const chat = await chatService.createDirectChat(profile!.id, contact.id);
            router.push(`/message?chatId=${chat.id}&userName=${encodeURIComponent(contact.name)}`);
        } catch (error: any) {
            console.error('Error creating chat:', error);
            Alert.alert('Error', error.message || 'Failed to start conversation.');
        }
    }

    function renderChat(chat: ChatWithDetails) {
        const displayName = chat.type === 'direct' && chat.otherUser
            ? chat.otherUser.name
            : chat.name || 'Group Chat';

        const role = chat.type === 'direct' && chat.otherUser
            ? chat.otherUser.role as UserRole
            : 'Entrepreneur'; // Default for group chats

        const formatTimeAgo = (dateString: string) => {
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return `${diffMins}m ago`;
            if (diffHours < 24) return `${diffHours}h ago`;
            if (diffDays < 7) return `${diffDays}d ago`;
            return date.toLocaleDateString();
        };

        return (
            <Pressable
                key={chat.id}
                className="bg-card mb-3 rounded-2xl border border-border shadow-sm overflow-hidden active:opacity-95"
                onPress={() => {
                    const userName = chat.type === 'direct' && chat.otherUser ? chat.otherUser.name : displayName;
                    router.push(`/message?chatId=${chat.id}&userName=${encodeURIComponent(userName)}`);
                }}
            >
                <View className="flex-row items-center p-4">
                    <View className="relative">
                        <View className="w-12 h-12 rounded-full overflow-hidden justify-center items-center">
                            <ContactAvatar avatar={chat.type === 'direct' ? chat.otherUser?.avatar : undefined} size={48} />
                        </View>
                        {chat.unreadCount !== undefined && chat.unreadCount > 0 &&
                         chat.lastMessage?.sender_id !== profile?.id && (
                            <View className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full justify-center items-center">
                                <Text className="text-white text-xs font-bold">{chat.unreadCount}</Text>
                            </View>
                        )}
                    </View>

                    <View className="flex-1 ml-3">
                        <View className="flex-row items-center justify-between mb-1">
                            <Text className="text-base font-bold text-foreground flex-1" numberOfLines={1}>
                                {displayName}
                            </Text>
                            {chat.lastMessage && (
                                <Text className="text-xs text-muted-foreground ml-2">
                                    {formatTimeAgo(chat.lastMessage.created_at)}
                                </Text>
                            )}
                        </View>

                        <View className="flex-row items-center mb-1.5">
                            <View
                                className="flex-row items-center px-2 py-0.5 rounded-md"
                                style={{
                                    backgroundColor: isDarkMode ? getRoleColor(role) : getRoleColor(role) + '10',
                                }}
                            >
                                <Feather
                                    name={getRoleIcon(role) as any}
                                    size={10}
                                    color={isDarkMode ? colors.white : getRoleColor(role)}
                                />
                                <Text
                                    className="text-[10px] font-medium ml-1"
                                    style={{ color: isDarkMode ? colors.white : getRoleColor(role) }}
                                >
                                    {chat.type === 'direct' ? role : 'Group'}
                                </Text>
                            </View>
                            {chat.type === 'direct' && chat.otherUser?.organization && (
                                <Text className="text-muted-foreground text-xs ml-2" numberOfLines={1}>
                                    • {chat.otherUser.organization}
                                </Text>
                            )}
                        </View>

                        {chat.lastMessage ? (
                            <Text
                                className={`text-sm ${
                                    chat.lastMessage.sender_id === profile?.id
                                        ? 'text-muted-foreground'
                                        : chat.unreadCount && chat.unreadCount > 0
                                            ? 'text-foreground font-semibold'
                                            : 'text-muted-foreground'
                                }`}
                                numberOfLines={1}
                            >
                                {chat.lastMessage.content
                                    || (chat.lastMessage.attachment_url
                                        ? (chat.lastMessage.attachment_type === 'image'
                                            ? 'Photo'
                                            : chat.lastMessage.attachment_type === 'video'
                                                ? 'Video'
                                                : chat.lastMessage.attachment_type === 'audio'
                                                    ? 'Audio'
                                                    : 'Document')
                                        : '')}
                            </Text>
                        ) : (
                            <Text className="text-xs text-muted-foreground italic">
                                No messages yet
                            </Text>
                        )}
                    </View>

                    {chat.unreadCount !== undefined && chat.unreadCount > 0 &&
                     chat.lastMessage?.sender_id !== profile?.id && (
                        <View className="w-2.5 h-2.5 rounded-full bg-accent ml-2" />
                    )}
                </View>
            </Pressable>
        );
    }


    function renderContact(contact: ContactWithConnection) {
        return (
            <Pressable
                key={contact.id}
                className="bg-card mb-3 rounded-2xl border border-border shadow-sm overflow-hidden active:opacity-95"
                onPress={() => {
                    if (contact.connectionStatus === 'connected') {
                        handleMessage(contact);
                    } else {
                        // Navigate to user profile for connection
                        router.push(`/user-profile?id=${contact.id}`);
                    }
                }}
            >
                <View className="flex-row items-center p-4">
                    <View className="relative">
                        <View className="w-12 h-12 rounded-full overflow-hidden">
                            <ContactAvatar avatar={contact.avatar} size={48} />
                        </View>
                    </View>

                    <View className="flex-1 ml-3">
                        <View className="flex-row items-center mb-1">
                            <Text className="text-base font-bold text-foreground flex-1" numberOfLines={1}>
                                {contact.name}
                            </Text>
                            {contact.connectionStatus === 'pending_sent' && (
                                <Pressable
                                    className="ml-2 w-9 h-9 rounded-full justify-center items-center"
                                    style={{ backgroundColor: colors.destructive }}
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        if (contact.connectionId) handleCancelRequest(contact.connectionId, contact.name);
                                    }}
                                    hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                                >
                                    <Feather name="x" size={18} color="white" />
                                </Pressable>
                            )}
                            {contact.lastMessageTime && (
                                <Text className="text-xs text-muted-foreground ml-2">
                                    {contact.lastMessageTime}
                                </Text>
                            )}
                        </View>

                        <View className="flex-row items-center mb-1.5">
                            <View
                                className="flex-row items-center px-2 py-0.5 rounded-md"
                                style={{
                                    backgroundColor: isDarkMode
                                        ? getRoleColor(contact.role as UserRole)
                                        : getRoleColor(contact.role as UserRole) + '10',
                                }}
                            >
                                <Feather
                                    name={getRoleIcon(contact.role as UserRole) as any}
                                    size={10}
                                    color={isDarkMode ? colors.white : getRoleColor(contact.role as UserRole)}
                                />
                                <Text
                                    className="text-[10px] font-medium ml-1"
                                    style={{ color: isDarkMode ? colors.white : getRoleColor(contact.role as UserRole) }}
                                >
                                    {contact.role}
                                </Text>
                            </View>
                        </View>

                        <Text className="text-muted-foreground text-xs" numberOfLines={1}>
                            {contact.organization || 'No organization'}
                        </Text>

                        {contact.lastMessage ? (
                            <Text className={`text-sm ${contact.hasUnreadMessages ? 'text-foreground font-semibold' : 'text-muted-foreground'}`} numberOfLines={1}>
                                {contact.lastMessage}
                            </Text>
                        ) : (
                            <Text className="text-xs text-muted-foreground italic"></Text>
                        )}
                    </View>

                    {contact.hasUnreadMessages && (
                        <View className="w-2.5 h-2.5 rounded-full bg-accent ml-2" />
                    )}

                    {contact.connectionStatus === 'available' && (
                        <Pressable
                            className="ml-2 px-4 py-2 rounded-full flex-row items-center active:opacity-90"
                            style={{ backgroundColor: colors.primary }}
                            onPress={() => handleConnect(contact)}
                        >
                            <Feather name="user-plus" size={14} color="white" style={{ marginRight: 6 }} />
                            <Text className="text-white text-xs font-bold">Connect</Text>
                        </Pressable>
                    )}

                    {contact.connectionStatus === 'connected' && (
                        <View className="ml-2 p-2 rounded-full" style={{ backgroundColor: colors.primary + '20' }}>
                            <Feather name="message-circle" size={20} color={colors.primary} />
                        </View>
                    )}
                </View>

                {/* Pending actions in a separate row to avoid overlapping text */}
                        {contact.connectionStatus === 'pending_received' && (
                    <View className="flex-row justify-end items-center px-4 pb-3 pt-0">
                        <Pressable
                            className="w-10 h-10 rounded-full justify-center items-center mr-2"
                            style={{ backgroundColor: colors.constructive }}
                            onPress={() => handleAcceptConnection(contact)}
                            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                        >
                            <Feather name="check" size={18} color="white" />
                        </Pressable>
                        <Pressable
                            className="w-10 h-10 rounded-full justify-center items-center"
                            style={{ backgroundColor: colors.destructive }}
                            onPress={() => handleDeclineConnection(contact.connectionId!, contact.name)}
                            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                        >
                            <Feather name="x" size={18} color="white" />
                        </Pressable>
                    </View>
                )}

            </Pressable>
        );
    }

    if (!isLoggedIn) {
         return (
            <View className="flex-1 bg-background">
                 <View className="bg-background">
                    <TabsLayoutHeader title="Network" variant="navy">
                        <View 
                            style={{ maxWidth: isTablet ? 1200 : '100%', alignSelf: 'center', width: '100%' }}
                        >
                            <Text className="text-white/80 text-base">
                                Connect with innovators and partners.
                            </Text>
                        </View>
                    </TabsLayoutHeader>
                 </View>
                 <View className="mx-5 p-5 rounded-2xl bg-card border border-border shadow-sm">
                    <View className="flex-row items-center mb-2">
                        <View className="bg-[#F38C1E]/10 p-2 rounded-full mr-3">
                            <Feather name="lock" size={18} color={colors.accent} />
                        </View>
                        <Text className="text-foreground text-lg font-bold">
                            Sign Up for Full Networking
                        </Text>
                    </View>
                    <Text className="text-muted-foreground text-sm mb-4 ml-1">
                        Create an account to connect with all users, send messages, and build your professional network.
                    </Text>
                    <Pressable
                        className="bg-primary py-3 px-4 rounded-xl items-center active:opacity-90"
                        onPress={() => router.push('/(auth)/signup')}
                    >
                        <Text className="text-white font-bold text-sm">
                            Sign Up Now
                        </Text>
                    </Pressable>
                </View>
            </View>
         )
    }

    return (
        <View className="flex-1 bg-background">
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Header */}
                <View className="bg-background">
                    <TabsLayoutHeader title="Network" variant="navy">
                        <View 
                            style={{ maxWidth: isTablet ? 1200 : '100%', alignSelf: 'center', width: '100%' }}
                        >
                            <Text className="text-white/80 text-base mb-6">
                                Connect with innovators and partners.
                            </Text>

                            {/* Search Bar */}
                            <View 
                                className="flex-row items-center bg-white/10 border border-white/20 h-12 rounded-full px-4"
                            >
                                <Feather name="search" size={20} color={colors.whiteOpacity70} />
                                <TextInput
                                    className="flex-1 ml-3 text-base text-white"
                                    placeholder="Search people, companies..."
                                    placeholderTextColor={colors.whiteOpacity50}
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                />
                            </View>
                        </View>
                    </TabsLayoutHeader>
                </View>

                {/* Tabs */}
                <View 
                  className="mt-6 mb-4"
                  style={{ 
                    paddingHorizontal: isTablet ? 24 : 20,
                    maxWidth: isTablet ? 1200 : '100%',
                    alignSelf: 'center',
                    width: '100%'
                  }}
                >
                    <View className="flex-row bg-card rounded-xl p-1 border border-border shadow-sm">
                        <Pressable
                            className={`flex-1 py-3 rounded-lg items-center ${activeTab === 'messages' ? 'bg-primary' : ''}`}
                            onPress={() => setActiveTab('messages')}
                        >
                            <Feather name="message-circle" size={18} color={activeTab === 'messages' ? colors.white : colors.iconGrayDark} />
                            <Text className={`text-xs font-semibold mt-1 ${activeTab === 'messages' ? 'text-white' : 'text-foreground'}`}>
                                Messages
                            </Text>
                            {chats && chats.some(c => (c.unreadCount || 0) > 0) && (
                                <View className="absolute -top-1 -right-1 bg-accent rounded-full px-1.5 py-0.5 min-w-[18px] items-center justify-center">
                                    <Text className="text-white text-[10px] font-bold">
                                        {chats.filter(c => (c.unreadCount || 0) > 0).length}
                                    </Text>
                                </View>
                            )}
                        </Pressable>
                        <Pressable
                            className={`flex-1 py-3 rounded-lg items-center ${activeTab === 'requests' ? 'bg-primary' : ''}`}
                            onPress={() => setActiveTab('requests')}
                        >
                            <Feather name="user-check" size={18} color={activeTab === 'requests' ? colors.white : colors.iconGrayDark} />
                            <Text className={`text-xs font-semibold mt-1 ${activeTab === 'requests' ? 'text-white' : 'text-foreground'}`}>
                                Requests
                            </Text>
                            {(pendingReceivedContacts.length + pendingSentContacts.length) > 0 && (
                                <View className="absolute -top-1 -right-1 bg-accent rounded-full px-1.5 py-0.5 min-w-[18px] items-center justify-center">
                                    <Text className="text-white text-[10px] font-bold">{pendingReceivedContacts.length + pendingSentContacts.length}</Text>
                                </View>
                            )}
                        </Pressable>
                        <Pressable
                            className={`flex-1 py-3 rounded-lg items-center ${activeTab === 'discover' ? 'bg-primary' : ''}`}
                            onPress={() => setActiveTab('discover')}
                        >
                            <Feather name="users" size={18} color={activeTab === 'discover' ? colors.white : colors.iconGrayDark} />
                            <Text className={`text-xs font-semibold mt-1 ${activeTab === 'discover' ? 'text-white' : 'text-foreground'}`}>
                                Discover
                            </Text>
                            {availableContacts.length > 0 && (
                                <View className="absolute -top-1 -right-1 bg-gray-400 rounded-full px-1.5 py-0.5 min-w-[18px] items-center justify-center">
                                    <Text className="text-white text-[10px] font-bold">{availableContacts.length}</Text>
                                </View>
                            )}
                        </Pressable>
                    </View>
                </View>

                {/* Role Filters - Only show on Discover tab */}
                {activeTab === 'discover' && (
                    <View className="mb-2">
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24 }}>
                            {roles.map((role) => (
                                <Pressable
                                    key={role}
                                    className={`px-4 py-2 rounded-full border mr-2 shadow-sm ${selectedRole === role
                                        ? 'border-primary'
                                        : 'bg-card border-border'
                                        }`}
                                    style={selectedRole === role ? { backgroundColor: colors.primary } : {}}
                                    onPress={() => setSelectedRole(role)}
                                >
                                    <Text className="text-xs font-semibold" style={{ color: selectedRole === role ? colors.white : colors.foreground }}>
                                        {role}
                                    </Text>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Content */}
                <View className="pb-6 pt-2">
                    {/* Loading State */}
                    {loading && (
                        <View className="mx-5">
                            <ListSkeleton count={3} />
                        </View>
                    )}

                    {/* Messages Tab */}
                    {!loading && activeTab === 'messages' && (
                        <View className="mb-6">
                            {chats && chats.length > 0 ? (
                                <>
                                    <View 
                                      className="flex-row items-center justify-between mb-3"
                                      style={{ 
                                        paddingHorizontal: isTablet ? 24 : 20,
                                        maxWidth: isTablet ? 1200 : '100%',
                                        alignSelf: 'center',
                                        width: '100%'
                                      }}
                                    >
                                        <Text className="text-lg font-bold text-foreground">
                                            Messages
                                        </Text>
                                        <View className="bg-muted px-2 py-0.5 rounded-full">
                                            <Text className="text-xs font-bold text-foreground">{chats.length}</Text>
                                        </View>
                                    </View>
                                    <View 
                                      style={{ 
                                        paddingHorizontal: isTablet ? 24 : 20,
                                        maxWidth: isTablet ? 1200 : '100%',
                                        alignSelf: 'center',
                                        width: '100%'
                                      }}
                                    >
                                        {chats.map(renderChat)}
                                    </View>
                                </>
                            ) : (
                                <View className="items-center py-12 mx-5 bg-card rounded-2xl border border-border border-dashed">
                                    <Feather name="message-circle" size={48} color={colors.iconGray} />
                                    <Text className="text-muted-foreground text-base mt-4 text-center font-medium">
                                        No messages yet
                                    </Text>
                                    <Text className="text-muted-foreground text-sm mt-2 text-center">
                                        Connect with people to start messaging
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Requests Tab */}
                    {!loading && activeTab === 'requests' && (
                        <View className="mb-6">
                            {pendingReceivedContacts.length > 0 && (
                                <View className="mb-6">
                                    <Text className="text-lg font-bold mx-5 mb-3 text-foreground">
                                        Received Requests ({pendingReceivedContacts.length})
                                    </Text>
                                    <View className="mx-5">
                                        {pendingReceivedContacts.map(renderContact)}
                                    </View>
                                </View>
                            )}

                            {pendingSentContacts.length > 0 && (
                                <View className="mb-6">
                                    <Text className="text-lg font-bold mx-5 mb-3 text-foreground">
                                        Sent Requests ({pendingSentContacts.length})
                                    </Text>
                                    <View className="mx-5">
                                        {pendingSentContacts.map(renderContact)}
                                    </View>
                                </View>
                            )}

                            {pendingReceivedContacts.length === 0 && pendingSentContacts.length === 0 && (
                                <View className="items-center py-12 mx-5 bg-card rounded-2xl border border-border border-dashed">
                                    <Feather name="user-check" size={48} color={colors.iconGray} />
                                    <Text className="text-muted-foreground text-base mt-4 text-center font-medium">
                                        No pending requests
                                    </Text>
                                    <Text className="text-muted-foreground text-sm mt-2 text-center">
                                        Connection requests will appear here
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Discover Tab */}
                    {!loading && activeTab === 'discover' && (
                        <View className="mb-6">
                            <View className="flex-row items-center justify-between mx-6 mb-3">
                                <Text className="text-lg font-bold text-foreground">
                                    Discover People
                                </Text>
                                {availableContacts.length > 0 && (
                                    <View className="bg-muted px-2 py-0.5 rounded-full">
                                        <Text className="text-xs font-bold text-foreground">{availableContacts.length}</Text>
                                    </View>
                                )}
                            </View>

                            {availableContacts.length > 0 ? (
                                <View className="mx-5">
                                    {availableContacts.map(renderContact)}
                                </View>
                            ) : (
                                <View className="items-center py-12 mx-5 bg-card rounded-2xl border border-border border-dashed">
                                    <Feather name="users" size={48} color={colors.iconGray} />
                                    <Text className="text-muted-foreground text-base mt-4 text-center font-medium">
                                        No new people to discover
                                    </Text>
                                    <Text className="text-muted-foreground text-sm mt-2 text-center">
                                        Try adjusting your search or filters
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

export default withAuthGuard(MessagesScreen);

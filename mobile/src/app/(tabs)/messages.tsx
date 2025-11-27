import React, { useState, useMemo, useEffect } from 'react';
import { View, TextInput, Pressable, ScrollView, Alert, Dimensions } from 'react-native';
import { Text } from '@/components/ui/text';
import { useAuthContext } from '../../hooks/use-auth-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { chatService, ChatWithDetails } from '@/services/chat.service';
import { connectionService, ContactWithConnection, ConnectionRequest } from '@/services/connection.service';
import { withAuthGuard } from '@/components/withAuthGuard';
import { useContactsSearch, useChatSearch } from '@/hooks/useSearch';
import { useDebounce } from '@/hooks/useDebounce';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { HeaderAvatar } from '@/components/HeaderAvatar';
import { HeaderNotificationIcon } from '@/components/HeaderNotificationIcon';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

type UserRole = 'Entrepreneur' | 'Researcher' | 'SMME' | 'Student' | 'Investor' | 'Tenant';

type TabType = 'messages' | 'requests' | 'discover';

function MessagesScreen() {
    const { profile, isLoggedIn } = useAuthContext();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRole, setSelectedRole] = useState<UserRole | 'All'>('All');
    const [activeTab, setActiveTab] = useState<TabType>('messages');
    const queryClient = useQueryClient();

    const debouncedSearch = useDebounce(searchQuery, 300);

    const { data: contacts, isLoading: contactsLoading } = useContactsSearch(profile?.id || '', debouncedSearch);
    const { data: chats, isLoading: chatsLoading } = useChatSearch(profile?.id || '', debouncedSearch);

    const loading = contactsLoading || chatsLoading;

    useEffect(() => {
        if (!profile?.id) return;

        // Subscribe to new messages to update the list in real-time
        // Use a debounced invalidation to avoid too many refreshes
        let invalidationTimeout: ReturnType<typeof setTimeout>;
        
        const channel = supabase
            .channel('public:messages')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                },
                (payload: any) => {
                    const newMessage = payload.new;
                    // Only invalidate if message is not from current user (to avoid unnecessary refreshes)
                    if (newMessage.sender_id !== profile.id) {
                        // Debounce invalidations to avoid rapid-fire refreshes
                        clearTimeout(invalidationTimeout);
                        invalidationTimeout = setTimeout(() => {
                            queryClient.invalidateQueries({ queryKey: ['contacts'] });
                            queryClient.invalidateQueries({ queryKey: ['chats'] });
                        }, 500); // Wait 500ms for potential batch of messages
                    }
                }
            )
            .subscribe();

        return () => {
            clearTimeout(invalidationTimeout);
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
            Entrepreneur: '#28A745', // Green
            Researcher: '#002147',   // Navy Blue
            SMME: '#FF6600',          // Orange
            Student: '#6F42C1',      // Purple
            Investor: '#E83E8C',     // Pink
            Tenant: '#17A2B8',       // Teal
        };
        return roleColors[role] || '#002147';
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

    async function handleAcceptConnection(connectionId: string, userName: string) {
        try {
            await connectionService.acceptConnectionRequest(connectionId);
            Alert.alert('Success', `You are now connected with ${userName}!`);
            queryClient.invalidateQueries({ queryKey: ['contacts'] });
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

        const initials = displayName
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);

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
                        <View
                            className="w-12 h-12 rounded-full justify-center items-center"
                            style={{ backgroundColor: getRoleColor(role) + '20' }}
                        >
                            <Text className="text-base font-bold" style={{ color: getRoleColor(role) }}>
                                {initials}
                            </Text>
                        </View>
                        {chat.unreadCount !== undefined && chat.unreadCount > 0 && (
                            <View className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF6600] rounded-full justify-center items-center">
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
                                style={{ backgroundColor: getRoleColor(role) + '10' }}
                            >
                                <Feather name={getRoleIcon(role) as any} size={10} color={getRoleColor(role)} />
                                <Text className="text-[10px] font-medium ml-1" style={{ color: getRoleColor(role) }}>
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
                            <Text className={`text-sm ${chat.unreadCount && chat.unreadCount > 0 ? 'text-foreground font-semibold' : 'text-muted-foreground'}`} numberOfLines={1}>
                                {chat.lastMessage.content}
                            </Text>
                        ) : (
                            <Text className="text-xs text-muted-foreground italic">
                                No messages yet
                            </Text>
                        )}
                    </View>

                    {chat.unreadCount !== undefined && chat.unreadCount > 0 && (
                        <View className="w-2.5 h-2.5 rounded-full bg-[#FF6600] ml-2" />
                    )}
                </View>
            </Pressable>
        );
    }


    function renderContact(contact: ContactWithConnection) {
        const initials = contact.name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);

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
                        <View
                            className="w-12 h-12 rounded-full justify-center items-center"
                            style={{ backgroundColor: getRoleColor(contact.role as UserRole) + '20' }}
                        >
                            <Text className="text-base font-bold" style={{ color: getRoleColor(contact.role as UserRole) }}>
                                {initials}
                            </Text>
                        </View>
                    </View>

                    <View className="flex-1 ml-3">
                        <View className="flex-row items-center justify-between mb-1">
                            <Text className="text-base font-bold text-foreground flex-1" numberOfLines={1}>
                                {contact.name}
                            </Text>
                            {contact.lastMessageTime && (
                                <Text className="text-xs text-muted-foreground ml-2">
                                    {contact.lastMessageTime}
                                </Text>
                            )}
                        </View>

                        <View className="flex-row items-center mb-1.5">
                            <View
                                className="flex-row items-center px-2 py-0.5 rounded-md"
                                style={{ backgroundColor: getRoleColor(contact.role as UserRole) + '10' }}
                            >
                                <Feather name={getRoleIcon(contact.role as UserRole) as any} size={10} color={getRoleColor(contact.role as UserRole)} />
                                <Text className="text-[10px] font-medium ml-1" style={{ color: getRoleColor(contact.role as UserRole) }}>
                                    {contact.role}
                                </Text>
                            </View>
                            <Text className="text-muted-foreground text-xs ml-2" numberOfLines={1}>
                                • {contact.organization || 'No organization'}
                            </Text>
                        </View>

                        {contact.lastMessage ? (
                            <Text className={`text-sm ${contact.hasUnreadMessages ? 'text-foreground font-semibold' : 'text-muted-foreground'}`} numberOfLines={1}>
                                {contact.lastMessage}
                            </Text>
                        ) : (
                            <Text className="text-xs text-muted-foreground italic">
                                {contact.connectionStatus === 'connected' ? 'Tap to message' :
                                 contact.connectionStatus === 'available' ? 'Tap to connect' :
                                 contact.connectionStatus === 'pending_sent' ? 'Request sent' :
                                 'Pending approval'}
                            </Text>
                        )}
                    </View>

                    {contact.hasUnreadMessages && (
                        <View className="w-2.5 h-2.5 rounded-full bg-[#FF6600] ml-2" />
                    )}

                    {contact.connectionStatus === 'pending_received' && (
                        <View className="flex-row ml-2">
                            <Pressable
                                className="w-10 h-10 rounded-full bg-green-500 justify-center items-center mr-2"
                                onPress={() => handleAcceptConnection(contact.connectionId!, contact.name)}
                                hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                            >
                                <Feather name="check" size={18} color="white" />
                            </Pressable>
                            <Pressable
                                className="w-10 h-10 rounded-full bg-red-500 justify-center items-center"
                                onPress={() => handleDeclineConnection(contact.connectionId!, contact.name)}
                                hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                            >
                                <Feather name="x" size={18} color="white" />
                            </Pressable>
                        </View>
                    )}

                    {contact.connectionStatus === 'pending_sent' && (
                        <View className="flex-row items-center ml-2 bg-muted px-3 py-1.5 rounded-full">
                            <Feather name="clock" size={14} color="#6C757D" style={{ marginRight: 6 }} />
                            <Text className="text-xs font-medium text-muted-foreground">Requested</Text>
                        </View>
                    )}

                    {contact.connectionStatus === 'available' && (
                        <Pressable
                            className="ml-2 bg-[#002147] px-4 py-2 rounded-full flex-row items-center active:opacity-90"
                            onPress={() => handleConnect(contact)}
                        >
                            <Feather name="user-plus" size={14} color="white" style={{ marginRight: 6 }} />
                            <Text className="text-white text-xs font-bold">Connect</Text>
                        </Pressable>
                    )}

                    {contact.connectionStatus === 'connected' && (
                        <View className="ml-2 bg-[#002147]/10 p-2 rounded-full">
                            <Feather name="message-circle" size={20} color="#002147" />
                        </View>
                    )}
                </View>
            </Pressable>
        );
    }

    if (!isLoggedIn) {
         return (
            <View className="flex-1 bg-background">
                 <View
                    className="pt-12 pb-6 mb-6"
                    style={{ paddingHorizontal: isTablet ? 24 : 24 }}
                >
                    <View 
                        style={{ maxWidth: isTablet ? 1200 : '100%', alignSelf: 'center', width: '100%' }}
                    >
                        <View className="flex-row items-center justify-end mb-2">
                            <HeaderNotificationIcon />
                            <HeaderAvatar />
                        </View>
                        <View className="items-start mb-2">
                            <Text className="text-foreground font-semibold" style={{ fontSize: isTablet ? 22 : 20 }}>
                                Network
                            </Text>
                            <Text className="text-muted-foreground" style={{ fontSize: isTablet ? 14 : 14 }}>
                                Connect with innovators and partners.
                            </Text>
                        </View>
                    </View>
                 </View>
                 <View className="mx-5 p-5 rounded-2xl bg-card border border-border shadow-sm">
                    <View className="flex-row items-center mb-2">
                        <View className="bg-[#FF6600]/10 p-2 rounded-full mr-3">
                            <Feather name="lock" size={18} color="#FF6600" />
                        </View>
                        <Text className="text-foreground text-lg font-bold">
                            Sign Up for Full Networking
                        </Text>
                    </View>
                    <Text className="text-muted-foreground text-sm mb-4 ml-1">
                        Create an account to connect with all users, send messages, and build your professional network.
                    </Text>
                    <Pressable
                        className="bg-[#002147] py-3 px-4 rounded-xl items-center active:opacity-90"
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
                <View
                    className="pt-12 pb-6"
                    style={{ paddingHorizontal: isTablet ? 24 : 24 }}
                >
                    <View 
                        style={{ maxWidth: isTablet ? 1200 : '100%', alignSelf: 'center', width: '100%' }}
                    >
                        <View className="flex-row items-center justify-end mb-2">
                            <HeaderNotificationIcon />
                            <HeaderAvatar />
                        </View>
                        <View className="items-start mb-2">
                            <Text className="text-foreground font-semibold" style={{ fontSize: isTablet ? 22 : 20 }}>
                                Network
                            </Text>
                            <Text className="text-muted-foreground" style={{ fontSize: isTablet ? 14 : 14 }}>
                                Connect with innovators and partners.
                            </Text>
                        </View>
                    </View>

                    {/* Search Bar */}
                    <View 
                        className="flex-row items-center bg-gray-50 border border-gray-200 h-12 rounded-xl px-4 mt-6"
                        style={{ maxWidth: isTablet ? 1200 : '100%', alignSelf: 'center', width: '100%' }}
                    >
                        <Feather name="search" size={20} color="#9CA3AF" />
                        <TextInput
                            className="flex-1 ml-3 text-base text-foreground"
                            placeholder="Search people, companies..."
                            placeholderTextColor="#D1D5DB"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
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
                            className={`flex-1 py-3 rounded-lg items-center ${activeTab === 'messages' ? 'bg-[#002147]' : ''}`}
                            onPress={() => setActiveTab('messages')}
                        >
                            <Feather name="message-circle" size={18} color={activeTab === 'messages' ? '#FFFFFF' : '#6C757D'} />
                            <Text className={`text-xs font-semibold mt-1 ${activeTab === 'messages' ? 'text-white' : 'text-foreground'}`}>
                                Messages
                            </Text>
                            {chats && chats.some(c => (c.unreadCount || 0) > 0) && (
                                <View className="absolute -top-1 -right-1 bg-[#FF6600] rounded-full px-1.5 py-0.5 min-w-[18px] items-center justify-center">
                                    <Text className="text-white text-[10px] font-bold">
                                        {chats.filter(c => (c.unreadCount || 0) > 0).length}
                                    </Text>
                                </View>
                            )}
                        </Pressable>
                        <Pressable
                            className={`flex-1 py-3 rounded-lg items-center ${activeTab === 'requests' ? 'bg-[#002147]' : ''}`}
                            onPress={() => setActiveTab('requests')}
                        >
                            <Feather name="user-check" size={18} color={activeTab === 'requests' ? '#FFFFFF' : '#6C757D'} />
                            <Text className={`text-xs font-semibold mt-1 ${activeTab === 'requests' ? 'text-white' : 'text-foreground'}`}>
                                Requests
                            </Text>
                            {(pendingReceivedContacts.length + pendingSentContacts.length) > 0 && (
                                <View className="absolute -top-1 -right-1 bg-[#FF6600] rounded-full px-1.5 py-0.5 min-w-[18px] items-center justify-center">
                                    <Text className="text-white text-[10px] font-bold">{pendingReceivedContacts.length + pendingSentContacts.length}</Text>
                                </View>
                            )}
                        </Pressable>
                        <Pressable
                            className={`flex-1 py-3 rounded-lg items-center ${activeTab === 'discover' ? 'bg-[#002147]' : ''}`}
                            onPress={() => setActiveTab('discover')}
                        >
                            <Feather name="users" size={18} color={activeTab === 'discover' ? '#FFFFFF' : '#6C757D'} />
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
                                        ? 'bg-primary border-primary'
                                        : 'bg-card border-border'
                                        }`}
                                    onPress={() => setSelectedRole(role)}
                                >
                                    <Text className={`text-xs font-semibold ${selectedRole === role ? 'text-primary-foreground' : 'text-foreground'
                                        }`}>
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
                            {Array.from({ length: 3 }).map((_, index) => (
                                <View key={`loading-${index}`} className="bg-card mb-3 rounded-2xl border border-border shadow-sm p-4">
                                    <View className="flex-row items-center">
                                        <View className="w-12 h-12 rounded-full bg-muted animate-pulse" />
                                        <View className="flex-1 ml-3">
                                            <View className="h-4 bg-muted rounded mb-2 w-3/4 animate-pulse" />
                                            <View className="h-3 bg-muted rounded w-1/2 animate-pulse" />
                                        </View>
                                    </View>
                                </View>
                            ))}
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
                                    <Feather name="message-circle" size={48} color="#CBD5E0" />
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
                                    <Feather name="user-check" size={48} color="#CBD5E0" />
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
                                    <Feather name="users" size={48} color="#CBD5E0" />
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

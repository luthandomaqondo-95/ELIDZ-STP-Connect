import React, { useState, useMemo } from 'react';
import { View, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { Text } from '@/components/ui/text';
import { useAuthContext } from '../../hooks/use-auth-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { chatService, ChatWithDetails } from '@/services/chat.service';
import { connectionService, ContactWithConnection, ConnectionRequest } from '@/services/connection.service';
import { withAuthGuard } from '@/components/withAuthGuard';
import { useContactsSearch } from '@/hooks/useSearch';
import { useDebounce } from '@/hooks/useDebounce';

type UserRole = 'Entrepreneur' | 'Researcher' | 'SMME' | 'Student' | 'Investor' | 'Tenant';

function MessagesScreen() {
    const { profile, isLoggedIn } = useAuthContext();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRole, setSelectedRole] = useState<UserRole | 'All'>('All');

    const debouncedSearch = useDebounce(searchQuery, 300);

    const { data: contacts, isLoading: loading } = useContactsSearch(profile?.id || '', debouncedSearch);

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
        } catch (error: any) {
            console.error('Error sending connection request:', error);
            Alert.alert('Error', error.message || 'Failed to send connection request.');
        }
    }

    async function handleAcceptConnection(connectionId: string, userName: string) {
        try {
            await connectionService.acceptConnectionRequest(connectionId);
            Alert.alert('Success', `You are now connected with ${userName}!`);
        } catch (error: any) {
            console.error('Error accepting connection:', error);
            Alert.alert('Error', error.message || 'Failed to accept connection request.');
        }
    }

    async function handleDeclineConnection(connectionId: string, userName: string) {
        try {
            await connectionService.declineConnectionRequest(connectionId);
            Alert.alert('Request Declined', `Connection request from ${userName} has been declined.`);
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
                className="bg-white mb-3 rounded-2xl border border-gray-100 shadow-sm overflow-hidden active:opacity-95"
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
                        {chat.unreadCount && chat.unreadCount > 0 && (
                            <View className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF6600] rounded-full justify-center items-center">
                                <Text className="text-white text-xs font-bold">{chat.unreadCount}</Text>
                            </View>
                        )}
                    </View>

                    <View className="flex-1 ml-3">
                        <View className="flex-row items-center justify-between mb-1">
                            <Text className="text-base font-bold text-[#002147] flex-1" numberOfLines={1}>
                                {displayName}
                            </Text>
                            {chat.lastMessage && (
                                <Text className="text-xs text-gray-400 ml-2">
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
                                <Text className="text-gray-400 text-xs ml-2" numberOfLines={1}>
                                    • {chat.otherUser.organization}
                                </Text>
                            )}
                        </View>

                        {chat.lastMessage ? (
                            <Text className={`text-sm ${chat.unreadCount && chat.unreadCount > 0 ? 'text-[#002147] font-semibold' : 'text-gray-500'}`} numberOfLines={1}>
                                {chat.lastMessage.content}
                            </Text>
                        ) : (
                            <Text className="text-xs text-gray-400 italic">
                                No messages yet
                            </Text>
                        )}
                    </View>

                    {chat.unreadCount && chat.unreadCount > 0 && (
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
                className="bg-white mb-3 rounded-2xl border border-gray-100 shadow-sm overflow-hidden active:opacity-95"
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
                            <Text className="text-base font-bold text-[#002147] flex-1" numberOfLines={1}>
                                {contact.name}
                            </Text>
                            {contact.lastMessageTime && (
                                <Text className="text-xs text-gray-400 ml-2">
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
                            <Text className="text-gray-400 text-xs ml-2" numberOfLines={1}>
                                • {contact.organization || 'No organization'}
                            </Text>
                        </View>

                        {contact.lastMessage ? (
                            <Text className={`text-sm ${contact.hasUnreadMessages ? 'text-[#002147] font-semibold' : 'text-gray-500'}`} numberOfLines={1}>
                                {contact.lastMessage}
                            </Text>
                        ) : (
                            <Text className="text-xs text-gray-400 italic">
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
                                className="w-8 h-8 rounded-full bg-green-500 justify-center items-center mr-2"
                                onPress={() => handleAcceptConnection(contact.connectionId!, contact.name)}
                            >
                                <Feather name="check" size={16} color="white" />
                            </Pressable>
                            <Pressable
                                className="w-8 h-8 rounded-full bg-red-500 justify-center items-center"
                                onPress={() => handleDeclineConnection(contact.connectionId!, contact.name)}
                            >
                                <Feather name="x" size={16} color="white" />
                            </Pressable>
                        </View>
                    )}

                    {contact.connectionStatus === 'pending_sent' && (
                        <View className="ml-2">
                            <Feather name="clock" size={20} color="#6C757D" />
                        </View>
                    )}

                    {contact.connectionStatus === 'available' && (
                        <View className="ml-2">
                            <Feather name="user-plus" size={20} color="#002147" />
                        </View>
                    )}

                    {contact.connectionStatus === 'connected' && (
                        <View className="ml-2">
                            <Feather name="message-circle" size={20} color="#002147" />
                        </View>
                    )}
                </View>
            </Pressable>
        );
    }

    if (!isLoggedIn) {
         return (
            <View className="flex-1 bg-gray-50">
                 <LinearGradient
                    colors={['#002147', '#003366']}
                    className="pt-12 pb-6 px-6 rounded-b-[30px] shadow-lg mb-6"
                >
                    <Text className="text-white text-3xl font-bold mb-2">Network</Text>
                    <Text className="text-white/80 text-base">
                        Connect with innovators and partners.
                    </Text>
                 </LinearGradient>
                 <View className="mx-6 p-5 rounded-2xl bg-white border border-[#002147]/10 shadow-sm">
                    <View className="flex-row items-center mb-2">
                        <View className="bg-[#FF6600]/10 p-2 rounded-full mr-3">
                            <Feather name="lock" size={18} color="#FF6600" />
                        </View>
                        <Text className="text-[#002147] text-lg font-bold">
                            Sign Up for Full Networking
                        </Text>
                    </View>
                    <Text className="text-gray-500 text-sm mb-4 ml-1">
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
        <View className="flex-1 bg-gray-50">
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Header */}
                <LinearGradient
                    colors={['#002147', '#003366']}
                    className="pt-12 pb-6 px-6 rounded-b-[30px] shadow-lg"
                >
                    <Text className="text-white text-3xl font-bold mb-2">Network</Text>
                    <Text className="text-white/80 text-base">
                        Connect with innovators and partners.
                    </Text>

                    {/* Search Bar */}
                    <View className="flex-row items-center bg-white/10 border border-white/20 h-12 rounded-xl px-4 mt-6 backdrop-blur-sm">
                        <Feather name="search" size={20} color="rgba(255,255,255,0.7)" />
                        <TextInput
                            className="flex-1 ml-3 text-base text-white"
                            placeholder="Search people, companies..."
                            placeholderTextColor="rgba(255,255,255,0.5)"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </LinearGradient>

                {/* Role Filters */}
                <View className="mt-6 mb-2">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24 }}>
                        {roles.map((role) => (
                            <Pressable
                                key={role}
                                className={`px-4 py-2 rounded-full border mr-2 shadow-sm ${selectedRole === role
                                    ? 'bg-[#002147] border-[#002147]'
                                    : 'bg-white border-gray-200'
                                    }`}
                                onPress={() => setSelectedRole(role)}
                            >
                                <Text className={`text-xs font-semibold ${selectedRole === role ? 'text-white' : 'text-gray-600'
                                    }`}>
                                    {role}
                                </Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>

                {/* Content */}
                <View className="pb-6 pt-2">
                    {/* Loading State */}
                    {loading && (
                        <View className="px-6">
                            {/* Loading Messages */}
                            <View className="mb-6">
                                <View className="flex-row items-center justify-between mx-6 mb-3 mt-2">
                                    <Text className="text-lg font-bold text-[#002147]">
                                        Messages
                                    </Text>
                                </View>
                                {Array.from({ length: 2 }).map((_, index) => (
                                    <View key={`loading-msg-${index}`} className="bg-white mb-3 rounded-2xl border border-gray-100 shadow-sm p-4">
                                        <View className="flex-row items-center">
                                            <View className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
                                            <View className="flex-1 ml-3">
                                                <View className="h-4 bg-gray-200 rounded mb-2 w-3/4 animate-pulse" />
                                                <View className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>

                            {/* Loading People */}
                            <View className="mb-6">
                                <View className="flex-row items-center justify-between mx-6 mb-3 mt-2">
                                    <Text className="text-lg font-bold text-[#002147]">
                                        Discover People
                                    </Text>
                                </View>
                                {Array.from({ length: 3 }).map((_, index) => (
                                    <View key={`loading-people-${index}`} className="bg-white mb-3 rounded-2xl border border-gray-100 shadow-sm p-4">
                                        <View className="flex-row items-center">
                                            <View className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
                                            <View className="flex-1 ml-3">
                                                <View className="h-4 bg-gray-200 rounded mb-2 w-3/4 animate-pulse" />
                                                <View className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                    {/* Connected Contacts (Messages) */}
                    {!loading && connectedContacts.length > 0 && (
                        <View className="mb-6">
                            <View className="flex-row items-center justify-between mx-6 mb-3 mt-2">
                                <Text className="text-lg font-bold text-[#002147]">
                                    Messages
                                </Text>
                                <View className="bg-gray-200 px-2 py-0.5 rounded-full">
                                    <Text className="text-xs font-bold text-gray-600">{connectedContacts.length}</Text>
                                </View>
                            </View>
                            <View className="px-6">
                                {connectedContacts.map(renderContact)}
                            </View>
                        </View>
                    )}

                    {/* Pending Requests Received */}
                    {!loading && pendingReceivedContacts.length > 0 && (
                        <View className="mb-6">
                            <Text className="text-lg font-bold mx-6 mb-3 text-[#002147]">
                                Connection Requests ({pendingReceivedContacts.length})
                            </Text>
                            <View className="px-6">
                                {pendingReceivedContacts.map(renderContact)}
                            </View>
                        </View>
                    )}

                    {/* Pending Requests Sent */}
                    {!loading && pendingSentContacts.length > 0 && (
                        <View className="mb-6">
                            <Text className="text-lg font-bold mx-6 mb-3 text-[#002147]">
                                Sent Requests ({pendingSentContacts.length})
                            </Text>
                            <View className="px-6">
                                {pendingSentContacts.map(renderContact)}
                            </View>
                        </View>
                    )}

                    {/* Available to Connect */}
                    {!loading && (
                        <View className="mb-6">
                            <View className="flex-row items-center justify-between mx-6 mb-3 text-[#002147]">
                                <Text className="text-lg font-bold text-[#002147]">
                                    Discover People
                                </Text>
                                {availableContacts.length > 0 && (
                                    <View className="bg-gray-200 px-2 py-0.5 rounded-full">
                                        <Text className="text-xs font-bold text-gray-600">{availableContacts.length}</Text>
                                    </View>
                                )}
                            </View>

                            {availableContacts.length > 0 ? (
                                <View className="px-6">
                                    {availableContacts.map(renderContact)}
                                </View>
                            ) : (
                                <View className="items-center py-8 mx-6 bg-white rounded-2xl border border-gray-100 border-dashed">
                                    <Feather name="users" size={32} color="#CBD5E0" />
                                    <Text className="text-gray-400 text-sm mt-2 text-center font-medium">
                                        No new people to discover
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

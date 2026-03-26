import React, { useState, useEffect } from 'react';
import { View, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ScreenScrollView } from '@/components/ScreenScrollView';
import { Feather } from '@expo/vector-icons';
import { withAuthGuard } from '@/components/withAuthGuard';
import { TabsLayoutHeader } from '@/components/Header';
import { useAuthContext } from '@/hooks/use-auth-context';
import { chatService, ChatWithDetails } from '@/services/chat.service';
import { useColorScheme } from '@/hooks/use-theme-color';
import { COLORS } from '@/theme/colors';

function ChatsScreen() {
  const { profile } = useAuthContext();
  const { colorScheme } = useColorScheme();
  const colors = COLORS[colorScheme];
  const [chats, setChats] = useState<ChatWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!profile?.id) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const data = await chatService.getUserChats(profile.id);
        if (!cancelled) setChats(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load chats');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [profile?.id]);

  const handleStartChat = () => {
    router.push('/opportunities-chat');
  };

  const formatTimestamp = (isoDate?: string) => {
    if (!isoDate) return '';
    const d = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 60) return diffMins <= 1 ? 'Just now' : `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return d.toLocaleDateString();
  };

  const getChatDisplayName = (chat: ChatWithDetails) =>
    chat.name || chat.otherUser?.name || 'Chat';

  const getBlockedBadgeLabel = (chat: ChatWithDetails): string | null => {
    if (chat.blockedByCurrentUser) return 'Blocked';
    if (chat.blockedByOtherUser) return 'Blocked you';
    return null;
  };

  const renderChatItem = ({ item }: { item: ChatWithDetails }) => (
    <Pressable
      className="bg-card p-4 rounded-xl active:opacity-70 shadow-sm"
      onPress={() => router.push({ pathname: '/message', params: { chatId: item.id, userName: getChatDisplayName(item) } })}
    >
      <View className="flex-row items-center">
        <View className="w-12 h-12 rounded-full bg-primary justify-center items-center mr-3">
          <Text className="text-lg font-bold text-primary-foreground">
            {getChatDisplayName(item).charAt(0).toUpperCase()}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-foreground">
            {getChatDisplayName(item)}
          </Text>
          {item.opportunity_id && (
            <Text className="text-sm text-muted-foreground mt-1">
              Opportunity Discussion
            </Text>
          )}
        </View>
        {(item.unreadCount ?? 0) > 0 && (
          <View className="min-w-6 h-6 rounded-full justify-center items-center px-2 bg-accent">
            <Text className="text-sm text-accent-foreground font-semibold">
              {item.unreadCount}
            </Text>
          </View>
        )}
      </View>
      {getBlockedBadgeLabel(item) && (
        <View className="self-start mt-2 px-2.5 py-1 rounded-full bg-destructive/15 border border-destructive/40">
          <Text className="text-[11px] font-semibold text-destructive">
            {getBlockedBadgeLabel(item)}
          </Text>
        </View>
      )}
      <Text className="text-base text-muted-foreground mt-2" numberOfLines={1}>
        {item.lastMessage?.content || 'No messages yet'}
      </Text>
      <Text className="text-xs text-muted-foreground mt-1">
        {formatTimestamp(item.lastMessage?.created_at)}
      </Text>
    </Pressable>
  );

  return (
    <ScreenScrollView insetTop={false} contentContainerStyle={{ paddingBottom: 40 }}>
      <View className="bg-background">
        <TabsLayoutHeader title="Messages" variant="navy">
          <Text className="text-white/80 text-base">
            Your conversations and shared opportunities.
          </Text>
        </TabsLayoutHeader>
      </View>

      <View className="mt-6 px-5">
        <Pressable
          className="flex-row items-center justify-center py-3 rounded-lg mb-4 bg-primary active:opacity-70"
          onPress={handleStartChat}
        >
          <Feather name="plus" size={20} color="#FFFFFF" />
          <Text className="text-base text-primary-foreground ml-3 font-semibold">
            Share Opportunity
          </Text>
        </Pressable>

        <Text className="text-lg font-bold text-foreground mt-6 mb-4">
          Active Conversations
        </Text>

        {loading ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text className="text-muted-foreground mt-3">Loading chats...</Text>
          </View>
        ) : error ? (
          <View className="py-12 px-4">
            <Text className="text-destructive text-center">{error}</Text>
          </View>
        ) : (
          <FlatList
            data={chats}
            renderItem={renderChatItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View className="h-3" />}
            ListEmptyComponent={
              <Text className="text-muted-foreground text-center py-8">
                No conversations yet. Share an opportunity to start chatting.
              </Text>
            }
          />
        )}
      </View>
    </ScreenScrollView>
  );
}

export default withAuthGuard(ChatsScreen);

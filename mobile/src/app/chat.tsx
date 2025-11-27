import React, { useState, useEffect } from 'react';
import { View, Pressable, FlatList } from 'react-native';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ScreenScrollView } from '@/components/ScreenScrollView';
import { Feather } from '@expo/vector-icons';
import { storage } from '@/utils/storage';
import { withAuthGuard } from '@/components/withAuthGuard';

function ChatsScreen() {
  const [chats, setChats] = useState<any[]>([]);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    const savedChats = await storage.getChats();
    if (savedChats.length === 0) {
      const defaultChats = [
        {
          id: '1',
          name: 'John Smith',
          lastMessage: 'Interested in your renewable energy project',
          timestamp: '2 hours ago',
          unread: 2,
          opportunity: 'Solar Technology Collaboration',
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          lastMessage: 'Let me know about the funding details',
          timestamp: '5 hours ago',
          unread: 0,
          opportunity: 'R&D Tax Incentive Program',
        },
        {
          id: '3',
          name: 'Tech Hub Team',
          lastMessage: 'Your proposal looks great! Let\'s discuss further',
          timestamp: '1 day ago',
          unread: 1,
          opportunity: 'Digital Innovation Grant',
        },
      ];
      setChats(defaultChats);
      await storage.setChats(defaultChats);
    } else {
      setChats(savedChats);
    }
  };

  const handleStartChat = () => {
    router.push('/opportunities-chat');
  };

  const renderChatItem = ({ item }: any) => (
    <Pressable
      className="bg-card p-4 rounded-xl active:opacity-70 shadow-sm"
      onPress={() => router.push({ pathname: '/message', params: { userName: item.name, opportunityId: item.id } })}
    >
      <View className="flex-row items-center">
        <View className="w-12 h-12 rounded-full bg-primary justify-center items-center mr-3">
          <Text className="text-lg font-bold text-primary-foreground">
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-foreground">
            {item.name}
          </Text>
          {item.opportunity && (
            <Text className="text-sm text-muted-foreground mt-1">
              {item.opportunity}
            </Text>
          )}
        </View>
        {item.unread > 0 && (
          <View className="min-w-6 h-6 rounded-full justify-center items-center px-2 bg-accent">
            <Text className="text-sm text-accent-foreground font-semibold">
              {item.unread}
            </Text>
          </View>
        )}
      </View>
      <Text className="text-base text-muted-foreground mt-2" numberOfLines={1}>
        {item.lastMessage}
      </Text>
      <Text className="text-xs text-muted-foreground mt-1">
        {item.timestamp}
      </Text>
    </Pressable>
  );

  return (
    <ScreenScrollView>
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

      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View className="h-3" />}
      />
    </ScreenScrollView>
  );
}

export default withAuthGuard(ChatsScreen);

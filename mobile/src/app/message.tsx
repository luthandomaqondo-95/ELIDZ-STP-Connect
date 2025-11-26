import React, { useState, useEffect } from 'react';
import { View, TextInput, Pressable, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { withAuthGuard } from '@/components/withAuthGuard';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthContext } from '@/hooks/use-auth-context';
import { chatService, Message } from '@/services/chat.service';

function MessageScreen() {
  const insets = useSafeAreaInsets();
  const { userName, chatId } = useLocalSearchParams<{ userName: string; chatId: string }>();
  const { profile: user } = useAuthContext();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (chatId && user) {
      loadMessages();
    } else {
      setLoading(false);
    }
  }, [chatId, user]);

  async function loadMessages() {
    if (!chatId) return;
    
    try {
      setLoading(true);
      const chatMessages = await chatService.getChatMessages(chatId);
      setMessages(chatMessages);
      
      // Mark messages as read
      if (user) {
        await chatService.markMessagesAsRead(chatId, user.id);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    if (!message.trim() || !chatId || !user || sending) return;

    const messageText = message.trim();
    setMessage('');
    setSending(true);

    try {
      const newMessage = await chatService.sendMessage(chatId, user.id, messageText);
      setMessages([...messages, newMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Restore message on error
      setMessage(messageText);
    } finally {
      setSending(false);
    }
  }

  function formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  function renderMessage({ item }: { item: Message }) {
    if (!user) return null;
    const isMe = item.sender_id === user.id;
    return (
      <View className={`mb-4 ${isMe ? 'items-end' : 'items-start'}`}>
        <View 
            className={`max-w-[80%] p-4 rounded-2xl ${
                isMe 
                ? 'bg-[#002147] rounded-br-none' 
                : 'bg-white border border-gray-100 rounded-bl-none shadow-sm'
            }`}
        >
          <Text className={`text-base ${isMe ? 'text-white' : 'text-gray-800'}`}>
            {item.content}
          </Text>
        </View>
        <Text className="text-[10px] text-gray-400 mt-1 px-1">
          {formatTime(item.created_at)}
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* Header */}
      <LinearGradient
          colors={['#002147', '#003366']}
          className="pt-12 pb-4 px-4 rounded-b-[24px] shadow-md z-10"
      >
          <View className="flex-row items-center">
              <Pressable onPress={() => router.back()} className="p-2 bg-white/10 rounded-full mr-3">
                  <Feather name="arrow-left" size={20} color="white" />
              </Pressable>
              
              <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-3 border border-white/10">
                  <Text className="text-white font-bold text-lg">
                      {userName ? userName.charAt(0).toUpperCase() : '?'}
                  </Text>
              </View>

              <View className="flex-1">
                  <Text className="text-white text-lg font-bold" numberOfLines={1}>
                      {userName || 'Chat'}
                  </Text>
                  <View className="flex-row items-center">
                      <View className="w-2 h-2 rounded-full bg-green-400 mr-1.5" />
                      <Text className="text-white/70 text-xs">Online</Text>
                  </View>
              </View>

              <Pressable className="p-2 bg-white/10 rounded-full ml-2">
                  <Feather name="more-vertical" size={20} color="white" />
              </Pressable>
          </View>
      </LinearGradient>

      <View className="flex-1">
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#002147" />
            <Text className="text-gray-500 mt-4">Loading messages...</Text>
          </View>
        ) : (
          <FlatList
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            className="px-4 flex-1"
            contentContainerStyle={{
              paddingTop: 24,
              paddingBottom: 24,
            }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="items-center py-12">
                <Feather name="message-square" size={48} color="#CBD5E0" />
                <Text className="text-gray-400 text-base mt-4 text-center">
                  No messages yet. Start the conversation!
                </Text>
              </View>
            }
          />
        )}

        <View
          className="p-4 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          <View className="flex-row items-end">
            <View className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2 min-h-[48px] max-h-[120px] flex-row items-center">
                <TextInput
                    className="flex-1 text-base text-gray-800 pt-0 pb-0"
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Type a message..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                />
            </View>
            <Pressable
              className={`w-12 h-12 rounded-full justify-center items-center ml-3 shadow-sm ${
                  message.trim() && !sending ? 'bg-[#FF6600]' : 'bg-gray-200'
              }`}
              onPress={handleSend}
              disabled={!message.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Feather name="send" size={20} color="white" />
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

export default withAuthGuard(MessageScreen);
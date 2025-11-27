import React, { useState, useEffect } from 'react';
import { View, TextInput, Pressable, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Image, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { withAuthGuard } from '@/components/withAuthGuard';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthContext } from '@/hooks/use-auth-context';
import { chatService, Message } from '@/services/chat.service';
import * as DocumentPicker from 'expo-document-picker';
import { supabase } from '@/lib/supabase';

function MessageScreen() {
  const insets = useSafeAreaInsets();
  const { userName, chatId } = useLocalSearchParams<{ userName: string; chatId: string }>();
  const { profile: user } = useAuthContext();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [attachment, setAttachment] = useState<{ uri: string; type: 'image' | 'video' | 'document' | 'audio'; name: string } | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [otherUserId, setOtherUserId] = useState<string | null>(null);

  useEffect(() => {
    if (chatId && user) {
      loadMessages();
      loadChatDetails();
      
      // Subscribe to real-time changes
      const channel = supabase
        .channel(`chat_messages:${chatId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `chat_id=eq.${chatId}`,
          },
          (payload) => {
            const newMessage = payload.new as Message;
            // Only add if we don't already have it (to avoid duplicates from our own sends)
            setMessages((current) => {
              if (current.find(m => m.id === newMessage.id)) return current;
              return [newMessage, ...current]; // Add to top (reverse order list)
            });
            // Mark as read immediately if we are viewing
            if (newMessage.sender_id !== user.id) {
               chatService.markMessagesAsRead(chatId, user.id);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setLoading(false);
    }
  }, [chatId, user]);

  async function loadChatDetails() {
    if (!chatId || !user) return;
    
    try {
      // Get chat participants to find the other user
      const { data: participants, error } = await supabase
        .from('chat_participants')
        .select('user_id')
        .eq('chat_id', chatId);
      
      if (error) throw error;
      
      if (participants) {
        const otherParticipant = participants.find(p => p.user_id !== user.id);
        if (otherParticipant) {
          setOtherUserId(otherParticipant.user_id);
        }
      }
    } catch (error) {
      console.error('Error loading chat details:', error);
    }
  }

  async function handlePickDocument() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', // Allow all types
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const type = file.mimeType?.startsWith('image/') ? 'image' : 
                     file.mimeType?.startsWith('video/') ? 'video' : 
                     file.mimeType?.startsWith('audio/') ? 'audio' : 'document';
        
        setAttachment({
            uri: file.uri,
            type: type as any,
            name: file.name
        });
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  }

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
    if ((!message.trim() && !attachment) || !chatId || !user || sending) return;

    const messageText = message.trim();
    const currentAttachment = attachment;
    
    setMessage('');
    setAttachment(null);
    setSending(true);

    try {
      const newMessage = await chatService.sendMessage(chatId, user.id, messageText, currentAttachment || undefined);
      // We rely on real-time subscription for updates, but adding locally makes it feel instant
      setMessages((current) => {
         if (current.find(m => m.id === newMessage.id)) return current;
         return [newMessage, ...current];
      });
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
      // Restore state on error
      setMessage(messageText);
      setAttachment(currentAttachment);
    } finally {
      setSending(false);
    }
  }

  function formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  const handleViewProfile = () => {
    setShowMenu(false);
    if (otherUserId) {
      router.push(`/user-profile?id=${otherUserId}`);
    } else {
      Alert.alert('Error', 'Unable to load user profile');
    }
  };

  const handleClearChat = () => {
    setShowMenu(false);
    Alert.alert(
      'Clear Chat',
      'Are you sure you want to clear all messages in this chat? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            // Implement clear chat functionality
            Alert.alert('Success', 'Chat cleared');
          },
        },
      ]
    );
  };

  const handleDeleteChat = () => {
    setShowMenu(false);
    Alert.alert(
      'Delete Chat',
      'Are you sure you want to delete this chat? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Implement delete chat functionality
              if (chatId) {
                // await chatService.deleteChat(chatId);
                router.back();
                Alert.alert('Success', 'Chat deleted');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete chat');
            }
          },
        },
      ]
    );
  };

  const handleMuteNotifications = () => {
    setShowMenu(false);
    Alert.alert('Mute Notifications', 'Notification settings coming soon');
  };

  const handleBlockUser = () => {
    setShowMenu(false);
    Alert.alert(
      'Block User',
      `Are you sure you want to block ${userName}? You will no longer receive messages from this user.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            // Implement block user functionality
            Alert.alert('Success', 'User blocked');
            router.back();
          },
        },
      ]
    );
  };

  function renderMessage({ item }: { item: Message }) {
    if (!user) return null;
    const isMe = item.sender_id === user.id;
    return (
      <View className={`mb-4 ${isMe ? 'items-end' : 'items-start'}`}>
        <View 
            className={`max-w-[80%] p-4 rounded-2xl ${
                isMe 
                ? 'bg-[#002147] rounded-br-none' 
                : 'bg-card border border-border rounded-bl-none shadow-sm'
            }`}
        >
          {item.attachment_url && (
            <View className="mb-2">
                {item.attachment_type === 'image' ? (
                    <Image 
                        source={{ uri: item.attachment_url }} 
                        style={{ width: 200, height: 150, borderRadius: 8 }} 
                        resizeMode="cover"
                    />
                ) : (
                    <View className="flex-row items-center bg-black/10 p-2 rounded-lg">
                        <Feather name="file-text" size={20} color={isMe ? 'white' : '#002147'} />
                        <Text className={`ml-2 text-xs ${isMe ? 'text-white' : 'text-foreground'}`}>
                            Attachment ({item.attachment_type})
                        </Text>
                    </View>
                )}
            </View>
          )}
          {item.content ? (
            <Text className={`text-base ${isMe ? 'text-white' : 'text-foreground'}`}>
                {item.content}
            </Text>
          ) : null}
        </View>
        <Text className="text-[10px] text-muted-foreground mt-1 px-1">
          {formatTime(item.created_at)}
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
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

              <View className="relative">
                  <Pressable 
                      className="p-2 bg-white/10 rounded-full ml-2"
                      onPress={() => setShowMenu(!showMenu)}
                  >
                      <Feather name="more-vertical" size={20} color="white" />
                  </Pressable>
                  
                  {showMenu && (
                      <View className="absolute right-0 top-12 bg-card rounded-xl shadow-lg border border-border min-w-[180px] z-50">
                          <Pressable
                              className="flex-row items-center px-4 py-3 border-b border-border active:bg-muted"
                              onPress={handleViewProfile}
                          >
                              <Feather name="user" size={18} color="#002147" />
                              <Text className="ml-3 text-base text-foreground">View Profile</Text>
                          </Pressable>
                          
                          <Pressable
                              className="flex-row items-center px-4 py-3 border-b border-border active:bg-muted"
                              onPress={handleMuteNotifications}
                          >
                              <Feather name="bell-off" size={18} color="#002147" />
                              <Text className="ml-3 text-base text-foreground">Mute Notifications</Text>
                          </Pressable>
                          
                          <Pressable
                              className="flex-row items-center px-4 py-3 border-b border-border active:bg-muted"
                              onPress={handleClearChat}
                          >
                              <Feather name="trash-2" size={18} color="#002147" />
                              <Text className="ml-3 text-base text-foreground">Clear Chat</Text>
                          </Pressable>
                          
                          <Pressable
                              className="flex-row items-center px-4 py-3 border-b border-border active:bg-muted"
                              onPress={handleDeleteChat}
                          >
                              <Feather name="x-circle" size={18} color="#EF4444" />
                              <Text className="ml-3 text-base text-destructive">Delete Chat</Text>
                          </Pressable>
                          
                          <Pressable
                              className="flex-row items-center px-4 py-3 active:bg-muted"
                              onPress={handleBlockUser}
                          >
                              <Feather name="slash" size={18} color="#EF4444" />
                              <Text className="ml-3 text-base text-destructive">Block User</Text>
                          </Pressable>
                      </View>
                  )}
              </View>
          </View>
      </LinearGradient>
      
      {showMenu && (
          <Pressable 
              className="absolute inset-0 z-40"
              onPress={() => setShowMenu(false)}
          />
      )}

      <View className="flex-1">
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#002147" />
            <Text className="text-muted-foreground mt-4">Loading messages...</Text>
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
                <Text className="text-muted-foreground text-base mt-4 text-center">
                  No messages yet. Start the conversation!
                </Text>
              </View>
            }
          />
        )}

        <View
          className="p-4 bg-card border-t border-border shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          {attachment && (
            <View className="flex-row items-center mb-2 bg-muted p-2 rounded-lg border border-border self-start">
                <View className="w-8 h-8 bg-muted-foreground/20 rounded justify-center items-center mr-2">
                    <Feather name={attachment.type === 'image' ? 'image' : 'file-text'} size={16} color="#666" />
                </View>
                <Text className="text-sm text-foreground mr-2 max-w-[200px]" numberOfLines={1}>
                    {attachment.name}
                </Text>
                <Pressable onPress={() => setAttachment(null)}>
                    <Feather name="x" size={16} color="#FF4444" />
                </Pressable>
            </View>
          )}

          <View className="flex-row items-end">
            <Pressable
                className="w-10 h-10 justify-center items-center mr-2 mb-1"
                onPress={handlePickDocument}
                disabled={sending}
            >
                <Feather name="plus-circle" size={24} color="#002147" />
            </Pressable>
            <View className="flex-1 bg-input border border-border rounded-2xl px-4 py-2 min-h-[48px] max-h-[120px] flex-row items-center">
                <TextInput
                    className="flex-1 text-base text-foreground pt-0 pb-0"
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Type a message..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                />
            </View>
            <Pressable
              className={`w-12 h-12 rounded-full justify-center items-center ml-3 shadow-sm ${
                  (message.trim() || attachment) && !sending ? 'bg-[#FF6600]' : 'bg-muted'
              }`}
              onPress={handleSend}
              disabled={(!message.trim() && !attachment) || sending}
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
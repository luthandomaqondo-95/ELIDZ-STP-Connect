import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Alert,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { withAuthGuard } from '@/components/withAuthGuard';
import { useAuthContext } from '@/hooks/use-auth-context';
import { chatService, Message } from '@/services/chat.service';
import { connectionService } from '@/services/connection.service';
import { useAvatarUri } from '@/hooks/use-avatar-uri';
import { DEFAULT_AVATAR } from '@/constants/avatars';
import { useQueryClient } from '@tanstack/react-query';
import * as DocumentPicker from 'expo-document-picker';
import { supabase } from '@/lib/supabase';
import { useColorScheme } from '@/hooks/use-theme-color';
import { COLORS } from '@/theme/colors';
import { TabsLayoutHeader } from '@/components/Header';
import { LinearGradient } from 'expo-linear-gradient';

// ─── Types ───────────────────────────────────────────────────────────────────

type AppColors = typeof COLORS['light'] | typeof COLORS['dark'];

type AttachmentType = 'image' | 'video' | 'document' | 'audio';
interface Attachment {
  uri: string;
  type: AttachmentType;
  name: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function formatDateDivider(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

function shouldShowDateDivider(current: Message, previous?: Message): boolean {
  if (!previous) return true;
  const curr = new Date(current.created_at).toDateString();
  const prev = new Date(previous.created_at).toDateString();
  return curr !== prev;
}

// ─── Supabase helpers (actual implementations) ───────────────────────────────

async function clearChatMessages(chatId: string): Promise<void> {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('chat_id', chatId);
  if (error) throw error;
}

async function deleteChat(chatId: string): Promise<void> {
  // Delete messages first (cascade should handle this, but being explicit)
  await supabase.from('messages').delete().eq('chat_id', chatId);
  await supabase.from('chat_participants').delete().eq('chat_id', chatId);
  const { error } = await supabase.from('chats').delete().eq('id', chatId);
  if (error) throw error;
}


// ─── Sub-components ──────────────────────────────────────────────────────────

function DateDivider({ label }: { label: string }) {
  return (
    <View className="flex-row items-center my-4 px-2">
      <View className="flex-1 h-px bg-border" />
      <View className="mx-3 px-3 py-1 rounded-full bg-muted border border-border">
        <Text className="text-[11px] text-muted-foreground font-medium">{label}</Text>
      </View>
      <View className="flex-1 h-px bg-border" />
    </View>
  );
}

interface MessageBubbleProps {
  item: Message;
  isMe: boolean;
  colors: AppColors;
}

function MessageBubble({ item, isMe, colors }: MessageBubbleProps) {
  return (
    <View className={`mb-3 ${isMe ? 'items-end' : 'items-start'}`}>
      <View
        style={[
          styles.bubble,
          isMe
            ? { backgroundColor: colors.primary, borderBottomRightRadius: 4 }
            : { backgroundColor: colors.card, borderBottomLeftRadius: 4, borderColor: colors.border, borderWidth: 1 },
        ]}
      >
        {/* Attachment */}
        {item.attachment_url && (
          <View className="mb-2">
            {item.attachment_type === 'image' ? (
              <Image
                source={{ uri: item.attachment_url }}
                style={styles.attachmentImage}
                resizeMode="cover"
              />
            ) : (
              <View
                className="flex-row items-center p-2.5 rounded-xl"
                style={{ backgroundColor: isMe ? 'rgba(255,255,255,0.12)' : colors.muted }}
              >
                <View
                  className="w-8 h-8 rounded-lg items-center justify-center mr-2"
                  style={{ backgroundColor: isMe ? 'rgba(255,255,255,0.15)' : colors.primary + '18' }}
                >
                  <Feather
                    name={item.attachment_type === 'audio' ? 'music' : 'file-text'}
                    size={16}
                    color={isMe ? colors.white : colors.primary}
                  />
                </View>
                <Text
                  className="text-xs flex-1"
                  style={{ color: isMe ? colors.whiteOpacity80 : colors.foreground }}
                  numberOfLines={1}
                >
                  {item.attachment_type?.charAt(0).toUpperCase() + (item.attachment_type?.slice(1) || '')} attachment
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Text */}
        {item.content ? (
          <Text
            className="text-[15px] leading-5"
            style={{ color: isMe ? colors.white : colors.foreground }}
          >
            {item.content}
          </Text>
        ) : null}
      </View>

      {/* Time + Read status */}
      <View className="flex-row items-center mt-1 px-1 gap-1">
        <Text className="text-[10px] text-muted-foreground">{formatTime(item.created_at)}</Text>
        {isMe && (
          <Feather
            name={item.read_at ? 'check-circle' : 'check'}
            size={11}
            color={item.read_at ? colors.accent : colors.iconGray}
          />
        )}
      </View>
    </View>
  );
}

// ─── Menu ─────────────────────────────────────────────────────────────────────

interface MenuProps {
  visible: boolean;
  colors: AppColors;
  onClose: () => void;
  onViewProfile: () => void;
  onMute: () => void;
  onClearChat: () => void;
  onDeleteChat: () => void;
  onCancelRequest: () => void;
  onBlockUser: () => void;
}

function DropdownMenu({
  visible,
  colors,
  onClose,
  onViewProfile,
  onMute,
  onClearChat,
  onDeleteChat,
  onCancelRequest,
  onBlockUser,
}: MenuProps) {
  if (!visible) return null;

  const items = [
    { icon: 'user', label: 'View Profile', onPress: onViewProfile, danger: false },
    { icon: 'bell-off', label: 'Mute Notifications', onPress: onMute, danger: false },
    { icon: 'rotate-ccw', label: 'Cancel Request', onPress: onCancelRequest, danger: false },
    { icon: 'trash-2', label: 'Clear Chat', onPress: onClearChat, danger: false },
    { icon: 'x-circle', label: 'Delete Chat', onPress: onDeleteChat, danger: true },
    { icon: 'slash', label: 'Block User', onPress: onBlockUser, danger: true },
  ] as const;

  return (
    <>
      {/* Backdrop */}
      <Pressable
        style={[StyleSheet.absoluteFillObject, { zIndex: 40 }]}
        onPress={onClose}
      />
      {/* Menu card */}
      <View
        style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        {items.map((item, idx) => (
          <Pressable
            key={item.label}
            style={[
              styles.menuItem,
              idx < items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
            ]}
            onPress={item.onPress}
          >
            <View
              style={[
                styles.menuIconBg,
                { backgroundColor: item.danger ? colors.redLight + '15' : colors.primary + '12' },
              ]}
            >
              <Feather
                name={item.icon as any}
                size={15}
                color={item.danger ? colors.redLight : colors.primary}
              />
            </View>
            <Text
              className="ml-3 text-[14px] font-medium"
              style={{ color: item.danger ? colors.redLight : colors.foreground }}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </>
  );
}

// ─── Attachment Preview ───────────────────────────────────────────────────────

function AttachmentPreview({
  attachment,
  colors,
  onRemove,
}: {
  attachment: Attachment;
  colors: AppColors;
  onRemove: () => void;
}) {
  return (
    <View
      className="flex-row items-center mb-2 p-2 rounded-xl self-start border"
      style={{ backgroundColor: colors.muted, borderColor: colors.border }}
    >
      <View
        className="w-9 h-9 rounded-lg items-center justify-center mr-2"
        style={{ backgroundColor: colors.primary + '15' }}
      >
        <Feather
          name={attachment.type === 'image' ? 'image' : attachment.type === 'audio' ? 'music' : 'file-text'}
          size={16}
          color={colors.primary}
        />
      </View>
      <Text
        className="text-sm font-medium max-w-[180px]"
        style={{ color: colors.foreground }}
        numberOfLines={1}
      >
        {attachment.name}
      </Text>
      <Pressable
        onPress={onRemove}
        className="ml-2 w-6 h-6 rounded-full items-center justify-center"
        style={{ backgroundColor: colors.redLight + '15' }}
        hitSlop={8}
      >
        <Feather name="x" size={13} color={colors.redLight} />
      </Pressable>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

function MessageScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { colorScheme } = useColorScheme();
  const colors = COLORS[colorScheme ?? 'light'];
  const { userName, chatId } = useLocalSearchParams<{ userName: string; chatId: string }>();
  const { profile: user } = useAuthContext();

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const [otherUserAvatar, setOtherUserAvatar] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const { uri: otherAvatarUri } = useAvatarUri(otherUserAvatar);

  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  // ── Loaders ────────────────────────────────────────────────────────────────

  const loadChatDetails = useCallback(async () => {
    if (!chatId || !user) return;
    try {
      const { data: participants, error } = await supabase
        .from('chat_participants')
        .select('user_id')
        .eq('chat_id', chatId);
      if (error) throw error;
      if (participants) {
        const other = participants.find((p) => p.user_id !== user.id);
        if (other) {
          setOtherUserId(other.user_id);
          const { data: profile } = await supabase.from('profiles').select('avatar').eq('id', other.user_id).single();
          if (profile?.avatar) setOtherUserAvatar(profile.avatar);
        }
      }
    } catch (err) {
      console.error('loadChatDetails error:', err);
    }
  }, [chatId, user]);

  const loadMessages = useCallback(async () => {
    if (!chatId) return;
    try {
      setLoading(true);
      const chatMessages = await chatService.getChatMessages(chatId);
      setMessages(chatMessages);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
      if (user) await chatService.markMessagesAsRead(chatId, user.id);
    } catch (err) {
      console.error('loadMessages error:', err);
    } finally {
      setLoading(false);
    }
  }, [chatId, user]);

  // ── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!chatId || !user) {
      setLoading(false);
      return;
    }

    loadMessages();
    loadChatDetails();

    const channel = supabase
      .channel(`chat_messages:${chatId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((curr) => {
            if (curr.find((m) => m.id === newMsg.id)) return curr;
            return [...curr, newMsg];
          });
          if (newMsg.sender_id !== user.id) {
            chatService.markMessagesAsRead(chatId, user.id);
          }
          setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, user, loadMessages, loadChatDetails]);

  // ── Document picker ────────────────────────────────────────────────────────

  async function handlePickDocument() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets?.length) {
        const file = result.assets[0];
        const type: AttachmentType = file.mimeType?.startsWith('image/')
          ? 'image'
          : file.mimeType?.startsWith('video/')
          ? 'video'
          : file.mimeType?.startsWith('audio/')
          ? 'audio'
          : 'document';
        setAttachment({ uri: file.uri, type, name: file.name });
      }
    } catch (err) {
      console.error('handlePickDocument error:', err);
      Alert.alert('Error', 'Failed to pick file. Please try again.');
    }
  }

  // ── Send ───────────────────────────────────────────────────────────────────

  async function handleSend() {
    if ((!message.trim() && !attachment) || !chatId || !user || sending) return;

    const messageText = message.trim();
    const currentAttachment = attachment;

    setMessage('');
    setAttachment(null);
    setSending(true);

    try {
      const newMessage = await chatService.sendMessage(
        chatId,
        user.id,
        messageText,
        currentAttachment || undefined
      );
      setMessages((curr) => {
        if (curr.find((m) => m.id === newMessage.id)) return curr;
        return [...curr, newMessage];
      });
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
    } catch (err) {
      console.error('handleSend error:', err);
      Alert.alert('Error', 'Failed to send message. Please try again.');
      setMessage(messageText);
      setAttachment(currentAttachment);
    } finally {
      setSending(false);
    }
  }

  // ── Menu Actions ───────────────────────────────────────────────────────────

  const handleViewProfile = () => {
    setShowMenu(false);
    if (otherUserId) {
      router.push(`/user-profile?id=${otherUserId}`);
    } else {
      Alert.alert('Error', 'Unable to load user profile.');
    }
  };

  const handleMuteNotifications = () => {
    setShowMenu(false);
    Alert.alert('Coming Soon', 'Notification muting will be available in a future update.');
  };

  const handleCancelRequest = async () => {
    setShowMenu(false);
    if (!user || !otherUserId) {
      Alert.alert('Error', 'Unable to cancel request.');
      return;
    }
    try {
      const cancelled = await connectionService.cancelConnectionRequestByUsers(user.id, otherUserId);
      if (cancelled) {
        queryClient.invalidateQueries({ queryKey: ['contacts'] });
        Alert.alert('Request Cancelled', 'Connection request has been cancelled.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('Info', 'No pending request to cancel.');
      }
    } catch (err) {
      console.error('handleCancelRequest error:', err);
      Alert.alert('Error', 'Failed to cancel request. Please try again.');
    }
  };

  const handleClearChat = () => {
    setShowMenu(false);
    Alert.alert(
      'Clear Chat',
      'All messages will be permanently deleted. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            if (!chatId) return;
            try {
              await clearChatMessages(chatId);
              setMessages([]);
            } catch (err) {
              console.error('handleClearChat error:', err);
              Alert.alert('Error', 'Failed to clear chat. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteChat = () => {
    setShowMenu(false);
    Alert.alert(
      'Delete Chat',
      'This chat and all its messages will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!chatId) return;
            try {
              await deleteChat(chatId);
              router.back();
            } catch (err) {
              console.error('handleDeleteChat error:', err);
              Alert.alert('Error', 'Failed to delete chat. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleBlockUser = () => {
    setShowMenu(false);
    Alert.alert(
      'Block User',
      'Block user feature will be available in a future update.',
      [{ text: 'OK' }]
    );
  };

  // ── Render item ────────────────────────────────────────────────────────────

  function renderItem({ item, index }: { item: Message; index: number }) {
    if (!user) return null;
    const isMe = item.sender_id === user.id;
    const previous = index > 0 ? messages[index - 1] : undefined;
    const showDivider = shouldShowDateDivider(item, previous);

    return (
      <View>
        {showDivider && <DateDivider label={formatDateDivider(item.created_at)} />}
        <MessageBubble item={item} isMe={isMe} colors={colors} />
      </View>
    );
  }

  const avatarSource = otherAvatarUri ? { uri: otherAvatarUri } : DEFAULT_AVATAR;
  const canSend = (message.trim().length > 0 || !!attachment) && !sending;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* ── Header ── */}
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMid]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        {/* Back + Avatar + Name */}
        <View className="flex-row items-center flex-1">
          <Pressable
            onPress={() => router.back()}
            style={[styles.headerIconBtn, { backgroundColor: 'rgba(255,255,255,0.12)' }]}
            hitSlop={8}
          >
            <Feather name="arrow-left" size={20} color="white" />
          </Pressable>

          {/* Avatar */}
          <View style={styles.headerAvatar}>
            <Image
              source={avatarSource as any}
              style={{ width: '100%', height: '100%', borderRadius: 21 }}
              resizeMode="cover"
            />
            {/* Online dot */}
            <View style={[styles.onlineDot, { backgroundColor: colors.online }]} />
          </View>

          {/* Name + status */}
          <View className="ml-3 flex-1">
            <Text className="text-white font-semibold text-base" numberOfLines={1}>
              {userName || 'Chat'}
            </Text>
            <View className="flex-row items-center mt-0.5">
              <View className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: colors.online }} />
              <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>Online</Text>
            </View>
          </View>
        </View>

        {/* Right actions */}
        <View className="flex-row items-center">
          <Pressable
            style={[styles.headerIconBtn, { backgroundColor: 'rgba(255,255,255,0.12)', marginRight: 8 }]}
            hitSlop={8}
          >
            <Feather name="phone" size={18} color="white" />
          </Pressable>
          <View style={{ position: 'relative' }}>
            <Pressable
              onPress={() => setShowMenu((v) => !v)}
              style={[styles.headerIconBtn, { backgroundColor: 'rgba(255,255,255,0.12)' }]}
              hitSlop={8}
            >
              <Feather name="more-vertical" size={18} color="white" />
            </Pressable>

            <DropdownMenu
              visible={showMenu}
              colors={colors}
              onClose={() => setShowMenu(false)}
              onViewProfile={handleViewProfile}
              onMute={handleMuteNotifications}
              onCancelRequest={handleCancelRequest}
              onClearChat={handleClearChat}
              onDeleteChat={handleDeleteChat}
              onBlockUser={handleBlockUser}
            />
          </View>
        </View>
      </LinearGradient>

      {/* ── Messages ── */}
      <View style={{ flex: 1 }}>
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text className="text-muted-foreground mt-3 text-sm">Loading messages...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center py-20">
                <View
                  style={[styles.emptyIconWrapper, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '20' }]}
                >
                  <Feather name="message-circle" size={32} color={colors.primary} />
                </View>
                <Text className="text-base font-semibold text-foreground mt-4">No messages yet</Text>
                <Text className="text-sm text-muted-foreground mt-1 text-center px-8">
                  Start the conversation with {userName ?? 'this person'}
                </Text>
              </View>
            }
          />
        )}

        {/* ── Input bar ── */}
        <View
          style={[
            styles.inputBar,
            {
              backgroundColor: colors.card,
              borderTopColor: colors.border,
              paddingBottom: insets.bottom + 10,
            },
          ]}
        >
          {/* Attachment preview */}
          {attachment && (
            <AttachmentPreview
              attachment={attachment}
              colors={colors}
              onRemove={() => setAttachment(null)}
            />
          )}

          <View className="flex-row items-end">
            {/* Attach button */}
            <Pressable
              onPress={handlePickDocument}
              disabled={sending}
              style={[styles.attachBtn, { backgroundColor: colors.primary + '12' }]}
              hitSlop={6}
            >
              <Feather name="paperclip" size={20} color={colors.primary} />
            </Pressable>

            {/* Text input */}
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: colors.input, borderColor: colors.border },
              ]}
            >
              <TextInput
                ref={inputRef}
                style={[styles.input, { color: colors.foreground }]}
                value={message}
                onChangeText={setMessage}
                placeholder="Type a message..."
                placeholderTextColor={colors.placeholder}
                multiline
                maxLength={2000}
                returnKeyType="default"
              />
            </View>

            {/* Send button */}
            <Pressable
              onPress={handleSend}
              disabled={!canSend}
              style={[
                styles.sendBtn,
                { backgroundColor: canSend ? colors.accent : colors.muted },
              ]}
            >
              {sending ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Feather
                  name="send"
                  size={18}
                  color={canSend ? colors.white : colors.mutedForeground}
                />
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 14,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(243,140,30,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    borderWidth: 2,
    borderColor: 'rgba(243,140,30,0.45)',
    position: 'relative',
  },
  headerAvatarText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 17,
  },
  onlineDot: {
    position: 'absolute',
    width: 11,
    height: 11,
    borderRadius: 6,
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: 'white',
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  attachmentImage: {
    width: 200,
    height: 150,
    borderRadius: 10,
  },
  menuCard: {
    position: 'absolute',
    right: 0,
    top: 46,
    borderRadius: 14,
    borderWidth: 1,
    minWidth: 200,
    zIndex: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  menuIconBg: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  inputBar: {
    paddingHorizontal: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  attachBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 2,
  },
  inputWrapper: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 44,
    maxHeight: 120,
    justifyContent: 'center',
  },
  input: {
    fontSize: 15,
    lineHeight: 20,
    paddingTop: 0,
    paddingBottom: 0,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    marginBottom: 2,
  },
});

export default withAuthGuard(MessageScreen);
"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Chat, Message, Profile } from '@/types/chat';

export function useChat() {
    const [chats, setChats] = useState<Chat[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [currentUser, setCurrentUser] = useState<Profile | null>(null);
    const supabase = createClient();
    const subscriptionRef = useRef<any>(null);

    // Fetch current user
    useEffect(() => {
        async function fetchUser() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                setCurrentUser(profile as Profile);
            }
        }
        fetchUser();
    }, []);

    // Fetch chats
    const fetchChats = useCallback(async () => {
        if (!currentUser) return;
        setLoading(true);

        try {
            const { data: participants, error: participantsError } = await supabase
                .from('chat_participants')
                .select('chat_id')
                .eq('user_id', currentUser.id);

            if (participantsError) throw participantsError;

            if (!participants || participants.length === 0) {
                setChats([]);
                setLoading(false);
                return;
            }

            const chatIds = participants.map(p => p.chat_id);

            const [chatsResult, allParticipantsResult, allMessagesResult, allUnreadCountsResult] = await Promise.all([
                supabase
                    .from('chats')
                    .select('*')
                    .in('id', chatIds)
                    .order('updated_at', { ascending: false }),
                supabase
                    .from('chat_participants')
                    .select('*, user:profiles(*)')
                    .in('chat_id', chatIds),
                supabase
                    .from('messages')
                    .select('*, sender:profiles(*)')
                    .in('chat_id', chatIds)
                    .order('created_at', { ascending: false })
                    .limit(100),
                supabase
                    .from('messages')
                    .select('chat_id')
                    .in('chat_id', chatIds)
                    .is('read_at', null)
                    .neq('sender_id', currentUser.id),
            ]);

            const chatsData = chatsResult.data || [];
            const participantsData = allParticipantsResult.data || [];
            const messagesData = allMessagesResult.data || [];
            const unreadData = allUnreadCountsResult.data || [];

            // Group data
            const participantsByChat = new Map<string, any[]>();
            participantsData.forEach((p: any) => {
                if (!participantsByChat.has(p.chat_id)) participantsByChat.set(p.chat_id, []);
                participantsByChat.get(p.chat_id)!.push(p);
            });

            const lastMessageByChat = new Map<string, Message>();
            messagesData.forEach((msg: any) => {
                if (!lastMessageByChat.has(msg.chat_id)) {
                    lastMessageByChat.set(msg.chat_id, msg as Message);
                }
            });

            const unreadCountByChat = new Map<string, number>();
            unreadData.forEach((msg: any) => {
                const count = unreadCountByChat.get(msg.chat_id) || 0;
                unreadCountByChat.set(msg.chat_id, count + 1);
            });

            const enrichedChats = chatsData.map((chat: any) => {
                const chatParticipants = participantsByChat.get(chat.id) || [];
                const lastMessage = lastMessageByChat.get(chat.id);
                const unreadCount = unreadCountByChat.get(chat.id) || 0;
                
                let otherUser: Profile | undefined;
                if (chat.type === 'direct') {
                    const other = chatParticipants.find((p: any) => p.user_id !== currentUser.id);
                    if (other?.user) {
                        otherUser = other.user as Profile;
                    }
                }

                return {
                    ...chat,
                    participants: chatParticipants,
                    lastMessage,
                    unreadCount,
                    otherUser
                } as Chat;
            });

            setChats(enrichedChats);

        } catch (error) {
            console.error('Error fetching chats:', error);
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        if (currentUser) {
            fetchChats();
        }
    }, [currentUser, fetchChats]);

    // Subscribe to global messages to update chat list
    useEffect(() => {
        if (!currentUser) return;

        const channel = supabase
            .channel('public:messages')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                },
                (payload) => {
                    if (payload.new.sender_id !== currentUser.id) {
                        fetchChats();
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUser, fetchChats]);

    // Load messages for selected chat
    const loadMessages = useCallback(async (chatId: string) => {
        const { data, error } = await supabase
            .from('messages')
            .select('*, sender:profiles(*)')
            .eq('chat_id', chatId)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Error loading messages:', error);
            return;
        }

        setMessages((data || []).reverse() as Message[]);
    }, []);

    // Subscribe to selected chat messages
    useEffect(() => {
        if (!selectedChat) return;

        loadMessages(selectedChat.id);

        const channel = supabase
            .channel(`chat_messages:${selectedChat.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `chat_id=eq.${selectedChat.id}`,
                },
                (payload) => {
                    const newMessage = payload.new as Message;
                     // Fetch the sender profile for the new message
                    supabase.from('profiles').select('*').eq('id', newMessage.sender_id).single()
                    .then(({data: sender}) => {
                        const messageWithSender = { ...newMessage, sender };
                         setMessages((current) => {
                            if (current.find(m => m.id === messageWithSender.id)) return current;
                            return [...current, messageWithSender as Message];
                        });
                        
                        // Mark as read if it's not from us
                        if (currentUser && messageWithSender.sender_id !== currentUser.id) {
                            markAsRead(selectedChat.id);
                        }
                    });
                }
            )
            .subscribe();
            
        subscriptionRef.current = channel;

        return () => {
            supabase.removeChannel(channel);
        };
    }, [selectedChat, loadMessages, currentUser]);

    const markAsRead = async (chatId: string) => {
        if (!currentUser) return;
        await supabase
            .from('messages')
            .update({ read_at: new Date().toISOString() })
            .eq('chat_id', chatId)
            .is('read_at', null)
            .neq('sender_id', currentUser.id);
            
        // Update local unread count
        setChats(prev => prev.map(c => {
            if (c.id === chatId) {
                return { ...c, unreadCount: 0 };
            }
            return c;
        }));
    };

    const sendMessage = async (content: string) => {
        if (!selectedChat || !currentUser || !content.trim()) return;

        try {
            const { data, error } = await supabase
                .from('messages')
                .insert({
                    chat_id: selectedChat.id,
                    sender_id: currentUser.id,
                    content: content.trim(),
                })
                .select('*, sender:profiles(*)')
                .single();

            if (error) throw error;

            // Optimistic update
            // (Actually the subscription will handle it, but for immediate feedback we can add it)
            // But we need to be careful with duplicates. Subscription checks for ID so it should be fine.
            // Wait, subscription handles incoming. For our own message, we should just rely on the insert result or the subscription?
            // Subscription will fire for our own messages too.
            // But usually subscription is async.
            
            // Let's add it manually to be safe/fast
            setMessages((current) => [...current, data as Message]);

            // Update chat list last message
             setChats(prev => prev.map(c => {
                if (c.id === selectedChat.id) {
                    return { ...c, lastMessage: data as Message, updated_at: new Date().toISOString() };
                }
                return c;
            }).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()));

            await supabase
                .from('chats')
                .update({ updated_at: new Date().toISOString() })
                .eq('id', selectedChat.id);

        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return {
        chats,
        messages,
        loading,
        currentUser,
        selectedChat,
        setSelectedChat,
        sendMessage,
        refreshChats: fetchChats,
        markAsRead
    };
}


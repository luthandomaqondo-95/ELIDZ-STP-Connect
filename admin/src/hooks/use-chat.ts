"use client";

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    getChatCurrentUser,
    listAdminChats,
    listChatMessages,
    markChatRead,
    sendChatMessage,
} from '@/lib/admin-chat';
import { Chat, Message, Profile } from '@/types/chat';

// Realtime may not deliver to the anon browser client (custom auth / RLS),
// so poll as a fallback. Realtime events only trigger a server refetch.
const POLL_INTERVAL_MS = 10_000;

export function useChat() {
    const [chats, setChats] = useState<Chat[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [currentUser, setCurrentUser] = useState<Profile | null>(null);
    const [supabase] = useState(() => createClient());

    // Fetch current user
    useEffect(() => {
        getChatCurrentUser()
            .then(setCurrentUser)
            .catch((error) => {
                console.error('Error loading current user:', error);
                setLoading(false);
            });
    }, []);

    // Fetch chats
    const fetchChats = useCallback(async () => {
        if (!currentUser) return;
        try {
            setChats(await listAdminChats());
        } catch (error) {
            console.error('Error fetching chats:', error);
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    const markAsRead = useCallback(async (chatId: string) => {
        if (!currentUser) return;
        try {
            await markChatRead(chatId);
        } catch (error) {
            console.error('Error marking chat as read:', error);
            return;
        }
        setChats(prev => prev.map(c => (c.id === chatId ? { ...c, unreadCount: 0 } : c)));
    }, [currentUser]);

    // Load messages for selected chat
    const loadMessages = useCallback(async (chatId: string) => {
        try {
            setMessages(await listChatMessages(chatId));
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }, []);

    // Chat list: initial load, realtime nudges, and polling fallback
    useEffect(() => {
        if (!currentUser) return;
        setLoading(true);
        fetchChats();

        const channel = supabase
            .channel('public:messages')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages' },
                (payload) => {
                    if (payload.new.sender_id !== currentUser.id) {
                        fetchChats();
                    }
                }
            )
            .subscribe();
        const timer = setInterval(fetchChats, POLL_INTERVAL_MS);

        return () => {
            clearInterval(timer);
            supabase.removeChannel(channel);
        };
    }, [currentUser, fetchChats, supabase]);

    // Selected chat messages: initial load, realtime nudges, and polling fallback
    useEffect(() => {
        if (!selectedChat) return;
        const chatId = selectedChat.id;

        loadMessages(chatId);

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
                    loadMessages(chatId);
                    if (currentUser && payload.new.sender_id !== currentUser.id) {
                        markAsRead(chatId);
                    }
                }
            )
            .subscribe();
        const timer = setInterval(() => loadMessages(chatId), POLL_INTERVAL_MS);

        return () => {
            clearInterval(timer);
            supabase.removeChannel(channel);
        };
    }, [selectedChat, loadMessages, currentUser, markAsRead, supabase]);

    const sendMessage = async (content: string) => {
        if (!selectedChat || !currentUser || !content.trim()) return;

        try {
            const sent = await sendChatMessage(selectedChat.id, content);

            setMessages((current) =>
                current.some(m => m.id === sent.id) ? current : [...current, sent]
            );
            setChats(prev => prev.map(c => {
                if (c.id === selectedChat.id) {
                    return { ...c, lastMessage: sent, updated_at: new Date().toISOString() };
                }
                return c;
            }).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()));
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

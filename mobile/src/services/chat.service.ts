import { supabase } from '@/lib/supabase';
import { Profile } from '@/types';

export interface Chat {
	id: string;
	name?: string;
	type: 'direct' | 'group' | 'opportunity';
	opportunity_id?: string;
	created_by?: string;
	created_at: string;
	updated_at: string;
	participants?: ChatParticipant[];
	lastMessage?: Message;
	otherUser?: Profile;
}

export interface ChatParticipant {
	id: string;
	chat_id: string;
	user_id: string;
	joined_at: string;
	user?: Profile;
}

export interface Message {
	id: string;
	chat_id: string;
	sender_id: string;
	content: string;
	read_at?: string;
	created_at: string;
	sender?: Profile;
}

export interface ChatWithDetails extends Chat {
	participants: ChatParticipant[];
	lastMessage?: Message;
	unreadCount?: number;
}

class ChatService {
	async getUserChats(userId: string, search?: string): Promise<ChatWithDetails[]> {
		console.log('ChatService.getUserChats called for userId:', userId, 'search:', search);

		const { data: participants, error: participantsError } = await supabase
			.from('chat_participants')
			.select('chat_id')
			.eq('user_id', userId);

		if (participantsError) {
			console.error('ChatService.getUserChats participants error:', JSON.stringify(participantsError, null, 2));
			throw participantsError;
		}

		if (!participants || participants.length === 0) {
			console.log('ChatService.getUserChats: No chats found');
			return [];
		}

		const chatIds = participants.map(p => p.chat_id);

		const { data: chats, error: chatsError } = await supabase
			.from('chats')
			.select('*')
			.in('id', chatIds)
			.order('updated_at', { ascending: false });

		if (chatsError) {
			console.error('ChatService.getUserChats chats error:', JSON.stringify(chatsError, null, 2));
			throw chatsError;
		}

		let chatsWithDetails: ChatWithDetails[] = await Promise.all(
			(chats || []).map(async (chat) => {
				const { data: chatParticipants, error: participantsErr } = await supabase
					.from('chat_participants')
					.select('*, user:profiles(*)')
					.eq('chat_id', chat.id);

				if (participantsErr) {
					console.error('ChatService.getUserChats participants fetch error:', participantsErr);
				}

				const { data: messages, error: messagesErr } = await supabase
					.from('messages')
					.select('*, sender:profiles(*)')
					.eq('chat_id', chat.id)
					.order('created_at', { ascending: false })
					.limit(1);

				if (messagesErr) {
					console.error('ChatService.getUserChats messages error:', messagesErr);
				}

				const { count: unreadCount } = await supabase
					.from('messages')
					.select('*', { count: 'exact', head: true })
					.eq('chat_id', chat.id)
					.is('read_at', null)
					.neq('sender_id', userId);

				let otherUser: Profile | undefined;
				if (chat.type === 'direct' && chatParticipants) {
					const otherParticipant = chatParticipants.find((p: any) => p.user_id !== userId);
					if (otherParticipant?.user) {
						otherUser = otherParticipant.user as Profile;
					}
				}

				return {
					...chat,
					participants: chatParticipants || [],
					lastMessage: messages?.[0] as Message | undefined,
					unreadCount: unreadCount || 0,
					otherUser,
				} as ChatWithDetails;
			})
		);

		if (search) {
			const lowerSearch = search.toLowerCase();
			chatsWithDetails = chatsWithDetails.filter(chat => {
				// Search by other user name (direct chat)
				if (chat.otherUser?.name.toLowerCase().includes(lowerSearch)) return true;
				// Search by chat name (group chat)
				if (chat.name?.toLowerCase().includes(lowerSearch)) return true;
				// Search by last message content
				if (chat.lastMessage?.content.toLowerCase().includes(lowerSearch)) return true;
				return false;
			});
		}

		console.log('ChatService.getUserChats succeeded:', chatsWithDetails.length, 'chats');
		return chatsWithDetails;
	}

	async getChatMessages(chatId: string, limit = 50): Promise<Message[]> {
		console.log('ChatService.getChatMessages called for chatId:', chatId);

		const { data, error } = await supabase
			.from('messages')
			.select('*, sender:profiles(*)')
			.eq('chat_id', chatId)
			.order('created_at', { ascending: false })
			.limit(limit);

		if (error) {
			console.error('ChatService.getChatMessages error:', JSON.stringify(error, null, 2));
			throw error;
		}

		console.log('ChatService.getChatMessages succeeded:', data?.length || 0, 'messages');
		return (data || []).reverse() as Message[];
	}

	async sendMessage(chatId: string, senderId: string, content: string): Promise<Message> {
		console.log('ChatService.sendMessage called for chatId:', chatId);

		const { data, error } = await supabase
			.from('messages')
			.insert({
				chat_id: chatId,
				sender_id: senderId,
				content: content.trim(),
			})
			.select('*, sender:profiles(*)')
			.single();

		if (error) {
			console.error('ChatService.sendMessage error:', JSON.stringify(error, null, 2));
			throw error;
		}

		await supabase
			.from('chats')
			.update({ updated_at: new Date().toISOString() })
			.eq('id', chatId);

		console.log('ChatService.sendMessage succeeded:', data);
		return data as Message;
	}

	async createDirectChat(userId1: string, userId2: string): Promise<Chat> {
		console.log('ChatService.createDirectChat called for users:', userId1, userId2);

		const { data: existingChats, error: checkError } = await supabase
			.from('chats')
			.select('*, participants:chat_participants(*)')
			.eq('type', 'direct');

		if (checkError) {
			console.error('ChatService.createDirectChat check error:', checkError);
		}

		if (existingChats) {
			for (const chat of existingChats) {
				const { data: participants } = await supabase
					.from('chat_participants')
					.select('user_id')
					.eq('chat_id', chat.id);

				if (participants && participants.length === 2) {
					const userIds = participants.map(p => p.user_id);
					if (userIds.includes(userId1) && userIds.includes(userId2)) {
						console.log('ChatService.createDirectChat: Existing chat found');
						return chat as Chat;
					}
				}
			}
		}

		const { data: newChat, error: chatError } = await supabase
			.from('chats')
			.insert({
				type: 'direct',
				created_by: userId1,
			})
			.select()
			.single();

		if (chatError) {
			console.error('ChatService.createDirectChat chat error:', JSON.stringify(chatError, null, 2));
			throw chatError;
		}

		const { error: participantsError } = await supabase
			.from('chat_participants')
			.insert([
				{ chat_id: newChat.id, user_id: userId1 },
				{ chat_id: newChat.id, user_id: userId2 },
			]);

		if (participantsError) {
			console.error('ChatService.createDirectChat participants error:', JSON.stringify(participantsError, null, 2));
			throw participantsError;
		}

		console.log('ChatService.createDirectChat succeeded:', newChat);
		return newChat as Chat;
	}

	async markMessagesAsRead(chatId: string, userId: string): Promise<void> {
		console.log('ChatService.markMessagesAsRead called for chatId:', chatId);

		const { error } = await supabase
			.from('messages')
			.update({ read_at: new Date().toISOString() })
			.eq('chat_id', chatId)
			.is('read_at', null)
			.neq('sender_id', userId);

		if (error) {
			console.error('ChatService.markMessagesAsRead error:', JSON.stringify(error, null, 2));
			throw error;
		}

		console.log('ChatService.markMessagesAsRead succeeded');
	}
}

export const chatService = new ChatService();

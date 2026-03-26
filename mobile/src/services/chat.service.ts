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
	attachment_url?: string;
	attachment_type?: 'image' | 'video' | 'document' | 'audio';
	read_at?: string;
	created_at: string;
	sender?: Profile;
}

export interface MessageReportPayload {
	messageId: string;
	chatId: string;
	reporterId: string;
	reportedUserId: string;
	reason: string;
}

export interface ChatWithDetails extends Chat {
	participants: ChatParticipant[];
	lastMessage?: Message;
	unreadCount?: number;
	isBlocked?: boolean;
	blockedByCurrentUser?: boolean;
	blockedByOtherUser?: boolean;
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

		if (chatIds.length === 0) {
			return [];
		}

		// Batch fetch all related data in parallel instead of per-chat queries
		const [chatsResult, allParticipantsResult, allMessagesResult, allUnreadCountsResult, blockedConnectionsResult] = await Promise.all([
			supabase
				.from('chats')
				.select('*')
				.in('id', chatIds)
				.order('updated_at', { ascending: false }),
			supabase
				.from('chat_participants')
				.select('*, user:profiles(*)')
				.in('chat_id', chatIds),
			// Get last message for each chat using a window function approach
			// For simplicity, fetch recent messages and group by chat_id client-side
			supabase
				.from('messages')
				.select('*, sender:profiles(*)')
				.in('chat_id', chatIds)
				.order('created_at', { ascending: false })
				.limit(100), // Get recent messages, we'll group by chat
			// Get unread counts for all chats at once
			supabase
				.from('messages')
				.select('chat_id')
				.in('chat_id', chatIds)
				.is('read_at', null)
				.neq('sender_id', userId),
			supabase
				.from('connections')
				.select('user_id, connected_user_id, status')
				.eq('status', 'blocked')
				.or(`user_id.eq.${userId},connected_user_id.eq.${userId}`),
		]);

		const { data: chats, error: chatsError } = chatsResult;
		const { data: allParticipants, error: participantsErr } = allParticipantsResult;
		const { data: allMessages, error: messagesErr } = allMessagesResult;
		const { data: unreadMessages, error: unreadErr } = allUnreadCountsResult;
		const { data: blockedConnections, error: blockedConnectionsErr } = blockedConnectionsResult;

		if (chatsError) {
			console.error('ChatService.getUserChats chats error:', JSON.stringify(chatsError, null, 2));
			throw chatsError;
		}

		if (participantsErr) {
			console.error('ChatService.getUserChats participants fetch error:', participantsErr);
		}

		if (messagesErr) {
			console.error('ChatService.getUserChats messages error:', messagesErr);
		}

		if (unreadErr) {
			console.error('ChatService.getUserChats unread count error:', unreadErr);
		}
		if (blockedConnectionsErr) {
			console.error('ChatService.getUserChats blocked connections error:', blockedConnectionsErr);
		}

		// Group data by chat_id for efficient lookup
		const participantsByChat = new Map<string, any[]>();
		(allParticipants || []).forEach((p: any) => {
			if (!participantsByChat.has(p.chat_id)) {
				participantsByChat.set(p.chat_id, []);
			}
			participantsByChat.get(p.chat_id)!.push(p);
		});

		const lastMessageByChat = new Map<string, Message>();
		(allMessages || []).forEach((msg: any) => {
			if (!lastMessageByChat.has(msg.chat_id)) {
				lastMessageByChat.set(msg.chat_id, msg as Message);
			}
		});

		const unreadCountByChat = new Map<string, number>();
		(unreadMessages || []).forEach((msg: any) => {
			const count = unreadCountByChat.get(msg.chat_id) || 0;
			unreadCountByChat.set(msg.chat_id, count + 1);
		});

		type BlockInfo = { blockedByCurrentUser: boolean; blockedByOtherUser: boolean };
		const blockedByOtherUserMap = new Map<string, BlockInfo>();
		(blockedConnections || []).forEach((conn: any) => {
			const requesterId = conn.user_id as string;
			const targetId = conn.connected_user_id as string;
			const otherId = requesterId === userId ? targetId : requesterId;
			const existing = blockedByOtherUserMap.get(otherId) || {
				blockedByCurrentUser: false,
				blockedByOtherUser: false,
			};

			if (requesterId === userId) {
				existing.blockedByCurrentUser = true;
			} else if (targetId === userId) {
				existing.blockedByOtherUser = true;
			}
			blockedByOtherUserMap.set(otherId, existing);
		});

		let chatsWithDetails: ChatWithDetails[] = (chats || []).map((chat) => {
			const participants = participantsByChat.get(chat.id) || [];
			const lastMessage = lastMessageByChat.get(chat.id);
			const unreadCount = unreadCountByChat.get(chat.id) || 0;

			// For direct chats, find the other user (not current user)
			let otherUser: Profile | undefined;
			if (chat.type === 'direct' && participants.length >= 2) {
				otherUser = participants.find((p: any) => p.user_id !== userId)?.user as Profile;
			} else if (chat.type === 'direct' && participants.length === 1) {
				otherUser = participants[0]?.user as Profile;
			}
			const otherUserId = otherUser?.id;
			const blockInfo = otherUserId ? blockedByOtherUserMap.get(otherUserId) : undefined;
			const blockedByCurrentUser = blockInfo?.blockedByCurrentUser ?? false;
			const blockedByOtherUser = blockInfo?.blockedByOtherUser ?? false;

			return {
				...chat,
				participants,
				lastMessage,
				unreadCount,
				otherUser,
				isBlocked: blockedByCurrentUser || blockedByOtherUser,
				blockedByCurrentUser,
				blockedByOtherUser,
			} as ChatWithDetails;
		});

		if (search) {
			const lowerSearch = search.toLowerCase();
			chatsWithDetails = chatsWithDetails.filter(chat => {
				if (chat.otherUser?.name?.toLowerCase().includes(lowerSearch)) return true;
				if (chat.name?.toLowerCase().includes(lowerSearch)) return true;
				if (chat.lastMessage?.content?.toLowerCase().includes(lowerSearch)) return true;
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

	async sendMessage(chatId: string, senderId: string, content: string, attachment?: { uri: string; type: 'image' | 'video' | 'document' | 'audio'; name?: string }): Promise<Message> {
		console.log('ChatService.sendMessage called for chatId:', chatId, 'attachment:', attachment ? 'yes' : 'no');

		let attachmentUrl = null;

		if (attachment) {
			try {
				// 1. Upload file (Expo / React Native-safe: use ArrayBuffer instead of Blob)
				const response = await fetch(attachment.uri);
				const arrayBuffer = await response.arrayBuffer();
				const fileExt = attachment.name?.split('.').pop() || 'jpg';
				const fileName = `${chatId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
				const contentType =
					attachment.type === 'image'
						? 'image/jpeg'
						: attachment.type === 'video'
						? 'video/mp4'
						: attachment.type === 'audio'
						? 'audio/mpeg'
						: 'application/octet-stream';

				const { data: uploadData, error: uploadError } = await supabase.storage
					.from('chat-attachments')
					.upload(fileName, arrayBuffer, {
						contentType,
					});

				if (uploadError) {
					console.error('ChatService.sendMessage upload error:', uploadError);
					throw uploadError;
				}

				// 2. Get Public URL
				const { data: publicUrlData } = supabase.storage
					.from('chat-attachments')
					.getPublicUrl(fileName);
				
				attachmentUrl = publicUrlData.publicUrl;

			} catch (error) {
				console.error('ChatService.sendMessage file processing error:', error);
				throw error; // Or handle gracefully
			}
		}

		const { data, error } = await supabase
			.from('messages')
			.insert({
				chat_id: chatId,
				sender_id: senderId,
				content: (content || '').trim(),
				attachment_url: attachmentUrl || null,
				attachment_type: attachment?.type || null,
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

		const { data: rpcResult, error: rpcError } = await supabase.rpc('create_direct_chat', {
			p_user_id_1: userId1,
			p_user_id_2: userId2,
		});

		if (rpcError) {
			console.error('ChatService.createDirectChat RPC error:', JSON.stringify(rpcError, null, 2));
			throw rpcError;
		}

		const chatId = rpcResult?.id;
		if (!chatId) {
			throw new Error('create_direct_chat returned no chat id');
		}

		const { data: chat, error: fetchError } = await supabase
			.from('chats')
			.select('*')
			.eq('id', chatId)
			.single();

		if (fetchError || !chat) {
			console.error('ChatService.createDirectChat fetch error:', fetchError);
			throw fetchError || new Error('Failed to fetch created chat');
		}

		console.log('ChatService.createDirectChat succeeded:', chat);
		return chat as Chat;
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

	async reportMessage(payload: MessageReportPayload): Promise<void> {
		const reason = payload.reason.trim();
		if (reason.length < 3) {
			throw new Error('Please provide a valid report reason.');
		}

		const { error } = await supabase
			.from('message_reports')
			.insert({
				message_id: payload.messageId,
				chat_id: payload.chatId,
				reporter_id: payload.reporterId,
				reported_user_id: payload.reportedUserId,
				reason,
			});

		if (error) {
			if ((error as any)?.code === '23505') {
				throw new Error('You already reported this message.');
			}
			console.error('ChatService.reportMessage error:', JSON.stringify(error, null, 2));
			throw error;
		}
	}

	// ===== GROUP CHAT MANAGEMENT =====

	async createGroupChat(groupName: string, createdBy: string, participantIds: string[]): Promise<Chat> {
		console.log('ChatService.createGroupChat called:', { groupName, createdBy });

		const { data: newChat, error: chatError } = await supabase
			.from('chats')
			.insert({
				name: groupName,
				type: 'group',
				created_by: createdBy,
			})
			.select()
			.single();

		if (chatError) {
			console.error('ChatService.createGroupChat chat error:', JSON.stringify(chatError, null, 2));
			throw chatError;
		}

		// Add all participants
		const participants = [createdBy, ...participantIds];
		const uniqueParticipants = Array.from(new Set(participants));

		const { error: participantsError } = await supabase
			.from('chat_participants')
			.insert(
				uniqueParticipants.map(userId => ({
					chat_id: newChat.id,
					user_id: userId,
				}))
			);

		if (participantsError) {
			console.error('ChatService.createGroupChat participants error:', JSON.stringify(participantsError, null, 2));
			throw participantsError;
		}

		console.log('ChatService.createGroupChat succeeded:', newChat);
		return newChat as Chat;
	}

	async createOpportunityChat(opportunityId: string, participants: string[], createdBy: string): Promise<Chat> {
		console.log('ChatService.createOpportunityChat called:', { opportunityId });

		// Check if chat already exists for this opportunity
		const { data: existingChat } = await supabase
			.from('chats')
			.select('*')
			.eq('type', 'opportunity')
			.eq('opportunity_id', opportunityId)
			.single();

		if (existingChat) {
			console.log('ChatService.createOpportunityChat: Existing chat found');
			return existingChat as Chat;
		}

		const { data: newChat, error: chatError } = await supabase
			.from('chats')
			.insert({
				name: `Opportunity Discussion`,
				type: 'opportunity',
				opportunity_id: opportunityId,
				created_by: createdBy,
			})
			.select()
			.single();

		if (chatError) {
			console.error('ChatService.createOpportunityChat chat error:', JSON.stringify(chatError, null, 2));
			throw chatError;
		}

		// Add participants
		const uniqueParticipants = Array.from(new Set(participants));

		const { error: participantsError } = await supabase
			.from('chat_participants')
			.insert(
				uniqueParticipants.map(userId => ({
					chat_id: newChat.id,
					user_id: userId,
				}))
			);

		if (participantsError) {
			console.error('ChatService.createOpportunityChat participants error:', JSON.stringify(participantsError, null, 2));
			throw participantsError;
		}

		return newChat as Chat;
	}

	async addChatParticipant(chatId: string, userId: string): Promise<ChatParticipant> {
		console.log('ChatService.addChatParticipant called:', { chatId, userId });

		const { data: participant, error: participantError } = await supabase
			.from('chat_participants')
			.insert({
				chat_id: chatId,
				user_id: userId,
			})
			.select()
			.single();

		if (participantError) {
			console.error('ChatService.addChatParticipant error:', JSON.stringify(participantError, null, 2));
			throw participantError;
		}

		console.log('ChatService.addChatParticipant succeeded');
		return participant as ChatParticipant;
	}

	async removeChatParticipant(chatId: string, userId: string): Promise<void> {
		console.log('ChatService.removeChatParticipant called:', { chatId, userId });

		const { error } = await supabase
			.from('chat_participants')
			.delete()
			.eq('chat_id', chatId)
			.eq('user_id', userId);

		if (error) {
			console.error('ChatService.removeChatParticipant error:', JSON.stringify(error, null, 2));
			throw error;
		}

		console.log('ChatService.removeChatParticipant succeeded');
	}

	async updateGroupChatName(chatId: string, newName: string): Promise<Chat> {
		console.log('ChatService.updateGroupChatName called:', { chatId, newName });

		const { data: updatedChat, error: updateError } = await supabase
			.from('chats')
			.update({ name: newName })
			.eq('id', chatId)
			.select()
			.single();

		if (updateError) {
			console.error('ChatService.updateGroupChatName error:', JSON.stringify(updateError, null, 2));
			throw updateError;
		}

		console.log('ChatService.updateGroupChatName succeeded');
		return updatedChat as Chat;
	}

	async getGroupChatDetails(chatId: string): Promise<Chat | null> {
		console.log('ChatService.getGroupChatDetails called:', chatId);

		const { data: chat, error: chatError } = await supabase
			.from('chats')
			.select('*')
			.eq('id', chatId)
			.single();

		if (chatError) {
			console.error('ChatService.getGroupChatDetails error:', JSON.stringify(chatError, null, 2));
			return null;
		}

		// Get all participants with their profiles
		const { data: participants } = await supabase
			.from('chat_participants')
			.select('*, user:profiles(*)')
			.eq('chat_id', chatId);

		// Get last message
		const { data: messages } = await supabase
			.from('messages')
			.select('*, sender:profiles(*)')
			.eq('chat_id', chatId)
			.order('created_at', { ascending: false })
			.limit(1);

		return {
			...chat,
			participants: participants || [],
			lastMessage: messages?.[0],
		} as Chat;
	}

	async leaveChatGroup(chatId: string, userId: string): Promise<void> {
		console.log('ChatService.leaveChatGroup called:', { chatId, userId });

		// Remove user from chat participants
		const { error } = await supabase
			.from('chat_participants')
			.delete()
			.eq('chat_id', chatId)
			.eq('user_id', userId);

		if (error) {
			console.error('ChatService.leaveChatGroup error:', JSON.stringify(error, null, 2));
			throw error;
		}

		// Check if chat is empty and delete if it is (optional)
		const { data: remainingParticipants } = await supabase
			.from('chat_participants')
			.select('id')
			.eq('chat_id', chatId);

		if (!remainingParticipants || remainingParticipants.length === 0) {
			// Delete empty group chat
			await supabase.from('chats').delete().eq('id', chatId);
		}

		console.log('ChatService.leaveChatGroup succeeded');
	}

	async searchChatsAndMessages(userId: string, query: string): Promise<{ chats: ChatWithDetails[]; messages: Message[] }> {
		console.log('ChatService.searchChatsAndMessages called:', { userId, query });

		// Get user's chats
		const userChats = await this.getUserChats(userId);

		// Search in chat names and participants
		const filteredChats = userChats.filter(chat => {
			const chatName = chat.name?.toLowerCase() || '';
			const participantNames = (chat.participants || [])
				.map(p => p.user?.name.toLowerCase() || '')
				.join(' ');
			const lastMessageContent = chat.lastMessage?.content.toLowerCase() || '';

			const lowerQuery = query.toLowerCase();
			return chatName.includes(lowerQuery) || participantNames.includes(lowerQuery) || lastMessageContent.includes(lowerQuery);
		});

		// Search messages
		const chatIds = userChats.map(c => c.id);
		const { data: messages } = await supabase
			.from('messages')
			.select('*, sender:profiles(*)')
			.in('chat_id', chatIds)
			.ilike('content', `%${query}%`)
			.order('created_at', { ascending: false })
			.limit(50);

		return {
			chats: filteredChats,
			messages: (messages || []) as Message[],
		};
	}
}

export const chatService = new ChatService();

import { supabase } from '@/lib/supabase';
import { Profile } from '@/types';

export interface Connection {
	id: string;
	requester_id: string;
	addressee_id: string;
	status: 'pending' | 'accepted' | 'declined' | 'blocked';
	created_at: string;
	updated_at: string;
	requester?: Profile;
	addressee?: Profile;
}

export interface ConnectionRequest extends Connection {
	user: Profile; // The other person in the connection
	isIncoming: boolean; // true if this user received the request, false if they sent it
}

export interface ContactWithConnection extends Profile {
	connectionStatus: 'connected' | 'pending_sent' | 'pending_received' | 'available';
	connectionId?: string;
	lastMessage?: string;
	lastMessageTime?: string;
	hasUnreadMessages?: boolean;
}

class ConnectionService {
	async getAcceptedConnections(userId: string): Promise<Connection[]> {
		console.log('ConnectionService.getAcceptedConnections called for userId:', userId);

		const { data, error } = await supabase
			.from('connections')
			.select(`
				*,
				requester:profiles!connections_requester_id_fkey(*),
				addressee:profiles!connections_addressee_id_fkey(*)
			`)
			.or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
			.eq('status', 'accepted')
			.order('updated_at', { ascending: false });

		if (error) {
			console.error('ConnectionService.getAcceptedConnections error:', JSON.stringify(error, null, 2));
			throw error;
		}

		console.log('ConnectionService.getAcceptedConnections succeeded:', data?.length || 0, 'connections');
		return data || [];
	}

	async getConnectionRequests(userId: string): Promise<ConnectionRequest[]> {
		console.log('ConnectionService.getConnectionRequests called for userId:', userId);

		// Run both queries in parallel for better performance
		const [incomingResult, outgoingResult] = await Promise.all([
			supabase
				.from('connections')
				.select(`
					*,
					requester:profiles!connections_requester_id_fkey(*)
				`)
				.eq('addressee_id', userId)
				.eq('status', 'pending'),
			supabase
				.from('connections')
				.select(`
					*,
					addressee:profiles!connections_addressee_id_fkey(*)
				`)
				.eq('requester_id', userId)
				.eq('status', 'pending'),
		]);

		const { data: incoming, error: incomingError } = incomingResult;
		const { data: outgoing, error: outgoingError } = outgoingResult;

		if (incomingError) {
			console.error('ConnectionService.getConnectionRequests incoming error:', incomingError);
		}

		if (outgoingError) {
			console.error('ConnectionService.getConnectionRequests outgoing error:', outgoingError);
		}

		const incomingRequests: ConnectionRequest[] = (incoming || []).map(conn => ({
			...conn,
			user: conn.requester,
			isIncoming: true
		}));

		const outgoingRequests: ConnectionRequest[] = (outgoing || []).map(conn => ({
			...conn,
			user: conn.addressee,
			isIncoming: false
		}));

		const allRequests = [...incomingRequests, ...outgoingRequests].sort(
			(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
		);

		console.log('ConnectionService.getConnectionRequests succeeded:', allRequests.length, 'requests');
		console.log('Incoming requests:', incomingRequests.length, incomingRequests.map(r => ({ userId: r.user?.id, name: r.user?.name })));
		console.log('Outgoing requests:', outgoingRequests.length, outgoingRequests.map(r => ({ userId: r.user?.id, name: r.user?.name })));
		return allRequests;
	}

	async getAvailableUsers(userId: string, limit = 20, search?: string): Promise<Profile[]> {
		console.log('ConnectionService.getAvailableUsers called for userId:', userId, 'search:', search);

		// Run both exclusion queries in parallel
		const [connectionsResult, pendingResult] = await Promise.all([
			supabase
				.from('connections')
				.select('requester_id, addressee_id')
				.or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
				.eq('status', 'accepted'),
			supabase
				.from('connections')
				.select('requester_id, addressee_id')
				.or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
				.eq('status', 'pending'),
		]);

		const { data: connections, error: connectionsError } = connectionsResult;
		const { data: pendingConnections, error: pendingError } = pendingResult;

		if (connectionsError) {
			console.error('ConnectionService.getAvailableUsers connections error:', connectionsError);
		}

		if (pendingError) {
			console.error('ConnectionService.getAvailableUsers pending error:', pendingError);
		}

		const excludedUserIds = new Set<string>();
		excludedUserIds.add(userId); // Exclude self

		// Exclude connected users
		(connections || []).forEach((conn: any) => {
			if (conn.requester_id === userId) {
				excludedUserIds.add(conn.addressee_id);
			} else {
				excludedUserIds.add(conn.requester_id);
			}
		});

		// Exclude users with pending requests (can't send another request)
		(pendingConnections || []).forEach((conn: any) => {
			if (conn.requester_id === userId) {
				excludedUserIds.add(conn.addressee_id);
			} else {
				excludedUserIds.add(conn.requester_id);
			}
		});

		let query = supabase
			.from('profiles')
			.select('*')
			.order('created_at', { ascending: false });

		if (search) {
			query = query.or(`name.ilike.%${search}%,organization.ilike.%${search}%`);
		}

		const { data: allProfiles, error: profilesError } = await query.limit(limit * 2);

		if (profilesError) {
			console.error('ConnectionService.getAvailableUsers error:', JSON.stringify(profilesError, null, 2));
			throw profilesError;
		}

		const profiles = (allProfiles || []).filter(p => !excludedUserIds.has(p.id)).slice(0, limit);

		console.log('ConnectionService.getAvailableUsers succeeded:', profiles?.length || 0, 'users');
		return profiles;
	}

	async sendConnectionRequest(requesterId: string, addresseeId: string): Promise<Connection> {
		console.log('ConnectionService.sendConnectionRequest called:', requesterId, '->', addresseeId);

		const { data: { session }, error: sessionError } = await supabase.auth.getSession();
		if (!session?.user) {
			throw new Error('User not authenticated');
		}

		if (session.user.id !== requesterId) {
			throw new Error(`User ID mismatch: authenticated user ${session.user.id} does not match requester ${requesterId}`);
		}

		// Check if connection already exists (in any direction)
		const { data: existing, error: checkError } = await supabase
			.from('connections')
			.select('*')
			.or(`and(requester_id.eq.${requesterId},addressee_id.eq.${addresseeId}),and(requester_id.eq.${addresseeId},addressee_id.eq.${requesterId})`)
			.maybeSingle();

		if (existing) {
			if (existing.status === 'accepted') {
				throw new Error('You are already connected with this user');
			} else if (existing.status === 'pending') {
				if (existing.requester_id === requesterId) {
					throw new Error('Connection request already sent');
				} else {
					throw new Error('You have a pending connection request from this user');
				}
			} else if (existing.status === 'declined') {
				throw new Error('Connection request was previously declined');
			}
		}

		const { data, error } = await supabase
			.from('connections')
			.insert({
				requester_id: requesterId,
				addressee_id: addresseeId,
				status: 'pending',
			})
			.select(`
				*,
				requester:profiles!connections_requester_id_fkey(*),
				addressee:profiles!connections_addressee_id_fkey(*)
			`)
			.single();

		if (error) {
			console.error('ConnectionService.sendConnectionRequest error:', JSON.stringify(error, null, 2));
			throw error;
		}

		console.log('ConnectionService.sendConnectionRequest succeeded:', data);
		return data as Connection;
	}

	async acceptConnectionRequest(connectionId: string): Promise<Connection> {
		console.log('ConnectionService.acceptConnectionRequest called for connectionId:', connectionId);

		const { data, error } = await supabase
			.from('connections')
			.update({ status: 'accepted', updated_at: new Date().toISOString() })
			.eq('id', connectionId)
			.select(`
				*,
				requester:profiles!connections_requester_id_fkey(*),
				addressee:profiles!connections_addressee_id_fkey(*)
			`)
			.single();

		if (error) {
			console.error('ConnectionService.acceptConnectionRequest error:', JSON.stringify(error, null, 2));
			throw error;
		}

		console.log('ConnectionService.acceptConnectionRequest succeeded:', data);
		return data as Connection;
	}

	async declineConnectionRequest(connectionId: string): Promise<Connection> {
		console.log('ConnectionService.declineConnectionRequest called for connectionId:', connectionId);

		const { data, error } = await supabase
			.from('connections')
			.update({ status: 'declined', updated_at: new Date().toISOString() })
			.eq('id', connectionId)
			.select(`
				*,
				requester:profiles!connections_requester_id_fkey(*),
				addressee:profiles!connections_addressee_id_fkey(*)
			`)
			.single();

		if (error) {
			console.error('ConnectionService.declineConnectionRequest error:', JSON.stringify(error, null, 2));
			throw error;
		}

		console.log('ConnectionService.declineConnectionRequest succeeded:', data);
		return data as Connection;
	}

	async cancelConnectionRequest(connectionId: string): Promise<void> {
		console.log('ConnectionService.cancelConnectionRequest called for connectionId:', connectionId);

		const { error } = await supabase
			.from('connections')
			.delete()
			.eq('id', connectionId);

		if (error) {
			console.error('ConnectionService.cancelConnectionRequest error:', JSON.stringify(error, null, 2));
			throw error;
		}

		console.log('ConnectionService.cancelConnectionRequest succeeded');
	}

	async acceptConnection(connectionId: string): Promise<Connection> {
		console.log('ConnectionService.acceptConnection called for connectionId:', connectionId);

		const { data, error } = await supabase
			.from('connections')
			.update({ status: 'accepted' })
			.eq('id', connectionId)
			.select('*, connected_user:profiles!connections_connected_user_id_fkey(*)')
			.single();

		if (error) {
			console.error('ConnectionService.acceptConnection error:', JSON.stringify(error, null, 2));
			throw error;
		}

		console.log('ConnectionService.acceptConnection succeeded:', data);
		return data as Connection;
	}

	async getAllContacts(userId: string, search?: string): Promise<ContactWithConnection[]> {
		console.log('ConnectionService.getAllContacts called for userId:', userId, 'search:', search);

		// Run all data fetches in parallel for better performance
		const [connections, connectionRequests, available, allChats] = await Promise.all([
			this.getAcceptedConnections(userId),
			this.getConnectionRequests(userId),
			this.getAvailableUsers(userId, 20, search),
			// Only fetch chats once - we'll filter client-side
			(async () => {
				const { chatService } = await import('./chat.service');
				return chatService.getUserChats(userId);
			})(),
		]);

		const searchLower = search?.toLowerCase() || '';

		const connectedContacts: ContactWithConnection[] = await Promise.all(
			connections.map(async (conn) => {
				const otherUserId = conn.requester_id === userId ? conn.addressee_id : conn.requester_id;
				const otherUser = conn.requester_id === userId
					? (conn.addressee as Profile)
					: (conn.requester as Profile);

				if (!otherUser) {
					return null;
				}

				const chat = allChats.find(c =>
					c.type === 'direct' &&
					c.participants?.some(p => p.user_id === otherUserId)
				);

				if (search) {
					const nameMatch = otherUser.name.toLowerCase().includes(searchLower) ||
						otherUser.organization?.toLowerCase().includes(searchLower);
					const messageMatch = chat?.lastMessage?.content.toLowerCase().includes(searchLower);

					if (!nameMatch && !messageMatch) return null;
				}

				return {
					...otherUser,
					connectionStatus: 'connected' as const,
					connectionId: conn.id,
					lastMessage: chat?.lastMessage?.content,
					lastMessageTime: chat?.lastMessage?.created_at ? this.formatTimeAgo(chat.lastMessage.created_at) : undefined,
					hasUnreadMessages: (chat?.unreadCount || 0) > 0,
				} as ContactWithConnection;
			})
		);

		const validConnectedContacts = connectedContacts.filter(c => c !== null) as ContactWithConnection[];

		// Process connection requests (pending sent/received)
		const pendingContacts: ContactWithConnection[] = connectionRequests.map((request) => {
			const user = request.user;
			if (search) {
				const match = user.name.toLowerCase().includes(searchLower) ||
					user.organization?.toLowerCase().includes(searchLower);
				if (!match) return null;
			}
			return {
				...user,
				connectionStatus: request.isIncoming ? 'pending_received' : 'pending_sent' as const,
				connectionId: request.id,
			} as ContactWithConnection;
		}).filter(c => c !== null) as ContactWithConnection[];

		// Get IDs of users who are already in pending or connected lists
		const excludedUserIds = new Set<string>();
		validConnectedContacts.forEach(c => excludedUserIds.add(c.id));
		pendingContacts.forEach(c => excludedUserIds.add(c.id));

		// Available users - exclude those already in pending/connected
		const availableContacts: ContactWithConnection[] = available
			.filter(user => !excludedUserIds.has(user.id))
			.map((user) => ({
				...user,
				connectionStatus: 'available' as const,
			} as ContactWithConnection));

		// Combine all contacts - pending/connected take priority over available
		const allContacts = [...validConnectedContacts, ...pendingContacts, ...availableContacts];

		// Debug log to verify pending requests are included
		console.log('All contacts breakdown:', {
			connected: validConnectedContacts.length,
			pending: pendingContacts.length,
			pendingDetails: pendingContacts.map(c => ({ id: c.id, name: c.name, status: c.connectionStatus })),
			available: availableContacts.length,
		});

		console.log('ConnectionService.getAllContacts succeeded:', allContacts.length, 'contacts');
		return allContacts;
	}

	async getProfileById(userId: string): Promise<Profile | null> {
		const { data, error } = await supabase
			.from('profiles')
			.select('*')
			.eq('id', userId)
			.single();

		if (error) {
			console.error('ConnectionService.getProfileById error:', error);
			return null;
		}

		return data as Profile;
	}

	/**
	 * Calculate compatibility score between two users
	 */
	async calculateCompatibility(userId1: string, userId2: string): Promise<{
		score: number;
		reasons: string[];
		level: 'high' | 'medium' | 'low';
	} | null> {
		const { recommendationService } = await import('./recommendation.service');
		
		const [user1, user2] = await Promise.all([
			this.getProfileById(userId1),
			this.getProfileById(userId2),
		]);

		if (!user1 || !user2) {
			return null;
		}

		return recommendationService.calculateCompatibility(user1, user2);
	}

	private formatTimeAgo(dateString: string): string {
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
	}
}

export const connectionService = new ConnectionService();

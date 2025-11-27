export interface Profile {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    organization?: string;
    bio?: string;
}

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
    unreadCount?: number;
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

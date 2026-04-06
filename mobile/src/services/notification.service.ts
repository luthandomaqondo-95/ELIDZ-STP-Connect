import { supabase } from '@/lib/supabase';

export type NotificationType = 
    | 'verification_approved'
    | 'verification_rejected'
    | 'verification_pending'
    | 'admin_message'
    | 'announcement'
    | 'opportunity_update'
    | 'system_alert'
    | 'other';

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: NotificationType;
    related_entity_type?: string;
    related_entity_id?: string;
    read_at: string | null;
    created_by?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateNotificationData {
    user_id: string;
    title: string;
    message: string;
    type: NotificationType;
    related_entity_type?: string;
    related_entity_id?: string;
    created_by?: string;
}

class NotificationService {
    private hasWarnedUnreadCountRpcFailure = false;
    private hasWarnedUnreadCountFallbackFailure = false;
    /**
     * Get all notifications for a user
     */
    async getNotifications(userId: string, limit = 50): Promise<Notification[]> {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('NotificationService.getNotifications error:', error);
            throw error;
        }

        return (data as Notification[]) || [];
    }

    /**
     * Get unread notifications for a user
     */
    async getUnreadNotifications(userId: string): Promise<Notification[]> {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .is('read_at', null)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('NotificationService.getUnreadNotifications error:', error);
            throw error;
        }

        return (data as Notification[]) || [];
    }

    /**
     * Get unread notification count for a user
     */
    async getUnreadCount(userId: string): Promise<number> {
        try {
            const { data, error } = await supabase.rpc('get_unread_notification_count', {
                p_user_id: userId
            });

            if (!error) {
                return (data as number) || 0;
            }

            // RPC might not exist on some environments; fall back quietly.
            if (!this.hasWarnedUnreadCountRpcFailure) {
                this.hasWarnedUnreadCountRpcFailure = true;
                console.warn('NotificationService.getUnreadCount RPC failed, falling back to query.', error);
            }

            const { count, error: fallbackError } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .is('read_at', null);

            if (fallbackError) {
                if (!this.hasWarnedUnreadCountFallbackFailure) {
                    this.hasWarnedUnreadCountFallbackFailure = true;
                    console.warn('NotificationService.getUnreadCount fallback query failed.', fallbackError);
                }
                return 0;
            }

            return count || 0;
        } catch (e) {
            if (!this.hasWarnedUnreadCountFallbackFailure) {
                this.hasWarnedUnreadCountFallbackFailure = true;
                console.warn('NotificationService.getUnreadCount unexpected error.', e);
            }
            return 0;
        }
    }

    /**
     * Mark a notification as read
     */
    async markAsRead(notificationId: string, userId: string): Promise<void> {
        const { error } = await supabase
            .from('notifications')
            .update({ read_at: new Date().toISOString() })
            .eq('id', notificationId)
            .eq('user_id', userId);

        if (error) {
            console.error('NotificationService.markAsRead error:', error);
            throw error;
        }
    }

    /**
     * Mark all notifications as read for a user
     */
    async markAllAsRead(userId: string): Promise<number> {
        const { data, error } = await supabase.rpc('mark_all_notifications_read', {
            p_user_id: userId
        });

        if (error) {
            console.error('NotificationService.markAllAsRead error:', error);
            // Fallback to direct update if RPC fails
            const { error: updateError } = await supabase
                .from('notifications')
                .update({ read_at: new Date().toISOString() })
                .eq('user_id', userId)
                .is('read_at', null);

            if (updateError) {
                throw updateError;
            }
            return 0;
        }

        return (data as number) || 0;
    }

    /**
     * Create a notification (typically used by admin)
     * Note: This should be called from a server-side function or admin API
     * For client-side, we'll use a service role or admin endpoint
     */
    async createNotification(data: CreateNotificationData): Promise<Notification> {
        const { data: notification, error } = await supabase
            .from('notifications')
            .insert({
                user_id: data.user_id,
                title: data.title,
                message: data.message,
                type: data.type,
                related_entity_type: data.related_entity_type,
                related_entity_id: data.related_entity_id,
                created_by: data.created_by,
            })
            .select()
            .single();

        if (error) {
            console.error('NotificationService.createNotification error:', error);
            throw error;
        }

        return notification as Notification;
    }

    /**
     * Delete a notification
     */
    async deleteNotification(notificationId: string, userId: string): Promise<void> {
        // Check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            console.error('NotificationService.deleteNotification: No active session');
            throw new Error('User must be authenticated to delete notifications');
        }

        console.log('NotificationService.deleteNotification: Attempting delete', { 
            notificationId, 
            userId,
            sessionUserId: session.user?.id 
        });

        const { error, data } = await supabase
            .from('notifications')
            .delete()
            .eq('id', notificationId)
            .eq('user_id', userId)
            .select();

        if (error) {
            console.error('NotificationService.deleteNotification error:', error);
            throw error;
        }

        console.log('NotificationService.deleteNotification: Success', { deleted: data });
    }

    /**
     * Get notification icon based on type
     */
    getNotificationIcon(type: NotificationType): string {
        switch (type) {
            case 'verification_approved':
                return 'check-circle';
            case 'verification_rejected':
                return 'x-circle';
            case 'verification_pending':
                return 'clock';
            case 'admin_message':
                return 'message-square';
            case 'announcement':
                return 'megaphone';
            case 'opportunity_update':
                return 'briefcase';
            case 'system_alert':
                return 'alert-triangle';
            default:
                return 'bell';
        }
    }

    /**
     * Get notification color based on type
     */
    getNotificationColor(type: NotificationType): string {
        switch (type) {
            case 'verification_approved':
                return '#28A745'; // Green
            case 'verification_rejected':
                return '#EF4444'; // Red
            case 'verification_pending':
                return '#F38C1E'; // Orange
            case 'admin_message':
                return '#002147'; // Navy
            case 'announcement':
                return '#6F42C1'; // Purple
            case 'opportunity_update':
                return '#17A2B8'; // Teal
            case 'system_alert':
                return '#F38C1E'; // Orange
            default:
                return '#6C757D'; // Gray
        }
    }
}

export const notificationService = new NotificationService();


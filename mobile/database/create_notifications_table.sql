-- Create Notifications Table for Admin-to-User Communications
-- This allows admins (IDZ Science and Technology Park) to send notifications to users, especially SMMEs
-- Notifications can include verification approvals, rejections, general announcements, etc.

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'verification_approved',
    'verification_rejected',
    'verification_pending',
    'admin_message',
    'announcement',
    'opportunity_update',
    'system_alert',
    'other'
  )),
  related_entity_type TEXT, -- e.g., 'verification', 'opportunity', 'enquiry'
  related_entity_id UUID, -- ID of the related entity (verification ID, opportunity ID, etc.)
  read_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES public.profiles(id), -- Admin who created the notification
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON public.notifications(read_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, read_at) WHERE read_at IS NULL;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_notifications_updated_at ON public.notifications;
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON public.notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Admins can insert notifications (this will be handled via service role or admin API)
-- For now, we'll allow authenticated users to insert (admin check should be done in application layer)
CREATE POLICY "Admins can create notifications" ON public.notifications
    FOR INSERT
    WITH CHECK (true); -- Application layer should verify admin role

-- Function to get unread notification count for a user
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM public.notifications
        WHERE user_id = p_user_id
        AND read_at IS NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    UPDATE public.notifications
    SET read_at = TIMEZONE('utc', NOW())
    WHERE user_id = p_user_id
    AND read_at IS NULL;
    
    RETURN (SELECT COUNT(*) FROM public.notifications WHERE user_id = p_user_id AND read_at IS NOT NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Add attachment columns to messages table
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS attachment_type TEXT CHECK (attachment_type IN ('image', 'video', 'document', 'audio'));

-- Create storage bucket for chat attachments if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-attachments', 'chat-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to chat-attachments
CREATE POLICY "Authenticated users can upload chat attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'chat-attachments');

-- Allow authenticated users to view chat attachments
CREATE POLICY "Authenticated users can view chat attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'chat-attachments');

-- Allow users to delete their own attachments (optional, good practice)
CREATE POLICY "Users can delete own chat attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'chat-attachments' AND auth.uid() = owner);


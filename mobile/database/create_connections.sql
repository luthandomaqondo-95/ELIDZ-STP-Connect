-- Create connections table with proper friend request system
-- Run this SQL in your Supabase SQL Editor to recreate the connections functionality

-- Connections/Network table
CREATE TABLE IF NOT EXISTS public.connections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  requester_id UUID REFERENCES public.profiles(id) NOT NULL,
  addressee_id UUID REFERENCES public.profiles(id) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(requester_id, addressee_id),
  CHECK (requester_id != addressee_id)
);

-- Connections policies
-- Users can view connections where they are involved
CREATE POLICY "Users can view their connections" ON public.connections
    FOR SELECT USING (requester_id = auth.uid() OR addressee_id = auth.uid());

-- Users can create connection requests
CREATE POLICY "Users can create connection requests" ON public.connections
    FOR INSERT WITH CHECK (auth.uid() = requester_id);

-- Users can update connection requests they sent or received
CREATE POLICY "Users can update their connection requests" ON public.connections
    FOR UPDATE USING (requester_id = auth.uid() OR addressee_id = auth.uid());

-- Enable RLS on connections table
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_connections_requester ON public.connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_connections_addressee ON public.connections(addressee_id);
CREATE INDEX IF NOT EXISTS idx_connections_status ON public.connections(status);

-- Add updated_at trigger
DROP TRIGGER IF EXISTS update_connections_updated_at ON public.connections;
CREATE TRIGGER update_connections_updated_at BEFORE UPDATE ON public.connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Check if connections table exists, create if it doesn't
-- Run this SQL in your Supabase SQL Editor to ensure connections table exists

DO $$
BEGIN
    -- Check if connections table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'connections') THEN
        RAISE NOTICE 'Creating connections table...';

        -- Create the connections table
        CREATE TABLE public.connections (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          requester_id UUID REFERENCES public.profiles(id) NOT NULL,
          addressee_id UUID REFERENCES public.profiles(id) NOT NULL,
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
          UNIQUE(requester_id, addressee_id),
          CHECK (requester_id != addressee_id)
        );

        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_connections_requester ON public.connections(requester_id);
        CREATE INDEX IF NOT EXISTS idx_connections_addressee ON public.connections(addressee_id);
        CREATE INDEX IF NOT EXISTS idx_connections_status ON public.connections(status);

        -- Create trigger
        DROP TRIGGER IF EXISTS update_connections_updated_at ON public.connections;
        CREATE TRIGGER update_connections_updated_at BEFORE UPDATE ON public.connections
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

        RAISE NOTICE 'Connections table created successfully!';
    ELSE
        RAISE NOTICE 'Connections table already exists.';
    END IF;
END $$;

-- Enable RLS and create policies (will only run if table was just created or policies don't exist)
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their connections" ON public.connections;
DROP POLICY IF EXISTS "Users can create connection requests" ON public.connections;
DROP POLICY IF EXISTS "Users can update their connection requests" ON public.connections;

-- Create policies
CREATE POLICY "Users can view their connections" ON public.connections
    FOR SELECT USING (requester_id = auth.uid() OR addressee_id = auth.uid());

CREATE POLICY "Users can create connection requests" ON public.connections
    FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update their connection requests" ON public.connections
    FOR UPDATE USING (requester_id = auth.uid() OR addressee_id = auth.uid());

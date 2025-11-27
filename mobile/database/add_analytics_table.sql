-- Create analytics/visits table
CREATE TABLE IF NOT EXISTS public.analytics_visits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  entity_type TEXT NOT NULL, -- 'service' or 'product'
  entity_id TEXT, -- Optional, if specific service/product has an ID
  entity_name TEXT, -- Name of the service/product visited
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_analytics_visits_entity_type ON public.analytics_visits(entity_type);
CREATE INDEX IF NOT EXISTS idx_analytics_visits_visited_at ON public.analytics_visits(visited_at);

-- Enable RLS
ALTER TABLE public.analytics_visits ENABLE ROW LEVEL SECURITY;

-- Allow everyone to insert (including anonymous users)
DROP POLICY IF EXISTS "Everyone can insert analytics" ON public.analytics_visits;
CREATE POLICY "Everyone can insert analytics" ON public.analytics_visits
  FOR INSERT WITH CHECK (true);

-- Allow users to view their own analytics history
DROP POLICY IF EXISTS "Users can view own analytics" ON public.analytics_visits;
CREATE POLICY "Users can view own analytics" ON public.analytics_visits
  FOR SELECT USING (auth.uid() = user_id);

-- Allow Admins to view all analytics
DROP POLICY IF EXISTS "Admins can view all analytics" ON public.analytics_visits;
CREATE POLICY "Admins can view all analytics" ON public.analytics_visits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('Admin', 'Super Admin')
    )
  );


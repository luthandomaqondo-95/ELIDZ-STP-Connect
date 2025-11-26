-- Row Level Security (RLS) Policies for ELIDZ-STP
-- Run this SQL in your Supabase SQL Editor AFTER creating the schema
--
-- NOTE: This assumes the following table exists:
--   - resource_bookings (id, resource_id, requested_by, preferred_date, preferred_time, 
--                        duration, purpose, notes, status, created_at, updated_at)
--
-- To drop and recreate policies, use:
--   DROP POLICY IF EXISTS "policy_name" ON public.table_name;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;

-- Profiles policies
-- Users can view all profiles
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Tenants policies
-- Everyone can view tenants
CREATE POLICY "Tenants are viewable by everyone" ON public.tenants
    FOR SELECT USING (true);

-- Authenticated users can create tenants
CREATE POLICY "Authenticated users can create tenants" ON public.tenants
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Users can update tenants they created
CREATE POLICY "Users can update own tenants" ON public.tenants
    FOR UPDATE USING (auth.uid() = created_by);

-- Opportunities policies
-- Everyone can view active opportunities
CREATE POLICY "Opportunities are viewable by everyone" ON public.opportunities
    FOR SELECT USING (status = 'active' OR posted_by = auth.uid());

-- Authenticated users can create opportunities
CREATE POLICY "Authenticated users can create opportunities" ON public.opportunities
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = posted_by);

-- Users can update their own opportunities
CREATE POLICY "Users can update own opportunities" ON public.opportunities
    FOR UPDATE USING (auth.uid() = posted_by);

-- Users can delete their own opportunities
CREATE POLICY "Users can delete own opportunities" ON public.opportunities
    FOR DELETE USING (auth.uid() = posted_by);

-- Applications policies
-- Users can view their own applications
CREATE POLICY "Users can view own applications" ON public.applications
    FOR SELECT USING (applicant_id = auth.uid() OR 
                      EXISTS (
                        SELECT 1 FROM public.opportunities 
                        WHERE opportunities.id = applications.opportunity_id 
                        AND opportunities.posted_by = auth.uid()
                      ));

-- Authenticated users can create applications
CREATE POLICY "Authenticated users can create applications" ON public.applications
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = applicant_id);

-- Opportunity posters can update application status
CREATE POLICY "Opportunity posters can update applications" ON public.applications
    FOR UPDATE USING (
      EXISTS (
        SELECT 1 FROM public.opportunities 
        WHERE opportunities.id = applications.opportunity_id 
        AND opportunities.posted_by = auth.uid()
      )
    );

-- Events policies
-- Everyone can view events
CREATE POLICY "Events are viewable by everyone" ON public.events
    FOR SELECT USING (true);

-- Authenticated users can create events
CREATE POLICY "Authenticated users can create events" ON public.events
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Organizers can update their events
CREATE POLICY "Organizers can update own events" ON public.events
    FOR UPDATE USING (organizer_id = auth.uid());

-- News policies
-- Everyone can view published news
CREATE POLICY "News is viewable by everyone" ON public.news
    FOR SELECT USING (true);

-- Authenticated users can create news
CREATE POLICY "Authenticated users can create news" ON public.news
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Authors can update their news
CREATE POLICY "Authors can update own news" ON public.news
    FOR UPDATE USING (author_id = auth.uid());

-- Resources policies
-- Everyone can view resources
CREATE POLICY "Resources are viewable by everyone" ON public.resources
    FOR SELECT USING (true);

-- Authenticated users can create resources
CREATE POLICY "Authenticated users can create resources" ON public.resources
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Uploaders can update their resources
CREATE POLICY "Uploaders can update own resources" ON public.resources
    FOR UPDATE USING (uploaded_by = auth.uid());

-- Resource Bookings policies
-- Users can view their own bookings
CREATE POLICY "Users can view own bookings" ON public.resource_bookings
    FOR SELECT USING (requested_by = auth.uid() OR 
                      EXISTS (
                        SELECT 1 FROM public.resources 
                        WHERE resources.id = resource_bookings.resource_id 
                        AND resources.uploaded_by = auth.uid()
                      ));

-- Authenticated users can create booking requests
CREATE POLICY "Authenticated users can create bookings" ON public.resource_bookings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = requested_by);

-- Users can update their own booking requests
CREATE POLICY "Users can update own bookings" ON public.resource_bookings
    FOR UPDATE USING (requested_by = auth.uid());

-- Resource owners can update booking status
CREATE POLICY "Resource owners can update booking status" ON public.resource_bookings
    FOR UPDATE USING (
      EXISTS (
        SELECT 1 FROM public.resources 
        WHERE resources.id = resource_bookings.resource_id 
        AND resources.uploaded_by = auth.uid()
      )
    );

-- Users can cancel their own bookings
CREATE POLICY "Users can cancel own bookings" ON public.resource_bookings
    FOR DELETE USING (requested_by = auth.uid());

-- Connections policies
-- Users can view their own connections
CREATE POLICY "Users can view own connections" ON public.connections
    FOR SELECT USING (user_id = auth.uid() OR connected_user_id = auth.uid());

-- Users can create connections
CREATE POLICY "Users can create connections" ON public.connections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own connection requests
CREATE POLICY "Users can update own connections" ON public.connections
    FOR UPDATE USING (user_id = auth.uid() OR connected_user_id = auth.uid());

-- Messages policies
-- Users can view messages in chats they participate in
CREATE POLICY "Users can view messages in their chats" ON public.messages
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.chat_participants
        WHERE chat_participants.chat_id = messages.chat_id
        AND chat_participants.user_id = auth.uid()
      )
    );

-- Users can send messages to chats they participate in
CREATE POLICY "Users can send messages to their chats" ON public.messages
    FOR INSERT WITH CHECK (
      auth.uid() = sender_id AND
      EXISTS (
        SELECT 1 FROM public.chat_participants
        WHERE chat_participants.chat_id = messages.chat_id
        AND chat_participants.user_id = auth.uid()
      )
    );

-- Chats policies
-- Users can view chats they participate in
CREATE POLICY "Users can view their chats" ON public.chats
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.chat_participants
        WHERE chat_participants.chat_id = chats.id
        AND chat_participants.user_id = auth.uid()
      )
    );

-- Authenticated users can create chats
CREATE POLICY "Authenticated users can create chats" ON public.chats
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);

-- Chat participants policies
-- Users can view participants in their chats
CREATE POLICY "Users can view participants in their chats" ON public.chat_participants
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.chat_participants cp
        WHERE cp.chat_id = chat_participants.chat_id
        AND cp.user_id = auth.uid()
      )
    );

-- Users can add themselves to chats (or be added by chat creator)
CREATE POLICY "Users can join chats" ON public.chat_participants
    FOR INSERT WITH CHECK (
      auth.uid() = user_id OR
      EXISTS (
        SELECT 1 FROM public.chats
        WHERE chats.id = chat_participants.chat_id
        AND chats.created_by = auth.uid()
      )
    );


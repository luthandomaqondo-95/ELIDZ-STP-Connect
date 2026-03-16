-- Run this SQL in your Supabase SQL Editor to update the database schema

-- 1. Add address column to profiles if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;

-- 2. Update existing 'SME' roles to 'SMME' to match new terminology
UPDATE public.profiles SET role = 'SMME' WHERE role = 'SME';

-- 3. Update the check constraint for roles to include 'SMME' and remove 'SME'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('Entrepreneur', 'Researcher', 'SMME', 'Student', 'Investor', 'Tenant'));

-- 4. Create or Replace the RPC function to handle profile creation including the address field
-- This ensures the signup flow works correctly even if RLS policies interfere with direct inserts

-- First, drop the existing function to avoid return type conflict
DROP FUNCTION IF EXISTS public.create_user_profile(uuid, text, text, text, text, text, text, text);

CREATE OR REPLACE FUNCTION public.create_user_profile(
  p_user_id UUID,
  p_name TEXT,
  p_email TEXT,
  p_role TEXT,
  p_address TEXT,
  p_organization TEXT DEFAULT NULL,
  p_bio TEXT DEFAULT NULL,
  p_avatar TEXT DEFAULT 'blue'
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, address, organization, bio, avatar)
  VALUES (p_user_id, p_name, p_email, p_role, p_address, p_organization, p_bio, p_avatar)
  ON CONFLICT (id) DO UPDATE
  SET 
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    address = EXCLUDED.address,
    organization = EXCLUDED.organization,
    bio = EXCLUDED.bio,
    avatar = EXCLUDED.avatar,
    updated_at = TIMEZONE('utc', NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


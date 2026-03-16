-- Add id_number column to profiles for signup
-- Run in Supabase Dashboard → SQL Editor

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS id_number TEXT;

-- Update create_user_profile RPC to include id_number (drops 8-param version if exists)
DROP FUNCTION IF EXISTS public.create_user_profile(uuid, text, text, text, text, text, text, text);
CREATE OR REPLACE FUNCTION public.create_user_profile(
  p_user_id UUID,
  p_name TEXT,
  p_email TEXT,
  p_role TEXT,
  p_address TEXT,
  p_organization TEXT DEFAULT NULL,
  p_bio TEXT DEFAULT NULL,
  p_avatar TEXT DEFAULT 'blue',
  p_id_number TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, address, organization, bio, avatar, id_number)
  VALUES (p_user_id, p_name, p_email, p_role, p_address, p_organization, p_bio, p_avatar, p_id_number)
  ON CONFLICT (email) DO UPDATE SET
    id = EXCLUDED.id,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    address = EXCLUDED.address,
    organization = EXCLUDED.organization,
    bio = EXCLUDED.bio,
    avatar = EXCLUDED.avatar,
    id_number = EXCLUDED.id_number,
    updated_at = TIMEZONE('utc', NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

NOTIFY pgrst, 'reload schema';

-- Fix: "Could not find the address column of profiles in the schema cache"
-- Run in Supabase Dashboard → SQL Editor

-- 1) Add the missing column (safe to run multiple times)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS address TEXT;

-- 2) Ask PostgREST (the REST API) to reload its schema cache
-- This helps when the column exists but PostgREST hasn't refreshed yet.
NOTIFY pgrst, 'reload schema';


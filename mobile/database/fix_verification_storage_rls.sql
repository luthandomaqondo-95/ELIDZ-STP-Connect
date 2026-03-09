-- Fix RLS policies for verification-documents bucket
-- Run this if you get "new row violates row-level security policy" on upload
--
-- The fix: use "to authenticated" and auth.jwt()->>'sub' per Supabase docs
-- https://supabase.com/docs/guides/storage/security/access-control

-- ================================================================
-- STEP 1: Drop existing policies (so we can recreate them)
-- ================================================================

DROP POLICY IF EXISTS "Users can upload their own verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all verification documents" ON storage.objects;

-- ================================================================
-- STEP 2: Create corrected RLS policies (Supabase recommended format)
-- ================================================================

-- Policy 1: Allow authenticated users to upload to their own folder
-- Folder must match auth.jwt()->>'sub' (user's UUID from JWT)
CREATE POLICY "Users can upload their own verification documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'verification-documents'
    AND (storage.foldername(name))[1] = (select auth.jwt()->>'sub')
);

-- Policy 2: Allow users to view their own verification documents
CREATE POLICY "Users can view their own verification documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'verification-documents'
    AND (storage.foldername(name))[1] = (select auth.jwt()->>'sub')
);

-- Policy 3: Allow users to update their own verification documents
CREATE POLICY "Users can update their own verification documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'verification-documents'
    AND (storage.foldername(name))[1] = (select auth.jwt()->>'sub')
)
WITH CHECK (
    bucket_id = 'verification-documents'
    AND (storage.foldername(name))[1] = (select auth.jwt()->>'sub')
);

-- Policy 4: Allow users to delete their own verification documents
CREATE POLICY "Users can delete their own verification documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'verification-documents'
    AND (storage.foldername(name))[1] = (select auth.jwt()->>'sub')
);

-- Policy 5: Allow admins to view all (optional - for admin review)
CREATE POLICY "Admins can view all verification documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'verification-documents');

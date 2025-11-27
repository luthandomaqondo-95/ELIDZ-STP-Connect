-- Create Storage Bucket for Verification Documents
-- This script creates the bucket and sets up RLS policies for SMME verification document uploads

-- ================================================================
-- STEP 1: Create the Storage Bucket
-- ================================================================

-- Insert the bucket into storage.buckets
-- Note: The bucket must be created through Supabase Dashboard or API
-- This SQL will attempt to create it, but you may need to create it manually first

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'verification-documents',
    'verification-documents',
    FALSE, -- Not public - requires authentication
    52428800, -- 50MB file size limit
    ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/heic', 'image/heif']
)
ON CONFLICT (id) DO UPDATE
SET 
    name = EXCLUDED.name,
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ================================================================
-- STEP 2: Create RLS Policies for the Bucket
-- ================================================================

-- Policy 1: Allow authenticated users to upload their own verification documents
CREATE POLICY "Users can upload their own verification documents"
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'verification-documents' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Allow users to view their own verification documents
CREATE POLICY "Users can view their own verification documents"
ON storage.objects
FOR SELECT
USING (
    bucket_id = 'verification-documents' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Allow users to update their own verification documents
CREATE POLICY "Users can update their own verification documents"
ON storage.objects
FOR UPDATE
USING (
    bucket_id = 'verification-documents' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'verification-documents' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Allow users to delete their own verification documents
CREATE POLICY "Users can delete their own verification documents"
ON storage.objects
FOR DELETE
USING (
    bucket_id = 'verification-documents' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 5: Allow admins to view all verification documents (for review purposes)
-- Note: Adjust this based on your admin role setup
CREATE POLICY "Admins can view all verification documents"
ON storage.objects
FOR SELECT
USING (
    bucket_id = 'verification-documents' 
    AND auth.role() = 'authenticated'
    -- Add your admin check here, e.g.:
    -- AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin')
);

-- ================================================================
-- STEP 3: Enable RLS on storage.objects (if not already enabled)
-- ================================================================

-- RLS should already be enabled on storage.objects by default
-- This is just a reminder that it needs to be enabled

-- ================================================================
-- VERIFICATION QUERY
-- ================================================================

-- Check if bucket was created successfully
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets
WHERE id = 'verification-documents';

-- Check if policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%verification%';


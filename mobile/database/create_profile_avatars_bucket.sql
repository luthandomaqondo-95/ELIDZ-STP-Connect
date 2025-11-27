-- Create Storage Bucket for Profile Avatars
-- This script creates the bucket and sets up RLS policies for profile picture uploads

-- ================================================================
-- STEP 1: Create the Storage Bucket
-- ================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'profile-avatars',
    'profile-avatars',
    TRUE, -- Public so profile pictures can be viewed by anyone
    5242880, -- 5MB file size limit (reasonable for profile pictures)
    ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/heic', 'image/heif']
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

-- Policy 1: Allow authenticated users to upload their own profile pictures
CREATE POLICY "Users can upload their own profile pictures"
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'profile-avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Allow anyone to view profile pictures (public bucket)
CREATE POLICY "Anyone can view profile pictures"
ON storage.objects
FOR SELECT
USING (
    bucket_id = 'profile-avatars'
);

-- Policy 3: Allow users to update their own profile pictures
CREATE POLICY "Users can update their own profile pictures"
ON storage.objects
FOR UPDATE
USING (
    bucket_id = 'profile-avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'profile-avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Allow users to delete their own profile pictures
CREATE POLICY "Users can delete their own profile pictures"
ON storage.objects
FOR DELETE
USING (
    bucket_id = 'profile-avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

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
WHERE id = 'profile-avatars';

-- Check if policies were created
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%profile%';


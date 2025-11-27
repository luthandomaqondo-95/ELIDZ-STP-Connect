-- Create Storage Bucket for Progress Reports
-- This bucket stores progress report documents uploaded by funded SMMEs

-- ================================================================
-- STEP 1: Create the storage bucket
-- ================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('progress-reports', 'progress-reports', FALSE) -- Private bucket
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- STEP 2: Create RLS Policies for progress-reports bucket
-- ================================================================

-- Policy 1: Allow SMMEs to upload their own progress reports
CREATE POLICY "SMMEs can upload their own progress reports"
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'progress-reports' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Allow SMMEs to view their own progress reports
CREATE POLICY "SMMEs can view their own progress reports"
ON storage.objects
FOR SELECT
USING (
    bucket_id = 'progress-reports' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Allow SMMEs to update their own progress reports
CREATE POLICY "SMMEs can update their own progress reports"
ON storage.objects
FOR UPDATE
USING (
    bucket_id = 'progress-reports' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'progress-reports' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Allow SMMEs to delete their own progress reports
CREATE POLICY "SMMEs can delete their own progress reports"
ON storage.objects
FOR DELETE
USING (
    bucket_id = 'progress-reports' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 5: Allow admins to view all progress reports (for review purposes)
-- Note: Adjust this based on your admin role setup
-- CREATE POLICY "Admins can view all progress reports"
-- ON storage.objects
-- FOR SELECT
-- USING (
--     bucket_id = 'progress-reports' 
--     AND auth.role() = 'authenticated'
--     -- Add your admin check here, e.g.:
--     -- AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin')
-- );

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
WHERE id = 'progress-reports';


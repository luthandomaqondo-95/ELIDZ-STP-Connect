# Setup Verification Documents Storage Bucket

## Problem
You're getting a "Bucket not found" error when trying to upload verification documents. This means the Supabase Storage bucket `verification-documents` doesn't exist yet.

## Solution Steps

### Option 1: Create Bucket via Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Navigate to your project: https://supabase.com/dashboard
   - Select your project

2. **Navigate to Storage**
   - Click on **Storage** in the left sidebar
   - Click **New bucket** button

3. **Create the Bucket**
   - **Name**: `verification-documents` (must be exact)
   - **Public bucket**: Unchecked (keep it private)
   - **File size limit**: 50 MB (or your preferred limit)
   - **Allowed MIME types**: 
     - `image/jpeg`
     - `image/png`
     - `image/jpg`
     - `application/pdf`
     - `application/msword`
     - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
     - `image/heic`
     - `image/heif`
   - Click **Create bucket**

4. **Set up RLS Policies**
   - Click on the `verification-documents` bucket
   - Go to **Policies** tab
   - Click **New Policy**
   - Use the SQL script below to create policies, OR create them manually:

### Option 2: Create Bucket via SQL Script

1. **Run the SQL Script**
   - Go to **SQL Editor** in Supabase Dashboard
   - Open the file: `mobile/database/create_verification_storage_bucket.sql`
   - Copy and paste the entire script
   - Click **Run**

2. **Verify the Bucket was Created**
   - Go to **Storage** → You should see `verification-documents` bucket
   - If it doesn't appear, you may need to create it manually via Dashboard first

### Option 3: Create Bucket via Supabase CLI (Advanced)

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Create the bucket
supabase storage create verification-documents --public false
```

## RLS Policies Setup

After creating the bucket, you need to set up Row Level Security (RLS) policies. Run this SQL in the **SQL Editor**:

```sql
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
```

## Verification

After setup, verify everything works:

1. **Check Bucket Exists**
   ```sql
   SELECT * FROM storage.buckets WHERE id = 'verification-documents';
   ```

2. **Check Policies Exist**
   ```sql
   SELECT policyname FROM pg_policies 
   WHERE tablename = 'objects' 
   AND policyname LIKE '%verification%';
   ```

3. **Test Upload**
   - Try uploading a document in the app
   - Check Storage → verification-documents → {your_user_id}
   - You should see the uploaded file

## Troubleshooting

### If bucket still not found after creation:
1. Refresh the Supabase Dashboard
2. Check bucket name is exactly `verification-documents` (no spaces, correct spelling)
3. Ensure you're using the correct project

### If upload still fails:
1. Check RLS policies are created correctly
2. Verify user is authenticated (`auth.uid()` is not null)
3. Check file size is under the limit
4. Check file type is in allowed MIME types

### If you get permission errors:
1. Ensure RLS policies allow the operation
2. Check that the user folder matches `auth.uid()`
3. Verify the user is authenticated

## Next Steps

Once the bucket is created and policies are set up:
1. Restart your app
2. Try uploading a verification document again
3. The error should be resolved!


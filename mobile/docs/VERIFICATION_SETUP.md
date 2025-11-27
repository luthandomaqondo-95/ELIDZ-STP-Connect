# SMME Verification Document Upload Setup

## Overview
This guide walks you through setting up Supabase Storage for SMME verification document uploads.

## 1. Create Storage Bucket in Supabase

### Step 1: Create the Bucket
1. Go to your **Supabase Dashboard**
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Configure the bucket:
   - **Name**: `verification-documents`
   - **Public bucket**: ✅ **YES** (so admins can view documents)
   - **File size limit**: `10 MB` (adjust as needed)
   - **Allowed MIME types**: Leave blank or specify:
     - `image/jpeg`
     - `image/png`
     - `image/heic`
     - `application/pdf`
     - `application/msword`
     - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

### Step 2: Set Up Storage Policies

Go to **Storage → Policies → verification-documents** and create these policies:

#### Policy 1: Allow Authenticated Users to Upload
```sql
-- Policy name: Users can upload their own verification documents
-- Operation: INSERT
-- Target roles: authenticated

CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'verification-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Policy 2: Allow Users to View Their Own Documents
```sql
-- Policy name: Users can view their own documents
-- Operation: SELECT
-- Target roles: authenticated

CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'verification-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Policy 3: Allow Users to Delete Their Own Documents
```sql
-- Policy name: Users can delete their own documents
-- Operation: DELETE
-- Target roles: authenticated

CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'verification-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Policy 4: Allow Public Read Access (for Admin Panel)
```sql
-- Policy name: Public read access for verification documents
-- Operation: SELECT
-- Target roles: anon, authenticated

CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'verification-documents');
```

## 2. Update Database Schema

Run this SQL in your **Supabase SQL Editor**:

```sql
-- Update document type constraint
ALTER TABLE public.sme_verifications 
DROP CONSTRAINT IF EXISTS sme_verifications_document_type_check;

ALTER TABLE public.sme_verifications 
ADD CONSTRAINT sme_verifications_document_type_check
CHECK (document_type IN ('Business Registration', 'ID Document', 'Business Profile', 'Tax Clearance', 'Other'));

-- Add unique constraint (one document per type per user)
ALTER TABLE public.sme_verifications 
DROP CONSTRAINT IF EXISTS sme_verifications_user_document_unique;

ALTER TABLE public.sme_verifications 
ADD CONSTRAINT sme_verifications_user_document_unique 
UNIQUE (user_id, document_type);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_sme_verifications_document_type 
ON public.sme_verifications(document_type);
```

## 3. Folder Structure

Documents will be organized like this:
```
verification-documents/
├── {user_id_1}/
│   ├── {user_id_1}_Business_Registration_1234567890.jpg
│   ├── {user_id_1}_ID_Document_1234567891.jpg
│   └── {user_id_1}_Business_Profile_1234567892.pdf
├── {user_id_2}/
│   ├── {user_id_2}_Business_Registration_1234567893.jpg
│   └── ...
```

## 4. Features Implemented

### Upload Function (`verification.service.ts`)
```typescript
async uploadDocument(fileUri: string, userId?: string, documentType?: string): Promise<string>
```

**Features:**
- ✅ Uploads to Supabase Storage
- ✅ Organizes by user ID in folders
- ✅ Generates unique filenames with timestamps
- ✅ Supports multiple file types (JPG, PNG, PDF, DOC, HEIC)
- ✅ Returns public URL for storage in database
- ✅ Proper error handling

### Delete Function
```typescript
async deleteDocument(documentUrl: string): Promise<void>
```

**Features:**
- ✅ Deletes from Supabase Storage
- ✅ Extracts file path from URL
- ✅ Error handling

## 5. Testing the Upload

### Test Upload Flow:
1. Sign up as an SMME user
2. Go to Profile → "Upload Documents"
3. Select 3 documents (Business Registration, ID, Business Profile)
4. Click "Submit All Documents"
5. Check Supabase Storage → verification-documents → {your_user_id}

### Verify in Database:
```sql
-- Check uploaded documents
SELECT * FROM public.sme_verifications WHERE user_id = '{your_user_id}';

-- Check storage files
SELECT * FROM storage.objects WHERE bucket_id = 'verification-documents';
```

## 6. File Size Limits

**Current Limits:**
- Default: 10 MB per file
- Recommended for documents: 5-10 MB
- For high-res scans: 10-20 MB

To change limits:
1. Go to **Storage → verification-documents → Settings**
2. Adjust "File size limit"

## 7. Supported File Types

**Images:**
- JPG/JPEG
- PNG
- HEIC/HEIF (iPhone photos)

**Documents:**
- PDF
- DOC/DOCX

To support more types, add to `getContentType()` in `verification.service.ts`.

## 8. Security Considerations

✅ **Implemented:**
- User can only upload to their own folder
- User can only view/delete their own documents
- Public read access for admin panel
- Unique constraint prevents duplicate document types

⚠️ **Additional Security (Optional):**
- Add file size validation client-side
- Add file type validation before upload
- Scan files for malware (use Supabase Edge Functions)
- Add rate limiting for uploads

## 9. Admin Access

Admins can:
1. View all documents via Supabase Dashboard → Storage
2. Download documents for review
3. Update verification status in database:

```sql
-- Approve document
UPDATE public.sme_verifications 
SET status = 'verified', updated_at = NOW() 
WHERE id = '{document_id}';

-- Reject document
UPDATE public.sme_verifications 
SET status = 'rejected', 
    rejection_reason = 'Document not clear. Please re-upload.',
    updated_at = NOW() 
WHERE id = '{document_id}';
```

## 10. Troubleshooting

### Error: "Failed to upload document"
- Check if bucket `verification-documents` exists
- Verify storage policies are set up
- Check user is authenticated

### Error: "Permission denied"
- Ensure user is logged in
- Verify RLS policies on storage.objects
- Check bucket is public

### Files not showing in Storage
- Check file was uploaded successfully
- Verify public URL is correct
- Look in correct user folder

## 11. Future Enhancements

- [ ] Add PDF document picker (install `expo-document-picker`)
- [ ] Add image compression before upload
- [ ] Add progress indicator during upload
- [ ] Add thumbnail generation for images
- [ ] Send email notification when documents are reviewed
- [ ] Create admin dashboard for document review

---

## Quick Setup Checklist

- [ ] Create `verification-documents` bucket in Supabase
- [ ] Make bucket public
- [ ] Add 4 storage policies
- [ ] Run database migrations
- [ ] Test upload with SMME account
- [ ] Verify files appear in Storage
- [ ] Test document approval workflow


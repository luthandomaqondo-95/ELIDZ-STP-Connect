-- Add verification_status column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('verified', 'pending', 'rejected', 'unverified'));

-- Update existing SMMEs to have a status if they are null
UPDATE public.profiles 
SET verification_status = 'pending' 
WHERE verification_status IS NULL;
-- Fix: Update the verification_status constraint to allow 'suspended'
-- First, drop the existing check constraint
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_verification_status_check;

-- Add the new constraint with 'suspended' included
ALTER TABLE profiles 
ADD CONSTRAINT profiles_verification_status_check 
CHECK (verification_status IN ('pending', 'approved', 'rejected', 'suspended', 'blue'));

-- Alternative: If you want to use a separate is_suspended flag instead:
-- ALTER TABLE profiles ADD COLUMN is_suspended BOOLEAN DEFAULT false;

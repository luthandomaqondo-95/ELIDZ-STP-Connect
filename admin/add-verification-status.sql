-- Check if verification_status column exists in profiles table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'verification_status'
    ) THEN
        -- Column exists, do nothing
        RAISE NOTICE 'verification_status column already exists';
    ELSE
        -- Add the column
        ALTER TABLE profiles 
        ADD COLUMN verification_status TEXT DEFAULT 'pending';
        
        RAISE NOTICE 'Added verification_status column to profiles table';
        
        -- Update existing records to have default value
        UPDATE profiles 
        SET verification_status = 'pending' 
        WHERE verification_status IS NULL;
        
        RAISE NOTICE 'Updated existing profiles with pending status';
    END IF;
END $$;

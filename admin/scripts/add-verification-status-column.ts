import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const databaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
    console.error('Error: DATABASE_URL is not set in environment variables.');
    console.error('Please ensure you have a .env.local file with NEXT_PUBLIC_SUPABASE_URL pointing to your Supabase PostgreSQL database.');
    process.exit(1);
}

const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
});

async function addVerificationStatusColumn() {
    const client = await pool.connect();
    try {
        console.log('Adding verification_status column to profiles table...');
        
        // Check if column already exists
        const checkColumnQuery = `
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'profiles' 
            AND column_name = 'verification_status'
        `;
        
        const result = await client.query(checkColumnQuery);
        
        if (result.rows.length > 0) {
            console.log('✅ verification_status column already exists in profiles table');
            return;
        }
        
        // Add the column if it doesn't exist
        const alterTableQuery = `
            ALTER TABLE profiles 
            ADD COLUMN verification_status TEXT DEFAULT 'pending';
        `;
        
        await client.query(alterTableQuery);
        console.log('✅ Successfully added verification_status column to profiles table');
        
        // Update existing profiles to have 'pending' status if they don't have one
        const updateExistingQuery = `
            UPDATE profiles 
            SET verification_status = 'pending' 
            WHERE verification_status IS NULL;
        `;
        
        await client.query(updateExistingQuery);
        console.log('✅ Updated existing profiles to have pending verification status');
        
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

addVerificationStatusColumn();

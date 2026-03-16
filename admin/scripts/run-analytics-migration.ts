import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from the admin .env file (assuming it's in admin/ or root)
// Trying root first, then admin/
dotenv.config({ path: path.join(__dirname, '../../../../.env') }); 
dotenv.config({ path: path.join(__dirname, '../../../../admin/.env') });

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!databaseUrl) {
    console.error('Error: DATABASE_URL is not set in environment variables.');
    console.error('Please ensure you have a .env file with DATABASE_URL pointing to your Supabase PostgreSQL database.');
    process.exit(1);
}

const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
});

async function runMigration() {
    const client = await pool.connect();
    try {
        const sqlPath = path.join(__dirname, '../../../../mobile/database/add_analytics_table.sql');
        console.log(`Reading migration file: ${sqlPath}`);
        
        if (!fs.existsSync(sqlPath)) {
            throw new Error(`Migration file not found at ${sqlPath}`);
        }

        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        console.log('Running migration...');
        await client.query(sql);
        console.log('Migration completed successfully!');
        
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration();


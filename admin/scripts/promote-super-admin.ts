import pkg from "pg";
import * as dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Resolve path to admin/.env.local relative to project root
const envPath = path.join(process.cwd(), "admin", ".env.local");

console.log(`Loading environment variables from: ${envPath}`);

if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
} else {
    console.error("Warning: admin/.env.local file not found.");
}

const { Pool } = pkg;

if (!process.env.DATABASE_URL) {
    console.error("Error: DATABASE_URL environment variable is not set in admin/.env.local");
    // Fallback: Try to construct it from Supabase vars if available (unlikely to work for connection pool without password)
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

async function promoteToSuperAdmin() {
    const client = await pool.connect();
    try {
        console.log("Connected to database...");

        // 1. Fix invalid roles (set them to 'Tenant' as default)
        console.log("Fixing invalid roles...");
        await client.query(`
            UPDATE public.profiles
            SET role = 'Tenant'
            WHERE role NOT IN ('Entrepreneur', 'Researcher', 'SME', 'Student', 'Investor', 'Tenant', 'Admin', 'Super Admin');
        `);

        // 2. Drop the existing constraint
        console.log("Dropping old role constraint...");
        await client.query(`
            ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
        `);

        // 3. Add the new constraint including 'Super Admin'
        console.log("Adding new role constraint...");
        await client.query(`
            ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
            CHECK (role IN ('Entrepreneur', 'Researcher', 'SME', 'Student', 'Investor', 'Tenant', 'Admin', 'Super Admin'));
        `);

        // 4. Promote the user
        const email = "tebogolekgothoane5@gmail.com";
        console.log(`Promoting user ${email} to Super Admin...`);
        const res = await client.query(`
            UPDATE public.profiles 
            SET role = 'Super Admin' 
            WHERE email = $1
            RETURNING id, name, email, role;
        `, [email]);

        if (res.rowCount === 0) {
            console.warn(`User with email ${email} not found.`);
        } else {
            console.log("Success! User updated:", res.rows[0]);
        }

    } catch (err) {
        console.error("Error executing script:", err);
    } finally {
        client.release();
        await pool.end();
    }
}

promoteToSuperAdmin();

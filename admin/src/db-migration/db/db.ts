import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

if (!process.env.DATABASE_URL) {
	throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: { rejectUnauthorized: false },
	max: 100,
	idleTimeoutMillis: 30000, // 30 seconds
});

export const db = drizzle(pool);


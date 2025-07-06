import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  console.warn(
    "⚠️  DATABASE_URL is not set. Please set up your database connection."
  );
  console.warn("📝 See setup.md for database setup instructions");
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Validate the database URL format
const dbUrl = process.env.DATABASE_URL;
if (dbUrl.includes('localhost') || dbUrl.includes('username:password')) {
  console.warn("⚠️  You're using a placeholder database URL.");
  console.warn("🔧 Please update your .env file with a real database connection.");
  console.warn("📖 Check setup.md for instructions on setting up a free database.");
  throw new Error(
    "Please update DATABASE_URL in your .env file with a real database connection. See setup.md for instructions."
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
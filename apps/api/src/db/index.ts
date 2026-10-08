import { config } from 'dotenv';
import { resolve } from 'node:path';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema.js';

config({ path: resolve(process.cwd(), '../../.env') });
config({ path: resolve(process.cwd(), '.env') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DATABASE_URL is required. Start local PostgreSQL and configure your environment.',
  );
}

export const sql = postgres(connectionString, {
  max: Number(process.env.DB_POOL_MAX ?? '10'),
  idle_timeout: 20,
  connect_timeout: 10,
  max_lifetime: 60 * 30,
  connection: { application_name: 'dockpilot-api' },
});

export const db = drizzle(sql, { schema });
export type Database = typeof db;

export async function closeDatabase(): Promise<void> {
  await sql.end({ timeout: 5 });
}

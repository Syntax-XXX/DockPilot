import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'drizzle-kit';

config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });
config({ path: fileURLToPath(new URL('./.env', import.meta.url)) });

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is required. Copy `.env.example` to `.env` and configure a database.',
  );
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL },
  verbose: true,
});

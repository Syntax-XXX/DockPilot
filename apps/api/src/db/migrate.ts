import { config } from 'dotenv';
import { resolve } from 'node:path';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

config({ path: resolve(process.cwd(), '../../.env') });
config({ path: resolve(process.cwd(), '.env') });
import { db, closeDatabase } from './index.js';

try {
  await migrate(db, { migrationsFolder: new URL('../../drizzle', import.meta.url).pathname });
  console.info('DockPilot database migrations applied successfully.');
} finally {
  await closeDatabase();
}

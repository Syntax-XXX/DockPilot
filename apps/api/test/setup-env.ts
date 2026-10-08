import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';

config({ path: fileURLToPath(new URL('../../../.env', import.meta.url)) });

process.env.NODE_ENV = 'test';
process.env.SESSION_SECRET = 'vitest-integration-test-only-random-secret-not-for-production';
process.env.WEB_ORIGIN = 'http://127.0.0.1:5173';
process.env.TRUSTED_PROXY = 'false';
process.env.HOST = '127.0.0.1';
process.env.API_PORT = '4000';
process.env.DATABASE_URL ??=
  'postgresql://dockpilot:local-development-only@127.0.0.1:54329/dockpilot';

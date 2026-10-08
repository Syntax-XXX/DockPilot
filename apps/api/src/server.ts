import { closeDatabase, sql } from './db/index.js';
import { env } from './lib/security.js';
import { buildApp } from './app.js';

const app = await buildApp();
const port = Number(process.env.API_PORT ?? '4000');
if (!Number.isSafeInteger(port) || port < 1 || port > 65535) {
  throw new Error('API_PORT must be an integer between 1 and 65535.');
}
const address = process.env.HOST ?? '127.0.0.1';
if (
  env.NODE_ENV !== 'production' &&
  address !== '127.0.0.1' &&
  address !== '::1' &&
  address !== 'localhost'
) {
  throw new Error('Development API must bind to loopback only. Set HOST=127.0.0.1.');
}

try {
  await sql`SELECT 1`;
  await app.listen({ port, host: address });
  app.log.info({ address, port }, 'DockPilot API listening');
} catch (error) {
  app.log.error({ err: error }, 'DockPilot API failed to start');
  try {
    await app.close();
  } catch (closeError) {
    app.log.error({ err: closeError }, 'Failed to close API during startup failure');
  }
  try {
    await closeDatabase();
  } catch (closeError) {
    app.log.error({ err: closeError }, 'Failed to close database during startup failure');
  }
  process.exitCode = 1;
  throw error;
}

let closing = false;
async function shutdown(signal: NodeJS.Signals): Promise<void> {
  if (closing) return;
  closing = true;
  app.log.info({ signal }, 'Shutting down DockPilot API');
  const shutdownTimeout = setTimeout(() => {
    app.log.error('Graceful shutdown timed out; terminating process.');
    process.exit(1);
  }, 15_000);
  shutdownTimeout.unref();
  try {
    await app.close();
    await closeDatabase();
    process.exitCode = 0;
  } catch (error) {
    app.log.error({ err: error }, 'Graceful shutdown failed');
    process.exitCode = 1;
  } finally {
    clearTimeout(shutdownTimeout);
  }
}

process.once('SIGTERM', (signal) => void shutdown(signal));
process.once('SIGINT', (signal) => void shutdown(signal));

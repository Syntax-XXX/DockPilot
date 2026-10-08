import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['./test/unit/**/*.test.ts'],
          setupFiles: ['./test/setup-env.ts'],
          testTimeout: 20_000,
          hookTimeout: 20_000,
        },
      },
      {
        extends: true,
        test: {
          name: 'integration',
          include: ['./test/integration/**/*.test.ts'],
          setupFiles: ['./test/setup-env.ts'],
          testTimeout: 30_000,
          hookTimeout: 30_000,
        },
      },
    ],
    environment: 'node',
    globals: true,
    pool: 'forks',
    maxWorkers: 1,
    fileParallelism: false,
  },
});

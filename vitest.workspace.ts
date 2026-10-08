import { defineProject } from 'vitest/config';

export default [
  {
    test: {
      name: 'unit',
      environment: 'node',
      include: ['test/unit/**/*.test.ts'],
      setupFiles: ['./apps/api/test/setup-env.ts'],
      globals: true,
      fileParallelism: false,
      testTimeout: 20_000,
    },
  },
  {
    test: {
      name: 'integration',
      environment: 'node',
      include: ['test/integration/**/*.test.ts'],
      setupFiles: ['./apps/api/test/setup-env.ts'],
      globals: true,
      fileParallelism: false,
      testTimeout: 30_000,
      hookTimeout: 30_000,
    },
  },
].map(defineProject);

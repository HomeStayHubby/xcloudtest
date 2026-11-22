import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // Tests wipe and reseed tables, so they must NEVER touch the real database.
    env: {
      DATABASE_URL: './data/elitequest.test.db',
    },
    sequence: {
      concurrent: false,
    },
    fileParallelism: false,
  },
});

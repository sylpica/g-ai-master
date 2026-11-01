import { defineConfig } from '@playwright/test';

const PORT = process.env.PW_PORT ?? '4173';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  use: { baseURL: `http://localhost:${PORT}`, locale: 'ja-JP' },
  webServer: {
    command: `npx vite preview --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 60_000,
  },
});

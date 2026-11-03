import { defineConfig } from '@playwright/test';

const PORT = process.env.PW_PORT ?? '4173';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: 'ja-JP',
    // 実行環境に別版のChromiumしかない場合は PW_CHROMIUM_PATH で指定する（未指定なら Playwright 既定のブラウザ）
    launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
  },
  webServer: {
    command: `npx vite preview --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 60_000,
  },
});

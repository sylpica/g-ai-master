import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages のサブディレクトリでも動作するよう相対ベースを採用（画面遷移は状態ベース）
export default defineConfig({
  base: './',
  plugins: [react()],
  test: { environment: 'node', include: ['tests/unit/**/*.test.ts'] },
} as never);

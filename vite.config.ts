import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages のサブディレクトリでも動作するよう相対ベースを採用（画面遷移は状態ベース）
// 出力は「ライブラリ」「教材データ」「アプリ本体」に分ける。教材だけを更新した版ではライブラリのファイル名（ハッシュ）が
// 変わらないため、ブラウザのキャッシュを再利用でき、更新時の再ダウンロード量が減る。
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) return 'vendor';
          if (id.includes('/src/data/')) return 'content';
          return undefined;
        },
      },
    },
  },
  test: { environment: 'node', include: ['tests/unit/**/*.test.ts'] },
} as never);

import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  oxc: {
    jsx: {
      runtime: 'automatic',
    },
  },
  resolve: {
    alias: [
      {
        find: /^(components|constants|pages|tests|types|utils)\//,
        replacement: `${rootDir}$1/`,
      },
    ],
  },
  test: {
    environment: 'node',
    // 表示日付が実行環境のタイムゾーンで揺れないように固定する
    env: {
      TZ: 'Asia/Tokyo',
    },
    exclude: ['**/node_modules/**', '**/.next/**', '**/prisma/**'],
  },
});

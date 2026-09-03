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
    env: {
      // 表示日付が実行環境のタイムゾーンで揺れないように固定する
      TZ: 'Asia/Tokyo',
      // 開発用 DB を壊さないよう、テスト中の DATABASE_URL はテスト用 DB で上書きする。
      // 未設定なら空文字になり、テスト側のガードが落ちる
      DATABASE_URL: process.env.TEST_DATABASE_URL ?? '',
    },
    exclude: ['**/node_modules/**', '**/.next/**', '**/prisma/**'],
  },
});

import { imageMigrationError, type ImageMigrationPhase } from '../utils/steamImageMigrationError';
import { createPrismaClient } from '../utils/api/createPrismaClient';
import { SteamRateLimitError } from '../utils/api/steamPost';
import { syncSteamImageBatch, SteamImageSyncError } from '../utils/api/syncSteamImages';
import { SteamSyncPausedError } from '../utils/api/steamSyncThrottle';
import { setTimeout } from 'node:timers/promises';

async function main() {
  const apply = process.argv.includes('--apply');
  const key = process.env.STEAM_WEB_API_KEY;
  if (!key || !process.env.DATABASE_URL) {
    console.error(
      !key
        ? 'STEAM_WEB_API_KEYが未設定です。実行シェルに設定してください。'
        : 'DATABASE_URLが未設定です。実行シェルに対象DBの接続情報を設定してください。',
    );
    process.exitCode = 1;
    return;
  }
  let database: URL;
  try {
    database = new URL(process.env.DATABASE_URL);
    if (!['postgres:', 'postgresql:'].includes(database.protocol) || !database.hostname) throw new Error();
  } catch {
    console.error('DATABASE_URLが有効なPostgreSQL接続URLではありません。');
    process.exitCode = 1;
    return;
  }
  console.log(
    `接続先DB: ${database.hostname}:${database.port || '5432'}${database.pathname}（認証情報は表示しません）`,
  );
  let phase: ImageMigrationPhase = 'DB接続';
  let prisma: ReturnType<typeof createPrismaClient>;
  try {
    prisma = createPrismaClient();
    let cursor = 0;
    while (true) {
      phase = '画像の保存';
      const result = await syncSteamImageBatch(prisma, key, cursor, apply);
      console.log(
        `確認${result.processed}件、保存${result.updated}件、画像未取得${result.unavailable}件。${apply ? '適用' : '確認のみ'}`,
      );
      if (result.nextCursor === null) break;
      cursor = result.nextCursor;
      await setTimeout((result.waitSeconds ?? 2) * 1000);
    }
  } catch (error) {
    console.error(
      error instanceof SteamRateLimitError ||
        error instanceof SteamSyncPausedError ||
        error instanceof SteamImageSyncError
        ? error.message
        : imageMigrationError(error, phase),
    );
    process.exitCode = 1;
  } finally {
    if (prisma)
      await prisma.$disconnect().catch(() => {
        console.error('DB接続の終了に失敗しました。');
        process.exitCode = 1;
      });
  }
}
void main().catch(() => {
  console.error('画像移行の設定を確認してください。');
  process.exitCode = 1;
});

import { Prisma } from '@prisma/client';
import { fetchSteamImages, SteamRateLimitError } from './steamPost';
import {
  acquireSteamSyncLease,
  releaseSteamSyncLease,
  SteamSyncPausedError,
  STEAM_SYNC_INTERVAL_SECONDS,
  type SteamSyncLease,
} from './steamSyncThrottle';
import { imageMigrationError, type ImageMigrationPhase } from '../steamImageMigrationError';

export type SteamImageSyncResult = {
  processed: number;
  updated: number;
  unavailable: number;
  nextCursor: number | null;
  waitSeconds?: number;
};

export class SteamImageSyncError extends Error {}

export async function syncSteamImageBatch(
  db: Prisma.TransactionClient,
  key: string,
  afterId: number,
  apply = true,
): Promise<SteamImageSyncResult> {
  let phase: ImageMigrationPhase = '投稿の読み取り';
  let lease: SteamSyncLease | undefined;
  let waitSeconds = STEAM_SYNC_INTERVAL_SECONDS;
  try {
    const candidates = await db.achievementPost.findMany({
      where: { image_url: null, id: { gt: afterId } },
      orderBy: { id: 'asc' },
      take: 51,
      select: { id: true, steam_id: true },
    });
    const posts = candidates.slice(0, 50);
    if (!posts.length) return { processed: 0, updated: 0, unavailable: 0, nextCursor: null };
    phase = 'DB接続';
    lease = await acquireSteamSyncLease(db, key);
    phase = 'Steam画像取得';
    const images = await fetchSteamImages(
      posts.map((post) => post.steam_id),
      key,
    );
    const values = posts.flatMap((post) => {
      const url = images.get(post.steam_id);
      return url ? [Prisma.sql`(${post.id}::integer, ${post.steam_id}::integer, ${url}::text)`] : [];
    });
    phase = '画像の保存';
    // 一括更新時もゲームの変更と登録済み画像を保護する。
    const updated =
      apply && values.length
        ? await db.$executeRaw`
      UPDATE "AchievementPost" AS post SET "image_url" = images.url
      FROM (VALUES ${Prisma.join(values)}) AS images(id, steam_id, url)
      WHERE post.id = images.id AND post.steam_id = images.steam_id AND post.image_url IS NULL
    `
        : 0;
    return {
      processed: posts.length,
      updated,
      unavailable: posts.length - values.length,
      nextCursor: candidates.length > 50 ? posts[posts.length - 1].id : null,
      waitSeconds,
    };
  } catch (error) {
    if (error instanceof SteamRateLimitError) {
      waitSeconds = error.retryAfterSeconds;
      throw error;
    }
    if (error instanceof SteamSyncPausedError) throw error;
    throw new SteamImageSyncError(imageMigrationError(error, phase));
  } finally {
    if (lease) {
      try {
        await releaseSteamSyncLease(db, lease, waitSeconds);
      } catch {
        throw new SteamImageSyncError(
          '画像同期の待機状態を保存できませんでした。60秒以上待ってから再実行してください。',
        );
      }
    }
  }
}

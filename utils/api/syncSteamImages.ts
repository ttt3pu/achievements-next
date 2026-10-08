import { Prisma } from '@prisma/client';
import { fetchSteamImages } from './steamPost';
import { imageMigrationError, type ImageMigrationPhase } from '../steamImageMigrationError';

export type SteamImageSyncResult = {
  processed: number;
  updated: number;
  unavailable: number;
  nextCursor: number | null;
};

export class SteamImageSyncError extends Error {}

export async function syncSteamImageBatch(
  db: Prisma.TransactionClient,
  key: string,
  afterId: number,
): Promise<SteamImageSyncResult> {
  let phase: ImageMigrationPhase = '投稿の読み取り';
  try {
    const candidates = await db.achievementPost.findMany({
      where: { image_url: null, id: { gt: afterId } },
      orderBy: { id: 'asc' },
      take: 51,
      select: { id: true, steam_id: true },
    });
    const posts = candidates.slice(0, 50);
    if (!posts.length) return { processed: 0, updated: 0, unavailable: 0, nextCursor: null };
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
    const updated = values.length
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
    };
  } catch (error) {
    throw new SteamImageSyncError(imageMigrationError(error, phase));
  }
}

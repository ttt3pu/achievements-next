import { imageMigrationError, type ImageMigrationPhase } from '../utils/steamImageMigrationError';
import { createPrismaClient } from '../utils/api/createPrismaClient';
import { fetchSteamImages } from '../utils/api/steamPost';

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
    phase = '投稿の読み取り';
    const posts = await prisma.achievementPost.findMany({
      where: { image_url: null },
      select: { id: true, steam_id: true },
    });
    console.log(`画像未登録: ${posts.length}件。${apply ? '保存を実行' : '確認のみ（保存しません）'}。`);
    for (let start = 0; start < posts.length; start += 50) {
      const batch = posts.slice(start, start + 50);
      phase = 'Steam画像取得';
      const images = await fetchSteamImages(
        batch.map((post) => post.steam_id),
        key,
      );
      for (const post of batch) {
        const url = images.get(post.steam_id);
        if (url && apply) {
          phase = '画像の保存';
          await prisma.achievementPost.updateMany({
            where: { id: post.id, steam_id: post.steam_id, image_url: null },
            data: { image_url: url },
          });
        }
      }
      console.log(`対象${batch.length}件、画像取得${images.size}件。`);
    }
  } catch (error) {
    console.error(imageMigrationError(error, phase));
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

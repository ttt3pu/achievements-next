import { createPrismaClient } from '../utils/api/createPrismaClient';
import { fetchSteamImages } from '../utils/api/steamPost';

async function main() {
  const apply = process.argv.includes('--apply');
  const key = process.env.STEAM_WEB_API_KEY;
  if (!key) throw new Error('STEAM_WEB_API_KEYを設定してください。');
  const prisma = createPrismaClient();
  try {
    const posts = await prisma.achievementPost.findMany({
      where: { image_url: null },
      select: { id: true, steam_id: true },
    });
    console.log(`画像未登録: ${posts.length}件。${apply ? '保存を実行' : '確認のみ（保存しません）'}。`);
    for (let start = 0; start < posts.length; start += 50) {
      const batch = posts.slice(start, start + 50);
      const images = await fetchSteamImages(
        batch.map((post) => post.steam_id),
        key,
      );
      for (const post of batch) {
        const url = images.get(post.steam_id);
        if (url && apply) {
          await prisma.achievementPost.updateMany({
            where: { id: post.id, steam_id: post.steam_id, image_url: null },
            data: { image_url: url },
          });
        }
      }
      console.log(`対象${batch.length}件、画像取得${images.size}件。`);
    }
  } catch {
    console.error('画像移行を完了できませんでした。DB接続とSteam設定を確認してください。');
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}
void main().catch(() => {
  console.error('画像移行の設定を確認してください。');
  process.exitCode = 1;
});

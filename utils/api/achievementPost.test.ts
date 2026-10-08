import { acquireSteamSyncLease, releaseSteamSyncLease, SteamSyncPausedError } from './steamSyncThrottle';
import { SteamRateLimitError } from './steamPost';
import { syncSteamImageBatch } from './syncSteamImages';
import { fetchSteamImages } from './steamPost';
import type { AchievementPost } from '@prisma/client';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { achievementPosts } from 'tests/fixtures/achievement-posts';
import { createPrismaClient } from 'utils/api/createPrismaClient';
import {
  changeAchievementPostOrder,
  createAchievementPost,
  deleteAchievementPost,
  findAchievementPost,
  listAchievementPosts,
  updateAchievementPost,
  type AchievementPostInput,
  type SortKey,
} from 'utils/api/achievementPost';

vi.mock('./steamPost', async (original) => ({
  ...(await original<typeof import('./steamPost')>()),
  fetchSteamImages: vi.fn(),
}));

// テーブルを空にしてから流すので、開発用や本番の DB に向いていたら実行させない
const databaseName = new URL(process.env.DATABASE_URL || 'postgresql://invalid/').pathname.slice(1);

if (!databaseName.endsWith('_test')) {
  throw new Error(
    `テスト用 DB が必要です。末尾が _test のデータベースを TEST_DATABASE_URL に設定してください（make test-db）。現在: ${databaseName || '未設定'}`,
  );
}

const prisma = createPrismaClient();

// フィクスチャは JSON を通った後の形なので、DB へ入れる前に Date へ戻す
const rows = achievementPosts.map((post) => ({
  ...post,
  created_at: new Date(post.created_at),
  updated_at: new Date(post.updated_at),
  completed_at: new Date(post.completed_at),
}));

// API のレスポンスは JSON になってからページへ渡るので、その形で固定する
function asJson(posts: AchievementPost | AchievementPost[]) {
  return JSON.parse(JSON.stringify(posts));
}

function sortValues(posts: AchievementPost[], sortKey: SortKey): number[] {
  return posts.map((post) => (sortKey === 'completed_at' ? post.completed_at.getTime() : post[sortKey]));
}

function orders(posts: AchievementPost[]): { id: number; sort_order: number }[] {
  return posts.map(({ id, sort_order }) => ({ id, sort_order }));
}

const input: AchievementPostInput = {
  steam_id: 900007,
  image_url: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/900007/hash/header.jpg',
  title: 'Snowfall Signal',
  total_hours: 55,
  rating: 3,
  yarikomi_rating: 4,
  difficulty_rating: 2,
  is_idle_game: false,
  completed_at: new Date('2025-02-10T15:00:00.000Z'),
  content: '# 総評\n- 雪山の探索が楽しい\n  - 実績は素直\n\n## 難所\n- 終盤のタイムアタック',
};

beforeEach(async () => {
  await prisma.$executeRaw`DELETE FROM "SteamApiThrottle"`;
  await prisma.achievementPost.deleteMany();
  await prisma.achievementPost.createMany({ data: rows });

  // フィクスチャは id を明示して入れるので、作成のテストが採番する id とぶつからないよう
  // シーケンスをフィクスチャの最大値まで進めておく
  const maxId = Math.max(...rows.map((row) => row.id));

  await prisma.$queryRaw`SELECT setval(pg_get_serial_sequence('"AchievementPost"', 'id'), ${maxId}::bigint)`;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('実績記事の一覧取得', () => {
  it('トップページへ渡る sort_order 昇順の JSON が変わらないこと', async () => {
    expect(asJson(await listAchievementPosts(prisma, 'sort_order', 'asc'))).toMatchSnapshot();
  });

  const sortKeys: SortKey[] = [
    'sort_order',
    'total_hours',
    'rating',
    'yarikomi_rating',
    'difficulty_rating',
    'completed_at',
  ];

  it.each(sortKeys)('%s の昇順と降順で並び替わること', async (sortKey) => {
    const asc = await listAchievementPosts(prisma, sortKey, 'asc');
    const desc = await listAchievementPosts(prisma, sortKey, 'desc');

    expect(asc).toHaveLength(rows.length);
    expect(sortValues(asc, sortKey)).toEqual([...sortValues(asc, sortKey)].sort((a, b) => a - b));
    expect(sortValues(desc, sortKey)).toEqual([...sortValues(asc, sortKey)].reverse());
  });
});

describe('実績記事の 1 件取得', () => {
  it('詳細ページへ渡る 1 件の JSON が変わらないこと', async () => {
    expect(asJson(await findAchievementPost(prisma, rows[1].id))).toMatchSnapshot();
  });

  it('存在しない id では null が返ること', async () => {
    expect(await findAchievementPost(prisma, 999999)).toBeNull();
  });
});

describe('実績記事の作成', () => {
  it('最後尾の sort_order で追加され、渡した値がそのまま保存されること', async () => {
    await createAchievementPost(prisma, input);

    const posts = await listAchievementPosts(prisma, 'sort_order', 'desc');
    const created = posts[0];

    expect(posts).toHaveLength(rows.length + 1);
    expect(created.sort_order).toBe(Math.max(...rows.map((row) => row.sort_order)) + 1);
    expect(created).toMatchObject(input);
  });
});

describe('実績記事の編集', () => {
  it('渡した値で上書きされ、sort_order と created_at は保たれること', async () => {
    const target = rows[2];

    await updateAchievementPost(prisma, target.id, input);

    const updated = await findAchievementPost(prisma, target.id);

    expect(updated).toMatchObject(input);
    expect(updated.sort_order).toBe(target.sort_order);
    expect(updated.created_at).toEqual(target.created_at);
    expect(updated.updated_at.getTime()).toBeGreaterThan(target.updated_at.getTime());
  });
});

describe('実績記事の並び替え', () => {
  it('指定した記事が新しい sort_order になり、それ以降の記事が 1 つずつ後ろへずれること', async () => {
    await changeAchievementPostOrder(prisma, 5, 2);

    expect(orders(await listAchievementPosts(prisma, 'sort_order', 'asc'))).toEqual([
      { id: 1, sort_order: 1 },
      { id: 5, sort_order: 2 },
      { id: 2, sort_order: 3 },
      { id: 3, sort_order: 4 },
      { id: 4, sort_order: 5 },
      { id: 6, sort_order: 7 },
    ]);
  });
});

describe('実績記事の削除', () => {
  it('削除した記事が一覧から消えること', async () => {
    await deleteAchievementPost(prisma, rows[0].id);

    const posts = await listAchievementPosts(prisma, 'sort_order', 'asc');

    expect(posts.map((post) => post.id)).toEqual(rows.slice(1).map((row) => row.id));
    expect(await findAchievementPost(prisma, rows[0].id)).toBeNull();
  });
});

describe('未登録の投稿画像の一括保存', () => {
  it('取得画像を保存しても既存画像と本文・評価・更新日時を変更せず、再実行は未登録だけを対象にすること', async () => {
    const existing = rows[0];
    const target = rows[1];
    const existingUrl = `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${existing.steam_id}/existing.jpg`;
    const newUrl = `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${target.steam_id}/header.jpg`;
    await prisma.achievementPost.update({ where: { id: existing.id }, data: { image_url: existingUrl } });
    vi.mocked(fetchSteamImages).mockResolvedValue(new Map([[target.steam_id, newUrl]]));
    const result = await syncSteamImageBatch(prisma, 'test-key', 0);
    expect(result).toEqual({
      processed: rows.length - 1,
      updated: 1,
      unavailable: rows.length - 2,
      nextCursor: null,
      waitSeconds: 2,
    });
    expect(await prisma.achievementPost.findUnique({ where: { id: target.id } })).toEqual(
      expect.objectContaining({ ...target, image_url: newUrl }),
    );
    expect((await prisma.achievementPost.findUnique({ where: { id: existing.id } })).image_url).toBe(existingUrl);
    vi.mocked(fetchSteamImages).mockClear();
    vi.mocked(fetchSteamImages).mockResolvedValue(new Map());
    await prisma.$executeRaw`UPDATE "SteamApiThrottle" SET next_allowed_at = NOW() - INTERVAL '1 second'`;
    await syncSteamImageBatch(prisma, 'test-key', 0);
    expect(fetchSteamImages).toHaveBeenCalledWith(
      rows.slice(2).map((row) => row.steam_id),
      'test-key',
    );
  });
  it('取得中に手動登録された画像を上書きしないこと', async () => {
    const target = rows[0];
    vi.mocked(fetchSteamImages).mockImplementation(async () => {
      await prisma.achievementPost.update({ where: { id: target.id }, data: { image_url: 'manual-image' } });
      return new Map([[target.steam_id, 'api-image']]);
    });
    expect((await syncSteamImageBatch(prisma, 'test-key', 0)).updated).toBe(0);
    expect((await prisma.achievementPost.findUnique({ where: { id: target.id } })).image_url).toBe('manual-image');
  });
  it('51件以上は50件で区切り、次の開始位置を返すこと', async () => {
    await prisma.achievementPost.deleteMany();
    await prisma.achievementPost.createMany({
      data: Array.from({ length: 51 }, (_, i) => ({ ...rows[0], id: i + 100, steam_id: i + 910000 })),
    });
    vi.mocked(fetchSteamImages).mockResolvedValue(new Map());
    const result = await syncSteamImageBatch(prisma, 'test-key', 0);
    expect(result.processed).toBe(50);
    expect(result.nextCursor).toBe(149);
    expect(vi.mocked(fetchSteamImages).mock.calls.at(-1)[0]).toHaveLength(50);
    await prisma.$executeRaw`UPDATE "SteamApiThrottle" SET next_allowed_at = NOW() - INTERVAL '1 second'`;
    expect(await syncSteamImageBatch(prisma, 'test-key', 149)).toEqual({
      processed: 1,
      updated: 0,
      unavailable: 1,
      nextCursor: null,
      waitSeconds: 2,
    });
  });
  it('対象がなければSteamへ問い合わせないこと', async () => {
    vi.mocked(fetchSteamImages).mockClear();
    expect((await syncSteamImageBatch(prisma, 'test-key', 2147483647)).processed).toBe(0);
    expect(fetchSteamImages).not.toHaveBeenCalled();
  });
});

describe('サーバー間で共有する画像同期の制限', () => {
  it('同時要求のうち1件だけが実行権を取得すること', async () => {
    const attempts = await Promise.allSettled([
      acquireSteamSyncLease(prisma, 'test-key'),
      acquireSteamSyncLease(prisma, 'test-key'),
    ]);
    expect(attempts.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    const failure = attempts.find((result) => result.status === 'rejected') as PromiseRejectedResult;
    expect(failure.reason).toBeInstanceOf(SteamSyncPausedError);
  });
  it('解放後の待機とSteamのRetry-Afterが別の要求にも適用されること', async () => {
    const lease = await acquireSteamSyncLease(prisma, 'test-key');
    await releaseSteamSyncLease(prisma, lease, 120);
    await expect(acquireSteamSyncLease(prisma, 'test-key')).rejects.toMatchObject({
      retryAfterSeconds: expect.any(Number),
    });
    const [state] = await prisma.$queryRaw<
      { seconds: number }[]
    >`SELECT EXTRACT(EPOCH FROM (next_allowed_at - NOW()))::integer AS seconds FROM "SteamApiThrottle"`;
    expect(state.seconds).toBeGreaterThanOrEqual(119);
  });
  it('失効した実行権は回復し、旧要求の解放は新要求を解除しないこと', async () => {
    const old = await acquireSteamSyncLease(prisma, 'test-key');
    await prisma.$executeRaw`UPDATE "SteamApiThrottle" SET lease_until = NOW() - INTERVAL '1 second', next_allowed_at = NOW() - INTERVAL '1 second'`;
    const current = await acquireSteamSyncLease(prisma, 'test-key');
    await releaseSteamSyncLease(prisma, old, 2);
    await expect(acquireSteamSyncLease(prisma, 'test-key')).rejects.toBeInstanceOf(SteamSyncPausedError);
    await releaseSteamSyncLease(prisma, current, 2);
  });
  it('Steamで制限されたら保存せず共有待機期限を残すこと', async () => {
    vi.mocked(fetchSteamImages).mockRejectedValue(new SteamRateLimitError(120));
    await expect(syncSteamImageBatch(prisma, 'test-key', 0)).rejects.toBeInstanceOf(SteamRateLimitError);
    expect(await prisma.achievementPost.count({ where: { image_url: { not: null } } })).toBe(0);
    await expect(syncSteamImageBatch(prisma, 'test-key', 0)).rejects.toBeInstanceOf(SteamSyncPausedError);
  });
});

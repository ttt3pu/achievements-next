import type { AchievementPost } from '@prisma/client';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
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

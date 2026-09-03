import type { AchievementPost, Prisma } from '@prisma/client';

export type SortKey =
  'sort_order' | 'total_hours' | 'rating' | 'yarikomi_rating' | 'difficulty_rating' | 'completed_at';
export type SortDirection = 'asc' | 'desc';

export type AchievementPostInput = {
  steam_id: number;
  title: string;
  total_hours: number;
  rating: number;
  yarikomi_rating: number;
  difficulty_rating: number;
  is_idle_game: boolean;
  completed_at: Date;
  content: string;
};

type Db = Prisma.TransactionClient;

export function listAchievementPosts(
  db: Db,
  sortKey: SortKey,
  sortDirection: SortDirection,
): Promise<AchievementPost[]> {
  return db.achievementPost.findMany({
    orderBy: {
      [sortKey]: sortDirection,
    },
  });
}

export function findAchievementPost(db: Db, id: number): Promise<AchievementPost | null> {
  return db.achievementPost.findFirst({
    where: {
      id,
    },
  });
}

export async function createAchievementPost(db: Db, input: AchievementPostInput): Promise<void> {
  const findMaxSortOrder = await db.achievementPost.aggregate({
    _max: {
      sort_order: true,
    },
  });

  const maxSortOrder = findMaxSortOrder._max.sort_order;

  await db.achievementPost.create({
    data: {
      ...input,
      updated_at: new Date(),
      created_at: new Date(),
      sort_order: maxSortOrder + 1,
    },
  });
}

export async function updateAchievementPost(db: Db, id: number, input: AchievementPostInput): Promise<void> {
  await db.achievementPost.update({
    where: {
      id,
    },
    data: {
      ...input,
      updated_at: new Date(),
    },
  });
}

export async function changeAchievementPostOrder(db: Db, id: number, newSortOrder: number): Promise<void> {
  await db.achievementPost.update({
    where: {
      id,
    },
    data: {
      sort_order: newSortOrder,
      updated_at: new Date(),
    },
  });

  await db.achievementPost.updateMany({
    where: {
      id: {
        not: id,
      },
      sort_order: {
        gte: newSortOrder,
      },
    },
    data: {
      sort_order: {
        increment: 1,
      },
      updated_at: new Date(),
    },
  });
}

export async function deleteAchievementPost(db: Db, id: number): Promise<void> {
  await db.achievementPost.delete({
    where: {
      id,
    },
  });
}

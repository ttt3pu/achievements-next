const prisma = new PrismaClient();

import { AchievementPost, PrismaClient } from '@prisma/client';

import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = AchievementPost[];

export type SortKey =
  | 'sort_order'
  | 'total_hours'
  | 'rating'
  | 'yarikomi_rating'
  | 'difficulty_rating'
  | 'completed_at';
export type SortDirection = 'asc' | 'desc';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  const sort_key: SortKey = (req.query.sort_key as SortKey) ?? 'sort_order';
  const sort_direction: SortDirection = (req.query.sort_direction as SortDirection) ?? 'asc';

  const achievementPosts = await prisma.achievementPost.findMany({
    orderBy: {
      [sort_key]: sort_direction,
    },
  });
  res.status(200).json(achievementPosts);
}

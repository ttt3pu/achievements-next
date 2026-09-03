import { AchievementPost } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createPrismaClient } from 'utils/api/createPrismaClient';
import { listAchievementPosts, type SortDirection, type SortKey } from 'utils/api/achievementPost';

type ResponseData = AchievementPost[];

export type { SortDirection, SortKey };

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  const prisma = createPrismaClient();

  const sort_key: SortKey = (req.query.sort_key as SortKey) ?? 'sort_order';
  const sort_direction: SortDirection = (req.query.sort_direction as SortDirection) ?? 'asc';

  const achievementPosts = await listAchievementPosts(prisma, sort_key, sort_direction);
  res.status(200).json(achievementPosts);
}

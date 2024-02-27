const prisma = new PrismaClient();

import { AchievementPost, PrismaClient } from '@prisma/client';

import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = AchievementPost[];

export default async function handler(_: NextApiRequest, res: NextApiResponse<ResponseData>) {
  const achievementPosts = await prisma.achievementPost.findMany({
    orderBy: {
      sort_order: 'asc',
    },
  });
  res.status(200).json(achievementPosts);
}

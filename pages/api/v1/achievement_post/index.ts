const prisma = new PrismaClient();

import { AchievementPost, PrismaClient } from '@prisma/client';

import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = AchievementPost[];

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  const achievementPosts = await prisma.achievementPost.findMany();
  res.status(200).json(achievementPosts);
}

const prisma = new PrismaClient();

import { AchievementPost, PrismaClient } from '@prisma/client';

import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = AchievementPost;

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  const achievementPost = await prisma.achievementPost.findFirst({
    where: {
      id: Number(req.query.id),
    },
  });
  res.status(200).json(achievementPost);
}

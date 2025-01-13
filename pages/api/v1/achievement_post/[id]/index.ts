import { AchievementPost } from '@prisma/client';

import type { NextApiRequest, NextApiResponse } from 'next';
import { createPrismaClient } from 'utils/api/createPrismaClient';

type ResponseData = AchievementPost;

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  const prisma = createPrismaClient();

  const achievementPost = await prisma.achievementPost.findFirst({
    where: {
      id: Number(req.query.id),
    },
  });
  res.status(200).json(achievementPost);
}

import { AchievementPost } from '@prisma/client';

import type { NextApiRequest, NextApiResponse } from 'next';
import { createPrismaClient } from 'utils/api/createPrismaClient';
import { findAchievementPost } from 'utils/api/achievementPost';

type ResponseData = AchievementPost;

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  const prisma = createPrismaClient();

  const achievementPost = await findAchievementPost(prisma, Number(req.query.id));
  res.status(200).json(achievementPost);
}

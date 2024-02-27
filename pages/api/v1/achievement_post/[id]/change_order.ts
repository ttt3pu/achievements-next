const prisma = new PrismaClient();

import { AchievementPost, PrismaClient } from '@prisma/client';

import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = AchievementPost;

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  const id = Number(req.query.id);
  const newSortOrder = Number(req.query.new_sort_order);

  await prisma.achievementPost.update({
    where: {
      id,
    },
    data: {
      sort_order: newSortOrder,
      updated_at: new Date(),
    },
  });

  await prisma.achievementPost.updateMany({
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

  res.status(204).end();
}

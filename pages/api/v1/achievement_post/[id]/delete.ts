import type { NextApiRequest, NextApiResponse } from 'next';
import { isAdmin } from 'utils/api/isAdmin';
import { createPrismaClient } from 'utils/api/createPrismaClient';
import { deleteAchievementPost } from 'utils/api/achievementPost';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(await isAdmin(req, res))) {
    return res.status(401).end();
  }

  const prisma = createPrismaClient();

  await deleteAchievementPost(prisma, Number(req.query.id));

  res.status(204).end();
}

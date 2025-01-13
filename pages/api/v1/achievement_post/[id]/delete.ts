import type { NextApiRequest, NextApiResponse } from 'next';
import { isAdmin } from 'utils/api/isAdmin';
import { createPrismaClient } from 'utils/api/createPrismaClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(await isAdmin(req, res))) {
    return res.status(401).end();
  }

  const prisma = createPrismaClient();

  const id = Number(req.query.id);

  await prisma.achievementPost.delete({
    where: {
      id,
    },
  });

  res.status(204).end();
}

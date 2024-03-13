import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Number(req.query.id);

  await prisma.achievementPost.update({
    where: {
      id,
    },
    data: {
      steam_id: Number(req.query.steam_id),
      title: req.query.title as string,
      total_hours: Number(req.query.total_hours),
      rating: Number(req.query.rating),
      yarikomi_rating: Number(req.query.yarikomi_rating),
      difficulty_rating: Number(req.query.difficulty_rating),
      is_idle_game: req.query.is_idle_game === 'true',
      completed_at: new Date(req.query.completed_at as string),
      content: req.query.content as string,
    },
  });

  res.status(204).end();
}

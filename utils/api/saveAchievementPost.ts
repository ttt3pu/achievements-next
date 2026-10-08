import type { NextApiRequest, NextApiResponse } from 'next';
import { isAdmin } from './isAdmin';
import { createPrismaClient } from './createPrismaClient';
import { createAchievementPost, updateAchievementPost } from './achievementPost';
import { parseAchievementPostBody } from './achievementPostBody';

export async function saveAchievementPost(req: NextApiRequest, res: NextApiResponse, editing = false) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }
  if (!(await isAdmin(req, res))) return res.status(401).end();
  if (req.headers['content-type']?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    return res.status(415).json({ error: 'JSON形式で送信してください。' });
  }
  const input = parseAchievementPostBody(req.body);
  const id =
    editing && typeof req.query.id === 'string' && /^[1-9]\d*$/.test(req.query.id) ? Number(req.query.id) : null;
  if (!input || (editing && (!id || id > 2147483647))) {
    return res.status(400).json({ error: '入力内容を確認してください。' });
  }
  try {
    const prisma = createPrismaClient();
    if (editing) await updateAchievementPost(prisma, id, input);
    else await createAchievementPost(prisma, input);
    return res.status(204).end();
  } catch (error) {
    const code = error && typeof error === 'object' && 'code' in error ? error.code : null;
    if (code === 'P2002') return res.status(409).json({ error: 'このゲームの投稿は既に存在します。' });
    if (code === 'P2025') return res.status(404).json({ error: '投稿が見つかりません。' });
    return res.status(500).json({ error: '保存できませんでした。再度お試しください。' });
  }
}

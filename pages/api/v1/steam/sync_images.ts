import { SteamRateLimitError } from 'utils/api/steamPost';
import { SteamSyncPausedError } from 'utils/api/steamSyncThrottle';
import type { NextApiRequest, NextApiResponse } from 'next';
import { isAdmin } from 'utils/api/isAdmin';
import { createPrismaClient } from 'utils/api/createPrismaClient';
import { SteamImageSyncError, syncSteamImageBatch } from 'utils/api/syncSteamImages';
import { imageMigrationError } from 'utils/steamImageMigrationError';

export const config = { maxDuration: 30 };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'private, no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).end();
    return;
  }
  if (!(await isAdmin(req, res))) {
    res.status(401).end();
    return;
  }
  if (req.headers['content-type']?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    res.status(415).json({ error: 'JSON形式で送信してください。' });
    return;
  }
  const body: unknown = req.body;
  const cursor = body && typeof body === 'object' && !Array.isArray(body) && 'cursor' in body ? body.cursor : undefined;
  if (typeof cursor !== 'number' || !Number.isInteger(cursor) || cursor < 0 || cursor > 2147483647) {
    res.status(400).json({ error: '同期の開始位置が不正です。' });
    return;
  }
  const key = process.env.STEAM_WEB_API_KEY;
  if (!key || !process.env.DATABASE_URL) {
    res.status(503).json({ error: 'サーバーのSTEAM_WEB_API_KEYとDATABASE_URLを設定して再デプロイしてください。' });
    return;
  }
  try {
    const result = await syncSteamImageBatch(createPrismaClient(), key, cursor);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof SteamRateLimitError || error instanceof SteamSyncPausedError) {
      res.setHeader('Retry-After', String(error.retryAfterSeconds));
      res.status(429).json({ error: error.message, retryAfterSeconds: error.retryAfterSeconds });
      return;
    }
    res
      .status(502)
      .json({ error: error instanceof SteamImageSyncError ? error.message : imageMigrationError(error, 'DB接続') });
  }
}

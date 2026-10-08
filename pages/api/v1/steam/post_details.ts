import type { NextApiRequest, NextApiResponse } from 'next';
import { isAdmin } from 'utils/api/isAdmin';
import { fetchSteamPostDetails, parseSteamAppId } from 'utils/api/steamPost';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'private, no-store');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end();
  }
  if (!(await isAdmin(req, res))) return res.status(401).end();
  const appId = parseSteamAppId(req.query.appid);
  if (!appId) return res.status(400).json({ error: '有効なApp IDを指定してください。' });
  const key = process.env.STEAM_WEB_API_KEY;
  const steamId = process.env.STEAM_ID64;
  if (!key || !steamId || !/^\d{17}$/.test(steamId)) {
    return res.status(503).json({ error: 'Steam連携の設定が不足しています。手入力で投稿できます。' });
  }
  return res.status(200).json(await fetchSteamPostDetails(appId, key, steamId));
}

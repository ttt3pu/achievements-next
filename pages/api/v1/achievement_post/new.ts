import type { NextApiRequest, NextApiResponse } from 'next';
import { saveAchievementPost } from 'utils/api/saveAchievementPost';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await saveAchievementPost(req, res);
}

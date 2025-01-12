import type { NextApiRequest, NextApiResponse } from 'next';
import { isAdmin } from 'utils/api/isAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  if (!(await isAdmin(req, res))) {
    return res.status(401).end();
  }

  if (!process.env.DEPLOY_WEBHOOK_URL) {
    return res.status(500).end();
  }

  fetch(process.env.DEPLOY_WEBHOOK_URL, {
    method: 'POST',
  });

  res.status(204).end();
}

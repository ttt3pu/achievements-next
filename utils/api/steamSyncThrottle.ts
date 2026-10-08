import { createHash, randomUUID } from 'node:crypto';
import type { Prisma } from '@prisma/client';

export const STEAM_SYNC_INTERVAL_SECONDS = 2;
export class SteamSyncPausedError extends Error {
  constructor(
    public retryAfterSeconds: number,
    busy = false,
  ) {
    super(
      busy
        ? '別の画像同期を処理中です。待ってから再実行してください。'
        : `画像同期の待機中です。${retryAfterSeconds}秒後に再実行してください。`,
    );
  }
}
export type SteamSyncLease = { scope: string; token: string };

export async function acquireSteamSyncLease(db: Prisma.TransactionClient, key: string): Promise<SteamSyncLease> {
  const scope = createHash('sha256').update(key).digest('hex');
  const token = randomUUID();
  const rows = await db.$queryRaw<{ id: string }[]>`
    INSERT INTO "SteamApiThrottle" (id, next_allowed_at, lease_token, lease_until)
    VALUES (${scope}, NOW() + INTERVAL '2 seconds', ${token}, NOW() + INTERVAL '60 seconds')
    ON CONFLICT (id) DO UPDATE
    SET next_allowed_at = EXCLUDED.next_allowed_at, lease_token = EXCLUDED.lease_token, lease_until = EXCLUDED.lease_until
    WHERE ("SteamApiThrottle".lease_until IS NULL OR "SteamApiThrottle".lease_until <= NOW())
      AND "SteamApiThrottle".next_allowed_at <= NOW()
    RETURNING id
  `;
  if (!rows.length) {
    const [state] = await db.$queryRaw<{ seconds: number; busy: boolean }[]>`
      SELECT CEIL(EXTRACT(EPOCH FROM (GREATEST(next_allowed_at, COALESCE(lease_until, NOW())) - NOW())))::integer AS seconds,
             (lease_until > NOW()) AS busy
      FROM "SteamApiThrottle" WHERE id = ${scope}
    `;
    throw new SteamSyncPausedError(Math.max(1, state?.seconds ?? STEAM_SYNC_INTERVAL_SECONDS), state?.busy);
  }
  return { scope, token };
}

export async function releaseSteamSyncLease(db: Prisma.TransactionClient, lease: SteamSyncLease, waitSeconds: number) {
  await db.$executeRaw`
    UPDATE "SteamApiThrottle" SET lease_token = NULL, lease_until = NULL,
      next_allowed_at = GREATEST(next_allowed_at, NOW() + (${waitSeconds}::integer * INTERVAL '1 second'))
    WHERE id = ${lease.scope} AND lease_token = ${lease.token}
  `;
}

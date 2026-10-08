import type { NextApiRequest, NextApiResponse } from 'next';
import { afterEach, describe, expect, it, vi } from 'vitest';
import handler from 'pages/api/v1/steam/sync_images';
import { isAdmin } from 'utils/api/isAdmin';
import { createPrismaClient } from 'utils/api/createPrismaClient';
import { syncSteamImageBatch, SteamImageSyncError } from 'utils/api/syncSteamImages';
vi.mock('utils/api/isAdmin', () => ({ isAdmin: vi.fn() }));
vi.mock('utils/api/createPrismaClient', () => ({ createPrismaClient: vi.fn() }));
vi.mock('utils/api/syncSteamImages', async (original) => ({
  ...(await original<typeof import('utils/api/syncSteamImages')>()),
  syncSteamImageBatch: vi.fn(),
}));
afterEach(() => {
  vi.resetAllMocks();
  vi.unstubAllEnvs();
});
async function invoke(overrides: Record<string, unknown> = {}) {
  vi.stubEnv('STEAM_WEB_API_KEY', 'test-secret');
  vi.stubEnv('DATABASE_URL', 'postgresql://test');
  const res = { setHeader: vi.fn(), status: vi.fn(), end: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  await handler(
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: { cursor: 0 },
      ...overrides,
    } as unknown as NextApiRequest,
    res as unknown as NextApiResponse,
  );
  return res;
}
describe('画像一括同期の管理者限定API', () => {
  it('未認証の場合はDBとSteamに問い合わせないこと', async () => {
    vi.mocked(isAdmin).mockResolvedValue(false);
    expect((await invoke()).status).toHaveBeenCalledWith(401);
    expect(createPrismaClient).not.toHaveBeenCalled();
    expect(syncSteamImageBatch).not.toHaveBeenCalled();
  });
  it('GETでは同期しないこと', async () => {
    expect((await invoke({ method: 'GET' })).status).toHaveBeenCalledWith(405);
    expect(syncSteamImageBatch).not.toHaveBeenCalled();
  });
  it.each([-1, '0', 1.5, 2147483648, undefined])('不正な開始位置%sでは同期しないこと', async (cursor) => {
    vi.mocked(isAdmin).mockResolvedValue(true);
    expect((await invoke({ body: { cursor } })).status).toHaveBeenCalledWith(400);
    expect(syncSteamImageBatch).not.toHaveBeenCalled();
  });
  it('JSON以外の送信では同期しないこと', async () => {
    vi.mocked(isAdmin).mockResolvedValue(true);
    expect((await invoke({ headers: { 'content-type': 'text/plain' } })).status).toHaveBeenCalledWith(415);
  });
  it('管理者には同期件数と次の開始位置を返すこと', async () => {
    vi.mocked(isAdmin).mockResolvedValue(true);
    const result = { processed: 50, updated: 48, unavailable: 2, nextCursor: 71 };
    vi.mocked(syncSteamImageBatch).mockResolvedValue(result);
    expect((await invoke()).json).toHaveBeenCalledWith(result);
  });
  it('安全な移行エラーを画面に返すこと', async () => {
    vi.mocked(isAdmin).mockResolvedValue(true);
    vi.mocked(syncSteamImageBatch).mockRejectedValue(new SteamImageSyncError('必要なカラムがありません。'));
    const res = await invoke();
    expect(res.status).toHaveBeenCalledWith(502);
    expect(res.json).toHaveBeenCalledWith({ error: '必要なカラムがありません。' });
  });
  it('DB初期化の例外から秘密値を返さないこと', async () => {
    vi.mocked(isAdmin).mockResolvedValue(true);
    vi.mocked(createPrismaClient).mockImplementation(() => {
      throw new Error('postgresql://password@test-secret');
    });
    const res = await invoke();
    expect(JSON.stringify(res.json.mock.calls)).not.toContain('test-secret');
  });
});

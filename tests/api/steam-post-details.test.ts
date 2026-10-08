import type { NextApiRequest, NextApiResponse } from 'next';
import { afterEach, describe, expect, it, vi } from 'vitest';
import handler from 'pages/api/v1/steam/post_details';
import { isAdmin } from 'utils/api/isAdmin';
import { fetchSteamPostDetails } from 'utils/api/steamPost';
vi.mock('utils/api/isAdmin', () => ({ isAdmin: vi.fn() }));
vi.mock('utils/api/steamPost', async (original) => ({
  ...(await original<typeof import('utils/api/steamPost')>()),
  fetchSteamPostDetails: vi.fn(),
}));
afterEach(() => {
  vi.resetAllMocks();
  vi.unstubAllEnvs();
});
function response() {
  const res = { setHeader: vi.fn(), status: vi.fn(), end: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  return res;
}
async function invoke(method: string, appid: unknown) {
  const res = response();
  await handler({ method, query: { appid } } as unknown as NextApiRequest, res as unknown as NextApiResponse);
  return res;
}
describe('投稿補完APIのアクセス制御', () => {
  it('管理者以外にはSteamへ問い合わせず拒否すること', async () => {
    vi.mocked(isAdmin).mockResolvedValue(false);
    const res = await invoke('GET', '123');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(fetchSteamPostDetails).not.toHaveBeenCalled();
  });
  it('不正なIDにはSteamへ問い合わせないこと', async () => {
    vi.mocked(isAdmin).mockResolvedValue(true);
    const res = await invoke('GET', '-1');
    expect(res.status).toHaveBeenCalledWith(400);
    expect(fetchSteamPostDetails).not.toHaveBeenCalled();
  });
  it('未設定時には手入力可能なエラーを返すこと', async () => {
    vi.mocked(isAdmin).mockResolvedValue(true);
    vi.stubEnv('STEAM_WEB_API_KEY', '');
    const res = await invoke('GET', '123');
    expect(res.status).toHaveBeenCalledWith(503);
    expect(fetchSteamPostDetails).not.toHaveBeenCalled();
  });
  it('GET以外を拒否すること', async () => {
    const res = await invoke('POST', '123');
    expect(res.status).toHaveBeenCalledWith(405);
    expect(fetchSteamPostDetails).not.toHaveBeenCalled();
  });
});

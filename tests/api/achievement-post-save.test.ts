import type { NextApiRequest, NextApiResponse } from 'next';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import newHandler from 'pages/api/v1/achievement_post/new';
import editHandler from 'pages/api/v1/achievement_post/[id]/edit';
import { isAdmin } from 'utils/api/isAdmin';
import { createPrismaClient } from 'utils/api/createPrismaClient';
import { createAchievementPost, updateAchievementPost } from 'utils/api/achievementPost';
vi.mock('utils/api/isAdmin', () => ({ isAdmin: vi.fn() }));
vi.mock('utils/api/createPrismaClient', () => ({ createPrismaClient: vi.fn() }));
vi.mock('utils/api/achievementPost', () => ({ createAchievementPost: vi.fn(), updateAchievementPost: vi.fn() }));
const body = {
  steam_id: 123,
  title: '架空の冒険',
  content: '# 感想\n\nよかった。',
  total_hours: 20,
  rating: 4,
  yarikomi_rating: 3,
  difficulty_rating: 2,
  is_idle_game: false,
  completed_at: '2026-01-01T00:00:00.000Z',
  image_url: null,
};
beforeEach(() => vi.mocked(isAdmin).mockResolvedValue(true));
afterEach(() => vi.resetAllMocks());
async function invoke(handler: typeof newHandler, overrides: Record<string, unknown> = {}) {
  const res = { setHeader: vi.fn(), status: vi.fn(), end: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  await handler(
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      query: { id: '7' },
      body,
      ...overrides,
    } as unknown as NextApiRequest,
    res as unknown as NextApiResponse,
  );
  return res;
}
describe.each([
  ['新規', newHandler, createAchievementPost],
  ['編集', editHandler, updateAchievementPost],
] as const)('%s投稿のJSON保存', (_name, handler, save) => {
  it('本文と日付と画像未取得の値を保存できること', async () => {
    const res = await invoke(handler);
    expect(res.status).toHaveBeenCalledWith(204);
    const expected = { ...body, completed_at: new Date(body.completed_at) };
    if (handler === editHandler) expect(save).toHaveBeenCalledWith(undefined, 7, expected);
    else expect(save).toHaveBeenCalledWith(undefined, expected);
  });
  it('GETではDBに接続せず拒否すること', async () => {
    const res = await invoke(handler, { method: 'GET' });
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.setHeader).toHaveBeenCalledWith('Allow', 'POST');
    expect(createPrismaClient).not.toHaveBeenCalled();
  });
  it('管理者以外はDBに接続せず拒否すること', async () => {
    vi.mocked(isAdmin).mockResolvedValue(false);
    expect((await invoke(handler)).status).toHaveBeenCalledWith(401);
    expect(createPrismaClient).not.toHaveBeenCalled();
  });
  it.each([
    { steam_id: 0 },
    { total_hours: 1.5 },
    { rating: -1 },
    { is_idle_game: 'false' },
    { completed_at: 'invalid' },
    { title: ' ' },
    { content: null },
    { image_url: 'https://example.com/image.jpg' },
  ])('不正入力%sを保存しないこと', async (patch) => {
    expect((await invoke(handler, { body: { ...body, ...patch } })).status).toHaveBeenCalledWith(400);
    expect(createPrismaClient).not.toHaveBeenCalled();
  });
  it('JSON以外を保存しないこと', async () => {
    expect((await invoke(handler, { headers: { 'content-type': 'text/plain' } })).status).toHaveBeenCalledWith(415);
    expect(save).not.toHaveBeenCalled();
  });
  it('重複したゲームは成功扱いにしないこと', async () => {
    vi.mocked(save).mockRejectedValue({ code: 'P2002' });
    expect((await invoke(handler)).status).toHaveBeenCalledWith(409);
  });
  it('DB障害の詳細を返さず保存失敗を通知すること', async () => {
    vi.mocked(save).mockRejectedValue(new Error('private database details'));
    const res = await invoke(handler);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: '保存できませんでした。再度お試しください。' });
  });
});
describe('編集対象の確認', () => {
  it('不正な投稿IDを保存しないこと', async () => {
    expect((await invoke(editHandler, { query: { id: '-1' } })).status).toHaveBeenCalledWith(400);
    expect(updateAchievementPost).not.toHaveBeenCalled();
  });
  it('削除済みの投稿は見つからないと通知すること', async () => {
    vi.mocked(updateAchievementPost).mockRejectedValue({ code: 'P2025' });
    expect((await invoke(editHandler)).status).toHaveBeenCalledWith(404);
  });
});

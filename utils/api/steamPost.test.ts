import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  fetchSteamImages,
  fetchSteamPostDetails,
  parseSteamAppId,
  SteamRateLimitError,
  steamRetryAfterSeconds,
} from './steamPost';

afterEach(() => vi.unstubAllGlobals());
function mockResponses(achievements: unknown[], storeOk = true) {
  const mock = vi
    .fn()
    .mockResolvedValueOnce({
      ok: storeOk,
      json: async () => ({
        response: {
          store_items: [
            {
              appid: 123,
              success: 1,
              name: '架空の冒険',
              assets: { asset_url_format: 'steam/apps/123/${FILENAME}?t=1', header: 'hash/header.jpg' },
            },
          ],
        },
      }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ playerstats: { success: true, achievements } }),
    });
  vi.stubGlobal('fetch', mock);
  return mock;
}
describe('Steamによる投稿補完', () => {
  it('タイトルと画像と最終実績解除日時を2回の取得で返すこと', async () => {
    const fetch = mockResponses([
      { achieved: 1, unlocktime: 1600000000 },
      { achieved: 1, unlocktime: 1700000000 },
    ]);
    const result = await fetchSteamPostDetails(123, 'test-key', '76561198000000000');
    expect(result).toEqual({
      appId: 123,
      title: '架空の冒険',
      imageUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/123/hash/header.jpg?t=1',
      completedAt: '2023-11-14T22:13:20.000Z',
      warnings: [],
    });
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(JSON.stringify(result)).not.toContain('test-key');
  });
  it.each([
    { achievements: [] },
    { achievements: [{ achieved: 0, unlocktime: 0 }] },
    { achievements: [{ achieved: 1, unlocktime: 0 }] },
    { achievements: [{ achieved: 1 }] },
    { achievements: [{ achieved: 1, unlocktime: 99999999999 }] },
  ])('コンプ日を確定できない実績では手入力を促すこと（%j）', async ({ achievements }) => {
    mockResponses(achievements);
    const result = await fetchSteamPostDetails(123, 'test-key', '76561198000000000');
    expect(result.completedAt).toBeNull();
    expect(result.title).toBe('架空の冒険');
  });
  it('タイトルが欠落しても取得できた画像を保持すること', async () => {
    const mock = mockResponses([]);
    mock
      .mockReset()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response: {
            store_items: [
              {
                appid: 123,
                success: 1,
                assets: { asset_url_format: 'steam/apps/123/${FILENAME}', header: 'hash/header.jpg' },
              },
            ],
          },
        }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    const result = await fetchSteamPostDetails(123, 'test-key', '76561198000000000');
    expect(result.title).toBeNull();
    expect(result.imageUrl).toContain('/steam/apps/123/hash/header.jpg');
    expect(result.warnings).not.toContain('画像を取得できませんでした。');
    expect(mock).toHaveBeenCalledTimes(2);
  });
  it('ストア取得に失敗しても実績から求めた日時を保持すること', async () => {
    const mock = mockResponses([{ achieved: 1, unlocktime: 1700000000 }], false);
    const result = await fetchSteamPostDetails(123, 'test-key', '76561198000000000');
    expect(result.title).toBeNull();
    expect(result.completedAt).toBe('2023-11-14T22:13:20.000Z');
    expect(mock).toHaveBeenCalledTimes(2);
  });
  it('通信失敗時も秘密値を返さず再取得しないこと', async () => {
    const mock = vi.fn().mockRejectedValue(new Error('URL contains test-key'));
    vi.stubGlobal('fetch', mock);
    const result = await fetchSteamPostDetails(123, 'test-key', '76561198000000000');
    expect(result.title).toBeNull();
    expect(result.completedAt).toBeNull();
    expect(JSON.stringify(result)).not.toContain('test-key');
    expect(mock).toHaveBeenCalledTimes(2);
  });
  it.each(['0', '-1', '1.5', '2147483648', ['123'], undefined])('不正なApp IDを拒否すること（%j）', (value) => {
    expect(parseSteamAppId(value)).toBeNull();
  });
});

describe('既存投稿の画像移行', () => {
  it('複数ゲームの画像を1回で取得して未取得項目を除外すること', async () => {
    const mock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        response: {
          store_items: [
            {
              appid: 123,
              success: 1,
              assets: { asset_url_format: 'steam/apps/123/${FILENAME}', header: 'hash/header.jpg' },
            },
            { appid: 456, success: 1, assets: {} },
          ],
        },
      }),
    });
    vi.stubGlobal('fetch', mock);
    const images = await fetchSteamImages([123, 456], 'test-key');
    expect(images.size).toBe(1);
    expect(images.get(123)).toContain('/steam/apps/123/hash/header.jpg');
    expect(mock).toHaveBeenCalledTimes(1);
  });
});

describe('Steamの利用制限への対応', () => {
  it('429とRetry-Afterを保持し、自動再試行しないこと', async () => {
    const mock = vi.fn().mockResolvedValue({ ok: false, status: 429, headers: new Headers({ 'Retry-After': '120' }) });
    vi.stubGlobal('fetch', mock);
    await expect(fetchSteamImages([123], 'test-key')).rejects.toMatchObject({ retryAfterSeconds: 120 });
    expect(mock).toHaveBeenCalledTimes(1);
  });
  it('HTTP成功でも制限ヘッダーと項目の制限コードを検知すること', async () => {
    const mock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, headers: new Headers({ 'x-eresult': '84' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ response: { store_items: [{ success: 25 }] } }) });
    vi.stubGlobal('fetch', mock);
    await expect(fetchSteamImages([123], 'test-key')).rejects.toBeInstanceOf(SteamRateLimitError);
    await expect(fetchSteamImages([123], 'test-key')).rejects.toBeInstanceOf(SteamRateLimitError);
  });
  it('HTTP日時形式を解釈し、欠落や不正値では60秒以上待つこと', () => {
    expect(steamRetryAfterSeconds('Thu, 08 Oct 2026 07:02:00 GMT', Date.parse('2026-10-08T07:00:00Z'))).toBe(120);
    expect(steamRetryAfterSeconds(null)).toBe(60);
    expect(steamRetryAfterSeconds('invalid')).toBe(60);
    expect(steamRetryAfterSeconds('2')).toBe(60);
  });
});

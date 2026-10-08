export type SteamPostDetails = {
  appId: number;
  title: string | null;
  imageUrl: string | null;
  completedAt: string | null;
  warnings: string[];
};

type JsonObject = Record<string, unknown>;
function object(value: unknown): JsonObject {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as JsonObject) : {};
}

export function parseSteamAppId(value: unknown): number | null {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id <= 2147483647 ? id : null;
}

function imageUrl(assets: JsonObject): string | null {
  const template = assets.asset_url_format;
  const header = assets.header;
  if (typeof template !== 'string' || typeof header !== 'string' || !header) return null;
  if (!template.includes('${FILENAME}')) return null;
  const path = template.replace('${FILENAME}', header);
  if (!/^steam\/apps\/\d+\//.test(path) || path.includes('..') || path.includes('\\')) return null;
  const url = new URL(path, 'https://shared.fastly.steamstatic.com/store_item_assets/');
  return url.origin === 'https://shared.fastly.steamstatic.com' ? url.href : null;
}

async function request(key: string, method: string, params: Record<string, string>): Promise<unknown> {
  const url = new URL(`https://api.steampowered.com/${method}`);
  url.search = new URLSearchParams({ ...params, key }).toString();
  const response = await fetch(url, { signal: AbortSignal.timeout(8000), cache: 'no-store' });
  if (!response.ok) throw new Error('Steam request failed');
  return response.json();
}
export async function fetchSteamImages(appIds: number[], key: string): Promise<Map<number, string>> {
  const data = await request(key, 'IStoreBrowseService/GetItems/v1/', {
    input_json: JSON.stringify({
      ids: appIds.map((appid) => ({ appid })),
      context: { language: 'japanese', country_code: 'JP' },
      data_request: { include_assets: true },
    }),
  });
  const items = object(object(data).response).store_items;
  const images = new Map<number, string>();
  if (Array.isArray(items))
    for (const value of items) {
      const item = object(value);
      const url = imageUrl(object(item.assets));
      if (item.success === 1 && typeof item.appid === 'number' && appIds.includes(item.appid) && url)
        images.set(item.appid, url);
    }
  return images;
}

export async function fetchSteamPostDetails(appId: number, key: string, steamId: string): Promise<SteamPostDetails> {
  const [store, stats] = await Promise.allSettled([
    request(key, 'IStoreBrowseService/GetItems/v1/', {
      input_json: JSON.stringify({
        ids: [{ appid: appId }],
        context: { language: 'japanese', country_code: 'JP' },
        data_request: { include_assets: true },
      }),
    }),
    request(key, 'ISteamUserStats/GetPlayerAchievements/v1/', { steamid: steamId, appid: String(appId) }),
  ]);
  const result: SteamPostDetails = { appId, title: null, imageUrl: null, completedAt: null, warnings: [] };
  if (store.status === 'fulfilled') {
    const items = object(object(store.value).response).store_items;
    const item = Array.isArray(items) ? object(items.find((x) => object(x).appid === appId)) : {};
    if (item.success === 1) {
      if (typeof item.name === 'string' && item.name.trim()) result.title = item.name;
      result.imageUrl = imageUrl(object(item.assets));
    }
  }
  if (!result.title) result.warnings.push('タイトルを取得できませんでした。手入力してください。');
  if (!result.imageUrl) result.warnings.push('画像を取得できませんでした。');
  if (stats.status === 'fulfilled') {
    const player = object(object(stats.value).playerstats);
    const achievements = player.achievements;
    if (
      player.success === true &&
      Array.isArray(achievements) &&
      achievements.length > 0 &&
      achievements.every((x) => {
        const a = object(x);
        return (
          a.achieved === 1 &&
          typeof a.unlocktime === 'number' &&
          Number.isInteger(a.unlocktime) &&
          a.unlocktime > 0 &&
          a.unlocktime <= Date.now() / 1000
        );
      })
    ) {
      result.completedAt = new Date(
        Math.max(...achievements.map((x) => object(x).unlocktime as number)) * 1000,
      ).toISOString();
    }
  }
  if (!result.completedAt) result.warnings.push('コンプ日を確認できませんでした。手入力してください。');
  return result;
}

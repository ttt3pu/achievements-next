export function validSteamImageUrl(value: unknown): string | null {
  if (typeof value !== 'string' || !value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' &&
      url.hostname === 'shared.fastly.steamstatic.com' &&
      !url.port &&
      !url.username &&
      !url.password &&
      /^\/store_item_assets\/steam\/apps\/[1-9]\d*\//.test(url.pathname)
      ? url.href
      : null;
  } catch {
    return null;
  }
}

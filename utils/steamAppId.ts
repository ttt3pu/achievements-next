export function steamAppIdFromInput(value: string): number | null {
  let text = value.trim();
  if (!/^[1-9]\d*$/.test(text)) {
    try {
      const url = new URL(text);
      if (url.protocol !== 'https:' || url.hostname !== 'store.steampowered.com') return null;
      text = url.pathname.match(/^\/app\/([1-9]\d*)(?:\/|$)/)?.[1] ?? '';
    } catch {
      return null;
    }
  }
  const id = Number(text);
  return Number.isSafeInteger(id) && id > 0 && id <= 2147483647 ? id : null;
}

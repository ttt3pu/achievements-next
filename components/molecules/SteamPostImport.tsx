import { useEffect, useRef, useState } from 'react';
import FormInput from 'components/atoms/FormInput';
import type { SteamPostDetails } from 'utils/api/steamPost';
import { steamAppIdFromInput } from 'utils/steamAppId';

type Props = {
  value: string;
  onChange: (value: string) => void;
  onImported: (details: SteamPostDetails) => void;
  onLoadingChange: (loading: boolean) => void;
};

export default function SteamPostImport({ value, onChange, onImported, onLoadingChange }: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const cache = useRef(new Map<number, SteamPostDetails>());
  const pending = useRef<AbortController | null>(null);
  const generation = useRef(0);
  useEffect(
    () => () => {
      generation.current++;
      pending.current?.abort();
    },
    [],
  );

  function change(value: string) {
    generation.current++;
    pending.current?.abort();
    pending.current = null;
    setLoading(false);
    onLoadingChange(false);
    setMessage('');
    onChange(value);
  }

  async function importDetails(refresh = false) {
    if (pending.current) return;
    const appId = steamAppIdFromInput(value);
    if (!appId) {
      setMessage('SteamストアのURLまたは有効なApp IDを入力してください。');
      return;
    }
    const version = generation.current;
    const cached = cache.current.get(appId);
    if (cached && !refresh) {
      onImported(cached);
      setMessage(['取得済みの情報を使用しました。', ...cached.warnings].join(' '));
      return;
    }
    const controller = new AbortController();
    pending.current = controller;
    setLoading(true);
    onLoadingChange(true);
    setMessage('');
    try {
      const response = await fetch(`/api/v1/steam/post_details?appid=${appId}`, { signal: controller.signal });
      if (!response.ok) throw new Error('取得失敗');
      const details: SteamPostDetails = await response.json();
      if (version !== generation.current || controller.signal.aborted) return;
      if (details.appId !== appId) throw new Error('対象ゲーム不一致');
      cache.current.set(appId, details);
      onImported(details);
      setMessage(['取得結果をフォームに反映しました。', ...details.warnings].join(' '));
    } catch {
      if (version === generation.current && !controller.signal.aborted) {
        setMessage('Steam情報を取得できませんでした。時間をおいて再取得してください。');
      }
    } finally {
      if (pending.current === controller) {
        pending.current = null;
        setLoading(false);
        onLoadingChange(false);
      }
    }
  }

  return (
    <div className="mb-5 min-w-0">
      <label className="block">
        SteamストアURL / App ID
        <FormInput value={value} handleChange={change} className="block w-full min-w-0 mt-2" />
      </label>
      <div className="flex flex-wrap gap-3 mt-3">
        <button
          type="button"
          disabled={loading}
          onClick={() => importDetails()}
          className="rounded px-4 py-2 bg-yellow font-medium disabled:opacity-50"
        >
          {loading ? '取得中…' : 'Steamから取得'}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => importDetails(true)}
          className="rounded border border-bg-500 px-4 py-2 disabled:opacity-50"
        >
          再取得
        </button>
      </div>
      {message && (
        <p role="status" className="mt-3 break-words text-sm">
          {message}
        </p>
      )}
    </div>
  );
}

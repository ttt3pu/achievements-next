import { waitForSteamSync } from 'utils/waitForSteamSync';
import { useEffect, useRef, useState } from 'react';
import type { SteamImageSyncResult } from 'utils/api/syncSteamImages';

type Props = { onSynced: () => Promise<void> };

export default function SteamImageSync({ onSynced }: Props) {
  const [running, setRunning] = useState(false);
  const [retrySeconds, setRetrySeconds] = useState(0);
  const retryUntil = useRef(0);
  const resume = useRef<{ cursor: number; counts: { processed: number; updated: number; unavailable: number } } | null>(
    null,
  );
  useEffect(() => {
    if (!retrySeconds) return;
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((retryUntil.current - Date.now()) / 1000));
      setRetrySeconds(remaining);
    }, 1000);
    return () => clearInterval(timer);
  }, [retrySeconds]);
  const [message, setMessage] = useState('');
  const [totals, setTotals] = useState({ processed: 0, updated: 0, unavailable: 0 });
  const pending = useRef<AbortController | null>(null);
  useEffect(
    () => () => {
      pending.current?.abort();
    },
    [],
  );

  async function sync() {
    if (pending.current || retryUntil.current > Date.now()) return;
    const action = resume.current ? '再開' : '開始';
    if (
      !window.confirm(
        `未登録画像の一括同期を${action}しますか？\nSteamへ画像を問い合わせ、取得できた画像を保存します。登録済み画像・本文・評価は変更しません。\n完了後、公開一覧への反映にはDeployが必要です。`,
      )
    )
      return;
    const controller = new AbortController();
    pending.current = controller;
    setRunning(true);
    setMessage('画像を同期しています。');
    const counts = resume.current ? { ...resume.current.counts } : { processed: 0, updated: 0, unavailable: 0 };
    setTotals({ ...counts });
    let cursor = resume.current?.cursor ?? 0;
    resume.current = null;
    try {
      while (true) {
        const response = await fetch('/api/v1/steam/sync_images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cursor }),
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          if (response.status === 429) {
            const seconds = Number(data.retryAfterSeconds ?? response.headers?.get('Retry-After'));
            const wait = Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds) : 60;
            retryUntil.current = Date.now() + wait * 1000;
            setRetrySeconds(wait);
            resume.current = { cursor, counts: { ...counts } };
          } else resume.current = null;
          throw new Error(
            typeof data.error === 'string'
              ? data.error
              : response.status === 401
                ? '管理者としてログインしてください。'
                : '画像の同期に失敗しました。',
          );
        }
        const result: SteamImageSyncResult = await response.json();
        if (controller.signal.aborted) return;
        counts.processed += result.processed;
        counts.updated += result.updated;
        counts.unavailable += result.unavailable;
        setTotals({ ...counts });
        if (result.nextCursor === null) break;
        if (!Number.isInteger(result.nextCursor) || result.nextCursor <= cursor)
          throw new Error('同期結果を確認できませんでした。');
        cursor = result.nextCursor;
        setMessage('次の画像取得まで待機しています。');
        await waitForSteamSync(result.waitSeconds ?? 2, controller.signal);
        if (controller.signal.aborted) return;
        setMessage('画像を同期しています。');
      }
      resume.current = null;
      setMessage('同期が完了しました。公開一覧へ反映するにはDeployを実行してください。');
    } catch (error) {
      if (controller.signal.aborted) return;
      setMessage(
        `${error instanceof Error ? error.message : '画像の同期に失敗しました。'} 保存済みの画像は保持しています。再実行で未登録分を同期できます。`,
      );
    } finally {
      if (!controller.signal.aborted) {
        // 部分成功時も保存済みの画像を管理一覧へ反映する。
        await onSynced().catch(() => {
          if (!controller.signal.aborted) setMessage((text) => `${text} 管理一覧を再読み込みしてください。`);
        });
        if (!controller.signal.aborted) {
          pending.current = null;
          setRunning(false);
        }
      }
    }
  }

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={sync}
        disabled={running || retrySeconds > 0}
        className="px-4 py-2 bg-yellow disabled:opacity-50"
      >
        {running
          ? '画像を同期中…'
          : retrySeconds > 0
            ? `再開まで${retrySeconds}秒`
            : resume.current
              ? '画像同期を再開'
              : '未登録画像を一括同期'}
      </button>
      <p className="mt-2">画像が未登録の投稿だけを同期します。登録済みの画像・本文・評価は変更しません。</p>
      <p role="status" className="mt-2">
        {message}{' '}
        {message && `確認${totals.processed}件・保存${totals.updated}件・取得できない画像${totals.unavailable}件`}
      </p>
    </div>
  );
}

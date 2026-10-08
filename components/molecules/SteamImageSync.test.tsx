// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SteamImageSync from './SteamImageSync';
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
function response(processed: number, updated: number, unavailable: number, nextCursor: number | null) {
  return { ok: true, json: async () => ({ processed, updated, unavailable, nextCursor }) };
}
describe('管理画面からの画像一括同期', () => {
  it('表示時は同期せず、操作後にバッチを順番に処理して結果とDeploy案内を表示すること', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(response(50, 49, 1, 51))
      .mockResolvedValueOnce(response(2, 2, 0, null));
    vi.stubGlobal('fetch', fetch);
    const onSynced = vi.fn().mockResolvedValue(undefined);
    render(<SteamImageSync onSynced={onSynced} />);
    expect(fetch).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: '未登録画像を一括同期' }));
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('同期が完了'));
    expect(screen.getByRole('status').textContent).toContain('確認52件・保存51件・取得できない画像1件');
    expect(screen.getByRole('status').textContent).toContain('Deploy');
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls.map((call) => JSON.parse(call[1].body))).toEqual([{ cursor: 0 }, { cursor: 51 }]);
    expect(onSynced).toHaveBeenCalledTimes(1);
  });
  it('部分保存後に失敗した場合は止まり、再実行を案内すること', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(response(50, 50, 0, 50))
      .mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'Steam取得に失敗しました。' }) });
    vi.stubGlobal('fetch', fetch);
    render(<SteamImageSync onSynced={vi.fn().mockResolvedValue(undefined)} />);
    fireEvent.click(screen.getByRole('button', { name: '未登録画像を一括同期' }));
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('再実行'));
    expect(screen.getByRole('status').textContent).toContain('保存50件');
    expect(fetch).toHaveBeenCalledTimes(2);
    fetch.mockResolvedValueOnce(response(1, 1, 0, null));
    await waitFor(() => expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(false));
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('同期が完了'));
    expect(JSON.parse(fetch.mock.calls[2][1].body)).toEqual({ cursor: 0 });
  });
  it('処理中の連打でも同じバッチを二重送信しないこと', async () => {
    let finish: (value: unknown) => void;
    const fetch = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    vi.stubGlobal('fetch', fetch);
    render(<SteamImageSync onSynced={vi.fn().mockResolvedValue(undefined)} />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('button'));
    expect(fetch).toHaveBeenCalledTimes(1);
    await act(async () => finish(response(0, 0, 0, null)));
  });
});

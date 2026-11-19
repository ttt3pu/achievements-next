// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { PostEditSubmitPayload } from 'types/PostEditSubmitPayload';
import NewPost from 'pages/admin/new';
import EditPost from 'pages/admin/[postId]/edit';
import { achievementPosts } from 'tests/fixtures/achievement-posts';
import { toast } from 'react-toastify';
import MyApp from 'pages/_app';
import Admin from 'pages/admin';
import router from 'next/router';
vi.mock('next/router', () => ({
  default: { push: vi.fn() },
  useRouter: () => ({ pathname: '/admin' }),
}));
const payload: PostEditSubmitPayload = {
  steam_id: 123,
  image_url: null,
  title: '架空の冒険',
  total_hours: 10,
  rating: 3,
  yarikomi_rating: 2,
  difficulty_rating: 1,
  is_idle_game: false,
  completed_at: new Date('2026-01-01T00:00:00Z'),
  content: '# 本文\n\n手動入力',
};
vi.mock('components/organisms/PostView', () => ({
  default: ({ handleSubmit }: { handleSubmit: (data: PostEditSubmitPayload) => void }) => (
    <button onClick={() => handleSubmit(payload)}>Save</button>
  ),
}));
afterEach(() => {
  cleanup();
  toast.dismiss();
  toast.clearWaitingQueue();
  vi.resetAllMocks();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
describe.each(['新規', '編集'])('%s投稿の保存結果の通知', (kind) => {
  function show() {
    const Component = () =>
      kind === '新規' ? (
        <NewPost />
      ) : (
        <EditPost
          post={{
            ...achievementPosts[0],
            image_url: null,
            completed_at: new Date(achievementPosts[0].completed_at),
            created_at: new Date(achievementPosts[0].created_at),
            updated_at: new Date(achievementPosts[0].updated_at),
          }}
        />
      );
    return render(<MyApp Component={Component} pageProps={{ session: null }} />);
  }
  it('JSONで保存し成功確認後に完了表示すること', async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetch);
    show();
    fireEvent.click(screen.getByText('Save'));
    expect((await screen.findByRole('alert')).textContent).toContain('Saved!');
    expect(fetch).toHaveBeenCalledWith(
      kind === '新規' ? '/api/v1/achievement_post/new' : `/api/v1/achievement_post/${achievementPosts[0].id}/edit`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    );
    if (kind === '新規') expect(router.push).toHaveBeenCalledWith('/admin');
  });
  it.each([400, 401, 409, 500])('HTTP %sでは成功表示や画面移動をしないこと', async (status) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status }));
    show();
    fireEvent.click(screen.getByText('Save'));
    const messages = {
      400: '入力内容を確認してください。',
      401: 'ログイン状態を確認してください。',
      409: 'このゲームの投稿は既に存在します。',
      500: '保存できませんでした。入力を保持しています。再度お試しください。',
    };
    expect((await screen.findByRole('alert')).textContent).toContain(messages[status]);
    expect(screen.queryByText('Saved!')).toBeNull();
    expect(router.push).not.toHaveBeenCalled();
    expect(screen.getByText('Save')).toBeDefined();
  });
  it('通信失敗時も成功表示や画面移動をしないこと', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    show();
    fireEvent.click(screen.getByText('Save'));
    expect((await screen.findByRole('alert')).textContent).toContain(
      '通信に失敗しました。入力を保持しています。再度お試しください。',
    );
    expect(screen.queryByText('Saved!')).toBeNull();
    expect(router.push).not.toHaveBeenCalled();
  });
  if (kind === '編集') {
    it('削除完了が通知欄に表示されること', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      const fetch = vi.fn().mockResolvedValue({ ok: true });
      vi.stubGlobal('fetch', fetch);
      show();
      fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
      expect((await screen.findByRole('alert')).textContent).toContain('Deleted!');
      expect(fetch).toHaveBeenCalledWith(`/api/v1/achievement_post/${achievementPosts[0].id}/delete`);
      expect(router.push).toHaveBeenCalledWith('/admin');
    });
  }
});

describe('管理画面の通知表示', () => {
  it.each([true, false])('デプロイ成功=%sの結果が通知欄に表示されること', async (ok) => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok });
    vi.stubGlobal('fetch', fetch);
    render(<MyApp Component={Admin} pageProps={{ session: null }} />);
    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/v1/achievement_post'));
    fireEvent.click(screen.getByRole('button', { name: 'Deploy' }));
    expect((await screen.findByRole('alert')).textContent).toContain(ok ? 'Deploy started!' : 'Failed to deploy');
    expect(fetch).toHaveBeenLastCalledWith('/api/v1/deploy', { method: 'POST' });
    if (ok) {
      const link = screen.getByRole('link', { name: 'https://vercel.com/attt-team/achievements-next/deployments' });
      expect(link.getAttribute('href')).toBe('https://vercel.com/attt-team/achievements-next/deployments');
      expect(link.getAttribute('target')).toBe('_blank');
    }
  });

  it('管理一覧取得失敗が通知欄に表示されること', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    render(<MyApp Component={Admin} pageProps={{ session: null }} />);
    expect((await screen.findByRole('alert')).textContent).toContain('管理一覧を取得できませんでした。');
  });
});

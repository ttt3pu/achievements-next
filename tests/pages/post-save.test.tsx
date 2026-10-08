// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { PostEditSubmitPayload } from 'types/PostEditSubmitPayload';
import NewPost from 'pages/admin/new';
import EditPost from 'pages/admin/[postId]/edit';
import { achievementPosts } from 'tests/fixtures/achievement-posts';
import { toast } from 'react-toastify';
import router from 'next/router';
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('next/router', () => ({ default: { push: vi.fn() } }));
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
  vi.resetAllMocks();
  vi.unstubAllGlobals();
});
describe.each(['新規', '編集'])('%s投稿の保存結果の通知', (kind) => {
  function show() {
    return render(
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
      ),
    );
  }
  it('JSONで保存し成功確認後に完了表示すること', async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetch);
    show();
    fireEvent.click(screen.getByText('Save'));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Saved!'));
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
    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(toast.success).not.toHaveBeenCalled();
    expect(router.push).not.toHaveBeenCalled();
    expect(screen.getByText('Save')).toBeDefined();
  });
  it('通信失敗時も成功表示や画面移動をしないこと', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    show();
    fireEvent.click(screen.getByText('Save'));
    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(toast.success).not.toHaveBeenCalled();
    expect(router.push).not.toHaveBeenCalled();
  });
});

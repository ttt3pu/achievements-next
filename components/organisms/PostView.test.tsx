// @vitest-environment jsdom
import { act, type ComponentProps } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { achievementPosts } from 'tests/fixtures/achievement-posts';
import PostView from './PostView';

type PostViewPost = ComponentProps<typeof PostView>['post'];

function fixturePost(title: string): PostViewPost {
  const post = achievementPosts.find((item) => item.title === title);

  if (!post) {
    throw new Error(`fixture post not found: ${title}`);
  }

  return post as unknown as PostViewPost;
}

// プレーン文 / 見出し + ネストリスト / 放置ゲーの 3 パターン
const fixtures = [
  fixturePost('テストクエスト オデッセイ'),
  fixturePost('Fictional Fantasy Remake'),
  fixturePost('放置ヒーロー クリッカー'),
];

// 1 行 1 タグにしてアップグレード時の差分を読めるようにする
function readableMarkup(markup: string): string {
  return markup.replace(/></g, '>\n<');
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('PostView', () => {
  it.each(fixtures.map((post) => [post.title, post] as const))('%s の HTML が変わらないこと', (_title, post) => {
    expect(readableMarkup(renderToString(<PostView post={post} />))).toMatchSnapshot();
  });

  it('生成済みの HTML をハイドレーションしてもエラーが出ないこと', () => {
    const post = fixtures[0];
    const container = document.createElement('div');
    container.innerHTML = renderToString(<PostView post={post} />);
    document.body.append(container);

    const onRecoverableError = vi.fn();
    let root: ReturnType<typeof hydrateRoot>;

    act(() => {
      root = hydrateRoot(container, <PostView post={post} />, { onRecoverableError });
    });

    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(container.querySelector('h1').textContent).toBe(post.title);
    expect(container.textContent).toContain('2023-04-28');

    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('管理画面の編集フォームから編集内容が送信されること', () => {
    const post = fixtures[0];
    const handleSubmit = vi.fn();
    const { container } = render(<PostView post={post} editMode handleSubmit={handleSubmit} />);
    const textarea = container.querySelector('textarea');

    expect(textarea.value).toBe(post.content);

    fireEvent.change(screen.getByDisplayValue(post.title), { target: { value: '編集後タイトル' } });
    fireEvent.change(screen.getByDisplayValue(String(post.total_hours)), { target: { value: '150' } });
    fireEvent.change(textarea, { target: { value: '編集後の本文' } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(handleSubmit).toHaveBeenCalledWith({
      steam_id: post.steam_id,
      image_url: null,
      title: '編集後タイトル',
      total_hours: 150,
      rating: post.rating,
      yarikomi_rating: post.yarikomi_rating,
      difficulty_rating: post.difficulty_rating,
      is_idle_game: !post.is_idle_game,
      completed_at: post.completed_at,
      content: '編集後の本文',
    });
  });
});

describe('Steam情報の投稿フォームへの補完', () => {
  const details = {
    appId: 123,
    title: '取得した架空タイトル',
    imageUrl: null,
    completedAt: '2023-11-14T22:13:20.000Z',
    warnings: [],
  };
  it('新規投稿を補完しても所要時間を変更せず、同じゲームを再取得しないこと', async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => details });
    vi.stubGlobal('fetch', fetch);
    const handleSubmit = vi.fn();
    render(
      <PostView
        post={{ ...fixtures[0], steam_id: '', title: '', total_hours: '42' }}
        editMode
        handleSubmit={handleSubmit}
      />,
    );
    fireEvent.change(screen.getByLabelText('SteamストアURL / App ID'), {
      target: { value: 'https://store.steampowered.com/app/123/test/' },
    });
    expect(fetch).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Steamから取得' }));
    await waitFor(() => expect(screen.getByLabelText('タイトル').getAttribute('value')).toBe(details.title));
    fireEvent.click(screen.getByRole('button', { name: 'Steamから取得' }));
    expect(fetch).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        steam_id: 123,
        title: details.title,
        total_hours: 42,
        completed_at: new Date(details.completedAt),
      }),
    );
    fireEvent.click(screen.getByRole('button', { name: '再取得' }));
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
  });
  it('取得中の手入力と既存の日付を保持し、明示した候補だけ採用すること', async () => {
    let resolve: (value: unknown) => void;
    vi.stubGlobal(
      'fetch',
      vi.fn().mockReturnValue(
        new Promise((r) => {
          resolve = r;
        }),
      ),
    );
    const handleSubmit = vi.fn();
    render(<PostView post={{ ...fixtures[0], steam_id: 123 }} editMode handleSubmit={handleSubmit} />);
    fireEvent.click(screen.getByRole('button', { name: 'Steamから取得' }));
    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: '手入力タイトル' } });
    await act(async () => resolve({ ok: true, json: async () => details }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(handleSubmit).toHaveBeenLastCalledWith(
      expect.objectContaining({ title: '手入力タイトル', completed_at: fixtures[0].completed_at }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'この日付を使う' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(handleSubmit).toHaveBeenLastCalledWith(
      expect.objectContaining({ title: '手入力タイトル', completed_at: new Date(details.completedAt) }),
    );
  });
  it('取得中にゲームを切り替えた場合は古い応答を補完しないこと', async () => {
    let resolve: (value: unknown) => void;
    vi.stubGlobal(
      'fetch',
      vi.fn().mockReturnValue(
        new Promise((r) => {
          resolve = r;
        }),
      ),
    );
    render(<PostView post={{ ...fixtures[0], steam_id: '123', title: '' }} editMode />);
    fireEvent.click(screen.getByRole('button', { name: 'Steamから取得' }));
    fireEvent.change(screen.getByLabelText('SteamストアURL / App ID'), { target: { value: '456' } });
    await act(async () => resolve({ ok: true, json: async () => details }));
    expect(screen.getByLabelText('タイトル').getAttribute('value')).toBe('');
    expect(screen.queryByRole('button', { name: 'このタイトルを使う' })).toBeNull();
  });
  it('取得に失敗しても入力内容を保存できること', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    const handleSubmit = vi.fn();
    render(<PostView post={{ ...fixtures[0], steam_id: 123 }} editMode handleSubmit={handleSubmit} />);
    fireEvent.click(screen.getByRole('button', { name: 'Steamから取得' }));
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('手入力で投稿できます'));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ title: fixtures[0].title, total_hours: Number(fixtures[0].total_hours) }),
    );
  });
});

describe('投稿保存中の入力保持', () => {
  it('保存中の連打を抑止し、失敗後も入力を再送信できること', async () => {
    let finish: () => void;
    const handleSubmit = vi.fn().mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    render(<PostView post={fixtures[0]} editMode handleSubmit={handleSubmit} />);
    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: '保存するタイトル' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    fireEvent.click(screen.getByRole('button', { name: '保存中…' }));
    expect(handleSubmit).toHaveBeenCalledTimes(1);
    await act(async () => finish());
    expect((screen.getByLabelText('タイトル') as HTMLInputElement).value).toBe('保存するタイトル');
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(handleSubmit).toHaveBeenCalledTimes(2);
    expect(handleSubmit).toHaveBeenLastCalledWith(expect.objectContaining({ title: '保存するタイトル' }));
    await act(async () => finish());
  });
});

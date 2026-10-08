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

describe('投稿の表示と編集', () => {
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

    fireEvent.change(screen.getByDisplayValue(String(post.total_hours)), { target: { value: '150' } });
    fireEvent.change(textarea, { target: { value: '編集後の本文' } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(handleSubmit).toHaveBeenCalledWith({
      steam_id: post.steam_id,
      image_url: null,
      title: post.title,
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
    await waitFor(() => expect(screen.getByLabelText('タイトル').textContent).toBe(details.title));
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
  it('既存のタイトルと日付を取得値へ自動反映し、再取得でも更新すること', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => details })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...details, title: '更新されたタイトル', completedAt: '2024-01-01T00:00:00.000Z' }),
      });
    vi.stubGlobal('fetch', fetch);
    const handleSubmit = vi.fn();
    const { container } = render(
      <PostView post={{ ...fixtures[0], steam_id: 123 }} editMode handleSubmit={handleSubmit} />,
    );
    expect(screen.getByLabelText('タイトル').tagName).toBe('OUTPUT');
    expect(container.querySelector('input[type="date"]')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Steamから取得' }));
    await waitFor(() => expect(screen.getByLabelText('タイトル').textContent).toBe(details.title));
    expect(screen.queryByRole('button', { name: /使う/ })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(handleSubmit).toHaveBeenLastCalledWith(
      expect.objectContaining({ title: details.title, completed_at: new Date(details.completedAt) }),
    );
    await waitFor(() =>
      expect((screen.getByRole('button', { name: 'Save' }) as HTMLButtonElement).disabled).toBe(false),
    );
    fireEvent.click(screen.getByRole('button', { name: '再取得' }));
    await waitFor(() => expect(screen.getByLabelText('タイトル').textContent).toBe('更新されたタイトル'));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(handleSubmit).toHaveBeenLastCalledWith(
      expect.objectContaining({ title: '更新されたタイトル', completed_at: new Date('2024-01-01T00:00:00.000Z') }),
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
    expect(screen.getByLabelText('タイトル').textContent).toBe('未取得');
    expect(screen.queryByRole('button', { name: 'このタイトルを使う' })).toBeNull();
  });
  it.each(['title', 'completedAt'] as const)(
    '取得結果の%sが欠落した場合は旧ゲームの値を流用して保存しないこと',
    async (field) => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ...details, [field]: null }) }),
      );
      const handleSubmit = vi.fn();
      render(<PostView post={{ ...fixtures[0], steam_id: 123 }} editMode handleSubmit={handleSubmit} />);
      fireEvent.click(screen.getByRole('button', { name: 'Steamから取得' }));
      await waitFor(() =>
        expect(screen.getAllByRole('status').some((node) => node.textContent.includes('反映しました'))).toBe(true),
      );
      expect((screen.getByRole('button', { name: 'Save' }) as HTMLButtonElement).disabled).toBe(true);
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));
      expect(handleSubmit).not.toHaveBeenCalled();
    },
  );
  it('ゲームの切替時は画像・タイトル・日付を消し、未取得のゲームを保存しないこと', () => {
    const handleSubmit = vi.fn();
    render(<PostView post={{ ...fixtures[0], steam_id: 123 }} editMode handleSubmit={handleSubmit} />);
    fireEvent.change(screen.getByLabelText('SteamストアURL / App ID'), { target: { value: '456' } });
    expect(screen.getByLabelText('タイトル').textContent).toBe('未取得');
    expect(screen.getAllByText('未取得')).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(handleSubmit).not.toHaveBeenCalled();
  });
  it('再取得中は古い値の保存を抑止し、画像と取得値を同じゲーム情報欄へ反映すること', async () => {
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
    const { container } = render(
      <PostView post={{ ...fixtures[0], steam_id: 123 }} editMode handleSubmit={handleSubmit} />,
    );
    fireEvent.click(screen.getByRole('button', { name: '再取得' }));
    expect((screen.getByRole('button', { name: 'Save' }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(handleSubmit).not.toHaveBeenCalled();
    const imageUrl = 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/123/header.jpg';
    await act(async () => resolve({ ok: true, json: async () => ({ ...details, imageUrl }) }));
    const game = screen.getByRole('region', { name: 'ゲーム情報' });
    expect(game.querySelector('img')).not.toBeNull();
    expect(game.contains(screen.getByLabelText('タイトル'))).toBe(true);
    expect(container.querySelector('iframe')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(handleSubmit).toHaveBeenCalledWith(expect.objectContaining({ title: details.title, image_url: imageUrl }));
  });
  it('取得に失敗しても入力内容を保存できること', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    const handleSubmit = vi.fn();
    render(<PostView post={{ ...fixtures[0], steam_id: 123 }} editMode handleSubmit={handleSubmit} />);
    fireEvent.click(screen.getByRole('button', { name: 'Steamから取得' }));
    await waitFor(() =>
      expect(screen.getByText('Steam情報を取得できませんでした。時間をおいて再取得してください。')).toBeDefined(),
    );
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
    fireEvent.change(screen.getByLabelText('かかった時間（時間）'), { target: { value: '999' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    fireEvent.click(screen.getByRole('button', { name: '保存中…' }));
    expect(handleSubmit).toHaveBeenCalledTimes(1);
    await act(async () => finish());
    expect((screen.getByLabelText('かかった時間（時間）') as HTMLInputElement).value).toBe('999');
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(handleSubmit).toHaveBeenCalledTimes(2);
    expect(handleSubmit).toHaveBeenLastCalledWith(expect.objectContaining({ total_hours: 999 }));
    await act(async () => finish());
  });
});

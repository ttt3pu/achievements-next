// @vitest-environment jsdom
import { act, type ComponentProps } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
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

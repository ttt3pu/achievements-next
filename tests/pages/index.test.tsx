// @vitest-environment jsdom
// pages 配下に置くと Next のルートとして扱われてしまうため、ページのテストはここに置く
import type { AchievementPost } from '@prisma/client';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { achievementPosts } from 'tests/fixtures/achievement-posts';
import Home from 'pages/index';

const posts = achievementPosts as unknown as AchievementPost[];

function renderedPostIds(): number[] {
  return screen.getAllByRole('link').map((link) => Number(link.getAttribute('href').replace('/', '')));
}

function renderedValuesOf(key: 'total_hours' | 'rating'): number[] {
  return renderedPostIds().map((id) => posts.find((post) => post.id === id)[key]);
}

// 同じラベルのボタンがサイドバーのチャートにもあるので、グリッド側だけを選ぶ
function clickSortButton(name: string) {
  const button = screen.getAllByRole('button', { name }).find((node) => !node.closest('aside'));

  fireEvent.click(button);
}

afterEach(() => {
  cleanup();
});

describe('トップページ', () => {
  it('全記事が sort_order 順に詳細ページへのリンク付きで並ぶこと', () => {
    render(<Home posts={posts} />);

    expect(renderedPostIds()).toEqual(posts.map((post) => post.id));
  });

  it('ソートキーを選ぶと並び替わり、再クリックで昇順降順が切り替わること', () => {
    render(<Home posts={posts} />);

    clickSortButton('かかった時間');

    const descHours = renderedValuesOf('total_hours');
    expect(descHours).toEqual([...descHours].sort((a, b) => b - a));
    expect(screen.getAllByText(/ h$/).map((node) => node.textContent)).toEqual(descHours.map((hours) => `${hours} h`));

    clickSortButton('かかった時間');

    expect(renderedValuesOf('total_hours')).toEqual([...descHours].reverse());
  });

  it('総合評価ソートではカードの表示が星に切り替わること', () => {
    render(<Home posts={posts} />);

    clickSortButton('総合評価');

    const descRatings = renderedValuesOf('rating');
    expect(descRatings).toEqual([...descRatings].sort((a, b) => b - a));
    expect(screen.queryAllByText(/ h$/)).toHaveLength(0);
    expect(screen.getAllByRole('link')[0].querySelectorAll('svg')).toHaveLength(5);
  });
});

// @vitest-environment jsdom
import type { AchievementPost } from '@prisma/client';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { achievementPosts } from 'tests/fixtures/achievement-posts';
import StatsCharts from 'components/organisms/StatsCharts';

const posts = achievementPosts as unknown as AchievementPost[];

afterEach(() => {
  cleanup();
});

describe('統計チャートの表示', () => {
  it('プレイ時間セクションに全投稿の合計プレイ時間が表示されること', () => {
    render(<StatsCharts posts={posts} />);

    const totalHours = posts.reduce((sum, post) => sum + post.total_hours, 0);
    expect(screen.getByText(`合計: ${totalHours.toLocaleString()} 時間`)).toBeDefined();
  });

  it('コンパクト表示でも合計プレイ時間が表示されること', () => {
    render(<StatsCharts posts={posts} compact />);

    const totalHours = posts.reduce((sum, post) => sum + post.total_hours, 0);
    expect(screen.getByText(`合計: ${totalHours.toLocaleString()} 時間`)).toBeDefined();
  });
});

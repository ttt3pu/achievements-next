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
  it('最上部の総プレイ時間セクションに全投稿の合計プレイ時間が表示されること', () => {
    render(<StatsCharts posts={posts} />);

    expect(screen.getByRole('heading', { name: '総プレイ時間' })).toBeDefined();
    const totalHours = posts.reduce((sum, post) => sum + post.total_hours, 0);
    expect(screen.getByText(totalHours.toLocaleString())).toBeDefined();
  });

  it('コンパクト表示でも総プレイ時間が表示されること', () => {
    render(<StatsCharts posts={posts} compact />);

    expect(screen.getByRole('heading', { name: '総プレイ時間' })).toBeDefined();
    const totalHours = posts.reduce((sum, post) => sum + post.total_hours, 0);
    expect(screen.getByText(totalHours.toLocaleString())).toBeDefined();
  });

  it('年別および月別のプレイ時間セクションが表示されること', () => {
    render(<StatsCharts posts={posts} />);

    expect(screen.getByRole('heading', { name: '年別プレイ時間' })).toBeDefined();
    expect(screen.getByRole('heading', { name: '月別プレイ時間' })).toBeDefined();
  });
});

// @vitest-environment jsdom
import type { AchievementPost } from '@prisma/client';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
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

  it('年別および月別のプレイ時間セクションに放置ゲーを含むチェックボックスが存在し、デフォルトで未チェックであること', () => {
    render(<StatsCharts posts={posts} />);

    const checkboxes = screen.getAllByRole('checkbox', { name: '放置ゲーを含む' }) as HTMLInputElement[];
    expect(checkboxes).toHaveLength(2);
    expect(checkboxes[0].checked).toBe(false);
    expect(checkboxes[1].checked).toBe(false);
  });

  it('放置ゲーを含むチェックボックスをクリックするとチェック状態が切り替わること', () => {
    render(<StatsCharts posts={posts} />);

    const checkboxes = screen.getAllByRole('checkbox', { name: '放置ゲーを含む' }) as HTMLInputElement[];
    fireEvent.click(checkboxes[0]);
    expect(checkboxes[0].checked).toBe(true);

    fireEvent.click(checkboxes[1]);
    expect(checkboxes[1].checked).toBe(true);
  });
});

// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import SteamBanner from './SteamBanner';
afterEach(cleanup);
describe('記事のバナー画像', () => {
  it('画像参照がない既存投稿ではプレースホルダーを表示すること', () => {
    const { container } = render(<SteamBanner />);
    expect(screen.getByText('画像なし')).toBeTruthy();
    expect(container.querySelector('img')).toBeNull();
  });
  it('許可されていない画像ホストには通信しないこと', () => {
    const { container } = render(<SteamBanner imageUrl="https://example.com/header.jpg" />);
    expect(container.querySelector('img')).toBeNull();
  });
  it('画像の読み込みに失敗した後も別の画像は表示できること', () => {
    const url = 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/123/hash/header.jpg';
    const { container, rerender } = render(<SteamBanner imageUrl={url} />);
    fireEvent.error(container.querySelector('img'));
    expect(screen.getByText('画像なし')).toBeTruthy();
    rerender(<SteamBanner imageUrl={url + '?t=2'} />);
    expect(container.querySelector('img')).toBeTruthy();
  });
});

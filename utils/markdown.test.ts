import { describe, expect, it } from 'vitest';
import { achievementPosts } from 'tests/fixtures/achievement-posts';
import { renderMarkdown } from './markdown';

describe('実績記事の本文表示', () => {
  it.each(achievementPosts.map((post) => [post.title, post.content] as const))(
    '%s の HTML が変わらないこと',
    (_title, content) => {
      expect(renderMarkdown(content)).toMatchSnapshot();
    },
  );

  it('本文に埋め込まれた HTML がエスケープされること', () => {
    const html = renderMarkdown('<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>');
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;script&gt;');
  });
});

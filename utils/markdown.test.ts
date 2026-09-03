import { describe, expect, it } from 'vitest';
import { achievementPosts } from '../prisma/seed_constants/achievement-posts';
import { renderMarkdown } from './markdown';

describe('achievement post content rendering', () => {
  it.each(achievementPosts.map((post) => [post.title, post.content] as const))(
    'keeps HTML stable for %s',
    (_title, content) => {
      expect(renderMarkdown(content)).toMatchSnapshot();
    },
  );

  it('escapes HTML embedded in post content', () => {
    const html = renderMarkdown('<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>');
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;script&gt;');
  });
});

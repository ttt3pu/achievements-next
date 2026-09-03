import { describe, expect, it } from 'vitest';
import { renderMarkdown } from './markdown';

describe('renderMarkdown', () => {
  it('converts newlines in paragraphs to <br>', () => {
    expect(renderMarkdown('line1\nline2')).toBe('<p>line1<br>\nline2</p>\n');
  });

  it('renders headings, bold, links, and lists used in posts', () => {
    const source = `## h2
**太字**

### h3

記事コンテンツ[文中リンク](https://google.com)

<https://example.com>

- foo
- bar

1. foo
1. bar
`;

    expect(renderMarkdown(source)).toBe(`<h2>h2</h2>
<p><strong>太字</strong></p>
<h3>h3</h3>
<p>記事コンテンツ<a href="https://google.com">文中リンク</a></p>
<p><a href="https://example.com">https://example.com</a></p>
<ul>
<li>foo</li>
<li>bar</li>
</ul>
<ol>
<li>foo</li>
<li>bar</li>
</ol>
`);
  });

  it('renders nested lists and Japanese post body', () => {
    const source = `# 良かったところ
- グラがきれい
  - の割にそこまで重くないのも良かった
- 戦闘システムが良く出来てる

plain
line`;

    expect(renderMarkdown(source)).toBe(`<h1>良かったところ</h1>
<ul>
<li>グラがきれい
<ul>
<li>の割にそこまで重くないのも良かった</li>
</ul>
</li>
<li>戦闘システムが良く出来てる</li>
</ul>
<p>plain<br>
line</p>
`);
  });

  it('escapes raw HTML', () => {
    expect(renderMarkdown('<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>')).toBe(
      '<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>\n<p>&lt;img src=x onerror=alert(1)&gt;</p>\n',
    );
  });

  it('does not render javascript: or data: links', () => {
    expect(renderMarkdown('[click](javascript:alert(1))')).toBe('<p>[click](javascript:alert(1))</p>\n');
    expect(renderMarkdown('[img](data:text/html,xss)')).toBe('<p>[img](data:text/html,xss)</p>\n');
  });

  it('does not autolink bare URLs', () => {
    expect(renderMarkdown('https://example.com')).toBe('<p>https://example.com</p>\n');
  });
});

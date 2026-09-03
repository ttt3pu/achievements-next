import MarkdownIt from 'markdown-it';

const markdownIt = new MarkdownIt({ breaks: true });

export function renderMarkdown(source: string) {
  return markdownIt.render(source);
}

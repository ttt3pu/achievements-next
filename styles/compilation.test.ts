import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import postcss, { type AtRule, type PluginCreator } from 'postcss';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const config = require('../postcss.config.cjs');

async function compile(relativePath: string) {
  const from = fileURLToPath(new URL(relativePath, import.meta.url));
  const plugins = Object.entries(config.plugins).map(([name, options]) => {
    const plugin: PluginCreator<Record<string, unknown>> = require(name);
    // 本番ビルドと同じ最適化も通し、CSS の生成成功だけでなく生成内容を確認する。
    return plugin({ ...(options as object), optimize: true });
  });
  const result = await postcss(plugins).process(await readFile(from, 'utf8'), { from });

  expect(result.warnings()).toEqual([]);
  result.root.walkAtRules(/^(import|reference|apply|theme|tailwind)$/, (rule) => {
    throw new Error(`未処理のディレクティブ: ${rule.toString()}`);
  });
  result.root.walkComments((comment) => {
    comment.remove();
  });
  return result.root;
}

describe('公開画面のスタイル生成', () => {
  it('テーマと一覧の段組み・画像・選択状態のスタイルが生成されること', async () => {
    const root = await compile('./globals.css');
    // 一覧で使うレスポンシブ指定、任意値、条件付きクラスも実ソースから検出する。
    const selectors = [
      'html',
      'body',
      'a',
      '.grid-cols-4',
      '.max-md\\:grid-cols-3',
      '.max-sm\\:grid-cols-2',
      '.max-lg\\:flex-col',
      '.bg-bg-200',
      '.fill-yellow',
      '.top-\\[1px\\]',
      '.-rotate-180',
      '.object-cover',
      '.max-w-contents',
    ];
    const styles = selectors.map((selector) => {
      const rules: { context: string[]; css: string }[] = [];
      root.walkRules((rule) => {
        if (rule.selector !== selector) return;
        const context: string[] = [];
        for (let parent = rule.parent; parent?.type === 'atrule'; parent = parent.parent) {
          const atRule = parent as AtRule;
          context.unshift(`@${atRule.name} ${atRule.params}`);
        }
        rules.push({ context, css: rule.toString() });
      });
      expect(rules, `${selector} の生成結果`).not.toHaveLength(0);
      return { selector, rules };
    });
    const theme: Record<string, string> = {};
    root.walkDecls(/^--(color|font|max-width)-/, (declaration) => {
      theme[declaration.prop] = declaration.value;
    });

    expect({ theme, styles }).toMatchSnapshot();
  });

  it.each([
    ['一覧カードの順位・ホバー・モバイル表示', '../pages/index.module.css'],
    ['記事詳細の項目間の余白と区切り線', '../components/molecules/Detailitem.module.css'],
  ])('%s がテーマ参照を解決して生成されること', async (_, path) => {
    const root = await compile(path);

    expect(root.toString().trim()).toMatchSnapshot();
  });
});

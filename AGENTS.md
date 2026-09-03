# AGENTS.md

このリポジトリで作業する AI エージェント共通の指示。**すべての作業に常に適用される。**

セットアップ・起動・テスト実行のコマンドは [README.md](README.md) を参照。

## 言語

**人間へのやりとり・PR タイトル・PR 概要・コメントへの返信はすべて日本語。**

- コミットメッセージは英語（既存の慣例に従う）
- コード内のコメントは日本語・英語どちらでもよい
- ドキュメントは既存ファイルの言語に従う

## パッケージマネージャー

**npm / yarn は使用禁止。pnpm を使う。**

- インストールは `pnpm install`
- Node.js のバージョンは `.tool-versions`、pnpm のバージョンは `package.json` の `packageManager` を参照

### よく使う品質コマンドは scripts 経由

`test` / `lint` / `prettier` / `check` など、すでに `package.json` にあるもの、または同系統でしょっちゅう使うものは `pnpm exec` / `npx` / `pnpm dlx` ではなく `pnpm <script>` で実行する。

- 例: `pnpm check`、`pnpm prettier:fix`、`pnpm test`、`pnpm test:update`、`pnpm lint:js`
- **何でも script に追加しない**。ワンショットや稀なコマンド用に script を増やさない
- 既にある `prettier` / `test` / `lint:*` を `pnpm exec prettier` などで呼び直さない

## 技術スタック

正確なバージョンは `package.json` を参照。

- **フレームワーク**: Next.js（Pages Router）+ TypeScript
- **UI**: React、Atomic Design（`atoms/` → `molecules/` → `organisms/`）
- **スタイリング**: Tailwind CSS v4 のユーティリティクラス優先。必要なら CSS（`.css`）。SCSS は使わない
- **データベース**: Prisma ORM。スキーマは `prisma` サブモジュール（`ttt3pu/attt-prisma`）で管理し、生成された Prisma Client の型を使う
- **認証**: NextAuth.js
- **コード品質**: ESLint + Prettier + Stylelint

### ディレクトリ構成

- `pages/` - Next.js ページ（Pages Router）
- `components/atoms/` `molecules/` `organisms/` - UI コンポーネント
- `prisma/` - スキーマと設定（git サブモジュール）
- `styles/` - グローバルスタイルと CSS 変数
- `types/` / `utils/` / `constants/`
- `tests/` - フィクスチャと、実装の隣に置けないテスト

## 変更の進め方

- 最小限の変更で問題を解決する。既存の動作を壊さない
- TypeScript の型安全性を維持し、React は関数コンポーネントで書く
- 変更後は `pnpm check` を通す。整形は `pnpm prettier:fix`
- テストを書く・直すときは skill [testing](.agents/skills/testing/SKILL.md) に従う

## PR 作成時の必須手順

**PR を作成する前に `.github/pull_request_template.md` を必ず読み、その構造に従って説明文を書く。**

すべてのセクション見出しを維持し、各セクションに内容を記入する。空のセクションも省略せず残す。

## pnpm-lock.yaml の取り扱い（重要）

以下は**絶対に禁止**。

- `git checkout -- pnpm-lock.yaml` の実行
- `rm pnpm-lock.yaml && pnpm install` による再生成

### lockfile 汚染（`packageManagerDependencies` の混入）の対処

1. `grep -n '^---$' pnpm-lock.yaml` で 2 番目の `---` の行番号（N 行目）を確認
2. `tail -n +N pnpm-lock.yaml > /tmp/lockfile_clean.yaml && mv /tmp/lockfile_clean.yaml pnpm-lock.yaml` でプリアンブルを除去

原因は `corepack disable` により `pnpm/action-setup` が `packageManager` を読めず pnpm v11 が入ること。`COREPACK_ENABLE_AUTO_PIN=0` のみを使い、`corepack disable` は使わない。

## エージェント設定の置き場所

指示は 2 種類しかない。**常に適用されるものは `AGENTS.md` に書き、それ以外はすべて skill にする。**

| パス                              | 役割                                                                          |
| --------------------------------- | ----------------------------------------------------------------------------- |
| `AGENTS.md`（このファイル）       | 常時適用の共通指示                                                            |
| `.agents/skills/<name>/SKILL.md`  | 適用範囲が限られる指示。ルールもガイドラインも手順書もここ                    |
| `.github/copilot-instructions.md` | github.com の Copilot Chat が `AGENTS.md` を読まないための固定ポインタ        |
| `.github/skills`                  | `.agents/skills` へのディレクトリ symlink（Copilot code review が参照する用） |

`AGENTS.md` は Cursor・Copilot cloud agent・Copilot CLI・Codex・Claude Code が読み、`.agents/skills/` は Cursor と Copilot（CLI / VS Code / Visual Studio / cloud agent）が公式にサポートしている。ツール固有のファイルは上の 2 つだけで、**指示が増えても増えない**。

### ルールを追加するとき

1. 常時適用なら `AGENTS.md` に節を足す
2. 適用範囲が限られるなら `.agents/skills/<name>/` を作り、`SKILL.md` に `name`（ディレクトリ名と一致させる。ずれると読み込まれない）、`description`（何をするか・いつ使うか）、必要なら `paths`（glob）を書く
3. ツール固有のファイルは作らない。`.cursor/rules/*.mdc` や `.github/instructions/*.instructions.md` に内容を複製しない

### 新しいエージェントを追加するとき

`AGENTS.md` と `.agents/skills/` を読めるツールなら設定は不要。読めない場合だけ、そのツールが見る場所に**ポインタ 1 枚**かディレクトリ symlink 1 本を置く。指示の本文を複製したり、ルールごとにアダプタを作ったりしない。

# AGENTS.md

このリポジトリで作業する AI エージェント共通の指示。**すべての作業に常に適用される。**

セットアップ・起動・テスト実行のコマンドは [README.md](README.md) を参照。

## 指示とスキルの置き場所

**skill は共有プラグインにだけ置く。このリポジトリの指示は `AGENTS.md`（このファイル）に書く。** リポジトリ内に skill を置かない。

| パス                                | 役割                                                                      |
| ----------------------------------- | ------------------------------------------------------------------------- |
| `AGENTS.md`（このファイル）         | このリポジトリの指示。長くなった節だけ `docs/` へ切り出してここからリンク |
| 共有プラグイン `ttt3pu/ai-settings` | 複数リポジトリで共通の skill。原本は向こうにあり、こちらには置かない      |
| `.github/copilot-instructions.md`   | github.com の Copilot Chat が `AGENTS.md` を読まないための固定ポインタ    |

リポジトリ内 skill（`.agents/skills/`）を使わない理由は 2 つ。ツールごとに探索パスが違い（Claude Code のプロジェクト skill は `.claude/skills/` のみで `.agents/skills/` を読まない）、置いても届かないツールがある。加えて共有プラグインと同じ話題の skill が両側にあると、どちらがどこまで読まれるかが実行するツールと状況に依存する。`AGENTS.md` は Cursor・Claude Code・Codex・Copilot（cloud agent / CLI / VS Code）がいずれも読むので、リポジトリ固有の指示はここに集約するのが最も確実。

### 共有 skill

[ttt3pu/ai-settings](https://github.com/ttt3pu/ai-settings) から marketplace 経由で配信している。インストール手順は同リポジトリの README を参照。収録 skill は次の 2 つ。

- `enable-library-automerge` — Renovate の minor/patch 自動マージを、プロダクト経路の回帰テストと CI 通過を条件に有効化する
- `shared-testing-conventions` — テストの命名規則、テスト対象の選び方、配置とスナップショットの扱い

守ること。

- 内容をこのリポジトリのファイルに複製しない。参照するだけにする
- 「適用先の構成に従う」としている箇所の答えは `AGENTS.md` に書く。同じ話題の skill をこのリポジトリに作って分割しない
- 直したいときは `ttt3pu/ai-settings` 側を直す。こちらで上書きしたり、ローカル版を作って分岐させたりしない
- プラグインが入っていない環境で作業する場合は、該当 `SKILL.md` を直接読んでから進める

### ルールを追加するとき

1. このリポジトリ固有なら `AGENTS.md` に節を足す。分量が増えたら `docs/` に切り出して `AGENTS.md` からリンクする
2. 他のリポジトリでも通用する内容なら `ttt3pu/ai-settings` に skill として追加する。このリポジトリには置かない
3. ツール固有のファイルは作らない。`.cursor/rules/*.mdc` や `.github/instructions/*.instructions.md` に内容を複製しない

### 新しいエージェントを追加するとき

`AGENTS.md` を読めるツールなら設定は不要。読めない場合だけ、そのツールが見る場所に**ポインタ 1 枚**を置く。指示の本文を複製したり、ルールごとにアダプタを作ったりしない。

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
- テストを書く・直すときは下の「テスト」を見る

## テスト

命名規則・何をテストするか・スナップショットの扱いは共有 skill `shared-testing-conventions` に従う。同 skill が「適用先の構成に従う」としている箇所の答えはこれ。

- テストランナーは Vitest。DOM が必要なファイルは先頭に `// @vitest-environment jsdom` を書き、`@testing-library/react` で描画・操作する
- フィクスチャは `tests/fixtures/`。本文の構造は seed（`prisma/seed_constants/`）の Markdown 構造とデータの幅に合わせる
- 実装の隣に `*.test.ts(x)` を置く。ただし `pages/` 配下は Next のルートとして扱われるため、ページのテストは `tests/` に置く
- タイムゾーンは `vitest.config.ts` で固定済み。日付の期待値をローカル環境に合わせて書き換えない
- 実行は `pnpm test` / `pnpm test:update`
- Prisma 経路のテストは実 DB を通す。テーブルを空にしてからフィクスチャを流すので、開発用とは別の `TEST_DATABASE_URL`（末尾が `_test` のデータベース）が必要。未設定なら `make test-db` で用意する

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

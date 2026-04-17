# AI Guidelines for achievements-next

> このファイルはすべての AI エージェント作業に適用されます。

## 重要な初期指示

作業を開始する前に、必ずプロジェクトのルートにある `README.md` を読んでください。このファイルには、プロジェクトの要件、セットアップ手順、技術スタック、およびディレクトリ構造に関する重要な情報が含まれています。

---

## 言語について

**すべての人間とのやりとり、PRのタイトル、PR概要欄、コメントへの返信は日本語で行ってください。**

- コミットメッセージは英語で記述してください（既存の慣例に従う）
- コード内のコメントは日本語または英語のどちらでも構いません
- ドキュメンテーションファイルは既存の言語に従ってください

## PR作成時の必須手順

**PR を作成する前に `.github/pull_request_template.md` を必ず読み、その構造に完全に従って説明文を記述してください。**

- テンプレートのすべてのセクション見出しを維持してください
- 各セクションに適切な内容を記入してください
- 空のセクションも省略せず残してください

## プロジェクト概要

このプロジェクトは Next.js ベースのウェブアプリケーションです：

### 技術スタック

> 各パッケージの正確なバージョンは `package.json` を、Node.js のバージョンは `.tool-versions`、pnpm のバージョンは `package.json` の `packageManager` フィールドを参照してください。

- **フレームワーク**: Next.js (Pages Router) with TypeScript
- **UI**: React
- **スタイリング**: Tailwind CSS v4 + CSS（SCSS は使用しない）
- **データベース**: Prisma ORM（スキーマは `prisma` サブモジュールで管理）
- **認証**: NextAuth.js
- **コード品質**: ESLint + Prettier + Stylelint
- **パッケージマネージャー**: pnpm

### 重要なディレクトリ構造

- `/pages/` - Next.js ページ（Pages Router）
- `/components/atoms/` - 最小単位の UI コンポーネント
- `/components/molecules/` - 複合コンポーネント
- `/components/organisms/` - 大きな UI ブロック
- `/prisma/` - データベーススキーマと設定（git サブモジュール: `ttt3pu/attt-prisma`）
- `/styles/` - グローバルスタイルと CSS 変数
- `/types/` - TypeScript 型定義
- `/utils/` - ユーティリティ関数
- `/constants/` - 定数定義

## 開発ガイドライン

### コード品質

- ESLint、Prettier、Stylelint の設定に従ってください
- TypeScript の型安全性を維持してください
- React の関数コンポーネントを使用してください

### 変更を行う際の注意点

- 最小限の変更で問題を解決してください
- 既存の動作を壊さないよう注意してください
- テストがある場合は必ず実行してください
- コードフォーマットツールを使用してください

## pnpm-lock.yaml の取り扱い（重要ルール）

以下の操作は**絶対に禁止**です：

- `git checkout -- pnpm-lock.yaml` の実行
- `rm pnpm-lock.yaml && pnpm install` による再生成

### lockfile 汚染（`packageManagerDependencies` の混入）の対処法

1. `grep -n '^---$' pnpm-lock.yaml` で2番目の `---` の行番号（N行目）を確認
2. `tail -n +N pnpm-lock.yaml > /tmp/lockfile_clean.yaml && mv /tmp/lockfile_clean.yaml pnpm-lock.yaml` でプリアンブルを除去

### 汚染の根本原因と防止策

- **原因**: `corepack disable` を実行すると `pnpm/action-setup@v6` が `packageManager` フィールドを読めなくなり pnpm v11 がインストールされ汚染が発生
- **防止策**: `COREPACK_ENABLE_AUTO_PIN=0` 環境変数のみ使用すること（`corepack disable` は使わない）

## セットアップ要件

以下のバージョンを使用してください。正確なバージョンは各ファイルを参照してください：

- **Node.js**: `.tool-versions` の `nodejs` エントリを参照
- **pnpm**: `package.json` の `packageManager` フィールドを参照
- **Docker**: データベースサービス用（バージョン制約なし）
- **direnv**: 推奨（バージョン制約なし）

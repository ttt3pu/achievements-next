# AI Guidelines for achievements-next

## 重要な初期指示

作業を開始する前に、必ずプロジェクトのルートにある `README.md` を読んでください。このファイルには、プロジェクトの要件、セットアップ手順、技術スタック、およびディレクトリ構造に関する重要な情報が含まれています。

---

## ⚠️ pnpm-lock.yaml の汚染防止（最重要）

**`pnpm-lock.yaml` に `packageManagerDependencies` や `@pnpm/exe` エントリが追加されてはいけません。**
これらが混入すると Vercel デプロイが失敗します。

### 原因
corepack が有効な状態で `pnpm install` を実行すると、`packageManager` フィールド（`package.json`）を参照して `packageManagerDependencies` を lockfile に書き込む。

### 対処法・再発防止

1. **`pnpm install` の前に必ず corepack を無効化する**

   ```bash
   corepack disable
   COREPACK_ENABLE_AUTO_PIN=0 pnpm install
   ```

2. **汚染されてしまった場合は lockfile を削除して再生成する**

   ```bash
   corepack disable
   rm pnpm-lock.yaml
   COREPACK_ENABLE_AUTO_PIN=0 pnpm install --no-frozen-lockfile
   ```

3. **コミット前に必ず確認する**

   ```bash
   grep -c 'packageManagerDependencies' pnpm-lock.yaml || echo "OK（汚染なし）"
   ```

   `0` または `OK（汚染なし）` が表示されれば問題なし。表示された数値が 1 以上の場合は上記の再生成手順を実施すること。

---

## 言語について

**すべての人間とのやりとり、PRのタイトル、PR概要欄、コメントへの返信は日本語で行ってください。**

- コミットメッセージは英語で記述してください（既存の慣例に従う）
- コード内のコメントは日本語または英語のどちらでも構いません
- ドキュメンテーションファイルは既存の言語に従ってください

## プロジェクト概要

このプロジェクトは Next.js ベースのウェブアプリケーションです：

### 技術スタック
> 各パッケージの正確なバージョンは `package.json` を、Node.js のバージョンは `.tool-versions`、pnpm のバージョンは `package.json` の `packageManager` フィールドを参照してください。

- **フレームワーク**: Next.js (Pages Router) with TypeScript
- **UI**: React
- **スタイリング**: Tailwind CSS + SCSS
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
- `/styles/` - グローバルスタイルと SCSS 変数
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

### PR作成時
- タイトルと説明は日本語で記述してください
- 変更内容を明確に説明してください
- 必要に応じてスクリーンショットを含めてください

## セットアップ要件

以下のバージョンを使用してください。正確なバージョンは各ファイルを参照してください：

- **Node.js**: `.tool-versions` の `nodejs` エントリを参照
- **pnpm**: `package.json` の `packageManager` フィールドを参照
- **Docker**: データベースサービス用（バージョン制約なし）
- **direnv**: 推奨（バージョン制約なし）

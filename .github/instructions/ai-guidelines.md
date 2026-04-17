# AI Guidelines for achievements-next

## 重要な初期指示

作業を開始する前に、必ずプロジェクトのルートにある `README.md` を読んでください。このファイルには、プロジェクトの要件、セットアップ手順、技術スタック、およびディレクトリ構造に関する重要な情報が含まれています。

---

## ⚠️ pnpm-lock.yaml の汚染防止（最重要）

**`pnpm-lock.yaml` の先頭に pnpm 自己管理用プリアンブル文書（`packageManagerDependencies` / `@pnpm/exe` エントリ）が追加されてはいけません。**
これらが混入すると Vercel デプロイが失敗します。

### 絶対にやってはいけないこと

- **`git checkout -- pnpm-lock.yaml` を実行してはいけない**（何度指摘されても繰り返さないこと）
- **`setup-project/action.yml` や他のワークフローに `git checkout -- pnpm-lock.yaml` を追加してはいけない**
- **`corepack disable` を実行してはいけない**（pnpm のバージョン管理が壊れる）

### 汚染の構造と根本原因

`pnpm-lock.yaml` は YAML マルチドキュメント形式になっており、汚染時は以下の構造になります：

```
---                                ← 1ドキュメント目（プリアンブル）
lockfileVersion: '9.0'
importers:
  .:
    packageManagerDependencies:   ← ← ← ここが汚染エントリ
      '@pnpm/exe':
        ...
packages:
  '@pnpm/exe@10.x.x':
    ...
snapshots:
  ...
---                                ← 2ドキュメント目（本来のロックファイル）
lockfileVersion: '9.0'
settings:
  ...（本来の依存関係）
```

pnpm 10.x は `package.json` の `"packageManager"` フィールドが存在するとき、自分自身を
`packageManagerDependencies` としてロックファイルに記録します。

**GitHub Actions 環境で `corepack disable` を実行すると**、`pnpm/action-setup@v6` が
`package.json` の `packageManager` フィールドを読めなくなり、pnpm 最新版（v11+）が
インストールされて同様の汚染が発生します。

### 正しい対処法（汚染が発生した場合）

pnpm-lock.yaml の先頭の `---` ドキュメント全体（2番目の `---` の直前まで）を削除します。
`---\nlockfileVersion: '9.0'\n\nsettings:` で始まるドキュメントのみを残してください。

```bash
# 汚染の確認（grep で `packageManagerDependencies` が見つかる = 汚染）
head -20 pnpm-lock.yaml
# 何行目に2番目の --- があるか確認
grep -n '^---$' pnpm-lock.yaml
# 例: 94行目に2番目の --- がある場合
sed -n '94,$p' pnpm-lock.yaml > /tmp/pnpm-lock-clean.yaml
cp /tmp/pnpm-lock-clean.yaml pnpm-lock.yaml
# 確認
grep 'packageManagerDependencies' pnpm-lock.yaml | wc -l   # → 0 ならOK
```

### 再発防止

1. **`COREPACK_ENABLE_AUTO_PIN=0`** を GitHub Actions 環境変数に設定済み（変更不要）
2. **`.npmrc`** に `manage-package-manager-versions=false` を設定済み（変更不要）
3. Copilot エージェント環境で `pnpm install` を実行した後は、コミット前に必ず確認すること：

   ```bash
   head -5 pnpm-lock.yaml   # "lockfileVersion: '9.0'" で始まっていること
   grep 'packageManagerDependencies' pnpm-lock.yaml | wc -l   # 0 であること
   ```

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

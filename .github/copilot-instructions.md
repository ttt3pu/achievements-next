# Copilot Instructions

> **重要**: このファイルはすべての作業において常に適用されます。指示に従わない場合は作業が不完全とみなされます。

## 言語

**すべての返答・PRタイトル・PR概要・コメントは日本語で記述してください。**

- コミットメッセージのみ英語（既存の慣例に従う）
- コード内のコメントは日本語・英語どちらでも可

## パッケージマネージャー

**npm・yarn は使用禁止。必ず pnpm を使用してください。**

- インストール: `pnpm install`
- スクリプト実行: `pnpm <script>`
- 正確なバージョンは `package.json` の `packageManager` フィールドを参照

## PR作成時の必須手順

**PRを作成する前に `.github/pull_request_template.md` を必ず読み、その構造に従って説明文を書いてください。**

テンプレートのすべてのセクション見出しを維持し、各セクションに適切な内容を記入してください。空のセクションも省略せず残してください。

## コーディング指針

### プロジェクト構造
- Next.js の Pages Router（`pages/` ディレクトリ）
- Atomic Design: `atoms/` → `molecules/` → `organisms/`
- TypeScript の型安全性を維持してください

### スタイリング
- **Tailwind CSS v4** のユーティリティクラスを優先使用してください
- カスタムスタイルが必要な場合は **CSS**（`.css`）を使用してください（SCSS は使用しません）
- 既存のデザインパターンに従ってください

### データベース
- Prisma スキーマは `prisma` サブモジュール（`ttt3pu/attt-prisma`）で管理
- 生成された Prisma Client の型を使用してください

## pnpm-lock.yaml の取り扱い（重要）

- `pnpm-lock.yaml` に対して `git checkout -- pnpm-lock.yaml` を**実行しないでください**
- `rm pnpm-lock.yaml && pnpm install` で再生成することも**禁止**です
- lockfile が汚染された場合は `.github/instructions/ai-guidelines.md` の手順を参照してください

## 品質保証

コード変更後は必ず以下を実行してください：

```bash
pnpm lint:js && pnpm prettier && pnpm lint:style
```

- 既存のテストを壊さないでください
- 新機能にはテストの追加を検討してください

# TypeScript 7への移行

## 進捗チェックリスト

- [x] P1 互換構成と設定の移行
  - 依存先：なし
  - 完了条件：TypeScript 7と6のAPIを併用し、廃止設定を置き換える。
  - 証跡／阻害要因／再開メモ：package.json、tsconfig.json、README.md、CIを更新。依存のインストールと検証はP2で行う。
- [x] P2 品質とビルドの検証
  - 依存先：P1
  - 完了条件：pnpm checkとpnpm buildが成功する。
  - 証跡／阻害要因／再開メモ：pnpm check成功（14ファイル・145テスト）、pnpm build成功。tsc --versionは7.0.2。検証詳細は下記。

## 目的・対象範囲

PR #656の単純更新で失敗するESLintとの互換性を保ち、TypeScript 7の型チェックへ移行する。
CIにも型チェックを追加する。リモートPRの更新とマージは含めない。

## 決定事項・制約

- TypeScript 7は`@typescript/native`の別名で導入する。
- `typescript`は`@typescript/typescript6`の別名とし、Compiler APIを必要とするツールへ提供する。
- `baseUrl`の絶対インポートは既存のディレクトリへの`paths`で維持する。
- 公式根拠：https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6.0

## 計画全体の完成条件

TypeScript 7で型チェックが実行され、ESLint、既存テスト、Next.jsのビルドが成功する。

## 検証詳細

- 完了日：2026-11-19
- Node.js 26.13.0、pnpm 12.18.0で検証。
- 既存ローカルDBはPostgreSQL 16のデータと17の不一致で起動不可。別ポート55432に使い捨てPostgreSQL 17を用意し、既存5件のマイグレーションを適用した。
- `TEST_DATABASE_URL=postgresql://root:root@localhost:55432/attt_test pnpm check`成功。
- 同DBに接続するローカル開発サーバー（3300番）を静的生成時のAPIに指定し、`pnpm build`成功。テスト後のフィクスチャで一覧・詳細・統計を生成した。
- Next.jsが必須とする`jsx: react-jsx`も適用。
- peer依存の警告は既存のeslint-plugin-reactとCSS関連のみで、TypeScript関連はない。

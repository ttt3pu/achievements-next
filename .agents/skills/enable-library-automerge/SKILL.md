---
name: enable-library-automerge
description: >-
  Enables safe Renovate automerge for a specific npm library by adding
  product-focused regression tests and CI coverage, then turning on minor/patch
  automerge. Use when the user asks to automerge a dependency safely, add tests
  so a library can be auto-merged, enable Renovate automerge for a package, or
  harden dependency upgrades with regression coverage.
---

# Enable library automerge

任意のライブラリについて、**本プロダクト上の挙動**をテストで固定し、CI 通過を条件に Renovate の minor/patch 自動マージを有効化する。

## 手順

### 1. プロダクト上の利用を特定する

- import / 呼び出し箇所をすべて洗う
- 入力の実体を特定する（DB の保存データ、API レスポンス、設定ファイル、ユーザー入力など）
- 出力の消費者を特定する（画面描画、ファイル出力、別モジュールへの引き渡しなど）
- 壊れたときにユーザー影響が出る境界だけをテスト対象にする

### 2. テスト設計（製品契約）

ライブラリ単体の仕様・API 確認で終わらせない。プロダクトの入出力を通す。

優先順:

1. **実データ / 本番相当フィクスチャ**を通し、プロダクトが依存する出力を固定する
2. 出力がテキストや大きな構造体なら **スナップショット**を使う（アップグレード差分が製品影響として読める）
3. 破壊時コストが高い境界があるなら、製品文脈で最小限の断言を足す

避ける:

- ライブラリのドキュメント例や公開 API カタログをなぞるだけのケース
- プロダクトが使っていないオプション・機能の網羅

呼び出しがプロダクト固有コードに埋もれている場合は、**本番と同じ経路**を叩ける薄い関数へ切り出してからテストする。

### 3. CI に載せる

- 追加したテストが CI で必ず走る状態にする
- テスト基盤が無ければ、対象の製品契約を固定できる最小構成だけ導入する（このリポジトリでは Vitest）

### 4. Renovate automerge

共有設定（`github>ttt3pu/renovate-settings`）の allowlist に無いパッケージは、**そのリポジトリの `renovate.json`** に packageRule を足す。

```json
{
  "extends": ["github>ttt3pu/renovate-settings"],
  "packageRules": [
    {
      "description": "Automerge <package> minor/patch when tests pass",
      "matchPackageNames": ["<package>"],
      "matchUpdateTypes": ["minor", "patch"],
      "automerge": true
    }
  ]
}
```

テストが無い他リポジトリまで巻き込む場合を除き、共有 allowlist へ安易に追加しない。

### 5. 完了条件

- [ ] プロダクト経路の回帰テストがあり、通る
- [ ] CI がそのテストを実行する
- [ ] 対象パッケージの minor/patch が automerge 対象になっている

## 追加資料

- 具体例（markdown-it）: [examples.md](examples.md)

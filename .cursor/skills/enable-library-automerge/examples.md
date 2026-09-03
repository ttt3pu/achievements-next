# Example: markdown-it

## プロダクト上の利用

- `PostView` が投稿 `content` を HTML 化して `dangerouslySetInnerHTML` で表示
- 入力は実績投稿の本文（seed: `prisma/seed_constants/achievement-posts.ts`）
- 設定は実質 `{ breaks: true }`（改行だらけのプレーン文と、見出し・ネストリスト混在）

## うまくいかなかったアプローチ

markdown-it 自体の仕様（太字記法、危険な URL など）を並べるテスト。  
アップグレード安全性の根拠にならず、製品影響が見えない。

## 採用したアプローチ

1. `renderMarkdown` に切り出し、本番と同じ関数をテスト
2. seed の全投稿を `renderMarkdown` → HTML スナップショット
3. HTML 埋め込み前提で、本文中の生 HTML がエスケープされることだけ別断言
4. CI でテストを実行
5. `renovate.json` で `markdown-it` の minor/patch を `automerge: true`

## 結果として見るもの

Renovate が `markdown-it` を上げたとき、スナップショット差分が「どの投稿の表示 HTML がどう変わるか」を示す。それがレビュー／自動マージ可否の判断材料になる。

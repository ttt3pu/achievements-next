# achievements-next

AI エージェント向けの指示は [AGENTS.md](AGENTS.md)。

## Commands

### Setup

```sh
cp .sample.envrc .envrc
direnv allow
make setup
```

### Start dev mode

```sh
make dev
```

### Seed

```sh
pnpm prisma db seed
```

### Test

Prisma 経路のテストは実 DB を通す。テーブルを空にしてからフィクスチャを流すので、
開発用とは別の `TEST_DATABASE_URL`（末尾が `_test` のデータベース）を使う。
`make setup` に含まれているが、単体で用意し直すこともできる。

```sh
make test-db
pnpm test
```

## Steam投稿補完と画像

`.envrc` に `STEAM_WEB_API_KEY` と投稿対象アカウントの `STEAM_ID64` を設定し、
`direnv allow` で反映する。キーはサーバー側だけで使用する。
実績の取得にはプロフィール・ゲーム詳細の公開設定が必要。
管理者の新規・編集フォームでSteamストアURLまたはApp IDを入力し、「Steamから取得」を押す。
タイトル・画像を取得し、全実績解除と有効な解除日時を確認できた場合にコンプ日を補完する。
入力済みのタイトル・日付は保持し、候補の採用ボタンで明示的に変更できる。
コンプ日は現在の実績構成から求めるため、実績追加前の初回コンプ日と異なる場合がある。
所要時間・評価・本文は手入力のままで、総プレイ時間は取得しない。
初回取得・「再取得」はSteam API各2回。同じゲームの取得済み情報はフォーム内で再利用する。
入力・保存・閲覧だけではSteam APIを呼ばない。
画像取得には未文書化のGetItems APIを使用し、取得失敗時は手入力と代替表示で継続する。

投稿の新規作成・編集はJSONのPOSTで保存します。保存に失敗した場合はエラーを表示し、入力した内容を保持します。

本番・Previewへの設定、両PRのマージ順、DB移行、画像登録と再デプロイは
[Steam投稿補完のリリース手順](docs/operations/steam-post-release.md) を参照してください。
Vercelへ `STEAM_WEB_API_KEY` と `STEAM_ID64` を環境ごとに設定し、新しいデプロイへ反映する必要があります。
ローカルの `.envrc` を設定しただけでは、ホスティング側へ反映されません。

既存投稿の画像が「画像なし」の場合は、管理画面の「未登録画像を一括同期」を実行してください。
サーバー側の設定で未登録画像だけを取得・保存し、結果と進捗を表示します。
同期後はDeployを実行して静的な公開一覧へ反映してください。DB移行だけでは既存画像は登録されません。

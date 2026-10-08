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

画像参照のカラムを追加するため、対象環境のDBへマイグレーションを適用してから
アプリを起動・更新する。

```sh
direnv exec . pnpm prisma migrate deploy
pnpm prisma generate
```

既存投稿の画像は閲覧時に取得しない。必要な環境で一度だけ以下を実行する。
最初のコマンドは画像未登録の記事だけを対象に取得状況を確認し、DBへ保存しない。
`--apply` は指定した `DATABASE_URL` のDBへ保存するので接続先を確認して実行する。

```sh
direnv exec . pnpm exec tsx scripts/backfill-steam-images.ts
direnv exec . pnpm exec tsx scripts/backfill-steam-images.ts --apply
```

50件ずつまとめて画像APIへ問い合わせ、既存の画像参照を上書きしない。
失敗時はそこで終了する。再実行しても画像未登録の記事だけを対象とする。
画像なし・リンク切れは一覧で「画像なし」と表示する。

投稿の新規作成・編集はJSONのPOSTで保存します。保存に失敗した場合はエラーを表示し、入力した内容を保持します。

スキーマ変更は `ttt3pu/attt-prisma` 側のPRも必要です。そちらのマージ後にアプリ側のサブモジュール参照を更新し、新アプリの起動前に対象DBのマイグレーションを適用してください。既存投稿への画像追加はアプリ反映後に別途実行できます。公開一覧はビルド時に生成するため、画像追加後は再ビルド・再デプロイしてください。

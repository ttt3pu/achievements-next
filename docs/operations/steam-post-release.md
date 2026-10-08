# Steam投稿補完のリリース手順

対象はVercelの [attt-team / achievements-next](https://vercel.com/attt-team/achievements-next)。
リポジトリの管理画面リンクとPRのVercel botから対象プロジェクトを確認した。
Vercelの実際の環境変数・Build Command・デプロイログ、DBサービスの設定は未確認なので、以下の確認を済ませてから反映する。
この文書は手順であり、本番設定・DB移行・デプロイを実施した記録ではない。

## 1. Vercelの環境変数を設定する

プロジェクトを開き、Environment Variables（Project Settings内）で値を保存する。
ローカルの `.envrc` やGitHub ActionsのSecretsはVercelへ自動転送されない。

| 変数                                                                      | 今回の対応         | 設定値・確認内容                                                                                    |
| ------------------------------------------------------------------------- | ------------------ | --------------------------------------------------------------------------------------------------- |
| `STEAM_WEB_API_KEY`                                                       | **新規設定**       | 管理者が用意したSteam Web APIキー。Secretとして保存する                                             |
| `STEAM_ID64`                                                              | **新規設定**       | 実績を取得するアカウントの17桁のSteamID64。ゲームのApp IDではない                                   |
| `DATABASE_URL`                                                            | 既存値を確認       | 対象環境のDB接続先。新アプリの保存・一覧APIが同じ移行済みDBを見ること                               |
| `NEXTAUTH_URL`                                                            | 既存値を確認       | 対象環境の正規URL。認証に加えて、現在の実装はビルド中もこのURLの一覧・記事APIを読む                 |
| `AUTH_CLIENT_ID_GOOGLE` / `AUTH_CLIENT_SECRET_GOOGLE` / `NEXTAUTH_SECRET` | 既存値を維持・確認 | 管理者ログイン用。Google側の許可済みリダイレクトURIが対象環境に対応していること                     |
| `DEPLOY_WEBHOOK_URL`                                                      | 既存値を確認       | 管理画面のDeployボタンで呼ぶVercel Deploy Hook。対象プロジェクト・Production Branchへ向いていること |

新規2変数は**Production**へ設定する。Previewで補完を確認する場合は**Preview**にも設定し、必要なら `feat/steam-post-autofill` ブランチに限定する。
ProductionとPreviewの値は別々に確認する。Developmentだけへの設定では本番に反映されない。
キーに `NEXT_PUBLIC_` を付けず、リポジトリ・PR・チャットへ値を貼らない。
`STEAM_ID64` のアカウントでプロフィール・ゲーム詳細が公開されていることを確認する。

Vercelの環境変数変更は**新しいデプロイにだけ反映される**。保存だけでは稼働中デプロイは変わらない。
設定を済ませてから、該当環境で新規デプロイ／Redeployを実行する。
[公式の環境変数管理手順](https://vercel.com/docs/environment-variables/managing-environment-variables)、
[環境別の適用範囲](https://vercel.com/docs/environment-variables)を参照。

`TEST_DATABASE_URL` はテスト専用で、今回の本番機能の設定には不要。
Previewで保存を試す場合は本番DBを共有せず、Preview用DBへ移行を適用する。
現在の実装ではAPIへのHTTP取得先とDB接続先が別設定なので、Previewの `NEXTAUTH_URL` が本番URLなら、画面・静的記事は本番データを読む。Preview検証が完結したと扱わない。

## 2. PR・ビルド設定を確認する

1. [Prisma側PR #230](https://github.com/ttt3pu/attt-prisma/pull/230) を先にマージする。
2. [アプリ側PR #705](https://github.com/ttt3pu/achievements-next/pull/705) のPrisma参照を確認する。squash／rebaseマージの場合は、Prismaのマージ後コミットへ更新し、pushしてCIを通す。
3. Vercelがそのサブモジュールを取得できること、Installで `pnpm install` のpostinstallによるPrisma Client生成が行われること、Buildが `pnpm build` で実行されることをログとプロジェクト設定で確認する。Installを独自コマンドで置き換えている場合もClient生成を省略しない。
4. Git連携のProduction Branchと自動デプロイ設定を確認する。mainへのマージで本番デプロイが始まる構成なら、**環境変数とDB移行を先に済ませてからアプリ側をマージする**。

GitHub ActionsのCIは使い捨てDBへ移行してテストする。CI成功だけでは本番DBの移行済み・Vercelでのビルド成功を意味しない。
PRのVercel botは2026-10-08時点でPreview Errorを報告している。
[対象デプロイ](https://vercel.com/attt-team/achievements-next/HAx1GGvMkG8WCTj7EetNtSwE5ori) のBuild Logsで原因を確認し、解消後にPreviewを再デプロイする。エラー原因はまだ確認できていない。

### ビルド時のAPI参照に関する前提

`utils/fetch.ts` は `NEXTAUTH_URL` に `/api/v1/achievement_post` 等を追加してHTTP取得する。
`pages/index.tsx` と `pages/[postId].tsx` はこの結果から静的ページを生成する。
**ビルド中の新デプロイ自身のAPIを呼ぶ構成ではない**ため、ビルド中に到達可能な稼働済みURLが必要。

Productionでは、既存の正規URLから一覧APIが200とJSON配列を返すこと、記事APIが200と対象記事を返すことを確認する。
Previewでは、認証設定・DBと整合する稼働済みの検証環境を参照しているか確認する。
認証画面へのリダイレクト・保護ページ・HTMLが返るURLではビルドできない。
初回Previewを独立環境として作れない場合は、その前提を先に解決する。原因未確認のまま `NEXTAUTH_URL` を変更しない。

最初のビルドが旧アプリのAPIを読むと、DBにカラムがあっても応答に `image_url` は含まれない。
初回公開は「画像なし」になる場合がある。新APIの反映・画像登録後の再ビルドで公開画像を反映する。

## 3. 対象DBへマイグレーションを適用する

実行元は本番接続情報を安全に扱える作業端末／実行環境。Vercelの通常のビルドに今回新しくDB移行を組み込む手順ではない。
対象DBのバックアップ／復元手段を確認し、Prismaのマージ済み移行ファイルを取得する。

既存のローカル `.envrc` が開発DBを指しているため、**本番用の独立チェックアウトと専用シェル**を使用する。
選んだリリースコミットを取得し、サブモジュールも固定コミットへ揃える。

```sh
git submodule update --init --recursive
pnpm install --frozen-lockfile
```

そのシェルの `DATABASE_URL` に対象環境の接続情報を秘密情報管理の手順で読み込む。
Vercelの値を設定しただけでは、作業端末の環境変数も設定されるわけではない。
DDLを実行できる接続を使用し、DBサービスで移行専用接続を分けている場合はそちらを使用する。
ホスト・ポート・DB名を、パスワードを表示せず確認する。

```sh
pnpm exec tsx -e 'const u = new URL(process.env.DATABASE_URL!); console.log({ host: u.hostname, port: u.port, database: u.pathname.slice(1) });'
pnpm prisma migrate status
pnpm prisma migrate deploy
pnpm prisma migrate status
```

`20261008030000_add_achievement_post_image` が適用済みで、保留・失敗した移行がないことを確認する。
`migrate deploy` は**この1件だけでなく未適用の全マイグレーションを実行する**。
未適用の既存移行があれば内容を確認してから実行し、今回のカラム追加だけと決めつけない。
CI・Vercelの設定だけで自動適用されるとは扱わない。
本番では `migrate dev`・seed・`make setup`・`make test-db` を実行しない。

今回のSQLはnullableな `image_url TEXT` の追加。既存投稿はNULLとなり、画像の取得は行わない。
旧アプリと併用できる追加変更なので、**新アプリの起動前**に適用する。
ローカルComposeのPostgreSQL16→17対応は別の作業であり、本番DBのバージョン変更は今回の手順に含めない。

## 4. アプリを反映して確認する

環境変数保存・DB移行・Prisma参照更新を済ませて、アプリ側PRをマージしProductionへデプロイする。
自動デプロイしない構成ならVercelから対象コミットのデプロイを開始する。
DeploymentsでReadyと対象コミットを確認する。ビルド失敗時はBuild Logs、実行時エラーはFunction Logsを確認する。

1. 対象URLの `/api/v1/achievement_post` が200で、投稿に `image_url` が含まれることを確認する。
2. 管理者ログイン後、新規フォームで公開済みゲームのURLを入力し「Steamから取得」を1回押す。タイトル・画像と、条件を満たす場合のコンプ日候補を確認する。
3. 所要時間を手入力し、タイトルを修正してから再取得する。修正したタイトルと所要時間が保持されることを確認する。
4. 投稿を保存し、成功表示・管理一覧・編集画面で保存値と画像を確認する。既存投稿の編集でも同様に確認する。新規保存は本番データを増やす操作なので、運用上許可された記事で行う。
5. ログアウト状態の補完APIが401、保存APIへのGETが405であることを確認する。

補完APIが503なら、新デプロイに `STEAM_WEB_API_KEY` と17桁の `STEAM_ID64` が反映されているかを確認する。
200でコンプ日だけ取れない場合は、非公開・実績未解除・日時欠落等の部分成功の可能性がある。
今回のコードはSteamの失敗理由を一般化するため、レスポンスだけでキー失効や公開設定を断定しない。
画像未取得・Steam障害でも手入力保存できることを確認する。

## 5. 既存投稿の画像を追加し、公開一覧を更新する

必要な場合だけ、手順3と同じ専用チェックアウト・シェルで実行する。
`DATABASE_URL` が対象DB、`STEAM_WEB_API_KEY` が取得用キーであることを確認する。
ホスティング側の環境変数を保存していても、この作業シェルでは別途読み込みが必要。
移行後のPrisma ClientはInstall時の生成を使用する。

```sh
pnpm exec tsx scripts/backfill-steam-images.ts
pnpm exec tsx scripts/backfill-steam-images.ts --apply
```

最初は取得確認のみ。取得結果を確認してから `--apply` で保存する。
確認と適用は各々Steam APIへ問い合わせる。50件ごとのGetItemsで画像未登録投稿だけを取得し、登録済み画像・本文・評価は上書きしない。
途中失敗後の再実行は未登録の投稿だけを対象とする。

画像登録後、Vercelで**Productionの最新リリースコミットを再ビルド・再デプロイ**する。
管理画面のDeployボタンを使う場合は、前述の `DEPLOY_WEBHOOK_URL` の対象を確認する。
保存スクリプトや管理画面の再読込だけでは静的な公開一覧は更新されない。
Readyを確認した後、公開一覧で画像と画像なし表示、記事リンクを確認する。
画像登録をしない場合も、最初のビルドが旧APIを参照したなら、新APIが返す画像を反映するには再ビルドが必要。

## 失敗時の切戻し

DB移行に失敗したら、新アプリを反映せず旧デプロイを維持する。
新デプロイに問題があれば、Vercelから動作確認済みの旧デプロイへ切り戻す。
追加したnullableカラムは残してよく、切戻しのためにDROPしたり適用済み移行を書き換えたりしない。
旧デプロイには新しい環境変数は反映されない。
本番リリースを再開する前に、DBの移行状態・環境変数・稼働APIとBuild Logsを再確認する。

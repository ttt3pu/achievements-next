export type ImageMigrationPhase = 'DB接続' | '投稿の読み取り' | 'Steam画像取得' | '画像の保存';

export function imageMigrationError(error: unknown, phase: ImageMigrationPhase): string {
  const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined;
  const advice = (() => {
    switch (code) {
      case 'P2022':
      case '42703':
        return '接続先DBに必要なカラムがありません。接続先が対象環境か確認し、pnpm prisma migrate statusで画像カラムの移行状態を確認してください。';
      case 'P2021':
      case '42P01':
        return '接続先DBに必要なテーブルがありません。接続先とマイグレーションの適用状態を確認してください。';
      case 'P1000':
      case '28P01':
        return 'DB認証に失敗しました。DATABASE_URLの認証情報を確認してください。';
      case 'P1010':
      case '42501':
        return 'DBへのアクセス権が不足しています。接続ユーザーの権限を確認してください。';
      case 'P1001':
      case 'P1002':
      case 'ECONNREFUSED':
      case 'ENOTFOUND':
        return '接続先への通信に失敗しました。ホスト・ポート・ネットワークを確認してください。';
      default:
        return phase === 'Steam画像取得'
          ? 'Steam画像を取得できませんでした。キー設定とSteam APIの利用状況を確認してください。'
          : 'DBの接続先・移行状態・接続ユーザーの権限を確認してください。';
    }
  })();
  // エラー本文には接続文字列・APIキーが含まれ得るため表示しない。
  const safeCode =
    typeof code === 'string' && /^(P\d{4}|[A-Z0-9]{5}|ECONNREFUSED|ENOTFOUND)$/.test(code) ? `（${code}）` : '';
  return `${phase}に失敗しました${safeCode}。${advice}`;
}

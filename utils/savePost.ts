import type { PostEditSubmitPayload } from 'types/PostEditSubmitPayload';

export async function savePost(url: string, payload: PostEditSubmitPayload): Promise<void> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('通信に失敗しました。入力を保持しています。再度お試しください。');
  }
  if (!response.ok) {
    const message =
      {
        400: '入力内容を確認してください。',
        401: 'ログイン状態を確認してください。',
        404: '投稿が見つかりません。',
        409: 'このゲームの投稿は既に存在します。',
        413: '投稿内容が大きすぎます。本文を短くしてください。',
      }[response.status] ?? '保存できませんでした。入力を保持しています。再度お試しください。';
    throw new Error(message);
  }
}

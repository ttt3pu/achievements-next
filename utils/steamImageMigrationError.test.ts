import { describe, expect, it } from 'vitest';
import { imageMigrationError } from './steamImageMigrationError';
describe('画像同期のエラー案内', () => {
  it('カラム不足とDB認証失敗を識別して対処を案内すること', () => {
    expect(imageMigrationError({ code: 'P2022' }, '投稿の読み取り')).toContain('必要なカラムがありません');
    expect(imageMigrationError({ code: 'P1000' }, '画像の保存')).toContain('DB認証に失敗');
  });
  it('エラー本文や不正なコードに含まれる秘密値を表示しないこと', () => {
    const message = imageMigrationError(
      { code: 'secret-token', message: 'postgresql://user:password@example.com' },
      'Steam画像取得',
    );
    expect(message).toContain('Steam画像');
    expect(message).not.toMatch(/secret-token|password|example.com/);
  });
});

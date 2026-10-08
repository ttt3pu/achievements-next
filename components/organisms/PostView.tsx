import { format } from 'date-fns';
import { renderMarkdown } from 'utils/markdown';
import Rating from 'components/molecules/Rating';
import DetailItem from 'components/molecules/DetailItem';
import FormInput from 'components/atoms/FormInput';
import { useRef, useState } from 'react';
import SteamPostImport from 'components/molecules/SteamPostImport';
import type { SteamPostDetails } from 'utils/api/steamPost';
import { steamAppIdFromInput } from 'utils/steamAppId';
import SteamBanner from 'components/atoms/SteamBanner';
import FormCheckbox from 'components/atoms/FormCheckbox';
import FormTextarea from 'components/atoms/FormTextarea';
import { PostEditSubmitPayload } from 'types/PostEditSubmitPayload';

type Props = {
  post: {
    steam_id: string | number;
    title: string;
    image_url?: string | null;
    total_hours: string | number;
    rating: string | number;
    yarikomi_rating: string | number;
    difficulty_rating: string | number;
    is_idle_game: boolean;
    completed_at: Date;
    content: string;
    updated_at: Date;
  };
  editMode?: boolean;
  handleSubmit?: (payload: PostEditSubmitPayload) => void | Promise<void>;
};

export default function PostView({ post, editMode, handleSubmit }: Props) {
  const { updated_at } = post;

  const [steamId, setSteamId] = useState(String(post.steam_id));
  const [imageUrl, setImageUrl] = useState(post.image_url ?? null);
  const [title, setTitle] = useState(post.title);
  const [totalHours, setTotalHours] = useState(String(post.total_hours));
  const [rating, setRating] = useState(String(post.rating));
  const [yarikomiRating, setYarikomiRating] = useState(String(post.yarikomi_rating));
  const [difficultyRating, setDifficultyRating] = useState(String(post.difficulty_rating));
  const [isIdleGame, setIsIdleGame] = useState(post.is_idle_game);
  const [completedAt, setCompletedAt] = useState<Date | null>(post.steam_id ? post.completed_at : null);
  const [content, setContent] = useState(post.content);

  const [importing, setImporting] = useState(false);

  function importDetails(details: SteamPostDetails) {
    setTitle(details.title ?? '');
    setImageUrl(details.imageUrl);
    setCompletedAt(details.completedAt ? new Date(details.completedAt) : null);
  }

  const canSave = Boolean(steamAppIdFromInput(steamId) && title.trim() && completedAt && !importing);

  const contentHtml = renderMarkdown(content);

  const saving = useRef(false);
  const [isSaving, setIsSaving] = useState(false);

  async function submit() {
    if (saving.current || !handleSubmit || !canSave || !completedAt) return;
    const payload: PostEditSubmitPayload = {
      steam_id: steamAppIdFromInput(steamId) ?? 0,
      title,
      image_url: imageUrl,
      total_hours: Number(totalHours),
      rating: Number(rating),
      yarikomi_rating: Number(yarikomiRating),
      difficulty_rating: Number(difficultyRating),
      is_idle_game: isIdleGame,
      completed_at: completedAt,
      content,
    };
    saving.current = true;
    setIsSaving(true);
    try {
      const result = handleSubmit(payload);
      if (result) await result;
    } finally {
      saving.current = false;
      setIsSaving(false);
    }
  }

  return (
    <div>
      <div className="bg-bg-300">
        <div className="max-w-contents mx-auto px-5 py-8">
          <h1 className={editMode ? 'text-2xl break-words' : 'text-2xl'}>
            {editMode ? (post.steam_id ? '投稿の編集' : '新規投稿') : title}
          </h1>
        </div>
      </div>

      <div className="bg-bg-200">
        <div className="max-w-contents mx-auto px-5 py-12">
          {editMode ? (
            <section aria-labelledby="steam-info-heading" className="min-w-0 rounded border border-bg-500 p-4 sm:p-6">
              <h2 id="steam-info-heading" className="text-xl mb-4">
                ゲーム情報
              </h2>
              <SteamPostImport
                value={steamId}
                onChange={(value) => {
                  if (steamAppIdFromInput(value) !== steamAppIdFromInput(steamId)) {
                    setTitle('');
                    setImageUrl(null);
                    setCompletedAt(null);
                  }
                  setSteamId(value);
                }}
                onImported={importDetails}
                onLoadingChange={setImporting}
              />
              <div className="grid min-w-0 gap-5 sm:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
                <SteamBanner imageUrl={imageUrl} className="block w-full h-auto rounded object-contain" />
                <div className="min-w-0 space-y-4">
                  <label className="block">
                    <span className="block mb-1 text-sm">タイトル（Steamから取得）</span>
                    <output
                      aria-label="タイトル"
                      className="block w-full min-w-0 rounded bg-bg-300 px-3 py-2 break-words"
                    >
                      {title || '未取得'}
                    </output>
                  </label>
                  <div>
                    <p className="text-sm mb-1">すべおめした日（Steamの実績から取得）</p>
                    <p>{completedAt ? format(new Date(completedAt), 'yyyy-MM-dd') : '未取得'}</p>
                  </div>
                  <p className="text-sm">
                    コンプ日は現在の全実績の最終解除日です。実績追加前のコンプ日とは異なる場合があります。
                  </p>
                </div>
              </div>
            </section>
          ) : (
            <iframe
              src={`https://store.steampowered.com/widget/${steamId}/`}
              className="max-w-full w-[800px] h-48 mx-auto"
            ></iframe>
          )}
        </div>
      </div>

      <div className={`px-5 ${editMode ? 'pt-8' : 'pt-12'} pb-6 max-w-contents mx-auto`}>
        {editMode ? (
          <section aria-labelledby="post-details-heading">
            <h2 id="post-details-heading" className="text-xl mb-4">
              プレイ記録
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'かかった時間（時間）', value: totalHours, onChange: setTotalHours },
                { label: '総合評価', value: rating, onChange: setRating },
                { label: '実績集めの楽しさ', value: yarikomiRating, onChange: setYarikomiRating },
                { label: '難易度', value: difficultyRating, onChange: setDifficultyRating },
              ].map((field) => (
                <label key={field.label} className="block min-w-0">
                  <span className="block mb-2 text-sm">{field.label}</span>
                  <FormInput value={field.value} handleChange={field.onChange} className="block w-full min-w-0" />
                </label>
              ))}
            </div>
            <label className="flex items-center gap-3 mt-5">
              <FormCheckbox value={isIdleGame} handleChange={setIsIdleGame} />
              放置ゲー
            </label>
          </section>
        ) : (
          <>
            <div className="flex flex-wrap mb-3">
              <DetailItem title="すべおめした日" icon="calendar-check">
                {format(new Date(completedAt), 'yyyy-MM-dd')}
              </DetailItem>
              <DetailItem title="最終更新日" icon="calendar-edit">
                {format(new Date(updated_at), 'yyyy-MM-dd')}
              </DetailItem>
              <DetailItem title="かかった時間" icon="clock">
                {totalHours + ' h'}
              </DetailItem>
              {isIdleGame && (
                <DetailItem title="放置ゲー" icon="sand-clock">
                  ◯
                </DetailItem>
              )}
            </div>
            <Rating rating={rating} yarikomi_rating={yarikomiRating} difficulty_rating={difficultyRating} />
          </>
        )}
      </div>

      <div className="bg-bg-200">
        <div className="max-w-contents mx-auto">
          <div className="px-5 py-14">
            {editMode ? (
              <div>
                <FormTextarea className="w-full" value={content} handleChange={setContent} />
                <div className="text-center mt-7">
                  {!canSave && (
                    <p role="status" className="mb-3">
                      {importing
                        ? 'Steam情報を取得しています。'
                        : '保存にはSteamからタイトルとコンプ日を取得してください。'}
                    </p>
                  )}
                  <button
                    type="button"
                    disabled={isSaving || !canSave}
                    onClick={() => submit()}
                    className="w-32 rounded bg-yellow px-4 py-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? '保存中…' : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { format } from 'date-fns';
import MarkdownIt from 'markdown-it';
import Rating from 'components/molecules/Rating';
import { AchievementPost } from '@prisma/client';
import DetailItem from 'components/molecules/DetailItem';
import FormInput from 'components/atoms/FormInput';
import { useState } from 'react';
import FormCheckbox from 'components/atoms/FormCheckbox';
import FormDatePicker from 'components/atoms/FormDatepicker';
import FormTextarea from 'components/atoms/FormTextarea';
import Button from 'components/atoms/Button';
import { PostEditSubmitPayload } from 'types/PostEditSubmitPayload';

type Props = {
  post: {
    steam_id: string | number;
    title: string;
    total_hours: string | number;
    rating: string | number;
    yarikomi_rating: string | number;
    difficulty_rating: string | number;
    is_idle_game: boolean;
    completed_at: Date;
    content: string;
    updated_at: Date;
  };
  editMode?: Boolean;
  handleSubmit?: Function;
};

export default function PostView({ post, editMode, handleSubmit }: Props) {
  const { updated_at } = post;

  const [steamId, setSteamId] = useState(String(post.steam_id));
  const [title, setTitle] = useState(post.title);
  const [totalHours, setTotalHours] = useState(String(post.total_hours));
  const [rating, setRating] = useState(String(post.rating));
  const [yarikomiRating, setYarikomiRating] = useState(String(post.yarikomi_rating));
  const [difficultyRating, setDifficultyRating] = useState(String(post.difficulty_rating));
  const [isIdleGame, setIsIdleGame] = useState(post.is_idle_game);
  const [completedAt, setCompletedAt] = useState(post.completed_at);
  const [content, setContent] = useState(post.content);

  const contentHtml = new MarkdownIt({ breaks: true }).render(content);

  function submit() {
    const payload: PostEditSubmitPayload = {
      steam_id: Number(steamId),
      title,
      total_hours: Number(totalHours),
      rating: Number(rating),
      yarikomi_rating: Number(yarikomiRating),
      difficulty_rating: Number(difficultyRating),
      is_idle_game: isIdleGame,
      completed_at: completedAt,
      content,
    };
    handleSubmit(payload);
  }

  return (
    <div>
      <div className="bg-bg-300">
        <div className="max-w-contents mx-auto px-5 py-8">
          {editMode ? (
            <FormInput value={title} handleChange={setTitle} className="w-full" />
          ) : (
            <h1 className="text-2xl">{title}</h1>
          )}
        </div>
      </div>

      <div className="bg-bg-200">
        <div className="max-w-contents mx-auto px-5 py-12">
          {editMode && <FormInput value={steamId} handleChange={setSteamId} />}
          <iframe
            src={`https://store.steampowered.com/widget/${steamId}/`}
            className="max-w-full w-[800px] h-48 mx-auto"
          ></iframe>
        </div>
      </div>

      <div className="px-5 pt-12 pb-6 max-w-contents mx-auto">
        <div className="flex flex-wrap mb-3">
          <DetailItem title="すべおめした日" icon="calendar-check">
            {editMode ? (
              <FormDatePicker value={completedAt} handleChange={setCompletedAt} />
            ) : (
              format(new Date(completedAt), 'yyyy-MM-dd')
            )}
          </DetailItem>
          <DetailItem title="最終更新日" icon="calendar-edit">
            {format(new Date(updated_at), 'yyyy-MM-dd')}
          </DetailItem>
          <DetailItem title="かかった時間" icon="clock">
            {editMode ? <FormInput value={totalHours} handleChange={setTotalHours} /> : totalHours + ' h'}
          </DetailItem>
          {editMode ? (
            <DetailItem title="放置ゲー" icon="sand-clock">
              <FormCheckbox value={isIdleGame} handleChange={setIsIdleGame} />
            </DetailItem>
          ) : (
            isIdleGame && (
              <DetailItem title="放置ゲー" icon="sand-clock">
                ◯
              </DetailItem>
            )
          )}
        </div>
        {editMode ? (
          <div className="flex flex-wrap mb-3">
            <DetailItem title="総合評価">
              <FormInput value={rating} handleChange={setRating} />
            </DetailItem>
            <DetailItem title="実績集めの楽しさ">
              <FormInput value={yarikomiRating} handleChange={setYarikomiRating} />
            </DetailItem>
            <DetailItem title="難易度">
              <FormInput value={difficultyRating} handleChange={setDifficultyRating} />
            </DetailItem>
          </div>
        ) : (
          <Rating rating={rating} yarikomi_rating={yarikomiRating} difficulty_rating={difficultyRating} />
        )}
      </div>

      <div className="bg-bg-200">
        <div className="max-w-contents mx-auto">
          <div className="px-5 py-14">
            {editMode ? (
              <div>
                <FormTextarea className="w-full" value={content} handleChange={setContent} />
                <div className="text-center mt-7">
                  <Button color="yellow" onClick={() => submit()} className="w-32 justify-center">
                    Save
                  </Button>
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

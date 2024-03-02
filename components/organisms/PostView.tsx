import { format } from 'date-fns';
import MarkdownIt from 'markdown-it';
import Rating from 'components/molecules/Rating';
import { AchievementPost } from '@prisma/client';
import DetailItem from 'components/molecules/DetailItem';

type Props = {
  post: AchievementPost;
};

export default function PostView({ post }: Props) {
  const {
    title,
    content,
    steam_id,
    rating,
    yarikomi_rating,
    difficulty_rating,
    is_idle_game,
    total_hours,
    completed_at,
    updated_at,
  } = post;
  const contentHtml = new MarkdownIt({ breaks: true }).render(content);

  const detailTableItems = [{ heading: 'かかった時間', text: `${total_hours} 時間` }];

  if (is_idle_game) {
    detailTableItems.unshift({ heading: '放置ゲー', text: '○' });
  }

  return (
    <div>
      <div className="bg-bg-300">
        <div className="max-w-contents mx-auto px-5 py-8">
          <h1 className="text-2xl">{title}</h1>
        </div>
      </div>

      <div className="bg-bg-200">
        <div className="max-w-contents mx-auto px-5 py-12">
          <iframe
            src={`https://store.steampowered.com/widget/${steam_id}/`}
            className="max-w-full w-[800px] h-48 mx-auto"
          ></iframe>
        </div>
      </div>

      <div className="px-5 pt-12 pb-6 max-w-contents mx-auto">
        <div className="flex flex-wrap mb-3">
          <DetailItem title="すべおめした日" icon="calendar-check">
            {format(new Date(completed_at), 'yyyy-MM-dd')}
          </DetailItem>
          <DetailItem title="最終更新日" icon="calendar-edit">
            {format(new Date(updated_at), 'yyyy-MM-dd')}
          </DetailItem>
          <DetailItem title="かかった時間" icon="clock">
            {total_hours}
          </DetailItem>
        </div>

        <Rating rating={rating} yarikomi_rating={yarikomi_rating} difficulty_rating={difficulty_rating} />
      </div>

      <div className="bg-bg-200 ">
        <div className="max-w-contents mx-auto">
          <div className="px-5 py-14" dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </div>
      </div>
    </div>
  );
}

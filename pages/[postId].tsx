import { format } from 'date-fns';
import MarkdownIt from 'markdown-it';
import { GetStaticProps } from 'next';
import Box from '../components/atoms/Box';
import HeadingLv2 from '../components/atoms/HeadingLv2';
import DetailTable from '../components/molecules/DetailTable';
import Rating from '../components/molecules/Rating';
import { AchievementPost } from '@prisma/client';
import { fetchIsr } from 'utils/fetch';

export async function getStaticPaths() {
  const posts = await fetchIsr<AchievementPost[]>('/api/v1/achievement_post');
  const paths = posts.map((post) => {
    return {
      params: {
        postId: String(post.id),
      },
    };
  });

  return {
    paths,
    fallback: 'blocking',
  };
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const post = await fetchIsr<AchievementPost>(`/api/v1/achievement_post/${params.postId}`);

  return {
    props: {
      post,
    },
  };
};

type Props = {
  post: AchievementPost;
};

export default function PostId({ post }: Props) {
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
  } = post;

  const contentHtml = new MarkdownIt({ breaks: true }).render(content);

  const detailTableItems = [
    { heading: '実績コンプした日', text: format(new Date(completed_at), 'yyyy 年 MM 月 dd 日') },
    { heading: 'かかった時間', text: `${total_hours} 時間` },
  ];

  if (is_idle_game) {
    detailTableItems.unshift({ heading: '放置ゲー', text: '○' });
  }

  return (
    <div>
      <div className="max-w-contents mx-auto">
        <div className="px-5 py-14">
          <h1>{title}</h1>

          <div className="flex">
            <Box>
              <iframe
                src={`https://store.steampowered.com/widget/${steam_id}/`}
                frameBorder="0"
                width="646"
                height="190"
              ></iframe>
            </Box>
            <Box>
              <DetailTable items={detailTableItems} />
            </Box>
          </div>

          <HeadingLv2>評価</HeadingLv2>
          <Rating rating={rating} yarikomi_rating={yarikomi_rating} difficulty_rating={difficulty_rating} />
        </div>
      </div>

      <div className="bg-bg-200 ">
        <div className="max-w-contents mx-auto">
          <div className="px-5 py-14" dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </div>
      </div>
    </div>
  );
}

import { format } from 'date-fns';
import MarkdownIt from 'markdown-it';
import { createClient } from 'microcms-js-sdk';
import { GetStaticProps } from 'next';
import Box from '../components/atoms/Box';
import HeadingLv2 from '../components/atoms/HeadingLv2';
import DetailTable from '../components/molecules/DetailTable';
import Rating from '../components/molecules/Rating';
import { Post } from '../types';
import getPostsAll from '../utils/getPostsAll';

export async function getStaticPaths() {
  const posts = await getPostsAll();

  return {
    paths: posts.contents.map((post) => ({ params: { postId: post.id } })),
    fallback: 'blocking',
  };
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const post = await createClient({
    serviceDomain: 'attt',
    apiKey: process.env.MICROCMS_API_KEY as string,
  })
    .get<Post>({
      endpoint: 'subeome',
      contentId: params.postId as string,
    })
    .then((res) => res);

  return {
    props: {
      post,
    },
  };
};

type Props = {
  post: Post;
};

export default function PostId({ post }: Props) {
  const { title, content, steamId, rating, yarikomiRating, subeomeDifficulty, idleGame, totalHours, subeomeDate } =
    post;

  const contentHtml = new MarkdownIt({ breaks: true }).render(content);

  const detailTableItems = [
    { heading: '実績コンプした日', text: format(new Date(subeomeDate), 'yyyy 年 MM 月 dd 日') },
    { heading: 'かかった時間', text: `${totalHours} 時間` },
  ];

  if (idleGame) {
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
                src={`https://store.steampowered.com/widget/${steamId}/`}
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
          <Rating rating={rating} yarikomiRating={yarikomiRating} subeomeDifficulty={subeomeDifficulty} />
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

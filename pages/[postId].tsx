import { format } from 'date-fns';
import MarkdownIt from 'markdown-it';
import { createClient } from 'microcms-js-sdk';
import { GetStaticProps } from 'next';
import Box from '../components/atoms/Box';
import HeadingLv2 from '../components/atoms/HeadingLv2';
import SteamBanner from '../components/atoms/SteamBanner';
import DetailTable from '../components/molecules/DetailTable';
import Rating from '../components/molecules/Rating';
import { Post } from '../types';
import getPostsAll from '../utils/getPostsAll';
import styles from './[postId].module.scss';

export async function getStaticPaths() {
  const posts = await getPostsAll();

  return {
    paths: posts.contents.map((post) => ({ params: {postId: post.id} })),
    fallback: true,
  };
}

export const getStaticProps: GetStaticProps = async({params}) => {
  const post = await createClient({
    serviceDomain: 'attt',
    apiKey: process.env.MICROCMS_API_KEY as string,
  }).get<Post>({
    endpoint: 'subeome',
    contentId: params.postId as string,
  }).then((res) => res);

  return {
    props: {
      post,
    },
  };
};

type Props = {
  post: Post;
}

export default function PostId({ post }: Props) {
  const {title, content, steamId, rating, yarikomiRating, subeomeDifficulty, idleGame, totalHours, subeomeDate} = post;

  const contentHtml = new MarkdownIt({breaks: true}).render(content);

  const detailTableItems = [
    {heading: '実績コンプした日', text: format(new Date(subeomeDate), 'yyyy 年 MM 月 dd 日')},
    {heading: 'かかった時間', text: `${totalHours} 時間`},
  ];

  if (idleGame) {
    detailTableItems.unshift({heading: '放置ゲー', text: '○'});
  }

  return (
    <div className={styles.wrapper}>
      <h1>{title}</h1>

      {idleGame}

      <div className={styles.boxLayout}>
        <Box>
          <SteamBanner steamId={steamId} />
        </Box>
        <Box>
          <DetailTable items={detailTableItems}/>
        </Box>

        <Box>
          <HeadingLv2>評価</HeadingLv2>
          <Rating rating={rating} yarikomiRating={yarikomiRating} subeomeDifficulty={subeomeDifficulty} />
        </Box>
      </div>

      <div className={styles.content} dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </div>
  );
}

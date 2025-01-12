import { GetStaticPaths, GetStaticProps } from 'next';
import { AchievementPost } from '@prisma/client';
import { fetchSsr } from 'utils/fetch';
import PostView from 'components/organisms/PostView';

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await fetchSsr<AchievementPost[]>('/api/v1/achievement_post');

  const postIds = posts.map((post) => {
    return {
      params: {
        postId: post.id.toString(),
      },
    };
  });

  return {
    paths: postIds,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const post = await fetchSsr<AchievementPost>(`/api/v1/achievement_post/${params.postId}`);

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
  return <PostView post={post} />;
}

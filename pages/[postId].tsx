import { GetServerSideProps } from 'next';
import { AchievementPost } from '@prisma/client';
import { fetchIsr } from 'utils/fetch';
import PostView from 'components/organisms/PostView';

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
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
  return <PostView post={post} />;
}

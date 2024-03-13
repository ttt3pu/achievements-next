import { GetStaticProps } from 'next';
import { AchievementPost } from '@prisma/client';
import { fetchIsr } from 'utils/fetch';
import PostView from 'components/organisms/PostView';
import { PostEditSubmitPayload } from 'types/PostEditSubmitPayload';
import { toast } from 'react-toastify';

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
  async function submit(payload: PostEditSubmitPayload) {
    await fetch(`/api/v1/achievement_post/${post.id}/edit?${new URLSearchParams(payload as any).toString()}`);
    toast.success('Saved!');
  }

  return <PostView post={post} editMode={true} handleSubmit={submit} />;
}

import { GetServerSideProps } from 'next';
import { AchievementPost } from '@prisma/client';
import { fetchIsr } from 'utils/fetch';
import PostView from 'components/organisms/PostView';
import { PostEditSubmitPayload } from 'types/PostEditSubmitPayload';
import { toast } from 'react-toastify';
import Button from 'components/atoms/Button';
import router from 'next/router';

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
  async function submit(payload: PostEditSubmitPayload) {
    // FIXME
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await fetch(`/api/v1/achievement_post/${post.id}/edit?${new URLSearchParams(payload as any).toString()}`);
    toast.success('Saved!');
  }

  async function onClickedDelete() {
    if (window.confirm('削除して良いですか？')) {
      await fetch(`/api/v1/achievement_post/${post.id}/delete`);
      toast.success('Deleted!');
      router.push('/admin');
    }
  }

  return (
    <>
      <PostView post={post} editMode={true} handleSubmit={submit} />
      <div className="bg-bg-200">
        <div className="max-w-contents mx-auto text-right">
          <div className="px-5 pb-8">
            <Button color="red" onClick={onClickedDelete}>
              Delete
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

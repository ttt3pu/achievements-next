import { savePost } from 'utils/savePost';
import PostView from 'components/organisms/PostView';
import { PostEditSubmitPayload } from 'types/PostEditSubmitPayload';
import { toast } from 'react-toastify';
import router from 'next/router';

export default function NewPost() {
  async function submit(payload: PostEditSubmitPayload) {
    try {
      await savePost(`/api/v1/achievement_post/new`, payload);
      toast.success('Saved!');
      await router.push('/admin');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '保存できませんでした。');
    }
  }

  const post = {
    steam_id: '',
    title: '',
    total_hours: '',
    rating: '',
    yarikomi_rating: '',
    difficulty_rating: '',
    is_idle_game: false,
    completed_at: new Date(),
    content: '',
    updated_at: new Date(),
  };

  return <PostView post={post} editMode={true} handleSubmit={submit} />;
}

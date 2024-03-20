import PostView from 'components/organisms/PostView';
import { PostEditSubmitPayload } from 'types/PostEditSubmitPayload';
import { toast } from 'react-toastify';
import router from 'next/router';

export default function NewPost() {
  async function submit(payload: PostEditSubmitPayload) {
    await fetch(`/api/v1/achievement_post/new?${new URLSearchParams(payload as any).toString()}`);
    toast.success('Saved!');
    router.push('/admin');
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

import Link from 'next/link';
import { useEffect, useState } from 'react';
import SteamBanner from 'components/atoms/SteamBanner';
import { AchievementPost } from '@prisma/client';
import { RxSpaceBetweenVertically } from 'react-icons/rx';
import Button from 'components/atoms/Button';
import { fetchSpa } from 'utils/fetch';

export default function Home() {
  const [posts, setPosts] = useState<AchievementPost[]>([]);
  const [orderingId, setOrderId] = useState<number | undefined>(undefined);

  async function getPosts() {
    const postsRes = await fetchSpa<AchievementPost[]>('/api/v1/achievement_post');
    setPosts(postsRes);
  }

  useEffect(() => {
    getPosts();
  }, []);

  function changeOrderId(orderingId: number | undefined) {
    setOrderId(orderingId);
  }

  async function onClickedBetweenConfirmSortButton(newSortOrder: number) {
    await fetch(`/api/v1/achievement_post/${orderingId}/change_order?new_sort_order=${newSortOrder}`);
    changeOrderId(undefined);
    await getPosts();
  }

  return (
    <div className="px-5 pb-5">
      <div className="max-w-contents mx-auto pt-5 border-t border-t-bg">
        <div className="sticky right-0 top-4 flex justify-end z-10">
          {orderingId && (
            <Button className="absolute" onClick={() => changeOrderId(undefined)}>
              Cancel
            </Button>
          )}
        </div>
        <Button icon="pencil" to="/admin/new" className="mb-6">
          New
        </Button>
        {posts.map((post, i) => {
          return (
            <div key={i} className="relative">
              <div className="flex h-12 mb-4">
                <button
                  onClick={() => changeOrderId(post.id)}
                  className="bg-bg-300 flex items-center justify-center px-4 w-12"
                >
                  {i + 1}
                </button>
                <Link href={`/admin/${post.id}/edit`} legacyBehavior>
                  <a className="flex flex-grow">
                    <SteamBanner steamId={post.steam_id} className="h-full w-auto" />
                    <div className="flex-grow bg-bg-300 flex">
                      <div className="text-gray-300 text-sm px-4">
                        <p>sort_order: {post.sort_order}</p>
                        <p>updated_at: {post.updated_at.toString()}</p>
                      </div>
                      <p className="px-4">{post.title}</p>
                    </div>
                  </a>
                </Link>
              </div>

              {orderingId && (
                <button
                  className="w-full absolute top-full py-1"
                  onClick={() => onClickedBetweenConfirmSortButton(post.sort_order + 1)}
                >
                  <span className="flex justify-center bg-bg-500">
                    <RxSpaceBetweenVertically className="h-2" />
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

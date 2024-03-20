import Link from 'next/link';
import { createRef, useCallback, useEffect, useRef, useState } from 'react';
import { GoTriangleDown } from 'react-icons/go';
import VanillaTilt from 'vanilla-tilt';
import SteamBanner from '../components/atoms/SteamBanner';
import styles from './index.module.scss';
import { AchievementPost } from '@prisma/client';
import { fetchSpa } from 'utils/fetch';
import { format } from 'date-fns';
import RatingStar from 'components/molecules/RatingStar';

export default function Home() {
  const postRefs = useRef([]);
  const [posts, setPosts] = useState<AchievementPost[]>([]);

  posts.forEach((_, i) => {
    postRefs.current[i] = createRef();
  });

  const [sortingKey, setSortingKey] = useState('sort_order');
  const [sortingDirection, setSortingDirection] = useState<'asc' | 'desc'>('asc');

  const getPosts = useCallback(async () => {
    const postsRes = await fetchSpa<AchievementPost[]>(
      `/api/v1/achievement_post?sort_direction=${sortingDirection}&sort_key=${sortingKey}`,
    );
    setPosts(postsRes);
  }, [sortingKey, sortingDirection]);

  useEffect(() => {
    getPosts();
  }, [getPosts]);

  useEffect(() => {
    postRefs.current.forEach((ref) => {
      VanillaTilt.init(ref.current, {
        glare: true,
        speed: 1000,
        scale: 1.2,
      });
    });
  });

  const sortMenuItems = [
    { text: '頑張った度', key: 'sort_order' },
    { text: 'かかった時間', key: 'total_hours' },
    { text: '総合評価', key: 'rating' },
    { text: '実績集めの楽しさ', key: 'yarikomi_rating' },
    { text: '難易度', key: 'difficulty_rating' },
    { text: '達成日', key: 'completed_at' },
  ];

  function onClickedSortButton(key: string) {
    if (sortingKey === key) {
      setSortingDirection(sortingDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortingKey(key);
      setSortingDirection('asc');
    }
  }

  const postText = (post: AchievementPost, i: number) => {
    switch (sortingKey) {
      case 'sort_order':
        return sortingDirection === 'asc' ? i + 1 : posts.length - i;
      case 'total_hours':
        return post.total_hours + ' h';
      case 'rating':
        return <RatingStar className="justify-center py-1.5" rating={post.rating} />;
      case 'yarikomi_rating':
        return <RatingStar className="justify-center py-1.5" rating={post.yarikomi_rating} />;
      case 'difficulty_rating':
        return <RatingStar className="justify-center py-1.5" rating={post.difficulty_rating} />;
      case 'completed_at':
        return format(post.completed_at, 'yyyy-MM-dd');
    }
  };

  return (
    <div className="px-5 pb-5 overflow-hidden">
      <div className="max-w-contents mx-auto mt-0 mb-5 p-2 flex flex-wrap bg-bg-200 rounded">
        {sortMenuItems.map((item, i) => {
          const isSelected = sortingKey === item.key;
          return (
            <div key={i} className="relative">
              {isSelected && (
                <GoTriangleDown
                  className={`pointer-events-none absolute top-[1px] bottom-0 left-[16px] m-auto z-10 transition-all fill-yellow ${
                    sortingDirection === 'desc' ? '-rotate-180 ' : ''
                  }`}
                />
              )}
              <button
                onClick={() => onClickedSortButton(item.key)}
                className={`rounded cursor-pointer relative overflow-hidden border-0 px-5 py-1 transition-all ${
                  isSelected ? 'shadow bg-bg font-medium text-white pl-10' : 'bg-transparent text-bg'
                }`}
              >
                {item.text}
              </button>
            </div>
          );
        })}
      </div>

      <div className="max-w-contents mx-auto mt-5 mb-0 pt-5 border-t border-t-bg grid grid-cols-6 gap-5 max-md:grid-cols-2">
        {posts.map((post, i) => {
          return (
            <Link key={i} href={`/${post.id}`} legacyBehavior>
              <a
                className={`${styles.gridItem} mx-auto shadow bg-bg-200 rounded flex flex-col cursor-pointer text-white text-center font-medium overflow-hidden max-md:col-span-2 hover:z-10`}
                ref={postRefs.current[i]}
              >
                <SteamBanner steamId={post.steam_id} className="w-full h-full object-cover" />
                <p className="p-1 bg-bg-300">{postText(post, i)}</p>
              </a>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

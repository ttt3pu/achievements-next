import { GetStaticProps } from 'next';
import Link from 'next/link';
import { createRef, useEffect, useRef, useState } from 'react';
import { GoTriangleDown } from 'react-icons/go';
import VanillaTilt from 'vanilla-tilt';
import SteamBanner from '../components/atoms/SteamBanner';
import styles from './index.module.scss';
import { AchievementPost } from '@prisma/client';
import { fetchIsr } from 'utils/fetch';

export const getStaticProps: GetStaticProps = async () => {
  const posts = await fetchIsr<AchievementPost[]>('/api/v1/achievement_post');

  return {
    props: {
      posts,
    },
  };
};

type Props = {
  posts: AchievementPost[];
};

export default function Home({ posts }: Props) {
  const postRefs = useRef([]);

  posts.forEach((_, i) => {
    postRefs.current[i] = createRef();
  });

  const [sortingKey, setSortingKey] = useState('default');
  const [sortingDirection, setSortingDirection] = useState<'asc' | 'desc'>('asc');

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
    { text: '頑張った度', key: 'default' },
    { text: 'かかった時間', key: 'hours' },
    { text: '総合評価', key: 'rating' },
    { text: '実績集めの楽しさ', key: 'subeomeRating' },
    { text: '難易度', key: 'subeomeDifficulty' },
    { text: '達成日', key: 'subeomeDate' },
  ];

  function onClickedSortButton(key: string) {
    if (sortingKey === key) {
      setSortingDirection(sortingDirection === 'asc' ? 'desc' : 'asc');
      return;
    }

    setSortingKey(key);
    setSortingDirection('asc');
  }

  return (
    <div className="px-5 pb-5 overflow-hidden">
      <div className="max-w-contents mx-auto mt-0 mb-5 p-2 flex flex-wrap bg-bg-200 rou1nded">
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
                <p className="p-1 bg-bg-300">{i + 1}</p>
              </a>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

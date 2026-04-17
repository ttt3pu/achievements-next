import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { GoTriangleDown } from 'react-icons/go';
import { GiCrown, GiMedal } from 'react-icons/gi';
import SteamBanner from '../components/atoms/SteamBanner';
import styles from './index.module.css';
import { AchievementPost } from '@prisma/client';
import { fetchSsr } from 'utils/fetch';
import { format } from 'date-fns';
import RatingStar from 'components/molecules/RatingStar';
import StatsCharts from 'components/organisms/StatsCharts';
import { GetStaticProps } from 'next';
import { type SortDirection, type SortKey } from './api/v1/achievement_post/index';

export const getStaticProps: GetStaticProps = async () => {
  const posts = await fetchSsr<AchievementPost[]>('/api/v1/achievement_post');

  return {
    props: {
      posts,
    },
  };
};

export default function Home({ posts: propsPosts }: { posts: AchievementPost[] }) {
  const [posts] = useState<AchievementPost[]>(propsPosts);

  const [sortingKey, setSortingKey] = useState<SortKey>('sort_order');
  const [sortingDirection, setSortingDirection] = useState<SortDirection>('asc');

  function filteredPosts() {
    const result = [...posts];

    switch (sortingKey) {
      case 'sort_order':
        break;
      case 'total_hours':
        result.sort((a, b) => a.total_hours - b.total_hours);
        break;
      case 'rating':
        result.sort((a, b) => a.rating - b.rating);
        break;
      case 'yarikomi_rating':
        result.sort((a, b) => a.yarikomi_rating - b.yarikomi_rating);
        break;
      case 'difficulty_rating':
        result.sort((a, b) => a.difficulty_rating - b.difficulty_rating);
        break;
      case 'completed_at':
        result.sort((a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime());
        break;
    }

    if (sortingDirection === 'desc') {
      result.reverse();
    }

    return result;
  }

  type SortMenuItem = { text: string; key: SortKey; defaultDirection: SortDirection };
  const sortMenuItems: SortMenuItem[] = [
    { text: '頑張った度', key: 'sort_order', defaultDirection: 'asc' },
    { text: 'かかった時間', key: 'total_hours', defaultDirection: 'desc' },
    { text: '総合評価', key: 'rating', defaultDirection: 'desc' },
    { text: '実績集めの楽しさ', key: 'yarikomi_rating', defaultDirection: 'desc' },
    { text: '難易度', key: 'difficulty_rating', defaultDirection: 'desc' },
    { text: '達成日', key: 'completed_at', defaultDirection: 'desc' },
  ];

  function onClickedSortButton(key: SortKey) {
    if (sortingKey === key) {
      setSortingDirection(sortingDirection === 'asc' ? 'desc' : 'asc');
    } else {
      const item = sortMenuItems.find((i) => i.key === key);
      setSortingKey(key);
      setSortingDirection(item?.defaultDirection ?? 'asc');
    }
  }

  function sortValue(post: AchievementPost): ReactNode {
    switch (sortingKey) {
      case 'total_hours':
        return post.total_hours + ' h';
      case 'rating':
        return <RatingStar className="justify-center" rating={post.rating} />;
      case 'yarikomi_rating':
        return <RatingStar className="justify-center" rating={post.yarikomi_rating} />;
      case 'difficulty_rating':
        return <RatingStar className="justify-center" rating={post.difficulty_rating} />;
      case 'completed_at':
        return format(post.completed_at, 'yyyy-MM-dd');
      default:
        return null;
    }
  }

  return (
    <div className="flex gap-4 pb-12 px-4 max-lg:flex-col">
      {/* ゲームグリッド */}
      <div className="flex-1 min-w-0">
        <div className="mb-4 p-2 flex flex-wrap bg-bg-200 rounded">
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

        <div className="pt-4 border-t border-t-bg grid grid-cols-4 gap-2 max-md:grid-cols-3 max-sm:grid-cols-2">
          {filteredPosts().map((post, i) => {
            const value = sortValue(post);
            const position = i + 1;
            const rank = sortingKey === 'sort_order' && sortingDirection === 'desc' ? posts.length - i : position;

            return (
              <Link key={post.id} href={`/${post.id}`} legacyBehavior>
                <a
                  className={`${styles.gridItem} ${position <= 5 ? (styles[`rank${position}`] ?? '') : ''} cursor-pointer shadow rounded hover:z-10 text-white font-medium`}
                >
                  <SteamBanner steamId={post.steam_id} className="w-full h-full object-cover object-top" />
                  <div className={styles.footer}>
                    {sortingKey === 'sort_order' && (
                      <span className={styles.rank}>
                        {rank === 1 && <GiCrown className={styles.rankIcon} />}
                        {rank === 2 && <GiMedal className={styles.rankIcon} />}
                        {rank === 3 && <GiMedal className={styles.rankIcon} />}
                        {rank}
                      </span>
                    )}
                    {value != null && <span className={styles.info}>{value}</span>}
                  </div>
                </a>
              </Link>
            );
          })}
        </div>
      </div>

      {/* チャートサイドバー */}
      <aside className="w-96 shrink-0 max-lg:w-full">
        <div className="mb-3 text-xs font-medium text-bg-500 uppercase tracking-wider">統計</div>
        <StatsCharts posts={posts} compact />
      </aside>
    </div>
  );
}

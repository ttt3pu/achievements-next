import { GetStaticProps } from 'next';
import Link from 'next/link';
import { createRef, useEffect, useRef, useState } from 'react';
import VanillaTilt from 'vanilla-tilt';
import SteamBanner from '../components/atoms/SteamBanner';
import { Post } from '../types';
import getPostsAll from '../utils/getPostsAll';
import styles from './index.module.scss';

export const getStaticProps: GetStaticProps = async() => {
  const res = await getPostsAll();

  return {
    props: {
      posts: res.contents,
    },
  };
};

type Props = {
  posts: Post[];
}

export default function Home({ posts }: Props) {
  const postRefs = useRef([]);
  posts.forEach((_, i) => {
    postRefs.current[i] = createRef();
  });

  const [sortingKey, setSortingKey] = useState('default');

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
    {text: '頑張った度', key: 'default'},
    {text: 'かかった時間', key: 'hours'},
    {text: '総合評価', key: 'rating'},
    {text: '実績集めの楽しさ', key: 'subeomeRating'},
    {text: '難易度', key: 'subeomeDifficulty'},
    {text: '達成日', key: 'subeomeDate'},
  ];

  function onClickedSortButton(key: string) {
    setSortingKey(key);
  }

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.h1}>すべての実績を解除しました！おめでとう！</h1>

      <div className={styles.sortContainer}>
        {sortMenuItems.map((item, i) => {
          return (
            <div key={i} className={styles.sortItem}>
              <button
                onClick={() => onClickedSortButton(item.key)}
                data-is-selected={sortingKey === item.key}
                className={styles.sortButton}
              >{item.text}</button>
            </div>
          );
        })}
      </div>

      <div className={styles.itemContainer}>
        {posts.map((post, i) => {
          return (
            <Link key={i} href={`/${post.id}`}>
              <a
                className={styles.item}
                ref={postRefs.current[i]}
              >
                <SteamBanner
                  className={styles.itemBanner}
                  steamId={post.steamId}
                />
                <p>{i + 1}</p>
              </a>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

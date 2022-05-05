import { GetStaticProps } from 'next';
import Link from 'next/link';
import { createRef, useEffect, useRef } from 'react';
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

  useEffect(() => {
    postRefs.current.forEach((ref) => {
      VanillaTilt.init(ref.current, {
        glare: true,
        speed: 1000,
        scale: 1.2,
      });
    });
  });

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.h1}>すべての実績を解除しました！おめでとう！</h1>

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
              </a>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

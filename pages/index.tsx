import { createClient } from 'microcms-js-sdk';
import { GetStaticProps } from 'next';
import Image from 'next/image';
import { createRef, useEffect, useRef } from 'react';
import VanillaTilt from 'vanilla-tilt';
import { Post } from '../types';
import styles from './index.module.scss';

export const getStaticProps: GetStaticProps = async() => {
  const res = await createClient({
    serviceDomain: 'attt',
    apiKey: process.env.MICROCMS_API_KEY as string,
  }).getList<Post[]>({
    endpoint: 'subeome',
    queries: { limit: 50 },
  }).then((res) => res);

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
            <div
              className={styles.item}
              key={i}
              ref={postRefs.current[i]}
            >
              <Image
                className={styles.itemBanner}
                src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${post.steamId}/header.jpg`}
                width="460"
                height="215"
                alt=""
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { createClient } from 'microcms-js-sdk';
import { GetStaticProps } from 'next';
import Image from 'next/image';
import { Post } from '../types';
import styles from './index.module.scss';

export const getStaticProps: GetStaticProps = async() => {
  const res = await createClient({
    serviceDomain: 'attt',
    apiKey: process.env.MICROCMS_API_KEY as string,
  }).getList<Post[]>({ endpoint: 'subeome', queries: { limit: 50 } }).then((res) => res);

  return {
    props: {
      posts: res.contents,
    },
  };
};

export default function Home({ posts }: {posts: Post[]}) {
  return (
    <div>
      <h1 className={styles.h1}>すべての実績を解除しました！おめでとう！</h1>

      <div className={styles.itemContainer}>
        {posts.map((post, i) => {
          return (
            <div className={styles.item} key={i}>
              <div className={styles.itemInner}>
                <Image className={styles.itemBanner} src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${post.steamId}/header.jpg`} alt="" width="460" height="215" />
                <div>
                  <h2 className={styles.itemHeading}>
                    <span className="title">{ post.title }</span>
                  </h2>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

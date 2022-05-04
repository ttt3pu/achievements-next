import { createClient } from 'microcms-js-sdk';
import { GetStaticProps } from 'next';
import { Post } from '../types';
import getPostsAll from '../utils/getPostsAll';

export async function getStaticPaths() {
  const posts = await getPostsAll();

  return {
    paths: posts.contents.map((post) => ({ params: {postId: post.id} })),
    fallback: true,
  };
}

export const getStaticProps: GetStaticProps = async({params}) => {
  const post = await createClient({
    serviceDomain: 'attt',
    apiKey: process.env.MICROCMS_API_KEY as string,
  }).get<Post>({
    endpoint: 'subeome',
    contentId: params.postId as string,
  }).then((res) => res);

  return {
    props: {
      post,
    },
  };
};

type Props = {
  post: Post;
}

export default function PostId({ post }: Props) {
  return (
    <p>{post.title}</p>
  );
}

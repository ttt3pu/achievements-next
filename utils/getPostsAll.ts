import { createClient } from 'microcms-js-sdk';
import { Post } from '../types';

export default async function getPostsAll() {
  return await createClient({
    serviceDomain: 'attt',
    apiKey: process.env.MICROCMS_API_KEY as string,
  }).getList<Post[]>({
    endpoint: 'subeome',
    queries: { limit: 50 },
  }).then((res) => res);
}

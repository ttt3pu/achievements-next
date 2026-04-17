import { AchievementPost } from '@prisma/client';
import StatsCharts from 'components/organisms/StatsCharts';
import { GetStaticProps } from 'next';
import { fetchSsr } from 'utils/fetch';

export const getStaticProps: GetStaticProps = async () => {
  const posts = await fetchSsr<AchievementPost[]>('/api/v1/achievement_post');

  return {
    props: {
      posts,
    },
    revalidate: 3600,
  };
};

type Props = {
  posts: AchievementPost[];
};

export default function Stats({ posts }: Props) {
  return (
    <div className="px-5 pb-12">
      <div className="max-w-contents mx-auto">
        <h1 className="text-2xl font-medium mb-8">統計</h1>
        <p className="text-sm text-bg-500 mb-6">全 {posts.length} 本のクリアデータを集計しています。</p>
        <StatsCharts posts={posts} />
      </div>
    </div>
  );
}

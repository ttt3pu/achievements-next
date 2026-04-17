import { AchievementPost } from '@prisma/client';
import HoursChart from 'components/molecules/HoursChart';
import IdleGameChart from 'components/molecules/IdleGameChart';
import MonthlyChart from 'components/molecules/MonthlyChart';
import RatingChart from 'components/molecules/RatingChart';
import { ReactNode } from 'react';

type Props = {
  posts: AchievementPost[];
};

function ChartSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="bg-bg-200 rounded p-6">
      <h2 className="text-lg font-medium mb-4">{title}</h2>
      {children}
    </section>
  );
}

export default function StatsCharts({ posts }: Props) {
  return (
    <div className="grid gap-6">
      <ChartSection title="月別クリア数の推移">
        <MonthlyChart posts={posts} />
      </ChartSection>
      <ChartSection title="評価分布">
        <RatingChart posts={posts} />
      </ChartSection>
      <ChartSection title="プレイ時間の分布">
        <HoursChart posts={posts} />
      </ChartSection>
      <ChartSection title="放置ゲーム比率">
        <IdleGameChart posts={posts} />
      </ChartSection>
    </div>
  );
}

import { AchievementPost } from '@prisma/client';
import HoursChart from 'components/molecules/HoursChart';
import IdleGameChart from 'components/molecules/IdleGameChart';
import MonthlyChart from 'components/molecules/MonthlyChart';
import RatingChart from 'components/molecules/RatingChart';
import { ReactNode } from 'react';

type Props = {
  posts: AchievementPost[];
  compact?: boolean;
};

function ChartSection({ title, children, compact }: { title: string; children: ReactNode; compact?: boolean }) {
  return (
    <section className={`bg-bg-200 rounded ${compact ? 'p-3' : 'p-6'}`}>
      <h2 className={`font-medium ${compact ? 'text-sm mb-2' : 'text-lg mb-4'}`}>{title}</h2>
      {children}
    </section>
  );
}

export default function StatsCharts({ posts, compact = false }: Props) {
  const chartHeight = compact ? 220 : 300;

  return (
    <div className={`grid ${compact ? 'gap-3' : 'gap-6'}`}>
      <ChartSection title="月別クリア数" compact={compact}>
        <MonthlyChart posts={posts} height={chartHeight} />
      </ChartSection>
      <ChartSection title="評価分布" compact={compact}>
        <RatingChart posts={posts} height={chartHeight} />
      </ChartSection>
      <ChartSection title="プレイ時間" compact={compact}>
        <HoursChart posts={posts} height={chartHeight} />
      </ChartSection>
      <ChartSection title="放置ゲー比率" compact={compact}>
        <IdleGameChart posts={posts} height={chartHeight} />
      </ChartSection>
    </div>
  );
}

import { AchievementPost } from '@prisma/client';
import HoursChart from 'components/molecules/HoursChart';
import IdleGameChart from 'components/molecules/IdleGameChart';
import MonthlyChart from 'components/molecules/MonthlyChart';
import MonthlyHoursChart from 'components/molecules/MonthlyHoursChart';
import RatingChart from 'components/molecules/RatingChart';
import YearlyHoursChart from 'components/molecules/YearlyHoursChart';
import { ReactNode } from 'react';

type Props = {
  posts: AchievementPost[];
  compact?: boolean;
};

function ChartSection({
  title,
  subTitle,
  children,
  compact,
}: {
  title: string;
  subTitle?: ReactNode;
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <section className={`bg-bg-200 rounded ${compact ? 'p-3' : 'p-6'}`}>
      <div className={`flex items-baseline justify-between ${compact ? 'mb-2' : 'mb-4'}`}>
        <h2 className={`font-medium ${compact ? 'text-sm' : 'text-lg'}`}>{title}</h2>
        {subTitle && <span className={`text-bg-500 font-normal ${compact ? 'text-xs' : 'text-sm'}`}>{subTitle}</span>}
      </div>
      {children}
    </section>
  );
}

export default function StatsCharts({ posts, compact = false }: Props) {
  const chartHeight = compact ? 220 : 300;
  const totalHours = posts.reduce((sum, post) => sum + post.total_hours, 0);

  return (
    <div className={`grid ${compact ? 'gap-3' : 'gap-6'}`}>
      <ChartSection title="月別クリア数" compact={compact}>
        <MonthlyChart posts={posts} height={chartHeight} />
      </ChartSection>
      <ChartSection title="年別プレイ時間" compact={compact}>
        <YearlyHoursChart posts={posts} height={chartHeight} />
      </ChartSection>
      <ChartSection title="月別プレイ時間" compact={compact}>
        <MonthlyHoursChart posts={posts} height={chartHeight} />
      </ChartSection>
      <ChartSection title="評価分布" compact={compact}>
        <RatingChart posts={posts} height={chartHeight} />
      </ChartSection>
      <ChartSection title="プレイ時間" subTitle={`合計: ${totalHours.toLocaleString()} 時間`} compact={compact}>
        <HoursChart posts={posts} height={chartHeight} />
      </ChartSection>
      <ChartSection title="放置ゲー比率" compact={compact}>
        <IdleGameChart posts={posts} height={chartHeight} />
      </ChartSection>
    </div>
  );
}

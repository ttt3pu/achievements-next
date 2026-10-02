import { AchievementPost } from '@prisma/client';
import FormCheckbox from 'components/atoms/FormCheckbox';
import HoursChart from 'components/molecules/HoursChart';
import IdleGameChart from 'components/molecules/IdleGameChart';
import MonthlyChart from 'components/molecules/MonthlyChart';
import MonthlyHoursChart from 'components/molecules/MonthlyHoursChart';
import RatingChart from 'components/molecules/RatingChart';
import YearlyHoursChart from 'components/molecules/YearlyHoursChart';
import { type ReactNode, useMemo, useState } from 'react';

type Props = {
  posts: AchievementPost[];
  compact?: boolean;
};

function ChartSection({
  title,
  action,
  children,
  compact,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <section className={`bg-bg-200 rounded ${compact ? 'p-3' : 'p-6'}`}>
      <div className={`flex items-center justify-between ${compact ? 'mb-2' : 'mb-4'}`}>
        <h2 className={`font-medium ${compact ? 'text-sm' : 'text-lg'}`}>{title}</h2>
        {action && <div>{action}</div>}
      </div>
      {children}
    </section>
  );
}

export default function StatsCharts({ posts, compact = false }: Props) {
  const [includeIdleYearly, setIncludeIdleYearly] = useState(false);
  const [includeIdleMonthly, setIncludeIdleMonthly] = useState(false);

  const chartHeight = compact ? 220 : 300;
  const totalHours = posts.reduce((sum, post) => sum + post.total_hours, 0);

  const yearlyPosts = useMemo(
    () => (includeIdleYearly ? posts : posts.filter((p) => !p.is_idle_game)),
    [posts, includeIdleYearly],
  );
  const monthlyPosts = useMemo(
    () => (includeIdleMonthly ? posts : posts.filter((p) => !p.is_idle_game)),
    [posts, includeIdleMonthly],
  );

  return (
    <div className={`grid ${compact ? 'gap-3' : 'gap-6'}`}>
      <section className={`bg-bg-200 rounded ${compact ? 'p-3' : 'p-6'}`}>
        <h2 className={`font-medium text-bg-500 ${compact ? 'text-xs mb-1' : 'text-sm mb-2'}`}>総プレイ時間</h2>
        <div className={`font-semibold ${compact ? 'text-xl' : 'text-3xl'}`}>
          {totalHours.toLocaleString()} <span className="text-sm font-normal text-bg-500">時間</span>
        </div>
      </section>
      <ChartSection title="月別クリア数" compact={compact}>
        <MonthlyChart posts={posts} height={chartHeight} />
      </ChartSection>
      <ChartSection
        title="年別プレイ時間"
        action={
          <label className="flex items-center gap-1.5 cursor-pointer select-none text-bg-500 hover:text-white text-xs">
            <FormCheckbox value={includeIdleYearly} handleChange={setIncludeIdleYearly} />
            放置ゲーを含む
          </label>
        }
        compact={compact}
      >
        <YearlyHoursChart posts={yearlyPosts} height={chartHeight} />
      </ChartSection>
      <ChartSection
        title="月別プレイ時間"
        action={
          <label className="flex items-center gap-1.5 cursor-pointer select-none text-bg-500 hover:text-white text-xs">
            <FormCheckbox value={includeIdleMonthly} handleChange={setIncludeIdleMonthly} />
            放置ゲーを含む
          </label>
        }
        compact={compact}
      >
        <MonthlyHoursChart posts={monthlyPosts} height={chartHeight} />
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

import { AchievementPost } from '@prisma/client';
import { format } from 'date-fns';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type Props = {
  posts: AchievementPost[];
  height?: number;
};

export default function YearlyHoursChart({ posts, height = 300 }: Props) {
  const hoursByYear: Record<string, number> = {};

  posts.forEach((post) => {
    const year = format(new Date(post.completed_at), 'yyyy');
    hoursByYear[year] = (hoursByYear[year] ?? 0) + post.total_hours;
  });

  const data = Object.entries(hoursByYear)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([year, hours]) => ({ year, hours }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#3f3c56" />
        <XAxis dataKey="year" tick={{ fill: '#eee', fontSize: 12 }} />
        <YAxis tick={{ fill: '#eee' }} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: '#202940', border: '1px solid #3f3c56', color: '#eee' }}
          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
          formatter={(value) => [`${Number(value ?? 0).toLocaleString()} 時間`, 'プレイ時間']}
        />
        <Bar dataKey="hours" name="プレイ時間" fill="#f87841" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

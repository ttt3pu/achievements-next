import { AchievementPost } from '@prisma/client';
import { format } from 'date-fns';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type Props = {
  posts: AchievementPost[];
  height?: number;
};

export default function MonthlyChart({ posts, height = 300 }: Props) {
  const countsByMonth: Record<string, number> = {};

  posts.forEach((post) => {
    const key = format(new Date(post.completed_at), 'yyyy-MM');
    countsByMonth[key] = (countsByMonth[key] ?? 0) + 1;
  });

  const data = Object.entries(countsByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 48 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#3f3c56" />
        <XAxis dataKey="month" tick={{ fill: '#eee', fontSize: 11 }} angle={-45} textAnchor="end" interval={0} />
        <YAxis tick={{ fill: '#eee' }} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: '#202940', border: '1px solid #3f3c56', color: '#eee' }}
          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
        />
        <Bar dataKey="count" name="クリア数" fill="#6956dc" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

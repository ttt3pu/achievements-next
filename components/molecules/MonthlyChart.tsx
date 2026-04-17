import { AchievementPost } from '@prisma/client';
import { format } from 'date-fns';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type Props = {
  posts: AchievementPost[];
  height?: number;
};

export default function MonthlyChart({ posts, height = 300 }: Props) {
  const countsByMonth: Record<string, { label: string; count: number }> = {};

  posts.forEach((post) => {
    const d = new Date(post.completed_at);
    const key = format(d, 'yyyy-MM');
    const label = format(d, 'yy/M');
    if (!countsByMonth[key]) {
      countsByMonth[key] = { label, count: 0 };
    }
    countsByMonth[key].count++;
  });

  const data = Object.entries(countsByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, { label, count }]) => ({ month, label, count }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#3f3c56" />
        <XAxis
          dataKey="label"
          tick={{ fill: '#eee', fontSize: 10 }}
          angle={-60}
          textAnchor="end"
          interval="preserveStartEnd"
        />
        <YAxis tick={{ fill: '#eee' }} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: '#202940', border: '1px solid #3f3c56', color: '#eee' }}
          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
          labelFormatter={(label) => {
            const entry = data.find((d) => d.label === label);
            return entry ? entry.month : label;
          }}
        />
        <Bar dataKey="count" name="クリア数" fill="#6956dc" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

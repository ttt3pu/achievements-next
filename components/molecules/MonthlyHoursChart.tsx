import { AchievementPost } from '@prisma/client';
import { format } from 'date-fns';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type Props = {
  posts: AchievementPost[];
  height?: number;
};

export default function MonthlyHoursChart({ posts, height = 300 }: Props) {
  const hoursByMonth: Record<string, { label: string; hours: number }> = {};

  posts.forEach((post) => {
    const d = new Date(post.completed_at);
    const key = format(d, 'yyyy-MM');
    const label = format(d, 'yy/M');
    if (!hoursByMonth[key]) {
      hoursByMonth[key] = { label, hours: 0 };
    }
    hoursByMonth[key].hours += post.total_hours;
  });

  const data = Object.entries(hoursByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, { label, hours }]) => ({ month, label, hours }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 40 }}>
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
          formatter={(value) => [`${Number(value ?? 0).toLocaleString()} 時間`, 'プレイ時間']}
        />
        <Bar dataKey="hours" name="プレイ時間" fill="#f87841" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

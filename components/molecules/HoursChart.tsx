import { AchievementPost } from '@prisma/client';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type Props = {
  posts: AchievementPost[];
  height?: number;
};

const BINS = [
  { label: '〜10h', min: 0, max: 10 },
  { label: '10〜50h', min: 10, max: 50 },
  { label: '50〜100h', min: 50, max: 100 },
  { label: '100h〜', min: 100, max: Infinity },
];

export default function HoursChart({ posts, height = 300 }: Props) {
  const counts = BINS.map((bin) => ({
    label: bin.label,
    count: posts.filter((p) => p.total_hours >= bin.min && p.total_hours < bin.max).length,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={counts} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#3f3c56" />
        <XAxis dataKey="label" tick={{ fill: '#eee' }} />
        <YAxis tick={{ fill: '#eee' }} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: '#202940', border: '1px solid #3f3c56', color: '#eee' }}
          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
        />
        <Bar dataKey="count" name="本数" fill="#f87841" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

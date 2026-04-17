import { AchievementPost } from '@prisma/client';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

type Props = {
  posts: AchievementPost[];
};

const COLORS = ['#6956dc', '#3f3c56'];

export default function IdleGameChart({ posts }: Props) {
  const idleCount = posts.filter((p) => p.is_idle_game).length;
  const normalCount = posts.length - idleCount;

  const data = [
    { name: '放置ゲー', value: idleCount },
    { name: '通常ゲー', value: normalCount },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={110}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ background: '#202940', border: '1px solid #3f3c56', color: '#eee' }} />
        <Legend formatter={(value) => <span style={{ color: '#eee' }}>{value}</span>} />
      </PieChart>
    </ResponsiveContainer>
  );
}

import { AchievementPost } from '@prisma/client';
import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type RatingKey = 'rating' | 'yarikomi_rating' | 'difficulty_rating';

type Props = {
  posts: AchievementPost[];
  height?: number;
};

const ratingOptions: { key: RatingKey; label: string }[] = [
  { key: 'rating', label: '総合評価' },
  { key: 'yarikomi_rating', label: '楽しさ' },
  { key: 'difficulty_rating', label: '難易度' },
];

export default function RatingChart({ posts, height = 300 }: Props) {
  const [selectedKey, setSelectedKey] = useState<RatingKey>('rating');

  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  posts.forEach((post) => {
    const val = post[selectedKey];
    if (val >= 1 && val <= 5) {
      counts[val]++;
    }
  });

  const data = Object.entries(counts).map(([score, count]) => ({ score: `★${score}`, count }));

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {ratingOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSelectedKey(opt.key)}
            className={`px-3 py-1 rounded text-sm cursor-pointer border-0 transition-colors ${
              selectedKey === opt.key ? 'bg-blue text-white' : 'bg-bg-300 text-white hover:bg-bg'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3f3c56" />
          <XAxis dataKey="score" tick={{ fill: '#eee' }} />
          <YAxis tick={{ fill: '#eee' }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: '#202940', border: '1px solid #3f3c56', color: '#eee' }}
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
          />
          <Bar dataKey="count" name="本数" fill="#f1c039" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

import DetailItem from 'components/molecules/DetailItem';
import RatingStar from './RatingStar';

type Props = {
  rating: string;
  yarikomi_rating: string;
  difficulty_rating: string;
};

export default function Rating({ rating, yarikomi_rating, difficulty_rating }: Props) {
  const items = [
    {
      title: '総合評価',
      rating: Number(rating),
    },
    {
      title: '実績集めの楽しさ',
      rating: Number(yarikomi_rating),
    },
    {
      title: '難易度',
      rating: Number(difficulty_rating),
    },
  ];

  return (
    <div className="flex flex-wrap mb-3">
      {items.map((item, i) => {
        return (
          <DetailItem key={i} title={item.title}>
            <span className="flex">
              <RatingStar rating={item.rating} />
            </span>
          </DetailItem>
        );
      })}
    </div>
  );
}

import { MdOutlineStarBorder } from 'react-icons/md';
import { MdOutlineStar } from 'react-icons/md';
import DetailItem from 'components/molecules/DetailItem';

type Props = {
  rating: string;
  yarikomi_rating: string;
  difficulty_rating: string;
};

export default function Rating({ rating, yarikomi_rating, difficulty_rating }: Props) {
  function createArr(rating: number): boolean[] {
    return Array(5)
      .fill(false)
      .map((_, index) => index < rating);
  }

  const ratingArr = createArr(Number(rating));
  const yarikomiArr = createArr(Number(yarikomi_rating));
  const difficultyArr = createArr(Number(difficulty_rating));

  const items = [
    {
      title: '総合評価',
      ratingArr: ratingArr,
    },
    {
      title: 'やりこみ評価',
      ratingArr: yarikomiArr,
    },
    {
      title: '難易度',
      ratingArr: difficultyArr,
    },
  ];

  return (
    <div className="flex flex-wrap mb-3">
      {items.map((item, i) => {
        return (
          <DetailItem key={i} title={item.title}>
            <span className="flex">
              {item.ratingArr.map((fill, i2) => {
                return fill ? <MdOutlineStar key={i2} /> : <MdOutlineStarBorder key={i} />;
              })}
            </span>
          </DetailItem>
        );
      })}
    </div>
  );
}

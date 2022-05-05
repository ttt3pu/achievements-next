import Graph from '../atoms/Graph';

type Props = {
  rating: number;
  yarikomiRating: number;
  subeomeDifficulty: number;
}

export default function Rating({ rating, yarikomiRating, subeomeDifficulty }: Props) {
  return (
    <div>
      <h3>総合</h3>
      <Graph color="yellow" percentage={rating} />
      <h3>実績コンプの楽しさ</h3>
      <Graph color="blue" percentage={yarikomiRating} />
      <h3>実績コンプの難易度</h3>
      <Graph color="red" percentage={subeomeDifficulty} />
    </div>
  );
}

import Graph from '../atoms/Graph';

type Props = {
  rating: number;
  yarikomi_rating: number;
  difficulty_rating: number;
};

export default function Rating({ rating, yarikomi_rating, difficulty_rating }: Props) {
  return (
    <div>
      <h3>総合</h3>
      <Graph color="yellow" rating={rating} />
      <h3 className="mt-4">実績コンプの楽しさ</h3>
      <Graph color="blue" rating={yarikomi_rating} />
      <h3 className="mt-4">実績コンプの難易度</h3>
      <Graph color="red" rating={difficulty_rating} />
    </div>
  );
}

import { MdOutlineStarBorder } from 'react-icons/md';
import { MdOutlineStar } from 'react-icons/md';

type Props = {
  rating: number;
  className?: string;
};

export default function RatingStar({ rating, className }: Props) {
  const ratingArr = Array(5)
    .fill(false)
    .map((_, index) => index < rating);

  return (
    <span className={`flex ${className}`}>
      {ratingArr.map((fill, i) => {
        return fill ? <MdOutlineStar key={i} /> : <MdOutlineStarBorder key={i} />;
      })}
    </span>
  );
}

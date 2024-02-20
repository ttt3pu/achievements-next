type Props = {
  rating: number;
  color: 'yellow' | 'blue' | 'red';
};

export default function Graph({ rating, color }: Props) {
  const width = (100 / 5) * rating + '%';

  const bgColorClass = (() => {
    switch (color) {
      case 'yellow':
        return 'bg-yellow';
      case 'blue':
        return 'bg-blue';
      case 'red':
        return 'bg-red';
      default:
        return '';
    }
  })();

  return <div className={`h-5 ${bgColorClass}`} style={{ width }} />;
}

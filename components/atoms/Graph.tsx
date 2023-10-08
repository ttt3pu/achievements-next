import styles from './Graph.module.scss';

type Props = {
  rating: number;
  color: 'yellow' | 'blue' | 'red';
};

export default function Graph({ rating, color }: Props) {
  const width = (100 / 5) * rating + '%';

  return <div className={styles.graph} data-color={color} style={{ width }} />;
}

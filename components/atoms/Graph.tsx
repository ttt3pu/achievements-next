import styles from './Graph.module.scss';

type Props = {
  percentage: number;
  color: 'yellow' | 'blue' | 'red';
}

export default function Graph({ percentage, color }: Props) {
  const width =  100 / percentage + '%';

  return (
    <div className={styles.graph} data-color={color} style={{width}} />
  );
}

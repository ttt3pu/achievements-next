import Graph from '../atoms/Graph';
import styles from './Rating.module.scss';

type Props = {
  rating: number;
  yarikomiRating: number;
  subeomeDifficulty: number;
}

export default function Rating({ rating, yarikomiRating, subeomeDifficulty }: Props) {
  return (
    <div className={styles.rating}>
      <div className={styles.scales}>
        <div className={styles.scale} />
        <div className={styles.scale} />
        <div className={styles.scale} />
        <div className={styles.scale} />
      </div>

      <div className={styles.graphs}>
        <h3 className={styles.h3}>総合</h3>
        <Graph color="yellow" rating={rating} />
        <h3 className={styles.h3}>実績コンプの楽しさ</h3>
        <Graph color="blue" rating={yarikomiRating} />
        <h3 className={styles.h3}>実績コンプの難易度</h3>
        <Graph color="red" rating={subeomeDifficulty} />
      </div>
    </div>
  );
}

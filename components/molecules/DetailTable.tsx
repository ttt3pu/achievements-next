import styles from './DetailTable.module.scss';

type Props = {
  items: {
    heading: string;
    text: string;
  }[];
}

export default function Box({ items }: Props) {
  return (
    <div className={styles.detailTable}>
      {items.map((item, i) => {
        const {heading, text} = item;
        return (
          <dl key={i} className={styles.dl}>
            <dt className={styles.dt}>{heading}</dt>
            <dd className={styles.dd}>{text}</dd>
          </dl>
        );
      })}
    </div>
  );
}

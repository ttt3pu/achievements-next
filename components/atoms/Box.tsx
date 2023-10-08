import { ReactNode } from 'react';
import styles from './Box.module.scss';

type Props = {
  children: ReactNode;
};

export default function Box({ children }: Props) {
  return <div className={styles.box}>{children}</div>;
}

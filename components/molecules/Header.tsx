import Link from 'next/link';
import { GiAchievement } from 'react-icons/gi';
import styles from './Header.module.scss';

export default function Header() {
  return (
    <header className={styles.header}>
      <Link href="/" legacyBehavior>
        <a className={styles.a}>
          <h1 className={styles.h1}>
            <GiAchievement className={styles.badge} />
            <span className={styles.text}>すべての実績を解除しました！おめでとう！</span>
          </h1>
        </a>
      </Link>
    </header>
  );
}

import styles from './Footer.module.scss';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <a href="https://github.com/ttt3pu/achievements-next">Source code</a><br />
      <small>&copy; {new Date().getFullYear()}, <a href="https://attt.hachiware.cat">attt</a> All rights reserved.</small>
    </footer>
  );
}

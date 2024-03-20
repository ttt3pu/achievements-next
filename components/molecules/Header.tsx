import Link from 'next/link';
import { GiAchievement } from 'react-icons/gi';

export default function Header() {
  return (
    <header className="text-center px-5 pt-5 pb-8">
      <Link href="/" legacyBehavior>
        <a className="text-inherit hover:opacity-80">
          <h1 className="text-center pt-5 py-3 inline-flex items-center text-xl">
            <GiAchievement className="w-[2em] h-[2em] shrink-0" />
            <span>すべての実績を解除しました！おめでとう！</span>
          </h1>
        </a>
      </Link>
      <p className="text-sm">自分が実績コンプしたゲームを記録するだけのサイト。一部ネタバレあるので注意。</p>
    </header>
  );
}

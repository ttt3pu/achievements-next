import Link from 'next/link';
import { useRouter } from 'next/router';
import { GiAchievement } from 'react-icons/gi';

export default function Header() {
  const router = useRouter();

  const navLinkClass = (href: string) => {
    const isActive = router.pathname === href;
    const base = 'rounded-full px-4 py-1.5 transition-colors no-underline hover:no-underline';
    return isActive
      ? `${base} bg-yellow text-bg-100 font-bold`
      : `${base} bg-bg-300 text-link hover:bg-bg-500`;
  };

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
      <nav className="mt-3 flex justify-center gap-4 text-sm">
        <Link href="/" className={navLinkClass('/')}>
          一覧
        </Link>
        <Link href="/stats" className={navLinkClass('/stats')}>
          統計
        </Link>
      </nav>
    </header>
  );
}

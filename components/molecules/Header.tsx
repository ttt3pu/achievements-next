import Link from 'next/link';
import { useRouter } from 'next/router';
import { GiAchievement } from 'react-icons/gi';

export default function Header() {
  const router = useRouter();

  const navLinkClass = (href: string) => {
    const isActive = router.pathname === href;
    const base = 'rounded-full px-4 py-1.5 transition-colors no-underline hover:no-underline';
    return isActive ? `${base} bg-yellow text-bg-100 font-bold` : `${base} bg-bg-300 text-link hover:bg-bg-500`;
  };

  return (
    <header className="px-5 py-3 flex items-center gap-4 border-b border-bg-300">
      <Link href="/" legacyBehavior>
        <a className="text-inherit hover:opacity-80 flex items-center gap-2 no-underline hover:no-underline shrink-0">
          <GiAchievement className="w-6 h-6 shrink-0" />
          <span className="text-sm font-medium leading-tight max-sm:hidden">すべての実績を解除しました！</span>
        </a>
      </Link>
      <nav className="flex gap-2 text-sm ml-auto">
        <Link href="/" className={navLinkClass('/')}>
          一覧
        </Link>
        <Link href="/stats" className={navLinkClass('/stats')}>
          統計（詳細）
        </Link>
      </nav>
    </header>
  );
}

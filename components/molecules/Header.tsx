import Link from 'next/link';
import { GiAchievement } from 'react-icons/gi';

export default function Header() {
  return (
    <header className="text-center p-5">
      <Link href="/" legacyBehavior>
        <a className="text-inherit hover:opacity-80">
          <h1 className="text-center py-5 inline-flex items-center text-xl">
            <GiAchievement className="w-[2em] h-[2em] shrink-0" />
            <span>すべての実績を解除しました！おめでとう！</span>
          </h1>
        </a>
      </Link>
    </header>
  );
}

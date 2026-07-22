import Link from "next/link";

function Header() {
  return (
    <nav className="flex h-14 items-center justify-between border-b border-devroast-border bg-devroast-bg px-4 sm:px-6 lg:px-10">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span className="font-mono text-lg sm:text-xl font-bold text-devroast-green">
          &gt;
        </span>
        <Link
          href="/"
          className="font-mono text-sm sm:text-lg font-medium text-devroast-text-primary"
        >
          devroast
        </Link>
      </div>
      <div className="hidden sm:flex items-center">
        <Link
          href="/leaderboard"
          className="font-mono text-xs sm:text-[13px] text-devroast-text-secondary hover:text-devroast-text-primary transition-colors duration-200"
        >
          leaderboard
        </Link>
      </div>
    </nav>
  );
}

export default Header;

import Link from "next/link";

const SKELETON_ROW_KEYS = ["row-1", "row-2", "row-3", "row-4", "row-5"];

export function LeaderboardPageSkeleton() {
  return (
    <div className="min-h-screen bg-devroast-bg text-devroast-text-primary font-mono">
      <nav className="flex items-center justify-between h-14 px-4 sm:px-6 lg:px-10 border-b border-devroast-border">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-xl font-bold text-devroast-green">{">"}</span>
            <span className="text-lg font-medium text-devroast-text-primary">
              devroast
            </span>
          </Link>
        </div>
        <div className="flex items-center">
          <span className="text-[13px] font-normal text-devroast-text-secondary">
            leaderboard
          </span>
        </div>
      </nav>

      <main className="w-full px-4 sm:px-6 lg:px-20 py-10">
        <div className="w-full flex flex-col gap-10">
          <section className="flex flex-col gap-4 w-full">
            <div className="flex items-center gap-3">
              <span className="text-[32px] font-bold text-devroast-green leading-none">
                {">"}
              </span>
              <h1 className="text-[28px] font-bold text-devroast-text-primary leading-none">
                shame_leaderboard
              </h1>
            </div>
            <p className="text-sm font-normal text-devroast-text-secondary font-[IBM_Plex_Mono]">
              {"// the most roasted code on the internet"}
            </p>
          </section>

          <section className="flex flex-col gap-5 w-full">
            <div className="w-full flex flex-col gap-6">
              <div className="h-4 w-56 bg-devroast-surface border border-devroast-border animate-pulse" />

              <div className="border border-devroast-border">
                <div className="hidden md:flex h-10 border-b border-devroast-border bg-devroast-surface animate-pulse" />

                <div className="space-y-3 md:space-y-0 p-3 md:p-0">
                  {SKELETON_ROW_KEYS.map((rowKey) => (
                    <div
                      key={rowKey}
                      className="h-18 md:h-12 border border-devroast-border bg-devroast-surface animate-pulse"
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

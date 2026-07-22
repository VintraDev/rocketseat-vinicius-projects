export function HomeLeaderboardSkeleton() {
  return (
    <div className="flex flex-col items-center gap-6 lg:gap-8 w-full">
      <div className="w-full max-w-full xl:w-240 flex flex-col gap-6 px-4 lg:px-0">
        <div className="flex items-center justify-between w-full">
          <div className="h-4 w-44 bg-devroast-surface border border-devroast-border animate-pulse" />
          <div className="h-7 w-24 bg-devroast-surface border border-devroast-border animate-pulse" />
        </div>

        <div className="h-4 w-80 bg-devroast-surface border border-devroast-border animate-pulse" />

        <div className="border border-devroast-border">
          <div className="hidden md:flex h-10 border-b border-devroast-border bg-devroast-surface animate-pulse" />

          <div className="space-y-3 md:space-y-0 p-3 md:p-0">
            <div className="h-18 md:h-12 border border-devroast-border bg-devroast-surface animate-pulse" />
            <div className="h-18 md:h-12 border border-devroast-border bg-devroast-surface animate-pulse" />
            <div className="h-18 md:h-12 border border-devroast-border bg-devroast-surface animate-pulse" />
          </div>
        </div>

        <div className="flex justify-center py-4">
          <div className="h-4 w-92 bg-devroast-surface border border-devroast-border animate-pulse" />
        </div>
      </div>
    </div>
  );
}

import { cacheLife } from "next/cache";
import { Suspense } from "react";
import { getQueryClient, HydrateClient, trpc } from "@/trpc/server";
import { LeaderboardFull } from "./leaderboard-full";

const FULL_LEADERBOARD_LIMIT = 20;

function LeaderboardFullSkeleton() {
  return (
    <div className="w-full flex flex-col gap-6">
      <div className="h-4 w-56 bg-devroast-surface border border-devroast-border animate-pulse" />

      <div className="border border-devroast-border">
        <div className="hidden md:flex h-10 border-b border-devroast-border bg-devroast-surface animate-pulse" />

        <div className="space-y-3 md:space-y-0 p-3 md:p-0">
          <div className="h-18 md:h-12 border border-devroast-border bg-devroast-surface animate-pulse" />
          <div className="h-18 md:h-12 border border-devroast-border bg-devroast-surface animate-pulse" />
          <div className="h-18 md:h-12 border border-devroast-border bg-devroast-surface animate-pulse" />
          <div className="h-18 md:h-12 border border-devroast-border bg-devroast-surface animate-pulse" />
          <div className="h-18 md:h-12 border border-devroast-border bg-devroast-surface animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export async function LeaderboardFullSection() {
  "use cache";
  cacheLife("hours");

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.leaderboard.full.queryOptions({ limit: FULL_LEADERBOARD_LIMIT }),
  );

  return (
    <HydrateClient>
      <Suspense fallback={<LeaderboardFullSkeleton />}>
        <LeaderboardFull />
      </Suspense>
    </HydrateClient>
  );
}

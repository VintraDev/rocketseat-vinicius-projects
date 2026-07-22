import { cacheLife } from "next/cache";
import { Suspense } from "react";
import { getQueryClient, HydrateClient, trpc } from "@/trpc/server";
import { HomeLeaderboard } from "./home-leaderboard";
import { HomeLeaderboardSkeleton } from "./home-leaderboard-skeleton";

export async function HomeLeaderboardSection() {
  "use cache";
  cacheLife("hours");

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.leaderboard.homepage.queryOptions());

  return (
    <HydrateClient>
      <Suspense fallback={<HomeLeaderboardSkeleton />}>
        <HomeLeaderboard />
      </Suspense>
    </HydrateClient>
  );
}

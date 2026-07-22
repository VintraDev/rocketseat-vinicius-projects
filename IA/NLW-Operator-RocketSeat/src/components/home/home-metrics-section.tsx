import { cacheLife } from "next/cache";
import { getQueryClient, HydrateClient, trpc } from "@/trpc/server";
import { HomeMetrics } from "./home-metrics";

export async function HomeMetricsSection() {
  "use cache";
  cacheLife("hours");

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.metrics.homepage.queryOptions());

  return (
    <HydrateClient>
      <HomeMetrics />
    </HydrateClient>
  );
}

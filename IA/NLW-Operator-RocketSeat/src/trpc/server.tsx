import "server-only";

import {
  dehydrate,
  HydrationBoundary,
  type QueryClient,
} from "@tanstack/react-query";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { cache } from "react";
import { createTRPCContext } from "@/server/trpc/init";
import { appRouter } from "@/server/trpc/routers/_app";
import { makeQueryClient } from "./query-client";

export const getQueryClient = cache(makeQueryClient);

export const trpc = createTRPCOptionsProxy({
  ctx: createTRPCContext,
  router: appRouter,
  queryClient: getQueryClient,
});

export function HydrateClient(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {props.children}
    </HydrationBoundary>
  );
}

type QueryOptionsLike = {
  queryKey: readonly unknown[];
};

export function prefetch(
  queryClient: QueryClient,
  queryOptions: QueryOptionsLike,
) {
  if (
    queryOptions.queryKey[1] &&
    (queryOptions.queryKey[1] as { type?: string }).type === "infinite"
  ) {
    void queryClient.prefetchInfiniteQuery(queryOptions as never);
    return;
  }

  void queryClient.prefetchQuery(queryOptions as never);
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { useTRPC } from "@/trpc/client";

export function HomeMetrics() {
  const trpc = useTRPC();
  const { data } = useQuery({
    ...trpc.metrics.homepage.queryOptions(),
    staleTime: 60 * 60 * 1000,
  });
  const totalRoastedCodes = data?.totalRoastedCodes ?? 0;
  const avgScore = data?.avgScore ?? 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 pt-6 lg:pt-8">
      <span className="font-[IBM_Plex_Mono] text-xs text-devroast-text-muted">
        <AnimatedNumber
          value={totalRoastedCodes}
          format={{ useGrouping: true }}
          className="font-[IBM_Plex_Mono]"
        />{" "}
        codes roasted
      </span>
      <span className="hidden sm:inline font-mono text-xs text-devroast-text-muted">
        ·
      </span>
      <span className="font-[IBM_Plex_Mono] text-xs text-devroast-text-muted">
        avg score:{" "}
        <AnimatedNumber
          value={avgScore}
          format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
          className="font-[IBM_Plex_Mono]"
        />
        /10
      </span>
    </div>
  );
}

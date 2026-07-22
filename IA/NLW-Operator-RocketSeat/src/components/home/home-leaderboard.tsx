"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { LeaderboardRow, TableCell, TableRow } from "@/components/ui/table-row";
import { useTRPC } from "@/trpc/client";

export function HomeLeaderboard() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery({
    ...trpc.leaderboard.homepage.queryOptions(),
    staleTime: 60 * 60 * 1000,
  });
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  const toggleRow = (rank: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rank]: !prev[rank],
    }));
  };

  return (
    <div className="flex flex-col items-center gap-6 lg:gap-8 w-full">
      <div className="w-full max-w-full xl:w-240 flex flex-col gap-6 px-4 lg:px-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-devroast-green">
              {"//"}
            </span>
            <span className="font-mono text-sm font-bold text-devroast-text-primary">
              shame_leaderboard
            </span>
          </div>
          <div className="flex items-center">
            <Link
              href="/leaderboard"
              className="font-mono text-xs text-devroast-text-secondary px-3 py-1.5 border border-devroast-border hover:bg-devroast-surface hover:text-devroast-text-primary transition-colors duration-200 cursor-pointer"
            >
              $ view_all &gt;&gt;
            </Link>
          </div>
        </div>

        <div className="-mt-2">
          <span className="font-[IBM_Plex_Mono] text-[13px] text-devroast-text-muted">
            {`// the worst code on the internet, ranked by shame`}
          </span>
        </div>

        <div className="border border-devroast-border">
          <div className="hidden md:flex">
            <TableRow
              variant="static"
              className="bg-devroast-surface h-10 border-b border-devroast-border"
            >
              <TableCell
                width={50}
                className="text-devroast-text-muted font-mono text-xs font-bold px-5"
              >
                RANK
              </TableCell>
              <TableCell
                width={70}
                className="text-devroast-text-muted font-mono text-xs font-bold"
              >
                SCORE
              </TableCell>
              <TableCell className="text-devroast-text-muted font-mono text-xs font-bold flex-1">
                CODE
              </TableCell>
              <TableCell
                width={100}
                className="text-devroast-text-muted font-mono text-xs font-bold"
              >
                LANG
              </TableCell>
            </TableRow>
          </div>

          <div className="space-y-3 md:space-y-0">
            {data.entries.map((item) => {
              const isExpanded = expandedRows[item.rank] ?? false;

              return (
                <div
                  key={item.rank}
                  className="border-b border-devroast-border last:border-b-0"
                >
                  <LeaderboardRow
                    responsive={true}
                    rank={item.rank}
                    score={item.score}
                    code={isExpanded ? item.fullCode : item.code}
                    language={item.language}
                    expandCode={isExpanded}
                    onToggleExpand={() => toggleRow(item.rank)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-center py-4">
          <Link
            href="/leaderboard"
            className="font-[IBM_Plex_Mono] text-xs text-devroast-text-muted hover:text-devroast-text-secondary transition-colors duration-200 cursor-pointer"
          >
            showing top 3 of {data.stats.totalCodes} - {data.stats.totalRoasts}{" "}
            roasts completed - view full leaderboard &gt;&gt;
          </Link>
        </div>
      </div>
    </div>
  );
}

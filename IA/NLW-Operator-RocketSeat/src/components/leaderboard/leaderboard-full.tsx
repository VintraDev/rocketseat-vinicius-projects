"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { LeaderboardRow, TableCell, TableRow } from "@/components/ui/table-row";
import { useTRPC } from "@/trpc/client";

const FULL_LEADERBOARD_LIMIT = 20;

export function LeaderboardFull() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery({
    ...trpc.leaderboard.full.queryOptions({ limit: FULL_LEADERBOARD_LIMIT }),
    staleTime: 60 * 60 * 1000,
  });
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (rowKey: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowKey]: !prev[rowKey],
    }));
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <span className="text-xs font-normal text-devroast-text-tertiary font-[IBM_Plex_Mono]">
          {data.stats.totalCodes.toLocaleString()} submissions
        </span>
        <span className="text-xs font-normal text-devroast-text-tertiary font-[IBM_Plex_Mono]">
          ·
        </span>
        <span className="text-xs font-normal text-devroast-text-tertiary font-[IBM_Plex_Mono]">
          avg score: {data.stats.avgScore.toFixed(1)}/10
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
          {data.entries.map((item, index) => {
            const rowKey = `${item.rank}-${item.language}-${index}`;
            const isExpanded = expandedRows[rowKey] ?? false;

            return (
              <div key={rowKey}>
                <LeaderboardRow
                  responsive
                  rank={item.rank}
                  score={item.score}
                  code={isExpanded ? item.fullCode : item.code}
                  language={item.language}
                  expandCode={isExpanded}
                  onToggleExpand={() => toggleRow(rowKey)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

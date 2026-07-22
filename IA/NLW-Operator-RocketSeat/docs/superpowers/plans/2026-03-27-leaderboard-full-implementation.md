# Full Leaderboard Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace static `/leaderboard` data with a real tRPC + DB pipeline that renders 20 ranked rows with expandable code and DB-backed stats.

**Architecture:** Keep homepage leaderboard untouched and add a dedicated `leaderboard.full` backend procedure for the full page. Split UI into a server section (prefetch/hydration) and a client renderer (interactive row expansion), then mount this section in `src/app/leaderboard/page.tsx`. Reuse existing `LeaderboardRow` interaction to preserve behavior and reduce risk.

**Tech Stack:** Next.js App Router, tRPC v11 + TanStack React Query, Drizzle SQL queries, Zod, Tailwind CSS.

---

## File Structure and Responsibilities

- `src/db/queries.ts`
  - Add `getFullLeaderboard(limit = 20)` query returning `entries` + `stats` for `/leaderboard`.
- `src/server/trpc/routers/leaderboard.ts`
  - Add `full` procedure and strict Zod output schema.
- `src/components/leaderboard-full.tsx`
  - Client component using `useSuspenseQuery(trpc.leaderboard.full.queryOptions())` and row expand/collapse state.
- `src/components/leaderboard-full-section.tsx`
  - Server component that prefetches and hydrates full leaderboard query.
- `src/app/leaderboard/page.tsx`
  - Keep shell/metadata, remove static mock entries, mount `LeaderboardFullSection`.

---

### Task 1: Add DB query for full leaderboard

**Files:**
- Modify: `src/db/queries.ts`
- Verify: `src/db/queries.ts`

- [ ] **Step 1: Add `getFullLeaderboard(limit = 20)` to `src/db/queries.ts`**

```ts
export async function getFullLeaderboard(limit = 20) {
  const entriesResult = await db.execute(sql`
    SELECT
      ROW_NUMBER() OVER (ORDER BY l.shame_score ASC, l.created_at ASC)::int AS rank,
      l.shame_score::int AS score,
      COALESCE(NULLIF(l.code_preview, ''), LEFT(s.original_code, 120), '// no snippet available') AS code,
      COALESCE(NULLIF(s.original_code, ''), l.code_preview, '// no code available') AS full_code,
      l.language
    FROM leaderboard_entries l
    LEFT JOIN code_submissions s ON s.id = l.submission_id
    ORDER BY l.shame_score ASC, l.created_at ASC
    LIMIT ${limit}
  `);

  const statsResult = await db.execute(sql`
    SELECT
      (SELECT COUNT(*)::int FROM code_submissions) AS total_codes,
      COALESCE(
        (
          SELECT ROUND(AVG(shame_score)::numeric, 1)
          FROM code_submissions
          WHERE status = 'completed'
        ),
        0
      )::numeric AS avg_score
  `);

  const entries = entriesResult.rows as Array<{
    rank: number;
    score: number;
    code: string;
    full_code: string;
    language: string;
  }>;

  const statsRow = statsResult.rows[0] as {
    total_codes: number;
    avg_score: string | number;
  };

  return {
    entries: entries.map((entry) => ({
      rank: entry.rank,
      score: entry.score,
      code: entry.code,
      fullCode: entry.full_code,
      language: entry.language,
    })),
    stats: {
      totalCodes: statsRow?.total_codes ?? 0,
      avgScore:
        typeof statsRow?.avg_score === "number"
          ? statsRow.avg_score
          : Number.parseFloat(statsRow?.avg_score ?? "0"),
    },
  };
}
```

- [ ] **Step 2: Run Biome check for file consistency**

Run: `npm run lint`

Expected: Command exits successfully with no new diagnostics in `src/db/queries.ts`.

- [ ] **Step 3: Commit DB query change**

```bash
git add src/db/queries.ts
git commit -m "feat: add full leaderboard database query"
```

---

### Task 2: Expose full leaderboard through tRPC

**Files:**
- Modify: `src/server/trpc/routers/leaderboard.ts`
- Verify: `src/server/trpc/routers/leaderboard.ts`

- [ ] **Step 1: Import new DB query and add `full` output schema**

```ts
import { getFullLeaderboard, getHomepageLeaderboard } from "@/db/queries";
```

```ts
full: baseProcedure
  .output(
    z.object({
      entries: z.array(
        z.object({
          rank: z.number().int().positive(),
          score: z.number().int().min(1).max(10),
          code: z.string(),
          fullCode: z.string(),
          language: z.string(),
        }),
      ),
      stats: z.object({
        totalCodes: z.number().int().nonnegative(),
        avgScore: z.number().min(0).max(10),
      }),
    }),
  )
  .query(async () => {
    return getFullLeaderboard(20);
  }),
```

- [ ] **Step 2: Keep `homepage` procedure unchanged and verify router shape**

Run: `npm run build`

Expected: Build succeeds and `trpc.leaderboard.homepage` + `trpc.leaderboard.full` types are generated without errors.

- [ ] **Step 3: Commit tRPC router update**

```bash
git add src/server/trpc/routers/leaderboard.ts
git commit -m "feat: expose full leaderboard procedure via trpc"
```

---

### Task 3: Build client renderer for full leaderboard

**Files:**
- Create: `src/components/leaderboard-full.tsx`
- Reuse: `src/components/ui/table-row.tsx`
- Verify: `src/components/leaderboard-full.tsx`

- [ ] **Step 1: Create client component with query + expand state**

```tsx
"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { LeaderboardRow, TableCell, TableRow } from "@/components/ui/table-row";
import { useTRPC } from "@/trpc/client";

export function LeaderboardFull() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.leaderboard.full.queryOptions());
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  const toggleRow = (rank: number) => {
    setExpandedRows((prev) => ({ ...prev, [rank]: !prev[rank] }));
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <span className="text-xs font-normal text-devroast-text-tertiary font-[IBM_Plex_Mono]">
          {data.stats.totalCodes.toLocaleString("en-US")} submissions
        </span>
        <span className="text-xs font-normal text-devroast-text-tertiary font-[IBM_Plex_Mono]">·</span>
        <span className="text-xs font-normal text-devroast-text-tertiary font-[IBM_Plex_Mono]">
          avg score: {data.stats.avgScore.toFixed(1)}/10
        </span>
      </div>

      <div className="border border-devroast-border">
        <div className="hidden md:flex">
          <TableRow variant="static" className="bg-devroast-surface h-10 border-b border-devroast-border">
            <TableCell width={50} className="text-devroast-text-muted font-mono text-xs font-bold px-5">RANK</TableCell>
            <TableCell width={70} className="text-devroast-text-muted font-mono text-xs font-bold">SCORE</TableCell>
            <TableCell className="text-devroast-text-muted font-mono text-xs font-bold flex-1">CODE</TableCell>
            <TableCell width={100} className="text-devroast-text-muted font-mono text-xs font-bold">LANG</TableCell>
          </TableRow>
        </div>

        <div className="space-y-3 md:space-y-0">
          {data.entries.map((item) => {
            const isExpanded = expandedRows[item.rank] ?? false;

            return (
              <div key={item.rank} className="border-b border-devroast-border last:border-b-0">
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
    </>
  );
}
```

- [ ] **Step 2: Run lint to validate client component formatting and imports**

Run: `npm run lint`

Expected: No lint errors for `src/components/leaderboard-full.tsx`.

- [ ] **Step 3: Commit client renderer**

```bash
git add src/components/leaderboard-full.tsx
git commit -m "feat: add full leaderboard client renderer"
```

---

### Task 4: Add server section and integrate page shell

**Files:**
- Create: `src/components/leaderboard-full-section.tsx`
- Modify: `src/app/leaderboard/page.tsx`
- Verify: `src/components/leaderboard-full-section.tsx`, `src/app/leaderboard/page.tsx`

- [ ] **Step 1: Create server section with prefetch + hydration**

```tsx
import { Suspense } from "react";
import { getQueryClient, HydrateClient, trpc } from "@/trpc/server";
import { LeaderboardFull } from "./leaderboard-full";

function LeaderboardFullFallback() {
  return (
    <div className="border border-devroast-border p-4 text-xs font-mono text-devroast-text-muted">
      loading leaderboard...
    </div>
  );
}

export function LeaderboardFullSection() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.leaderboard.full.queryOptions());

  return (
    <HydrateClient>
      <Suspense fallback={<LeaderboardFullFallback />}>
        <LeaderboardFull />
      </Suspense>
    </HydrateClient>
  );
}
```

- [ ] **Step 2: Refactor `src/app/leaderboard/page.tsx` to remove static array and mount section**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { LeaderboardFullSection } from "@/components/leaderboard-full-section";

export const metadata: Metadata = {
  title: "Shame Leaderboard | DevRoast",
  description: "The most roasted code on the internet.",
  openGraph: {
    title: "Shame Leaderboard | DevRoast",
    description: "The most roasted code on the internet.",
    type: "website",
  },
};

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-devroast-bg text-devroast-text-primary font-mono">
      <nav className="flex items-center justify-between h-14 px-4 sm:px-6 lg:px-10 border-b border-devroast-border">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-xl font-bold text-devroast-green">{">"}</span>
            <span className="text-lg font-medium text-devroast-text-primary">devroast</span>
          </Link>
        </div>
        <div className="flex items-center">
          <span className="text-[13px] font-normal text-devroast-text-secondary">leaderboard</span>
        </div>
      </nav>

      <main className="w-full px-4 sm:px-6 lg:px-20 py-10">
        <div className="w-full flex flex-col gap-10">
          <section className="flex flex-col gap-4 w-full">
            <div className="flex items-center gap-3">
              <span className="text-[32px] font-bold text-devroast-green leading-none">{">"}</span>
              <h1 className="text-[28px] font-bold text-devroast-text-primary leading-none">shame_leaderboard</h1>
            </div>
            <p className="text-sm font-normal text-devroast-text-secondary font-[IBM_Plex_Mono]">
              {"// the most roasted code on the internet"}
            </p>
            <LeaderboardFullSection />
          </section>
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 3: Run build to validate server/client boundaries and route compilation**

Run: `npm run build`

Expected: Build succeeds; `/leaderboard` compiles with no server/client import boundary errors.

- [ ] **Step 4: Commit integration changes**

```bash
git add src/components/leaderboard-full-section.tsx src/app/leaderboard/page.tsx
git commit -m "feat: wire full leaderboard section into leaderboard page"
```

---

### Task 5: Final verification and cleanup pass

**Files:**
- Verify: `src/db/queries.ts`
- Verify: `src/server/trpc/routers/leaderboard.ts`
- Verify: `src/components/leaderboard-full.tsx`
- Verify: `src/components/leaderboard-full-section.tsx`
- Verify: `src/app/leaderboard/page.tsx`

- [ ] **Step 1: Run full static verification**

Run: `npm run lint && npm run build`

Expected: Both commands pass.

- [ ] **Step 2: Manual smoke check in dev server**

Run: `npm run dev`

Manual checks:
- `/leaderboard` renders 20 rows.
- ordering is worst-first by score.
- row expand/collapse works on desktop and mobile.
- fallback strings appear when code fields are empty.
- header displays DB-driven totals and average.

Expected: All manual checks pass.

- [ ] **Step 3: Create final feature commit**

```bash
git add src/db/queries.ts src/server/trpc/routers/leaderboard.ts src/components/leaderboard-full.tsx src/components/leaderboard-full-section.tsx src/app/leaderboard/page.tsx
git commit -m "feat: implement db-backed full leaderboard page"
```

# General Quality and Structural Organization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize frontend code by domain, remove test routes, and deliver a clean lint/build/runtime baseline without changing product behavior.

**Architecture:** Use incremental-safe file moves in `src/components` (home, leaderboard, results), keep `ui` as reusable primitives, and update imports in App Router entries. Run lint/build gates before and after each major batch, then validate core flows through local Playwright smoke tests.

**Tech Stack:** Next.js App Router, TypeScript, Biome, tRPC + TanStack Query, Playwright MCP.

---

### Task 1: Baseline Quality Check

**Files:**
- Modify: none
- Test: repository scripts (`npm run lint`, `npm run build`)

- [ ] **Step 1: Run lint to capture baseline**

Run: `npm run lint`
Expected: current lint findings listed for remediation.

- [ ] **Step 2: Run build to capture compile baseline**

Run: `npm run build`
Expected: current build/type/import findings listed for remediation.

- [ ] **Step 3: Save baseline notes in execution log**

Record command failures and the first actionable error per category (lint, type, module resolution).


### Task 2: Reorganize Home Domain Components

**Files:**
- Create: `src/components/home/` (directory)
- Modify: `src/app/page.tsx`
- Modify: moved files from `src/components/home-*.tsx` and `src/components/home-page.tsx`
- Test: `npm run lint`

- [ ] **Step 1: Move home components into domain folder**

Move:
- `src/components/home-page.tsx` -> `src/components/home/home-page.tsx`
- `src/components/home-metrics.tsx` -> `src/components/home/home-metrics.tsx`
- `src/components/home-metrics-section.tsx` -> `src/components/home/home-metrics-section.tsx`
- `src/components/home-leaderboard.tsx` -> `src/components/home/home-leaderboard.tsx`
- `src/components/home-leaderboard-section.tsx` -> `src/components/home/home-leaderboard-section.tsx`
- `src/components/home-leaderboard-skeleton.tsx` -> `src/components/home/home-leaderboard-skeleton.tsx`

- [ ] **Step 2: Update relative imports inside moved home files**

Example expected pattern:

```tsx
import { HomeMetrics } from "./home-metrics";
import { HomeLeaderboardSkeleton } from "./home-leaderboard-skeleton";
```

- [ ] **Step 3: Update app entry imports for home page composition**

`src/app/page.tsx` expected imports:

```tsx
import { HomeLeaderboardSection } from "@/components/home/home-leaderboard-section";
import { HomeMetricsSection } from "@/components/home/home-metrics-section";
import { HomePage } from "@/components/home/home-page";
```

- [ ] **Step 4: Run lint for home-domain batch**

Run: `npm run lint`
Expected: no unresolved imports from home component moves.


### Task 3: Reorganize Leaderboard and Results Domains

**Files:**
- Create: `src/components/leaderboard/` (directory)
- Create: `src/components/results/` (directory)
- Modify: `src/app/leaderboard/page.tsx`
- Modify: `src/app/leaderboard/loading.tsx`
- Modify: `src/app/results/[roastId]/page.tsx`
- Modify: moved files from `src/components/leaderboard-*.tsx`, `src/components/results-page-client.tsx`
- Test: `npm run lint`

- [ ] **Step 1: Move leaderboard components into domain folder**

Move:
- `src/components/leaderboard-full.tsx` -> `src/components/leaderboard/leaderboard-full.tsx`
- `src/components/leaderboard-full-section.tsx` -> `src/components/leaderboard/leaderboard-full-section.tsx`
- `src/components/leaderboard-page-skeleton.tsx` -> `src/components/leaderboard/leaderboard-page-skeleton.tsx`

- [ ] **Step 2: Move results composition component into domain folder**

Move:
- `src/components/results-page-client.tsx` -> `src/components/results/results-page-client.tsx`

- [ ] **Step 3: Move results-specific UI blocks from shared ui to results domain**

Move:
- `src/components/ui/analysis-card.tsx` -> `src/components/results/analysis-card.tsx`
- `src/components/ui/diff-line.tsx` -> `src/components/results/diff-line.tsx`
- `src/components/ui/score-hero.tsx` -> `src/components/results/score-hero.tsx`

- [ ] **Step 4: Update imports in app routes to new domain paths**

Expected import targets:

```tsx
// src/app/leaderboard/page.tsx
import { LeaderboardFullSection } from "@/components/leaderboard/leaderboard-full-section";

// src/app/leaderboard/loading.tsx
import { LeaderboardPageSkeleton } from "@/components/leaderboard/leaderboard-page-skeleton";

// src/app/results/[roastId]/page.tsx
import { ResultsPageClient } from "@/components/results/results-page-client";
```

- [ ] **Step 5: Update imports in moved results client component**

Expected import targets:

```tsx
import { AnalysisCard } from "@/components/results/analysis-card";
import { DiffLine } from "@/components/results/diff-line";
import { ScoreHero } from "@/components/results/score-hero";
```

- [ ] **Step 6: Run lint for leaderboard/results batch**

Run: `npm run lint`
Expected: no unresolved imports from leaderboard/results moves.


### Task 4: Remove Test Routes from App Surface

**Files:**
- Delete: `src/app/test-manual-selection/page.tsx`
- Delete: `src/app/test-detection/page.tsx`
- Delete: `src/app/test-editor/page.tsx`
- Delete: `src/app/static-test/page.tsx`
- Delete: `src/app/test-editable-code/page.tsx`
- Test: search + lint

- [ ] **Step 1: Delete test route page files**

Remove listed files from `src/app`.

- [ ] **Step 2: Search for dead references to deleted routes**

Run: `rg "test-manual-selection|test-detection|test-editor|static-test|test-editable-code" src`
Expected: no remaining references in active app code (except historical docs if any).

- [ ] **Step 3: Run lint after route cleanup**

Run: `npm run lint`
Expected: route removals do not produce unresolved symbols/imports.


### Task 5: Build Verification and Fixes

**Files:**
- Modify: only files required by build/lint errors from prior tasks
- Test: `npm run build`

- [ ] **Step 1: Run full production build**

Run: `npm run build`
Expected: successful build.

- [ ] **Step 2: Apply minimal fixes for any build regressions**

Typical fix patterns:

```ts
// module path corrections
import { X } from "@/components/<domain>/<file>";

// type-only import corrections
import type { Y } from "@/lib/<file>";
```

- [ ] **Step 3: Re-run lint and build as final command gate**

Run:
- `npm run lint`
- `npm run build`

Expected: both pass.


### Task 6: Local Runtime Smoke Tests with Playwright

**Files:**
- Modify: none (unless runtime bug discovered)
- Test: local dev server + Playwright MCP

- [ ] **Step 1: Start local dev server**

Run: `npm run dev`
Expected: app available at `http://localhost:3000`.

- [ ] **Step 2: Validate home and leaderboard routes**

Checks:
- `/` renders headline/editor and submit controls.
- `/leaderboard` renders page shell and list/table section.

- [ ] **Step 3: Validate results route behavior**

Checks:
- `/results/<uuid>` renders page shell and handles loading/error/content state without crash.

- [ ] **Step 4: Capture outcomes and apply final runtime fixes if needed**

If issue is found, fix minimally and re-run:
- `npm run lint`
- `npm run build`
- smoke checks.

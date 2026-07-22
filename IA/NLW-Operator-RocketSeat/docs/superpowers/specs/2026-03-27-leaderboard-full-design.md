# Leaderboard Full Page Design

Date: 2026-03-27
Topic: Full leaderboard behavior for `src/app/leaderboard/page.tsx` with tRPC backend integration
Status: Approved for planning

## 1) Objective

Implement the real behavior of the `/leaderboard` page using data from the database, matching the interaction model already used in the homepage shame leaderboard:

- expandable rows (`show more` / `show less`)
- syntax highlight behavior already present in row rendering
- fixed list of 20 results, no pagination
- ranking ordered by worst code first (`shameScore` ascending)
- simple fallback text when snippet or code is missing

Homepage behavior must remain unchanged.

## 2) Scope and Non-Goals

### In scope

- Add a dedicated tRPC procedure for full leaderboard data.
- Add DB query function for full leaderboard entries and stats.
- Replace static mock data in `/leaderboard` with real data.
- Reuse `LeaderboardRow` interaction pattern from homepage.
- Fetch and render top stats from DB in leaderboard header.

### Out of scope

- Pagination or infinite scroll.
- Changes to homepage leaderboard contract and behavior.
- New visual system or broad UI refactor.
- Changes to submission creation/analysis flows.

## 3) Current Context Summary

Current repository already has:

- `trpc.leaderboard.homepage` in `src/server/trpc/routers/leaderboard.ts`
- homepage data query `getHomepageLeaderboard()` in `src/db/queries.ts`
- homepage interactive table in `src/components/home-leaderboard.tsx`
- static mock leaderboard page in `src/app/leaderboard/page.tsx`

The homepage flow is the reference pattern for interaction and data hydration.

## 4) Proposed Architecture

### 4.1 Backend (DB + tRPC)

Add a dedicated full-page query path:

- DB query function in `src/db/queries.ts`:
  - name: `getFullLeaderboard()` (or equivalent domain-clear naming)
  - returns:
    - `entries`: top 20 rows ordered by `shame_score ASC, created_at ASC`
    - `stats`: aggregate numbers for header

- tRPC procedure in `src/server/trpc/routers/leaderboard.ts`:
  - name: `full`
  - type: `baseProcedure.query(...)`
  - output validated via Zod object with `entries` and `stats`

Keep `homepage` procedure intact to avoid regressions.

### 4.2 Frontend (server/client composition)

Follow existing project pattern:

- new server section component (similar to `HomeLeaderboardSection`) for prefetch + hydration
- new client component for full leaderboard rendering with `useSuspenseQuery(trpc.leaderboard.full.queryOptions())`
- page route `src/app/leaderboard/page.tsx` keeps shell/metadata and renders the new section

### 4.3 UI behavior

- Render rows with `LeaderboardRow responsive={true}`.
- Maintain local expanded state by rank key.
- Collapsed row shows short snippet (`code`).
- Expanded row shows full code (`fullCode`).
- Reuse existing row-level `show more/show less` behavior.

## 5) Data Contract

### 5.1 `entries`

Each entry contains:

- `rank: number` (1-based, from SQL window function)
- `score: number` (integer from `shame_score`)
- `code: string` (short preview)
- `fullCode: string` (full content for expansion)
- `language: string`

### 5.2 `stats`

- `totalCodes: number` (count of rows in `code_submissions`)
- `avgScore: number` (average shame score from completed submissions, rounded to 1 decimal)

### 5.3 Fallback rules

For each row:

- `code`: `code_preview` -> first part of `original_code` -> `"// no snippet available"`
- `fullCode`: `original_code` -> `code_preview` -> `"// no code available"`

This guarantees render-safe output even with missing/empty source data.

## 6) Data Flow

1. Server section prefetches `trpc.leaderboard.full.queryOptions()`.
2. `HydrateClient` passes prefetched cache to client.
3. Client component reads data with `useSuspenseQuery`.
4. Client maps `entries` to `LeaderboardRow` and manages expand/collapse state.
5. Header stats are rendered from `stats.totalCodes` and `stats.avgScore`.

## 7) Error Handling and States

- Loading state uses Suspense fallback at section level.
- Query failures use existing app error boundary behavior (no custom parallel error system added).
- SQL fallback values ensure strings are always present for code fields.

## 8) Testing and Verification Plan

Functional checks:

- `/leaderboard` renders exactly 20 entries.
- Order is by worst score first (`shame_score ASC`, tie by `created_at ASC`).
- Expand/collapse works on desktop and mobile layouts.
- Rows with missing snippet/code show fallback strings without breakage.
- Header stats show DB values, not static literals.

Technical checks:

- Run project lint command.
- Run project build to validate types and integration.

## 9) File-Level Change Plan (for implementation phase)

- `src/db/queries.ts`
  - add full leaderboard data function and stats query
- `src/server/trpc/routers/leaderboard.ts`
  - add `full` procedure + output schema
- `src/components/*`
  - add full leaderboard section + client renderer components
- `src/app/leaderboard/page.tsx`
  - remove static entries usage and mount hydrated section

No broad refactors are planned outside these focused changes.

## 10) Acceptance Criteria

The design is complete when all statements are true:

- Full leaderboard page uses tRPC + DB data end-to-end.
- UI interaction matches homepage pattern (expand/collapse + syntax-highlight path).
- Exactly 20 rows are shown, with no pagination controls.
- Header stats come from DB.
- Homepage leaderboard contract and behavior remain unchanged.

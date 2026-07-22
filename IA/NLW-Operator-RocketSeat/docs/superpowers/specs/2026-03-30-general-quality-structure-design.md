# General Quality and Structural Organization Design

Date: 2026-03-30
Status: Approved in conversation (awaiting final spec review)
Scope: Lint/build remediation, broad structural organization, removal of test routes, and Playwright smoke validation on localhost.

## 1. Objective

Execute a general quality pass across the project with an incremental-safe structure improvement strategy.

This iteration must:

- Fix current and introduced issues that block `lint` and `build`.
- Reorganize frontend components into clearer domain boundaries without changing business behavior.
- Remove test-only routes from `src/app` so they are not part of the production app surface.
- Validate key user flows through local smoke tests, including browser checks on `http://localhost:3000`.
- Keep compatibility with current app architecture (Next App Router, tRPC layer, DB access boundaries).

Out of scope:

- Business-rule changes for scoring, roast generation, leaderboard ranking logic, or DB schema redesign.
- Deep backend architecture migration (e.g., replacing tRPC patterns or query layer design).
- New product features unrelated to quality/organization.

## 2. Current Context Snapshot

- Repository already has active feature work and a dirty worktree; we must avoid reverting unrelated changes.
- Frontend components are partly flat under `src/components`, with mixed page-specific and shared concerns.
- Shared UI primitives exist in `src/components/ui`, but some domain-focused elements are mixed into the same area.
- `src/app` currently includes multiple test/debug routes (`test-*`, `static-test`) that should be removed.
- Tooling baseline is Biome (`npm run lint`) and Next build (`npm run build`).

## 3. Selected Approach (A: Incremental Safe Reorganization)

Chosen approach: broad structural organization with controlled risk.

Principles:

- Preserve behavior first, improve structure second.
- Move files by domain and update imports in one coherent pass.
- Keep shared primitives in `ui`, and move page-specific composition into domain folders.
- Use verification gates after each logical group of changes.

Why this approach:

- Delivers requested broad organization improvements.
- Avoids destabilizing server/data layers beyond what is necessary for compilation and quality.
- Keeps rollout debuggable with clear checkpoints (lint/build/dev smoke).

## 4. Target Structure

### 4.1 Component Domains

Target high-level organization under `src/components`:

- `src/components/home/*`
  - Home page composition, homepage metrics section, home leaderboard section, and related skeleton/presentational blocks.
- `src/components/leaderboard/*`
  - Full leaderboard page composition, sections, and leaderboard-specific loading blocks.
- `src/components/results/*`
  - Results route client composition and result-specific blocks (score hero, analysis, diff views, etc.).
- `src/components/providers/*`
  - App-level providers (for example tRPC provider).
- `src/components/ui/*`
  - Reusable design-system primitives and generic shared UI elements only.

### 4.2 Naming and Boundary Rules

- Use explicit naming by role (`*-section`, `*-skeleton`, `*-client`).
- Keep imports explicit by file path for domain components.
- Avoid introducing broad new barrel exports that hide ownership.
- Maintain current Server/Client component boundaries unless a fix is required.

## 5. Route Cleanup

Remove test/debug routes from `src/app`:

- `src/app/test-manual-selection/page.tsx`
- `src/app/test-detection/page.tsx`
- `src/app/test-editor/page.tsx`
- `src/app/static-test/page.tsx`
- `src/app/test-editable-code/page.tsx`

Cleanup requirements:

- Remove associated imports/references if any exist.
- Ensure there are no dead links in navigation or docs that imply these routes remain active.

## 6. Quality and Validation Strategy

### 6.1 Command Gates

Primary validation sequence:

1. Run `npm run lint` and capture baseline issues.
2. Run `npm run build` and capture baseline compile/type issues.
3. Implement structural and route cleanup changes.
4. Re-run `npm run lint`.
5. Re-run `npm run build`.

### 6.2 Local Runtime and Browser Smoke Checks

After build/lint pass:

- Start app with `npm run dev`.
- Validate `http://localhost:3000` with Playwright MCP smoke checks.
- Minimum smoke targets:
  - Home page loads and primary actions render correctly.
  - Leaderboard page loads without runtime crashes.
  - Results route entry path (valid known ID or controlled fallback behavior) renders expected state.

### 6.3 Success Criteria

- `lint` succeeds.
- `build` succeeds.
- Critical app routes load locally without obvious runtime UI breakage.
- No test/debug routes remain accessible from `src/app`.
- Imports resolve cleanly after file moves.

## 7. Risk Management

Primary risks:

- Broken imports after file moves.
- Accidental boundary regressions between server/client components.
- Residual references to deleted test routes.

Mitigations:

- Move and fix by domain batch, then run lint/build.
- Keep server/data APIs untouched unless a compile fix requires minimal adjustments.
- Use repository search for deleted route names before final verification.

## 8. Acceptance Criteria

This design is considered implemented when all are true:

- Project structure reflects the new domain-oriented organization in `src/components`.
- Test routes listed in section 5 are removed.
- `npm run lint` passes.
- `npm run build` passes.
- Playwright smoke checks on localhost validate core navigation and rendering.
- Final report documents moved files, key fixes, and any remaining non-blocking recommendations.

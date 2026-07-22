# tRPC Server Patterns

Use this folder for server-side tRPC setup and routers.

## Structure

- `init.ts`: `initTRPC`, context factory, and base helpers.
- `routers/_app.ts`: root router export + `AppRouter` type.
- `routers/*.ts`: domain routers.

## Rules

- Import `server-only` in server-only modules.
- Keep procedures thin and delegate data access to `src/db/queries.ts`.
- Validate outputs with Zod when useful for boundary guarantees.
- Avoid adding unrelated domain routers in incremental deliveries.
- Keep router naming domain-oriented (`metrics`, `leaderboard`, etc.).

## Context

- Context must be request-scoped.
- Do not put browser/global mutable state in context.

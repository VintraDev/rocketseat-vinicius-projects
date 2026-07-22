# Components Patterns

Guidelines for non-UI-shared components in `src/components`.

## Server vs Client

- Default to Server Components.
- Use Client Components only when interactivity/hooks/browser APIs are required.
- For mixed composition, keep data orchestration on server and interactive rendering on client.

## Homepage Metrics Pattern

- Metrics are loaded via tRPC (`metrics.homepage`).
- For homepage metric numbers, do not use Suspense/skeleton fallback.
- Render values as `0` initially and animate to API values with NumberFlow.
- Keep number animation isolated in reusable component (`ui/animated-number.tsx`).

## Scope Control

- When implementing incremental backend migration, update only explicitly requested UI flows.
- Avoid broad refactors in this directory unless asked.

# tRPC Client/SSR Integration Patterns

Use this folder for integration between tRPC, TanStack Query, and Next App Router.

## Files and Responsibilities

- `query-client.ts`: QueryClient factory and default options.
- `client.tsx`: browser provider (`TRPCProvider` + `QueryClientProvider`) and hooks.
- `server.tsx`: server proxy, hydration helpers, and request-scoped query client access.

## Rules

- Prefer `createTRPCOptionsProxy` for server-side query options in RSC.
- Server QueryClient must be request-scoped with `cache(makeQueryClient)`.
- Client QueryClient must be singleton in browser.
- Keep `staleTime` configured to avoid immediate refetch after hydration.
- Use hydration boundary for prefetch + client hooks composition.
- Do not move server logic into client files.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# DevRoast - Agent Instructions

## Project Overview

DevRoast is a code review application that provides AI-powered brutally honest feedback on code quality. Users submit code and receive shame scores (1-10) with detailed roasting commentary. Built during **NLW Operator** by Rocketseat.

## Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS v4 + CSS Variables
- **UI**: Custom component library with `tailwind-variants`
- **Typography**: JetBrains Mono (primary), IBM Plex Mono (secondary)

## Design System

### Color System (DevRoast Theme)
```css
--color-devroast-bg: #0a0a0a           /* Main background */
--color-devroast-text-primary: #fafafa /* Primary text */
--color-devroast-green: #10b981        /* Primary accent */
--color-devroast-orange: #f59e0b       /* Medium scores */
--color-devroast-red: #ef4444          /* Bad scores */
--color-devroast-border: #2a2a2a       /* Borders */
--color-devroast-surface: #0f0f0f      /* Surface containers */
```

### Score-based Auto-coloring
```typescript
// Scores 1-10 automatically determine color
if (score <= 3) return "red";     // Bad code
if (score <= 6) return "yellow";  // Medium code  
return "green";                   // Good code
```

## Component Patterns

### Standard API
```typescript
interface ComponentProps extends VariantProps<typeof variants> {
  responsive?: boolean;  // Enable mobile-first responsive behavior
  children?: React.ReactNode;
}

const Component = forwardRef<HTMLElement, ComponentProps>(({ className, responsive, ...props }, ref) => {
  return <element className={variants({ className, responsive })} {...props} />;
});
Component.displayName = "Component";
```

### Responsive Design
- **Mobile-first**: `px-4 sm:px-6 lg:px-10`
- **Breakpoints**: sm (640px), md (768px), lg (1024px)
- **Typography**: `text-sm sm:text-base lg:text-lg`

## Key Components

### LeaderboardRow
- Auto-colored scores based on quality (1-10)
- Desktop: Table format | Mobile: Card layout
- `responsive={true}` enables adaptive behavior

### CodeBlock Components  
- **CodeBlock**: Server-side syntax highlighting
- **CodeBlockWithCopy**: Client-side with copy functionality
- **EditableCodeInput**: Interactive editor with live highlighting

## Development Rules

### Styling
- Use semantic classes: `bg-devroast-green` not `bg-[#10b981]`
- Mobile-first responsive design
- Sharp corners (radius 0) for primary buttons
- Monospace fonts for code/UI elements

### File Structure
```
src/
├── app/                # Next.js App Router pages
├── components/ui/      # Component library
└── app/globals.css     # Tailwind + CSS variables
```

### API/Backend (tRPC)
- Use `tRPC v11` + `@trpc/tanstack-react-query` as the default API layer.
- Keep DB access in `src/db/queries.ts`; UI should consume tRPC procedures, not SQL/Drizzle directly.
- Expose HTTP handler in `src/app/api/trpc/[trpc]/route.ts` via fetch adapter.
- Keep server/client boundaries explicit (`server-only` for server modules, `"use client"` for client modules).
- QueryClient rules:
  - Server: request-scoped (`cache(makeQueryClient)`), never shared across requests.
  - Client: browser singleton QueryClient.
- For homepage metrics specifically, do not use Suspense/skeleton fallback. Start numbers at `0` and animate to API value using NumberFlow.

### Design Reference
- Original: `/home/vinicius/Downloads/devroast.pen`
- Use MCP Pencil tools for design specifications
- Maintain pixel-perfect fidelity

---

**Status**: All major components implemented and pixel-perfect with design.

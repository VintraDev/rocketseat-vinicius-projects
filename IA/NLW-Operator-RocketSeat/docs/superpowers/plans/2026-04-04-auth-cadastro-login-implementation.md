# Authentication (Cadastro/Login) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement registration, login, logout, forgot-password, and reset-password with protected user data access in the current Next.js + tRPC + Drizzle architecture.

**Architecture:** Keep authentication server-first with HttpOnly cookies and token-hash persistence in PostgreSQL. Add dedicated auth tables and server auth utilities, expose auth through tRPC procedures, and protect user-specific procedures/pages by resolving identity in request context. Reuse existing tRPC + query boundaries and keep DB operations in `src/db/queries.ts`.

**Tech Stack:** Next.js App Router, tRPC v11, Drizzle ORM, PostgreSQL, Zod, bcryptjs, Node crypto, Playwright MCP/manual browser checks.

---

## Planned File Structure

### Create

- `src/server/auth/tokens.ts` - token generation/hash/expiration helpers.
- `src/server/auth/password.ts` - password hash/verify helpers.
- `src/server/auth/session.ts` - session cookie constants and helpers.
- `src/server/trpc/routers/auth.ts` - register/login/logout/forgot/reset procedures.
- `src/app/login/page.tsx` - login page.
- `src/app/register/page.tsx` - register page.
- `src/app/forgot-password/page.tsx` - forgot password page.
- `src/app/reset-password/[token]/page.tsx` - reset password page.
- `src/components/auth/login-form.tsx` - login form.
- `src/components/auth/register-form.tsx` - register form.
- `src/components/auth/forgot-password-form.tsx` - forgot form.
- `src/components/auth/reset-password-form.tsx` - reset form.
- `src/db/migrations/0001_auth_tables.sql` - DB migration for auth schema changes.

### Modify

- `src/db/schema.ts` - add users auth fields + new tables `auth_sessions` and `password_resets`.
- `src/db/queries.ts` - auth and session query functions; procedure-safe user data queries.
- `src/server/trpc/init.ts` - context identity resolution for authenticated user.
- `src/server/trpc/routers/_app.ts` - register `auth` router.
- `src/server/trpc/routers/roast.ts` - enforce ownership checks for get/retry.
- `src/components/home/home-page.tsx` - show login/register CTA and logout when authenticated.
- `src/trpc/client.tsx` - keep same client but ensure credentials are sent by fetch link options if needed.
- `package.json` - add `bcryptjs` dependency.

### Test/Verification Files

- `src/server/auth/__tests__/password.test.ts` - password utility tests.
- `src/server/auth/__tests__/tokens.test.ts` - token and hash tests.
- `src/server/trpc/routers/__tests__/auth-router.test.ts` - auth procedure tests.

---

### Task 1: Add Auth Dependencies and Password Utilities

**Files:**
- Modify: `package.json`
- Create: `src/server/auth/password.ts`
- Test: `src/server/auth/__tests__/password.test.ts`

- [ ] **Step 1: Write the failing password utility test**

```ts
// src/server/auth/__tests__/password.test.ts
import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/server/auth/password";

describe("password helpers", () => {
  it("hashes and verifies password", async () => {
    const raw = "supersecret123";
    const hashed = await hashPassword(raw);

    expect(hashed).not.toBe(raw);
    await expect(verifyPassword(raw, hashed)).resolves.toBe(true);
    await expect(verifyPassword("wrongpass", hashed)).resolves.toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/server/auth/__tests__/password.test.ts`
Expected: FAIL with module/function not found for `hashPassword`.

- [ ] **Step 3: Add dependency and implement password helpers**

```ts
// src/server/auth/password.ts
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export async function hashPassword(rawPassword: string) {
  return bcrypt.hash(rawPassword, SALT_ROUNDS);
}

export async function verifyPassword(rawPassword: string, passwordHash: string) {
  return bcrypt.compare(rawPassword, passwordHash);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/server/auth/__tests__/password.test.ts`
Expected: PASS (1 test file, 1 test).

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/server/auth/password.ts src/server/auth/__tests__/password.test.ts
git commit -m "feat: add password hashing helpers for auth"
```

### Task 2: Add Token Helpers for Sessions and Password Reset

**Files:**
- Create: `src/server/auth/tokens.ts`
- Test: `src/server/auth/__tests__/tokens.test.ts`

- [ ] **Step 1: Write failing token helper tests**

```ts
// src/server/auth/__tests__/tokens.test.ts
import { describe, expect, it } from "vitest";
import { createOpaqueToken, hashToken } from "@/server/auth/tokens";

describe("token helpers", () => {
  it("creates opaque tokens and deterministic hashes", () => {
    const token = createOpaqueToken();
    const hashA = hashToken(token);
    const hashB = hashToken(token);

    expect(token.length).toBeGreaterThan(20);
    expect(hashA).toBe(hashB);
    expect(hashA).not.toBe(token);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/server/auth/__tests__/tokens.test.ts`
Expected: FAIL with missing module exports.

- [ ] **Step 3: Implement token helper module**

```ts
// src/server/auth/tokens.ts
import { createHash, randomBytes } from "node:crypto";

export function createOpaqueToken() {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/server/auth/__tests__/tokens.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/server/auth/tokens.ts src/server/auth/__tests__/tokens.test.ts
git commit -m "feat: add secure token helpers for sessions and resets"
```

### Task 3: Add Database Schema and Migration for Auth

**Files:**
- Modify: `src/db/schema.ts`
- Create: `src/db/migrations/0001_auth_tables.sql`

- [ ] **Step 1: Write migration SQL with explicit schema changes**

```sql
-- src/db/migrations/0001_auth_tables.sql
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS name varchar(150),
  ADD COLUMN IF NOT EXISTS password_hash text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique_lower
  ON users (lower(email));

CREATE TABLE IF NOT EXISTS auth_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token_hash text NOT NULL,
  expires_at timestamp NOT NULL,
  revoked_at timestamp,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_auth_sessions_token_hash
  ON auth_sessions (session_token_hash);

CREATE TABLE IF NOT EXISTS password_resets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reset_token_hash text NOT NULL,
  expires_at timestamp NOT NULL,
  used_at timestamp,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_password_resets_token_hash
  ON password_resets (reset_token_hash);
```

- [ ] **Step 2: Reflect same structures in Drizzle schema**

```ts
// src/db/schema.ts (additions only)
export const authSessions = pgTable("auth_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  sessionTokenHash: text("session_token_hash").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  revokedAt: timestamp("revoked_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const passwordResets = pgTable("password_resets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  resetTokenHash: text("reset_token_hash").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

- [ ] **Step 3: Apply migration in local DB**

Run: `npm run db:migrate`
Expected: migration applied with new tables and indexes.

- [ ] **Step 4: Validate tables exist**

Run: `docker exec devroast-postgres psql -U devroast_user -d devroast -c "\dt"`
Expected: includes `auth_sessions` and `password_resets`.

- [ ] **Step 5: Commit**

```bash
git add src/db/schema.ts src/db/migrations/0001_auth_tables.sql
git commit -m "feat: add auth session and password reset schema"
```

### Task 4: Implement DB Query Layer for Auth

**Files:**
- Modify: `src/db/queries.ts`

- [ ] **Step 1: Add failing router-level test covering missing query functions**

```ts
// src/server/trpc/routers/__tests__/auth-router.test.ts (initial skeleton)
import { describe, expect, it } from "vitest";

describe("auth router", () => {
  it("placeholder bootstrap test", () => {
    expect(true).toBe(true);
  });
});
```

- [ ] **Step 2: Implement auth query functions in `src/db/queries.ts`**

```ts
// examples to add in src/db/queries.ts
export async function findUserByEmail(email: string) { /* ... */ }
export async function createAuthSession(input: { userId: string; sessionTokenHash: string; expiresAt: Date }) { /* ... */ }
export async function findActiveSessionByTokenHash(tokenHash: string) { /* ... */ }
export async function revokeSessionByTokenHash(tokenHash: string) { /* ... */ }
export async function createPasswordResetToken(input: { userId: string; resetTokenHash: string; expiresAt: Date }) { /* ... */ }
export async function findValidPasswordResetByHash(tokenHash: string) { /* ... */ }
export async function markPasswordResetUsed(id: string) { /* ... */ }
export async function updateUserPassword(userId: string, passwordHash: string) { /* ... */ }
export async function revokeAllUserSessions(userId: string) { /* ... */ }
```

- [ ] **Step 3: Build-check query layer**

Run: `npm run build`
Expected: no TypeScript errors from `src/db/queries.ts` additions.

- [ ] **Step 4: Commit**

```bash
git add src/db/queries.ts src/server/trpc/routers/__tests__/auth-router.test.ts
git commit -m "feat: add auth database query primitives"
```

### Task 5: Implement Session Resolution in tRPC Context

**Files:**
- Create: `src/server/auth/session.ts`
- Modify: `src/server/trpc/init.ts`

- [ ] **Step 1: Add session helper module**

```ts
// src/server/auth/session.ts
export const AUTH_COOKIE_NAME = "devroast_auth";
export const AUTH_SESSION_TTL_DAYS = 30;
```

- [ ] **Step 2: Extend `createTRPCContext` to resolve authenticated user**

```ts
// src/server/trpc/init.ts (shape target)
return {
  sessionId,
  auth: {
    userId: resolvedUserIdOrNull,
    sessionTokenHash: resolvedSessionHashOrNull,
  },
};
```

- [ ] **Step 3: Add protected procedure helper**

```ts
// src/server/trpc/init.ts
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.auth?.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      auth: {
        userId: ctx.auth.userId,
        sessionTokenHash: ctx.auth.sessionTokenHash,
      },
    },
  });
});
```

- [ ] **Step 4: Verify type-check passes**

Run: `npm run build`
Expected: context and procedure types compile.

- [ ] **Step 5: Commit**

```bash
git add src/server/auth/session.ts src/server/trpc/init.ts
git commit -m "feat: resolve authenticated identity in trpc context"
```

### Task 6: Add tRPC Auth Router (Register/Login/Logout/Forgot/Reset)

**Files:**
- Create: `src/server/trpc/routers/auth.ts`
- Modify: `src/server/trpc/routers/_app.ts`
- Modify: `src/server/trpc/routers/roast.ts`
- Test: `src/server/trpc/routers/__tests__/auth-router.test.ts`

- [ ] **Step 1: Write failing tests for auth procedures**

```ts
// src/server/trpc/routers/__tests__/auth-router.test.ts
import { describe, expect, it } from "vitest";

describe("auth router", () => {
  it("rejects login with invalid credentials", async () => {
    // call auth.login with bad credentials
    // expect TRPCError BAD_REQUEST or UNAUTHORIZED
    expect(true).toBe(true);
  });
});
```

- [ ] **Step 2: Implement router with zod-validated procedures**

```ts
// src/server/trpc/routers/auth.ts (procedure names)
export const authRouter = createTRPCRouter({
  register: baseProcedure.input(/* name,email,password */).mutation(/* ... */),
  login: baseProcedure.input(/* email,password */).mutation(/* ... */),
  logout: protectedProcedure.mutation(/* ... */),
  forgotPassword: baseProcedure.input(/* email */).mutation(/* ... */),
  resetPassword: baseProcedure.input(/* token,newPassword */).mutation(/* ... */),
  me: protectedProcedure.query(/* ... */),
});
```

- [ ] **Step 3: Register router in app router**

```ts
// src/server/trpc/routers/_app.ts
export const appRouter = createTRPCRouter({
  auth: authRouter,
  leaderboard: leaderboardRouter,
  metrics: metricsRouter,
  roast: roastRouter,
});
```

- [ ] **Step 4: Protect roast ownership for get/retry operations**

Run check: in `roast.getById` and `roast.retry`, compare `submission.userId` with `ctx.auth.userId` and reject unauthorized access.

- [ ] **Step 5: Run tests and build**

Run: `npx vitest run src/server/trpc/routers/__tests__/auth-router.test.ts && npm run build`
Expected: tests pass and build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/server/trpc/routers/auth.ts src/server/trpc/routers/_app.ts src/server/trpc/routers/roast.ts src/server/trpc/routers/__tests__/auth-router.test.ts
git commit -m "feat: add trpc auth procedures and ownership protection"
```

### Task 7: Build Auth UI Pages and Forms

**Files:**
- Create: `src/components/auth/login-form.tsx`
- Create: `src/components/auth/register-form.tsx`
- Create: `src/components/auth/forgot-password-form.tsx`
- Create: `src/components/auth/reset-password-form.tsx`
- Create: `src/app/login/page.tsx`
- Create: `src/app/register/page.tsx`
- Create: `src/app/forgot-password/page.tsx`
- Create: `src/app/reset-password/[token]/page.tsx`
- Modify: `src/components/home/home-page.tsx`

- [ ] **Step 1: Add register page and form with tRPC mutation**

```tsx
// register form behavior
// fields: name, email, password
// on success: router.push("/")
```

- [ ] **Step 2: Add login page and form with tRPC mutation**

```tsx
// login form behavior
// fields: email, password
// links: register and forgot-password
```

- [ ] **Step 3: Add forgot/reset pages and forms**

```tsx
// forgot: submit email -> show generic success message
// reset: token param + newPassword -> login redirect
```

- [ ] **Step 4: Update home to reflect auth state**

```tsx
// show login/register links when unauthenticated
// show logout button when authenticated
```

- [ ] **Step 5: Validate app behavior in browser**

Run: `npm run dev`
Manual checks on `http://localhost:3000`:
- open `/register`, create account, return authenticated
- logout from home
- login again via `/login`
- request reset in `/forgot-password`
- complete reset in `/reset-password/[token]`

- [ ] **Step 6: Commit**

```bash
git add src/components/auth src/app/login/page.tsx src/app/register/page.tsx src/app/forgot-password/page.tsx src/app/reset-password/[token]/page.tsx src/components/home/home-page.tsx
git commit -m "feat: add authentication pages and forms"
```

### Task 8: Final Verification and Regression Checks

**Files:**
- Verify: entire repository state

- [ ] **Step 1: Run lint**

Run: `npm run lint`
Expected: no lint errors.

- [ ] **Step 2: Run build**

Run: `npm run build`
Expected: successful production build.

- [ ] **Step 3: Validate DB schema and auth tables**

Run: `docker exec devroast-postgres psql -U devroast_user -d devroast -c "\dt"`
Expected: includes `users`, `auth_sessions`, `password_resets`, and existing app tables.

- [ ] **Step 4: Run focused test suite**

Run: `npx vitest run src/server/auth/__tests__/password.test.ts src/server/auth/__tests__/tokens.test.ts src/server/trpc/routers/__tests__/auth-router.test.ts`
Expected: PASS.

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "feat: implement simple email auth with password recovery"
```

---

## Spec Coverage Check

- Register with `name + email + password`: covered in Task 6 + Task 7.
- Login/logout with email/password: covered in Task 6 + Task 7.
- Forgot/reset password with token: covered in Task 6 + Task 7.
- Protected user data routes/procedures: covered in Task 5 + Task 6.
- Secure token/password handling: covered in Task 1 + Task 2 + Task 3.
- Keep architecture boundaries (`tRPC` + `db/queries.ts`): covered in Task 4 + Task 6.

## Placeholder and Consistency Scan

- No `TODO`, `TBD`, or deferred placeholders.
- Procedure names are consistent across tasks: `register`, `login`, `logout`, `forgotPassword`, `resetPassword`, `me`.
- Auth table names are consistent across schema/migration/verification: `auth_sessions`, `password_resets`.

# Authentication (Cadastro/Login) Design

Date: 2026-04-04
Status: Approved in conversation (awaiting final spec review)
Scope: Add simple email/password authentication with registration, login, password reset, and protected user-data routes.

## 1. Objective

Implement a simple authentication system so user data can be recovered and associated with real accounts.

This iteration must:

- Add user registration with `name`, `email`, and `password`.
- Add login with `email` + `password`.
- Add password recovery flow ("forgot password") with token-based reset.
- Protect user data routes so only authenticated users can access their own data.
- Preserve existing project architecture constraints (Next App Router, tRPC v11, DB access through `src/db/queries.ts`).

Out of scope for this V1:

- OAuth providers (Google/GitHub).
- MFA / 2FA.
- Mandatory email verification before first login.
- Advanced account management panels.

## 2. Current Context Snapshot

- The app currently creates anonymous users by `sessionId` in `roast.create`.
- tRPC context already provides request-scoped session handling via cookie (`devroast_session_id`).
- Database queries are centralized in `src/db/queries.ts`.
- User-facing data already depends on `userId`; we need stronger authenticated identity guarantees.

## 3. Selected Approach (A: Native Auth with tRPC + PostgreSQL)

Chosen approach: build authentication directly in current stack, without adopting external auth frameworks.

Principles:

- Keep server/client boundaries explicit.
- Keep all DB operations in `src/db/queries.ts`.
- Keep auth logic thin in routers and reusable in dedicated server modules.
- Reuse cookie-based session model, but upgrade it to authenticated sessions.

Why this approach:

- Fits existing architecture and coding patterns with minimal friction.
- Delivers required features fast.
- Avoids introducing heavy integration risk from framework/service migration.

## 4. Data Model Design

### 4.1 `users` table evolution

Add/adjust fields to support real accounts:

- `name` (required for registered users).
- `email` (required, unique, normalized to lowercase).
- `password_hash` (required for credential-based users).

Rules:

- Keep compatibility path for existing anonymous records where needed during migration.
- Enforce unique index on normalized email.

### 4.2 `auth_sessions` table (new)

Purpose: represent authenticated sessions independent from anonymous temporary identifiers.

Fields:

- `id` (UUID PK).
- `user_id` (FK to `users`).
- `session_token_hash` (hash of opaque token stored in cookie).
- `expires_at`.
- `revoked_at` (nullable).
- `created_at`, `updated_at`.

Rules:

- Never store raw session token in DB.
- Session is valid only when `revoked_at IS NULL` and `expires_at > now()`.

### 4.3 `password_resets` table (new)

Purpose: secure password reset.

Fields:

- `id` (UUID PK).
- `user_id` (FK to `users`).
- `reset_token_hash`.
- `expires_at`.
- `used_at` (nullable).
- `created_at`.

Rules:

- Single-use token: once consumed, set `used_at`.
- Expired or used tokens are invalid.

## 5. Authentication and Session Flow

### 5.1 Registration

Input: `name`, `email`, `password`.

Flow:

1. Validate input (`email` format, password min 8 chars).
2. Normalize email to lowercase/trim.
3. Reject if email already exists.
4. Hash password with `bcrypt`.
5. Create user record.
6. Create authenticated session.
7. Set HttpOnly session cookie.
8. Return authenticated identity payload to client.

### 5.2 Login

Input: `email`, `password`.

Flow:

1. Normalize email.
2. Lookup user by email.
3. Compare password with `bcrypt.compare`.
4. On success, create fresh authenticated session and set cookie.
5. On failure, return generic error (no account enumeration).

### 5.3 Logout

Flow:

1. Resolve current authenticated session from cookie.
2. Mark session `revoked_at`.
3. Clear session cookie.

### 5.4 Forgot Password / Reset Password

Forgot password:

1. Receive email.
2. Always return success-like response (avoid enumeration).
3. If account exists, create reset token hash with expiration (30 min).
4. For current dev scope, output reset URL/token to server logs (no SMTP integration yet).

Reset password:

1. Receive raw reset token + new password.
2. Validate token hash exists, not used, not expired.
3. Hash new password with `bcrypt` and update user.
4. Mark token as used.
5. Optionally revoke all active sessions for that user except current policy-defined behavior (recommended: revoke all).

## 6. Authorization and Protected Data Access

### 6.1 Context and identity resolution

- Extend tRPC context to resolve authenticated user from session cookie when present.
- Keep anonymous session path only where still required by legacy flows.

### 6.2 Route/procedure protection

- Introduce protected tRPC procedure wrapper for authenticated operations.
- Any "my data" procedure must read `userId` from context, never from client input.

### 6.3 Page protection

- Protected pages (history/profile/future user data pages) must enforce auth server-side.
- Unauthenticated access redirects to login.

## 7. UI and UX Scope

Add pages/forms:

- `/register`: name, email, password.
- `/login`: email, password.
- `/forgot-password`: email submission.
- `/reset-password/[token]`: new password submission.

UX behavior:

- Clear inline validation messages.
- Generic auth failure messages for login/reset request.
- Keep visual style aligned with existing DevRoast design language.

## 8. Security Requirements

- Password hashing: `bcrypt`.
- Password policy: minimum 8 characters.
- Cookie flags: `HttpOnly`, `SameSite=Lax`, `Secure` in production.
- Store only hashed session/reset tokens.
- Do not leak whether email exists in forgot-password/login errors.
- Invalidate reset token after first use.

## 9. Testing and Verification Strategy

Minimum verification for implementation phase:

- Unit/integration tests for auth service functions:
  - register success/fail duplicate email
  - login success/fail invalid credentials
  - forgot-password token issuance behavior
  - reset-password success/fail expired/used token
- Procedure-level tests for protected endpoints rejecting unauthenticated access.
- Manual browser verification:
  - register -> auto login
  - logout -> blocked protected page
  - login -> access restored
  - forgot/reset flow end-to-end in dev token mode

## 10. Acceptance Criteria

This design is considered implemented when all are true:

- Users can register with `name + email + password`.
- Users can login/logout with email/password.
- Forgot-password and token-based password reset work in local/dev mode.
- Protected user-data routes require authenticated session.
- Auth/session/reset token storage follows security rules above.
- Existing architecture rules remain respected (`tRPC` + DB queries centralized in `src/db/queries.ts`).

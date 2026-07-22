# Roast Creation Feature Design

Date: 2026-03-29
Status: Approved for planning
Scope: Implement roast creation and asynchronous analysis flow. Exclude share roast.

## 1. Objective

Implement the core product flow where users submit code and receive AI analysis results.

The first version must:

- Support code submission from the homepage.
- Run analysis asynchronously and show progress in the results page.
- Support two modes (`roast` and `honest`) where mode changes only textual tone.
- Use Gemini as the AI provider for analysis generation.
- Allow Gemini model selection by environment variable with a safe default.
- Render an "Essencial+" result payload: score, roast text, technical feedback, improvement list, and submitted code.
- Use anonymous session-based users (no login required).

Out of scope for this iteration:

- Share roast flow (links, social/share UI, or share APIs).
- Worker queue infrastructure (dedicated background worker service).
- Real-time streaming transport (SSE/WebSocket).

## 2. Context Snapshot (Current Codebase)

- Homepage already has a code editor, mode toggle, and submit CTA in `src/components/home-page.tsx`.
- Results route exists at `src/app/results/[roastId]/page.tsx` but currently renders static/mock content.
- Database already models submissions, improvements, analysis sessions, leaderboard, and roast mode in `src/db/schema.ts`.
- Query utilities already support create/update submission and related aggregates in `src/db/queries.ts`.
- API stack standard is tRPC v11 with server routers in `src/server/trpc/routers`.

## 3. High-Level Architecture

Recommended approach: async create + polling in results page.

### 3.1 API Layer (tRPC)

Add a new `roast` router with procedures:

- `roast.create` (mutation)
  - Input: `{ code, language, roastMode }`
  - Behavior: resolve/create anonymous user by session, create submission, trigger async analysis, return `roastId`.
- `roast.getById` (query)
  - Input: `{ roastId }`
  - Behavior: return state-oriented payload for polling UI.
- `roast.retry` (mutation)
  - Input: `{ roastId }`
  - Behavior: re-run analysis for failed submission using same roast ID.

### 3.2 Analysis Orchestration

Use in-process server orchestration for v1:

- Transition state `pending -> analyzing -> completed | failed`.
- Execute AI analysis with Gemini and bounded retries (max 2 retries after initial attempt).
- Persist final outputs in existing tables.
- Update leaderboard only on `completed` submissions.

### 3.3 AI Provider Configuration (Gemini)

Provider decision for v1:

- Provider: Gemini API.
- Model selection strategy: configurable by environment variable.
- Default model: `gemini-2.5-flash`.
- Override model: `GEMINI_MODEL`.

Required environment variables:

- `GEMINI_API_KEY` (required)
- `GEMINI_MODEL` (optional, defaults to `gemini-2.5-flash`)

Behavioral rules:

- Application startup/runtime must fail gracefully (clear error) if `GEMINI_API_KEY` is missing when analysis is requested.
- If `GEMINI_MODEL` is invalid/unavailable, fall back to explicit failure for observability (no silent model switching).
- Persist selected model name in `analysis_sessions.aiModel` for auditing.

### 3.4 Frontend Flow

- Home submits via `roast.create` and redirects to `/results/[roastId]`.
- Results page polls `roast.getById` while status is `pending` or `analyzing`.
- Results page renders status-specific views:
  - analyzing state,
  - completed state (Essencial+ payload),
  - failed state with retry CTA.

## 4. Detailed User Flow

1. User pastes code and chooses mode on homepage.
2. User clicks `roast_my_code`.
3. Client validates input and calls `roast.create`.
4. Server creates submission and starts analysis.
5. Client navigates to `/results/[id]` immediately.
6. Results page polls for submission status.
7. On completion, page renders full analysis payload.
8. On failure after retries, page shows error and retry button.
9. If user clicks retry, backend reprocesses same submission ID and polling resumes.

## 5. Data and State Model

### 5.1 Submission States

- `pending`: record accepted, processing not started.
- `analyzing`: analysis currently running.
- `completed`: analysis persisted successfully.
- `failed`: all attempts exhausted or non-recoverable failure.

### 5.2 Roast Mode Semantics

`roastMode` controls only the roast text tone:

- `roast`: more sarcastic tone.
- `honest`: blunt but constructive tone.

Score evaluation and improvement extraction logic remain equivalent across modes.

### 5.3 Persisted Output (Completed)

- Submission fields:
  - `shameScore`
  - `aiRoast` (mode-dependent tone)
  - `aiFeedback` (technical feedback)
  - `analysisDurationMs`, `analyzedAt`, `status=completed`
- Related rows:
  - `code_improvements` entries from structured analysis output
  - `analysis_sessions` with request/response metadata, selected Gemini model, and success status

## 6. API Contracts

### 6.1 `roast.create`

Input:

```ts
{
  code: string;
  language: string;
  roastMode: "roast" | "honest";
}
```

Output:

```ts
{
  roastId: string;
}
```

Validation rules:

- `code` required and must honor UI/editor max length.
- `language` required.
- `roastMode` required enum.

### 6.2 `roast.getById`

Input:

```ts
{
  roastId: string;
}
```

Output shape:

```ts
{
  status: "pending" | "analyzing" | "completed" | "failed";
  submission: {
    id: string;
    originalCode: string;
    language: string;
    roastMode: "roast" | "honest";
    createdAt: string;
    analyzedAt: string | null;
  };
  result?: {
    shameScore: number;
    roastText: string;
    technicalFeedback: string;
    improvements: Array<{
      title: string;
      description: string | null;
      improvementType:
        | "performance"
        | "readability"
        | "security"
        | "best_practices"
        | "bug_fix"
        | "code_style"
        | "architecture";
      priority: "low" | "medium" | "high" | "critical";
      lineStart: number | null;
      lineEnd: number | null;
    }>;
  };
  error?: {
    message: string;
    canRetry: boolean;
  };
}
```

### 6.3 `roast.retry`

Input:

```ts
{
  roastId: string;
}
```

Output:

```ts
{
  accepted: true;
}
```

Rules:

- Allowed when status is `failed`.
- Reuses same submission ID.
- Clears/overwrites transient analysis state and restarts processing.

## 7. Error Handling and Retry Strategy

Retry policy for analysis execution:

- Initial attempt + up to 2 automatic retries.
- Backoff schedule: 1s then 3s.
- Retry only transient failures (timeout, temporary upstream failure, short-term rate limit).
- Non-transient failures can fail fast.
- Provider-specific failures (invalid API key, invalid model, hard quota errors) are treated as non-transient.

Failure persistence:

- Final state `failed` with clear error message.
- Record failure details in `analysis_sessions` (`success=false`, `errorMessage`).
- Keep enough telemetry for debugging without exposing internals to end users.

Frontend behavior:

- Home: show concise submit error if create call fails.
- Results: show failed state with `tentar novamente` action calling `roast.retry`.

## 8. UI/UX Requirements

### 8.1 Homepage

- Keep existing editor and mode toggle patterns.
- Submit button disabled on known invalid input (e.g., limit exceeded).
- On submit success: immediate navigation to results route.

### 8.2 Results Page

Render per state:

- `pending/analyzing`: progress/loading presentation.
- `completed`: Essencial+ presentation:
  - score hero,
  - roast quote/text,
  - technical feedback section,
  - improvements list,
  - submitted code block.
- `failed`: error block + retry CTA.

### 8.3 Explicit Non-Requirement

- Do not expose share action/UI in this iteration.

## 9. Security and Access Model

- Anonymous user model via session ID cookie.
- API procedures must always resolve to a session-backed user.
- No authentication wall for creating/viewing own roast flow in v1.
- Gemini credentials are server-only and never exposed to client bundles.

## 10. Environment Configuration

- `GEMINI_API_KEY`: required in server environment for analysis operations.
- `GEMINI_MODEL`: optional model override.
  - Default when not set: `gemini-2.5-flash`.
  - Recommended production usage: set explicitly per environment.

## 11. Testing Strategy

### 11.1 Backend

- `roast.create` creates valid submission and returns UUID.
- State transitions are correct through success and failure scenarios.
- Automatic retries execute only for transient failures.
- `roast.getById` contract is consistent per status.
- `roast.retry` reprocesses same submission ID and transitions correctly.
- Selected Gemini model is written to `analysis_sessions.aiModel`.
- Missing/invalid Gemini env config produces deterministic failure behavior.

### 11.2 Frontend

- Home submit triggers mutation and redirect.
- Results polling runs during `pending/analyzing` and stops on terminal states.
- Completed view shows Essencial+ blocks.
- Failed view shows retry CTA and resumes flow after retry.
- Mode toggle value is sent correctly to backend.

### 11.3 Integration Acceptance Criteria

- User can submit code and get a completed roast end-to-end.
- Roast mode changes only roast text tone.
- Leaderboard update happens only on completed analysis.
- No share roast functionality is visible or callable.
- Gemini is the active provider and model follows `GEMINI_MODEL` or default fallback.

## 12. Rollout and Boundaries

- This spec is intentionally scoped to a single implementation cycle.
- Queue workers, streaming updates, and sharing can be defined in follow-up specs.
- Refactors outside roast creation path are out of scope unless needed to complete this flow safely.

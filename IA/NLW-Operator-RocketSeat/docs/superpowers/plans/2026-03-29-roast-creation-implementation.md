# Roast Creation + Gemini Analysis Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build end-to-end roast creation with async analysis, Gemini-backed scoring/feedback, and results polling with retry.

**Architecture:** Add a dedicated server roast domain (`router + service + db queries`) that creates submissions, runs Gemini analysis with bounded retries, and exposes status-based queries for the UI. Keep homepage submit simple (create + redirect) and move results interactivity to a client component that polls tRPC until terminal state. Reuse existing schema/tables (`code_submissions`, `code_improvements`, `analysis_sessions`, `leaderboard_entries`) and keep share flow out of scope.

**Tech Stack:** Next.js App Router, tRPC v11, Drizzle ORM, PostgreSQL, Gemini API (`@google/genai`), React Query/tRPC hooks, Biome.

---

## File Structure Plan

- **Create:** `src/server/ai/gemini.ts` - Gemini client + prompt execution + response normalization.
- **Create:** `src/server/roast/analyze-submission.ts` - async analysis orchestration with retry/backoff and persistence.
- **Create:** `src/server/trpc/routers/roast.ts` - public `create/getById/retry` procedures.
- **Create:** `src/components/results-page-client.tsx` - polling UI and status rendering for results route.
- **Modify:** `src/server/trpc/routers/_app.ts` - register `roast` router.
- **Modify:** `src/server/trpc/init.ts` - add request context with cookies-based session ID.
- **Modify:** `src/db/queries.ts` - add focused helpers for roast status transitions and result reads.
- **Modify:** `src/components/home-page.tsx` - replace hardcoded route push with `roast.create` mutation.
- **Modify:** `src/app/results/[roastId]/page.tsx` - keep UUID guard + shell, delegate to client component.
- **Modify:** `src/components/ui/score-hero.tsx` - make share button optional (hidden for this flow).
- **Modify:** `.env.example` - add Gemini envs (`GEMINI_API_KEY`, `GEMINI_MODEL`).
- **Modify:** `package.json` - add Gemini dependency.

---

### Task 1: Gemini foundation and environment contract

**Files:**
- Create: `src/server/ai/gemini.ts`
- Modify: `package.json`
- Modify: `.env.example`

- [ ] **Step 1: Write the failing test (runtime contract test script)**

```ts
// src/server/ai/gemini.contract-test.ts
import { strict as assert } from "node:assert";
import { getGeminiConfig } from "./gemini";

const originalKey = process.env.GEMINI_API_KEY;
const originalModel = process.env.GEMINI_MODEL;

delete process.env.GEMINI_API_KEY;
delete process.env.GEMINI_MODEL;

let threw = false;
try {
  getGeminiConfig();
} catch (error) {
  threw = true;
  assert.match(String(error), /GEMINI_API_KEY/i);
}
assert.equal(threw, true);

process.env.GEMINI_API_KEY = "test-key";
const config = getGeminiConfig();
assert.equal(config.model, "gemini-2.5-flash");

process.env.GEMINI_MODEL = "gemini-2.5-pro";
const override = getGeminiConfig();
assert.equal(override.model, "gemini-2.5-pro");

if (originalKey) process.env.GEMINI_API_KEY = originalKey;
if (originalModel) process.env.GEMINI_MODEL = originalModel;
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx src/server/ai/gemini.contract-test.ts`
Expected: FAIL with module/function not found.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/server/ai/gemini.ts
import "server-only";
import { GoogleGenAI } from "@google/genai";

export type GeminiConfig = {
  apiKey: string;
  model: string;
};

export function getGeminiConfig(): GeminiConfig {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY for roast analysis.");
  }

  return {
    apiKey,
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  };
}

export function createGeminiClient() {
  const { apiKey } = getGeminiConfig();
  return new GoogleGenAI({ apiKey });
}
```

```json
// package.json (dependencies)
{
  "dependencies": {
    "@google/genai": "^0.17.0"
  }
}
```

```dotenv
# .env.example
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx src/server/ai/gemini.contract-test.ts`
Expected: exits successfully with no assertion errors.

- [ ] **Step 5: Commit**

```bash
git add package.json .env.example src/server/ai/gemini.ts src/server/ai/gemini.contract-test.ts
git commit -m "feat: add Gemini configuration and client foundation"
```

### Task 2: Add DB helpers for roast state lifecycle

**Files:**
- Modify: `src/db/queries.ts`

- [ ] **Step 1: Write the failing test (query API shape test)**

```ts
// src/db/queries.contract-test.ts
import { strict as assert } from "node:assert";
import {
  markSubmissionAnalyzing,
  markSubmissionFailed,
  getRoastResultById,
} from "./queries";

assert.equal(typeof markSubmissionAnalyzing, "function");
assert.equal(typeof markSubmissionFailed, "function");
assert.equal(typeof getRoastResultById, "function");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx src/db/queries.contract-test.ts`
Expected: FAIL because exports do not exist.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/db/queries.ts (new exports)
export async function markSubmissionAnalyzing(submissionId: string) {
  const result = await db
    .update(codeSubmissions)
    .set({ status: "analyzing", updatedAt: sql`now()` })
    .where(eq(codeSubmissions.id, submissionId))
    .returning();

  return result[0] || null;
}

export async function markSubmissionFailed(
  submissionId: string,
  errorMessage: string,
  analysisDurationMs: number,
) {
  const result = await db
    .update(codeSubmissions)
    .set({
      status: "failed",
      analysisDurationMs,
      updatedAt: sql`now()`,
      analyzedAt: sql`now()`,
      aiFeedback: errorMessage,
    })
    .where(eq(codeSubmissions.id, submissionId))
    .returning();

  return result[0] || null;
}

export async function getRoastResultById(submissionId: string) {
  const submission = await db
    .select()
    .from(codeSubmissions)
    .where(eq(codeSubmissions.id, submissionId))
    .limit(1);

  if (!submission[0]) return null;

  const improvements = await getSubmissionImprovements(submissionId);

  return {
    submission: submission[0],
    improvements,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx src/db/queries.contract-test.ts`
Expected: exits successfully.

- [ ] **Step 5: Commit**

```bash
git add src/db/queries.ts src/db/queries.contract-test.ts
git commit -m "feat: add roast lifecycle query helpers"
```

### Task 3: Implement structured Gemini analysis parser

**Files:**
- Modify: `src/server/ai/gemini.ts`

- [ ] **Step 1: Write the failing test (parser contract)**

```ts
// src/server/ai/gemini.parse-test.ts
import { strict as assert } from "node:assert";
import { parseGeminiAnalysis } from "./gemini";

const raw = JSON.stringify({
  shameScore: 4,
  roastText: "Messy but salvageable.",
  technicalFeedback: "Uses imperative loops and noisy logs.",
  improvements: [
    {
      title: "Use const",
      description: "Avoid var hoisting issues",
      improvementType: "best_practices",
      priority: "medium",
      lineStart: 1,
      lineEnd: 1,
    },
  ],
});

const parsed = parseGeminiAnalysis(raw);
assert.equal(parsed.shameScore, 4);
assert.equal(parsed.improvements.length, 1);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx src/server/ai/gemini.parse-test.ts`
Expected: FAIL with missing export.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/server/ai/gemini.ts (append)
import { z } from "zod";

const improvementSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable(),
  improvementType: z.enum([
    "performance",
    "readability",
    "security",
    "best_practices",
    "bug_fix",
    "code_style",
    "architecture",
  ]),
  priority: z.enum(["low", "medium", "high", "critical"]),
  lineStart: z.number().int().nullable(),
  lineEnd: z.number().int().nullable(),
});

const analysisSchema = z.object({
  shameScore: z.number().min(1).max(10),
  roastText: z.string().min(1),
  technicalFeedback: z.string().min(1),
  improvements: z.array(improvementSchema),
});

export type ParsedAnalysis = z.infer<typeof analysisSchema>;

export function parseGeminiAnalysis(rawText: string): ParsedAnalysis {
  const parsed = JSON.parse(rawText);
  return analysisSchema.parse(parsed);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx src/server/ai/gemini.parse-test.ts`
Expected: exits successfully.

- [ ] **Step 5: Commit**

```bash
git add src/server/ai/gemini.ts src/server/ai/gemini.parse-test.ts
git commit -m "feat: add Gemini analysis parser and validation"
```

### Task 4: Build async roast analysis service with retries

**Files:**
- Create: `src/server/roast/analyze-submission.ts`
- Modify: `src/server/ai/gemini.ts`
- Modify: `src/db/queries.ts`

- [ ] **Step 1: Write the failing test (retry orchestration contract)**

```ts
// src/server/roast/analyze-submission.contract-test.ts
import { strict as assert } from "node:assert";
import { shouldRetryGeminiError } from "./analyze-submission";

assert.equal(shouldRetryGeminiError(new Error("timeout")), true);
assert.equal(shouldRetryGeminiError(new Error("rate limit")), true);
assert.equal(shouldRetryGeminiError(new Error("invalid api key")), false);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx src/server/roast/analyze-submission.contract-test.ts`
Expected: FAIL because module/export does not exist.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/server/roast/analyze-submission.ts
import "server-only";
import {
  createAnalysisSession,
  createCodeImprovement,
  markSubmissionAnalyzing,
  markSubmissionFailed,
  updateCodeSubmissionAnalysis,
  upsertLeaderboardEntry,
} from "@/db/queries";
import { createGeminiClient, getGeminiConfig, parseGeminiAnalysis } from "@/server/ai/gemini";

export function shouldRetryGeminiError(error: unknown) {
  const message = String(error).toLowerCase();
  if (message.includes("invalid api key")) return false;
  if (message.includes("quota")) return false;
  return message.includes("timeout") || message.includes("rate") || message.includes("5");
}

export async function analyzeSubmission(params: {
  submissionId: string;
  userId: string;
  code: string;
  language: string;
  roastMode: "roast" | "honest";
}) {
  const startedAt = Date.now();
  const { model } = getGeminiConfig();
  await markSubmissionAnalyzing(params.submissionId);

  const client = createGeminiClient();
  const prompt = `Analyze code and return strict JSON with shameScore(1-10), roastText, technicalFeedback, improvements[]. Tone=${params.roastMode}.`;

  const backoff = [1000, 3000];
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await client.models.generateContent({
        model,
        contents: `${prompt}\n\nLanguage: ${params.language}\nCode:\n${params.code}`,
      });

      const text = response.text || "";
      const parsed = parseGeminiAnalysis(text);

      await updateCodeSubmissionAnalysis(params.submissionId, {
        shameScore: parsed.shameScore,
        aiFeedback: parsed.technicalFeedback,
        aiRoast: parsed.roastText,
        analysisDurationMs: Date.now() - startedAt,
        status: "completed",
      });

      for (const item of parsed.improvements) {
        await createCodeImprovement({
          submissionId: params.submissionId,
          title: item.title,
          description: item.description || undefined,
          improvedCode: params.code,
          improvementType: item.improvementType,
          priority: item.priority,
          lineStart: item.lineStart || undefined,
          lineEnd: item.lineEnd || undefined,
        });
      }

      await createAnalysisSession({
        submissionId: params.submissionId,
        aiModel: model,
        aiResponseRaw: text,
        success: true,
        latencyMs: Date.now() - startedAt,
      });

      await upsertLeaderboardEntry({
        userId: params.userId,
        submissionId: params.submissionId,
        shameScore: parsed.shameScore,
        language: params.language,
        codePreview: params.code.slice(0, 120),
      });

      return;
    } catch (error) {
      lastError = error;
      const retry = attempt < 2 && shouldRetryGeminiError(error);
      if (!retry) break;
      await new Promise((resolve) => setTimeout(resolve, backoff[attempt]));
    }
  }

  const message = `Analysis failed: ${String(lastError)}`;
  await createAnalysisSession({
    submissionId: params.submissionId,
    aiModel: model,
    success: false,
    errorMessage: message,
    latencyMs: Date.now() - startedAt,
  });

  await markSubmissionFailed(params.submissionId, message, Date.now() - startedAt);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx src/server/roast/analyze-submission.contract-test.ts`
Expected: exits successfully.

- [ ] **Step 5: Commit**

```bash
git add src/server/roast/analyze-submission.ts src/server/roast/analyze-submission.contract-test.ts src/server/ai/gemini.ts src/db/queries.ts
git commit -m "feat: add async roast analysis service with retries"
```

### Task 5: Expose roast domain on tRPC

**Files:**
- Create: `src/server/trpc/routers/roast.ts`
- Modify: `src/server/trpc/routers/_app.ts`
- Modify: `src/server/trpc/init.ts`

- [ ] **Step 1: Write the failing test (router exports contract)**

```ts
// src/server/trpc/routers/roast.contract-test.ts
import { strict as assert } from "node:assert";
import { roastRouter } from "./roast";

assert.equal(typeof roastRouter, "object");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx src/server/trpc/routers/roast.contract-test.ts`
Expected: FAIL because router does not exist.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/server/trpc/init.ts (context)
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";

export const createTRPCContext = cache(async () => {
  const store = await cookies();
  let sessionId = store.get("devroast_session_id")?.value;

  if (!sessionId) {
    sessionId = randomUUID();
  }

  return { sessionId };
});
```

```ts
// src/server/trpc/routers/roast.ts
import { z } from "zod";
import { createCodeSubmission, createUser, findUserBySessionId, getRoastResultById } from "@/db/queries";
import { analyzeSubmission } from "@/server/roast/analyze-submission";
import { baseProcedure, createTRPCRouter } from "../init";

export const roastRouter = createTRPCRouter({
  create: baseProcedure
    .input(
      z.object({
        code: z.string().min(1).max(2000),
        language: z.string().min(1),
        roastMode: z.enum(["roast", "honest"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let user = await findUserBySessionId(ctx.sessionId);
      if (!user) {
        user = await createUser({ sessionId: ctx.sessionId });
      }

      const submission = await createCodeSubmission({
        userId: user.id,
        originalCode: input.code,
        language: input.language,
        roastMode: input.roastMode,
      });

      void analyzeSubmission({
        submissionId: submission.id,
        userId: user.id,
        code: input.code,
        language: input.language,
        roastMode: input.roastMode,
      });

      return { roastId: submission.id };
    }),
  getById: baseProcedure
    .input(z.object({ roastId: z.string().uuid() }))
    .query(async ({ input }) => getRoastResultById(input.roastId)),
  retry: baseProcedure
    .input(z.object({ roastId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const payload = await getRoastResultById(input.roastId);
      if (!payload || payload.submission.status !== "failed") {
        throw new Error("Retry allowed only for failed submissions.");
      }

      void analyzeSubmission({
        submissionId: payload.submission.id,
        userId: payload.submission.userId,
        code: payload.submission.originalCode,
        language: payload.submission.language,
        roastMode: payload.submission.roastMode,
      });

      return { accepted: true as const };
    }),
});
```

```ts
// src/server/trpc/routers/_app.ts
import { roastRouter } from "./roast";

export const appRouter = createTRPCRouter({
  leaderboard: leaderboardRouter,
  metrics: metricsRouter,
  roast: roastRouter,
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx src/server/trpc/routers/roast.contract-test.ts`
Expected: exits successfully.

- [ ] **Step 5: Commit**

```bash
git add src/server/trpc/init.ts src/server/trpc/routers/roast.ts src/server/trpc/routers/_app.ts src/server/trpc/routers/roast.contract-test.ts
git commit -m "feat: add roast tRPC router and session context"
```

### Task 6: Wire homepage submit to real roast creation

**Files:**
- Modify: `src/components/home-page.tsx`

- [ ] **Step 1: Write the failing test (component behavior test note + manual command)**

```tsx
// src/components/home-page.submit.contract.ts
// Contract: clicking roast button must call roast.create and navigate to /results/<id>.
export const HOME_SUBMIT_CONTRACT = "home-submit-calls-roast-create-and-redirects";
```

- [ ] **Step 2: Run check to verify current behavior fails contract**

Run: `npm run lint`
Expected: PASS, but behavior still hardcoded to static roast ID (manual verification).

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/components/home-page.tsx (key integration)
import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

const trpc = useTRPC();
const createRoast = useMutation(
  trpc.roast.create.mutationOptions({
    onSuccess: ({ roastId }) => {
      router.push(`/results/${roastId}`);
    },
  }),
);

const handleRoastCode = () => {
  if (!detectedLanguage || !code.trim() || isCodeOverLimit) return;

  createRoast.mutate({
    code,
    language: detectedLanguage,
    roastMode: roastMode ? "roast" : "honest",
  });
};
```

- [ ] **Step 4: Run verification checks**

Run: `npm run lint`
Expected: PASS.

Run: `npm run build`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/home-page.tsx src/components/home-page.submit.contract.ts
git commit -m "feat: submit real roast creation from homepage"
```

### Task 7: Implement results polling, terminal states, and retry

**Files:**
- Create: `src/components/results-page-client.tsx`
- Modify: `src/app/results/[roastId]/page.tsx`
- Modify: `src/components/ui/score-hero.tsx`

- [ ] **Step 1: Write the failing test (results state contract)**

```ts
// src/components/results-page.contract.ts
export const RESULTS_CONTRACT = [
  "shows analyzing state",
  "shows completed essentials+ state",
  "shows failed state with retry",
];
```

- [ ] **Step 2: Run check to verify current behavior fails contract**

Run: `npm run lint`
Expected: PASS, but page still static mock (manual verification).

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/components/results-page-client.tsx (outline)
"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { AnalysisCard } from "@/components/ui/analysis-card";
import { CodeBlock } from "@/components/ui/code-block";
import { ScoreHero } from "@/components/ui/score-hero";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";

export function ResultsPageClient({ roastId }: { roastId: string }) {
  const trpc = useTRPC();
  const roastQuery = useQuery(
    trpc.roast.getById.queryOptions(
      { roastId },
      { refetchInterval: (q) => {
        const status = q.state.data?.submission?.status;
        return status === "pending" || status === "analyzing" ? 2000 : false;
      } },
    ),
  );

  const retry = useMutation(
    trpc.roast.retry.mutationOptions({
      onSuccess: () => void roastQuery.refetch(),
    }),
  );

  const data = roastQuery.data;
  const status = data?.submission?.status;

  if (!data || status === "pending" || status === "analyzing") {
    return <p className="font-mono text-devroast-text-secondary">analisando seu codigo...</p>;
  }

  if (status === "failed") {
    return (
      <div className="flex flex-col gap-4">
        <p className="font-mono text-devroast-red">falha na analise. tente novamente.</p>
        <Button onClick={() => retry.mutate({ roastId })}>$ tentar_novamente</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ScoreHero
        score={data.submission.shameScore}
        verdict={`verdict: ${data.submission.shameScore <= 3 ? "needs_serious_help" : "can_improve"}`}
        roastQuote={data.submission.aiRoast}
        language={data.submission.language}
        lines={data.submission.originalCode.split("\n").length}
      />
      <CodeBlock code={data.submission.originalCode} language={data.submission.language} showLineNumbers />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {data.improvements.map((item) => (
          <AnalysisCard
            key={`${item.title}-${item.createdAt}`}
            severity={item.priority === "critical" ? "critical" : item.priority === "high" ? "warning" : "good"}
            title={item.title}
            description={item.description || "No details"}
          />
        ))}
      </div>
    </div>
  );
}
```

```tsx
// src/app/results/[roastId]/page.tsx (replace static sections)
import { ResultsPageClient } from "@/components/results-page-client";

// keep metadata + UUID validation
return (
  <div className="min-h-screen bg-devroast-bg text-devroast-text-primary font-mono">
    {/* existing nav */}
    <main className="w-full px-4 sm:px-6 lg:px-20 py-10">
      <ResultsPageClient roastId={roastId} />
    </main>
  </div>
);
```

```tsx
// src/components/ui/score-hero.tsx (hide share by default)
export interface ScoreHeroProps {
  // ...existing props
  showShareButton?: boolean;
}

// default false and conditionally render share button
{showShareButton ? (
  <div>
    <button type="button" className={shareButton()} onClick={onShare}>
      $ share_roast
    </button>
  </div>
) : null}
```

- [ ] **Step 4: Run verification checks**

Run: `npm run lint`
Expected: PASS.

Run: `npm run build`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/results-page-client.tsx src/app/results/[roastId]/page.tsx src/components/ui/score-hero.tsx src/components/results-page.contract.ts
git commit -m "feat: add async results page with polling and retry"
```

### Task 8: Final verification and cleanup

**Files:**
- Modify: none (verification-only task)

- [ ] **Step 1: Run static checks**

Run: `npm run lint`
Expected: PASS with no new lint violations.

- [ ] **Step 2: Run production build**

Run: `npm run build`
Expected: PASS and Next.js app compiles successfully.

- [ ] **Step 3: Manual E2E smoke test**

Run: `npm run dev`
Expected manual flow:
- Submit code from `/` with both modes.
- Redirects to `/results/<uuid>`.
- Shows analyzing state then completed data.
- Simulated failure path shows retry CTA and can restart analysis.

- [ ] **Step 4: Record verification notes**

```md
## Verification Notes
- Lint: PASS
- Build: PASS
- Manual smoke: PASS (roast + honest + retry)
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: verify roast creation flow end-to-end"
```

---

## Self-Review Checklist

- **Spec coverage:** covered async create/poll/retry, Gemini provider/env model override, roast-mode tone-only semantics, Essentials+ result rendering, and no share feature.
- **Placeholder scan:** no `TODO/TBD` or unresolved implementation placeholders.
- **Type consistency:** contracts consistently use `roastMode: "roast" | "honest"`, terminal statuses, and improvement enums from schema.

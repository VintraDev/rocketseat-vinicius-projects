import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createCodeSubmission,
  createUser,
  deleteSubmissionImprovements,
  findUserBySessionId,
  getCodeSubmissionById,
  getLatestSubmissionCheckpoint,
  getRoastResultById,
  resetCodeSubmissionForRetry,
} from "@/db/queries";
import { analyzeSubmission } from "@/server/roast/analyze-submission";
import { baseProcedure, createTRPCRouter } from "../init";

const roastModeSchema = z.enum(["roast", "honest"]);

const roastImprovementSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  improvedCode: z.string(),
  diffPatch: z.string().nullable(),
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
  createdAt: z.date(),
});

const roastSubmissionSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "analyzing", "completed", "failed"]),
  originalCode: z.string(),
  language: z.string(),
  roastMode: roastModeSchema,
  shameScore: z.number().int().min(1).max(10).nullable(),
  aiFeedback: z.string().nullable(),
  aiRoast: z.string().nullable(),
  analysisDurationMs: z.number().int().nullable(),
  createdAt: z.date(),
  analyzedAt: z.date().nullable(),
  updatedAt: z.date(),
});

const roastGetByIdOutputSchema = z.object({
  submission: roastSubmissionSchema,
  improvements: z.array(roastImprovementSchema),
  progress: z
    .object({
      value: z.number().int().min(0).max(100),
      stage: z.string(),
      details: z.string().nullable(),
    })
    .nullable(),
  error: z
    .object({
      message: z.string(),
      canRetry: z.boolean(),
    })
    .nullable(),
});

export const roastRouter = createTRPCRouter({
  create: baseProcedure
    .input(
      z.object({
        code: z.string().trim().min(1).max(2000),
        language: z.string().trim().min(1).max(50),
        roastMode: roastModeSchema,
      }),
    )
    .output(
      z.object({
        roastId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let user = await findUserBySessionId(ctx.sessionId);

      if (!user) {
        user = await createUser({
          sessionId: ctx.sessionId,
        });
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

      return {
        roastId: submission.id,
      };
    }),

  getById: baseProcedure
    .input(
      z.object({
        roastId: z.string().uuid(),
      }),
    )
    .output(roastGetByIdOutputSchema)
    .query(async ({ input }) => {
      const payload = await getRoastResultById(input.roastId);

      if (!payload) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Roast not found.",
        });
      }

      const error =
        payload.submission.status === "failed"
          ? {
              message:
                payload.submission.aiFeedback ||
                "Analysis failed after retries.",
              canRetry: true,
            }
          : null;

      const checkpoint = await getLatestSubmissionCheckpoint(input.roastId);
      const checkpointMessage = checkpoint?.promptTemplate || "";
      const checkpointStageMatch = checkpointMessage.match(/^\[(.*?)\]/);

      const progress = checkpoint
        ? {
            value: Math.max(0, Math.min(100, checkpoint.tokensUsed || 0)),
            stage: checkpointStageMatch?.[1] || "processing",
            details: checkpointMessage || null,
          }
        : payload.submission.status === "completed" ||
            payload.submission.status === "failed"
          ? {
              value: 100,
              stage: payload.submission.status,
              details: null,
            }
          : {
              value: 12,
              stage: "queued",
              details: null,
            };

      return {
        submission: payload.submission,
        improvements: payload.improvements,
        progress,
        error,
      };
    }),

  retry: baseProcedure
    .input(
      z.object({
        roastId: z.string().uuid(),
      }),
    )
    .output(
      z.object({
        accepted: z.literal(true),
      }),
    )
    .mutation(async ({ input }) => {
      const submission = await getCodeSubmissionById(input.roastId);

      if (!submission) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Roast not found.",
        });
      }

      if (submission.status !== "failed") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Retry is allowed only when analysis has failed.",
        });
      }

      await resetCodeSubmissionForRetry(submission.id);
      await deleteSubmissionImprovements(submission.id);

      void analyzeSubmission({
        submissionId: submission.id,
        userId: submission.userId,
        code: submission.originalCode,
        language: submission.language,
        roastMode: submission.roastMode,
      });

      return {
        accepted: true,
      };
    }),
});

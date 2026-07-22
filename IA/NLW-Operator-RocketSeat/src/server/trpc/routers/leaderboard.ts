import { z } from "zod";
import { getFullLeaderboard, getHomepageLeaderboard } from "@/db/queries";
import { baseProcedure, createTRPCRouter } from "../init";

const FULL_LEADERBOARD_LIMIT = 20;

const fullLeaderboardInputSchema = z
  .object({
    limit: z.number().int().positive().max(100).default(FULL_LEADERBOARD_LIMIT),
  })
  .optional();

const leaderboardEntrySchema = z.object({
  rank: z.number().int().positive(),
  score: z.number().int().min(1).max(10),
  code: z.string(),
  fullCode: z.string(),
  language: z.string(),
});

export const leaderboardRouter = createTRPCRouter({
  homepage: baseProcedure
    .output(
      z.object({
        entries: z.array(leaderboardEntrySchema),
        stats: z.object({
          totalCodes: z.number().int().nonnegative(),
          totalRoasts: z.number().int().nonnegative(),
        }),
      }),
    )
    .query(async () => {
      return getHomepageLeaderboard();
    }),
  full: baseProcedure
    .input(fullLeaderboardInputSchema)
    .output(
      z.object({
        entries: z.array(leaderboardEntrySchema),
        stats: z.object({
          totalCodes: z.number().int().nonnegative(),
          avgScore: z.number().min(0).max(10),
        }),
      }),
    )
    .query(async ({ input }) => {
      const limit = input?.limit ?? FULL_LEADERBOARD_LIMIT;
      return getFullLeaderboard(limit);
    }),
});

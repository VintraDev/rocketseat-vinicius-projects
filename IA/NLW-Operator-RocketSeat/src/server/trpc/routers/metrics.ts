import { z } from "zod";
import { getHomepageMetrics } from "@/db/queries";
import { baseProcedure, createTRPCRouter } from "../init";

export const metricsRouter = createTRPCRouter({
  homepage: baseProcedure
    .output(
      z.object({
        totalRoastedCodes: z.number().int().nonnegative(),
        avgScore: z.number().min(0).max(10),
      }),
    )
    .query(async () => {
      return getHomepageMetrics();
    }),
});

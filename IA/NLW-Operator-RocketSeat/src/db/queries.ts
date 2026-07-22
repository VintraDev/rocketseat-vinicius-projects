/**
 * Database query utilities
 * Following the spec: NO Drizzle relations - use raw SQL queries with joins instead
 */

import { desc, eq, sql } from "drizzle-orm";
import { db } from "./config";
import {
  analysisSessions,
  codeImprovements,
  codeSubmissions,
  leaderboardEntries,
  users,
} from "./schema";

// ===================================
// USER QUERIES
// ===================================

/**
 * Find user by session ID
 */
export async function findUserBySessionId(sessionId: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.sessionId, sessionId))
    .limit(1);

  return result[0] || null;
}

/**
 * Create a new user
 */
export async function createUser(userData: {
  sessionId: string;
  username?: string;
  email?: string;
  avatarUrl?: string;
}) {
  const result = await db.insert(users).values(userData).returning();

  return result[0];
}

/**
 * Update user information
 */
export async function updateUser(
  userId: string,
  updates: {
    username?: string;
    email?: string;
    avatarUrl?: string;
  },
) {
  const result = await db
    .update(users)
    .set({ ...updates, updatedAt: sql`now()` })
    .where(eq(users.id, userId))
    .returning();

  return result[0] || null;
}

// ===================================
// CODE SUBMISSION QUERIES
// ===================================

/**
 * Create a new code submission
 */
export async function createCodeSubmission(submissionData: {
  userId: string;
  originalCode: string;
  language: string;
  roastMode?: "roast" | "honest";
}) {
  const result = await db
    .insert(codeSubmissions)
    .values({
      ...submissionData,
      roastMode: submissionData.roastMode || "honest",
    })
    .returning();

  return result[0];
}

export async function getCodeSubmissionById(submissionId: string) {
  const result = await db
    .select()
    .from(codeSubmissions)
    .where(eq(codeSubmissions.id, submissionId))
    .limit(1);

  return result[0] || null;
}

export async function markCodeSubmissionAnalyzing(submissionId: string) {
  const result = await db
    .update(codeSubmissions)
    .set({
      status: "analyzing",
      updatedAt: sql`now()`,
    })
    .where(eq(codeSubmissions.id, submissionId))
    .returning();

  return result[0] || null;
}

export async function resetCodeSubmissionForRetry(submissionId: string) {
  const result = await db
    .update(codeSubmissions)
    .set({
      status: "pending",
      shameScore: null,
      aiFeedback: null,
      aiRoast: null,
      analysisDurationMs: null,
      analyzedAt: null,
      updatedAt: sql`now()`,
    })
    .where(eq(codeSubmissions.id, submissionId))
    .returning();

  return result[0] || null;
}

/**
 * Update code submission after analysis
 */
export async function updateCodeSubmissionAnalysis(
  submissionId: string,
  analysisData: {
    shameScore: number;
    aiFeedback: string;
    aiRoast: string;
    analysisDurationMs: number;
    status: "completed" | "failed";
  },
) {
  const result = await db
    .update(codeSubmissions)
    .set({
      ...analysisData,
      analyzedAt: sql`now()`,
      updatedAt: sql`now()`,
    })
    .where(eq(codeSubmissions.id, submissionId))
    .returning();

  return result[0] || null;
}

export async function markCodeSubmissionFailed(
  submissionId: string,
  failureData: {
    errorMessage: string;
    analysisDurationMs: number;
  },
) {
  const result = await db
    .update(codeSubmissions)
    .set({
      status: "failed",
      aiFeedback: failureData.errorMessage,
      analysisDurationMs: failureData.analysisDurationMs,
      analyzedAt: sql`now()`,
      updatedAt: sql`now()`,
    })
    .where(eq(codeSubmissions.id, submissionId))
    .returning();

  return result[0] || null;
}

/**
 * Get submission with user details (using raw SQL join)
 */
export async function getSubmissionWithUser(submissionId: string) {
  const result = await db.execute(sql`
    SELECT 
      s.*,
      u.username,
      u.email,
      u.avatar_url as avatarUrl
    FROM code_submissions s
    INNER JOIN users u ON s.user_id = u.id
    WHERE s.id = ${submissionId}
  `);

  return result.rows[0] || null;
}

/**
 * Get user's recent submissions
 */
export async function getUserSubmissions(userId: string, limit = 10) {
  const result = await db
    .select()
    .from(codeSubmissions)
    .where(eq(codeSubmissions.userId, userId))
    .orderBy(desc(codeSubmissions.createdAt))
    .limit(limit);

  return result;
}

// ===================================
// LEADERBOARD QUERIES
// ===================================

/**
 * Get global leaderboard (using raw SQL for complex aggregation)
 */
export async function getGlobalLeaderboard(limit = 20) {
  const result = await db.execute(sql`
    SELECT 
      l.user_id,
      u.username,
      l.language,
      l.shame_score,
      l.code_preview,
      l.total_submissions,
      l.average_score,
      l.created_at,
      ROW_NUMBER() OVER (ORDER BY l.shame_score ASC, l.created_at ASC) as rank_position
    FROM leaderboard_entries l
    INNER JOIN users u ON l.user_id = u.id
    ORDER BY l.shame_score ASC, l.created_at ASC
    LIMIT ${limit}
  `);

  return result.rows;
}

/**
 * Get leaderboard by programming language
 */
export async function getLanguageLeaderboard(language: string, limit = 20) {
  const result = await db.execute(sql`
    SELECT 
      l.user_id,
      u.username,
      l.language,
      l.shame_score,
      l.code_preview,
      l.total_submissions,
      l.average_score,
      l.created_at,
      ROW_NUMBER() OVER (ORDER BY l.shame_score ASC, l.created_at ASC) as rank_position
    FROM leaderboard_entries l
    INNER JOIN users u ON l.user_id = u.id
    WHERE l.language = ${language}
    ORDER BY l.shame_score ASC, l.created_at ASC
    LIMIT ${limit}
  `);

  return result.rows;
}

/**
 * Create or update leaderboard entry
 */
export async function upsertLeaderboardEntry(entryData: {
  userId: string;
  submissionId: string;
  shameScore: number;
  language: string;
  codePreview?: string;
}) {
  // Calculate user's statistics
  const userStats = await db.execute(sql`
    SELECT 
      COUNT(*)::int as total_submissions,
      AVG(shame_score)::numeric(3,2) as average_score
    FROM code_submissions
    WHERE user_id = ${entryData.userId} AND status = 'completed'
  `);

  const stats = userStats.rows[0] as {
    total_submissions: number;
    average_score: string;
  };

  const result = await db
    .insert(leaderboardEntries)
    .values({
      userId: entryData.userId,
      submissionId: entryData.submissionId,
      shameScore: entryData.shameScore,
      language: entryData.language,
      codePreview: entryData.codePreview,
      totalSubmissions: stats.total_submissions,
      averageScore: stats.average_score,
    })
    .onConflictDoUpdate({
      target: [leaderboardEntries.userId, leaderboardEntries.submissionId],
      set: {
        shameScore: entryData.shameScore,
        language: entryData.language,
        codePreview: entryData.codePreview,
        totalSubmissions: stats.total_submissions,
        averageScore: stats.average_score,
        updatedAt: sql`now()`,
      },
    })
    .returning();

  return result[0];
}

/**
 * Get user's rank position
 */
export async function getUserRank(userId: string) {
  const result = await db.execute(sql`
    WITH ranked_users AS (
      SELECT 
        user_id,
        ROW_NUMBER() OVER (ORDER BY MIN(shame_score) ASC) as rank_position
      FROM leaderboard_entries
      GROUP BY user_id
    )
    SELECT rank_position
    FROM ranked_users
    WHERE user_id = ${userId}
  `);

  return result.rows[0]?.rank_position || null;
}

// ===================================
// ANALYSIS SESSION QUERIES
// ===================================

/**
 * Create analysis session record
 */
export async function createAnalysisSession(sessionData: {
  submissionId: string;
  aiModel?: string;
  promptTemplate?: string;
  aiResponseRaw?: string;
  tokensUsed?: number;
  costUsd?: string; // decimal type expects string
  latencyMs?: number;
  success?: boolean;
  errorMessage?: string;
}) {
  const result = await db
    .insert(analysisSessions)
    .values(sessionData)
    .returning();

  return result[0];
}

export async function createCodeSubmissionCheckpoint(
  submissionId: string,
  checkpoint: {
    stage: string;
    progress: number;
    details?: string;
  },
) {
  const safeProgress = Math.max(
    0,
    Math.min(100, Math.trunc(checkpoint.progress)),
  );

  const message = checkpoint.details
    ? `[${checkpoint.stage}] ${checkpoint.details} (${safeProgress}%)`
    : `[${checkpoint.stage}] (${safeProgress}%)`;

  const result = await db
    .insert(analysisSessions)
    .values({
      submissionId,
      aiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      promptTemplate: message,
      tokensUsed: safeProgress,
      success: true,
    })
    .returning();

  return result[0];
}

export async function getLatestSubmissionCheckpoint(submissionId: string) {
  const result = await db
    .select()
    .from(analysisSessions)
    .where(eq(analysisSessions.submissionId, submissionId))
    .orderBy(desc(analysisSessions.createdAt))
    .limit(1);

  return result[0] || null;
}

/**
 * Get AI usage statistics
 */
export async function getAiUsageStats(timeframe?: "today" | "week" | "month") {
  let timeFilter = sql`TRUE`;

  if (timeframe === "today") {
    timeFilter = sql`created_at >= CURRENT_DATE`;
  } else if (timeframe === "week") {
    timeFilter = sql`created_at >= CURRENT_DATE - INTERVAL '7 days'`;
  } else if (timeframe === "month") {
    timeFilter = sql`created_at >= CURRENT_DATE - INTERVAL '30 days'`;
  }

  const result = await db.execute(sql`
    SELECT 
      COUNT(*)::int as total_requests,
      COUNT(*) FILTER (WHERE success = true)::int as successful_requests,
      SUM(tokens_used) as total_tokens,
      SUM(cost_usd) as total_cost,
      AVG(latency_ms) as avg_latency_ms,
      ai_model
    FROM analysis_sessions
    WHERE ${timeFilter}
    GROUP BY ai_model
    ORDER BY total_requests DESC
  `);

  return result.rows;
}

// ===================================
// CODE IMPROVEMENT QUERIES
// ===================================

/**
 * Create code improvement suggestion
 */
export async function createCodeImprovement(improvementData: {
  submissionId: string;
  title: string;
  description?: string;
  improvedCode: string;
  improvementType:
    | "performance"
    | "readability"
    | "security"
    | "best_practices"
    | "bug_fix"
    | "code_style"
    | "architecture";
  priority?: "low" | "medium" | "high" | "critical";
  diffPatch?: string;
  lineStart?: number;
  lineEnd?: number;
}) {
  const result = await db
    .insert(codeImprovements)
    .values({
      ...improvementData,
      priority: improvementData.priority || "medium",
    })
    .returning();

  return result[0];
}

/**
 * Get improvements for a submission
 */
export async function getSubmissionImprovements(submissionId: string) {
  const result = await db
    .select()
    .from(codeImprovements)
    .where(eq(codeImprovements.submissionId, submissionId))
    .orderBy(desc(codeImprovements.createdAt));

  return result;
}

export async function deleteSubmissionImprovements(submissionId: string) {
  await db
    .delete(codeImprovements)
    .where(eq(codeImprovements.submissionId, submissionId));
}

export async function getRoastResultById(submissionId: string) {
  const submission = await getCodeSubmissionById(submissionId);

  if (!submission) {
    return null;
  }

  const improvements = await getSubmissionImprovements(submissionId);

  return {
    submission,
    improvements,
  };
}

/**
 * Get submission with all related data (comprehensive join query)
 */
export async function getSubmissionWithAllData(submissionId: string) {
  const result = await db.execute(sql`
    SELECT 
      s.id,
      s.original_code,
      s.language,
      s.roast_mode,
      s.shame_score,
      s.ai_feedback,
      s.ai_roast,
      s.analysis_duration_ms,
      s.status,
      s.created_at,
      s.analyzed_at,
      -- User data
      u.id as user_id,
      u.username,
      u.email,
      u.avatar_url,
      -- Analysis sessions (without DISTINCT to avoid ORDER BY issue)
      COALESCE(
        json_agg(
          jsonb_build_object(
            'id', a.id,
            'ai_model', a.ai_model,
            'tokens_used', a.tokens_used,
            'cost_usd', a.cost_usd,
            'latency_ms', a.latency_ms,
            'success', a.success,
            'created_at', a.created_at
          )
        ) FILTER (WHERE a.id IS NOT NULL), 
        '[]'::json
      ) as analysis_sessions,
      -- Code improvements (without DISTINCT to avoid ORDER BY issue)
      COALESCE(
        json_agg(
          jsonb_build_object(
            'id', i.id,
            'title', i.title,
            'description', i.description,
            'improvement_type', i.improvement_type,
            'priority', i.priority,
            'line_start', i.line_start,
            'line_end', i.line_end,
            'created_at', i.created_at
          )
        ) FILTER (WHERE i.id IS NOT NULL),
        '[]'::json
      ) as improvements
    FROM code_submissions s
    INNER JOIN users u ON s.user_id = u.id
    LEFT JOIN analysis_sessions a ON s.id = a.submission_id
    LEFT JOIN code_improvements i ON s.id = i.submission_id
    WHERE s.id = ${submissionId}
    GROUP BY s.id, u.id
  `);

  return result.rows[0] || null;
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

/**
 * Get database health check info
 */
export async function getDatabaseHealth() {
  const result = await db.execute(sql`
    SELECT 
      current_database() as database_name,
      version() as postgres_version,
      current_timestamp as current_time,
      (
        SELECT count(*) FROM pg_stat_activity 
        WHERE state = 'active'
      )::int as active_connections
  `);

  return result.rows[0];
}

/**
 * Get table row counts
 */
export async function getTableStats() {
  const result = await db.execute(sql`
    SELECT 
      'users' as table_name,
      (SELECT count(*) FROM users)::int as row_count
    UNION ALL
    SELECT 
      'code_submissions' as table_name,
      (SELECT count(*) FROM code_submissions)::int as row_count
    UNION ALL
    SELECT 
      'leaderboard_entries' as table_name,
      (SELECT count(*) FROM leaderboard_entries)::int as row_count
    UNION ALL
    SELECT 
      'analysis_sessions' as table_name,
      (SELECT count(*) FROM analysis_sessions)::int as row_count
    UNION ALL
    SELECT 
      'code_improvements' as table_name,
      (SELECT count(*) FROM code_improvements)::int as row_count
  `);

  return result.rows;
}

/**
 * Get homepage aggregated metrics
 */
export async function getHomepageMetrics() {
  const result = await db.execute(sql`
    SELECT
      COUNT(*) FILTER (WHERE status = 'completed')::int AS total_roasted_codes,
      COALESCE(ROUND(AVG(shame_score) FILTER (WHERE status = 'completed'), 1), 0)::numeric AS avg_score
    FROM code_submissions
  `);

  const row = result.rows[0] as {
    total_roasted_codes: number;
    avg_score: string | number;
  };

  return {
    totalRoastedCodes: row?.total_roasted_codes ?? 0,
    avgScore:
      typeof row?.avg_score === "number"
        ? row.avg_score
        : Number.parseFloat(row?.avg_score ?? "0"),
  };
}

/**
 * Get homepage leaderboard (top 3 worst snippets + footer stats)
 */
export async function getHomepageLeaderboard() {
  const entriesResult = await db.execute(sql`
    SELECT
      ROW_NUMBER() OVER (ORDER BY l.shame_score ASC, l.created_at ASC)::int AS rank,
      l.shame_score::int AS score,
      COALESCE(NULLIF(l.code_preview, ''), LEFT(s.original_code, 120), '// no snippet available') AS code,
      COALESCE(NULLIF(s.original_code, ''), l.code_preview, '// no code available') AS full_code,
      l.language
    FROM leaderboard_entries l
    LEFT JOIN code_submissions s ON s.id = l.submission_id
    ORDER BY l.shame_score ASC, l.created_at ASC
    LIMIT 3
  `);

  const statsResult = await db.execute(sql`
    SELECT
      (SELECT COUNT(*)::int FROM code_submissions) AS total_codes,
      (SELECT COUNT(*) FILTER (WHERE status = 'completed')::int FROM code_submissions) AS total_roasts
  `);

  const entries = entriesResult.rows as Array<{
    rank: number;
    score: number;
    code: string;
    full_code: string;
    language: string;
  }>;

  const statsRow = statsResult.rows[0] as {
    total_codes: number;
    total_roasts: number;
  };

  return {
    entries: entries.map((entry) => ({
      rank: entry.rank,
      score: entry.score,
      code: entry.code,
      fullCode: entry.full_code,
      language: entry.language,
    })),
    stats: {
      totalCodes: statsRow?.total_codes ?? 0,
      totalRoasts: statsRow?.total_roasts ?? 0,
    },
  };
}

/**
 * Get full leaderboard (top N snippets + aggregate stats)
 */
export async function getFullLeaderboard(limit = 20) {
  const entriesResult = await db.execute(sql`
    SELECT
      ROW_NUMBER() OVER (ORDER BY l.shame_score ASC, l.created_at ASC)::int AS rank,
      l.shame_score::int AS score,
      COALESCE(NULLIF(l.code_preview, ''), LEFT(s.original_code, 120), '// no snippet available') AS code,
      COALESCE(NULLIF(s.original_code, ''), NULLIF(l.code_preview, ''), '// no code available') AS full_code,
      l.language
    FROM leaderboard_entries l
    LEFT JOIN code_submissions s ON s.id = l.submission_id
    ORDER BY l.shame_score ASC, l.created_at ASC
    LIMIT ${limit}
  `);

  const statsResult = await db.execute(sql`
    SELECT
      COUNT(*)::int AS total_codes,
      COALESCE(ROUND(AVG(shame_score) FILTER (WHERE status = 'completed'), 1), 0)::numeric AS avg_score
    FROM code_submissions
  `);

  const entries = entriesResult.rows as Array<{
    rank: number;
    score: number;
    code: string;
    full_code: string;
    language: string;
  }>;

  const statsRow = statsResult.rows[0] as {
    total_codes: number;
    avg_score: string | number;
  };

  return {
    entries: entries.map((entry) => ({
      rank: entry.rank,
      score: entry.score,
      code: entry.code,
      fullCode: entry.full_code,
      language: entry.language,
    })),
    stats: {
      totalCodes: statsRow?.total_codes ?? 0,
      avgScore:
        typeof statsRow?.avg_score === "number"
          ? statsRow.avg_score
          : Number.parseFloat(statsRow?.avg_score ?? "0"),
    },
  };
}

import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  decimal,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// Definir enums diretamente no schema para garantir que sejam detectados
export const roastModeEnum = pgEnum("roast_mode_enum", [
  "roast", // Modo selvagem/brutal
  "honest", // Modo construtivo/honesto
]);

export const submissionStatusEnum = pgEnum("submission_status_enum", [
  "pending", // Aguardando análise
  "analyzing", // Em análise
  "completed", // Análise concluída
  "failed", // Erro na análise
]);

export const improvementTypeEnum = pgEnum("improvement_type_enum", [
  "performance", // Melhoria de performance
  "readability", // Legibilidade
  "security", // Segurança
  "best_practices", // Boas práticas
  "bug_fix", // Correção de bugs
  "code_style", // Estilo de código
  "architecture", // Arquitetura
]);

export const priorityLevelEnum = pgEnum("priority_level_enum", [
  "low",
  "medium",
  "high",
  "critical",
]);

// Tabela Users - usuários baseados em sessão
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: varchar("session_id", { length: 255 }).unique().notNull(),
    username: varchar("username", { length: 100 }),
    email: varchar("email", { length: 255 }),
    avatarUrl: text("avatar_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    // Apenas índices essenciais - session_id já é único, não precisa de índice adicional
    usernameIdx: index("idx_users_username").on(table.username), // Para busca no leaderboard
  }),
);

// Tabela Code Submissions
export const codeSubmissions = pgTable(
  "code_submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),

    // Código original
    originalCode: text("original_code").notNull(),
    language: varchar("language", { length: 50 }).notNull(),

    // Configurações da análise
    roastMode: roastModeEnum("roast_mode").default("honest").notNull(),

    // Resultados da IA
    shameScore: integer("shame_score"),
    aiFeedback: text("ai_feedback"),
    aiRoast: text("ai_roast"),

    // Metadados
    analysisDurationMs: integer("analysis_duration_ms"),
    status: submissionStatusEnum("status").default("pending").notNull(),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    analyzedAt: timestamp("analyzed_at"),
  },
  (table) => ({
    // Índices essenciais para queries frequentes
    statusIdx: index("idx_code_submissions_status").on(table.status), // Para filtrar submissions ativas
    shameScoreIdx: index("idx_code_submissions_shame_score").on(
      table.shameScore,
    ), // Para leaderboard
    languageCreatedIdx: index("idx_code_submissions_language_created").on(
      table.language,
      table.createdAt,
    ), // Para leaderboard por linguagem
    userCreatedIdx: index("idx_code_submissions_user_created").on(
      table.userId,
      table.createdAt,
    ), // Para histórico do usuário
    // Constraint para shame score
    shameScoreCheck: check(
      "shame_score_check",
      sql`shame_score >= 1 AND shame_score <= 10`,
    ),
  }),
);

// Tabela Code Improvements - sugestões de melhorias
export const codeImprovements = pgTable(
  "code_improvements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    submissionId: uuid("submission_id")
      .references(() => codeSubmissions.id, { onDelete: "cascade" })
      .notNull(),

    // Dados da melhoria
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    improvedCode: text("improved_code").notNull(),
    diffPatch: text("diff_patch"),

    // Classificação
    improvementType: improvementTypeEnum("improvement_type").notNull(),
    priority: priorityLevelEnum("priority").default("medium").notNull(),

    // Localização no código
    lineStart: integer("line_start"),
    lineEnd: integer("line_end"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    // Apenas índices essenciais - submission_id já é FK, pode não precisar de índice adicional dependendo do uso
    typeIdx: index("idx_code_improvements_type").on(table.improvementType), // Para filtrar melhorias por tipo
  }),
);

// Tabela Leaderboard Entries - cache para performance do ranking
export const leaderboardEntries = pgTable(
  "leaderboard_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    submissionId: uuid("submission_id")
      .references(() => codeSubmissions.id, { onDelete: "cascade" })
      .notNull(),

    // Dados do ranking
    shameScore: integer("shame_score").notNull(),
    language: varchar("language", { length: 50 }).notNull(),
    codePreview: text("code_preview"),

    // Metadados de ranking
    rankPosition: integer("rank_position"),
    totalSubmissions: integer("total_submissions").default(1).notNull(),
    averageScore: decimal("average_score", { precision: 3, scale: 2 }),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    // Índices essenciais para leaderboard
    shameScoreDesc: index("idx_leaderboard_shame_score_desc").on(
      sql`${table.shameScore} ASC`,
    ), // Para ranking global (menor shame score = melhor)
    languageScoreIdx: index("idx_leaderboard_language_score").on(
      table.language,
      sql`${table.shameScore} ASC`,
    ), // Para ranking por linguagem
    userSubmissionUnique: uniqueIndex("idx_leaderboard_user_submission").on(
      table.userId,
      table.submissionId,
    ), // Previne duplicatas
  }),
);

// Tabela Analysis Sessions - para debugging e métricas de IA
export const analysisSessions = pgTable(
  "analysis_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    submissionId: uuid("submission_id")
      .references(() => codeSubmissions.id, { onDelete: "cascade" })
      .notNull(),

    // Dados da sessão IA
    aiModel: varchar("ai_model", { length: 100 }),
    promptTemplate: text("prompt_template"),
    aiResponseRaw: text("ai_response_raw"),
    tokensUsed: integer("tokens_used"),
    costUsd: decimal("cost_usd", { precision: 10, scale: 4 }),

    // Performance
    latencyMs: integer("latency_ms"),
    success: boolean("success").default(true).notNull(),
    errorMessage: text("error_message"),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    // Índices para análise e debugging
    successCreatedIdx: index("idx_analysis_sessions_success_created").on(
      table.success,
      table.createdAt,
    ), // Para filtrar sessões com falha
    aiModelIdx: index("idx_analysis_sessions_ai_model").on(table.aiModel), // Para métricas por modelo
  }),
);

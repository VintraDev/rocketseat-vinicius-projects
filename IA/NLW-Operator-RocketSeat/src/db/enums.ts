import { pgEnum } from "drizzle-orm/pg-core";

// Modo de análise/roast
export const roastModeEnum = pgEnum("roast_mode_enum", [
  "roast", // Modo selvagem/brutal
  "honest", // Modo construtivo/honesto
]);

// Status da submissão
export const submissionStatusEnum = pgEnum("submission_status_enum", [
  "pending", // Aguardando análise
  "analyzing", // Em análise
  "completed", // Análise concluída
  "failed", // Erro na análise
]);

// Tipos de melhoria
export const improvementTypeEnum = pgEnum("improvement_type_enum", [
  "performance", // Melhoria de performance
  "readability", // Legibilidade
  "security", // Segurança
  "best_practices", // Boas práticas
  "bug_fix", // Correção de bugs
  "code_style", // Estilo de código
  "architecture", // Arquitetura
]);

// Níveis de prioridade
export const priorityLevelEnum = pgEnum("priority_level_enum", [
  "low",
  "medium",
  "high",
  "critical",
]);

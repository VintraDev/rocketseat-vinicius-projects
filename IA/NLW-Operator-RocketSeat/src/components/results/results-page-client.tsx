"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { AnalysisCard } from "@/components/results/analysis-card";
import { DiffLine } from "@/components/results/diff-line";
import { ScoreHero } from "@/components/results/score-hero";
import { Button } from "@/components/ui/button";
import { CodeBlockWithCopy } from "@/components/ui/code-block";
import { getScoreColorFromValue } from "@/components/ui/score-badge";
import { Text } from "@/components/ui/typography";
import type { SupportedLanguage } from "@/lib/syntax-highlighting";
import { useTRPC } from "@/trpc/client";

type ResultsPageClientProps = {
  roastId: string;
};

function getVerdict(score: number) {
  if (score <= 3) {
    return "verdict: needs_serious_help";
  }

  if (score <= 6) {
    return "verdict: can_be_much_better";
  }

  return "verdict: surprisingly_decent";
}

function getCardSeverity(priority: "low" | "medium" | "high" | "critical") {
  if (priority === "critical" || priority === "high") {
    return "critical" as const;
  }

  if (priority === "medium") {
    return "warning" as const;
  }

  return "good" as const;
}

const supportedLanguages = new Set<string>([
  "javascript",
  "typescript",
  "jsx",
  "tsx",
  "python",
  "java",
  "csharp",
  "go",
  "rust",
  "php",
  "ruby",
  "swift",
  "sql",
  "bash",
  "shell",
  "json",
  "yaml",
  "xml",
  "html",
  "css",
]);

function normalizeLanguageForDisplay(language: string): SupportedLanguage {
  const normalized = language.toLowerCase();

  if (supportedLanguages.has(normalized)) {
    return normalized as SupportedLanguage;
  }

  return "javascript";
}

type DiffLineItem = {
  type: "added" | "removed" | "context";
  code: string;
};

function parseUnifiedDiff(
  diffPatch: string | null | undefined,
): DiffLineItem[] {
  if (!diffPatch) {
    return [];
  }

  const lines = diffPatch.split("\n");
  const result: DiffLineItem[] = [];

  for (const line of lines) {
    if (
      !line ||
      line.startsWith("@@") ||
      line.startsWith("---") ||
      line.startsWith("+++")
    ) {
      continue;
    }

    if (line.startsWith("+")) {
      result.push({ type: "added", code: line.slice(1) });
      continue;
    }

    if (line.startsWith("-")) {
      result.push({ type: "removed", code: line.slice(1) });
      continue;
    }

    result.push({
      type: "context",
      code: line.startsWith(" ") ? line.slice(1) : line,
    });
  }

  return result;
}

function createDiffLines(params: {
  originalCode: string;
  improvedCode: string;
}): DiffLineItem[] {
  const originalLines = params.originalCode
    .split("\n")
    .map((line) => line.trimEnd());
  const improvedLines = params.improvedCode
    .split("\n")
    .map((line) => line.trimEnd());

  if (originalLines.join("\n") === improvedLines.join("\n")) {
    return originalLines.slice(0, 10).map((line) => ({
      type: "context",
      code: line,
    }));
  }

  const maxLength = Math.max(originalLines.length, improvedLines.length);
  const result: DiffLineItem[] = [];

  for (let index = 0; index < maxLength; index++) {
    const original = originalLines[index];
    const improved = improvedLines[index];

    if (original === improved) {
      if (original !== undefined) {
        result.push({
          type: "context",
          code: original,
        });
      }

      continue;
    }

    if (original !== undefined) {
      result.push({
        type: "removed",
        code: original,
      });
    }

    if (improved !== undefined) {
      result.push({
        type: "added",
        code: improved,
      });
    }
  }

  return result.slice(0, 18);
}

function getCompactImprovementTitle(title: string) {
  const normalized = title.replace(/\s+/g, " ").trim();
  const noDetails = normalized
    .split(":")[0]
    ?.split(" - ")[0]
    ?.split(" (")[0]
    ?.trim();

  const compact = noDetails && noDetails.length >= 8 ? noDetails : normalized;

  if (compact.length <= 38) {
    return compact;
  }

  return `${compact.slice(0, 35)}...`;
}

export function ResultsPageClient({ roastId }: ResultsPageClientProps) {
  const trpc = useTRPC();

  const roastQuery = useQuery({
    ...trpc.roast.getById.queryOptions({ roastId }),
    refetchInterval: (query) => {
      const status = query.state.data?.submission.status;

      if (status === "pending" || status === "analyzing") {
        return 2000;
      }

      return false;
    },
  });

  const retryMutation = useMutation(
    trpc.roast.retry.mutationOptions({
      onSuccess: async () => {
        await roastQuery.refetch();
      },
    }),
  );

  const payload = roastQuery.data;

  const status = payload?.submission.status;
  const isLoading = !payload || status === "pending" || status === "analyzing";

  const linesCount = useMemo(() => {
    const code = payload?.submission.originalCode ?? "";

    if (!code) {
      return 0;
    }

    return code.split("\n").length;
  }, [payload?.submission.originalCode]);

  if (isLoading) {
    return (
      <div className="w-full flex flex-col gap-8 sm:gap-10 animate-pulse">
        <section className="w-full border border-devroast-border bg-devroast-surface p-6 sm:p-8">
          <div className="flex flex-col gap-4">
            <div className="h-4 w-48 bg-devroast-border" />
            <div className="h-12 w-36 bg-devroast-border" />
            <div className="h-3 w-full bg-devroast-border" />
            <div className="h-3 w-5/6 bg-devroast-border" />
            <div className="h-3 w-1/2 bg-devroast-border" />
          </div>
        </section>

        <div className="h-px bg-devroast-border" />

        <section className="flex flex-col gap-4">
          <div className="h-4 w-44 bg-devroast-border" />
          <div className="w-full h-[424px] border border-devroast-border bg-devroast-input" />
        </section>

        <div className="h-px bg-devroast-border" />

        <section className="flex flex-col gap-6">
          <div className="h-4 w-44 bg-devroast-border" />
          <div className="h-24 w-full border border-devroast-border bg-devroast-surface" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="h-28 border border-devroast-border bg-devroast-surface" />
            <div className="h-28 border border-devroast-border bg-devroast-surface" />
          </div>
        </section>

        <div className="h-px bg-devroast-border" />

        <section className="flex flex-col gap-6">
          <div className="h-4 w-40 bg-devroast-border" />
          <div className="w-full border border-devroast-border bg-devroast-input p-2">
            <div className="h-6 w-full bg-devroast-border mb-2" />
            <div className="h-6 w-full bg-devroast-border mb-1" />
            <div className="h-6 w-full bg-devroast-border mb-1" />
            <div className="h-6 w-full bg-devroast-border" />
          </div>
        </section>
      </div>
    );
  }

  if (!payload) {
    return (
      <section className="w-full border border-devroast-border bg-devroast-surface p-6 sm:p-8">
        <Text className="font-[IBM_Plex_Mono] text-xs sm:text-sm text-devroast-red">
          nao foi possivel carregar este roast.
        </Text>
      </section>
    );
  }

  if (payload.submission.status === "failed") {
    return (
      <section className="w-full border border-devroast-border bg-devroast-surface p-6 sm:p-8 flex flex-col gap-4">
        <Text className="font-mono text-sm text-devroast-red">
          {"// analysis_failed"}
        </Text>
        <Text className="font-[IBM_Plex_Mono] text-xs sm:text-sm text-devroast-text-secondary">
          {payload.error?.message ||
            "a analise falhou depois das tentativas automaticas."}
        </Text>
        <div>
          <Button
            onClick={() => retryMutation.mutate({ roastId })}
            disabled={retryMutation.isPending}
          >
            {retryMutation.isPending ? "$ retrying..." : "$ tentar_novamente"}
          </Button>
        </div>
      </section>
    );
  }

  const score = payload.submission.shameScore ?? 1;
  const displayLanguage = normalizeLanguageForDisplay(
    payload.submission.language,
  );
  const roastQuote =
    payload.submission.aiRoast ||
    "o modelo ficou sem roast, mas seu codigo nao escapou da vergonha.";
  const technicalFeedback =
    payload.submission.aiFeedback || "Sem feedback tecnico detalhado.";
  const scoreColor = getScoreColorFromValue(score);
  const primaryImprovement = payload.improvements[0];
  const suggestedCode =
    primaryImprovement?.improvedCode?.trim() || payload.submission.originalCode;
  const unifiedDiffLines = parseUnifiedDiff(primaryImprovement?.diffPatch);
  const suggestedDiffLines =
    unifiedDiffLines.length > 0
      ? unifiedDiffLines
      : createDiffLines({
          originalCode: payload.submission.originalCode,
          improvedCode: suggestedCode,
        });

  return (
    <div className="w-full flex flex-col gap-8 sm:gap-10">
      <ScoreHero
        score={score}
        verdict={getVerdict(score)}
        roastQuote={roastQuote}
        language={displayLanguage}
        lines={linesCount}
        responsive={true}
      />

      <div className="h-px bg-devroast-border" />

      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-devroast-green">{"//"}</span>
          <h2 className="text-sm font-bold text-devroast-text-primary">
            your_submission
          </h2>
          <span className="font-mono text-xs text-devroast-text-muted">
            ({scoreColor})
          </span>
        </div>

        <div className="w-full max-h-[440px] overflow-hidden border border-devroast-border bg-devroast-input">
          <CodeBlockWithCopy
            showHeader={false}
            showLineNumbers={true}
            className="border-0 h-full"
          >
            {payload.submission.originalCode}
          </CodeBlockWithCopy>
        </div>
      </section>

      <div className="h-px bg-devroast-border" />

      <section className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-devroast-green">{"//"}</span>
          <h2 className="text-sm font-bold text-devroast-text-primary">
            detailed_analysis
          </h2>
        </div>

        <AnalysisCard
          severity="warning"
          title="technical_feedback"
          description={technicalFeedback}
        />

        {payload.improvements.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {payload.improvements.map((improvement) => (
              <AnalysisCard
                key={improvement.id}
                severity={getCardSeverity(improvement.priority)}
                title={getCompactImprovementTitle(improvement.title)}
                description={[
                  `priority: ${improvement.priority}`,
                  improvement.lineStart
                    ? improvement.lineEnd
                      ? `linhas ${improvement.lineStart}-${improvement.lineEnd}`
                      : `linha ${improvement.lineStart}`
                    : null,
                  improvement.description ||
                    "Melhoria sugerida sem descricao adicional.",
                ]
                  .filter(Boolean)
                  .join(" | ")}
              />
            ))}
          </div>
        ) : (
          <Text className="font-[IBM_Plex_Mono] text-xs sm:text-sm text-devroast-text-secondary">
            nenhum ponto de melhoria foi retornado para este roast.
          </Text>
        )}
      </section>

      <div className="h-px bg-devroast-border" />

      <section className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-devroast-green">{"//"}</span>
          <h2 className="text-sm font-bold text-devroast-text-primary">
            suggested_fix
          </h2>
        </div>

        <div className="w-full border border-devroast-border bg-devroast-input overflow-hidden">
          <div className="flex items-center h-10 px-4 border-b border-devroast-border">
            <span className="text-xs font-medium text-devroast-text-secondary">
              {"your_code.ts -> improved_code.ts"}
            </span>
          </div>

          <div className="py-1">
            {suggestedDiffLines.length > 0 ? (
              suggestedDiffLines.map((line, index) => (
                <DiffLine
                  key={`${line.type}-${index}-${line.code}`}
                  type={line.type}
                  code={line.code}
                />
              ))
            ) : (
              <DiffLine type="context" code="// no suggestion available" />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

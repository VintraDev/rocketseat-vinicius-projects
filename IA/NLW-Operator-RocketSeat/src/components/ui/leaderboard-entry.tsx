import { forwardRef } from "react";
import { tv } from "tailwind-variants";
import { getScoreColorFromValue, ScoreBadge } from "./score-badge";

const leaderboardEntryVariants = tv({
  slots: {
    container: [
      "w-full",
      "border",
      "border-devroast-border",
      "bg-transparent",
      "overflow-hidden",
    ],
    metaRow: [
      "flex",
      "items-center",
      "justify-between",
      "h-12", // 48px exact height as per design
      "px-5", // 20px padding
      "border-b",
      "border-devroast-border",
    ],
    metaLeft: ["flex", "items-center", "gap-4"], // 16px gap
    metaRight: ["flex", "items-center", "gap-3"], // 12px gap
    rankBadge: [
      "inline-flex",
      "items-center",
      "gap-1.5", // 6px gap between # and number
      "font-mono",
    ],
    rankHash: ["text-[13px]", "font-normal", "text-devroast-text-tertiary"],
    rankNumber: [
      "text-[13px]",
      "font-bold",
      "leading-none",
      // Color will be dynamic based on rank
    ],
    langBadge: [
      "text-xs", // 12px
      "font-mono",
      "font-normal",
      "text-devroast-text-secondary",
    ],
    linesBadge: [
      "text-xs", // 12px
      "font-mono",
      "font-normal",
      "text-devroast-text-tertiary",
    ],
    codeBlock: [
      "flex",
      "h-30", // 120px exact height as per design
      "bg-devroast-surface",
      "border",
      "border-devroast-border",
      "overflow-hidden",
    ],
    lineNumbers: [
      "flex",
      "flex-col",
      "items-end",
      "gap-1.5", // 6px gap between line numbers
      "w-10", // 40px width
      "bg-devroast-surface",
      "border-r",
      "border-devroast-border",
      "py-3.5", // 14px padding
      "px-2.5", // 10px padding
    ],
    lineNumber: [
      "text-xs", // 12px
      "font-mono",
      "font-normal",
      "text-devroast-text-tertiary",
      "leading-none",
    ],
    codeContent: [
      "flex",
      "flex-col",
      "gap-1.5", // 6px gap between code lines
      "flex-1",
      "py-3.5", // 14px padding
      "px-4", // 16px padding
      "overflow-auto",
      "font-mono",
      "text-xs", // 12px
      "leading-none",
    ],
    codeLine: ["flex", "items-start", "gap-1", "whitespace-pre"],
  },
  variants: {
    rank: {
      first: {
        rankNumber: "text-devroast-orange", // #1 gets amber/orange color
      },
      normal: {
        rankNumber: "text-devroast-text-secondary",
      },
    },
  },
  defaultVariants: {
    rank: "normal",
  },
});

export interface CodeLine {
  text: string;
  tokens?: Array<{ type: string; value: string }>;
}

export interface LeaderboardEntryProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "rank"> {
  rank: number;
  score: number | string;
  language: string;
  lines: number; // Number of code lines
  code: string | CodeLine[]; // Can be plain string or array of lines with tokens
}

const LeaderboardEntry = forwardRef<HTMLDivElement, LeaderboardEntryProps>(
  ({ className, rank, score, language, lines, code, ...props }, ref) => {
    const {
      container,
      metaRow,
      metaLeft,
      metaRight,
      rankBadge,
      rankHash,
      rankNumber,
      langBadge,
      linesBadge,
      codeBlock,
      lineNumbers,
      lineNumber,
      codeContent,
      codeLine,
    } = leaderboardEntryVariants({
      rank: rank === 1 ? "first" : "normal",
    });

    // Parse code into lines if it's a string
    const codeLines: CodeLine[] =
      typeof code === "string"
        ? code.split("\n").map((line) => ({ text: line }))
        : code;

    // Generate line numbers array
    const lineNumbersArray = Array.from(
      { length: codeLines.length },
      (_, i) => i + 1,
    );

    // Get score color for the badge
    const scoreColor = getScoreColorFromValue(score);

    // Syntax highlighting colors map
    const syntaxColorMap: Record<string, string> = {
      keyword: "var(--color-syn-keyword)",
      function: "var(--color-syn-function)",
      variable: "var(--color-syn-variable)",
      number: "var(--color-syn-number)",
      string: "var(--color-syn-string)",
      property: "var(--color-syn-property)",
      operator: "var(--color-syn-operator)",
      comment: "var(--color-syn-comment)",
    };

    return (
      <div ref={ref} className={container({ className })} {...props}>
        {/* Meta Row */}
        <div className={metaRow()}>
          {/* Left Side: Rank + Score */}
          <div className={metaLeft()}>
            {/* Rank Badge */}
            <div className={rankBadge()}>
              <span className={rankHash()}>#</span>
              <span className={rankNumber()}>{rank}</span>
            </div>

            {/* Score Badge */}
            <ScoreBadge score={score} scoreColor={scoreColor} autoColor />
          </div>

          {/* Right Side: Language + Lines */}
          <div className={metaRight()}>
            <span className={langBadge()}>{language}</span>
            <span className={linesBadge()}>
              {lines} {lines === 1 ? "line" : "lines"}
            </span>
          </div>
        </div>

        {/* Code Block */}
        <div className={codeBlock()}>
          {/* Line Numbers */}
          <div className={lineNumbers()}>
            {lineNumbersArray.map((num) => (
              <span key={num} className={lineNumber()}>
                {num}
              </span>
            ))}
          </div>

          {/* Code Content */}
          <div className={codeContent()}>
            {codeLines.map((line, index) => (
              <div
                key={`line-${index}-${line.text.substring(0, 10)}`}
                className={codeLine()}
              >
                {line.tokens ? (
                  // Render with syntax highlighting
                  line.tokens.map((token, tokenIndex) => (
                    <span
                      key={`token-${index}-${tokenIndex}-${token.type}`}
                      style={{
                        color:
                          syntaxColorMap[token.type] ||
                          "var(--color-devroast-text-primary)",
                      }}
                    >
                      {token.value}
                    </span>
                  ))
                ) : (
                  // Render plain text
                  <span style={{ color: "var(--color-devroast-text-primary)" }}>
                    {line.text}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
);

LeaderboardEntry.displayName = "LeaderboardEntry";

export { LeaderboardEntry, leaderboardEntryVariants };
export type { CodeLine as LeaderboardCodeLine };

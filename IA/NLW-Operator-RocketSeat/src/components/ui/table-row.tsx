import { ChevronDown, ChevronUp } from "lucide-react";
import * as React from "react";
import { tv, type VariantProps } from "tailwind-variants";

const tableRowVariants = tv({
  base: "flex items-center w-full px-5 py-4 border-b border-devroast-border",
  variants: {
    variant: {
      default: "hover:bg-devroast-surface transition-colors",
      static: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const tableCellVariants = tv({
  base: "flex items-center min-w-0",
  variants: {
    align: {
      left: "justify-start text-left",
      center: "justify-center text-center",
      right: "justify-end text-right",
    },
  },
  defaultVariants: {
    align: "left",
  },
});

// Mobile Card variant for Leaderboard
const leaderboardCardVariants = tv({
  slots: {
    container: [
      "p-4",
      "border",
      "border-devroast-border",
      "bg-transparent",
      "rounded-md",
      "space-y-3",
    ],
    header: ["flex", "items-center", "justify-between"],
    rankBadge: [
      "inline-flex",
      "items-center",
      "gap-1",
      "px-2",
      "py-1",
      "rounded",
      "font-mono",
      "text-xs",
      "font-bold",
    ],
    score: ["font-mono", "text-lg", "font-bold"],
    codeBlock: [
      "font-mono",
      "text-xs",
      "text-devroast-text-primary",
      "bg-devroast-surface",
      "p-3",
      "rounded",
      "border",
      "border-devroast-border",
      "overflow-x-auto",
    ],
    footer: [
      "flex",
      "items-center",
      "justify-between",
      "text-xs",
      "text-devroast-text-muted",
    ],
    languageTag: ["font-mono", "text-xs", "text-devroast-text-secondary"],
    actionLink: [
      "font-mono",
      "text-xs",
      "text-devroast-green",
      "hover:text-devroast-green",
      "cursor-pointer",
    ],
  },
  variants: {
    rank: {
      first: {
        rankBadge: "bg-amber-500 text-black",
      },
      normal: {
        rankBadge: "bg-devroast-surface text-devroast-text-secondary",
      },
    },
    scoreColor: {
      red: {
        score: "text-devroast-red",
      },
      yellow: {
        score: "text-devroast-orange",
      },
      green: {
        score: "text-devroast-green",
      },
      default: {
        score: "text-devroast-text-primary",
      },
    },
  },
  defaultVariants: {
    rank: "normal",
    scoreColor: "default",
  },
});

export interface TableRowProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tableRowVariants> {
  children?: React.ReactNode;
}

export interface TableCellProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tableCellVariants> {
  width?: number | string;
  children?: React.ReactNode;
}

const TableRow = React.forwardRef<HTMLDivElement, TableRowProps>(
  ({ className, variant, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={tableRowVariants({ className, variant })}
        {...props}
      >
        {children}
      </div>
    );
  },
);
TableRow.displayName = "TableRow";

const TableCell = React.forwardRef<HTMLDivElement, TableCellProps>(
  ({ className, align, width, children, style, ...props }, ref) => {
    const cellStyle = {
      width: typeof width === "number" ? `${width}px` : width,
      ...style,
    };

    return (
      <div
        ref={ref}
        className={tableCellVariants({ className, align })}
        style={cellStyle}
        {...props}
      >
        {children}
      </div>
    );
  },
);
TableCell.displayName = "TableCell";

// Leaderboard Row Component - específico para o design DevRoast
export interface LeaderboardRowProps extends Omit<TableRowProps, "children"> {
  rank: string | number;
  score: string | number;
  scoreColor?: "red" | "yellow" | "green" | "default"; // If not provided, will auto-calculate from score
  code: string;
  language: string;
  responsive?: boolean; // NEW: Enable responsive behavior
  expandCode?: boolean;
  onToggleExpand?: () => void;
}

// Function to determine score color based on value (1-10 scale)
const getScoreColorFromValue = (
  score: string | number,
): "red" | "yellow" | "green" => {
  const numScore = typeof score === "string" ? parseFloat(score) : score;

  if (numScore <= 3) return "red"; // 1.0 - 3.0: Bad code (red)
  if (numScore <= 6) return "yellow"; // 3.1 - 6.0: Medium code (yellow/orange)
  return "green"; // 6.1 - 10.0: Good code (green)
};

// Mobile Card Component for Leaderboard
export interface LeaderboardCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  rank: string | number;
  score: string | number;
  scoreColor?: "red" | "yellow" | "green" | "default";
  code: string;
  language: string;
  expandCode?: boolean;
  onToggleExpand?: () => void;
}

const LeaderboardCard = React.forwardRef<HTMLDivElement, LeaderboardCardProps>(
  (
    {
      rank,
      score,
      scoreColor = "default",
      code,
      language,
      expandCode = false,
      onToggleExpand,
      className,
      ...props
    },
    ref,
  ) => {
    // Auto-determine color if not explicitly set
    const actualScoreColor =
      scoreColor === "default" ? getScoreColorFromValue(score) : scoreColor;

    const {
      container,
      header,
      rankBadge,
      score: scoreClass,
      codeBlock,
      footer,
      languageTag,
      actionLink,
    } = leaderboardCardVariants({
      rank: rank === 1 ? "first" : "normal",
      scoreColor: actualScoreColor,
    });

    return (
      <div ref={ref} className={container({ className })} {...props}>
        {/* Header: Rank + Score */}
        <div className={header()}>
          <div className={rankBadge()}>#{rank}</div>
          <div className={scoreClass()}>{score}</div>
        </div>

        {/* Code Block */}
        <div
          data-code="true"
          className={`${codeBlock()} ${
            expandCode
              ? "max-h-52 overflow-auto devroast-scrollbar whitespace-pre-wrap wrap-break-word"
              : ""
          }`}
        >
          {code}
        </div>

        {onToggleExpand && (
          <button
            type="button"
            onClick={onToggleExpand}
            className="mt-2 inline-flex items-center gap-2 font-mono text-xs text-devroast-green hover:text-devroast-text-primary transition-colors cursor-pointer"
          >
            {expandCode ? "show less" : "show more"}
            {expandCode ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}

        {/* Footer: Language + Action */}
        <div className={footer()}>
          <span className={languageTag()}>{language}</span>
          <span className={actionLink()}>View Details →</span>
        </div>
      </div>
    );
  },
);
LeaderboardCard.displayName = "LeaderboardCard";

const LeaderboardRow = React.forwardRef<HTMLDivElement, LeaderboardRowProps>(
  (
    {
      rank,
      score,
      scoreColor = "default",
      code,
      language,
      responsive = false,
      expandCode = false,
      onToggleExpand,
      className,
      ...props
    },
    ref,
  ) => {
    // Auto-determine color if not explicitly set
    const actualScoreColor =
      scoreColor === "default" ? getScoreColorFromValue(score) : scoreColor;

    const getScoreColor = () => {
      switch (actualScoreColor) {
        case "red":
          return "text-devroast-red";
        case "yellow":
          return "text-devroast-orange";
        case "green":
          return "text-devroast-green";
        default:
          return "text-devroast-text-primary";
      }
    };

    // If responsive mode is enabled, render as card on mobile, table on desktop
    if (responsive) {
      return (
        <>
          {/* Mobile Card Layout */}
          <div className="block md:hidden">
            <LeaderboardCard
              ref={ref}
              rank={rank}
              score={score}
              scoreColor={actualScoreColor}
              code={code}
              language={language}
              expandCode={expandCode}
              onToggleExpand={onToggleExpand}
              className={className}
              {...props}
            />
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden md:block">
            <TableRow
              ref={ref}
              className={`${className ?? ""} ${expandCode ? "flex-wrap items-start gap-y-3" : ""}`}
              {...props}
            >
              <TableCell width={50} align="left">
                <span className="text-devroast-text-muted font-mono text-[13px]">
                  #{rank}
                </span>
              </TableCell>

              <TableCell width={70} align="left">
                <span
                  className={`font-mono text-[13px] font-bold ${getScoreColor()}`}
                >
                  {score}
                </span>
              </TableCell>

              <TableCell
                width={expandCode ? "100%" : "250px"}
                align="left"
                className={
                  expandCode ? "w-full basis-full mr-0" : "flex-1 mr-6"
                }
              >
                <div className="w-full">
                  <span
                    data-code="true"
                    className={`text-devroast-text-secondary font-mono text-xs ${
                      expandCode
                        ? "block w-full max-h-52 overflow-auto devroast-scrollbar whitespace-pre-wrap break-words"
                        : "block w-full truncate"
                    }`}
                  >
                    {code}
                  </span>

                  {onToggleExpand && (
                    <button
                      type="button"
                      onClick={onToggleExpand}
                      className="mt-2 inline-flex items-center gap-2 font-mono text-xs text-devroast-green hover:text-devroast-text-primary transition-colors cursor-pointer"
                    >
                      {expandCode ? "show less" : "show more"}
                      {expandCode ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                    </button>
                  )}
                </div>
              </TableCell>

              <TableCell width={100} align="left">
                <span className="text-devroast-text-muted font-mono text-xs">
                  {language}
                </span>
              </TableCell>
            </TableRow>
          </div>
        </>
      );
    }

    // Default: Always render as table row
    return (
      <TableRow ref={ref} className={className} {...props}>
        <TableCell width={50} align="left">
          <span className="text-devroast-text-muted font-mono text-[13px]">
            #{rank}
          </span>
        </TableCell>

        <TableCell width={70} align="left">
          <span
            className={`font-mono text-[13px] font-bold ${getScoreColor()}`}
          >
            {score}
          </span>
        </TableCell>

        <TableCell width="auto" align="left" className="flex-1 mr-6">
          <div className="w-full">
            <span
              data-code="true"
              className={`text-devroast-text-secondary font-mono text-xs ${
                expandCode
                  ? "block w-full max-h-52 overflow-auto devroast-scrollbar whitespace-pre-wrap break-words"
                  : "block w-full truncate"
              }`}
            >
              {code}
            </span>

            {onToggleExpand && (
              <button
                type="button"
                onClick={onToggleExpand}
                className="mt-2 inline-flex items-center gap-2 font-mono text-xs text-devroast-green hover:text-devroast-text-primary transition-colors cursor-pointer"
              >
                {expandCode ? "show less" : "show more"}
                {expandCode ? (
                  <ChevronUp size={14} />
                ) : (
                  <ChevronDown size={14} />
                )}
              </button>
            )}
          </div>
        </TableCell>

        <TableCell width={100} align="left">
          <span className="text-devroast-text-muted font-mono text-xs">
            {language}
          </span>
        </TableCell>
      </TableRow>
    );
  },
);
LeaderboardRow.displayName = "LeaderboardRow";

export {
  TableRow,
  TableCell,
  LeaderboardRow,
  LeaderboardCard,
  tableRowVariants,
  tableCellVariants,
  leaderboardCardVariants,
};

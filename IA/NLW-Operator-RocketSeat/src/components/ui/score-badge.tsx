import { forwardRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const scoreBadgeVariants = tv({
  slots: {
    container: [
      "inline-flex",
      "items-center",
      "gap-1.5", // 6px gap between label and value
      "font-mono",
    ],
    label: [
      "text-xs", // 12px
      "font-normal",
      "text-devroast-text-tertiary",
    ],
    value: [
      "text-[13px]", // Exact 13px as per Pencil design
      "font-bold",
      "leading-none",
    ],
  },
  variants: {
    scoreColor: {
      red: {
        value: "text-devroast-red", // Bad code (1.0 - 3.0)
      },
      yellow: {
        value: "text-devroast-orange", // Medium code (3.1 - 6.0)
      },
      green: {
        value: "text-devroast-green", // Good code (6.1 - 10.0)
      },
      amber: {
        value: "text-devroast-orange", // Alias for yellow
      },
    },
  },
  defaultVariants: {
    scoreColor: "red", // Most roasted are bad, so red is default
  },
});

// Auto-determine score color based on value (1-10 scale)
const getScoreColorFromValue = (
  score: string | number,
): "red" | "yellow" | "green" => {
  const numScore = typeof score === "string" ? parseFloat(score) : score;

  if (numScore <= 3) return "red"; // 1.0 - 3.0: Bad code
  if (numScore <= 6) return "yellow"; // 3.1 - 6.0: Medium code
  return "green"; // 6.1 - 10.0: Good code
};

export interface ScoreBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof scoreBadgeVariants> {
  score: string | number;
  showLabel?: boolean; // Show "score:" label
  autoColor?: boolean; // Auto-determine color from score value
}

const ScoreBadge = forwardRef<HTMLDivElement, ScoreBadgeProps>(
  (
    {
      className,
      score,
      scoreColor,
      showLabel = true,
      autoColor = true,
      ...props
    },
    ref,
  ) => {
    // Auto-determine color if enabled and not explicitly set
    const actualScoreColor =
      autoColor && !scoreColor ? getScoreColorFromValue(score) : scoreColor;

    const { container, label, value } = scoreBadgeVariants({
      scoreColor: actualScoreColor,
    });

    return (
      <div ref={ref} className={container({ className })} {...props}>
        {showLabel && <span className={label()}>score:</span>}
        <span className={value()}>{score}</span>
      </div>
    );
  },
);

ScoreBadge.displayName = "ScoreBadge";

export { ScoreBadge, scoreBadgeVariants, getScoreColorFromValue };

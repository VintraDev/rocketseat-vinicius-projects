import { forwardRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "@/components/ui/score-ring";

const scoreHeroVariants = tv({
  slots: {
    container: [
      "flex",
      "items-center",
      "gap-12", // 48px gap between ring and summary
      "w-full",
    ],
    summary: [
      "flex",
      "flex-col",
      "gap-4", // 16px gap between elements
      "flex-1",
    ],
    roastQuote: [
      "font-[IBM_Plex_Mono]",
      "text-xl", // 20px
      "font-normal",
      "text-devroast-text-primary",
      "leading-relaxed", // lineHeight: 1.5
    ],
    metaRow: [
      "flex",
      "items-center",
      "gap-4", // 16px gap
    ],
    metaText: [
      "font-mono",
      "text-xs", // 12px
      "font-normal",
      "text-devroast-text-tertiary",
    ],
    shareButton: [
      "inline-flex",
      "items-center",
      "gap-1.5", // 6px gap
      "px-4", // 16px horizontal padding
      "py-2", // 8px vertical padding
      "border",
      "border-devroast-border",
      "bg-transparent",
      "font-mono",
      "text-xs", // 12px
      "font-normal",
      "text-devroast-text-primary",
      "hover:bg-devroast-surface",
      "transition-colors",
      "cursor-pointer",
    ],
  },
  variants: {
    responsive: {
      true: {
        container: "flex-col lg:flex-row gap-8 lg:gap-12",
        summary: "w-full",
      },
      false: {},
    },
  },
  defaultVariants: {
    responsive: false,
  },
});

export interface ScoreHeroProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof scoreHeroVariants> {
  score: number;
  verdict: string;
  roastQuote: string;
  language: string;
  lines: number;
  onShare?: () => void;
  showShareButton?: boolean;
  responsive?: boolean;
}

const ScoreHero = forwardRef<HTMLDivElement, ScoreHeroProps>(
  (
    {
      className,
      score,
      verdict,
      roastQuote,
      language,
      lines,
      onShare,
      showShareButton = false,
      responsive,
      ...props
    },
    ref,
  ) => {
    const {
      container,
      summary,
      roastQuote: quoteClass,
      metaRow,
      metaText,
      shareButton,
    } = scoreHeroVariants({ responsive });

    // Auto-determine badge variant based on score
    const getBadgeVariant = (scoreValue: number) => {
      if (scoreValue <= 3) return "critical"; // red
      if (scoreValue <= 6) return "warning"; // orange/yellow
      return "good"; // green
    };

    const badgeVariant = getBadgeVariant(score);

    return (
      <div ref={ref} className={container({ className })} {...props}>
        {/* Score Ring */}
        <ScoreRing score={score} maxScore={10} size="lg" />

        {/* Roast Summary */}
        <div className={summary()}>
          {/* Verdict Badge */}
          <Badge variant={badgeVariant} size="md">
            {verdict}
          </Badge>

          {/* Roast Quote */}
          <p className={quoteClass()}>"{roastQuote}"</p>

          {/* Meta Row: Language & Lines */}
          <div className={metaRow()}>
            <span className={metaText()}>lang: {language}</span>
            <span className={metaText()}>·</span>
            <span className={metaText()}>
              {lines} {lines === 1 ? "line" : "lines"}
            </span>
          </div>

          {/* Share Button */}
          {showShareButton ? (
            <div>
              <button
                type="button"
                className={shareButton()}
                onClick={onShare}
                aria-label="Share roast"
              >
                $ share_roast
              </button>
            </div>
          ) : null}
        </div>
      </div>
    );
  },
);

ScoreHero.displayName = "ScoreHero";

export { ScoreHero, scoreHeroVariants };

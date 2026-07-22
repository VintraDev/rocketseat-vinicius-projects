import { forwardRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const analysisCardVariants = tv({
  slots: {
    container: [
      "w-full",
      "border",
      "border-devroast-border",
      "p-5", // 20px per design
      "flex",
      "flex-col",
      "gap-3", // 12px per design
      "font-mono",
    ],
    header: ["flex", "items-center", "gap-2"], // 8px per design
    dot: ["w-2", "h-2", "rounded-full", "shrink-0"],
    label: ["text-xs", "font-medium"],
    title: [
      "text-[13px]",
      "font-medium",
      "text-devroast-text-primary",
      "leading-normal",
    ],
    description: [
      "text-xs",
      "font-normal",
      "text-devroast-text-secondary",
      "leading-[1.5]",
      "font-[IBM_Plex_Mono]",
    ],
  },
  variants: {
    severity: {
      critical: {
        dot: "bg-devroast-red",
        label: "text-devroast-red",
      },
      warning: {
        dot: "bg-devroast-orange",
        label: "text-devroast-orange",
      },
      good: {
        dot: "bg-devroast-green",
        label: "text-devroast-green",
      },
    },
  },
  defaultVariants: {
    severity: "warning",
  },
});

export interface AnalysisCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof analysisCardVariants> {
  severity: "critical" | "warning" | "good";
  title: string;
  description: string;
}

const AnalysisCard = forwardRef<HTMLDivElement, AnalysisCardProps>(
  ({ className, severity, title, description, ...props }, ref) => {
    const {
      container,
      header,
      dot,
      label,
      title: titleClass,
      description: descriptionClass,
    } = analysisCardVariants({ severity });

    return (
      <div ref={ref} className={container({ className })} {...props}>
        {/* Header with badge */}
        <div className={header()}>
          <div className={dot()} />
          <span className={label()}>{severity}</span>
        </div>

        {/* Title */}
        <h3 className={titleClass()}>{title}</h3>

        {/* Description */}
        <p className={descriptionClass()}>{description}</p>
      </div>
    );
  },
);

AnalysisCard.displayName = "AnalysisCard";

export { AnalysisCard, analysisCardVariants };

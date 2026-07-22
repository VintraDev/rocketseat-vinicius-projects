import { forwardRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const badgeVariants = tv({
  slots: {
    root: [
      "inline-flex",
      "items-center",
      "gap-2", // 8px gap between dot and text
      "font-mono",
      "font-normal", // normal weight as per design
    ],
    dot: [
      "shrink-0",
      "h-2", // 8px
      "w-2", // 8px
      "rounded-full",
    ],
    text: [
      "text-xs", // 12px base size
      "leading-none",
    ],
  },
  variants: {
    variant: {
      critical: {
        dot: "bg-devroast-red", // $accent-red
        text: "text-devroast-red",
      },
      warning: {
        dot: "bg-devroast-orange", // $accent-amber
        text: "text-devroast-orange",
      },
      good: {
        dot: "bg-devroast-green", // $accent-green
        text: "text-devroast-green",
      },
      // Aliases for common usage
      error: {
        dot: "bg-devroast-red",
        text: "text-devroast-red",
      },
      success: {
        dot: "bg-devroast-green",
        text: "text-devroast-green",
      },
      // Default neutral variant
      default: {
        dot: "bg-devroast-text-muted",
        text: "text-devroast-text-primary",
      },
    },
    size: {
      sm: {
        dot: "h-1.5 w-1.5", // 6px
        text: "text-xs",
        root: "gap-1.5", // 6px gap
      },
      md: {
        dot: "h-2 w-2", // 8px - exact Pencil spec
        text: "text-xs", // 12px
        root: "gap-2", // 8px gap
      },
      lg: {
        dot: "h-2.5 w-2.5", // 10px
        text: "text-sm", // 14px
        root: "gap-2", // 8px gap
      },
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    const { root, dot, text } = badgeVariants({ variant, size });

    return (
      <div ref={ref} className={root({ className })} {...props}>
        <div className={dot()} />
        <span className={text()}>{children}</span>
      </div>
    );
  },
);

Badge.displayName = "Badge";

export { Badge, badgeVariants };

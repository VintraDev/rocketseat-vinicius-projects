import { forwardRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const typographyVariants = tv({
  variants: {
    variant: {
      h1: [
        "font-mono",
        "font-bold",
        "text-2xl", // Mobile: 24px
        "sm:text-3xl", // Tablet: 30px
        "lg:text-4xl", // Desktop: 36px
        "text-devroast-text-primary",
        "tracking-tight",
      ],
      h2: [
        "font-mono",
        "font-bold",
        "text-xl", // Mobile: 20px
        "sm:text-2xl", // Tablet: 24px
        "lg:text-3xl", // Desktop: 30px
        "text-devroast-text-primary",
        "tracking-tight",
      ],
      h3: [
        "font-mono",
        "font-bold",
        "text-lg", // Mobile: 18px
        "sm:text-xl", // Tablet: 20px
        "lg:text-2xl", // Desktop: 24px
        "text-devroast-text-primary",
        "tracking-tight",
      ],
      h4: [
        "font-mono",
        "font-medium",
        "text-base", // Mobile: 16px
        "sm:text-lg", // Tablet: 18px
        "lg:text-xl", // Desktop: 20px
        "text-devroast-text-primary",
        "tracking-tight",
      ],
      body: [
        "font-mono",
        "text-sm", // Mobile: 14px
        "sm:text-base", // Desktop: 16px
        "text-devroast-text-primary",
        "leading-relaxed",
      ],
      bodySecondary: [
        "font-mono",
        "text-sm", // Mobile: 14px
        "sm:text-base", // Desktop: 16px
        "text-devroast-text-secondary",
        "leading-relaxed",
      ],
      small: [
        "font-mono",
        "text-xs", // Mobile: 12px
        "sm:text-sm", // Desktop: 14px
        "text-devroast-text-secondary",
        "leading-normal",
      ],
      muted: [
        "font-mono",
        "text-xs", // Mobile: 12px
        "sm:text-sm", // Desktop: 14px
        "text-devroast-text-muted",
        "leading-normal",
      ],
      code: [
        "font-mono",
        "text-xs", // Mobile: 12px
        "sm:text-sm", // Desktop: 14px
        "bg-devroast-surface",
        "border",
        "border-devroast-border",
        "px-1.5", // Mobile: smaller padding
        "sm:px-2", // Desktop: original padding
        "py-0.5",
        "sm:py-1",
        "text-devroast-code-orange",
        "rounded",
      ],
      lead: [
        "font-mono",
        "text-lg", // Mobile: 18px
        "sm:text-xl", // Desktop: 20px
        "text-devroast-text-secondary",
        "leading-relaxed",
      ],
    },
    responsive: {
      true: {
        // Additional responsive utilities
      },
      false: {
        // Keep original sizing
      },
    },
  },
  defaultVariants: {
    variant: "body",
    responsive: true, // Enable responsive by default
  },
});

// Individual typography components for better type safety
export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {}

const H1 = forwardRef<HTMLHeadingElement, Omit<TypographyProps, "variant">>(
  ({ className, ...props }, ref) => {
    return (
      <h1
        ref={ref}
        className={typographyVariants({ className, variant: "h1" })}
        {...props}
      />
    );
  },
);

const H2 = forwardRef<HTMLHeadingElement, Omit<TypographyProps, "variant">>(
  ({ className, ...props }, ref) => {
    return (
      <h2
        ref={ref}
        className={typographyVariants({ className, variant: "h2" })}
        {...props}
      />
    );
  },
);

const H3 = forwardRef<HTMLHeadingElement, Omit<TypographyProps, "variant">>(
  ({ className, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={typographyVariants({ className, variant: "h3" })}
        {...props}
      />
    );
  },
);

const H4 = forwardRef<HTMLHeadingElement, Omit<TypographyProps, "variant">>(
  ({ className, ...props }, ref) => {
    return (
      <h4
        ref={ref}
        className={typographyVariants({ className, variant: "h4" })}
        {...props}
      />
    );
  },
);

const Text = forwardRef<
  HTMLParagraphElement,
  Omit<TypographyProps, "variant"> & {
    variant?: "body" | "bodySecondary" | "small" | "muted" | "lead";
  }
>(({ className, variant = "body", ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={typographyVariants({ className, variant })}
      {...props}
    />
  );
});

const Code = forwardRef<HTMLElement, Omit<TypographyProps, "variant">>(
  ({ className, ...props }, ref) => {
    return (
      <code
        ref={ref}
        className={typographyVariants({ className, variant: "code" })}
        {...props}
      />
    );
  },
);

H1.displayName = "H1";
H2.displayName = "H2";
H3.displayName = "H3";
H4.displayName = "H4";
Text.displayName = "Text";
Code.displayName = "Code";

export { H1, H2, H3, H4, Text, Code, typographyVariants };

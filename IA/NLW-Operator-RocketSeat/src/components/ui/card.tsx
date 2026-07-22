import { forwardRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const cardVariants = tv({
  slots: {
    root: [
      "border",
      "border-devroast-border",
      "font-mono",
      "bg-transparent", // no background as per design
    ],
    header: [
      "flex",
      "flex-col",
      "space-y-2", // Smaller gap on mobile
      "sm:space-y-3", // 12px gap as per design on desktop
    ],
    title: [
      "font-mono",
      "font-normal", // normal weight as per design
      "text-xs", // Mobile: smaller text
      "sm:text-sm", // Desktop: 13px
      "text-devroast-text-primary",
      "leading-none",
    ],
    description: [
      "font-sans", // IBM Plex Mono represented as font-sans
      "text-xs", // 12px
      "font-normal",
      "text-devroast-text-secondary",
      "leading-relaxed", // lineHeight: 1.5
    ],
    content: [
      "pt-0", // no top padding since header has spacing
    ],
    footer: [
      "flex",
      "flex-col",
      "sm:flex-row",
      "sm:items-center",
      "pt-3",
      "gap-2",
      "sm:gap-0",
    ],
  },
  variants: {
    variant: {
      default: {
        root: "",
      },
      outlined: {
        root: "border-2",
      },
      elevated: {
        root: "shadow-md",
      },
    },
    padding: {
      none: {
        root: "p-0",
        header: "p-0",
        content: "p-0",
        footer: "p-0",
      },
      sm: {
        root: "p-2 sm:p-3", // Responsive padding
        header: "p-2 sm:p-3",
        content: "p-2 sm:p-3 pt-0",
        footer: "p-2 sm:p-3 pt-0",
      },
      md: {
        root: "p-3 sm:p-5", // Mobile: 12px, Desktop: 20px as per design
        header: "p-3 sm:p-5",
        content: "p-3 sm:p-5 pt-0",
        footer: "p-3 sm:p-5 pt-0",
      },
      lg: {
        root: "p-4 sm:p-6", // Mobile: 16px, Desktop: 24px
        header: "p-4 sm:p-6",
        content: "p-4 sm:p-6 pt-0",
        footer: "p-4 sm:p-6 pt-0",
      },
    },
    responsive: {
      true: {
        root: "w-full lg:w-120", // Full width mobile, fixed desktop
      },
      false: {
        root: "", // Keep original width behavior
      },
    },
  },
  defaultVariants: {
    variant: "default",
    padding: "md",
    responsive: false,
  },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface CardTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {}
export interface CardDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}
export interface CardContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, responsive, ...props }, ref) => {
    const { root } = cardVariants({ variant, padding, responsive });
    return <div ref={ref} className={root({ className })} {...props} />;
  },
);

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => {
    const { header } = cardVariants();
    return <div ref={ref} className={header({ className })} {...props} />;
  },
);

const CardTitle = forwardRef<HTMLParagraphElement, CardTitleProps>(
  ({ className, ...props }, ref) => {
    const { title } = cardVariants();
    return <h3 ref={ref} className={title({ className })} {...props} />;
  },
);

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => {
    const { description } = cardVariants();
    return <p ref={ref} className={description({ className })} {...props} />;
  },
);

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => {
    const { content } = cardVariants();
    return <div ref={ref} className={content({ className })} {...props} />;
  },
);

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => {
    const { footer } = cardVariants();
    return <div ref={ref} className={footer({ className })} {...props} />;
  },
);

Card.displayName = "Card";
CardHeader.displayName = "CardHeader";
CardTitle.displayName = "CardTitle";
CardDescription.displayName = "CardDescription";
CardContent.displayName = "CardContent";
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cardVariants,
};

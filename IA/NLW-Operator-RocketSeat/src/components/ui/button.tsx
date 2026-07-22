import { type ComponentProps, forwardRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const buttonVariants = tv({
  base: "inline-flex items-center justify-center gap-2 rounded-(--radius-button) font-medium font-mono transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-button-focus-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  variants: {
    variant: {
      primary:
        "bg-button-primary text-button-primary-foreground enabled:hover:bg-button-primary-hover",
      secondary:
        "border border-devroast-border text-devroast-text-primary enabled:hover:bg-devroast-surface",
      ghost:
        "text-devroast-text-secondary enabled:hover:bg-devroast-surface enabled:hover:text-devroast-text-primary",
    },
    size: {
      default: "px-4 py-2 text-xs sm:px-6 sm:py-2.5 sm:text-[13px]",
      sm: "px-3 py-1.5 text-xs sm:px-4 sm:py-2",
      lg: "px-5 py-2.5 text-sm sm:px-7 sm:py-3",
      icon: "size-8 p-0 sm:size-10",
    },
    fullWidth: {
      true: "w-full",
    },
    responsive: {
      true: "w-full sm:w-auto", // Full width on mobile, auto on desktop
      false: "",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "default",
    responsive: false,
  },
});

export type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      fullWidth,
      size,
      type = "button",
      variant,
      responsive,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        className={buttonVariants({
          className,
          fullWidth,
          size,
          variant,
          responsive,
        })}
        ref={ref}
        type={type}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { buttonVariants };

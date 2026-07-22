import Link from "next/link";
import { forwardRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const responsiveLinkVariants = tv({
  base: "font-mono transition-colors cursor-pointer",
  variants: {
    variant: {
      inline:
        "text-devroast-text-muted enabled:hover:text-devroast-text-primary",
      button:
        "inline-flex items-center justify-center gap-2 rounded-(--radius-button) font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-button-focus-ring focus-visible:ring-offset-2",
    },
    size: {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      default: "px-4 py-2 text-xs sm:px-6 sm:py-2.5 sm:text-[13px]",
    },
    buttonStyle: {
      primary:
        "bg-button-primary text-button-primary-foreground enabled:hover:bg-button-primary-hover",
      secondary:
        "border border-devroast-border text-devroast-text-primary enabled:hover:bg-devroast-surface",
      ghost:
        "text-devroast-text-secondary enabled:hover:bg-devroast-surface enabled:hover:text-devroast-text-primary",
    },
    responsive: {
      true: "w-full sm:w-auto", // Full width on mobile, auto on desktop
      false: "",
    },
  },
  defaultVariants: {
    variant: "inline",
    size: "xs",
  },
});

export interface ResponsiveLinkProps
  extends Omit<React.ComponentProps<typeof Link>, "href">,
    VariantProps<typeof responsiveLinkVariants> {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}

const ResponsiveLink = forwardRef<HTMLAnchorElement, ResponsiveLinkProps>(
  (
    {
      className,
      children,
      href,
      variant,
      size,
      buttonStyle,
      responsive,
      external = false,
      ...props
    },
    ref,
  ) => {
    const linkProps = external
      ? {
          target: "_blank",
          rel: "noopener noreferrer",
        }
      : {};

    return (
      <Link
        ref={ref}
        href={href}
        className={responsiveLinkVariants({
          className,
          variant,
          size,
          buttonStyle,
          responsive,
        })}
        {...linkProps}
        {...props}
      >
        {children}
      </Link>
    );
  },
);

ResponsiveLink.displayName = "ResponsiveLink";

export { ResponsiveLink, responsiveLinkVariants };

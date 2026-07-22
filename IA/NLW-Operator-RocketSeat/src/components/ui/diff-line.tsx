import * as React from "react";
import { tv, type VariantProps } from "tailwind-variants";

const diffLineVariants = tv({
  base: "flex items-start font-mono text-xs font-normal px-4 py-1.5 w-full min-w-0",
  variants: {
    type: {
      added: "bg-[#10B98115] text-[#10B981]",
      removed: "bg-[#EF444415] text-[#EF4444]",
      context: "bg-transparent text-devroast-text-primary",
    },
  },
  defaultVariants: {
    type: "context",
  },
});

export interface DiffLineProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof diffLineVariants> {
  code: string;
  lineNumber?: number;
}

const DiffLine = React.forwardRef<HTMLDivElement, DiffLineProps>(
  ({ className, type, code, lineNumber, ...props }, ref) => {
    const getPrefix = () => {
      switch (type) {
        case "added":
          return "+";
        case "removed":
          return "-";
        default:
          return " ";
      }
    };

    const getPrefixColor = () => {
      switch (type) {
        case "added":
          return "text-devroast-green";
        case "removed":
          return "text-devroast-red";
        default:
          return "text-devroast-text-tertiary";
      }
    };

    return (
      <div
        ref={ref}
        className={diffLineVariants({ className, type })}
        {...props}
      >
        <span className={`select-none w-5 shrink-0 ${getPrefixColor()}`}>
          {getPrefix()}
        </span>
        <span className="flex-1 min-w-0 break-all whitespace-pre-wrap leading-relaxed">
          {code}
        </span>
      </div>
    );
  },
);
DiffLine.displayName = "DiffLine";

export { DiffLine, diffLineVariants };

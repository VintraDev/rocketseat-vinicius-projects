"use client";

import { forwardRef, useState } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const toggleVariants = tv({
  slots: {
    root: [
      "inline-flex",
      "items-center",
      "gap-3",
      "cursor-pointer",
      "group",
      "data-[disabled]:cursor-not-allowed",
      "data-[disabled]:opacity-50",
    ],
    track: [
      "relative",
      "inline-flex",
      "items-center",
      "h-5.5",
      "w-10",
      "shrink-0",
      "rounded-full",
      "bg-devroast-border",
      "transition-colors",
      "duration-200",
      "ease-in-out",
      "focus-visible:outline-none",
      "focus-visible:ring-2",
      "focus-visible:ring-devroast-green",
      "focus-visible:ring-offset-2",
      "focus-visible:ring-offset-devroast-bg",
      "data-[checked=true]:bg-devroast-green",
      "disabled:cursor-not-allowed",
      "disabled:opacity-50",
      "p-0.5",
    ],
    thumb: [
      "pointer-events-none",
      "block",
      "h-4",
      "w-4",
      "rounded-full",
      "bg-devroast-text-muted",
      "transition-transform",
      "duration-200",
      "ease-in-out",
      "data-[checked=true]:bg-devroast-bg",
      "translate-x-0",
      "data-[checked=true]:translate-x-5",
    ],
    label: [
      "font-mono",
      "text-xs",
      "font-normal",
      "text-devroast-text-secondary",
      "select-none",
      "cursor-pointer",
      "data-[checked=true]:text-devroast-green",
      "data-[disabled]:cursor-not-allowed",
      "data-[disabled]:opacity-50",
    ],
    input: ["sr-only"],
  },
  variants: {
    size: {
      sm: {
        track: "h-4 w-8 p-0.5",
        thumb: "h-3 w-3 data-[checked=true]:translate-x-4",
        label: "text-xs",
      },
      md: {
        track: "h-5.5 w-10 p-0.5",
        thumb: "h-4 w-4 data-[checked=true]:translate-x-5",
        label: "text-xs",
      },
      lg: {
        track: "h-6 w-12 p-1",
        thumb: "h-4 w-4 data-[checked=true]:translate-x-6",
        label: "text-sm",
      },
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export interface ToggleProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof toggleVariants> {
  label?: string;
  description?: string;
  onCheckedChange?: (checked: boolean) => void;
}

const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  (
    {
      className,
      size,
      label,
      description,
      onCheckedChange,
      onChange,
      defaultChecked = false,
      checked,
      disabled,
      ...props
    },
    ref,
  ) => {
    const [internalChecked, setInternalChecked] = useState(defaultChecked);

    const isControlled = checked !== undefined;
    const isChecked = isControlled ? checked : internalChecked;

    const {
      root,
      track,
      thumb,
      label: labelClass,
      input,
    } = toggleVariants({ size });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = e.target.checked;
      if (!isControlled) setInternalChecked(newChecked);
      onCheckedChange?.(newChecked);
      onChange?.(e);
    };

    return (
      <label
        className={root({ className })}
        data-disabled={disabled}
        aria-disabled={disabled}
      >
        <input
          ref={ref}
          type="checkbox"
          className={input()}
          checked={isChecked}
          onChange={handleChange}
          disabled={disabled}
          role="switch"
          aria-checked={isChecked}
          aria-label={label || "Toggle"}
          {...props}
        />
        <div
          className={track()}
          data-checked={isChecked}
          data-disabled={disabled}
          aria-hidden="true"
        >
          <div
            className={thumb()}
            data-checked={isChecked}
            data-disabled={disabled}
          />
        </div>
        {label && (
          <div className="flex flex-col">
            <span
              className={labelClass()}
              data-checked={isChecked}
              data-disabled={disabled}
            >
              {label}
            </span>
            {description && (
              <span className="font-mono text-xs text-devroast-text-secondary">
                {description}
              </span>
            )}
          </div>
        )}
      </label>
    );
  },
);

Toggle.displayName = "Toggle";

export { Toggle, toggleVariants };

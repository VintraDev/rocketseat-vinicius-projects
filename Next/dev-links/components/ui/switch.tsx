"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  size = "default",
  children,
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default"
  children?: React.ReactNode
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-(--border-color) bg-(--surface-color) hover:bg-(--surface-color-hover) backdrop-blur-md transition-all outline-none cursor-pointer p-0.5 data-[size=default]:h-8 data-[size=default]:w-16 data-[size=sm]:h-6 data-[size=sm]:w-12 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none flex items-center justify-center rounded-full bg-white text-black shadow-md transition-transform duration-200",
          "group-data-[size=default]/switch:size-9 group-data-[size=sm]/switch:size-5",
          "group-data-checked/switch:translate-x-8 group-data-unchecked/switch:-translate-x-2"
        )}
      >
        {children}
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  )
}

export { Switch }

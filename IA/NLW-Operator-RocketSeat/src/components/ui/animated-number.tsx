"use client";

import NumberFlow from "@number-flow/react";
import type { ComponentProps } from "react";
import { useEffect, useState } from "react";

type NumberFlowFormat = ComponentProps<typeof NumberFlow>["format"];

type AnimatedNumberProps = {
  value: number;
  format?: NumberFlowFormat;
  suffix?: string;
  className?: string;
};

export function AnimatedNumber({
  value,
  format,
  suffix,
  className,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  return (
    <NumberFlow
      value={displayValue}
      format={format}
      suffix={suffix}
      className={className}
    />
  );
}

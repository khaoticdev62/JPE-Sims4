/**
 * SliderInput — Slider with label and value display
 */
import * as React from "react";
import { cn } from "@/components/ui/utils";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

export interface SliderInputProps {
  label: string;
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  showValue?: boolean;
  className?: string;
}

export function SliderInput({
  label,
  value,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  showValue = true,
  className,
}: SliderInputProps) {
  const sliderId = React.useId();
  const currentValue = value || defaultValue || [min];

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label id={sliderId}>{label}</Label>
        {showValue && (
          <span className="text-[10px] font-mono text-text-muted">
            {currentValue.map((v) => v.toFixed(step < 1 ? 2 : 0)).join(", ")}
          </span>
        )}
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        aria-labelledby={sliderId}
      />
    </div>
  );
}

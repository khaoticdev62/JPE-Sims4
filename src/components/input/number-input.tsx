/**
 * NumberInput — Number input with label
 */
import * as React from "react";
import { cn } from "@/components/ui/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  error?: string;
}

export function NumberInput({ label, error, className, id, min, max, step, ...props }: NumberInputProps) {
  const inputId = id || React.useId();

  return (
    <div className="space-y-1.5">
      {label && <Label htmlFor={inputId}>{label}</Label>}
      <Input
        id={inputId}
        type="number"
        min={min}
        max={max}
        step={step}
        aria-invalid={!!error}
        className={cn("[&::-webkit-inner-spin-button]:opacity-50", className)}
        {...props}
      />
      {error && <p className="text-[10px] text-rose">{error}</p>}
    </div>
  );
}

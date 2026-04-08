/**
 * RadioInput — Radio button with label
 */
import * as React from "react";
import { cn } from "@/components/ui/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

export interface RadioInputProps {
  label?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  options: RadioOption[];
  direction?: "vertical" | "horizontal";
  error?: string;
  className?: string;
}

export function RadioInput({
  label,
  value,
  onValueChange,
  options,
  direction = "vertical",
  error,
  className,
}: RadioInputProps) {
  const groupId = React.useId();

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      <RadioGroup value={value} onValueChange={onValueChange} className={direction === "horizontal" ? "flex flex-row gap-4" : "space-y-1.5"}>
        {options.map((option) => (
          <div key={option.value} className="flex items-center gap-2">
            <RadioGroupItem value={option.value} id={`${groupId}-${option.value}`} />
            <div>
              <Label htmlFor={`${groupId}-${option.value}`} className="cursor-pointer normal-case tracking-normal text-[11px]">
                {option.label}
              </Label>
              {option.description && <p className="text-[10px] text-text-muted">{option.description}</p>}
            </div>
          </div>
        ))}
      </RadioGroup>
      {error && <p className="text-[10px] text-rose">{error}</p>}
    </div>
  );
}

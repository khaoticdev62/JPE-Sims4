/**
 * CheckboxInput — Checkbox with label
 */
import * as React from "react";
import { cn } from "@/components/ui/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export interface CheckboxInputProps {
  label: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export function CheckboxInput({ label, checked, onCheckedChange, disabled, id, className }: CheckboxInputProps) {
  const checkboxId = id || React.useId();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Checkbox id={checkboxId} checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
      <Label htmlFor={checkboxId} className="cursor-pointer text-[11px] normal-case tracking-normal">
        {label}
      </Label>
    </div>
  );
}

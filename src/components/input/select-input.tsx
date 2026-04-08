/**
 * SelectInput — Select input with label
 */
import * as React from "react";
import { cn } from "@/components/ui/utils";
import { Label } from "@/components/ui/label";
import {
  Select as SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectInputProps {
  label?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  className?: string;
}

export function SelectInput({
  label,
  value,
  onValueChange,
  options,
  placeholder = "Select...",
  error,
  className,
}: SelectInputProps) {
  const selectId = React.useId();

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && <Label htmlFor={selectId}>{label}</Label>}
      <SelectRoot value={value} onValueChange={onValueChange}>
        <SelectTrigger id={selectId} className="h-[32px] text-[12px]">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectRoot>
      {error && <p className="text-[10px] text-rose">{error}</p>}
    </div>
  );
}

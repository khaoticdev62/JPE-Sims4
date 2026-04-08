/**
 * ToggleInput — Toggle switch with label
 */
import * as React from "react";
import { cn } from "@/components/ui/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export interface ToggleInputProps {
  label: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  description?: string;
  id?: string;
  className?: string;
}

export function ToggleInput({
  label,
  checked,
  onCheckedChange,
  disabled,
  description,
  id,
  className,
}: ToggleInputProps) {
  const switchId = id || React.useId();

  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <div className="space-y-0.5">
        <Label htmlFor={switchId} className="cursor-pointer normal-case tracking-normal">
          {label}
        </Label>
        {description && <p className="text-[10px] text-text-muted">{description}</p>}
      </div>
      <Switch id={switchId} checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
  );
}

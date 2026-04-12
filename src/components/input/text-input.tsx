/**
 * TextInput — Text input with label
 */
import * as React from "react";
import { cn } from "@/components/ui/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function TextInput({ label, error, className, id, ...props }: TextInputProps) {
  const generatedId = React.useId();
  const inputId = id || generatedId;

  return (
    <div className="space-y-1.5">
      {label && <Label htmlFor={inputId}>{label}</Label>}
      <Input id={inputId} aria-invalid={!!error} className={cn(className)} {...props} />
      {error && <p className="text-[10px] text-rose">{error}</p>}
    </div>
  );
}

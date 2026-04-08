/**
 * JpeSpinner — Loading spinner with cyberpunk styling
 */
import * as React from "react";
import { cn } from "@/components/ui/utils";
import { Loader2 } from "lucide-react";

export interface JpeSpinnerProps {
  size?: number;
  color?: string;
  className?: string;
}

export function JpeSpinner({ size = 20, color = "#63B3ED", className }: JpeSpinnerProps) {
  return (
    <Loader2
      className={cn("animate-spin", className)}
      style={{ width: size, height: size, color }}
      aria-label="Loading"
    />
  );
}

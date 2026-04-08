/**
 * LoadingSpinner — Simple loading spinner
 */
import { JpeSpinner } from "@/components/jpe";
import { cn } from "@/components/ui/utils";

export interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  label?: string;
  className?: string;
}

export function LoadingSpinner({ size = 24, color = "#63B3ED", label, className }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <JpeSpinner size={size} color={color} />
      {label && <span className="text-[11px] text-text-secondary">{label}</span>}
    </div>
  );
}

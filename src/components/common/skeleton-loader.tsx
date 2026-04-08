/**
 * SkeletonLoader — Skeleton loader with variants
 */
import { JpeSkeleton } from "@/components/jpe";
import { cn } from "@/components/ui/utils";

export interface SkeletonLoaderProps {
  lines?: number;
  lastLineWidth?: string | number;
  className?: string;
}

export function SkeletonLoader({ lines = 3, lastLineWidth = "60%", className }: SkeletonLoaderProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <JpeSkeleton
          key={i}
          height={12}
          width={i === lines - 1 ? lastLineWidth : "100%"}
        />
      ))}
    </div>
  );
}

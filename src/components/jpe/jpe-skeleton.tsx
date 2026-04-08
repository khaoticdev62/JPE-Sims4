/**
 * JpeSkeleton — Skeleton loader with shimmer animation
 */
import * as React from "react";
import { cn } from "@/components/ui/utils";

export interface JpeSkeletonProps {
  width?: number | string;
  height?: number;
  rounded?: boolean;
  className?: string;
}

export function JpeSkeleton({
  width,
  height = 16,
  rounded = true,
  className,
}: JpeSkeletonProps) {
  return (
    <div
      className={cn("jpe-skeleton", rounded && "rounded-md", className)}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: `${height}px`,
      }}
      aria-hidden="true"
    />
  );
}

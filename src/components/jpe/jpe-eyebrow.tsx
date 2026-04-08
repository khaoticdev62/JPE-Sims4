/**
 * JpeEyebrow — Uppercase label component with micro-typography
 */
import * as React from "react";
import { cn } from "@/components/ui/utils";

export interface JpeEyebrowProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
}

export function JpeEyebrow({
  children,
  color = "#718096",
  className,
  as: Tag = "span",
}: JpeEyebrowProps) {
  return (
    <Tag
      className={cn("jpe-eyebrow select-none", className)}
      style={{ color }}
    >
      {children}
    </Tag>
  );
}

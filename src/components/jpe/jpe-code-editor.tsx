/**
 * JpeCodeEditor — Code editor with syntax highlighting (visual display)
 */
import * as React from "react";
import { cn } from "@/components/ui/utils";

export type JpeCodeLineType =
  | "tag"
  | "attr"
  | "value"
  | "comment"
  | "keyword"
  | "string"
  | "plain";

export interface JpeCodeLine {
  num: number;
  text: string;
  type: JpeCodeLineType;
}

const SYNTAX_COLORS: Record<JpeCodeLineType, string> = {
  tag: "#63B3ED",
  attr: "#A78BFA",
  value: "#48BB78",
  comment: "#4A5568",
  keyword: "#FC8181",
  string: "#F6AD55",
  plain: "#A0AEC0",
};

export interface JpeCodeEditorProps {
  lines: JpeCodeLine[];
  activeLine?: number;
  breakpoints?: number[];
  highlights?: number[];
  height?: number | string;
  title?: string;
  onLineClick?: (lineNum: number) => void;
  className?: string;
}

export function JpeCodeEditor({
  lines,
  activeLine,
  breakpoints = [],
  highlights = [],
  height = 300,
  title,
  onLineClick,
  className,
}: JpeCodeEditorProps) {
  return (
    <div
      className={cn("rounded-xl border border-border overflow-hidden", className)}
      style={{ backgroundColor: "#070810" }}
    >
      {/* Title bar */}
      {title && (
        <div
          className="px-3 py-1.5 border-b border-border uppercase tracking-wide font-semibold"
          style={{ fontSize: "10px", letterSpacing: "0.1em", backgroundColor: "#0f1116" }}
        >
          {title}
        </div>
      )}

      {/* Code area */}
      <div
        className="overflow-auto font-mono"
        style={{ height: typeof height === "number" ? `${height}px` : height, fontSize: "11px" }}
      >
        {lines.map((line) => {
          const isActive = line.num === activeLine;
          const isBreakpoint = breakpoints.includes(line.num);
          const isHighlighted = highlights.includes(line.num);

          return (
            <div
              key={line.num}
              className={cn(
                "flex items-start cursor-pointer transition-colors duration-fast",
                isActive && "bg-cyan-dim/50",
                isHighlighted && "bg-violet-dim/30",
                isBreakpoint && "border-l-[3px] border-l-rose"
              )}
              style={{
                borderLeftColor: isBreakpoint ? "#FC8181" : undefined,
              }}
              onClick={() => onLineClick?.(line.num)}
              role="row"
              aria-label={`Line ${line.num}`}
            >
              {/* Line number gutter */}
              <div
                className="shrink-0 select-none text-right pr-3 pl-3 w-10"
                style={{ color: "#2D3748", fontSize: "11px" }}
              >
                {line.num}
              </div>

              {/* Code text */}
              <div className="flex-1 py-0.5 pr-3 whitespace-pre">
                <span style={{ color: SYNTAX_COLORS[line.type] || SYNTAX_COLORS.plain }}>
                  {line.text}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

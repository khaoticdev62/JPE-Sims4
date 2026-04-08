/**
 * JpeGraphViewer — Node-edge graph visualization
 */
import * as React from "react";
import { cn } from "@/components/ui/utils";

export interface JpeGraphNode {
  id: string;
  label: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  color: string;
  size?: number;
  type?: string;
}

export interface JpeGraphEdge {
  from: string;
  to: string;
  color?: string;
  dashed?: boolean;
}

export interface JpeGraphViewerProps {
  nodes: JpeGraphNode[];
  edges: JpeGraphEdge[];
  height?: number;
  onNodeClick?: (id: string) => void;
  selectedNode?: string;
  className?: string;
}

export function JpeGraphViewer({
  nodes,
  edges,
  height = 280,
  onNodeClick,
  selectedNode,
  className,
}: JpeGraphViewerProps) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-xl border border-border", className)}
      style={{
        height,
        backgroundColor: "#070810",
      }}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* SVG edges */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {edges.map((edge, i) => {
          const fromNode = nodes.find((n) => n.id === edge.from);
          const toNode = nodes.find((n) => n.id === edge.to);
          if (!fromNode || !toNode) return null;

          return (
            <line
              key={i}
              x1={`${fromNode.x}%`}
              y1={`${fromNode.y}%`}
              x2={`${toNode.x}%`}
              y2={`${toNode.y}%`}
              stroke={edge.color || "rgba(99,179,237,0.2)"}
              strokeWidth={1.5}
              opacity={0.6}
              strokeDasharray={edge.dashed ? "4 4" : undefined}
            />
          );
        })}
      </svg>

      {/* Nodes */}
      {nodes.map((node) => {
        const size = node.size || 28;
        const isSelected = selectedNode === node.id;

        return (
          <button
            key={node.id}
            className={cn(
              "absolute rounded-full flex items-center justify-center transition-all duration-base cursor-pointer",
              isSelected && "z-10"
            )}
            style={{
              width: size,
              height: size,
              left: `${node.x}%`,
              top: `${node.y}%`,
              transform: "translate(-50%, -50%)",
              backgroundColor: `${node.color}25`,
              border: `2px solid ${isSelected ? node.color : `${node.color}60`}`,
              boxShadow: isSelected
                ? `0 0 16px ${node.color}40`
                : `0 0 8px ${node.color}15`,
            }}
            onClick={() => onNodeClick?.(node.id)}
            title={node.label}
            aria-label={`Node: ${node.label}`}
          >
            <span
              className="text-[8px] font-mono truncate px-1"
              style={{ color: node.color }}
            >
              {node.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

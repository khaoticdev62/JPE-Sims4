"use client";

/* JPE Studio — Code Minimap
   Canvas-based bird's-eye view of the code editor.
   Renders each line as coloured pixel rows; viewport indicator shows current scroll region.
   Clicking / dragging scrolls the editor. */

import { useRef, useEffect, useCallback, RefObject } from "react";
import { T } from "./robust/jpe-theme";

/* Token-type → minimap colour mapping */
const TOKEN_COLORS: Record<string, string> = {
  keyword:   "#8B5CF6",   // violet
  attr:      "#63B3ED",   // cyan
  value:     "#48BB78",   // emerald
  string:    "#F6AD55",   // amber
  number:    "#FC8181",   // rose
  comment:   "#4A5568",   // textMuted
  identifier:"#90CDF4",  // cyanBright
  tag:       "#63B3ED",
  punc:      "#4A5568",
  default:   "#718096",
};

export interface MinimapLine {
  num: number;
  text: string;
  tokens?: Array<{ type: string; text: string }>;
  error?: boolean | string;
  warning?: boolean | string;
}

interface CodeMinimapProps {
  lines: MinimapLine[];
  scrollRef: RefObject<HTMLDivElement | null>;
  /** Width of the minimap panel in px */
  width?: number;
  /** Pixel height per code line in the minimap (default: 2) */
  lineH?: number;
}

/** Measures character density into a greyscale array; used for per-line rendering */
function lineDensity(text: string, maxChars = 80): number[] {
  const result: number[] = new Array(10).fill(0);
  const step = maxChars / 10;
  for (let i = 0; i < 10; i++) {
    const chunk = text.slice(Math.floor(i * step), Math.floor((i + 1) * step));
    result[i] = Math.min(1, chunk.replace(/\s/g, "").length / (step * 0.8));
  }
  return result;
}

/** Parse a hex / rgba color string to [r, g, b] for canvas */
function parseColor(color: string): [number, number, number] {
  const hex = color.replace("#", "");
  if (hex.length === 6) {
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16),
    ];
  }
  // rgba fallback
  const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (m) return [+m[1], +m[2], +m[3]];
  return [113, 128, 150]; // textMuted
}

export function CodeMinimap({ lines, scrollRef, width = 72, lineH = 2 }: CodeMinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  /* ── Render minimap onto canvas ── */
  const renderMinimap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const W = width;
    const H = Math.max(1, lines.length * lineH);

    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    /* Background */
    ctx.fillStyle = "rgba(7,8,16,0.95)";
    ctx.fillRect(0, 0, W, H);

    /* Subtle left border glow */
    const grad = ctx.createLinearGradient(0, 0, 4, 0);
    grad.addColorStop(0, "rgba(99,179,237,0.12)");
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 4, H);

    /* Render lines */
    const leftPad = 6;
    const usableW = W - leftPad - 4;

    lines.forEach((line, idx) => {
      const y = idx * lineH;

      /* Error / warning gutter markers */
      if (line.error) {
        ctx.fillStyle = "rgba(252,129,129,0.35)";
        ctx.fillRect(0, y, 2, lineH);
      } else if (line.warning) {
        ctx.fillStyle = "rgba(246,173,85,0.35)";
        ctx.fillRect(0, y, 2, lineH);
      }

      /* Line body — iterate tokens if available */
      if (line.tokens && line.tokens.length > 0) {
        let xOffset = leftPad;
        const totalChars = line.tokens.reduce((s, t) => s + t.text.length, 0);
        const scale = totalChars > 0 ? usableW / Math.max(totalChars, 1) : 1;
        line.tokens.forEach(token => {
          const color = TOKEN_COLORS[token.type] || TOKEN_COLORS.default;
          const [r, g, b] = parseColor(color);
          const segW = Math.max(1, Math.round(token.text.replace(/\s/g, "").length * scale));
          if (segW > 0) {
            const alpha = 0.6 + (token.type === "keyword" ? 0.3 : token.type === "comment" ? -0.2 : 0);
            ctx.fillStyle = `rgba(${r},${g},${b},${Math.max(0.1, Math.min(0.9, alpha))})`;
            ctx.fillRect(xOffset, y + (lineH > 2 ? 0.5 : 0), segW, Math.max(1, lineH - (lineH > 2 ? 1 : 0)));
          }
          xOffset += Math.max(1, Math.round(token.text.length * scale));
          if (xOffset >= W - 4) return;
        });
      } else if (line.text && line.text.trim()) {
        /* Fallback: density-based grey bars */
        const density = lineDensity(line.text);
        const blockW = usableW / density.length;
        density.forEach((d, bi) => {
          if (d < 0.05) return;
          const alpha = d * 0.55;
          ctx.fillStyle = `rgba(113,128,150,${alpha})`;
          ctx.fillRect(leftPad + bi * blockW, y + (lineH > 2 ? 0.5 : 0), Math.max(1, blockW - 0.5), Math.max(1, lineH - 1));
        });
      }
    });
  }, [lines, width, lineH]);

  /* ── Draw viewport indicator ── */
  const drawViewport = useCallback(() => {
    const canvas = canvasRef.current;
    const scroller = scrollRef.current;
    if (!canvas || !scroller) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const totalH = lines.length * lineH;
    const scrollRatio = scroller.scrollTop / Math.max(1, scroller.scrollHeight - scroller.clientHeight);
    const viewportH = (scroller.clientHeight / Math.max(1, scroller.scrollHeight)) * totalH;
    const viewY = scrollRatio * (totalH - viewportH);

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    /* Redraw minimap before overlay to avoid accumulation */
    renderMinimap();

    /* Viewport highlight */
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fillRect(0, viewY, width, viewportH);

    /* Viewport border */
    ctx.strokeStyle = "rgba(99,179,237,0.3)";
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, viewY + 0.5, width - 1, viewportH - 1);

    /* Viewport top/bottom accent lines */
    ctx.strokeStyle = "rgba(99,179,237,0.6)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, viewY); ctx.lineTo(width, viewY);
    ctx.moveTo(0, viewY + viewportH); ctx.lineTo(width, viewY + viewportH);
    ctx.stroke();

    ctx.restore();
  }, [lines.length, lineH, width, scrollRef, renderMinimap]);

  /* Initial render + scroll listener */
  useEffect(() => {
    renderMinimap();
    const scroller = scrollRef.current;
    if (!scroller) return;
    const onScroll = () => drawViewport();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  }, [renderMinimap, drawViewport, scrollRef]);

  /* Re-render on lines change */
  useEffect(() => {
    renderMinimap();
    drawViewport();
  }, [lines, renderMinimap, drawViewport]);

  /* ── Click / drag to scroll ── */
  const scrollToY = useCallback((clientY: number) => {
    const container = containerRef.current;
    const scroller = scrollRef.current;
    if (!container || !scroller) return;
    const rect = container.getBoundingClientRect();
    const relY = clientY - rect.top + container.scrollTop;
    const totalMinimapH = lines.length * lineH;
    const ratio = Math.max(0, Math.min(1, relY / Math.max(1, totalMinimapH)));
    scroller.scrollTop = ratio * (scroller.scrollHeight - scroller.clientHeight);
  }, [lines.length, lineH, scrollRef]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    scrollToY(e.clientY);

    const onMove = (me: MouseEvent) => {
      if (isDraggingRef.current) scrollToY(me.clientY);
    };
    const onUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [scrollToY]);

  const totalH = lines.length * lineH;

  return (
    <div
      ref={containerRef}
      className="flex-shrink-0 overflow-y-auto relative"
      style={{
        width,
        borderLeft: `1px solid ${T.border}`,
        background: "rgba(7,8,16,0.95)",
        cursor: "pointer",
        userSelect: "none",
        scrollbarWidth: "none",
      }}
      onMouseDown={handleMouseDown}
      title="Minimap — click or drag to scroll"
      aria-label="Code minimap"
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: totalH,
          imageRendering: "pixelated",
        }}
      />
      {/* Subtle vertical label */}
      <div
        className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          writingMode: "vertical-rl",
          fontSize: 7,
          fontFamily: T.mono,
          color: T.textDim,
          letterSpacing: "0.08em",
          opacity: 0.5,
        }}
      >
        MINIMAP
      </div>
    </div>
  );
}

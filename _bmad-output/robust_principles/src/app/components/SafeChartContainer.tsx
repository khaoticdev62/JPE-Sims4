import { useRef, useState, useEffect, type ReactElement } from "react";

/**
 * A drop-in replacement for recharts' ResponsiveContainer that avoids
 * the "width(0) and height(0)" warning and the duplicate-null-key bug.
 * It measures the parent with ResizeObserver and only renders the chart
 * once dimensions are > 0, passing explicit pixel width/height.
 */
export function SafeChartContainer({
  children,
  className,
  style,
}: {
  children: ReactElement;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize((prev) => {
          if (prev.w === Math.floor(width) && prev.h === Math.floor(height)) return prev;
          return { w: Math.floor(width), h: Math.floor(height) };
        });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} style={{ width: "100%", height: "100%", ...style }}>
      {size.w > 0 && size.h > 0
        ? (() => {
            // Clone the chart element and inject explicit pixel width/height
            const { type, props } = children;
            return (
              // @ts-ignore – recharts chart components accept width/height
              <children.type {...props} width={size.w} height={size.h} />
            );
          })()
        : null}
    </div>
  );
}

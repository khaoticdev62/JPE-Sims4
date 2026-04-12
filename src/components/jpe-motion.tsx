"use client";

/**
 * JPE STUDIO — PROFESSIONAL ANIMATION SYSTEM
 * Motion tokens, animated wrappers, and reusable animation components
 * Based on the JPE Studio Animation Guide
 */
import { type ReactNode, createContext, useContext, useEffect, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════
   MOTION TOKENS
   ═══════════════════════════════════════════════════════════════ */

export const duration = {
  instant: 0.08,
  fast: 0.12,
  normal: 0.18,
  complex: 0.26,
  large: 0.34,
} as const;

export const easing = {
  outStandard: [0.16, 1, 0.3, 1] as [number, number, number, number],
  inOutSmooth: [0.4, 0, 0.2, 1] as [number, number, number, number],
  snappy: [0.2, 0.8, 0.2, 1] as [number, number, number, number],
} as const;

export const spring = {
  soft: { type: "spring" as const, stiffness: 380, damping: 28 },
  precise: { type: "spring" as const, stiffness: 520, damping: 35 },
} as const;

/* ═══════════════════════════════════════════════════════════════
   REDUCED MOTION CONTEXT
   ═══════════════════════════════════════════════════════════════ */

const ReducedMotionContext = createContext(false);

export function ReducedMotionProvider({ children }: { children: ReactNode }) {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return (
    <ReducedMotionContext.Provider value={reduced}>
      {children}
    </ReducedMotionContext.Provider>
  );
}

export function useReducedMotion() {
  return useContext(ReducedMotionContext);
}



/* ═══════════════════════════════════════════════════════════════
   PANEL EXPANSION — slides in with opacity + subtle scale
   ═══════════════════════════════════════════════════════════════ */

export function AnimatedPanel({
  children,
  direction = "left",
  width,
  className = "",
  style = {},
}: {
  children: ReactNode;
  direction?: "left" | "right" | "bottom";
  width?: number | string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const reduced = useReducedMotion();
  const slideX = direction === "left" ? -20 : direction === "right" ? 20 : 0;
  const slideY = direction === "bottom" ? 20 : 0;

  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, x: slideX, y: slideY, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, x: slideX, y: slideY, scale: 0.98 }}
      transition={reduced
        ? { duration: 0.1 }
        : { duration: 0.22, ease: easing.outStandard }
      }
      className={className}
      style={{ ...style, width, willChange: "transform, opacity" } as any}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   VIEW TRANSITION — cinematic cross-dissolve for workspace switch
   ═══════════════════════════════════════════════════════════════ */

export function ViewTransition({
  children,
  viewKey,
}: {
  children: ReactNode;
  viewKey: string;
}) {
  const reduced = useReducedMotion();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={viewKey}
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
        transition={reduced
          ? { duration: 0.1 }
          : { duration: 0.26, ease: easing.inOutSmooth }
        }
        className="flex-1 flex flex-col min-h-0"
        style={{ willChange: "transform, opacity" } as any}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MODAL OVERLAY — background blur + scale/fade entry
   ═══════════════════════════════════════════════════════════════ */

export function ModalOverlay({
  children,
  isOpen,
  onClose,
}: {
  children: ReactNode;
  isOpen: boolean;
  onClose?: () => void;
}) {
  const reduced = useReducedMotion();
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.1 : 0.24 }}
            className="fixed inset-0 z-[90]"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" } as any}
            onClick={onClose}
          />
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
            transition={reduced
              ? { duration: 0.1 }
              : { duration: 0.24, ease: easing.outStandard }
            }
            className="fixed z-[91]"
            style={{ willChange: "transform, opacity" } as any}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CONTEXT MENU / POPOVER — scale + fade from origin
   ═══════════════════════════════════════════════════════════════ */

export function PopoverMotion({
  children,
  className = "",
  style = {},
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: -4 }}
      transition={reduced
        ? { duration: 0.08 }
        : { duration: 0.18, ease: easing.outStandard }
      }
      className={className}
      style={{ ...style, willChange: "transform, opacity", transformOrigin: "top left" } as any}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STAGGER LIST — cascading reveal for list items
   ═══════════════════════════════════════════════════════════════ */

const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.012,
    },
  },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.14, ease: [0.16, 1, 0.3, 1] },
  },
};

export function StaggerList({
  children,
  className = "",
  style = {},
  role,
  "aria-label": ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  role?: string;
  "aria-label"?: string;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className} style={style} role={role} aria-label={ariaLabel}>{children}</div>;
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className={className}
      style={style}
      role={role}
      aria-label={ariaLabel}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = "",
  style = {},
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div variants={staggerItem} className={className} style={style}>
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DIAGNOSTIC ALERT — slide-down from top with glow pulse
   ═══════════════════════════════════════════════════════════════ */

export function DiagnosticAlert({
  children,
  className = "",
  style = {},
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, y: -16 }}
      transition={reduced
        ? { duration: 0.1 }
        : { duration: 0.2, ease: easing.outStandard }
      }
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ERROR SHAKE — micro-motion 2px horizontal oscillation
   ═══════════════════════════════════════════════════════════════ */

export function ErrorShake({
  children,
  trigger,
  className = "",
  style = {},
}: {
  children: ReactNode;
  trigger: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      animate={trigger ? {
        x: [0, -2, 2, -2, 2, -1, 1, 0],
        transition: { duration: 0.12 },
      } : { x: 0 }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SUCCESS DRAW — animated checkmark SVG
   ═══════════════════════════════════════════════════════════════ */

export function SuccessCheck({ size = 24, color = "#48BB78" }: { size?: number; color?: string }) {
  const reduced = useReducedMotion();
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <motion.circle
        cx="12" cy="12" r="10"
        stroke={color}
        strokeWidth="2"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={reduced ? { duration: 0.1 } : { duration: 0.22, ease: easing.outStandard }}
      />
      <motion.path
        d="M8 12l2.5 2.5L16 9"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={reduced ? { duration: 0.1 } : { duration: 0.22, delay: 0.12, ease: easing.outStandard }}
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SKELETON SHIMMER — loading state placeholder
   ═══════════════════════════════════════════════════════════════ */

export function SkeletonShimmer({
  width = "100%",
  height = 12,
  borderRadius = 6,
  className = "",
}: {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        width,
        height,
        borderRadius,
        background: "rgba(255,255,255,0.04)",
      }}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
        } as any}
        animate={{ x: ["-100%", "100%"] }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COLLAPSIBLE PANEL — smooth height animation for console/panel
   ═══════════════════════════════════════════════════════════════ */

export function CollapsibleSection({
  children,
  isOpen,
  height,
  className = "",
  style = {},
}: {
  children: ReactNode;
  isOpen: boolean;
  height: number | string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const reduced = useReducedMotion();
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
          animate={{ opacity: 1, height }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
          transition={reduced
            ? { duration: 0.1 }
            : { duration: 0.26, ease: easing.inOutSmooth }
          }
          className={className}
          style={{ ...style, overflow: "hidden", willChange: "height, opacity" } as any}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* Re-export motion and AnimatePresence for convenience */
export { motion, AnimatePresence };

/* ═══════════════════════════════════════════════════════════════
   FADE IN — simple opacity + y translate entry
   ═══════════════════════════════════════════════════════════════ */

export function FadeIn({
  children,
  delay = 0,
  y = 8,
  className = "",
  style = {},
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduced
        ? { duration: 0.1, delay }
        : { duration: 0.22, delay, ease: easing.outStandard }
      }
      className={className}
      style={{ ...style, willChange: "transform, opacity" } as any}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SLIDE PANEL — side-sliding panel with spring physics
   ═══════════════════════════════════════════════════════════════ */

export function SlidePanel({
  children,
  direction = "left",
  className = "",
  style = {},
}: {
  children: ReactNode;
  direction?: "left" | "right";
  className?: string;
  style?: React.CSSProperties;
}) {
  const reduced = useReducedMotion();
  const x = direction === "left" ? -24 : 24;
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, x }}
      animate={{ opacity: 1, x: 0 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, x }}
      transition={reduced
        ? { duration: 0.1 }
        : { ...spring.precise }
      }
      className={className}
      style={{ ...style, willChange: "transform, opacity" } as any}
    >
      {children}
    </motion.div>
  );
}

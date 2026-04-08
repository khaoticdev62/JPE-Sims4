/**
 * jpe-a11y.tsx — JPE Studio Accessibility Utilities (Phase 7)
 * Focus trap, return focus, aria-live announcer, skip link, visually hidden
 */
import { useEffect, useRef, useCallback, type ReactNode } from "react";
import { T } from "../pages/jpe-theme";

/* ── Focusable query ────────────────────────────────────────── */
const FOCUSABLE =
  'a[href]:not([disabled]),button:not([disabled]),input:not([disabled]),' +
  'select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    el =>
      !el.hasAttribute("hidden") &&
      getComputedStyle(el).display !== "none" &&
      getComputedStyle(el).visibility !== "hidden"
  );
}

/* ── useFocusTrap ────────────────────────────────────────────── */
/**
 * Traps keyboard focus within `containerRef` while `isActive`.
 * Also auto-focuses the first focusable element on activation.
 */
export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement | null>,
  isActive: boolean,
  /** Optional: focus a specific element id first instead of the first focusable */
  firstFocusId?: string
) {
  useEffect(() => {
    if (!isActive) return;
    const container = containerRef.current;
    if (!container) return;

    // Auto-focus first focusable (or named target)
    const timer = setTimeout(() => {
      if (firstFocusId) {
        const el = container.querySelector<HTMLElement>(`#${firstFocusId}`);
        el?.focus();
      } else {
        const focusable = getFocusable(container);
        focusable[0]?.focus();
      }
    }, 20);

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusable = getFocusable(container);
      if (!focusable.length) { e.preventDefault(); return; }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement;

      if (e.shiftKey) {
        if (active === first || !container.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last || !container.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleTab);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", handleTab);
    };
  }, [isActive, containerRef, firstFocusId]);
}

/* ── useReturnFocus ──────────────────────────────────────────── */
/**
 * Saves the focused element when `isActive` becomes true,
 * and restores it when `isActive` becomes false (modal/dialog closes).
 */
export function useReturnFocus(isActive: boolean) {
  const savedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isActive) {
      savedRef.current = document.activeElement as HTMLElement;
    } else {
      const el = savedRef.current;
      if (el && document.body.contains(el)) {
        setTimeout(() => el.focus(), 30);
      }
      savedRef.current = null;
    }
  }, [isActive]);
}

/* ── Aria-live Announcer ─────────────────────────────────────── */
let _politeEl: HTMLElement | null = null;
let _assertiveEl: HTMLElement | null = null;

function getLiveEl(assertive: boolean): HTMLElement {
  if (assertive) {
    if (!_assertiveEl) {
      _assertiveEl = document.createElement("div");
      _assertiveEl.setAttribute("aria-live", "assertive");
      _assertiveEl.setAttribute("aria-atomic", "true");
      _assertiveEl.setAttribute("role", "alert");
      Object.assign(_assertiveEl.style, srOnlyStyle);
      document.body.appendChild(_assertiveEl);
    }
    return _assertiveEl;
  }
  if (!_politeEl) {
    _politeEl = document.createElement("div");
    _politeEl.setAttribute("aria-live", "polite");
    _politeEl.setAttribute("aria-atomic", "true");
    Object.assign(_politeEl.style, srOnlyStyle);
    document.body.appendChild(_politeEl);
  }
  return _politeEl;
}

const srOnlyStyle: Partial<CSSStyleDeclaration> = {
  position: "fixed",
  left: "-9999px",
  top: "-9999px",
  width: "1px",
  height: "1px",
  overflow: "hidden",
  clip: "rect(0,0,0,0)",
  whiteSpace: "nowrap",
  border: "0",
};

/** Announce a message to screen readers */
export function announce(message: string, assertive = false) {
  const el = getLiveEl(assertive);
  // Clear first to ensure re-announcement of identical messages
  el.textContent = "";
  requestAnimationFrame(() => {
    el.textContent = message;
  });
}

export function useAnnouncer() {
  return useCallback((msg: string, assertive?: boolean) => announce(msg, assertive), []);
}

/* ── SkipLink ─────────────────────────────────────────────────── */
export function SkipLink({ targetId = "jpe-main-content" }: { targetId?: string }) {
  return (
    <a
      href={`#${targetId}`}
      style={{
        position: "fixed",
        top: 8,
        left: 8,
        zIndex: 99999,
        padding: "6px 14px",
        borderRadius: 8,
        fontSize: 12,
        fontFamily: T.sans,
        fontWeight: 700,
        letterSpacing: "0.03em",
        color: "#070810",
        background: T.cyan,
        border: `2px solid ${T.cyanBright}`,
        boxShadow: `0 0 20px ${T.cyan}70, 0 4px 16px rgba(0,0,0,0.5)`,
        textDecoration: "none",
        // Visually hidden until focused
        opacity: 0,
        pointerEvents: "none" as const,
        transform: "translateY(-150%)",
        transition: "opacity 0.12s ease, transform 0.12s ease",
      }}
      onFocus={e => {
        e.currentTarget.style.opacity = "1";
        e.currentTarget.style.pointerEvents = "auto";
        e.currentTarget.style.transform = "translateY(0)";
      }}
      onBlur={e => {
        e.currentTarget.style.opacity = "0";
        e.currentTarget.style.pointerEvents = "none";
        e.currentTarget.style.transform = "translateY(-150%)";
      }}
      onClick={e => {
        e.preventDefault();
        const target = document.getElementById(targetId);
        if (target) {
          target.focus();
          target.scrollIntoView({ behavior: "smooth" });
        }
      }}
    >
      Skip to main content
    </a>
  );
}

/* ── VisuallyHidden ───────────────────────────────────────────── */
/** Screen-reader-only text, visually hidden via CSS clip technique */
export function VisuallyHidden({
  children,
  as: Tag = "span",
}: {
  children: ReactNode;
  as?: keyof React.JSX.IntrinsicElements;
}) {
  return (
    <Tag
      style={
        {
          position: "absolute",
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: 0,
        } as React.CSSProperties
      }
    >
      {children}
    </Tag>
  );
}

/* ── useArrowKeyList ──────────────────────────────────────────── */
/**
 * Adds arrow-key navigation (horizontal or vertical) for a list of focusable items
 * within a container ref. Useful for tablists, menubars, toolbars.
 */
export function useArrowKeyList(
  containerRef: React.RefObject<HTMLElement | null>,
  options: {
    orientation?: "horizontal" | "vertical" | "both";
    selector?: string;
    wrap?: boolean;
  } = {}
) {
  const {
    orientation = "horizontal",
    selector = '[role="tab"],[role="option"],[role="menuitem"],[role="treeitem"],button',
    wrap = true,
  } = options;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handler = (e: KeyboardEvent) => {
      const items = Array.from(
        container.querySelectorAll<HTMLElement>(selector)
      ).filter(
        el =>
          !el.disabled &&
          getComputedStyle(el).display !== "none" &&
          !el.hasAttribute("hidden")
      );
      if (!items.length) return;

      const active = document.activeElement as HTMLElement;
      const idx = items.indexOf(active);
      if (idx === -1) return;

      let next = -1;
      const goNext =
        (orientation === "horizontal" && e.key === "ArrowRight") ||
        (orientation === "vertical" && e.key === "ArrowDown") ||
        (orientation === "both" && (e.key === "ArrowRight" || e.key === "ArrowDown"));
      const goPrev =
        (orientation === "horizontal" && e.key === "ArrowLeft") ||
        (orientation === "vertical" && e.key === "ArrowUp") ||
        (orientation === "both" && (e.key === "ArrowLeft" || e.key === "ArrowUp"));

      if (goNext) {
        e.preventDefault();
        next = wrap ? (idx + 1) % items.length : Math.min(idx + 1, items.length - 1);
      } else if (goPrev) {
        e.preventDefault();
        next = wrap ? (idx - 1 + items.length) % items.length : Math.max(idx - 1, 0);
      } else if (e.key === "Home") {
        e.preventDefault();
        next = 0;
      } else if (e.key === "End") {
        e.preventDefault();
        next = items.length - 1;
      }

      if (next !== -1) items[next].focus();
    };

    container.addEventListener("keydown", handler);
    return () => container.removeEventListener("keydown", handler);
  }, [containerRef, orientation, selector, wrap]);
}

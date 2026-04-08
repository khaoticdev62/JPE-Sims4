/**
 * SpotlightOverlay - SVG Masking for Tutorial Guidance
 * Story 5.1: Interactive "My First Mod" Tutorial
 */

import { useEffect, useState} from 'react';
import { motion} from 'framer-motion';
import { useUIStore } from '@/stores/useUIStore';

interface SpotlightOverlayProps {
  selector?: string;
  padding?: number;
}

export function SpotlightOverlay({ selector, padding = 8 }: SpotlightOverlayProps) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const { isTutorialActive } = useUIStore();

  // Update rect on target element
  useEffect(() => {
    if (!selector || !isTutorialActive) {
      setRect(null);
      return;
    }

    const updateRect = () => {
      const el = document.querySelector(selector);
      if (el) {
        setRect(el.getBoundingClientRect());
      } else {
        setRect(null);
      }
    };

    updateRect();
    const interval = setInterval(updateRect, 500); // Polling for layout shifts
    window.addEventListener('resize', updateRect);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', updateRect);
    };
  }, [selector, isTutorialActive]);

  if (!isTutorialActive || !rect) return null;

  const { left, top, width, height } = rect;
  const p = padding;

  return (
    <div className="fixed inset-0 z-[9998] pointer-events-none">
      <svg className="w-full h-full">
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <motion.rect
              initial={false}
              animate={{
                x: left - p,
                y: top - p,
                width: width + 2 * p,
                height: height + 2 * p}}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              rx={8}
              ry={8}
              fill="black"
            />
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.65)"
          mask="url(#spotlight-mask)"
          style={{ backdropFilter: 'blur(2px)' }}
        />
      </svg>
      
      {/* Visual Ring around the spotlight */}
      <motion.div
        initial={false}
        animate={{
          left: left - p - 2,
          top: top - p - 2,
          width: width + 2 * p + 4,
          height: height + 2 * p + 4}}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute border-2 border-cyan-400/50 rounded-lg shadow-[0_0_15px_rgba(34,211,238,0.3)]"
      />
    </div>
  );
}

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../stores/useUIStore';
import { useEditorStore } from '../../stores/useEditorStore';

/**
 * HandheldFocusOverlay (Epic 11)
 * Provides a bioluminescent focus indicator specifically for handheld/controller users.
 * Optimized for dynamic layouts and line-level precision.
 */
export const HandheldFocusOverlay: React.FC = () => {
  const { 
    focusedPane, 
    isGamepadRadialOpen, 
    sidebarCollapsed, 
    rightPanelCollapsed,
    fontSize,
    immersionMode 
  } = useUIStore();
  const { activeTabId, cursorPosition } = useEditorStore();
  const [controllerConnected, setControllerConnected] = useState(false);

  useEffect(() => {
    const checkGamepads = () => {
      const gps = navigator.getGamepads();
      setControllerConnected(Array.from(gps).some(gp => !!gp));
    };

    window.addEventListener("gamepadconnected", () => setControllerConnected(true));
    window.addEventListener("gamepaddisconnected", checkGamepads);
    checkGamepads();

    return () => {
      window.removeEventListener("gamepadconnected", checkGamepads);
      window.removeEventListener("gamepaddisconnected", checkGamepads);
    };
  }, []);

  const paneBounds = useMemo(() => 
    getPaneBounds(focusedPane, sidebarCollapsed, rightPanelCollapsed, immersionMode), 
    [focusedPane, sidebarCollapsed, rightPanelCollapsed, immersionMode]
  );

  const activeLine = activeTabId ? cursorPosition[activeTabId]?.line : 0;
  
  // Calculate dynamic line height based on store font size (multiplier typical 1.5-1.6)
  const lineHeightPx = fontSize * 1.55;
  const topOffset = immersionMode === 'zen' ? 0 : 48; // Global Header is 48px

  // Hide overlay when radial is open to avoid visual clutter
  if (!controllerConnected || isGamepadRadialOpen) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${focusedPane}-${sidebarCollapsed}-${rightPanelCollapsed}-${immersionMode}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 pointer-events-none z-[50]"
      >
        {/* Spectral Border Glow */}
        <motion.div 
          layout
          className="absolute transition-all duration-500 border-2 border-teal-500/30 shadow-[inset_0_0_20px_rgba(20,184,166,0.1)]"
          style={paneBounds}
        />

        {/* Line-Level Focus Indicator (Only in editor) */}
        {focusedPane === 'editor' && activeLine > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute h-6 bg-teal-500/5 border-l-2 border-teal-400/50 shadow-[0_0_15px_rgba(45,212,191,0.2)]"
            style={{ 
              top: `${topOffset + 32 + (activeLine - 1) * lineHeightPx}px`, // 32px standard editor header
              left: sidebarCollapsed ? '0' : '256px',
              right: rightPanelCollapsed ? '0' : '320px',
              height: `${lineHeightPx}px`
            }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};

function getPaneBounds(
  pane: string, 
  sidebarCollapsed: boolean, 
  rightPanelCollapsed: boolean,
  immersionMode: 'normal' | 'zen' | 'focus' | 'handheld'
): React.CSSProperties {
  const left = sidebarCollapsed ? '0' : '256px';
  const right = rightPanelCollapsed ? '0' : '320px';
  const top = immersionMode === 'zen' ? '0' : '48px';

  switch (pane) {
    case 'sidebar':
      return { top, left: '0', width: '256px', bottom: '24px', opacity: sidebarCollapsed ? 0 : 1 };
    case 'editor':
      return { top, left, right, bottom: '192px' };
    case 'right-panel':
      return { top, right: '0', width: '320px', bottom: '24px', opacity: rightPanelCollapsed ? 0 : 1 };
    case 'diagnostics':
      return { bottom: '24px', left, right, height: '192px' };
    default:
      return { opacity: 0 };
  }
}

"use client";

/**
 * OnboardingTour.tsx
 * Interactive first-run tutorial with step-by-step guidance through JPE Studio features
 */

import { useState, useEffect, useMemo } from "react";
import { X, ChevronRight, ChevronLeft, Sparkles, Check, Code2, Languages, Library, Bug, Lightbulb, Rocket} from "lucide-react";
import { T } from "./robust/jpe-theme";
import { JpeButton } from "./jpe-design-system";
import { motion, AnimatePresence } from "./jpe-motion";
import { toast } from "sonner";
import { useUIStore } from "@/stores/useUIStore";
import { MY_FIRST_MOD_STEPS } from "@/services/tutorial/types";
import { SpotlightOverlay } from "./tutorial/SpotlightOverlay";

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: typeof Code2;
  iconColor: string;
  highlight?: string; // CSS selector to highlight
  position?: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to JPE Studio",
    description: "A professional IDE for Sims 4 mod translation and development. Let's take a quick tour of the key features.",
    icon: Sparkles,
    iconColor: T.violetBright,
    position: "center",
  },
  {
    id: "workspace-modes",
    title: "15 Workspace Modes",
    description: "Switch between specialized workspaces: Dashboard, Editor, Translation, JPE Language, Dependency Graph, Conflicts, Build, Library, Plugins, Rebel's Vault, Debug, Analysis, Diff Viewer, Documentation, and AI Assistant. Use Ctrl+1-9 for quick access.",
    icon: Code2,
    iconColor: T.cyan,
    position: "top-left",
  },
  {
    id: "file-explorer",
    title: "Explorer Panel",
    description: "Browse your project files, right-click for context menus, and use the search bar to filter files. The panel adapts to each workspace mode.",
    icon: Library,
    iconColor: T.cyanBright,
    position: "top-left",
  },
  {
    id: "translation",
    title: "Translation Workspace",
    description: "Translate your mods into 12 languages with inline editing, batch translation, AI assistance, and export to CSV/XLIFF formats.",
    icon: Languages,
    iconColor: T.violet,
    position: "center",
  },
  {
    id: "command-palette",
    title: "Command Palette",
    description: "Press Ctrl+K to open the command palette. Search for any action, navigate to files with :filename, or jump to symbols with @symbol.",
    icon: Lightbulb,
    iconColor: T.amber,
    position: "center",
  },
  {
    id: "shortcuts",
    title: "Keyboard Shortcuts",
    description: "Press Ctrl+/ to view all 50+ keyboard shortcuts. Master shortcuts for navigation, editing, building, debugging, and more.",
    icon: Rocket,
    iconColor: T.emerald,
    position: "center",
  },
  {
    id: "auto-save",
    title: "Auto-Save & Recovery",
    description: "Your work is automatically saved every 30 seconds. You'll see an indicator in the bottom-right when there are unsaved changes. Press Ctrl+S to save manually.",
    icon: Check,
    iconColor: T.emerald,
    position: "bottom-right",
  },
  {
    id: "diagnostics",
    title: "Diagnostics & Debugging",
    description: "The bottom console panel shows errors, warnings, and build logs. Press Ctrl+` to toggle it, or Ctrl+\\ to open the integrated terminal.",
    icon: Bug,
    iconColor: T.rose,
    position: "bottom-left",
  },
];

export function OnboardingTour({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { 
    tutorialStep, 
    setTutorialStep, 
    isTutorialActive, 
    setTutorialActive,
    setHasCompletedTour
  } = useUIStore();

  const [completed, setCompleted] = useState(false);

  // Combine static tour steps with interactive mission steps based on state
  const activeSteps = useMemo(() => {
    if (isTutorialActive) {
      return MY_FIRST_MOD_STEPS.map(s => ({
        ...s,
        description: s.content,
        icon: s.id === 'success' ? Check : Code2,
        iconColor: s.id === 'success' ? T.emerald : T.cyan,
        position: s.anchorSelector ? 'bottom-right' : 'center' as any
      }));
    }
    return tourSteps;
  }, [isTutorialActive]);

  const _currentStepIdx = isTutorialActive ? tutorialStep : 0; // If not active, fall back or manage local state
  const [localStep, setLocalStep] = useState(0);
  
  const activeIdx = isTutorialActive ? tutorialStep : localStep;
  const step = activeSteps[activeIdx];
  
  const isFirstStep = activeIdx === 0;
  const isLastStep = activeIdx === activeSteps.length - 1;

  // Determine if we can proceed
  const canAdvance = useMemo(() => {
    if (!isTutorialActive) return true;
    const currentMissionStep = MY_FIRST_MOD_STEPS[activeIdx];
    return !currentMissionStep?.isInteractive;
  }, [isTutorialActive, activeIdx]);

  const positionStyles: Record<string, React.CSSProperties> = {
    center: { alignItems: "center", justifyContent: "center" },
    "top-left": { alignItems: "flex-start", justifyContent: "flex-start", padding: 60 },
    "top-right": { alignItems: "flex-start", justifyContent: "flex-end", padding: 60 },
    "bottom-left": { alignItems: "flex-end", justifyContent: "flex-start", padding: 60 },
    "bottom-right": { alignItems: "flex-end", justifyContent: "flex-end", padding: 60 },
  };

  useEffect(() => {
    if (isOpen && activeIdx === 0) {
      setCompleted(false);
    }
  }, [isOpen, activeIdx]);

  const handleNext = () => {
    if (isLastStep) {
      setCompleted(true);
      setTimeout(() => {
        onClose();
        toast.success(isTutorialActive ? "Mission Success!" : "Tour completed!", {
          description: isTutorialActive ? "You're now a certified JPE modder." : "Press Ctrl+/ to view keyboard shortcuts anytime.",
        });
        setHasCompletedTour(true);
        setTutorialActive(false);
        localStorage.setItem("jpe-onboarding-completed", "true");
      }, 1000);
    } else {
      if (isTutorialActive) {
        setTutorialStep(tutorialStep + 1);
      } else {
        setLocalStep(prev => prev + 1);
      }
    }
  };

  const handlePrev = () => {
    if (isTutorialActive) {
      setTutorialStep(Math.max(0, tutorialStep - 1));
    } else {
      setLocalStep(prev => Math.max(0, prev - 1));
    }
  };

  const handleSkip = () => {
    onClose();
    setHasCompletedTour(true);
    setTutorialActive(false);
    localStorage.setItem("jpe-onboarding-completed", "true");
    toast.info("Onboarding paused", {
      description: "Return to the mission via the Help menu anytime.",
    });
  };

  if (!isOpen || !step) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex"
      style={{
        background: "rgba(5, 7, 10, 0.94)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        fontFamily: T.sans,
        ...positionStyles[step.position || "center"],
      }}
    >
      {/* Spotlight effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, transparent 20%, rgba(0,0,0,0.6) 70%)`,
        }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.3 }}
          style={{
            background: T.bgPanel,
            border: `1px solid ${step.iconColor}50`,
            borderRadius: 16,
            padding: 40,
            maxWidth: 540,
            width: "90%",
            boxShadow: `0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px ${step.iconColor}25`,
            position: "relative",
            zIndex: 2,
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
          }}
        >
          {/* Skip button */}
          <button
            onClick={handleSkip}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              padding: 8,
              borderRadius: 4,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: T.textMuted,
            }}
            title="Skip tutorial"
          >
            <X size={18} />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="p-4 rounded-full"
              style={{ background: `${step.iconColor}20` }}
            >
              <step.icon size={40} color={step.iconColor} strokeWidth={1.5} />
            </motion.div>
          </div>

          {/* Title */}
          <h2
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: T.textPrimary,
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            {step.title}
          </h2>

          <p
            style={{
              fontSize: 15,
              color: T.textPrimary,
              lineHeight: 1.6,
              textAlign: "center",
              marginBottom: 32,
              opacity: 0.9,
            }}
          >
            {step.description}
          </p>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            {activeSteps.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === activeIdx ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: i === activeIdx ? step.iconColor : i < activeIdx ? `${step.iconColor}40` : T.border,
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </div>

          {/* Spotlight Integration */}
          {(step as any).anchorSelector && (
            <SpotlightOverlay selector={(step as any).anchorSelector} />
          )}

          {/* Navigation */}
          <div className="flex gap-3 justify-between">
            <JpeButton
              variant="secondary"
              size="lg"
              icon={ChevronLeft}
              onClick={handlePrev}
              disabled={isFirstStep}
              className="flex-1"
            >
              Previous
            </JpeButton>
            <JpeButton
              variant="primary"
              size="lg"
              icon={completed ? Check : ChevronRight}
              iconRight={!completed ? ChevronRight : undefined}
              onClick={handleNext}
              disabled={!canAdvance}
              className="flex-1"
            >
              {!canAdvance ? "Wait for action..." : isLastStep ? (completed ? "Completed!" : "Finish") : "Next"}
            </JpeButton>
          </div>

          {/* Step counter */}
          <div
            style={{
              marginTop: 16,
              textAlign: "center",
              fontSize: 11,
              color: T.textMuted,
              fontFamily: T.mono,
            }}
          >
            {isTutorialActive ? "MISSION" : "STEP"} {activeIdx + 1} of {activeSteps.length}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CONTEXTUAL HELP TOOLTIP
   ═══════════════════════════════════════════════════════════════ */

export function HelpTooltip({ content, title }: { content: string; title?: string }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        style={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          border: `1px solid ${T.textMuted}`,
          background: "transparent",
          color: T.textMuted,
          fontSize: 10,
          fontWeight: 700,
          cursor: "help",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        ?
      </button>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute",
              bottom: "calc(100% + 8px)",
              left: "50%",
              transform: "translateX(-50%)",
              background: T.bgPanel,
              border: `1px solid ${T.border}`,
              borderRadius: 6,
              padding: "8px 12px",
              minWidth: 200,
              maxWidth: 300,
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              zIndex: 1000,
              pointerEvents: "none",
            }}
          >
            {title && (
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: T.textPrimary,
                  marginBottom: 4,
                }}
              >
                {title}
              </div>
            )}
            <div
              style={{
                fontSize: 11,
                color: T.textSecondary,
                lineHeight: 1.5,
              }}
            >
              {content}
            </div>
            {/* Tooltip arrow */}
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: "50%",
                transform: "translateX(-50%)",
                width: 0,
                height: 0,
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderTop: `6px solid ${T.border}`,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   QUICK START CHECKLIST
   ═══════════════════════════════════════════════════════════════ */

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

export function QuickStartChecklist() {
  const [isOpen, setIsOpen] = useState(true);
  const [items, setItems] = useState<ChecklistItem[]>([
    { id: "open-file", label: "Open your first file", completed: false },
    { id: "edit-code", label: "Edit some code", completed: false },
    { id: "run-translation", label: "Run a translation", completed: false },
    { id: "build-package", label: "Build a .package file", completed: false },
    { id: "explore-shortcuts", label: "Learn keyboard shortcuts (Ctrl+/)", completed: false },
  ]);

  const completedCount = items.filter(i => i.completed).length;
  const allCompleted = completedCount === items.length;

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="fixed bottom-12 right-6 z-[999]"
      style={{
        width: 280,
        background: T.bgPanel,
        border: `1px solid ${T.border}`,
        borderRadius: 12,
        padding: 20,
        fontFamily: T.sans,
        boxShadow: `0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)`,
        backdropFilter: "blur(24px)",
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, ${T.cyan}, ${T.violet})` }} />
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Rocket size={14} color={T.amber} />
          <h3 style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary, letterSpacing: "0.02em" }}>
            ONBOARDING
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 10, color: T.textMuted, fontFamily: T.mono }}>
            {completedCount}/{items.length}
          </span>
          <button onClick={() => setIsOpen(false)} className="p-1 rounded-md hover:bg-white/5 transition-colors">
            <X size={12} color={T.textMuted} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => toggleItem(item.id)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              background: item.completed ? `${T.emerald}15` : "rgba(255,255,255,0.03)",
              border: `1px solid ${item.completed ? T.emerald : T.borderSubtle}`,
              borderRadius: 8,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 5,
                border: `2px solid ${item.completed ? T.emerald : T.textMuted}`,
                background: item.completed ? T.emerald : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {item.completed && <Check size={12} color="#000" strokeWidth={3} />}
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: item.completed ? T.emerald : T.textSecondary,
                textDecoration: item.completed ? "line-through" : "none",
              }}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {allCompleted && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          style={{
            marginTop: 12,
            padding: 12,
            background: `${T.emerald}15`,
            border: `1px solid ${T.emerald}`,
            borderRadius: 6,
            textAlign: "center",
          }}
        >
          <Check size={20} color={T.emerald} className="mx-auto mb-2" />
          <div style={{ fontSize: 12, color: T.emerald, fontWeight: 600 }}>
            Great job! You're all set up.
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

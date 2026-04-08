/**
 * jpe-auto-save.tsx
 * Auto-save context with draft recovery, unsaved changes tracking, and safe state persistence
 */

import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import { toast } from "sonner";
import { Save, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { T } from "../pages/jpe-theme";
import { JpeButton } from "./jpe-design-system";
import { motion, AnimatePresence } from "./jpe-motion";

interface AutoSaveState {
  isDirty: boolean;
  lastSaved: Date | null;
  isSaving: boolean;
  autoSaveEnabled: boolean;
}

interface AutoSaveContextValue extends AutoSaveState {
  markDirty: () => void;
  markClean: () => void;
  saveNow: () => Promise<void>;
  setAutoSaveEnabled: (enabled: boolean) => void;
  registerSaveHandler: (handler: () => Promise<void> | void) => void;
}

const AutoSaveContext = createContext<AutoSaveContextValue | null>(null);

export function useAutoSave() {
  const context = useContext(AutoSaveContext);
  if (!context) {
    throw new Error("useAutoSave must be used within AutoSaveProvider");
  }
  return context;
}

interface AutoSaveProviderProps {
  children: ReactNode;
  autoSaveInterval?: number; // milliseconds
  storageKey?: string;
}

export function AutoSaveProvider({
  children,
  autoSaveInterval = 30000, // 30 seconds default
  storageKey = "jpe-autosave",
}: AutoSaveProviderProps) {
  const [state, setState] = useState<AutoSaveState>({
    isDirty: false,
    lastSaved: null,
    isSaving: false,
    autoSaveEnabled: true,
  });

  const saveHandlerRef = useRef<(() => Promise<void> | void) | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastAutoSaveRef = useRef<Date | null>(null);

  // Register a save handler (called by components that need auto-save)
  const registerSaveHandler = useCallback((handler: () => Promise<void> | void) => {
    saveHandlerRef.current = handler;
  }, []);

  // Mark state as dirty (unsaved changes)
  const markDirty = useCallback(() => {
    setState(prev => ({ ...prev, isDirty: true }));
  }, []);

  // Mark state as clean (saved)
  const markClean = useCallback(() => {
    setState(prev => ({ ...prev, isDirty: false, lastSaved: new Date() }));
  }, []);

  // Manually trigger save
  const saveNow = useCallback(async () => {
    if (!saveHandlerRef.current || state.isSaving) return;

    setState(prev => ({ ...prev, isSaving: true }));

    try {
      await saveHandlerRef.current();
      markClean();
      toast.success("Saved successfully", { icon: <CheckCircle2 size={16} color={T.emerald} /> });
    } catch (error) {
      console.error("[AutoSave] Save failed:", error);
      toast.error("Failed to save", {
        description: error instanceof Error ? error.message : "Unknown error",
        icon: <AlertTriangle size={16} color={T.rose} />,
      });
    } finally {
      setState(prev => ({ ...prev, isSaving: false }));
    }
  }, [state.isSaving, markClean]);

  // Auto-save timer
  useEffect(() => {
    if (!state.autoSaveEnabled || !state.isDirty) {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
      return;
    }

    autoSaveTimerRef.current = setInterval(() => {
      if (state.isDirty && !state.isSaving) {
        saveNow();
      }
    }, autoSaveInterval);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [state.autoSaveEnabled, state.isDirty, state.isSaving, autoSaveInterval, saveNow]);

  // Warn on page unload if unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state.isDirty) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [state.isDirty]);

  // Keyboard shortcut: Ctrl+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (state.isDirty) {
          saveNow();
        } else {
          toast.info("No changes to save");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.isDirty, saveNow]);

  const setAutoSaveEnabled = useCallback((enabled: boolean) => {
    setState(prev => ({ ...prev, autoSaveEnabled: enabled }));
    toast.success(enabled ? "Auto-save enabled" : "Auto-save disabled");
  }, []);

  const contextValue: AutoSaveContextValue = {
    ...state,
    markDirty,
    markClean,
    saveNow,
    setAutoSaveEnabled,
    registerSaveHandler,
  };

  return (
    <AutoSaveContext.Provider value={contextValue}>
      {children}
      <AutoSaveIndicator state={state} onSave={saveNow} />
    </AutoSaveContext.Provider>
  );
}

/* ═══════════════════════════════════════════════════════════════
   AUTO-SAVE INDICATOR (bottom-right floating badge)
   ═══════════════════════════════════════════════════════════════ */

function AutoSaveIndicator({ state, onSave }: { state: AutoSaveState; onSave: () => void }) {
  const [isHovered, setIsHovered] = useState(false);

  // Don't show if clean and not saving
  if (!state.isDirty && !state.isSaving) return null;

  const timeSinceLastSave = state.lastSaved
    ? Math.floor((Date.now() - state.lastSaved.getTime()) / 1000)
    : null;

  const getStatusText = () => {
    if (state.isSaving) return "Saving...";
    if (state.isDirty && timeSinceLastSave !== null && timeSinceLastSave < 60) {
      return `Unsaved (${timeSinceLastSave}s ago)`;
    }
    if (state.isDirty) return "Unsaved changes";
    return "Saved";
  };

  const getStatusColor = () => {
    if (state.isSaving) return T.cyan;
    if (state.isDirty) return T.amber;
    return T.emerald;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-4 right-4 z-50"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          style={{
            background: T.bgPanel,
            border: `1px solid ${getStatusColor()}`,
            borderRadius: 8,
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: `0 4px 12px rgba(0,0,0,0.3), 0 0 0 1px ${getStatusColor()}20`,
            fontFamily: T.sans,
          }}
        >
          {state.isSaving ? (
            <Clock size={14} color={T.cyan} className="animate-spin" />
          ) : state.isDirty ? (
            <AlertTriangle size={14} color={T.amber} />
          ) : (
            <CheckCircle2 size={14} color={T.emerald} />
          )}
          <span style={{ fontSize: 12, color: T.textSecondary }}>
            {getStatusText()}
          </span>

          <AnimatePresence>
            {isHovered && state.isDirty && !state.isSaving && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
              >
                <button
                  onClick={onSave}
                  style={{
                    marginLeft: 4,
                    padding: "4px 8px",
                    borderRadius: 4,
                    background: T.cyan,
                    color: T.bgPanel,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    border: "none",
                  }}
                >
                  Save Now
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DRAFT RECOVERY UTILITIES
   ═══════════════════════════════════════════════════════════════ */

export interface DraftData {
  timestamp: string;
  version: string;
  data: any;
}

export function saveDraft(key: string, data: any, version = "1.0"): boolean {
  try {
    const draft: DraftData = {
      timestamp: new Date().toISOString(),
      version,
      data,
    };
    localStorage.setItem(`jpe-draft-${key}`, JSON.stringify(draft));
    return true;
  } catch (error) {
    console.error("[AutoSave] Failed to save draft:", error);
    return false;
  }
}

export function loadDraft(key: string): DraftData | null {
  try {
    const raw = localStorage.getItem(`jpe-draft-${key}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.error("[AutoSave] Failed to load draft:", error);
    return null;
  }
}

export function deleteDraft(key: string): boolean {
  try {
    localStorage.removeItem(`jpe-draft-${key}`);
    return true;
  } catch (error) {
    console.error("[AutoSave] Failed to delete draft:", error);
    return false;
  }
}

export function listDrafts(): string[] {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("jpe-draft-")) {
        keys.push(key.replace("jpe-draft-", ""));
      }
    }
    return keys;
  } catch {
    return [];
  }
}

/* ═══════════════════════════════════════════════════════════════
   UNSAVED CHANGES DIALOG
   ═══════════════════════════════════════════════════════════════ */

export function UnsavedChangesDialog({
  isOpen,
  onSave,
  onDiscard,
  onCancel,
}: {
  isOpen: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.7)", fontFamily: T.sans }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          background: T.bgPanel,
          border: `1px solid ${T.border}`,
          borderRadius: 8,
          padding: 24,
          maxWidth: 400,
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        }}
      >
        <div className="flex items-start gap-3 mb-4">
          <div
            className="p-2 rounded"
            style={{ background: `${T.amber}20` }}
          >
            <AlertTriangle size={24} color={T.amber} />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: T.textPrimary, marginBottom: 4 }}>
              Unsaved Changes
            </h3>
            <p style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.5 }}>
              You have unsaved changes. Do you want to save them before continuing?
            </p>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <JpeButton variant="ghost" size="md" onClick={onCancel}>
            Cancel
          </JpeButton>
          <JpeButton variant="danger" size="md" onClick={onDiscard}>
            Discard
          </JpeButton>
          <JpeButton variant="primary" size="md" icon={Save} onClick={onSave}>
            Save
          </JpeButton>
        </div>
      </motion.div>
    </div>
  );
}

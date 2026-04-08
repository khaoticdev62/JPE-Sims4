"use client";

/* ─────────────────────────────────────────────────────────────
   JPE Studio — Workspace Profiles (Phase 14)
   Save & restore named layout configurations:
   panel widths, active mode, left panel view, console state.
   ───────────────────────────────────────────────────────────── */
import { useState, useEffect, useRef } from "react";
import {
  LayoutGrid, Save, Trash2, ChevronDown, Check,
  Plus, X, Edit3,
} from "lucide-react";
import { motion, AnimatePresence } from "./jpe-motion";
import { T } from "./robust/jpe-theme";
import type { WorkspaceMode } from "./robust/jpe-theme";
import { toast } from "sonner";

/* ── Types ── */
export interface WorkspaceSnapshot {
  id: string;
  name: string;
  icon: string;
  mode: WorkspaceMode;
  leftPanelWidth: number;
  rightPanelWidth: number;
  showLeftPanel: boolean;
  showRightPanel: boolean;
  leftPanelView: "explorer" | "git" | "extensions";
  consoleCollapsed: boolean;
  createdAt: string;
  isBuiltIn?: boolean;
}

export interface WorkspaceProfilesProps {
  currentMode: WorkspaceMode;
  leftPanelWidth: number;
  rightPanelWidth: number;
  showLeftPanel: boolean;
  showRightPanel: boolean;
  leftPanelView: "explorer" | "git" | "extensions";
  consoleCollapsed: boolean;
  onApplyProfile: (snapshot: WorkspaceSnapshot) => void;
}

const STORAGE_KEY = "jpe-workspace-profiles-v1";
const MAX_PROFILES = 8;

const BUILT_IN_PROFILES: WorkspaceSnapshot[] = [
  {
    id: "builtin-balanced",
    name: "Balanced",
    icon: "⚖️",
    mode: "code",
    leftPanelWidth: 260,
    rightPanelWidth: 280,
    showLeftPanel: true,
    showRightPanel: true,
    leftPanelView: "explorer",
    consoleCollapsed: false,
    createdAt: "built-in",
    isBuiltIn: true,
  },
  {
    id: "builtin-code-focus",
    name: "Code Focus",
    icon: "💻",
    mode: "code",
    leftPanelWidth: 220,
    rightPanelWidth: 0,
    showLeftPanel: true,
    showRightPanel: false,
    leftPanelView: "explorer",
    consoleCollapsed: true,
    createdAt: "built-in",
    isBuiltIn: true,
  },
  {
    id: "builtin-translation",
    name: "Translation",
    icon: "🌐",
    mode: "translation",
    leftPanelWidth: 200,
    rightPanelWidth: 300,
    showLeftPanel: true,
    showRightPanel: true,
    leftPanelView: "explorer",
    consoleCollapsed: true,
    createdAt: "built-in",
    isBuiltIn: true,
  },
  {
    id: "builtin-debug",
    name: "Debug Mode",
    icon: "🐛",
    mode: "debug",
    leftPanelWidth: 240,
    rightPanelWidth: 280,
    showLeftPanel: true,
    showRightPanel: true,
    leftPanelView: "explorer",
    consoleCollapsed: false,
    createdAt: "built-in",
    isBuiltIn: true,
  },
];

/* ── Icon picker ── */
const PROFILE_ICONS = ["⚡", "🎯", "🔥", "💎", "🚀", "🌙", "⭐", "🎮", "🔧", "📦", "🎨", "🧪"];

/* ── Load/Save helpers ── */
function loadProfiles(): WorkspaceSnapshot[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}
function saveProfiles(profiles: WorkspaceSnapshot[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  } catch { /* noop */ }
}

/* ── Profile card ── */
function ProfileCard({
  profile,
  isActive,
  onApply,
  onDelete,
  onRename,
}: {
  profile: WorkspaceSnapshot;
  isActive: boolean;
  onApply: () => void;
  onDelete?: () => void;
  onRename?: (name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const commitRename = () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== profile.name) onRename?.(trimmed);
    setEditing(false);
  };

  return (
    <div
      className="group flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all"
      style={{
        background: isActive ? `${T.cyan}10` : "rgba(255,255,255,0.02)",
        border: `1px solid ${isActive ? `${T.cyan}30` : T.borderSubtle}`,
      }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = T.bgHover; }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
      onClick={() => { if (!editing) onApply(); }}
    >
      <span style={{ fontSize: 16, lineHeight: 1 }}>{profile.icon}</span>
      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            ref={inputRef}
            value={editName}
            onChange={e => setEditName(e.target.value)}
            onBlur={commitRename}
            onKeyDown={e => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") { setEditing(false); setEditName(profile.name); } }}
            className="bg-transparent outline-none border-b w-full"
            style={{ fontSize: 12, color: T.textPrimary, borderColor: T.cyan }}
            onClick={e => e.stopPropagation()}
            autoFocus
          />
        ) : (
          <div style={{ fontSize: 12, fontWeight: isActive ? 700 : 500, color: isActive ? T.textPrimary : T.textSecondary }}>{profile.name}</div>
        )}
        <div style={{ fontSize: 9, color: T.textMuted, fontFamily: T.mono }}>
          {profile.mode} · {profile.leftPanelWidth}px ↔ {profile.rightPanelWidth}px
          {profile.isBuiltIn && <span style={{ color: T.violet, marginLeft: 4 }}>built-in</span>}
        </div>
      </div>
      {isActive && <Check size={12} color={T.cyan} />}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
        {!profile.isBuiltIn && onRename && (
          <button className="p-1 rounded hover:bg-white/10" onClick={() => { setEditing(true); setEditName(profile.name); setTimeout(() => inputRef.current?.focus(), 0); }}>
            <Edit3 size={10} color={T.textMuted} />
          </button>
        )}
        {!profile.isBuiltIn && onDelete && (
          <button className="p-1 rounded hover:bg-white/10" onClick={onDelete}>
            <Trash2 size={10} color={T.rose} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Main Component ── */
export function WorkspaceProfiles({
  currentMode,
  leftPanelWidth,
  rightPanelWidth,
  showLeftPanel,
  showRightPanel,
  leftPanelView,
  consoleCollapsed,
  onApplyProfile,
}: WorkspaceProfilesProps) {
  const [open, setOpen] = useState(false);
  const [userProfiles, setUserProfiles] = useState<WorkspaceSnapshot[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("⚡");
  const [showIconPicker, setShowIconPicker] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* Load from localStorage */
  useEffect(() => {
    setUserProfiles(loadProfiles());
  }, []);

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [open]);

  const _allProfiles = [...BUILT_IN_PROFILES, ...userProfiles];

  const applyProfile = (profile: WorkspaceSnapshot) => {
    setActiveProfileId(profile.id);
    onApplyProfile(profile);
    toast.success(`Profile applied: ${profile.name}`, { description: `Mode: ${profile.mode}` });
    setOpen(false);
  };

  const saveCurrentLayout = () => {
    const name = newName.trim() || `Layout ${userProfiles.length + 1}`;
    if (userProfiles.length >= MAX_PROFILES) {
      toast.error("Maximum profiles reached", { description: `Delete one first (max ${MAX_PROFILES})` });
      return;
    }
    const snapshot: WorkspaceSnapshot = {
      id: `user-${Date.now()}`,
      name,
      icon: newIcon,
      mode: currentMode,
      leftPanelWidth,
      rightPanelWidth,
      showLeftPanel,
      showRightPanel,
      leftPanelView,
      consoleCollapsed,
      createdAt: new Date().toISOString().split("T")[0],
    };
    const updated = [...userProfiles, snapshot];
    setUserProfiles(updated);
    saveProfiles(updated);
    setActiveProfileId(snapshot.id);
    setNewName("");
    setSaving(false);
    toast.success(`Profile saved: ${name}`);
  };

  const deleteProfile = (id: string) => {
    const updated = userProfiles.filter(p => p.id !== id);
    setUserProfiles(updated);
    saveProfiles(updated);
    if (activeProfileId === id) setActiveProfileId(null);
    toast.success("Profile deleted");
  };

  const renameProfile = (id: string, name: string) => {
    const updated = userProfiles.map(p => p.id === id ? { ...p, name } : p);
    setUserProfiles(updated);
    saveProfiles(updated);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(p => !p)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all hover:bg-white/10"
        style={{
          fontSize: 11,
          color: open ? T.textPrimary : T.textSecondary,
          background: open ? "rgba(255,255,255,0.08)" : "transparent",
          border: `1px solid ${open ? T.borderSubtle : "transparent"}`,
        }}
        title="Workspace Profiles (Ctrl+Shift+W)"
      >
        <LayoutGrid size={12} color={open ? T.cyan : T.textMuted} />
        <span>Profiles</span>
        <ChevronDown size={10} color={T.textMuted} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.18s" }} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full mt-1.5 right-0 rounded-xl overflow-hidden z-[150]"
            style={{
              width: 300,
              background: T.bgElevated,
              border: `1px solid ${T.border}`,
              boxShadow: `0 16px 40px rgba(0,0,0,0.5), 0 0 1px rgba(255,255,255,0.04)`,
            }}
          >
            {/* Glow accent */}
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${T.cyan}50, ${T.violet}50, transparent)` }} />

            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2.5" style={{ borderBottom: `1px solid ${T.border}` }}>
              <div className="flex items-center gap-2">
                <LayoutGrid size={12} color={T.cyan} />
                <span style={{ fontSize: 11, fontWeight: 700, color: T.textPrimary, letterSpacing: "0.04em" }}>WORKSPACE PROFILES</span>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-white/5">
                <X size={11} color={T.textMuted} />
              </button>
            </div>

            {/* Built-in profiles */}
            <div className="px-3 py-2 space-y-1">
              <div style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, letterSpacing: "0.07em", marginBottom: 4 }}>BUILT-IN</div>
              {BUILT_IN_PROFILES.map(p => (
                <ProfileCard
                  key={p.id}
                  profile={p}
                  isActive={activeProfileId === p.id}
                  onApply={() => applyProfile(p)}
                />
              ))}
            </div>

            {/* User profiles */}
            {userProfiles.length > 0 && (
              <div className="px-3 py-2 space-y-1" style={{ borderTop: `1px solid ${T.borderSubtle}` }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, letterSpacing: "0.07em", marginBottom: 4 }}>MY PROFILES</div>
                {userProfiles.map(p => (
                  <ProfileCard
                    key={p.id}
                    profile={p}
                    isActive={activeProfileId === p.id}
                    onApply={() => applyProfile(p)}
                    onDelete={() => deleteProfile(p.id)}
                    onRename={(name) => renameProfile(p.id, name)}
                  />
                ))}
              </div>
            )}

            {/* Save current layout section */}
            <div className="px-3 py-2.5" style={{ borderTop: `1px solid ${T.border}`, background: "rgba(0,0,0,0.12)" }}>
              {saving ? (
                <div className="space-y-2">
                  <div style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, letterSpacing: "0.07em" }}>SAVE CURRENT LAYOUT</div>
                  {/* Icon picker */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowIconPicker(p => !p)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ fontSize: 16, background: "rgba(255,255,255,0.05)", border: `1px solid ${T.borderSubtle}` }}
                    >
                      {newIcon}
                    </button>
                    <input
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") saveCurrentLayout(); if (e.key === "Escape") setSaving(false); }}
                      placeholder="Profile name…"
                      className="flex-1 bg-transparent outline-none px-2 py-1.5 rounded-lg"
                      style={{ fontSize: 12, color: T.textPrimary, background: T.bgInput, border: `1px solid ${T.borderSubtle}` }}
                      autoFocus
                    />
                  </div>
                  {showIconPicker && (
                    <div className="grid grid-cols-6 gap-1 p-2 rounded-lg" style={{ background: "rgba(0,0,0,0.2)", border: `1px solid ${T.borderSubtle}` }}>
                      {PROFILE_ICONS.map(icon => (
                        <button
                          key={icon}
                          onClick={() => { setNewIcon(icon); setShowIconPicker(false); }}
                          className="w-8 h-8 rounded-md flex items-center justify-center transition-all"
                          style={{ fontSize: 15, background: newIcon === icon ? `${T.cyan}20` : "transparent" }}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <button onClick={saveCurrentLayout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg flex-1 justify-center transition-all" style={{ fontSize: 11, fontWeight: 700, color: "#fff", background: `linear-gradient(135deg, ${T.cyan}CC, ${T.violet}CC)` }}>
                      <Save size={11} /> Save Profile
                    </button>
                    <button onClick={() => { setSaving(false); setShowIconPicker(false); }} className="px-3 py-1.5 rounded-lg transition-all" style={{ fontSize: 11, color: T.textMuted, background: "rgba(255,255,255,0.03)", border: `1px solid ${T.borderSubtle}` }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setSaving(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
                  style={{ fontSize: 11, color: T.textSecondary, background: "rgba(255,255,255,0.02)", border: `1px solid ${T.borderSubtle}` }}
                  onMouseEnter={e => { e.currentTarget.style.background = T.bgHover; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                  disabled={userProfiles.length >= MAX_PROFILES}
                >
                  <Plus size={12} color={T.textMuted} />
                  Save current layout as profile
                  <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textDim, marginLeft: "auto" }}>
                    {userProfiles.length}/{MAX_PROFILES}
                  </span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default WorkspaceProfiles;

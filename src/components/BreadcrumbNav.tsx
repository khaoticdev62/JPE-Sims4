"use client";

/* BreadcrumbNav.tsx — Phase 11
   Context-aware path breadcrumb shown above the workspace in editing modes.
   Features sibling navigation dropdowns, git branch indicator, and diff shortcut. */

import { useState, useRef, useEffect } from "react";
import {
  ChevronRight, Folder, FileCode, Braces, GitBranch,
  Globe, Code2, Package, Bug, Check,
} from "lucide-react";
import { AnimatePresence, motion } from "./jpe-motion";
import { T } from "./robust/jpe-theme";
import type { WorkspaceMode } from "./robust/jpe-theme";
import { toast } from "sonner";

/* ─── Types ─── */
interface BreadSegment {
  id: string;
  label: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  siblings?: string[];
  isFile?: boolean;
}

/* ─── Per-mode path configs ─── */
const FILE_EXT_COLOR: Record<string, string> = {
  xml:       T.amber,
  jpe:       T.violet,
  stbl:      T.violetBright,
  package:   T.rose,
  ts4script: T.emerald,
  json:      T.cyanDeep,
  log:       T.textMuted,
  py:        T.cyan,
};

function getSegments(mode: WorkspaceMode): BreadSegment[] | null {
  switch (mode) {
    case "code": return [
      { id: "project",    label: "JPE_Project",                    Icon: Braces,   siblings: ["JPE_Project", "TestMod_v2", "BaseGame_Ref", "Community_Patches"] },
      { id: "src",        label: "src",                            Icon: Folder,   siblings: ["src", "dist", "tests", "docs", "assets"] },
      { id: "tuning",     label: "tuning",                         Icon: Folder,   siblings: ["tuning", "scripts", "locales", "resources", "catalog"] },
      { id: "file",       label: "S4_034AEECB_trait_Evil.xml",     Icon: FileCode, siblings: ["S4_034AEECB_trait_Evil.xml", "S4_034AEECB_trait_Cheerful.xml", "S4_034AEECB_trait_Goofball.xml", "S4_034AEECB_trait_Genius.xml", "S4_034AEECB_trait_Mean.xml"], isFile: true },
    ];
    case "jpe": return [
      { id: "project",      label: "JPE_Project",    Icon: Braces,   siblings: ["JPE_Project", "TestMod_v2"] },
      { id: "src",          label: "src",            Icon: Folder,   siblings: ["src", "dist", "tests"] },
      { id: "interactions", label: "interactions",   Icon: Folder,   siblings: ["interactions", "traits", "objects", "buffs", "skills"] },
      { id: "file",         label: "hug_friend.jpe", Icon: FileCode, siblings: ["hug_friend.jpe", "tell_joke.jpe", "argue.jpe", "romance_kiss.jpe", "complain.jpe"], isFile: true },
    ];
    case "translation": return [
      { id: "project", label: "JPE_Project",  Icon: Braces,   siblings: ["JPE_Project", "TestMod_v2"] },
      { id: "locales",  label: "locales",      Icon: Folder,   siblings: ["locales", "assets", "schemas"] },
      { id: "locale",   label: "en-US",        Icon: Globe,    siblings: ["en-US", "es-ES", "fr-FR", "de-DE", "pt-BR", "zh-CN", "ko-KR", "ja-JP"] },
      { id: "file",     label: "strings.stbl", Icon: FileCode, siblings: ["strings.stbl", "ui_strings.stbl", "cas_strings.stbl", "notification.stbl"], isFile: true },
    ];
    case "build": return [
      { id: "project", label: "JPE_Project",        Icon: Braces,   siblings: ["JPE_Project", "TestMod_v2"] },
      { id: "dist",    label: "dist",                Icon: Folder,   siblings: ["dist", "build", "output", "release"] },
      { id: "file",    label: "trait_Evil.package",  Icon: Package,  siblings: ["trait_Evil.package", "trait_Evil_debug.package", "trait_Evil_stripped.package"], isFile: true },
    ];
    case "debug": return [
      { id: "project", label: "JPE_Project",  Icon: Braces,  siblings: ["JPE_Project"] },
      { id: "logs",    label: "logs",          Icon: Folder,  siblings: ["logs", "crash", "dumps", "profiler"] },
      { id: "file",    label: "exception.log", Icon: Bug,     siblings: ["exception.log", "gameplay.log", "script_call.log", "cas.log"], isFile: true },
    ];
    case "conflicts": return [
      { id: "project", label: "JPE_Project",                Icon: Braces,   siblings: ["JPE_Project"] },
      { id: "src",     label: "src",                        Icon: Folder,   siblings: ["src", "dist"] },
      { id: "file",    label: "S4_034AEECB_trait_Evil.xml", Icon: FileCode, isFile: true },
    ];
    default: return null;
  }
}

/* ─── Component ─── */
export function BreadcrumbNav({
  mode,
  onDiffOpen,
}: {
  mode: WorkspaceMode;
  onDiffOpen?: () => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const segments = getSegments(mode);

  useEffect(() => { setOpenId(null); }, [mode]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpenId(null);
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, []);

  if (!segments || segments.length === 0) return null;

  const fileSegment = segments[segments.length - 1];
  const fileExt = fileSegment.label.split(".").pop() ?? "";
  const fileColor = FILE_EXT_COLOR[fileExt] ?? T.textSecondary;

  return (
    <div
      ref={ref}
      className="flex items-center px-3 flex-shrink-0 relative"
      style={{
        height: 28,
        background: T.bgSurface,
        borderBottom: `1px solid ${T.borderSubtle}`,
        fontFamily: T.sans,
      }}
    >
      {/* Git branch indicator */}
      <button
        className="flex items-center gap-1 mr-2 flex-shrink-0 px-1.5 py-0.5 rounded-md transition-colors"
        style={{ color: T.emerald }}
        onMouseEnter={e => { e.currentTarget.style.background = T.bgHover; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
        onClick={() => toast.info("Branch: main · 3 ahead, 0 behind origin")}
        title="Git status"
      >
        <GitBranch size={10} color={T.emerald} />
        <span style={{ fontSize: 10, fontFamily: T.mono, color: T.emerald }}>main</span>
      </button>
      <div className="w-px h-3 mr-2 flex-shrink-0" style={{ background: T.border }} />

      {/* Breadcrumb path segments */}
      <div className="flex items-center min-w-0 flex-1 overflow-hidden">
        {segments.map((seg, idx) => {
          const isLast = idx === segments.length - 1;
          const isOpen = openId === seg.id;
          const { Icon } = seg;
          const segColor = isLast ? fileColor : T.textTertiary;
          const hasSiblings = seg.siblings && seg.siblings.length > 1;

          return (
            <div key={seg.id} className="flex items-center flex-shrink-0 relative">
              <button
                className="flex items-center gap-1 px-1 py-0.5 rounded-md transition-all"
                style={{ maxWidth: isLast ? 220 : 100, color: segColor }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = T.bgHover;
                  e.currentTarget.style.color = T.textPrimary;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = segColor;
                }}
                onClick={() => {
                  if (hasSiblings) setOpenId(isOpen ? null : seg.id);
                  else toast.info(`Navigate to: ${seg.label}`);
                }}
                title={seg.label + (hasSiblings ? " (click for siblings)" : "")}
              >
                <Icon size={10} color={isLast ? fileColor : T.textMuted} />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: isLast ? 600 : 400,
                    color: "inherit",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap" as const,
                  }}
                >
                  {seg.label}
                </span>
              </button>

              {/* Sibling dropdown */}
              <AnimatePresence>
                {isOpen && seg.siblings && (
                  <motion.div
                    className="absolute top-full left-0 z-[90] rounded-xl py-1 min-w-[220px]"
                    initial={{ opacity: 0, y: -4, scale: 0.96 }}
                    animate={{ opacity: 1, y: 2, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.96 }}
                    transition={{ duration: 0.14 }}
                    style={{
                      background: T.bgElevated,
                      border: `1px solid ${T.border}`,
                      boxShadow: "0 8px 32px rgba(0,0,0,0.55), 0 0 1px rgba(255,255,255,0.04)",
                    }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${T.cyan}40, transparent)` }} />

                    {/* Section header */}
                    <div className="px-3 py-1 mb-0.5" style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
                      <span style={{ fontSize: 9, fontFamily: T.mono, fontWeight: 700, color: T.textDim, letterSpacing: "0.07em", textTransform: "uppercase" as const }}>
                        {seg.isFile ? "Files in directory" : "Subdirectories"}
                      </span>
                    </div>

                    {seg.siblings.map(sibling => {
                      const isCurrent = sibling === seg.label;
                      return (
                        <button
                          key={sibling}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-left transition-colors"
                          onMouseEnter={e => { if (!isCurrent) e.currentTarget.style.background = T.bgHover; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                          onClick={() => {
                            setOpenId(null);
                            if (!isCurrent) toast.success(`Switched to ${sibling}`);
                          }}
                        >
                          <Icon size={10} color={isCurrent ? T.cyan : T.textMuted} />
                          <span className="flex-1 truncate" style={{ fontSize: 11, color: isCurrent ? T.textPrimary : T.textSecondary }}>
                            {sibling}
                          </span>
                          {isCurrent && (
                            <Check size={10} color={T.cyan} />
                          )}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              {!isLast && (
                <ChevronRight
                  size={10}
                  color={T.textDim}
                  style={{ marginLeft: 2, marginRight: 2, flexShrink: 0 }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1 ml-2 flex-shrink-0">
        {/* Language/filetype badge */}
        <span
          style={{
            fontSize: 8, fontFamily: T.mono, fontWeight: 700,
            color: fileColor, background: `${fileColor}12`,
            border: `1px solid ${fileColor}25`,
            padding: "1px 5px", borderRadius: 3, letterSpacing: "0.06em",
          }}
        >
          {fileExt.toUpperCase()}
        </span>

        {/* DIFF button */}
        {onDiffOpen && (
          <>
            <div className="w-px h-3 mx-1" style={{ background: T.borderSubtle }} />
            <button
              className="flex items-center gap-1 px-2 py-0.5 rounded-md transition-colors flex-shrink-0"
              style={{
                fontSize: 9, fontFamily: T.mono, fontWeight: 700,
                color: T.textDim,
                background: "rgba(255,255,255,0.02)",
                border: `1px solid ${T.borderSubtle}`,
                letterSpacing: "0.04em",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = T.cyan;
                e.currentTarget.style.borderColor = `${T.cyan}40`;
                e.currentTarget.style.background = T.cyanDim;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = T.textDim;
                e.currentTarget.style.borderColor = T.borderSubtle;
                e.currentTarget.style.background = "rgba(255,255,255,0.02)";
              }}
              onClick={onDiffOpen}
              title="Compare with HEAD (Ctrl+Alt+D)"
            >
              <Code2 size={9} />
              DIFF
            </button>
          </>
        )}
      </div>
    </div>
  );
}

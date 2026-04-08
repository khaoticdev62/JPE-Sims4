"use client";

/* JPE Studio — File Operation Dialog
   Handles: New File (with 6 templates), New Folder, and Rename with live validation. */

import { useState, useEffect, useRef, useCallback } from "react";
import {
  File, X, Check, AlertTriangle, ChevronRight,
  FileCode, Code2, Globe, Braces, FileText, Sparkles,
  FolderPlus, Edit3, Info,
  type LucideIcon,
} from "lucide-react";
import { T } from "./robust/jpe-theme";
import { motion, AnimatePresence, easing } from "./jpe-motion";
import { JpeButton } from "./jpe-design-system";

/* ── Types ── */
export type FileDialogMode = "new-file" | "new-folder" | "rename";

export interface FileDialogConfig {
  mode: FileDialogMode;
  currentName?: string;
  parentPath?: string;
}

export interface FileOperationDialogProps extends FileDialogConfig {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string, template?: string) => void;
}

/* ── File templates ── */
interface FileTemplate {
  id: string;
  name: string;
  ext: string;
  icon: LucideIcon;
  color: string;
  badge: string;
  description: string;
}

const fileTemplates: FileTemplate[] = [
  {
    id: "jpe",
    name: "JPE Script",
    ext: ".jpe",
    icon: Sparkles,
    color: "#A78BFA",
    badge: "JPE",
    description: "Interaction, trait, or buff script in JPE DSL",
  },
  {
    id: "xml",
    name: "XML Tuning",
    ext: ".xml",
    icon: FileCode,
    color: "#63B3ED",
    badge: "XML",
    description: "Sims 4 tuning file (TuningRoot, Instance, Tunable)",
  },
  {
    id: "stbl",
    name: "STBL Locale",
    ext: ".stbl",
    icon: Globe,
    color: "#8B5CF6",
    badge: "STBL",
    description: "String table for a specific locale (en_US, etc.)",
  },
  {
    id: "python",
    name: "TS4 Script",
    ext: ".ts4script",
    icon: Code2,
    color: "#48BB78",
    badge: "PY",
    description: "Python mod script compiled to ts4script",
  },
  {
    id: "json",
    name: "JSON Config",
    ext: ".json",
    icon: Braces,
    color: "#F6AD55",
    badge: "JSON",
    description: "Configuration, manifest, or locale map file",
  },
  {
    id: "md",
    name: "Markdown",
    ext: ".md",
    icon: FileText,
    color: "#718096",
    badge: "MD",
    description: "Documentation, README, or changelog",
  },
];

/* ── Validation ── */
// eslint-disable-next-line no-control-regex
const INVALID_CHARS = /[<>:"/\\|?*\x00-\x1f]/;

function validateName(name: string, mode: FileDialogMode): string {
  const trimmed = name.trim();
  if (!trimmed) return "Name cannot be empty";
  if (trimmed.length > 200) return "Name is too long (max 200 characters)";
  if (INVALID_CHARS.test(trimmed)) return 'Name contains invalid characters: < > : " / \\ | ? *';
  if (trimmed.startsWith(".")) return "Name cannot start with a period";
  if (trimmed.endsWith(".") && mode !== "new-file") return "Name cannot end with a period";
  if (trimmed === "." || trimmed === "..") return "Invalid name";
  return "";
}

/* ── Component ── */
export function FileOperationDialog({
  isOpen,
  mode,
  currentName = "",
  parentPath = "JPE_Project/src/tuning/",
  onClose,
  onConfirm,
}: FileOperationDialogProps) {
  const [name, setName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("jpe");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  /* Reset state when opening */
  useEffect(() => {
    if (isOpen) {
      setName(currentName);
      setError("");
      setSubmitted(false);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 80);
    }
  }, [isOpen, currentName]);

  /* ESC to close */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const handleNameChange = useCallback((value: string) => {
    setName(value);
    if (submitted) setError(validateName(value, mode));
  }, [submitted, mode]);

  const handleConfirm = useCallback(() => {
    setSubmitted(true);
    const err = validateName(name, mode);
    if (err) { setError(err); inputRef.current?.focus(); return; }

    let finalName = name.trim();
    if (mode === "new-file") {
      const tmpl = fileTemplates.find(t => t.id === selectedTemplate);
      // Append extension only if the user didn't type one
      if (tmpl && !finalName.includes(".")) {
        finalName = finalName + tmpl.ext;
      }
    }

    onConfirm(finalName, mode === "new-file" ? selectedTemplate : undefined);
    onClose();
  }, [name, mode, selectedTemplate, onConfirm, onClose]);

  /* Dialog meta */
  const titleText = mode === "new-file" ? "New File" : mode === "new-folder" ? "New Folder" : "Rename";
  const TitleIcon = mode === "new-folder" ? FolderPlus : mode === "rename" ? Edit3 : File;
  const iconColor = mode === "new-folder" ? T.amber : mode === "rename" ? T.violet : T.cyan;
  const iconBg = mode === "new-folder" ? T.amberDim : mode === "rename" ? T.violetDim : T.cyanDim;
  const iconBorder = mode === "new-folder" ? `${T.amber}30` : mode === "rename" ? `${T.violet}30` : `${T.cyan}30`;
  const activeTemplate = fileTemplates.find(t => t.id === selectedTemplate)!;
  const displayExtHint = mode === "new-file" && name && !name.includes(".");

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          className="fixed inset-0 z-[300] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}
          onClick={e => { if (e.target === overlayRef.current) onClose(); }}
          role="dialog"
          aria-modal="true"
          aria-label={titleText}
        >
          <motion.div
            className="rounded-2xl overflow-hidden flex flex-col"
            style={{
              width: mode === "new-file" ? 560 : 420,
              maxHeight: "90vh",
              background: T.bgPanel,
              border: `1px solid ${T.border}`,
              boxShadow: `0 32px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)`,
            }}
            initial={{ opacity: 0, scale: 0.93, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 12 }}
            transition={{ duration: 0.22, ease: easing.outStandard }}
          >
            {/* Chromatic top strip */}
            <div
              className="h-px flex-shrink-0"
              style={{ background: `linear-gradient(90deg, transparent, ${iconColor}60, transparent)` }}
            />

            {/* ── Header ── */}
            <div
              className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
              style={{ borderBottom: `1px solid ${T.border}`, background: T.bgSurface }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: iconBg,
                  border: `1px solid ${iconBorder}`,
                  boxShadow: `0 0 14px ${iconColor}10`,
                }}
              >
                <TitleIcon size={17} color={iconColor} />
              </div>
              <div className="flex-1 min-w-0">
                <div style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary }}>{titleText}</div>
                <div
                  className="flex items-center gap-1 mt-0.5"
                  style={{ fontSize: 10, fontFamily: T.mono, color: T.textMuted }}
                >
                  <span>in</span>
                  <ChevronRight size={9} color={T.textDim} />
                  {parentPath.split("/").filter(Boolean).map((seg, i, arr) => (
                    <span key={i} className="flex items-center gap-1">
                      <span style={{ color: i === arr.length - 1 ? T.textTertiary : T.textDim }}>{seg}</span>
                      {i < arr.length - 1 && <ChevronRight size={9} color={T.textDim} />}
                    </span>
                  ))}
                </div>
              </div>
              <button
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5"
                onClick={onClose}
                aria-label="Close dialog"
              >
                <X size={14} color={T.textMuted} />
              </button>
            </div>

            {/* ── Template picker (new-file only) ── */}
            {mode === "new-file" && (
              <div
                className="px-5 py-4 flex-shrink-0"
                style={{ borderBottom: `1px solid ${T.border}` }}
              >
                <div style={{
                  fontSize: 10, fontWeight: 700, color: T.textTertiary,
                  letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10,
                }}>
                  Template
                </div>
                <div
                  className="grid gap-2"
                  style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
                  role="radiogroup"
                  aria-label="File template"
                >
                  {fileTemplates.map(tmpl => {
                    const isActive = selectedTemplate === tmpl.id;
                    const TmplIcon = tmpl.icon;
                    return (
                      <button
                        key={tmpl.id}
                        role="radio"
                        aria-checked={isActive}
                        onClick={() => setSelectedTemplate(tmpl.id)}
                        className="flex items-start gap-2.5 p-3 rounded-xl text-left transition-all group"
                        style={{
                          background: isActive ? `${tmpl.color}0e` : "rgba(255,255,255,0.015)",
                          border: `1px solid ${isActive ? `${tmpl.color}35` : T.borderSubtle}`,
                          boxShadow: isActive ? `0 0 16px ${tmpl.color}08, inset 0 0 0 1px ${tmpl.color}08` : "none",
                          outline: "none",
                        }}
                        onMouseEnter={e => {
                          if (!isActive) {
                            e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                            e.currentTarget.style.borderColor = T.borderActive;
                          }
                        }}
                        onMouseLeave={e => {
                          if (!isActive) {
                            e.currentTarget.style.background = "rgba(255,255,255,0.015)";
                            e.currentTarget.style.borderColor = T.borderSubtle;
                          }
                        }}
                      >
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{
                            background: `${tmpl.color}18`,
                            border: `1px solid ${tmpl.color}28`,
                          }}
                        >
                          <TmplIcon size={12} color={tmpl.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span style={{ fontSize: 11, fontWeight: 700, color: isActive ? tmpl.color : T.textSecondary }}>{tmpl.name}</span>
                            <span
                              className="px-1 py-0 rounded"
                              style={{
                                fontSize: 8, fontWeight: 700,
                                color: tmpl.color,
                                background: `${tmpl.color}15`,
                                letterSpacing: "0.04em",
                              }}
                            >
                              {tmpl.badge}
                            </span>
                          </div>
                          <div style={{ fontSize: 9, color: T.textMuted, lineHeight: 1.4, fontFamily: T.mono }}>
                            {tmpl.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Name input ── */}
            <div className="px-5 py-4 flex-shrink-0">
              <div style={{
                fontSize: 10, fontWeight: 700, color: T.textTertiary,
                letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8,
              }}>
                {mode === "rename" ? "New Name" : "File Name"}
              </div>
              <div className="relative">
                <input
                  ref={inputRef}
                  value={name}
                  onChange={e => handleNameChange(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") { e.preventDefault(); handleConfirm(); }
                  }}
                  placeholder={
                    mode === "new-folder" ? "my-folder"
                    : mode === "rename" ? currentName
                    : `my-${activeTemplate.ext.slice(1)}-file`
                  }
                  className="w-full py-2.5 rounded-xl outline-none transition-all"
                  style={{
                    fontSize: 14, fontFamily: T.mono, color: T.textPrimary,
                    background: T.bgInput,
                    border: `1px solid ${error ? `${T.rose}50` : T.borderActive}`,
                    boxShadow: error ? `0 0 0 3px ${T.rose}10` : `0 0 0 3px ${T.cyan}06`,
                    paddingLeft: 14,
                    paddingRight: displayExtHint ? 80 : 14,
                  }}
                  spellCheck={false}
                  autoComplete="off"
                  aria-invalid={!!error}
                  aria-describedby={error ? "file-dialog-error" : undefined}
                />
                {/* Extension hint badge */}
                {displayExtHint && (
                  <div
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-md"
                    style={{
                      fontSize: 10, fontFamily: T.mono, fontWeight: 700,
                      color: activeTemplate.color,
                      background: `${activeTemplate.color}15`,
                      border: `1px solid ${activeTemplate.color}25`,
                      pointerEvents: "none",
                    }}
                  >
                    {activeTemplate.ext}
                  </div>
                )}
              </div>

              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    id="file-dialog-error"
                    role="alert"
                    className="flex items-center gap-1.5 mt-2"
                    initial={{ opacity: 0, y: -4, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -4, height: 0 }}
                  >
                    <AlertTriangle size={11} color={T.rose} />
                    <span style={{ fontSize: 11, color: T.rose }}>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Hint text */}
              {!error && mode === "new-file" && (
                <div className="flex items-center gap-1.5 mt-2">
                  <Info size={10} color={T.textDim} />
                  <span style={{ fontSize: 10, color: T.textDim, fontFamily: T.mono }}>
                    Extension will be added automatically. Press <kbd style={{ fontSize: 9, padding: "0 4px", borderRadius: 3, background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}` }}>↵</kbd> to confirm.
                  </span>
                </div>
              )}
              {!error && mode === "new-folder" && (
                <div className="flex items-center gap-1.5 mt-2">
                  <Info size={10} color={T.textDim} />
                  <span style={{ fontSize: 10, color: T.textDim, fontFamily: T.mono }}>
                    Use hyphens or underscores instead of spaces.
                  </span>
                </div>
              )}
            </div>

            {/* ── Preview row (new-file) ── */}
            {mode === "new-file" && name.trim() && (
              <div
                className="mx-5 mb-4 px-4 py-2.5 rounded-xl flex-shrink-0 flex items-center gap-2"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: `1px solid ${T.borderSubtle}`,
                }}
              >
                <activeTemplate.icon size={12} color={activeTemplate.color} />
                <span style={{ fontSize: 12, fontFamily: T.mono, color: T.textSecondary }}>
                  {parentPath}
                  <span style={{ color: T.textPrimary, fontWeight: 700 }}>
                    {name.trim().includes(".") ? name.trim() : name.trim() + activeTemplate.ext}
                  </span>
                </span>
              </div>
            )}

            {/* ── Actions ── */}
            <div
              className="flex items-center justify-end gap-2 px-5 py-3 flex-shrink-0"
              style={{ borderTop: `1px solid ${T.border}`, background: T.bgSurface }}
            >
              <JpeButton variant="ghost" size="sm" onClick={onClose}>Cancel</JpeButton>
              <JpeButton
                variant="primary"
                size="sm"
                icon={Check}
                onClick={handleConfirm}
              >
                {titleText}
              </JpeButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

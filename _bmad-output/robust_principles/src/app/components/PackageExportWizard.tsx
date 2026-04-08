/* ─────────────────────────────────────────────────────────────
   JPE Studio — Package Export Wizard (Phase 13)
   5-step full-screen wizard for bundling and exporting .package files
   ───────────────────────────────────────────────────────────── */
import { useState, useEffect, useCallback } from "react";
import {
  X, ChevronRight, ChevronLeft, CheckCircle2, Package, FileCode,
  Braces, FileText, Globe, Shield, Rocket, Download, Sparkles,
  Hash, Tag, User, Book, AlertTriangle, RefreshCw, Copy,
  Star, Layers, HardDrive, Archive,
  Check, File, Folder,
} from "lucide-react";
import { motion, AnimatePresence } from "./jpe-motion";
import { T } from "../pages/jpe-theme";
import { toast } from "sonner";

/* ── Types ── */
interface ExportFile {
  name: string;
  type: "xml" | "stbl" | "package" | "ts4script" | "json" | "jpe";
  size: string;
  selected: boolean;
  status: "ok" | "modified" | "warning";
}

interface ModMetadata {
  name: string;
  version: string;
  author: string;
  description: string;
  category: string;
  tags: string;
  minGameVersion: string;
  requiresEP: string[];
  website: string;
  license: string;
}

interface CompatFlag {
  id: string;
  label: string;
  description: string;
  required: boolean;
  selected: boolean;
  icon: typeof Package;
  color: string;
}

const STEPS = [
  { id: "files",    label: "Select Files",   icon: Folder,   desc: "Choose which files to bundle" },
  { id: "meta",     label: "Metadata",       icon: Book,     desc: "Set mod name, version, author" },
  { id: "compat",   label: "Compatibility",  icon: Shield,   desc: "Set game version requirements" },
  { id: "preview",  label: "Preview",        icon: FileText, desc: "Review the manifest & structure" },
  { id: "export",   label: "Export",         icon: Rocket,   desc: "Build and download your package" },
];

const FILE_TYPE_ICONS: Record<string, { color: string; icon: typeof File }> = {
  xml:       { color: T.cyan,        icon: FileCode },
  stbl:      { color: T.violet,      icon: Globe },
  package:   { color: T.amber,       icon: Package },
  ts4script: { color: T.emerald,     icon: Braces },
  json:      { color: T.amber,       icon: Braces },
  jpe:       { color: T.violetBright, icon: Sparkles },
};

const DEMO_FILES: ExportFile[] = [
  { name: "S4_034AEECB_trait_Evil.xml",       type: "xml",       size: "12.4 KB", selected: true,  status: "modified" },
  { name: "S4_034AEECB_trait_Childish.xml",   type: "xml",       size: "9.8 KB",  selected: true,  status: "ok" },
  { name: "S4_034AEECB_interaction_Hug.xml",  type: "xml",       size: "7.2 KB",  selected: true,  status: "ok" },
  { name: "hug_friend.jpe",                   type: "jpe",       size: "3.1 KB",  selected: false, status: "ok" },
  { name: "en_US.stbl",                        type: "stbl",      size: "48.7 KB", selected: true,  status: "ok" },
  { name: "ja_JP.stbl",                        type: "stbl",      size: "46.2 KB", selected: true,  status: "warning" },
  { name: "de_DE.stbl",                        type: "stbl",      size: "47.9 KB", selected: true,  status: "ok" },
  { name: "jpe_translator.ts4script",          type: "ts4script", size: "21.3 KB", selected: true,  status: "ok" },
  { name: "manifest.json",                     type: "json",      size: "1.4 KB",  selected: true,  status: "ok" },
];

const CATEGORIES = [
  "Gameplay Override", "Trait", "Interaction", "Build/Buy", "CAS", "Career",
  "NPC Behaviour", "Script Mod", "Utility", "Translation", "Other",
];

const DEFAULT_META: ModMetadata = {
  name: "Evil Trait Override",
  version: "1.0.0",
  author: "JPE Author",
  description: "A comprehensive Sims 4 mod that overrides the Evil trait behaviour, adds new interactions, and bundles custom STBL string tables for 3 locales.",
  category: "Trait",
  tags: "trait, evil, interaction, override",
  minGameVersion: "1.108",
  requiresEP: [],
  website: "https://example.com",
  license: "MIT",
};

const EPS: CompatFlag[] = [
  { id: "get-to-work",       label: "Get To Work",       description: "First expansion pack",         required: false, selected: false, icon: Package, color: T.cyan },
  { id: "get-together",      label: "Get Together",      description: "Social activities EP",         required: false, selected: false, icon: Package, color: T.violet },
  { id: "city-living",       label: "City Living",       description: "Urban gameplay EP",            required: false, selected: false, icon: Package, color: T.emerald },
  { id: "cats-and-dogs",     label: "Cats & Dogs",       description: "Pets expansion",               required: false, selected: false, icon: Package, color: T.amber },
  { id: "seasons",           label: "Seasons",           description: "Weather & holidays EP",        required: false, selected: false, icon: Package, color: T.rose },
  { id: "eco-lifestyle",     label: "Eco Lifestyle",     description: "Green energy EP",              required: false, selected: false, icon: Package, color: T.emerald },
  { id: "snowy-escape",      label: "Snowy Escape",      description: "Mountain activities EP",       required: false, selected: false, icon: Package, color: T.cyan },
  { id: "cottage-living",    label: "Cottage Living",    description: "Rural farming EP",             required: false, selected: false, icon: Package, color: T.amber },
];

/* ── Cinematic progress glow bar ── */
function StepDivider({ progress }: { progress: number }) {
  return (
    <div className="relative h-[2px] flex-1 mx-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{ background: `linear-gradient(90deg, ${T.cyan}, ${T.violet})` }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      />
    </div>
  );
}

/* ── Main component ── */
export function PackageExportWizard({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<ExportFile[]>(DEMO_FILES);
  const [meta, setMeta] = useState<ModMetadata>(DEFAULT_META);
  const [epFlags, setEpFlags] = useState<CompatFlag[]>(EPS);
  const [exportState, setExportState] = useState<"idle" | "building" | "done" | "error">("idle");
  const [exportProgress, setExportProgress] = useState(0);
  const [exportLog, setExportLog] = useState<string[]>([]);
  const [checksumMap, setChecksumMap] = useState<Record<string, string>>({});

  /* Reset when opened */
  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setFiles(DEMO_FILES);
      setMeta(DEFAULT_META);
      setEpFlags(EPS);
      setExportState("idle");
      setExportProgress(0);
      setExportLog([]);
    }
  }, [isOpen]);

  /* Keyboard: Escape to close, Arrows to navigate */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === "ArrowRight" && step < STEPS.length - 1) setStep(s => s + 1);
      if ((e.metaKey || e.ctrlKey) && e.key === "ArrowLeft" && step > 0) setStep(s => s - 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, step, onClose]);

  const selectedFiles = files.filter(f => f.selected);
  const totalSize = selectedFiles.reduce((acc, f) => acc + parseFloat(f.size), 0);
  const warnings = selectedFiles.filter(f => f.status === "warning").length;

  const toggleFile = (name: string) => {
    setFiles(prev => prev.map(f => f.name === name ? { ...f, selected: !f.selected } : f));
  };
  const toggleAllFiles = () => {
    const allSelected = files.every(f => f.selected);
    setFiles(prev => prev.map(f => ({ ...f, selected: !allSelected })));
  };
  const toggleEP = (id: string) => {
    setEpFlags(prev => prev.map(e => e.id === id ? { ...e, selected: !e.selected } : e));
  };

  /* Simulate export build */
  const runExport = useCallback(async () => {
    setExportState("building");
    setExportProgress(0);
    setExportLog([]);

    const logLines = [
      "→ Initialising build environment…",
      `→ Compressing ${selectedFiles.length} source files…`,
      "→ Validating XML schemas…",
      "→ Verifying STBL string hashes…",
      "→ Generating resource key map…",
      "→ Building package index table…",
      "→ Computing checksums (SHA-256)…",
      "→ Bundling .package archive…",
      "→ Signing manifest…",
      "→ Finalising export…",
      "✓ Build complete!",
    ];

    for (let i = 0; i < logLines.length; i++) {
      await new Promise(r => setTimeout(r, 280 + Math.random() * 180));
      setExportLog(prev => [...prev, logLines[i]]);
      setExportProgress(Math.round(((i + 1) / logLines.length) * 100));
    }

    /* generate mock checksums */
    const map: Record<string, string> = {};
    selectedFiles.forEach(f => {
      map[f.name] = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, "0")).join("");
    });
    setChecksumMap(map);
    setExportState("done");
    toast.success(`${meta.name} v${meta.version}.package exported!`, {
      description: `${selectedFiles.length} files · ${totalSize.toFixed(1)} KB`,
    });
  }, [selectedFiles, meta.name, meta.version, totalSize]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex flex-col rounded-2xl overflow-hidden"
            style={{
              width: "min(900px, 95vw)",
              maxHeight: "90vh",
              background: T.bgElevated,
              border: `1px solid ${T.border}`,
              boxShadow: `0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.04)`,
            }}
          >
            {/* Top glow accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent 5%, ${T.cyan}80, ${T.violet}80, transparent 95%)` }} />

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${T.cyan}20, ${T.violet}20)`, border: `1px solid ${T.borderSubtle}` }}>
                  <Archive size={16} color={T.cyan} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary, fontFamily: T.display }}>Package Export Wizard</div>
                  <div style={{ fontSize: 10, color: T.textMuted, fontFamily: T.mono }}>Build and export your Sims 4 mod as a .package file</div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
                style={{ border: `1px solid ${T.borderSubtle}` }}
              >
                <X size={14} color={T.textMuted} />
              </button>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-1 px-6 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${T.borderSubtle}`, background: "rgba(0,0,0,0.15)" }}>
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                const isActive = i === step;
                const isDone = i < step;
                return (
                  <div key={s.id} className="flex items-center min-w-0">
                    <button
                      onClick={() => { if (i <= step || isDone) setStep(i); }}
                      className="flex items-center gap-1.5 flex-shrink-0 transition-all rounded-lg px-2 py-1"
                      style={{
                        background: isActive ? `rgba(99,179,237,0.08)` : "transparent",
                        cursor: i <= step ? "pointer" : "default",
                        opacity: i > step ? 0.4 : 1,
                      }}
                    >
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{
                        background: isDone ? T.emerald : isActive ? T.cyan : "rgba(255,255,255,0.05)",
                        border: `1px solid ${isDone ? T.emerald : isActive ? `${T.cyan}60` : T.borderSubtle}`,
                      }}>
                        {isDone
                          ? <Check size={10} color="#fff" />
                          : <span style={{ fontSize: 8, fontWeight: 700, fontFamily: T.mono, color: isActive ? T.cyan : T.textDim }}>{i + 1}</span>
                        }
                      </div>
                      <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, color: isActive ? T.textPrimary : T.textTertiary, fontFamily: T.sans, whiteSpace: "nowrap" }}>
                        {s.label}
                      </span>
                    </button>
                    {i < STEPS.length - 1 && (
                      <StepDivider progress={i < step ? 100 : isActive ? 50 : 0} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-hidden min-h-0">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  className="h-full overflow-y-auto"
                >
                  {/* ── Step 1: Select Files ── */}
                  {step === 0 && (
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>Select files to bundle</div>
                          <div style={{ fontSize: 11, color: T.textMuted }}>{selectedFiles.length} of {files.length} files selected · {totalSize.toFixed(1)} KB estimated</div>
                        </div>
                        <button
                          onClick={toggleAllFiles}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all"
                          style={{ fontSize: 11, color: T.textSecondary, background: "rgba(255,255,255,0.03)", border: `1px solid ${T.borderSubtle}` }}
                        >
                          {files.every(f => f.selected) ? "Deselect All" : "Select All"}
                        </button>
                      </div>

                      <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${T.border}` }}>
                        {/* Table header */}
                        <div className="grid px-4 py-2" style={{ gridTemplateColumns: "20px 1fr 80px 70px 60px", gap: 8, background: T.bgSurface, borderBottom: `1px solid ${T.border}` }}>
                          {["", "File", "Type", "Size", "Status"].map((h, i) => (
                            <span key={i} style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>{h}</span>
                          ))}
                        </div>
                        {files.map((file) => {
                          const cfg = FILE_TYPE_ICONS[file.type] ?? { color: T.textMuted, icon: File };
                          const Icon = cfg.icon;
                          return (
                            <div
                              key={file.name}
                              className="grid items-center px-4 py-2 cursor-pointer transition-colors"
                              style={{
                                gridTemplateColumns: "20px 1fr 80px 70px 60px",
                                gap: 8,
                                borderBottom: `1px solid ${T.borderSubtle}`,
                                background: file.selected ? `rgba(99,179,237,0.02)` : "transparent",
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = T.bgHover; }}
                              onMouseLeave={e => { e.currentTarget.style.background = file.selected ? `rgba(99,179,237,0.02)` : "transparent"; }}
                              onClick={() => toggleFile(file.name)}
                            >
                              <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0" style={{
                                background: file.selected ? T.cyan : "rgba(255,255,255,0.04)",
                                border: `1px solid ${file.selected ? T.cyan : T.borderSubtle}`,
                              }}>
                                {file.selected && <Check size={9} color="#fff" />}
                              </div>
                              <div className="flex items-center gap-2 min-w-0">
                                <Icon size={12} color={cfg.color} className="flex-shrink-0" />
                                <span className="truncate" style={{ fontSize: 12, color: T.textSecondary, fontFamily: T.mono }}>{file.name}</span>
                              </div>
                              <span style={{ fontSize: 10, fontFamily: T.mono, color: cfg.color }}>{file.type.toUpperCase()}</span>
                              <span style={{ fontSize: 10, fontFamily: T.mono, color: T.textMuted }}>{file.size}</span>
                              <div className="flex items-center gap-1">
                                {file.status === "ok" && <CheckCircle2 size={10} color={T.emerald} />}
                                {file.status === "modified" && <div className="w-2 h-2 rounded-full" style={{ background: T.cyan }} />}
                                {file.status === "warning" && <AlertTriangle size={10} color={T.amber} />}
                                <span style={{ fontSize: 9, color: file.status === "warning" ? T.amber : file.status === "modified" ? T.cyan : T.emerald }}>
                                  {file.status === "ok" ? "OK" : file.status === "modified" ? "MOD" : "WARN"}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {warnings > 0 && (
                        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg" style={{ background: T.amberDim, border: `1px solid ${T.amber}20` }}>
                          <AlertTriangle size={12} color={T.amber} />
                          <span style={{ fontSize: 11, color: T.amber }}>{warnings} file(s) have unresolved warnings — they can still be exported</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Step 2: Metadata ── */}
                  {step === 1 && (
                    <div className="p-6 grid grid-cols-2 gap-5">
                      <div className="col-span-2">
                        <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary, marginBottom: 4 }}>Mod Metadata</div>
                        <div style={{ fontSize: 11, color: T.textMuted }}>This information will be embedded in the manifest.json and displayed in-game.</div>
                      </div>

                      {[
                        { label: "Mod Name",    key: "name" as keyof ModMetadata,        icon: Book,    placeholder: "My Awesome Mod", fullWidth: false },
                        { label: "Version",     key: "version" as keyof ModMetadata,     icon: Tag,     placeholder: "1.0.0",          fullWidth: false },
                        { label: "Author",      key: "author" as keyof ModMetadata,      icon: User,    placeholder: "Your Name",      fullWidth: false },
                        { label: "Website",     key: "website" as keyof ModMetadata,     icon: Globe,   placeholder: "https://...",    fullWidth: false },
                        { label: "Tags",        key: "tags" as keyof ModMetadata,        icon: Hash,    placeholder: "comma separated", fullWidth: false },
                        { label: "Min Game Ver", key: "minGameVersion" as keyof ModMetadata, icon: Shield, placeholder: "1.108",        fullWidth: false },
                      ].map(field => {
                        const Icon = field.icon;
                        return (
                          <div key={field.key} className={field.fullWidth ? "col-span-2" : ""}>
                            <label style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, letterSpacing: "0.06em", textTransform: "uppercase" as const, display: "block", marginBottom: 6 }}>
                              {field.label}
                            </label>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: T.bgInput, border: `1px solid ${T.borderSubtle}` }}>
                              <Icon size={12} color={T.textMuted} className="flex-shrink-0" />
                              <input
                                value={String(meta[field.key] ?? "")}
                                onChange={e => setMeta(p => ({ ...p, [field.key]: e.target.value }))}
                                placeholder={field.placeholder}
                                className="flex-1 bg-transparent outline-none"
                                style={{ fontSize: 12, color: T.textPrimary, fontFamily: T.sans }}
                              />
                            </div>
                          </div>
                        );
                      })}

                      {/* Category select */}
                      <div>
                        <label style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, letterSpacing: "0.06em", textTransform: "uppercase" as const, display: "block", marginBottom: 6 }}>Category</label>
                        <select
                          value={meta.category}
                          onChange={e => setMeta(p => ({ ...p, category: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg outline-none"
                          style={{ fontSize: 12, color: T.textSecondary, background: T.bgInput, border: `1px solid ${T.borderSubtle}`, fontFamily: T.sans }}
                        >
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>

                      {/* License select */}
                      <div>
                        <label style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, letterSpacing: "0.06em", textTransform: "uppercase" as const, display: "block", marginBottom: 6 }}>License</label>
                        <select
                          value={meta.license}
                          onChange={e => setMeta(p => ({ ...p, license: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg outline-none"
                          style={{ fontSize: 12, color: T.textSecondary, background: T.bgInput, border: `1px solid ${T.borderSubtle}`, fontFamily: T.sans }}
                        >
                          {["MIT", "CC BY 4.0", "CC BY-NC 4.0", "GPL-3.0", "Custom", "All Rights Reserved"].map(l => (
                            <option key={l} value={l}>{l}</option>
                          ))}
                        </select>
                      </div>

                      {/* Description — full width */}
                      <div className="col-span-2">
                        <label style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, letterSpacing: "0.06em", textTransform: "uppercase" as const, display: "block", marginBottom: 6 }}>Description</label>
                        <textarea
                          value={meta.description}
                          onChange={e => setMeta(p => ({ ...p, description: e.target.value }))}
                          rows={3}
                          className="w-full px-3 py-2 rounded-lg outline-none resize-none"
                          style={{ fontSize: 12, color: T.textPrimary, background: T.bgInput, border: `1px solid ${T.borderSubtle}`, fontFamily: T.sans, lineHeight: 1.6 }}
                        />
                      </div>
                    </div>
                  )}

                  {/* ── Step 3: Compatibility ── */}
                  {step === 2 && (
                    <div className="p-6 space-y-5">
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary, marginBottom: 4 }}>Game Compatibility</div>
                        <div style={{ fontSize: 11, color: T.textMuted }}>Specify which expansion packs and game versions this mod requires.</div>
                      </div>

                      {/* Min game version */}
                      <div className="p-4 rounded-xl" style={{ background: T.bgSurface, border: `1px solid ${T.border}` }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: T.textSecondary, marginBottom: 10 }}>BASE GAME VERSION</div>
                        <div className="flex items-center gap-3">
                          {["1.105", "1.106", "1.107", "1.108"].map(ver => {
                            const isSelected = meta.minGameVersion === ver;
                            const isCurrent = ver === "1.108";
                            return (
                              <button
                                key={ver}
                                onClick={() => setMeta(p => ({ ...p, minGameVersion: ver }))}
                                className="flex flex-col items-center gap-1 px-4 py-2.5 rounded-xl transition-all"
                                style={{
                                  background: isSelected ? `${T.cyan}10` : "rgba(255,255,255,0.02)",
                                  border: `1px solid ${isSelected ? `${T.cyan}40` : T.borderSubtle}`,
                                  boxShadow: isSelected ? `0 0 12px ${T.cyan}15` : "none",
                                }}
                              >
                                <span style={{ fontSize: 13, fontWeight: 700, color: isSelected ? T.cyan : T.textSecondary, fontFamily: T.mono }}>v{ver}</span>
                                {isCurrent && <span style={{ fontSize: 8, fontWeight: 700, color: T.emerald, letterSpacing: "0.06em" }}>LATEST</span>}
                                {isSelected && <Check size={10} color={T.cyan} />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Expansion packs */}
                      <div className="p-4 rounded-xl" style={{ background: T.bgSurface, border: `1px solid ${T.border}` }}>
                        <div className="flex items-center justify-between mb-3">
                          <div style={{ fontSize: 11, fontWeight: 700, color: T.textSecondary }}>REQUIRED EXPANSION PACKS</div>
                          <span style={{ fontSize: 9, color: T.textMuted, fontFamily: T.mono }}>
                            {epFlags.filter(e => e.selected).length} selected
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {epFlags.map(ep => {
                            const Icon = ep.icon;
                            return (
                              <button
                                key={ep.id}
                                onClick={() => toggleEP(ep.id)}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-left"
                                style={{
                                  background: ep.selected ? `${ep.color}08` : "rgba(255,255,255,0.02)",
                                  border: `1px solid ${ep.selected ? `${ep.color}30` : T.borderSubtle}`,
                                }}
                              >
                                <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{
                                  background: ep.selected ? ep.color : "rgba(255,255,255,0.04)",
                                  border: `1px solid ${ep.selected ? ep.color : T.borderSubtle}`,
                                }}>
                                  {ep.selected ? <Check size={10} color="#fff" /> : <Icon size={10} color={T.textDim} />}
                                </div>
                                <div className="min-w-0">
                                  <div style={{ fontSize: 11, color: ep.selected ? T.textPrimary : T.textTertiary, fontWeight: ep.selected ? 600 : 400, whiteSpace: "nowrap" }}>{ep.label}</div>
                                  <div style={{ fontSize: 9, color: T.textMuted }}>{ep.description}</div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* No-EP note */}
                      {epFlags.every(e => !e.selected) && (
                        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg" style={{ background: T.emeraldDim, border: `1px solid ${T.emerald}20` }}>
                          <CheckCircle2 size={12} color={T.emerald} />
                          <span style={{ fontSize: 11, color: T.emerald }}>Base game only — no expansion packs required</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Step 4: Preview ── */}
                  {step === 3 && (
                    <div className="p-6 space-y-4">
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary, marginBottom: 4 }}>Package Preview</div>
                        <div style={{ fontSize: 11, color: T.textMuted }}>Review the generated manifest and file structure before exporting.</div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Stats */}
                        <div className="space-y-2">
                          {[
                            { label: "Package Name",  value: `${meta.name.replace(/\s+/g, "_")}_v${meta.version}.package`, icon: Package, color: T.cyan },
                            { label: "Author",        value: meta.author,                                                    icon: User,    color: T.violet },
                            { label: "Version",       value: meta.version,                                                  icon: Tag,     color: T.emerald },
                            { label: "Category",      value: meta.category,                                                 icon: Layers,  color: T.amber },
                            { label: "Min Game Ver",  value: `v${meta.minGameVersion}`,                                     icon: Shield,  color: T.cyan },
                            { label: "Files Bundled", value: `${selectedFiles.length}`,                                     icon: FileText, color: T.violet },
                            { label: "Estimated Size", value: `${totalSize.toFixed(1)} KB`,                                 icon: HardDrive, color: T.emerald },
                            { label: "EPs Required",  value: epFlags.filter(e => e.selected).length === 0 ? "None" : epFlags.filter(e => e.selected).map(e => e.label).join(", "), icon: Star, color: T.amber },
                          ].map((row, i) => {
                            const Icon = row.icon;
                            return (
                              <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${T.borderSubtle}` }}>
                                <Icon size={11} color={row.color} className="flex-shrink-0" />
                                <span style={{ fontSize: 10, color: T.textTertiary, minWidth: 100 }}>{row.label}</span>
                                <span style={{ fontSize: 10, fontFamily: T.mono, fontWeight: 600, color: T.textPrimary }} className="truncate">{row.value}</span>
                              </div>
                            );
                          })}
                        </div>

                        {/* manifest.json preview */}
                        <div className="flex flex-col rounded-xl overflow-hidden" style={{ border: `1px solid ${T.border}` }}>
                          <div className="flex items-center justify-between px-3 py-2" style={{ background: T.bgSurface, borderBottom: `1px solid ${T.border}` }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, letterSpacing: "0.06em" }}>MANIFEST.JSON PREVIEW</span>
                            <button
                              onClick={() => {
                                const json = JSON.stringify({ name: meta.name, version: meta.version, author: meta.author, description: meta.description, category: meta.category, minGameVersion: meta.minGameVersion, requiresEP: epFlags.filter(e => e.selected).map(e => e.id), files: selectedFiles.map(f => f.name) }, null, 2);
                                navigator.clipboard.writeText(json).then(() => toast.success("Manifest copied"));
                              }}
                              className="p-1 rounded hover:bg-white/5"
                            >
                              <Copy size={10} color={T.textMuted} />
                            </button>
                          </div>
                          <div className="flex-1 overflow-y-auto p-3" style={{ background: T.bgDeep }}>
                            <pre style={{ fontSize: 10, fontFamily: T.mono, color: T.textSecondary, whiteSpace: "pre-wrap", wordBreak: "break-all" as const, lineHeight: 1.7 }}>
{JSON.stringify({
  name: meta.name,
  version: meta.version,
  author: meta.author,
  description: meta.description.slice(0, 60) + "…",
  category: meta.category,
  license: meta.license,
  minGameVersion: meta.minGameVersion,
  requiresEP: epFlags.filter(e => e.selected).map(e => e.id),
  files: selectedFiles.map(f => ({ name: f.name, type: f.type, size: f.size })),
  generated: new Date().toISOString(),
}, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Step 5: Export ── */}
                  {step === 4 && (
                    <div className="p-6 space-y-5">
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary, marginBottom: 4 }}>Export Package</div>
                        <div style={{ fontSize: 11, color: T.textMuted }}>Build and download your Sims 4 mod package.</div>
                      </div>

                      {exportState === "idle" && (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${T.cyan}20, ${T.violet}20)`, border: `1px solid ${T.borderSubtle}` }}>
                            <Archive size={28} color={T.cyan} />
                          </div>
                          <div className="text-center">
                            <div style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary, marginBottom: 6 }}>Ready to export</div>
                            <div style={{ fontSize: 11, color: T.textMuted }}>{selectedFiles.length} files · ~{totalSize.toFixed(1)} KB</div>
                          </div>
                          <button
                            onClick={runExport}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl transition-all"
                            style={{
                              background: `linear-gradient(135deg, ${T.cyan}, ${T.violet})`,
                              boxShadow: `0 0 24px ${T.cyan}30`,
                              fontSize: 13, fontWeight: 700, color: "#fff",
                            }}
                          >
                            <Rocket size={15} />
                            Start Build
                          </button>
                        </div>
                      )}

                      {(exportState === "building" || exportState === "done") && (
                        <>
                          {/* Progress bar */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, letterSpacing: "0.06em" }}>BUILD PROGRESS</span>
                              <span style={{ fontSize: 11, fontFamily: T.mono, fontWeight: 700, color: exportState === "done" ? T.emerald : T.cyan }}>{exportProgress}%</span>
                            </div>
                            <div className="relative rounded-full overflow-hidden" style={{ height: 6, background: "rgba(255,255,255,0.04)" }}>
                              <motion.div
                                className="absolute inset-y-0 left-0 rounded-full"
                                style={{ background: exportState === "done" ? `linear-gradient(90deg, ${T.emerald}, ${T.cyan})` : `linear-gradient(90deg, ${T.cyan}, ${T.violet})`, boxShadow: `0 0 10px ${exportState === "done" ? T.emerald : T.cyan}40` }}
                                animate={{ width: `${exportProgress}%` }}
                                transition={{ duration: 0.3 }}
                              />
                            </div>
                          </div>

                          {/* Build log */}
                          <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${T.border}` }}>
                            <div className="px-3 py-2" style={{ background: T.bgSurface, borderBottom: `1px solid ${T.border}` }}>
                              <span style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, letterSpacing: "0.06em" }}>BUILD LOG</span>
                            </div>
                            <div className="p-3 space-y-1 max-h-40 overflow-y-auto" style={{ background: T.bgDeep }}>
                              <AnimatePresence>
                                {exportLog.map((line, i) => (
                                  <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.15 }}
                                    style={{
                                      fontSize: 11,
                                      fontFamily: T.mono,
                                      color: line.startsWith("✓") ? T.emerald : T.textSecondary,
                                    }}
                                  >
                                    {line}
                                  </motion.div>
                                ))}
                              </AnimatePresence>
                            </div>
                          </div>

                          {/* Done: checksums + download */}
                          {exportState === "done" && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg" style={{ background: T.emeraldDim, border: `1px solid ${T.emerald}20` }}>
                                <CheckCircle2 size={13} color={T.emerald} />
                                <span style={{ fontSize: 12, fontWeight: 700, color: T.emerald }}>Build successful! Package ready for download.</span>
                              </div>

                              {/* Checksums */}
                              <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${T.border}` }}>
                                <div className="flex items-center justify-between px-3 py-2" style={{ background: T.bgSurface, borderBottom: `1px solid ${T.border}` }}>
                                  <span style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, letterSpacing: "0.06em" }}>SHA-256 CHECKSUMS</span>
                                  <button
                                    onClick={() => { navigator.clipboard.writeText(Object.entries(checksumMap).map(([k, v]) => `${v}  ${k}`).join("\n")).then(() => toast.success("Checksums copied")); }}
                                    className="p-1 rounded hover:bg-white/5"
                                  >
                                    <Copy size={10} color={T.textMuted} />
                                  </button>
                                </div>
                                <div className="p-2 space-y-1 max-h-32 overflow-y-auto" style={{ background: T.bgDeep }}>
                                  {Object.entries(checksumMap).map(([name, hash]) => (
                                    <div key={name} className="flex items-center gap-2 px-2 py-1">
                                      <span style={{ fontSize: 10, fontFamily: T.mono, color: T.emerald, letterSpacing: "0.02em" }}>{hash}</span>
                                      <span style={{ fontSize: 9, color: T.textMuted }} className="truncate">{name}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Download button */}
                              <button
                                onClick={() => {
                                  toast.success(`Downloaded: ${meta.name.replace(/\s+/g, "_")}_v${meta.version}.package`, {
                                    description: `${selectedFiles.length} files · ${totalSize.toFixed(1)} KB`,
                                  });
                                }}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl transition-all"
                                style={{
                                  background: `linear-gradient(135deg, ${T.emerald}CC, ${T.cyan}CC)`,
                                  boxShadow: `0 0 20px ${T.emerald}25`,
                                  fontSize: 13, fontWeight: 700, color: "#fff",
                                }}
                              >
                                <Download size={15} />
                                Download {meta.name.replace(/\s+/g, "_")}_v{meta.version}.package
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer navigation */}
            <div className="flex items-center justify-between px-6 py-3 flex-shrink-0" style={{ borderTop: `1px solid ${T.border}`, background: "rgba(0,0,0,0.15)" }}>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStep(s => Math.max(0, s - 1))}
                  disabled={step === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all disabled:opacity-30"
                  style={{ fontSize: 12, color: T.textSecondary, background: "rgba(255,255,255,0.03)", border: `1px solid ${T.borderSubtle}` }}
                >
                  <ChevronLeft size={13} /> Back
                </button>
                <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>Step {step + 1} of {STEPS.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-lg transition-all"
                  style={{ fontSize: 12, color: T.textMuted, background: "transparent", border: `1px solid ${T.borderSubtle}` }}
                >
                  Cancel
                </button>
                {step < STEPS.length - 1 ? (
                  <button
                    onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))}
                    disabled={step === 0 && selectedFiles.length === 0}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition-all disabled:opacity-40"
                    style={{
                      fontSize: 12, fontWeight: 700, color: "#fff",
                      background: `linear-gradient(135deg, ${T.cyan}CC, ${T.violet}CC)`,
                      boxShadow: `0 0 16px ${T.cyan}20`,
                    }}
                  >
                    Next <ChevronRight size={13} />
                  </button>
                ) : exportState !== "done" ? (
                  <button
                    onClick={runExport}
                    disabled={exportState === "building"}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition-all disabled:opacity-40"
                    style={{
                      fontSize: 12, fontWeight: 700, color: "#fff",
                      background: `linear-gradient(135deg, ${T.emerald}CC, ${T.cyan}CC)`,
                    }}
                  >
                    {exportState === "building" ? <><RefreshCw size={12} className="animate-spin" /> Building…</> : <><Rocket size={12} /> Export</>}
                  </button>
                ) : (
                  <button
                    onClick={onClose}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition-all"
                    style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: `linear-gradient(135deg, ${T.emerald}CC, ${T.cyan}CC)` }}
                  >
                    <CheckCircle2 size={12} /> Done
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PackageExportWizard;
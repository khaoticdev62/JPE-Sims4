import { useState, useMemo } from "react";
import {
  Puzzle, Search, Download, Star, CheckCircle2, X,
  Shield, Sparkles, TrendingUp, ToggleLeft, ToggleRight,
  Settings, RefreshCw, ExternalLink, Tag, Package,
  Code2, Globe, Zap, Filter, BookOpen, Eye, Lock,
  AlertTriangle, ChevronRight, Braces, Languages,
} from "lucide-react";
import { T } from "../pages/jpe-theme";
import { Eyebrow, Badge } from "../pages/jpe-shared";
import { motion, AnimatePresence } from "./jpe-motion";
import { toast } from "sonner";

/* ─── Extension data ─── */
interface Extension {
  id: string;
  name: string;
  author: string;
  version: string;
  description: string;
  longDesc: string;
  icon: React.FC<{ size?: number; color?: string }>;
  iconColor: string;
  category: string;
  tags: string[];
  rating: number;
  reviews: number;
  downloads: string;
  size: string;
  verified: boolean;
  featured: boolean;
  installed?: boolean;
  enabled?: boolean;
  changelog: string[];
}

const EXTENSIONS: Extension[] = [
  {
    id: "ext-ai-autocomplete",
    name: "JPE AI Autocomplete",
    author: "JPE Studio Team",
    version: "2.1.0",
    description: "Context-aware AI completions for JPE syntax, XML tuning, and Python scripts",
    longDesc: "Leverages a fine-tuned language model trained on 10,000+ Sims 4 mod files to provide intelligent, in-context code completions. Understands tuning hierarchies, STBL relationships, and game API patterns.",
    icon: Sparkles,
    iconColor: T.violetBright,
    category: "AI & Intelligence",
    tags: ["ai", "autocomplete", "intellisense", "jpe"],
    rating: 4.9,
    reviews: 2814,
    downloads: "48.2k",
    size: "12.4 MB",
    verified: true,
    featured: true,
    installed: true,
    enabled: true,
    changelog: ["v2.1.0 — GPT-4o model upgrade, 30% faster inference", "v2.0.0 — Support for JPE v1.2 grammar", "v1.5.0 — Multi-locale STBL suggestions added"],
  },
  {
    id: "ext-xml-validator",
    name: "Sims 4 XML Validator",
    author: "ModderTools Community",
    version: "1.8.3",
    description: "Real-time schema validation for all Sims 4 tuning XML types with error highlighting",
    longDesc: "Validates your XML tuning files against the official Sims 4 DTD schemas. Catches type mismatches, missing required tunables, invalid enum values, and outdated API references before packaging.",
    icon: Shield,
    iconColor: T.cyan,
    category: "Validation",
    tags: ["xml", "validation", "schema", "linting"],
    rating: 4.7,
    reviews: 1203,
    downloads: "31.5k",
    size: "3.2 MB",
    verified: true,
    featured: true,
    installed: true,
    enabled: true,
    changelog: ["v1.8.3 — GamePack 20 schema added", "v1.8.0 — EP15 trait types supported", "v1.7.0 — Custom error suppression rules"],
  },
  {
    id: "ext-stbl-manager",
    name: "STBL String Manager",
    author: "S4StudioDev",
    version: "3.0.1",
    description: "Full-featured STBL editor with diff view, bulk import, and translation export",
    longDesc: "Manage all your string tables in one place. Supports multi-locale editing, FNV hash generation, CSV/XLIFF import-export, duplicate detection, and GitHub sync for collaborative translation projects.",
    icon: Languages,
    iconColor: T.emerald,
    category: "Localization",
    tags: ["stbl", "strings", "translation", "locale"],
    rating: 4.8,
    reviews: 892,
    downloads: "22.1k",
    size: "6.7 MB",
    verified: true,
    featured: false,
    installed: false,
    changelog: ["v3.0.1 — XLIFF 2.0 export", "v3.0.0 — Multi-project workspace support", "v2.5.0 — FNV32 hash browser added"],
  },
  {
    id: "ext-package-inspector",
    name: "Package Inspector Pro",
    author: "S4PackTools",
    version: "1.4.0",
    description: "Browse, extract, and edit .package files directly inside JPE Studio",
    longDesc: "Drag a .package file into the workspace to instantly explore its resource tree. Supports DBPF format reading, compressed chunk extraction, CAS part previewing, and merge/diff operations.",
    icon: Package,
    iconColor: T.amber,
    category: "Package Tools",
    tags: ["package", "dbpf", "resources", "inspector"],
    rating: 4.5,
    reviews: 567,
    downloads: "15.8k",
    size: "9.1 MB",
    verified: true,
    featured: false,
    installed: false,
    changelog: ["v1.4.0 — CAS thumbnail preview", "v1.3.0 — Merge conflict detection", "v1.2.0 — Drag-and-drop support"],
  },
  {
    id: "ext-git-enhanced",
    name: "Git Enhanced",
    author: "DevWorkflows",
    version: "2.2.0",
    description: "Advanced Git integration with blame annotations, interactive rebase, and PR review",
    longDesc: "Extends the built-in Source Control panel with line-level blame annotations, stash management, interactive rebase UI, GitHub/GitLab PR review mode, and visual branch management.",
    icon: Code2,
    iconColor: T.rose,
    category: "Version Control",
    tags: ["git", "github", "blame", "pr", "vcs"],
    rating: 4.6,
    reviews: 1891,
    downloads: "38.4k",
    size: "5.5 MB",
    verified: true,
    featured: true,
    installed: false,
    changelog: ["v2.2.0 — GitHub PR review mode", "v2.1.0 — Interactive rebase UI", "v2.0.0 — Line blame annotations"],
  },
  {
    id: "ext-mod-testing",
    name: "Mod Test Runner",
    author: "S4QA Labs",
    version: "1.1.2",
    description: "Automated testing framework for Sims 4 mods with game-state simulation",
    longDesc: "Write unit tests for your Python scripts and tuning logic without launching the game. Simulates game state, Sim needs, relationship systems, and event queues. Supports CI/CD integration.",
    icon: Zap,
    iconColor: T.cyanBright,
    category: "Testing",
    tags: ["testing", "automation", "ci", "unit-tests"],
    rating: 4.3,
    reviews: 234,
    downloads: "8.2k",
    size: "4.3 MB",
    verified: false,
    featured: false,
    installed: false,
    changelog: ["v1.1.2 — Relationship system mock", "v1.1.0 — CI/CD pipeline template", "v1.0.0 — Initial release"],
  },
  {
    id: "ext-docs-browser",
    name: "EA API Docs",
    author: "Community Wiki",
    version: "4.0.0",
    description: "Offline browser for the Sims 4 modding API with search and cross-references",
    longDesc: "Complete offline copy of the EA modding documentation plus community-contributed guides, annotated with usage examples, changelog notes, and compatibility warnings.",
    icon: BookOpen,
    iconColor: T.violet,
    category: "Documentation",
    tags: ["docs", "api", "reference", "wiki"],
    rating: 4.8,
    reviews: 3421,
    downloads: "62.1k",
    size: "28 MB",
    verified: true,
    featured: true,
    installed: false,
    changelog: ["v4.0.0 — EP14 & SP35 docs", "v3.9.0 — TypeScript type definitions", "v3.8.0 — Offline search index"],
  },
  {
    id: "ext-theme-galaxy",
    name: "Theme Galaxy",
    author: "UI Crafters",
    version: "1.6.0",
    description: "30+ community color themes for JPE Studio with live preview",
    longDesc: "Swap your IDE aesthetic instantly with a curated collection of themes including Neon Noir, Arctic Frost, Solarized Dark, Dracula Reborn, and 25+ more. Create and share your own.",
    icon: Eye,
    iconColor: T.amber,
    category: "Themes",
    tags: ["theme", "color", "ui", "customization"],
    rating: 4.4,
    reviews: 711,
    downloads: "19.3k",
    size: "1.8 MB",
    verified: false,
    featured: false,
    installed: false,
    changelog: ["v1.6.0 — 8 new themes", "v1.5.0 — Custom theme creator", "v1.4.0 — Import/export support"],
  },
];

const CATEGORIES = ["All", "AI & Intelligence", "Validation", "Localization", "Package Tools", "Version Control", "Testing", "Documentation", "Themes"];

/* ─── Main component ─── */
export function ExtensionsPanel() {
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");
  const [filter, setFilter] = useState<"all" | "installed" | "featured">("all");
  const [extensions, setExtensions] = useState<Extension[]>(EXTENSIONS);
  const [selected, setSelected] = useState<Extension | null>(null);
  const [installing, setInstalling] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    let list = extensions;
    if (selectedCat !== "All") list = list.filter(e => e.category === selectedCat);
    if (filter === "installed") list = list.filter(e => e.installed);
    if (filter === "featured") list = list.filter(e => e.featured);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.tags.some(t => t.includes(q))
      );
    }
    return list;
  }, [extensions, selectedCat, filter, search]);

  const installedCount = extensions.filter(e => e.installed).length;
  const enabledCount = extensions.filter(e => e.enabled).length;

  const toggleInstall = (id: string) => {
    const ext = extensions.find(e => e.id === id);
    if (!ext) return;
    if (ext.installed) {
      setExtensions(prev => prev.map(e => e.id === id ? { ...e, installed: false, enabled: false } : e));
      if (selected?.id === id) setSelected(s => s ? { ...s, installed: false, enabled: false } : s);
      toast.success(`${ext.name} uninstalled`);
    } else {
      setInstalling(prev => new Set(prev).add(id));
      setTimeout(() => {
        setExtensions(prev => prev.map(e => e.id === id ? { ...e, installed: true, enabled: true } : e));
        if (selected?.id === id) setSelected(s => s ? { ...s, installed: true, enabled: true } : s);
        setInstalling(prev => { const n = new Set(prev); n.delete(id); return n; });
        toast.success(`${ext.name} installed and activated!`);
      }, 1600);
    }
  };

  const toggleEnable = (id: string) => {
    const ext = extensions.find(e => e.id === id);
    if (!ext || !ext.installed) return;
    const newEnabled = !ext.enabled;
    setExtensions(prev => prev.map(e => e.id === id ? { ...e, enabled: newEnabled } : e));
    if (selected?.id === id) setSelected(s => s ? { ...s, enabled: newEnabled } : s);
    toast.success(newEnabled ? `${ext.name} enabled` : `${ext.name} disabled`);
  };

  const renderStars = (r: number) => (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={9} color={i < Math.floor(r) ? T.amber : T.textDim} fill={i < Math.floor(r) ? T.amber : "none"} strokeWidth={1.5} />
      ))}
      <span style={{ fontSize: 9, fontFamily: T.mono, color: T.amber, marginLeft: 2 }}>{r.toFixed(1)}</span>
    </div>
  );

  return (
    <div className="flex flex-col h-full" style={{ background: T.bgPanel, fontFamily: T.sans }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgSurface }}>
        <div className="flex items-center gap-2">
          <Puzzle size={13} color={T.violet} />
          <Eyebrow color={T.violetBright}>EXTENSIONS</Eyebrow>
        </div>
        <div className="flex items-center gap-1.5">
          {installedCount > 0 && <Badge color={T.emerald} bg={T.emeraldDim}>{installedCount}</Badge>}
        </div>
      </div>

      {/* Search */}
      <div className="px-2 py-2 flex-shrink-0" style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: T.bgInput, border: `1px solid ${search ? T.borderActive : T.borderSubtle}` }}>
          <Search size={11} color={search ? T.cyan : T.textMuted} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search extensions..."
            className="flex-1 bg-transparent outline-none"
            style={{ fontSize: 11, color: T.textPrimary, fontFamily: T.sans }}
          />
          {search && <button onClick={() => setSearch("")}><X size={9} color={T.textMuted} /></button>}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-0 px-2 py-1 flex-shrink-0" style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
        {(["all", "installed", "featured"] as const).map(f => {
          const isAct = filter === f;
          const labels = { all: "All", installed: `Installed (${installedCount})`, featured: "Featured" };
          return (
            <button key={f} onClick={() => setFilter(f)}
              className="px-2 py-0.5 rounded transition-colors text-center"
              style={{ fontSize: 10, fontWeight: isAct ? 700 : 500, color: isAct ? T.textPrimary : T.textMuted, background: isAct ? "rgba(255,255,255,0.06)" : "transparent" }}>
              {labels[f]}
            </button>
          );
        })}
      </div>

      {/* Content: two-column if detail selected */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Extension list */}
        <div className={`flex flex-col overflow-y-auto ${selected ? "w-[45%]" : "w-full"}`} style={{ borderRight: selected ? `1px solid ${T.border}` : "none" }}>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 py-12">
              <Puzzle size={24} color={T.textDim} className="mb-2" />
              <span style={{ fontSize: 11, color: T.textMuted }}>No extensions found</span>
            </div>
          ) : (
            filtered.map(ext => {
              const Icon = ext.icon;
              const isSel = selected?.id === ext.id;
              const isInstalling = installing.has(ext.id);
              return (
                <button
                  key={ext.id}
                  onClick={() => setSelected(isSel ? null : ext)}
                  className="text-left px-3 py-2.5 transition-all relative"
                  style={{ background: isSel ? `${ext.iconColor}06` : "transparent", borderBottom: `1px solid ${T.borderSubtle}` }}
                  onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = T.bgHover; }}
                  onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = "transparent"; }}
                >
                  {isSel && <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{ background: ext.iconColor }} />}
                  <div className="flex items-start gap-2.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 relative" style={{ background: `${ext.iconColor}12`, border: `1px solid ${ext.iconColor}20` }}>
                      <Icon size={17} color={ext.iconColor} />
                      {ext.verified && (
                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ background: T.bgPanel }}>
                          <CheckCircle2 size={9} color={T.emerald} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="truncate" style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary }}>{ext.name}</span>
                        {ext.featured && <span className="px-1 rounded flex-shrink-0" style={{ fontSize: 7, fontWeight: 800, color: T.amber, background: T.amberDim }}>★</span>}
                        {ext.installed && (
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: ext.enabled ? T.emerald : T.textDim, boxShadow: ext.enabled ? `0 0 4px ${T.emerald}60` : "none" }} />
                        )}
                      </div>
                      <p className="truncate" style={{ fontSize: 10, color: T.textMuted, marginBottom: 4 }}>{ext.description}</p>
                      <div className="flex items-center gap-2">
                        {renderStars(ext.rating)}
                        <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>{ext.downloads}</span>
                        <span style={{ fontSize: 9, color: T.textDim }}>v{ext.version}</span>
                      </div>
                    </div>
                    {/* Quick install toggle */}
                    <div className="flex-shrink-0" onClick={e => { e.stopPropagation(); toggleInstall(ext.id); }}>
                      {isInstalling ? (
                        <div className="p-1"><RefreshCw size={13} color={T.violet} className="animate-spin" /></div>
                      ) : ext.installed ? (
                        <div className="p-1 rounded-md" style={{ color: T.emerald }}><CheckCircle2 size={13} /></div>
                      ) : (
                        <div className="p-1 rounded-md transition-colors" style={{ color: T.textMuted }}
                          onMouseEnter={e => { e.currentTarget.style.color = T.violet; }}
                          onMouseLeave={e => { e.currentTarget.style.color = T.textMuted; }}>
                          <Download size={13} />
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Detail panel */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col overflow-y-auto"
              style={{ flex: 1, background: T.bg, minWidth: 0 }}
            >
              {/* Detail header */}
              <div className="flex items-start gap-3 px-3 pt-3 pb-2 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${selected.iconColor}12`, border: `1px solid ${selected.iconColor}20` }}>
                  <selected.icon size={19} color={selected.iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span style={{ fontSize: 12, fontWeight: 700, color: T.textPrimary }}>{selected.name}</span>
                    {selected.verified && <CheckCircle2 size={10} color={T.emerald} />}
                  </div>
                  <div style={{ fontSize: 10, color: T.textMuted }}>{selected.author} · v{selected.version}</div>
                </div>
                <button onClick={() => setSelected(null)} className="p-1 rounded flex-shrink-0" style={{ color: T.textDim }} onMouseEnter={e => { e.currentTarget.style.color = T.textPrimary; }} onMouseLeave={e => { e.currentTarget.style.color = T.textDim; }}>
                  <X size={11} />
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 px-3 py-2 flex-shrink-0" style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
                <button
                  onClick={() => toggleInstall(selected.id)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all"
                  style={{
                    fontSize: 10, fontWeight: 700,
                    color: selected.installed ? T.rose : T.textPrimary,
                    background: selected.installed ? T.roseDim : `linear-gradient(135deg, ${selected.iconColor}25, ${selected.iconColor}15)`,
                    border: `1px solid ${selected.installed ? `${T.rose}25` : `${selected.iconColor}30`}`,
                  }}
                >
                  {installing.has(selected.id) ? <RefreshCw size={10} className="animate-spin" /> : selected.installed ? <X size={10} /> : <Download size={10} />}
                  {installing.has(selected.id) ? "Installing..." : selected.installed ? "Uninstall" : "Install"}
                </button>
                {selected.installed && (
                  <button
                    onClick={() => toggleEnable(selected.id)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg transition-all"
                    style={{ fontSize: 10, color: selected.enabled ? T.emerald : T.textMuted, background: "rgba(255,255,255,0.03)", border: `1px solid ${T.borderSubtle}` }}
                  >
                    {selected.enabled ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                    {selected.enabled ? "Disable" : "Enable"}
                  </button>
                )}
              </div>

              {/* Info */}
              <div className="px-3 py-2 space-y-2 flex-1 overflow-y-auto">
                <p style={{ fontSize: 10.5, color: T.textSecondary, lineHeight: 1.6 }}>{selected.longDesc}</p>
                <div className="flex flex-wrap gap-1">
                  {selected.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 px-1.5 py-0.5 rounded-md" style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim, background: "rgba(255,255,255,0.03)", border: `1px solid ${T.borderSubtle}` }}>
                      <Tag size={7} />{tag}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: "Version", value: `v${selected.version}`, color: T.cyan },
                    { label: "Downloads", value: selected.downloads, color: T.textSecondary },
                    { label: "Size", value: selected.size, color: T.textSecondary },
                    { label: "Rating", value: `${selected.rating}/5.0`, color: T.amber },
                  ].map(m => (
                    <div key={m.label} className="rounded-lg px-2 py-1.5" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${T.borderSubtle}` }}>
                      <div style={{ fontSize: 8, fontWeight: 700, color: T.textDim, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>{m.label}</div>
                      <div style={{ fontSize: 11, fontFamily: T.mono, color: m.color, marginTop: 1 }}>{m.value}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <Eyebrow color={T.textDim}>CHANGELOG</Eyebrow>
                  <div className="mt-1.5 space-y-1.5">
                    {selected.changelog.map((entry, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: i === 0 ? T.emerald : T.textDim, boxShadow: i === 0 ? `0 0 4px ${T.emerald}50` : "none" }} />
                        <span style={{ fontSize: 10, color: i === 0 ? T.textSecondary : T.textTertiary, lineHeight: 1.5 }}>{entry}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer stats */}
      <div className="flex items-center justify-between px-3 py-1.5 flex-shrink-0" style={{ borderTop: `1px solid ${T.border}`, background: T.bgPanel }}>
        <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>{installedCount} installed · {enabledCount} active</span>
        <button onClick={() => toast.info("Checking for extension updates...")} className="flex items-center gap-1" style={{ fontSize: 9, color: T.textDim }}>
          <RefreshCw size={9} /><span>Update all</span>
        </button>
      </div>
    </div>
  );
}

export default ExtensionsPanel;

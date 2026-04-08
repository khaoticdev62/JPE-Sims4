import { useState } from "react";
import {
  Search, ChevronRight, ChevronDown, File, Folder, FolderOpen,
  CheckCircle2, XCircle, AlertTriangle, Plus, X,
  Globe, Book, Package, Sparkles, Languages,
  Info, MoreHorizontal, Filter, Copy,
  FileText, FileCode, Settings, Zap,
  ArrowRight, RotateCcw, ExternalLink, Eye,
  type LucideIcon, Edit3, Lock, Unlock,
} from "lucide-react";
import { useScaledPx } from "./jpe-settings-context";
import { toast } from "sonner";

/* ═══ OBSIDIAN CRYSTAL TOKENS ═══ */
const T = {
  bg: "#020204",
  bgPanel: "#0A0A0C",
  bgSurface: "#0c0c12",
  bgElevated: "#101018",
  bgHover: "#14141e",
  bgRow: "#080810",
  bgRowAlt: "#0a0a0e",
  border: "rgba(255,255,255,0.04)",
  borderSubtle: "rgba(255,255,255,0.02)",
  borderActive: "rgba(139,92,246,0.4)",
  violetDim: "rgba(139,92,246,0.12)",
  violet: "#8B5CF6",
  violetBright: "#A78BFA",
  cyan: "#06B6D4",
  cyanBright: "#22D3EE",
  emerald: "#10B981",
  rose: "#F43F5E",
  amber: "#F59E0B",
  blue: "#3B82F6",
  textPrimary: "#E8E8ED",
  textSecondary: "#8B8B9E",
  textTertiary: "#55556A",
  textMuted: "#3D3D52",
  mono: "'JetBrains Mono', 'Fira Code', monospace",
  sans: "'Inter', system-ui, sans-serif",
  display: "'Outfit', 'Inter', system-ui, sans-serif",
  glassBlur: "blur(32px)",
};

/* ═══ STATUS SYSTEM ═══ */
type RowStatus = "Ready" | "Draft" | "Review";
const statusColors: Record<RowStatus, { bg: string; text: string; dot: string }> = {
  Ready: { bg: "rgba(16,185,129,0.1)", text: T.emerald, dot: T.emerald },
  Draft: { bg: "rgba(139,92,246,0.1)", text: T.violetBright, dot: T.violet },
  Review: { bg: "rgba(6,182,212,0.1)", text: T.cyanBright, dot: T.cyan },
};

/* ═══ TRANSLATION DATA — Enhanced ═══ */
interface TranslationRow {
  id: number;
  status: RowStatus;
  source: string;
  sourceCode?: string;
  target: string;
  confidence: number;
  hash?: string;
  chars?: number;
}

const translationRows: TranslationRow[] = [
  { id: 120, status: "Ready", source: "Specify the output directory pathway and compress the possessed documentation in the associated priority for directory resonions.", target: "Geben Sie den Ausgabeverzeichnispfad an und komprimieren Sie die zugehörige Dokumentation.", confidence: 94, hash: "a3f8", chars: 142 },
  { id: 124, status: "Draft", source: "", sourceCode: '<script src="/api.js">', target: "", confidence: 88, hash: "b7c2", chars: 21 },
  { id: 124, status: "Draft", source: "", sourceCode: "<%- include(../conan...) %>", target: "", confidence: 86, hash: "c1d9", chars: 27 },
  { id: 125, status: "Draft", source: "", sourceCode: "<%- include(...api.low.) %>", target: "Spezifizieren Sie den", confidence: 87, hash: "d4e8", chars: 26 },
  { id: 126, status: "Draft", source: "", sourceCode: '<script src="/api.js">', target: "", confidence: 81, hash: "e5f0", chars: 21 },
  { id: 127, status: "Review", source: "Specify the output directory", target: "Spezifizieren Sie den Ausgabepfad.", confidence: 92, hash: "f6a1", chars: 28 },
  { id: 128, status: "Review", source: "", sourceCode: "function fetchData() {", target: "fetchData", confidence: 57, hash: "07b2", chars: 22 },
  { id: 128, status: "Review", source: "", sourceCode: "    return fetchData();", target: "", confidence: 0, hash: "18c3", chars: 23 },
  { id: 129, status: "Review", source: "", sourceCode: "    }", target: "", confidence: 81, hash: "29d4", chars: 5 },
  { id: 130, status: "Review", source: "", sourceCode: "<%- include(...icoplace(...) %>", target: "", confidence: 86, hash: "3ae5", chars: 30 },
  { id: 131, status: "Review", source: "Specify a compact for controls and exist to the process.", target: "", confidence: 84, hash: "4bf6", chars: 56 },
  { id: 132, status: "Review", source: "Pamnow/flow-packed encursor/for and retention.", target: "", confidence: 0, hash: "5c07", chars: 47 },
  { id: 133, status: "Review", source: "Specify the output the directory pathway.", target: "", confidence: 0, hash: "6d18", chars: 41 },
  { id: 134, status: "Review", source: "Specify the output directory", target: "", confidence: 86, hash: "7e29", chars: 28 },
];

/* ═══ FILE TREE ═══ */
interface TreeNode { name: string; type: "folder" | "file"; children?: TreeNode[]; status?: "done" | "review" | "pending" }
const fileTree: TreeNode[] = [
  {
    name: "Project", type: "folder", children: [
      { name: "docs", type: "folder", children: [], status: "done" },
      { name: "config.yaml", type: "file", status: "done" },
      { name: "README.md", type: "file", status: "done" },
      { name: "V1.2/", type: "folder", children: [], status: "review" },
      { name: "translation_unit.json", type: "file", status: "pending" },
    ],
  },
  {
    name: "MASTER BIBLE", type: "folder", children: [
      { name: "Translations", type: "folder", children: [], status: "review" },
      { name: "Sources", type: "folder", children: [], status: "done" },
    ],
  },
];

/* ═══ AI DATA ═══ */
const aiSuggestions = [
  {
    lineRef: "Line 127 Source:",
    source: "Specify the output directory pathway.",
    suggestedLabel: "Suggested Target:",
    suggested: "Spezifizieren Sie den Ausgabepfad.",
    altLabel: "Alternative Suggestion:",
    alt: "Legen Sie den Ausgabeverzeichnispfad fest, um die Ausgabe zu automatisieren.",
    context: "CONTEXT: Technical Manual",
  },
];

const conflictLogs = {
  resolved: [{ id: "L124", text: 'Terminology mismatch: "pathway" vs "directory"', hash: "a3f8" }],
  active: [
    { id: "L124", text: 'Terminology mismatch: "active"', hash: "b7c2" },
    { id: "L121", text: "Format error", hash: "c1d9" },
  ],
};

/* ═══ CONFIDENCE BADGE ═══ */
function ConfidenceBadge({ score }: { score: number }) {
  if (score === 0) return <span style={{ fontSize: 8, color: T.textMuted, fontFamily: T.mono }}>—</span>;
  let color = T.emerald;
  if (score < 60) color = T.rose;
  else if (score < 80) color = T.amber;
  else if (score < 90) color = T.cyan;

  const size = 30; const r = 11;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={2} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset} transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ filter: `drop-shadow(0 0 3px ${color}50)` }} />
      </svg>
      <span style={{ fontSize: 7, fontFamily: T.mono, fontWeight: 700, color, position: "relative", zIndex: 1 }}>{score}%</span>
    </div>
  );
}

/* ═══ CODE SNIPPET ═══ */
function CodeSnippet({ code }: { code: string }) {
  if (code.includes("<script") || code.includes("<%") || code.includes("<")) {
    return (
      <span style={{ fontFamily: T.mono, fontSize: 10 }}>
        {code.split(/(<[^>]+>|<%[-=]?[^%]*%>)/g).map((part, idx) => {
          if (part.startsWith("<%")) return <span key={idx} style={{ color: T.amber }}>{part}</span>;
          if (part.startsWith("<")) return <span key={idx} style={{ color: T.rose }}>{part}</span>;
          return <span key={idx} style={{ color: T.textSecondary }}>{part}</span>;
        })}
      </span>
    );
  }
  return (
    <span style={{ fontFamily: T.mono, fontSize: 10 }}>
      {code.split(/\b(function|return|const|let|var)\b/g).map((part, idx) => {
        if (["function", "return", "const", "let", "var"].includes(part)) return <span key={idx} style={{ color: T.violet }}>{part}</span>;
        if (part.includes("(")) {
          return <span key={idx}>{part.split(/(\w+)\(/).map((fp, fi) => fi === 1 ? <span key={fi} style={{ color: T.cyanBright }}>{fp}</span> : <span key={fi} style={{ color: T.textSecondary }}>{fp}</span>)}</span>;
        }
        return <span key={idx} style={{ color: T.textSecondary }}>{part}</span>;
      })}
    </span>
  );
}

/* ═══ FILE TREE ITEM ═══ */
function FileTreeItem({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  const [expanded, setExpanded] = useState(node.name === "Project" || node.name === "MASTER BIBLE");
  const isFolder = node.type === "folder";
  const statusDot: Record<string, string> = { done: T.emerald, review: T.amber, pending: T.rose };

  return (
    <div>
      <div
        className="flex items-center gap-1.5 py-1 px-2 cursor-pointer transition-colors group"
        style={{ paddingLeft: 8 + depth * 14 }}
        onMouseEnter={(e) => { e.currentTarget.style.background = T.bgHover; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        onClick={() => isFolder && setExpanded(!expanded)}
      >
        {isFolder ? (expanded ? <><ChevronDown size={9} color={T.textTertiary} /><FolderOpen size={11} color={T.amber} /></> : <><ChevronRight size={9} color={T.textTertiary} /><Folder size={11} color={T.amber} /></>) : <><span style={{ width: 9 }} /><File size={11} color={T.textTertiary} /></>}
        <span style={{ fontSize: 10, color: isFolder ? T.textPrimary : T.textSecondary, fontWeight: isFolder ? 600 : 400, fontFamily: T.sans }} className="group-hover:!text-white truncate flex-1">{node.name}</span>
        {node.status && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: statusDot[node.status], boxShadow: `0 0 4px ${statusDot[node.status]}50` }} />}
      </div>
      {isFolder && expanded && node.children?.map((child, i) => <FileTreeItem key={`${child.name}-${i}`} node={child} depth={depth + 1} />)}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN MASTER BIBLE VIEW — AAAA PRODUCTION
   ═══════════════════════════════════════════════════════════════ */
export function MasterBibleView() {
  const fileTreeW = useScaledPx(190);
  const diagW = useScaledPx(280);
  const [selectedRow, setSelectedRow] = useState<number>(5);
  const [fileFilter, setFileFilter] = useState("");
  const [showUnchanged, setShowUnchanged] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [diagExpanded, setDiagExpanded] = useState(true);

  return (
    <div className="flex flex-col h-full w-full" style={{ background: T.bg, fontFamily: T.sans, color: T.textPrimary }}>

      {/* ═══ BIBLE MENU BAR ═══ */}
      <div className="flex items-center justify-between px-4 h-9 flex-shrink-0" style={{ background: T.bgPanel, borderBottom: `1px solid ${T.border}` }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${T.violetDim}, rgba(139,92,246,0.06))`, border: `1px solid rgba(139,92,246,0.15)` }}>
              <Book size={11} color={T.violet} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, fontFamily: T.display, color: T.textPrimary, letterSpacing: "0.02em" }}>MASTER BIBLE</span>
          </div>
          <div className="w-px h-3" style={{ background: T.border }} />
          {["Project", "Edit", "AI", "View", "Window"].map((menu) => (
            <button key={menu} className="px-2 py-0.5 rounded-md transition-all" style={{ fontSize: 10, color: T.textSecondary }}
              onMouseEnter={(e) => { e.currentTarget.style.color = T.textPrimary; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = T.textSecondary; e.currentTarget.style.background = "transparent"; }}>
              {menu}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${T.borderSubtle}` }}>
            <Globe size={9} color={T.textTertiary} />
            <span style={{ fontSize: 9, color: T.textSecondary }}>Bible_SDK_Docs / English (US)</span>
            <ArrowRight size={8} color={T.violet} />
            <span style={{ fontSize: 9, color: T.violetBright, fontWeight: 600 }}>German (DE)</span>
          </div>
          <button className="flex items-center gap-1.5 px-2 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${T.borderSubtle}` }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.borderActive; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.borderSubtle; }}>
            <Search size={9} color={T.textMuted} />
            <span style={{ fontSize: 9, color: T.textMuted }}>Search</span>
          </button>
          <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all"
            style={{ background: `linear-gradient(135deg, ${T.violet}, ${T.cyan})`, fontSize: 9, fontWeight: 700, color: "#fff", boxShadow: `0 0 12px rgba(139,92,246,0.3)` }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 0 20px rgba(139,92,246,0.5)`; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = `0 0 12px rgba(139,92,246,0.3)`; }}>
            <Zap size={9} /> Run AI Sync
          </button>
        </div>
      </div>

      {/* ═══ 3-COLUMN LAYOUT ═══ */}
      <div className="flex flex-1 min-h-0">

        {/* ── LEFT: FILE TREE ── */}
        <div className="flex flex-col flex-shrink-0" style={{ width: fileTreeW, borderRight: `1px solid ${T.border}`, background: T.bgPanel }}>
          <div className="flex items-center justify-between px-3 py-1.5" style={{ borderBottom: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: T.textPrimary }}>Files</span>
            <button className="p-0.5 rounded hover:bg-white/5" onClick={() => setFileFilter("")} title="New file"><Plus size={10} color={T.textTertiary} /></button>
          </div>
          <div className="px-2 py-1.5" style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${T.borderSubtle}` }}>
              <Search size={9} color={T.textMuted} />
              <input value={fileFilter} onChange={(e) => setFileFilter(e.target.value)} placeholder="Filter Files..."
                className="flex-1 bg-transparent outline-none" style={{ fontSize: 9, color: T.textPrimary, fontFamily: T.sans }} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-0.5">
            {fileTree.map((node, i) => <FileTreeItem key={`root-${i}`} node={node} />)}
          </div>
          {/* Tree footer stats */}
          <div className="px-3 py-1.5 flex items-center justify-between" style={{ borderTop: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 7, fontFamily: T.mono, color: T.textMuted }}>7 files</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1"><div className="w-1 h-1 rounded-full" style={{ background: T.emerald }} /><span style={{ fontSize: 7, fontFamily: T.mono, color: T.textMuted }}>4</span></div>
              <div className="flex items-center gap-1"><div className="w-1 h-1 rounded-full" style={{ background: T.amber }} /><span style={{ fontSize: 7, fontFamily: T.mono, color: T.textMuted }}>2</span></div>
              <div className="flex items-center gap-1"><div className="w-1 h-1 rounded-full" style={{ background: T.rose }} /><span style={{ fontSize: 7, fontFamily: T.mono, color: T.textMuted }}>1</span></div>
            </div>
          </div>
        </div>

        {/* ── CENTER: TRANSLATION GRID ── */}
        <div className="flex-1 flex flex-col min-w-0" style={{ background: T.bg }}>
          <div className="flex items-center justify-between px-4 py-1.5 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: T.textPrimary }}>Editor</span>
            <div className="flex items-center gap-3">
              <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textMuted }}>{translationRows.length} rows · 14 keys</span>
              <div className="flex items-center gap-1.5">
                <button className="p-0.5 rounded hover:bg-white/5" onClick={() => setShowUnchanged(p => !p)} title={showUnchanged ? "Hide unchanged" : "Show all"}><Eye size={10} color={showUnchanged ? T.cyan : T.textTertiary} /></button>
                <button className="p-0.5 rounded hover:bg-white/5" onClick={() => setShowFilters(p => !p)} title="Toggle filters"><Filter size={10} color={showFilters ? T.cyan : T.textTertiary} /></button>
                <button className="p-0.5 rounded hover:bg-white/5" onClick={() => { navigator.clipboard.writeText(translationRows.map(r => `${r.id}\t${r.status}\t${r.source || r.sourceCode || ""}\t${r.target}`).join("\n")).then(() => toast.success("Rows copied")).catch(() => {}); }} title="Copy all rows"><MoreHorizontal size={10} color={T.textTertiary} /></button>
              </div>
            </div>
          </div>

          {/* Column headers */}
          <div className="grid flex-shrink-0 px-0.5" style={{ gridTemplateColumns: "44px 68px 1fr 1fr 80px", borderBottom: `1px solid ${T.border}`, background: T.bgSurface }}>
            {["#", "Status", "Source Text", "Target Text", "Confidence"].map((col) => (
              <div key={col} className="px-2.5 py-1.5" style={{ fontSize: 8, fontWeight: 800, color: T.textTertiary, letterSpacing: "0.08em", fontFamily: T.sans, textTransform: "uppercase" as const, borderRight: `1px solid ${T.borderSubtle}` }}>
                {col}
              </div>
            ))}
          </div>

          {/* Rows */}
          <div className="flex-1 overflow-y-auto">
            {translationRows.map((row, idx) => {
              const isSelected = idx === selectedRow;
              const sc = statusColors[row.status];
              return (
                <div key={`row-${idx}`} className="grid px-0.5 cursor-pointer transition-colors"
                  style={{
                    gridTemplateColumns: "44px 68px 1fr 1fr 80px",
                    borderBottom: `1px solid ${T.borderSubtle}`,
                    background: isSelected ? "rgba(139,92,246,0.06)" : idx % 2 === 0 ? T.bgRow : T.bgRowAlt,
                    borderLeft: isSelected ? `2px solid ${T.violet}` : "2px solid transparent",
                  }}
                  onClick={() => setSelectedRow(idx)}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = T.bgHover; }}
                  onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = idx % 2 === 0 ? T.bgRow : T.bgRowAlt; }}>
                  {/* # */}
                  <div className="px-2.5 py-2 flex items-start" style={{ borderRight: `1px solid ${T.borderSubtle}` }}>
                    <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>{row.id}</span>
                  </div>
                  {/* Status */}
                  <div className="px-1.5 py-2 flex items-start" style={{ borderRight: `1px solid ${T.borderSubtle}` }}>
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full" style={{ background: sc.bg }}>
                      <div className="w-1 h-1 rounded-full" style={{ background: sc.dot }} />
                      <span style={{ fontSize: 8, color: sc.text, fontWeight: 600 }}>{row.status}</span>
                    </div>
                  </div>
                  {/* Source */}
                  <div className="px-2.5 py-2" style={{ borderRight: `1px solid ${T.borderSubtle}` }}>
                    {row.sourceCode ? (
                      <div className="px-2 py-1 rounded" style={{ background: "rgba(139,92,246,0.04)", border: `1px solid rgba(139,92,246,0.08)` }}>
                        <CodeSnippet code={row.sourceCode} />
                      </div>
                    ) : (
                      <span style={{ fontSize: 10, color: T.textSecondary, lineHeight: 1.5 }}>{row.source}</span>
                    )}
                    {row.hash && <div className="mt-0.5 flex items-center gap-2"><span style={{ fontSize: 7, fontFamily: T.mono, color: T.textMuted }}>{row.hash}</span>{row.chars && <span style={{ fontSize: 7, fontFamily: T.mono, color: T.textMuted }}>{row.chars}c</span>}</div>}
                  </div>
                  {/* Target */}
                  <div className="px-2.5 py-2" style={{ borderRight: `1px solid ${T.borderSubtle}` }}>
                    {row.target ? <span style={{ fontSize: 10, color: T.textPrimary, lineHeight: 1.5 }}>{row.target}</span> : <span style={{ fontSize: 9, color: T.textMuted, fontStyle: "italic" }}>—</span>}
                  </div>
                  {/* Confidence */}
                  <div className="px-2 py-1.5 flex items-center justify-center">
                    <ConfidenceBadge score={row.confidence} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT: DIAGNOSTICS & AI ── */}
        <div className="flex flex-col flex-shrink-0" style={{ width: diagW, borderLeft: `1px solid ${T.border}`, background: T.bgPanel }}>
          <div className="flex items-center justify-between px-3 py-1.5 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: T.textTertiary, letterSpacing: "0.14em", textTransform: "uppercase" as const }}>Diagnostics & AI</span>
            <button className="p-0.5 rounded hover:bg-white/5" onClick={() => setDiagExpanded(p => !p)} title="Toggle diagnostics"><Settings size={10} color={diagExpanded ? T.cyan : T.textTertiary} /></button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* AI SUGGESTIONS */}
            <div className="px-3 pt-3 pb-2">
              <div className="flex items-center gap-1.5 mb-2.5">
                <Sparkles size={10} color={T.violet} />
                <span style={{ fontSize: 9, fontWeight: 800, color: T.textTertiary, letterSpacing: "0.12em", textTransform: "uppercase" as const }}>AI Suggestions</span>
                <ChevronDown size={9} color={T.textTertiary} className="ml-auto" />
              </div>

              {aiSuggestions.map((sug, i) => (
                <div key={`sug-${i}`} className="space-y-2 mb-3">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-1 h-1 rounded-full" style={{ background: T.violet }} />
                      <span style={{ fontSize: 8, fontWeight: 700, color: T.textTertiary }}>{sug.lineRef}</span>
                    </div>
                    <div className="px-2 py-1.5 rounded-md" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${T.borderSubtle}` }}>
                      <span style={{ fontSize: 9, color: T.textSecondary, lineHeight: 1.5 }}>{sug.source}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-1 h-1 rounded-full" style={{ background: T.emerald }} />
                      <span style={{ fontSize: 8, fontWeight: 700, color: T.textTertiary }}>{sug.suggestedLabel}</span>
                    </div>
                    <div className="px-2 py-1.5 rounded-md" style={{ background: "rgba(16,185,129,0.04)", border: `1px solid rgba(16,185,129,0.1)` }}>
                      <span style={{ fontSize: 9, color: T.emerald, lineHeight: 1.5 }}>{sug.suggested}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-1 h-1 rounded-full" style={{ background: T.cyan }} />
                      <span style={{ fontSize: 8, fontWeight: 700, color: T.textTertiary }}>{sug.altLabel}</span>
                    </div>
                    <div className="px-2 py-1.5 rounded-md" style={{ background: "rgba(6,182,212,0.04)", border: `1px solid rgba(6,182,212,0.08)` }}>
                      <span style={{ fontSize: 9, color: T.cyanBright, lineHeight: 1.5 }}>{sug.alt}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <div className="px-2 py-0.5 rounded" style={{ background: T.violetDim, border: `1px solid rgba(139,92,246,0.15)` }}>
                      <span style={{ fontSize: 7, fontFamily: T.mono, color: T.violetBright, fontWeight: 600 }}>{sug.context}</span>
                    </div>
                    <div className="px-2 py-0.5 rounded" style={{ background: "rgba(6,182,212,0.06)", border: `1px solid rgba(6,182,212,0.1)` }}>
                      <span style={{ fontSize: 7, fontFamily: T.mono, color: T.cyanBright, fontWeight: 600 }}>CONTEXT: Technical Manual</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mx-3 h-px" style={{ background: T.border }} />

            {/* CONFLICT LOGS */}
            <div className="px-3 pt-3 pb-2">
              <div className="flex items-center gap-1.5 mb-2.5">
                <AlertTriangle size={10} color={T.amber} />
                <span style={{ fontSize: 9, fontWeight: 800, color: T.textTertiary, letterSpacing: "0.12em", textTransform: "uppercase" as const }}>Conflict Logs</span>
              </div>
              <div className="mb-2.5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <CheckCircle2 size={8} color={T.emerald} />
                  <span style={{ fontSize: 8, fontWeight: 700, color: T.emerald }}>Resolved</span>
                </div>
                {conflictLogs.resolved.map((log, i) => (
                  <div key={`res-${i}`} className="flex items-start gap-2 px-2 py-1.5 rounded mb-0.5 transition-colors"
                    style={{ background: "rgba(16,185,129,0.03)", border: `1px solid rgba(16,185,129,0.06)` }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(16,185,129,0.06)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(16,185,129,0.03)"; }}>
                    <span style={{ fontSize: 8, fontFamily: T.mono, color: T.emerald, fontWeight: 600, flexShrink: 0 }}>{log.id}</span>
                    <span style={{ fontSize: 9, color: T.textSecondary, lineHeight: 1.4, flex: 1 }}>{log.text}</span>
                    <CheckCircle2 size={9} color={T.emerald} className="flex-shrink-0 mt-0.5" />
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <XCircle size={8} color={T.rose} />
                  <span style={{ fontSize: 8, fontWeight: 700, color: T.rose }}>Active</span>
                </div>
                {conflictLogs.active.map((log, i) => (
                  <div key={`act-${i}`} className="flex items-start gap-2 px-2 py-1.5 rounded mb-0.5 transition-colors"
                    style={{ background: "rgba(244,63,94,0.03)", border: `1px solid rgba(244,63,94,0.06)` }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(244,63,94,0.06)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(244,63,94,0.03)"; }}>
                    <span style={{ fontSize: 8, fontFamily: T.mono, color: T.rose, fontWeight: 600, flexShrink: 0 }}>{log.id}</span>
                    <span style={{ fontSize: 9, color: T.textSecondary, lineHeight: 1.4, flex: 1 }}>{log.text}</span>
                    <XCircle size={9} color={T.rose} className="flex-shrink-0 mt-0.5 cursor-pointer" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="px-3 py-1.5 flex items-center justify-between flex-shrink-0" style={{ borderTop: `1px solid ${T.border}` }}>
            <div className="flex items-center gap-1.5">
              <Sparkles size={8} color={T.violet} />
              <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textTertiary }}>AI Engine v2.4</span>
            </div>
            <span style={{ fontSize: 7, fontFamily: T.mono, color: T.textMuted }}>{conflictLogs.resolved.length} resolved · {conflictLogs.active.length} active</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MasterBibleView;
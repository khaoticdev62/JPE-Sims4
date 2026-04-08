/**
 * SourceControlPanel — Phase 9
 * Git-style source control sidebar panel:
 * staged / unstaged sections, inline diff stats, commit form,
 * recent commit history, push/pull status.
 */
import { useState, useCallback } from "react";
import { T } from "../pages/jpe-theme";
import { motion, AnimatePresence, easing } from "./jpe-motion";
import {
  GitBranch, GitCommit, GitMerge, Plus, Minus,
  Upload, Download, RefreshCw, CheckCircle2, AlertTriangle,
  ChevronDown, ChevronRight, FileCode, Braces, Code2,
  Sparkles, Globe, File, RotateCcw, Check, X,
  ArrowUp, ArrowDown, Clock, User,
} from "lucide-react";
import { toast } from "sonner";

/* ─── Types ──────────────────────────────────────────────────────── */
interface ChangedFile {
  id: string;
  path: string;
  ext: string;
  status: "modified" | "added" | "deleted" | "renamed" | "untracked";
  additions: number;
  deletions: number;
  staged: boolean;
}

interface Commit {
  hash: string;
  shortHash: string;
  message: string;
  author: string;
  time: string;
  additions: number;
  deletions: number;
}

/* ─── Mock data ──────────────────────────────────────────────────── */
const INITIAL_FILES: ChangedFile[] = [
  { id: "f1", path: "src/tuning/S4_034AEECB_trait_Evil.xml",  ext: "xml",       status: "modified",  additions: 12, deletions: 3,  staged: true  },
  { id: "f2", path: "src/interactions/hug_friend.jpe",         ext: "jpe",       status: "modified",  additions: 4,  deletions: 1,  staged: true  },
  { id: "f3", path: "src/translations/de_DE.stbl",             ext: "stbl",      status: "added",     additions: 8,  deletions: 0,  staged: false },
  { id: "f4", path: "src/scripts/conflict_resolver.ts4script",  ext: "ts4script", status: "modified",  additions: 21, deletions: 7,  staged: false },
  { id: "f5", path: "src/configs/settings.json",               ext: "json",      status: "modified",  additions: 2,  deletions: 0,  staged: false },
  { id: "f6", path: "src/tuning/S4_NEWFILE_buff_Custom.xml",   ext: "xml",       status: "untracked", additions: 30, deletions: 0,  staged: false },
];

const RECENT_COMMITS: Commit[] = [
  { hash: "a3f8c2144bc", shortHash: "a3f8c21", message: "fix: correct trait_Evil conflict flags", author: "JPEUser", time: "2h ago", additions: 8, deletions: 3 },
  { hash: "e91d4b7c039", shortHash: "e91d4b7", message: "feat: add German localisation (de_DE)", author: "JPEUser", time: "5h ago", additions: 52, deletions: 0 },
  { hash: "c5a031298ff", shortHash: "c5a0312", message: "refactor: split interaction tunings",   author: "JPEUser", time: "1d ago",  additions: 34, deletions: 18 },
  { hash: "b2d9e56101a", shortHash: "b2d9e56", message: "chore: update SDK to v1.108",          author: "JPEUser", time: "2d ago",  additions: 1,  deletions: 1 },
  { hash: "f01ac389b44", shortHash: "f01ac38", message: "docs: update README with install steps", author: "JPEUser", time: "3d ago", additions: 15, deletions: 4 },
];

const STATUS_COLORS: Record<string, string> = {
  modified: T.amber, added: T.emerald, deleted: T.rose, renamed: T.cyan, untracked: T.textTertiary,
};
const STATUS_LETTERS: Record<string, string> = {
  modified: "M", added: "A", deleted: "D", renamed: "R", untracked: "U",
};
const EXT_ICONS: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  xml: FileCode, json: Braces, stbl: Globe, ts4script: Code2, jpe: Sparkles, default: File,
};

function fileColor(ext: string): string {
  const m: Record<string, string> = { xml: T.cyan, json: T.amber, stbl: T.violet, ts4script: T.emerald, jpe: T.violetBright };
  return m[ext] || T.textSecondary;
}

/* ─── File row ────────────────────────────────────────────────────── */
function ChangedFileRow({ file, onToggleStage, onDiscard }: {
  file: ChangedFile;
  onToggleStage: (id: string) => void;
  onDiscard: (id: string) => void;
}) {
  const Icon = EXT_ICONS[file.ext] || EXT_ICONS.default;
  const col = fileColor(file.ext);
  const stColor = STATUS_COLORS[file.status];
  const shortName = file.path.split("/").pop()!;
  const dir = file.path.includes("/") ? file.path.slice(0, file.path.lastIndexOf("/") + 1) : "";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8, height: 0 }}
      transition={{ duration: 0.18, ease: easing.outStandard }}
      className="group flex items-center gap-2 px-3 py-1.5 transition-colors cursor-pointer"
      onMouseEnter={e => { e.currentTarget.style.background = T.bgHover; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
    >
      {/* Stage toggle */}
      <button
        onClick={() => onToggleStage(file.id)}
        className="flex-shrink-0 w-4 h-4 rounded transition-all border flex items-center justify-center"
        style={{
          background: file.staged ? T.emerald : "transparent",
          borderColor: file.staged ? T.emerald : T.textDim,
        }}
        title={file.staged ? "Unstage" : "Stage"}
      >
        {file.staged && <Check size={9} color="#000" strokeWidth={3} />}
      </button>

      {/* Icon */}
      <Icon size={11} color={col} />

      {/* Name */}
      <div className="flex-1 min-w-0">
        <span style={{ fontSize: 11, color: T.textSecondary, fontFamily: T.mono, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>
          {shortName}
        </span>
        <span style={{ fontSize: 9, color: T.textDim, fontFamily: T.mono, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>
          {dir}
        </span>
      </div>

      {/* Diff stats */}
      <div className="flex items-center gap-1 flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
        {file.additions > 0 && (
          <span style={{ fontSize: 9, fontFamily: T.mono, fontWeight: 700, color: T.emerald }}>+{file.additions}</span>
        )}
        {file.deletions > 0 && (
          <span style={{ fontSize: 9, fontFamily: T.mono, fontWeight: 700, color: T.rose }}>-{file.deletions}</span>
        )}
      </div>

      {/* Status letter */}
      <span
        className="flex-shrink-0 w-4 h-4 rounded flex items-center justify-center"
        style={{ fontSize: 9, fontFamily: T.mono, fontWeight: 700, color: stColor, background: `${stColor}15` }}
      >
        {STATUS_LETTERS[file.status]}
      </span>

      {/* Discard button (unstaged only) */}
      {!file.staged && (
        <button
          onClick={() => onDiscard(file.id)}
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-white/10"
          title="Discard changes"
        >
          <RotateCcw size={9} color={T.rose} />
        </button>
      )}
    </motion.div>
  );
}

/* ─── Section ─────────────────────────────────────────────────────── */
function FileSection({ title, files, onToggleStage, onDiscard, color }: {
  title: string; files: ChangedFile[];
  onToggleStage: (id: string) => void;
  onDiscard: (id: string) => void;
  color: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  if (files.length === 0) return null;
  return (
    <div>
      <button
        className="w-full flex items-center gap-2 px-3 py-1.5 transition-colors"
        style={{ background: T.bgSurface, borderBottom: `1px solid ${T.borderSubtle}` }}
        onClick={() => setCollapsed(p => !p)}
        onMouseEnter={e => { e.currentTarget.style.background = T.bgElevated; }}
        onMouseLeave={e => { e.currentTarget.style.background = T.bgSurface; }}
      >
        {collapsed ? <ChevronRight size={10} color={T.textMuted} /> : <ChevronDown size={10} color={T.textMuted} />}
        <span style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: "0.06em" }}>{title}</span>
        <span className="ml-1 px-1.5 py-0 rounded" style={{ fontSize: 8, fontFamily: T.mono, color, background: `${color}12` }}>
          {files.length}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.18 }}
            style={{ overflow: "hidden" }}
          >
            {files.map(f => (
              <ChangedFileRow key={f.id} file={f} onToggleStage={onToggleStage} onDiscard={onDiscard} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────────────── */
export function SourceControlPanel() {
  const [files, setFiles] = useState(INITIAL_FILES);
  const [commitMsg, setCommitMsg] = useState("");
  const [committing, setCommitting] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const staged = files.filter(f => f.staged);
  const unstaged = files.filter(f => !f.staged);
  const untracked = unstaged.filter(f => f.status === "untracked");
  const modified = unstaged.filter(f => f.status !== "untracked");

  const toggleStage = useCallback((id: string) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, staged: !f.staged } : f));
  }, []);

  const stageAll = () => setFiles(prev => prev.map(f => ({ ...f, staged: true })));
  const unstageAll = () => setFiles(prev => prev.map(f => ({ ...f, staged: false })));

  const discard = useCallback((id: string) => {
    const f = files.find(fi => fi.id === id);
    if (!f) return;
    toast(`Discard changes to ${f.path.split("/").pop()}?`, {
      action: {
        label: "Discard",
        onClick: () => {
          setFiles(prev => prev.filter(fi => fi.id !== id));
          toast.success("Changes discarded");
        },
      },
    });
  }, [files]);

  const doCommit = () => {
    if (!commitMsg.trim()) { toast.error("Commit message required"); return; }
    if (staged.length === 0) { toast.error("No staged files"); return; }
    setCommitting(true);
    setTimeout(() => {
      setFiles(prev => prev.filter(f => !f.staged));
      setCommitMsg("");
      setCommitting(false);
      toast.success(`Committed: "${commitMsg.slice(0, 60)}" (${staged.length} file${staged.length !== 1 ? "s" : ""})`);
    }, 900);
  };

  const doPush = () => {
    setPushing(true);
    setTimeout(() => {
      setPushing(false);
      toast.success("Pushed to origin/main");
    }, 1200);
  };

  return (
    <div className="flex flex-col h-full" style={{ background: T.bgPanel, fontFamily: T.sans }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgSurface }}>
        <div className="flex items-center gap-2">
          <GitBranch size={12} color={T.emerald} />
          <span style={{ fontSize: 10, fontWeight: 700, color: T.textPrimary, letterSpacing: "0.05em" }}>SOURCE CONTROL</span>
        </div>
        <div className="flex items-center gap-1">
          {/* Branch indicator */}
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md" style={{ background: T.emeraldDim, border: `1px solid ${T.emerald}20` }}>
            <GitBranch size={9} color={T.emerald} />
            <span style={{ fontSize: 9, fontFamily: T.mono, color: T.emerald }}>main</span>
          </div>
          <button className="p-1 rounded hover:bg-white/5 transition-colors" title="Refresh" onClick={() => toast.success("Status refreshed")}>
            <RefreshCw size={11} color={T.textTertiary} />
          </button>
        </div>
      </div>

      {/* Remote status */}
      <div className="flex items-center gap-3 px-3 py-1.5 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgPanel }}>
        <div className="flex items-center gap-1">
          <ArrowUp size={10} color={T.cyan} />
          <span style={{ fontSize: 9, fontFamily: T.mono, color: T.cyan }}>2 ahead</span>
        </div>
        <div className="flex items-center gap-1">
          <ArrowDown size={10} color={T.textMuted} />
          <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>0 behind</span>
        </div>
        <div className="flex-1" />
        <button
          className="flex items-center gap-1 px-2 py-0.5 rounded transition-colors"
          style={{ fontSize: 9, fontFamily: T.mono, fontWeight: 600, color: T.cyan, background: T.cyanDim, border: `1px solid ${T.cyan}20` }}
          onClick={doPush}
          disabled={pushing}
        >
          {pushing ? <RefreshCw size={9} className="animate-spin" /> : <Upload size={9} />}
          {pushing ? "Pushing…" : "Push"}
        </button>
        <button
          className="flex items-center gap-1 px-2 py-0.5 rounded transition-colors"
          style={{ fontSize: 9, fontFamily: T.mono, fontWeight: 600, color: T.textTertiary, background: "rgba(255,255,255,0.03)", border: `1px solid ${T.borderSubtle}` }}
          onClick={() => toast.info("Fetching from origin/main…")}
        >
          <Download size={9} />
          Pull
        </button>
      </div>

      {/* Commit area */}
      <div className="flex-shrink-0 px-3 py-2" style={{ borderBottom: `1px solid ${T.border}` }}>
        <textarea
          value={commitMsg}
          onChange={e => setCommitMsg(e.target.value)}
          placeholder="Message (Ctrl+Enter to commit)"
          rows={2}
          className="w-full rounded-lg px-2.5 py-1.5 resize-none outline-none"
          style={{ fontSize: 11, fontFamily: T.mono, color: T.textPrimary, background: T.bgInput, border: `1px solid ${commitMsg ? T.borderActive : T.borderSubtle}`, lineHeight: 1.5 }}
          onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); doCommit(); } }}
        />
        <div className="flex items-center gap-2 mt-1.5">
          <button
            onClick={doCommit}
            disabled={committing || !commitMsg.trim() || staged.length === 0}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all flex-1 justify-center"
            style={{
              fontSize: 11, fontWeight: 700, fontFamily: T.sans,
              color: staged.length > 0 && commitMsg ? "#fff" : T.textDim,
              background: staged.length > 0 && commitMsg
                ? `linear-gradient(135deg, ${T.emerald}, ${T.cyan}90)`
                : "rgba(255,255,255,0.04)",
              boxShadow: staged.length > 0 && commitMsg ? `0 0 12px ${T.emerald}25` : "none",
            }}
          >
            {committing ? <RefreshCw size={11} className="animate-spin" /> : <GitCommit size={11} />}
            {committing ? "Committing…" : `Commit ${staged.length > 0 ? `(${staged.length})` : ""}`}
          </button>
          <button
            onClick={stageAll}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            title="Stage all changes"
          >
            <Plus size={11} color={T.emerald} />
          </button>
          <button
            onClick={unstageAll}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            title="Unstage all"
          >
            <Minus size={11} color={T.rose} />
          </button>
        </div>
      </div>

      {/* File lists */}
      <div className="flex-1 overflow-y-auto">
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 size={24} color={T.emerald} className="mb-3" />
            <p style={{ fontSize: 12, color: T.textTertiary }}>No changes</p>
            <p style={{ fontSize: 10, color: T.textDim, marginTop: 4 }}>Working tree clean</p>
          </div>
        ) : (
          <>
            <FileSection title="STAGED" files={staged} onToggleStage={toggleStage} onDiscard={discard} color={T.emerald} />
            <FileSection title="CHANGES" files={modified} onToggleStage={toggleStage} onDiscard={discard} color={T.amber} />
            <FileSection title="UNTRACKED" files={untracked} onToggleStage={toggleStage} onDiscard={discard} color={T.textMuted} />
          </>
        )}
      </div>

      {/* History toggle */}
      <div style={{ borderTop: `1px solid ${T.border}` }}>
        <button
          className="w-full flex items-center gap-2 px-3 py-2 transition-colors"
          style={{ background: T.bgSurface }}
          onClick={() => setShowHistory(p => !p)}
          onMouseEnter={e => { e.currentTarget.style.background = T.bgElevated; }}
          onMouseLeave={e => { e.currentTarget.style.background = T.bgSurface; }}
        >
          {showHistory ? <ChevronDown size={10} color={T.textMuted} /> : <ChevronRight size={10} color={T.textMuted} />}
          <Clock size={10} color={T.textMuted} />
          <span style={{ fontSize: 10, fontWeight: 700, color: T.textTertiary, letterSpacing: "0.05em" }}>COMMIT HISTORY</span>
          <span className="ml-1 px-1.5 py-0 rounded" style={{ fontSize: 8, fontFamily: T.mono, color: T.textDim, background: "rgba(255,255,255,0.03)" }}>{RECENT_COMMITS.length}</span>
        </button>

        <AnimatePresence initial={false}>
          {showHistory && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: "hidden" }}
            >
              {RECENT_COMMITS.map((commit, i) => (
                <div
                  key={commit.hash}
                  className="flex items-start gap-2.5 px-3 py-2 transition-colors cursor-pointer border-b"
                  style={{ borderColor: T.borderSubtle }}
                  onMouseEnter={e => { e.currentTarget.style.background = T.bgHover; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                  onClick={() => toast.info(`Viewing commit ${commit.shortHash}: "${commit.message}"`)}
                >
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full" style={{ background: i === 0 ? T.emerald : T.textDim, boxShadow: i === 0 ? `0 0 4px ${T.emerald}60` : "none" }} />
                    {i < RECENT_COMMITS.length - 1 && <div className="w-px mt-1" style={{ height: 20, background: T.borderSubtle }} />}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 11, color: i === 0 ? T.textPrimary : T.textTertiary, lineHeight: 1.4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {commit.message}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span style={{ fontSize: 9, fontFamily: T.mono, color: T.cyan }}>{commit.shortHash}</span>
                      <User size={8} color={T.textDim} />
                      <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>{commit.author}</span>
                      <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>{commit.time}</span>
                    </div>
                  </div>
                  {/* Stats */}
                  <div className="flex-shrink-0 flex items-center gap-1">
                    {commit.additions > 0 && <span style={{ fontSize: 8, fontFamily: T.mono, fontWeight: 700, color: T.emerald }}>+{commit.additions}</span>}
                    {commit.deletions > 0 && <span style={{ fontSize: 8, fontFamily: T.mono, fontWeight: 700, color: T.rose }}>-{commit.deletions}</span>}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

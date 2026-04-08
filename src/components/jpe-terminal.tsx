"use client";

/**
 * JpeTerminal — Integrated fake terminal for JPE Studio (Phase 8)
 * Supports readline-style history, tab-completion hint, colorised output,
 * and a realistic set of jpe / git / fs commands.
 */
import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from "react";
import { T } from "./robust/jpe-theme";
import { motion, AnimatePresence } from "./jpe-motion";
import { Terminal, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";

/* ── Types ── */
interface TermLine {
  id: number;
  type: "prompt" | "output" | "error" | "success" | "info" | "divider" | "banner";
  text: string;
  color?: string;
  bold?: boolean;
  dim?: boolean;
}

/* ── Fake filesystem ── */
const FAKE_FILES: Record<string, string[]> = {
  ".": ["manifest.json", "README.md", "EvilTraitOverride.package"],
  "src": ["tuning/", "translations/", "scripts/", "configs/"],
  "src/tuning": [
    "S4_034AEECB_trait_Evil.xml",
    "S4_03B33DDF_BG_YA_shorts.xml",
    "S4_0904DF10_buff_Energized.xml",
    "S4_16CD1E22_interaction_Cook.xml",
    "S4_E882D22F_recipe_Salad.xml",
  ],
  "src/translations": ["en_US.stbl", "ja_JP.stbl", "de_DE.stbl", "fr_FR.stbl", "zh_CN.stbl"],
  "src/scripts": ["jpe_translator.ts4script", "mod_injector.ts4script", "conflict_resolver.ts4script"],
  "src/configs": ["settings.json", "overrides.json", "sdk.json"],
  "build": ["EvilTraitOverride.package", "EvilTraitOverride.manifest"],
};

const FILE_CONTENTS: Record<string, string[]> = {
  "manifest.json": [
    '{',
    '  "name": "Evil Trait Override",',
    '  "version": "2.4.1",',
    '  "author": "JPEStudio User",',
    '  "game_version": "1.108.365",',
    '  "uuid": "f1e2d3c4-b5a6-7890-abcd-ef1234567890",',
    '  "tunings": 12,',
    '  "strings": 48,',
    '  "dependencies": ["BaseGame", "GetToWork"]',
    '}',
  ],
  "README.md": [
    "# Evil Trait Override",
    "",
    "Overrides the base-game Evil trait with enhanced interactions,",
    "new moodlet chains, and localized strings for 5 languages.",
    "",
    "## Installation",
    "Drop `EvilTraitOverride.package` into your Mods folder.",
    "",
    "## Requirements",
    "- The Sims 4 v1.108+",
    "- Get To Work expansion",
  ],
  "settings.json": [
    '{',
    '  "sdk_path": "/Applications/Sims4Studio",',
    '  "game_version": "1.108.365",',
    '  "auto_validate": true,',
    '  "export_format": "package",',
    '  "locale_default": "en_US",',
    '  "log_level": "INFO"',
    '}',
  ],
};

/* ── Git fake state ── */
const GIT_LOG = [
  { hash: "a3f8c21", msg: "fix: correct trait_Evil conflict flags", author: "JPEUser", time: "2 hours ago" },
  { hash: "e91d4b7", msg: "feat: add German localisation (de_DE)", author: "JPEUser", time: "5 hours ago" },
  { hash: "c5a0312", msg: "refactor: split interaction tunings", author: "JPEUser", time: "1 day ago" },
  { hash: "8f2e9a4", msg: "chore: update SDK to 1.108.365", author: "JPEUser", time: "2 days ago" },
  { hash: "1b7d06e", msg: "feat: initial Evil Trait Override v2", author: "JPEUser", time: "3 days ago" },
];

const GIT_DIFF_LINES = [
  "diff --git a/src/tuning/S4_034AEECB_trait_Evil.xml b/src/tuning/S4_034AEECB_trait_Evil.xml",
  "index 4a2f88c..e1c935d 100644",
  "--- a/src/tuning/S4_034AEECB_trait_Evil.xml",
  "+++ b/src/tuning/S4_034AEECB_trait_Evil.xml",
  "@@ -18,7 +18,7 @@",
  "   <TunableList name=\"buffs_on_add\">",
  "-    <Tunable value=\"buff_Evil_Aura\"/>",
  "+    <Tunable value=\"buff_Evil_AuraV2\"/>",
  "+    <Tunable value=\"buff_Menacing_Gaze\"/>",
  "   </TunableList>",
];

/* ── Banner ── */
const BANNER_LINES = [
  "  ╔═══════════════════════════════════════════╗",
  "  ║   JPE Studio Terminal  ·  v4.2.0          ║",
  "  ║   Sims 4 Mod Development Environment      ║",
  "  ║   Type  help  for available commands       ║",
  "  ╚═══════════════════════════════════════════╝",
];

/* ── Tab completion candidates ── */
const ALL_COMMANDS = [
  "help", "clear", "cls", "version", "whoami", "ls", "cat", "grep", "cd",
  "git status", "git log", "git diff", "git commit", "git add", "git branch",
  "jpe validate", "jpe build", "jpe pack", "jpe translate", "jpe status", "jpe clean",
  "npm run", "exit",
];

/* ── Command processor ── */
let _lineId = 100;
function nextId() { return ++_lineId; }

function processCommand(
  raw: string,
  cwd: string,
  setCwd: (d: string) => void
): TermLine[] {
  const cmd = raw.trim();
  if (!cmd) return [];

  const out: TermLine[] = [];
  const push = (text: string, type: TermLine["type"] = "output", color?: string, bold?: boolean, dim?: boolean) =>
    out.push({ id: nextId(), type, text, color, bold, dim });

  const [base, ...args] = cmd.split(/\s+/);
  const sub = args[0] ?? "";
  const rest = args.slice(1).join(" ");

  switch (base.toLowerCase()) {
    /* ── clear ── */
    case "clear":
    case "cls":
      return [{ id: nextId(), type: "divider", text: "__clear__" }];

    /* ── help ── */
    case "help":
      push("Available commands:", "info", T.cyanBright, true);
      push("");
      [
        ["help",             "Show this help message"],
        ["version",          "Show JPE Studio version"],
        ["whoami",           "Show current user"],
        ["ls [path]",        "List files in directory"],
        ["cat <file>",       "Print file contents"],
        ["grep <pat> <file>","Search in file"],
        ["cd <dir>",         "Change directory"],
        ["",                 ""],
        ["git status",       "Show working tree status"],
        ["git log",          "Show commit history"],
        ["git diff",         "Show unstaged changes"],
        ["git add <file>",   "Stage file for commit"],
        ["git commit -m",    "Create a commit"],
        ["git branch",       "List branches"],
        ["",                 ""],
        ["jpe validate",     "Validate all JPE tuning files"],
        ["jpe build",        "Package mod into .package"],
        ["jpe pack",         "Alias for jpe build"],
        ["jpe translate",    "Run auto-translation pass"],
        ["jpe status",       "Show project status"],
        ["jpe clean",        "Remove build artefacts"],
        ["",                 ""],
        ["clear / cls",      "Clear the terminal"],
      ].forEach(([c, d]) => {
        if (!c) { push(""); return; }
        push(`  ${c.padEnd(28, " ")}${d}`, "output", T.textSecondary);
      });
      break;

    /* ── version ── */
    case "version":
      push("JPE Studio v4.2.0  (build 20260311)", "success", T.emerald);
      push("Sims 4 SDK v1.108.365", "output", T.textMuted);
      push("Node 22.4.0  ·  Babel 7.24  ·  Vite 5.4", "output", T.textDim, false, true);
      break;

    /* ── whoami ── */
    case "whoami":
      push("JPEUser  (mod-author)", "output", T.cyan);
      push("Project: Evil Trait Override v2.4.1", "output", T.textSecondary);
      push("Branch:  main", "output", T.violet);
      break;

    /* ── ls ── */
    case "ls": {
      const dir = sub || cwd;
      const normDir = dir.replace(/^~\/JPE_Project\/?/, "");
      const list = FAKE_FILES[normDir] ?? FAKE_FILES["."];
      push(`${dir}:`, "info", T.cyan);
      const folders = list.filter(f => f.endsWith("/"));
      const files = list.filter(f => !f.endsWith("/"));
      if (folders.length) push("  " + folders.map(f => f).join("  "), "output", T.amber);
      if (files.length) {
        files.forEach(f => {
          const ext = f.split(".").pop() ?? "";
          const c = ext === "xml" ? T.cyan : ext === "stbl" ? T.violet : ext === "ts4script" ? T.emerald : ext === "json" ? T.amber : ext === "package" ? T.rose : T.textSecondary;
          push(`  ${f}`, "output", c);
        });
      }
      if (!list.length) push(`  (empty)`, "output", T.textDim, false, true);
      break;
    }

    /* ── cat ── */
    case "cat": {
      const filename = sub;
      const content = FILE_CONTENTS[filename];
      if (!content) {
        push(`cat: ${filename}: No such file`, "error", T.rose);
        push("Tip: try  ls  to see available files", "output", T.textMuted, false, true);
        break;
      }
      push(`─── ${filename} ───`, "info", T.textMuted, false, true);
      content.forEach(l => push(l, "output", T.textSecondary));
      break;
    }

    /* ── grep ── */
    case "grep": {
      if (!sub) { push("Usage: grep <pattern> <file>", "error", T.rose); break; }
      const pattern = sub;
      const file = rest;
      const content = file ? FILE_CONTENTS[file] : null;
      if (!content) { push(`grep: ${file || "(no file)"}: No such file`, "error", T.rose); break; }
      const matches = content.map((line, i) => ({ line, num: i + 1 })).filter(({ line }) => line.toLowerCase().includes(pattern.toLowerCase()));
      if (!matches.length) { push(`grep: no matches for "${pattern}" in ${file}`, "output", T.textMuted, false, true); break; }
      matches.forEach(({ line, num }) => {
        const highlighted = line.replace(
          new RegExp(pattern, "gi"),
          m => `\x1b[36m${m}\x1b[0m`
        );
        push(`  ${String(num).padStart(3, " ")}: ${highlighted}`, "output", T.textSecondary);
      });
      push(`  ${matches.length} match${matches.length !== 1 ? "es" : ""}`, "info", T.cyan);
      break;
    }

    /* ── cd ── */
    case "cd": {
      const target = sub || "~";
      if (target === "~" || target === "..") {
        setCwd("~/JPE_Project");
        push(`Changed to ~/JPE_Project`, "output", T.textMuted, false, true);
      } else {
        setCwd(`~/JPE_Project/${target}`);
        push(`Changed to ~/JPE_Project/${target}`, "output", T.textMuted, false, true);
      }
      break;
    }

    /* ── git ── */
    case "git":
      switch (sub.toLowerCase()) {
        case "status":
          push("On branch main", "success", T.emerald);
          push("Your branch is up to date with 'origin/main'.", "output", T.textSecondary);
          push("");
          push("Changes not staged for commit:", "info", T.amber);
          push("  (use \"git add <file>...\" to update)", "output", T.textDim, false, true);
          push("        modified:   src/tuning/S4_034AEECB_trait_Evil.xml", "output", T.amber);
          push("        modified:   src/translations/ja_JP.stbl", "output", T.amber);
          push("");
          push("Untracked files:", "info", T.textSecondary);
          push("        src/tuning/S4_E882D22F_recipe_Salad.xml", "output", T.textSecondary);
          push("");
          push("2 files modified  ·  1 untracked", "output", T.textMuted, false, true);
          break;
        case "log":
          push("commit log (last 5):", "info", T.cyan, true);
          push("");
          GIT_LOG.forEach(entry => {
            push(`  ${entry.hash}  ${entry.msg}`, "output", T.textPrimary);
            push(`          ${entry.author}  ·  ${entry.time}`, "output", T.textMuted, false, true);
          });
          break;
        case "diff":
          push("--- unstaged changes ---", "info", T.textMuted, false, true);
          push("");
          GIT_DIFF_LINES.forEach(l => {
            const c = l.startsWith("+") && !l.startsWith("+++") ? T.emerald
              : l.startsWith("-") && !l.startsWith("---") ? T.rose
              : l.startsWith("@@") ? T.violet
              : l.startsWith("diff") || l.startsWith("index") ? T.cyan
              : T.textSecondary;
            push(l, "output", c);
          });
          break;
        case "add":
          push(`Staged: ${rest || sub || "(nothing)"}`, "success", T.emerald);
          break;
        case "commit": {
          const msgMatch = cmd.match(/-m\s+"?([^"]+)"?/);
          const message = msgMatch ? msgMatch[1] : "Update";
          const hash = Math.random().toString(16).slice(2, 9);
          push(`[main ${hash}] ${message}`, "success", T.emerald);
          push(` 1 file changed, 3 insertions(+), 1 deletion(-)`, "output", T.textSecondary);
          break;
        }
        case "branch":
          push("* main", "success", T.emerald);
          push("  develop", "output", T.textSecondary);
          push("  feature/multi-locale", "output", T.textSecondary);
          break;
        default:
          push(`git: '${sub}' is not a git command. See 'git help'.`, "error", T.rose);
      }
      break;

    /* ── jpe ── */
    case "jpe":
      switch (sub.toLowerCase()) {
        case "validate":
          push("JPE Validate — scanning project files…", "info", T.violet);
          push("");
          push("  ✓  src/tuning/S4_034AEECB_trait_Evil.xml        [42 tunables  OK]", "success", T.emerald);
          push("  ✓  src/tuning/S4_0904DF10_buff_Energized.xml    [18 tunables  OK]", "success", T.emerald);
          push("  ✓  src/tuning/S4_16CD1E22_interaction_Cook.xml  [31 tunables  OK]", "success", T.emerald);
          push("  ⚠  src/tuning/S4_E882D22F_recipe_Salad.xml      [missing required attr: cost]", "output", T.amber);
          push("  ✓  src/translations/en_US.stbl                  [48 strings]", "success", T.emerald);
          push("  ✓  src/translations/ja_JP.stbl                  [46 strings  2 pending]", "output", T.amber);
          push("");
          push("Result:  5 files  ·  139 tunables  ·  1 warning  ·  0 errors", "info", T.cyan);
          push("Tip: run  jpe build  to package", "output", T.textMuted, false, true);
          break;
        case "build":
        case "pack":
          push("JPE Build — packaging mod…", "info", T.violet);
          push("");
          push("  [1/4] Parsing XML tunings…          done (0.11s)", "output", T.textSecondary);
          push("  [2/4] Compiling string tables…      done (0.04s)", "output", T.textSecondary);
          push("  [3/4] Resolving resource keys…      done (0.08s)", "output", T.textSecondary);
          push("  [4/4] Writing package binary…       done (0.19s)", "output", T.textSecondary);
          push("");
          push("  ✓  build/EvilTraitOverride.package  (2.47 MB)", "success", T.emerald);
          push("  Build #47 completed in 0.42s", "success", T.emerald);
          break;
        case "translate":
          {
            const langFlag = args.find(a => a.startsWith("--lang"));
            const lang = langFlag ? langFlag.split("=")[1] || args[args.indexOf(langFlag) + 1] || "ja_JP" : "ja_JP";
            push(`JPE Translate — target: ${lang}`, "info", T.violet);
            push("");
            push(`  Scanning en_US.stbl  →  48 source strings`, "output", T.textSecondary);
            push(`  Existing ${lang}.stbl →  46 translated`, "output", T.textSecondary);
            push(`  Pending translation:  2 strings`, "output", T.amber);
            push("");
            push(`  Translating via NMT engine (offline)…`, "output", T.textMuted, false, true);
            push(`  [1/2]  "Feeling mischievous"  →  "いたずらな気持ち"`, "success", T.emerald);
            push(`  [2/2]  "Sinister plans"        →  "不吉な計画"`, "success", T.emerald);
            push("");
            push(`  ✓  ${lang}.stbl updated  (48/48 strings complete)`, "success", T.emerald);
          }
          break;
        case "status":
          push("JPE Project Status", "info", T.cyan, true);
          push("");
          push(`  Project:   Evil Trait Override v2.4.1`, "output", T.textPrimary);
          push(`  SDK:       Sims 4 v1.108.365   ✓ Compatible`, "success", T.emerald);
          push(`  Files:     14 tracked (3 modified)`, "output", T.amber);
          push(`  Tunings:   139 validated  ·  1 warning`, "output", T.amber);
          push(`  Strings:   48 en_US  ·  46 ja_JP  ·  48 de_DE  ·  48 fr_FR`, "output", T.textSecondary);
          push(`  Build:     #47  (2025-03-11 14:22)`, "output", T.textSecondary);
          push(`  Conflicts: 0`, "success", T.emerald);
          break;
        case "clean":
          push("Removing build artefacts…", "info", T.textMuted, false, true);
          push("  Removed: build/EvilTraitOverride.package", "output", T.rose);
          push("  Removed: build/EvilTraitOverride.manifest", "output", T.rose);
          push("  Removed: .jpe-cache/ (1.2 MB)", "output", T.rose);
          push("✓ Clean complete", "success", T.emerald);
          break;
        default:
          push(`jpe: unknown subcommand '${sub}'`, "error", T.rose);
          push("Try  jpe validate | build | pack | translate | status | clean", "output", T.textMuted, false, true);
      }
      break;

    /* ── exit ── */
    case "exit":
      push("Use the panel controls to close the terminal.", "output", T.textMuted, false, true);
      break;

    /* ── unknown ── */
    default:
      push(`${base}: command not found`, "error", T.rose);
      push("Type  help  for available commands.", "output", T.textMuted, false, true);
  }

  return out;
}

/* ══════════════════════════════════════════════════════════════
   TERMINAL COMPONENT
   ══════════════════════════════════════════════════════════════ */
export function JpeTerminal() {
  const [cwd, setCwd] = useState("~/JPE_Project");
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [_histIdx, setHistIdx] = useState(-1);
  const [lines, setLines] = useState<TermLine[]>(() =>
    BANNER_LINES.map(t => ({ id: nextId(), type: "banner" as const, text: t, color: T.violet }))
  );
  const [suggestion, setSuggestion] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const prompt = `${cwd}$ `;

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  // Focus on click
  const focusInput = () => inputRef.current?.focus();

  // Tab completion hint
  const updateSuggestion = useCallback((val: string) => {
    if (!val.trim()) { setSuggestion(""); return; }
    const match = ALL_COMMANDS.find(c => c.startsWith(val) && c !== val);
    setSuggestion(match ? match.slice(val.length) : "");
  }, []);

  const handleInput = (v: string) => {
    setInput(v);
    setHistIdx(-1);
    updateSuggestion(v);
  };

  const submit = useCallback(() => {
    if (!input.trim()) return;
    const cmd = input.trim();

    // Add prompt line
    const promptLine: TermLine = { id: nextId(), type: "prompt", text: cmd };

    setHistory(prev => [cmd, ...prev.slice(0, 49)]);
    setHistIdx(-1);
    setInput("");
    setSuggestion("");

    const result = processCommand(cmd, cwd, setCwd);

    // Handle clear
    if (result.length === 1 && result[0].text === "__clear__") {
      setLines(BANNER_LINES.map(t => ({ id: nextId(), type: "banner" as const, text: t, color: T.violet })));
      return;
    }

    setLines(prev => [...prev, promptLine, ...result]);
  }, [input, cwd]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHistIdx(prev => {
        const next = Math.min(prev + 1, history.length - 1);
        if (history[next] !== undefined) {
          setInput(history[next]);
          setSuggestion("");
        }
        return next;
      });
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHistIdx(prev => {
        const next = Math.max(prev - 1, -1);
        const v = next === -1 ? "" : (history[next] ?? "");
        setInput(v);
        updateSuggestion(v);
        return next;
      });
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (suggestion) {
        const completed = input + suggestion;
        setInput(completed);
        setSuggestion("");
        updateSuggestion(completed);
      }
    } else if (e.key === "c" && e.ctrlKey) {
      e.preventDefault();
      setLines(prev => [...prev,
        { id: nextId(), type: "prompt", text: input },
        { id: nextId(), type: "error", text: "^C", color: T.rose },
      ]);
      setInput("");
      setSuggestion("");
      setHistIdx(-1);
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines(BANNER_LINES.map(t => ({ id: nextId(), type: "banner" as const, text: t, color: T.violet })));
    }
  };

  const copyOutput = () => {
    const text = lines.filter(l => l.type !== "divider").map(l =>
      l.type === "prompt" ? `${prompt}${l.text}` : l.text
    ).join("\n");
    navigator.clipboard.writeText(text).then(() => toast.success("Terminal output copied")).catch(() => {});
  };

  const clearTerminal = () => {
    setLines(BANNER_LINES.map(t => ({ id: nextId(), type: "banner" as const, text: t, color: T.violet })));
  };

  return (
    <div
      className="flex flex-col h-full select-none"
      style={{ background: T.bgDeep, fontFamily: T.mono }}
      onClick={focusInput}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-1 flex-shrink-0"
        style={{ borderBottom: `1px solid ${T.borderSubtle}`, background: T.bgPanel }}>
        <div className="flex items-center gap-2">
          <Terminal size={11} color={T.emerald} />
          <span style={{ fontSize: 10, color: T.textTertiary }}>JPE Shell</span>
          <div className="w-px h-3" style={{ background: T.border }} />
          <span style={{ fontSize: 10, color: T.textMuted, fontStyle: "italic" }}>{cwd}</span>
        </div>
        <div className="flex items-center gap-1">
          <span style={{ fontSize: 9, color: T.textDim }}>
            {history.length > 0 && `${history.length} in history`}
          </span>
          <button className="p-1 rounded hover:bg-white/5 transition-colors" onClick={copyOutput} title="Copy output">
            <Copy size={11} color={T.textTertiary} />
          </button>
          <button className="p-1 rounded hover:bg-white/5 transition-colors" onClick={clearTerminal} title="Clear terminal (Ctrl+L)">
            <Trash2 size={11} color={T.textTertiary} />
          </button>
        </div>
      </div>

      {/* Output area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto py-1 px-2"
        style={{ fontSize: 11, lineHeight: "1.65" }}
      >
        <AnimatePresence initial={false}>
          {lines.map(line => (
            <motion.div
              key={line.id}
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.07 }}
              style={{
                color: line.color ?? (line.type === "error" ? T.rose : line.type === "success" ? T.emerald : line.type === "info" ? T.cyan : line.type === "banner" ? T.violet : T.textSecondary),
                opacity: line.dim ? 0.55 : 1,
                fontWeight: line.bold ? 700 : line.type === "banner" ? 600 : 400,
                paddingLeft: line.type === "prompt" ? 0 : undefined,
                whiteSpace: "pre",
              }}
            >
              {line.type === "prompt" ? (
                <span>
                  <span style={{ color: T.emerald }}>{cwd}</span>
                  <span style={{ color: T.textMuted }}>$</span>
                  <span style={{ color: T.textPrimary }}> {line.text}</span>
                </span>
              ) : (
                line.text
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input row */}
      <div
        className="flex items-center px-2 py-1.5 flex-shrink-0"
        style={{ borderTop: `1px solid ${T.borderSubtle}` }}
      >
        {/* Prompt */}
        <span style={{ fontSize: 11, color: T.emerald, flexShrink: 0 }}>{cwd}</span>
        <span style={{ fontSize: 11, color: T.textMuted, flexShrink: 0, marginRight: 4 }}>$</span>

        {/* Input + completion ghost */}
        <div className="flex-1 relative">
          <span
            className="absolute inset-0 pointer-events-none"
            style={{ fontSize: 11, color: T.textDim, whiteSpace: "pre", opacity: 0.45 }}
            aria-hidden="true"
          >
            {input}{suggestion}
          </span>
          <input
            ref={inputRef}
            autoFocus
            className="w-full bg-transparent outline-none relative"
            style={{ fontSize: 11, color: T.textPrimary, caretColor: T.cyan }}
            value={input}
            onChange={e => handleInput(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            aria-label="Terminal input"
          />
        </div>

        {/* Tab hint */}
        {suggestion && (
          <span style={{ fontSize: 9, color: T.textDim, flexShrink: 0, marginLeft: 6 }}>
            Tab to complete
          </span>
        )}

        {/* Blinking cursor indicator */}
        <span
          className="flex-shrink-0 ml-0.5 animate-pulse"
          style={{ width: 2, height: 12, background: T.cyan, borderRadius: 1, opacity: 0.8 }}
        />
      </div>
    </div>
  );
}

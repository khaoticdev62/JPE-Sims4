import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  X, Search, Copy, Code2, FileCode, Braces, Layers,
  Plus, Edit3, Trash2, Check, BookOpen, Sparkles,
  Filter, ChevronRight, Tag, Clock, Star, Pin,
  Globe, Download, Hash, Lightbulb, Play, Eye,
  ArrowUpRight, FileText, Puzzle, Keyboard,
} from "lucide-react";
import { motion, AnimatePresence } from "./jpe-motion";
import { T } from "../pages/jpe-theme";
import { Eyebrow, Badge } from "../pages/jpe-shared";
import { toast } from "sonner";

/* ─── Types ─── */
type SnippetLang = "jpe" | "xml" | "python" | "json" | "stbl";
type SnippetCategory = "all" | "interactions" | "traits" | "buffs" | "objects" | "skills" | "automation" | "custom" | "pinned";

interface Snippet {
  id: string;
  title: string;
  description: string;
  lang: SnippetLang;
  category: SnippetCategory;
  tags: string[];
  code: string;
  pinned?: boolean;
  builtin?: boolean;
  usageCount: number;
  lastUsed?: string;
  author?: string;
}

/* ─── Snippet data ─── */
const SNIPPETS: Snippet[] = [
  {
    id: "jpe-interaction-basic",
    title: "Basic Interaction Definition",
    description: "Scaffold for a simple one-shot NPC interaction with display name and outcomes",
    lang: "jpe",
    category: "interactions",
    tags: ["interaction", "basic", "npc"],
    builtin: true,
    pinned: true,
    usageCount: 47,
    lastUsed: "2m ago",
    code: `interaction HugFriend {
  display_name: "Hug Friend"
  short_name: "Hug"
  category: SocialMixin

  affordances {
    target: SimSelf
    requires { is_human: true }
  }

  outcome success {
    probability: 0.85
    loot { buff: buff_Happily_Hugged(3h) }
  }

  outcome failure {
    probability: 0.15
    loot { moodlet: -15(Social) }
  }
}`,
  },
  {
    id: "jpe-trait-full",
    title: "Full Trait Definition",
    description: "Complete trait scaffold with display name, CAS icon, buffs, and conflict list",
    lang: "jpe",
    category: "traits",
    tags: ["trait", "cas", "personality"],
    builtin: true,
    pinned: true,
    usageCount: 38,
    lastUsed: "1h ago",
    code: `trait MyCustomTrait {
  display_name: "Trait Name"
  trait_description: "Description shown in CAS"
  cas_selected_icon: "S4_2F7D0004_INSTANCE_MyTrait"
  ages: [TEEN, YOUNGADULT, ADULT, ELDER]
  trait_type: PERSONALITY

  buffs_on_add {
    buff_type: buff_MyTrait_Aura
    buff_reason: "Because of trait"
  }

  conflicting_traits [
    trait_Opposite
  ]

  whims {
    weight: 1000
    whim: WhimSet_MyTrait
  }
}`,
  },
  {
    id: "jpe-buff-definition",
    title: "Buff with Moodlet",
    description: "Define a custom buff/moodlet with intensity, duration, and mood type",
    lang: "jpe",
    category: "buffs",
    tags: ["buff", "moodlet", "emotion"],
    builtin: true,
    usageCount: 29,
    lastUsed: "3h ago",
    code: `buff MyCustomBuff {
  display_name: "Buff Name"
  buff_description: "How the Sim feels"

  mood_type: Happy
  mood_weight: 2
  visible: true
  commodity_guid: MyCustomBuff

  timeout {
    duration: 3h
    on_timeout: clear
  }
}`,
  },
  {
    id: "xml-stbl-entry",
    title: "STBL String Entry",
    description: "Single string table entry with hash and locale comment",
    lang: "xml",
    category: "objects",
    tags: ["stbl", "string", "locale"],
    builtin: true,
    usageCount: 22,
    lastUsed: "5h ago",
    code: `<!-- String Table Entry -->
<LocalizedString id="0x0A3B4C5D">
  <!-- en_US: "Display Name Here" -->
  <HashKey>0x0A3B4C5D</HashKey>
  <Text>Display Name Here</Text>
</LocalizedString>`,
  },
  {
    id: "xml-tuning-root",
    title: "Tuning File Root",
    description: "Standard XML tuning file header with UTF-8 declaration",
    lang: "xml",
    category: "interactions",
    tags: ["xml", "tuning", "root", "header"],
    builtin: true,
    usageCount: 61,
    lastUsed: "30m ago",
    code: `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE I SYSTEM "https://tuning.thesims4.com/tuning-schema.dtd">
<I c="ClassName" i="interaction" m="module.path" n="tuning_name" s="INSTANCE_ID">
  <!-- Tuning content here -->
</I>`,
  },
  {
    id: "xml-tunablevariant",
    title: "TunableVariant Block",
    description: "TunableVariant with locked_args for branching tuning logic",
    lang: "xml",
    category: "traits",
    tags: ["xml", "variant", "tunable"],
    builtin: true,
    usageCount: 18,
    lastUsed: "2d ago",
    code: `<TunableVariant name="variant_name" default="option_a">
  <V n="option_a" t="option_a">
    <Tunable name="value" type="FLOAT">1.0</Tunable>
  </V>
  <V n="option_b" t="option_b">
    <Tunable name="value" type="FLOAT">2.0</Tunable>
  </V>
</TunableVariant>`,
  },
  {
    id: "python-injection",
    title: "Script Injection Pattern",
    description: "Standard Python script injection for extending existing game interactions",
    lang: "python",
    category: "automation",
    tags: ["python", "injection", "script", "ts4script"],
    builtin: true,
    usageCount: 14,
    lastUsed: "1d ago",
    code: `import services
import sims4.commands
from interactions.base.interaction import Interaction
from sims4.tuning.instances import lock_instance_tunables

@sims4.commands.Command('mod.custom_command', command_type=sims4.commands.CommandType.Live)
def custom_command(opt_sim: sims4.commands.OptionalSimInfoParam = None, _connection=None):
    output = sims4.commands.CheatOutput(_connection)
    sim_info = sims4.commands.get_optional_target(opt_sim, services.active_sim_info_gen())
    if sim_info is None:
        output('No Sim targeted.')
        return
    # Your logic here
    output(f'Command executed for: {sim_info.full_name}')`,
  },
  {
    id: "python-loot-action",
    title: "Custom Loot Action",
    description: "Python loot action class that grants a buff or modifies a statistic",
    lang: "python",
    category: "buffs",
    tags: ["python", "loot", "buff", "statistic"],
    builtin: true,
    usageCount: 9,
    lastUsed: "4d ago",
    code: `from interactions.utils.loot_basic_op import BaseLootOperation
from sims4.tuning.tunable import TunableReference, Tunable

class CustomLootOperation(BaseLootOperation):
    INSTANCE_TUNABLES = {
        'buff_type': TunableReference(
            description='The buff to apply.',
            manager=services.get_instance_manager(Types.BUFF)
        ),
        'duration_multiplier': Tunable(
            description='Multiplier for buff duration.',
            tunable_type=float,
            default=1.0
        ),
    }

    def apply_to_resolver(self, resolver):
        sim = resolver.sim
        if sim is not None:
            sim.add_buff(self.buff_type, buff_reason=None)`,
  },
  {
    id: "json-manifest",
    title: "Mod Manifest (manifest.json)",
    description: "Complete mod manifest file with metadata, version, and dependency declarations",
    lang: "json",
    category: "automation",
    tags: ["json", "manifest", "metadata"],
    builtin: true,
    usageCount: 55,
    lastUsed: "10m ago",
    code: `{
  "name": "My Sims 4 Mod",
  "version": "1.0.0",
  "author": "YourName",
  "description": "A description of what this mod does.",
  "game_version": ">=1.108.0",
  "tags": ["gameplay", "traits"],
  "dependencies": [
    {
      "name": "Base Game",
      "required": true,
      "version": ">=1.108.0"
    }
  ],
  "files": [
    "MyMod.package",
    "MyMod.ts4script"
  ],
  "contact": "https://yourwebsite.com"
}`,
  },
  {
    id: "jpe-skill-definition",
    title: "Skill Definition",
    description: "Define a custom skill with name, icon, and leveled loot actions",
    lang: "jpe",
    category: "skills",
    tags: ["skill", "leveled", "progression"],
    builtin: true,
    usageCount: 7,
    lastUsed: "1w ago",
    code: `skill MyCustomSkill {
  display_name: "Skill Name"
  skill_description: "What Sims learn from this skill"
  icon: "S4_2F7D0004_SKILL_icon"

  category: creative
  hidden: false
  update_interval: FAST_SKILL_UPDATE

  level_data {
    level 1 { display_name: "Novice"; loot: [] }
    level 3 { display_name: "Practitioner"; loot: [trait_Hidden_Skill_3] }
    level 5 { display_name: "Expert"; loot: [trait_Hidden_Skill_5] }
    level 10 { display_name: "Master"; loot: [trait_Hidden_Skill_10] }
  }
}`,
  },
  {
    id: "jpe-object-definition",
    title: "Object Interaction Mixin",
    description: "Interaction mixin for objects with pie menu affordance declarations",
    lang: "jpe",
    category: "objects",
    tags: ["object", "mixin", "affordance", "pie-menu"],
    builtin: true,
    usageCount: 11,
    lastUsed: "3d ago",
    code: `interaction ObjectInteractionMixin {
  display_name: "Use Object"
  short_name: "Use"
  category: ObjectMixin

  affordances {
    target: GameObject
    requires {
      has_tag: "object_my_custom_tag"
    }
  }

  basic_content {
    animation_ref: a_sim_use_object
    xevt { outcome_action: success }
  }

  outcome success {
    probability: 0.95
    loot { fun: +15 }
  }
}`,
  },
];

/* ─── Language config ─── */
const LANG_CONFIG: Record<SnippetLang, { label: string; color: string; icon: React.FC<{ size?: number; color?: string }> }> = {
  jpe:    { label: "JPE",    color: T.violet,  icon: Sparkles },
  xml:    { label: "XML",    color: T.cyan,    icon: FileCode },
  python: { label: "Python", color: T.amber,   icon: Code2 },
  json:   { label: "JSON",   color: T.emerald, icon: Braces },
  stbl:   { label: "STBL",   color: T.rose,    icon: Globe },
};

const CAT_CONFIG: Record<SnippetCategory, { label: string; color: string }> = {
  all:         { label: "All Snippets", color: T.textTertiary },
  pinned:      { label: "Pinned",       color: T.amber },
  interactions:{ label: "Interactions", color: T.violet },
  traits:      { label: "Traits",       color: T.cyan },
  buffs:       { label: "Buffs",        color: T.emerald },
  objects:     { label: "Objects",      color: T.cyanDeep },
  skills:      { label: "Skills",       color: T.violetBright },
  automation:  { label: "Automation",   color: T.rose },
  custom:      { label: "My Snippets",  color: T.amber },
};

/* ─── Syntax highlight (simple token-based) ─── */
function SyntaxHighlight({ code, lang }: { code: string; lang: SnippetLang }) {
  const lines = code.split("\n");
  return (
    <div className="py-2 overflow-x-auto">
      {lines.map((line, i) => {
        let rendered: React.ReactNode = line;
        if (lang === "jpe") {
          const keywords = ["interaction", "trait", "buff", "skill", "outcome", "affordances", "requires", "display_name", "loot", "probability", "buff_type", "ages", "category", "target", "duration", "timeout", "whims", "weight", "hidden", "visible", "basic_content", "level", "level_data", "conflicting_traits", "cas_selected_icon", "short_name", "mood_type", "mood_weight"];
          rendered = highlightLine(line, keywords, T.violetBright, T.cyan, T.emerald);
        } else if (lang === "xml") {
          rendered = highlightXml(line);
        } else if (lang === "python") {
          rendered = highlightPython(line);
        } else if (lang === "json") {
          rendered = highlightJson(line);
        }
        return (
          <div key={i} className="flex items-start gap-3 px-4 py-[1px] group"
            style={{ minHeight: 20 }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.015)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
            <span className="flex-shrink-0 select-none text-right" style={{ width: 28, fontSize: 11, fontFamily: T.mono, color: T.textDim }}>{i + 1}</span>
            <span className="flex-1" style={{ fontSize: 12.5, fontFamily: T.mono, whiteSpace: "pre-wrap", wordBreak: "break-all", lineHeight: 1.65 }}>{rendered}</span>
          </div>
        );
      })}
    </div>
  );
}

function highlightLine(line: string, keywords: string[], kwColor: string, strColor: string, numColor: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = line;
  let idx = 0;

  // Comments
  const commentIdx = remaining.indexOf("//");
  const hashCommentIdx = remaining.indexOf("#");
  const commentStart = [commentIdx, hashCommentIdx].filter(x => x >= 0).sort((a, b) => a - b)[0];

  if (commentStart !== undefined && commentStart >= 0) {
    const before = remaining.slice(0, commentStart);
    const comment = remaining.slice(commentStart);
    parts.push(<span key={idx++}>{highlightTokens(before, keywords, kwColor, strColor, numColor)}</span>);
    parts.push(<span key={idx++} style={{ color: T.textMuted }}>{comment}</span>);
    return parts;
  }

  return highlightTokens(remaining, keywords, kwColor, strColor, numColor);
}

function highlightTokens(text: string, keywords: string[], kwColor: string, strColor: string, numColor: string): React.ReactNode {
  const tokens = text.split(/(\s+|[{}[\]:,;]|"[^"]*"|'[^']*'|\b\d+\.?\d*\b)/);
  return tokens.map((tok, i) => {
    if ((tok.startsWith('"') && tok.endsWith('"')) || (tok.startsWith("'") && tok.endsWith("'"))) {
      return <span key={i} style={{ color: strColor }}>{tok}</span>;
    }
    if (keywords.includes(tok.trim())) {
      return <span key={i} style={{ color: kwColor, fontWeight: 600 }}>{tok}</span>;
    }
    if (/^\d+\.?\d*(h|s|m)?$/.test(tok.trim()) && tok.trim()) {
      return <span key={i} style={{ color: numColor }}>{tok}</span>;
    }
    return <span key={i} style={{ color: T.textSecondary }}>{tok}</span>;
  });
}

function highlightXml(line: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let i = 0;
  const tokens = line.split(/(<[^>]+>|<!--[\s\S]*?-->)/);
  tokens.forEach((tok, idx) => {
    if (tok.startsWith("<!--")) {
      parts.push(<span key={idx} style={{ color: T.textMuted }}>{tok}</span>);
    } else if (tok.startsWith("<")) {
      const inner = tok.slice(1, -1);
      const attrParts = inner.split(/(\s+\w+(?::\w+)?=["'][^"']*["'])/);
      parts.push(
        <span key={idx} style={{ color: T.cyan }}>
          &lt;
          {attrParts.map((p, pi) => {
            if (p.includes("=")) {
              const eqIdx = p.indexOf("=");
              return (
                <span key={pi}>
                  <span style={{ color: T.violet }}>{p.slice(0, eqIdx)}</span>
                  <span style={{ color: T.textSecondary }}>=</span>
                  <span style={{ color: T.emerald }}>{p.slice(eqIdx + 1)}</span>
                </span>
              );
            }
            return <span key={pi} style={{ color: tok.startsWith("</") || p.startsWith("/") ? T.cyan : T.cyanBright }}>{p}</span>;
          })}
          &gt;
        </span>
      );
    } else {
      if (tok.trim()) {
        parts.push(<span key={idx} style={{ color: T.textSecondary }}>{tok}</span>);
      } else {
        parts.push(<span key={idx}>{tok}</span>);
      }
    }
    i++;
  });
  return parts;
}

function highlightPython(line: string): React.ReactNode {
  const kwds = ["import", "from", "def", "class", "return", "if", "elif", "else", "for", "while", "in", "not", "and", "or", "True", "False", "None", "@", "self"];
  return highlightTokens(line, kwds, T.violet, T.emerald, T.amber);
}

function highlightJson(line: string): React.ReactNode {
  if (!line.trim()) return <span style={{ color: T.textSecondary }}>{line}</span>;
  const parts: React.ReactNode[] = [];
  const colonIdx = line.indexOf('"', line.indexOf(":"));
  const keyMatch = line.match(/^(\s*)(\"[^"]+\")(\s*:\s*)(.*)/);
  if (keyMatch) {
    parts.push(<span key="indent">{keyMatch[1]}</span>);
    parts.push(<span key="key" style={{ color: T.cyan }}>{keyMatch[2]}</span>);
    parts.push(<span key="colon" style={{ color: T.textMuted }}>{keyMatch[3]}</span>);
    const val = keyMatch[4];
    if (val.startsWith('"')) parts.push(<span key="val" style={{ color: T.emerald }}>{val}</span>);
    else if (val === "true" || val === "false") parts.push(<span key="val" style={{ color: T.violet }}>{val}</span>);
    else if (/^[\d.,-]+/.test(val)) parts.push(<span key="val" style={{ color: T.amber }}>{val}</span>);
    else parts.push(<span key="val" style={{ color: T.textSecondary }}>{val}</span>);
    return parts;
  }
  return <span style={{ color: T.textSecondary }}>{line}</span>;
}

/* ─── Main component ─── */
interface SnippetManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SnippetManager({ isOpen, onClose }: SnippetManagerProps) {
  const [query, setQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState<SnippetCategory>("all");
  const [selectedLang, setSelectedLang] = useState<SnippetLang | "all">("all");
  const [selected, setSelected] = useState<Snippet | null>(SNIPPETS[0]);
  const [snippets, setSnippets] = useState<Snippet[]>(SNIPPETS);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newLang, setNewLang] = useState<SnippetLang>("jpe");
  const [newDesc, setNewDesc] = useState("");
  const [editingTag, setEditingTag] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchRef.current?.focus(), 80);
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const filtered = useMemo(() => {
    let list = snippets;
    if (selectedCat === "pinned") list = list.filter(s => s.pinned);
    else if (selectedCat !== "all") list = list.filter(s => s.category === selectedCat);
    if (selectedLang !== "all") list = list.filter(s => s.lang === selectedLang);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tags.some(t => t.includes(q)) ||
        s.code.toLowerCase().includes(q)
      );
    }
    return list;
  }, [snippets, selectedCat, selectedLang, query]);

  const togglePin = useCallback((id: string) => {
    setSnippets(prev => prev.map(s => s.id === id ? { ...s, pinned: !s.pinned } : s));
    if (selected?.id === id) setSelected(s => s ? { ...s, pinned: !s.pinned } : s);
  }, [selected]);

  const copySnippet = useCallback((snippet: Snippet) => {
    navigator.clipboard.writeText(snippet.code).then(() => {
      setCopiedId(snippet.id);
      setSnippets(prev => prev.map(s => s.id === snippet.id ? { ...s, usageCount: s.usageCount + 1, lastUsed: "just now" } : s));
      toast.success(`"${snippet.title}" copied to clipboard`);
      setTimeout(() => setCopiedId(null), 1800);
    }).catch(() => toast.error("Failed to copy"));
  }, []);

  const deleteSnippet = useCallback((id: string) => {
    setSnippets(prev => prev.filter(s => s.id !== id));
    if (selected?.id === id) setSelected(filtered.find(s => s.id !== id) ?? null);
    toast.success("Snippet deleted");
  }, [selected, filtered]);

  const createSnippet = () => {
    if (!newTitle.trim() || !newCode.trim()) { toast.error("Title and code are required"); return; }
    const ns: Snippet = {
      id: `custom-${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim() || "Custom snippet",
      lang: newLang,
      category: "custom",
      tags: editingTag.split(",").map(t => t.trim()).filter(Boolean),
      code: newCode,
      builtin: false,
      usageCount: 0,
      author: "You",
    };
    setSnippets(prev => [ns, ...prev]);
    setSelected(ns);
    setShowNewForm(false);
    setNewTitle(""); setNewCode(""); setNewDesc(""); setEditingTag("");
    toast.success(`Snippet "${ns.title}" created`);
  };

  const cats = Object.entries(CAT_CONFIG) as [SnippetCategory, { label: string; color: string }][];
  const pinnedCount = snippets.filter(s => s.pinned).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -16 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col overflow-hidden"
            style={{
              width: "min(1060px, 94vw)",
              height: "min(720px, 90vh)",
              background: T.bgDeep,
              border: `1px solid ${T.border}`,
              borderRadius: 16,
              boxShadow: `0 32px 80px rgba(0,0,0,0.7), 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.04)`,
            }}
          >
            {/* Top accent line */}
            <div className="h-px w-full flex-shrink-0" style={{ background: `linear-gradient(90deg, transparent 0%, ${T.violet}60 30%, ${T.cyan}60 70%, transparent 100%)` }} />

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgPanel }}>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${T.violet}25, ${T.cyan}15)`, border: `1px solid ${T.borderViolet}` }}>
                  <Layers size={14} color={T.violetBright} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 14, fontWeight: 800, color: T.textPrimary, fontFamily: T.display }}>Snippet Manager</span>
                    <Badge color={T.violet} bg={T.violetDim}>{snippets.length} snippets</Badge>
                  </div>
                  <span style={{ fontSize: 10, fontFamily: T.mono, color: T.textMuted }}>Ctrl+Shift+S · JPE Studio Code Library</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowNewForm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
                  style={{ fontSize: 11, fontWeight: 600, color: T.textPrimary, background: `linear-gradient(135deg, ${T.violet}20, ${T.cyan}15)`, border: `1px solid ${T.borderViolet}` }}
                  onMouseEnter={e => { e.currentTarget.style.background = `linear-gradient(135deg, ${T.violet}30, ${T.cyan}25)`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = `linear-gradient(135deg, ${T.violet}20, ${T.cyan}15)`; }}
                >
                  <Plus size={12} color={T.violetBright} /> New Snippet
                </button>
                <button onClick={onClose} className="p-1.5 rounded-lg transition-colors" style={{ color: T.textMuted }} onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex flex-1 min-h-0">
              {/* ─── Left Sidebar: Categories ─── */}
              <div className="flex flex-col flex-shrink-0" style={{ width: 168, borderRight: `1px solid ${T.border}`, background: T.bgPanel }}>
                {/* Search */}
                <div className="px-2 py-2 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: T.bgInput, border: `1px solid ${query ? T.borderActive : T.borderSubtle}` }}>
                    <Search size={11} color={query ? T.cyan : T.textMuted} />
                    <input
                      ref={searchRef}
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder="Search..."
                      className="flex-1 bg-transparent outline-none min-w-0"
                      style={{ fontSize: 11, color: T.textPrimary, fontFamily: T.sans }}
                    />
                    {query && <button onClick={() => setQuery("")}><X size={9} color={T.textMuted} /></button>}
                  </div>
                </div>

                {/* Category list */}
                <div className="flex-1 overflow-y-auto py-1">
                  <div className="px-2 pt-2 pb-1"><Eyebrow color={T.textDim}>CATEGORY</Eyebrow></div>
                  {cats.map(([key, cfg]) => {
                    const count = key === "all" ? snippets.length : key === "pinned" ? pinnedCount : snippets.filter(s => s.category === key).length;
                    if (key !== "all" && key !== "pinned" && count === 0) return null;
                    const isAct = selectedCat === key;
                    return (
                      <button key={key} onClick={() => setSelectedCat(key)}
                        className="w-full flex items-center justify-between px-3 py-1.5 transition-colors text-left"
                        style={{ background: isAct ? `${cfg.color}10` : "transparent", borderLeft: `2px solid ${isAct ? cfg.color : "transparent"}` }}>
                        <span style={{ fontSize: 11, color: isAct ? T.textPrimary : T.textTertiary, fontWeight: isAct ? 700 : 500 }}>{cfg.label}</span>
                        <span className="px-1.5 rounded" style={{ fontSize: 9, fontFamily: T.mono, color: isAct ? cfg.color : T.textDim, background: isAct ? `${cfg.color}12` : "rgba(255,255,255,0.03)" }}>{count}</span>
                      </button>
                    );
                  })}

                  <div className="px-2 pt-3 pb-1"><Eyebrow color={T.textDim}>LANGUAGE</Eyebrow></div>
                  {(["all", "jpe", "xml", "python", "json"] as (SnippetLang | "all")[]).map(lang => {
                    const isAct = selectedLang === lang;
                    const cfg = lang !== "all" ? LANG_CONFIG[lang as SnippetLang] : null;
                    const cnt = lang === "all" ? snippets.length : snippets.filter(s => s.lang === lang).length;
                    const color = cfg?.color ?? T.textTertiary;
                    return (
                      <button key={lang} onClick={() => setSelectedLang(lang)}
                        className="w-full flex items-center justify-between px-3 py-1.5 transition-colors"
                        style={{ background: isAct ? `${color}10` : "transparent", borderLeft: `2px solid ${isAct ? color : "transparent"}` }}>
                        <span style={{ fontSize: 11, color: isAct ? T.textPrimary : T.textTertiary, fontWeight: isAct ? 700 : 500 }}>{lang === "all" ? "All Languages" : cfg!.label}</span>
                        <span className="px-1.5 rounded" style={{ fontSize: 9, fontFamily: T.mono, color: isAct ? color : T.textDim, background: isAct ? `${color}12` : "rgba(255,255,255,0.03)" }}>{cnt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Sidebar footer */}
                <div className="px-3 py-2 flex-shrink-0" style={{ borderTop: `1px solid ${T.border}` }}>
                  <div className="flex items-center gap-1.5">
                    <Keyboard size={10} color={T.textDim} />
                    <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>↑↓ navigate · Enter copy</span>
                  </div>
                </div>
              </div>

              {/* ─── Center: Snippet List ─── */}
              <div className="flex flex-col flex-shrink-0 overflow-hidden" style={{ width: 272, borderRight: `1px solid ${T.border}`, background: T.bg }}>
                {/* List header */}
                <div className="flex items-center justify-between px-3 py-1.5 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgSurface }}>
                  <span style={{ fontSize: 10, fontFamily: T.mono, color: T.textMuted }}>{filtered.length} snippet{filtered.length !== 1 ? "s" : ""}</span>
                  <Filter size={11} color={T.textDim} />
                </div>

                {/* New snippet form (inline) */}
                <AnimatePresence>
                  {showNewForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ borderBottom: `1px solid ${T.border}`, overflow: "hidden", background: T.bgPanel }}
                    >
                      <div className="px-3 py-3 space-y-2">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Plus size={10} color={T.violet} />
                          <Eyebrow color={T.violetBright}>NEW SNIPPET</Eyebrow>
                        </div>
                        {[
                          { label: "Title", value: newTitle, onChange: setNewTitle, placeholder: "Snippet title..." },
                          { label: "Description", value: newDesc, onChange: setNewDesc, placeholder: "What does it do?" },
                        ].map(f => (
                          <input key={f.label} value={f.value} onChange={e => f.onChange(e.target.value)} placeholder={f.placeholder}
                            className="w-full px-2 py-1.5 rounded-lg outline-none"
                            style={{ fontSize: 11, color: T.textPrimary, background: T.bgInput, border: `1px solid ${T.borderSubtle}`, fontFamily: T.sans }} />
                        ))}
                        <div className="flex items-center gap-2">
                          <select value={newLang} onChange={e => setNewLang(e.target.value as SnippetLang)}
                            className="flex-1 px-2 py-1.5 rounded-lg outline-none"
                            style={{ fontSize: 11, color: T.textSecondary, background: T.bgInput, border: `1px solid ${T.borderSubtle}` }}>
                            {Object.entries(LANG_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                          </select>
                        </div>
                        <textarea value={newCode} onChange={e => setNewCode(e.target.value)} placeholder="Paste your code here..."
                          className="w-full px-2 py-2 rounded-lg outline-none resize-none"
                          rows={4}
                          style={{ fontSize: 11, color: T.textPrimary, background: T.bgInput, border: `1px solid ${T.borderSubtle}`, fontFamily: T.mono }} />
                        <div className="flex items-center gap-2">
                          <button onClick={createSnippet} className="flex-1 py-1.5 rounded-lg transition-all" style={{ fontSize: 11, fontWeight: 700, color: T.textPrimary, background: `linear-gradient(135deg, ${T.violet}, ${T.violetDeep})` }}>Create</button>
                          <button onClick={() => setShowNewForm(false)} className="px-3 py-1.5 rounded-lg transition-all" style={{ fontSize: 11, color: T.textMuted, background: "rgba(255,255,255,0.04)", border: `1px solid ${T.borderSubtle}` }}>Cancel</button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Snippet list */}
                <div className="flex-1 overflow-y-auto">
                  {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-12">
                      <Search size={24} color={T.textDim} className="mb-2" />
                      <span style={{ fontSize: 12, color: T.textMuted }}>No snippets found</span>
                    </div>
                  ) : (
                    filtered.map(snippet => {
                      const isSelected = selected?.id === snippet.id;
                      const lcfg = LANG_CONFIG[snippet.lang];
                      const LangIcon = lcfg.icon;
                      return (
                        <button
                          key={snippet.id}
                          onClick={() => setSelected(snippet)}
                          className="w-full text-left px-3 py-2.5 transition-all relative"
                          style={{
                            background: isSelected ? `${T.violet}08` : "transparent",
                            borderLeft: `2px solid ${isSelected ? T.violet : "transparent"}`,
                          }}
                          onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = T.bgHover; }}
                          onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                        >
                          <div className="flex items-start gap-2">
                            <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${lcfg.color}12`, border: `1px solid ${lcfg.color}20` }}>
                              <LangIcon size={11} color={lcfg.color} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                {snippet.pinned && <Pin size={9} color={T.amber} />}
                                <span className="truncate flex-1" style={{ fontSize: 12, fontWeight: 600, color: isSelected ? T.textPrimary : T.textSecondary }}>{snippet.title}</span>
                              </div>
                              <p className="truncate" style={{ fontSize: 10, color: T.textMuted, lineHeight: 1.4 }}>{snippet.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="px-1 rounded" style={{ fontSize: 8, fontWeight: 700, color: lcfg.color, background: `${lcfg.color}12` }}>{lcfg.label}</span>
                                {snippet.usageCount > 0 && <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>×{snippet.usageCount}</span>}
                                {snippet.lastUsed && <span style={{ fontSize: 9, color: T.textDim }}>{snippet.lastUsed}</span>}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* ─── Right: Preview Pane ─── */}
              <div className="flex flex-col flex-1 min-w-0">
                {selected ? (
                  <>
                    {/* Preview header */}
                    <div className="flex items-center justify-between px-4 py-2.5 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgSurface }}>
                      <div className="flex items-center gap-3 min-w-0">
                        {(() => {
                          const lcfg = LANG_CONFIG[selected.lang];
                          const Icon = lcfg.icon;
                          return (
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${lcfg.color}12`, border: `1px solid ${lcfg.color}25` }}>
                              <Icon size={15} color={lcfg.color} />
                            </div>
                          );
                        })()}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate" style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary }}>{selected.title}</span>
                            {selected.pinned && <Pin size={10} color={T.amber} />}
                          </div>
                          <p style={{ fontSize: 11, color: T.textMuted }}>{selected.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => togglePin(selected.id)}
                          title={selected.pinned ? "Unpin" : "Pin snippet"}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ color: selected.pinned ? T.amber : T.textMuted }}
                          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                        >
                          <Pin size={13} />
                        </button>
                        {!selected.builtin && (
                          <button
                            onClick={() => deleteSnippet(selected.id)}
                            title="Delete snippet"
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ color: T.textMuted }}
                            onMouseEnter={e => { e.currentTarget.style.background = T.roseDim; e.currentTarget.style.color = T.rose; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.textMuted; }}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                        <button
                          onClick={() => copySnippet(selected)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
                          style={{
                            fontSize: 12, fontWeight: 700,
                            color: copiedId === selected.id ? T.emerald : T.textPrimary,
                            background: copiedId === selected.id
                              ? `linear-gradient(135deg, ${T.emerald}30, ${T.emerald}15)`
                              : `linear-gradient(135deg, ${T.violet}25, ${T.violet}15)`,
                            border: `1px solid ${copiedId === selected.id ? `${T.emerald}30` : T.borderViolet}`,
                          }}
                        >
                          {copiedId === selected.id ? <Check size={13} /> : <Copy size={13} />}
                          {copiedId === selected.id ? "Copied!" : "Copy"}
                        </button>
                      </div>
                    </div>

                    {/* Metadata row */}
                    <div className="flex items-center gap-3 px-4 py-1.5 flex-shrink-0" style={{ borderBottom: `1px solid ${T.borderSubtle}`, background: T.bgPanel }}>
                      {(() => { const lcfg = LANG_CONFIG[selected.lang]; return <span className="px-2 py-0.5 rounded-md" style={{ fontSize: 9, fontWeight: 700, color: lcfg.color, background: `${lcfg.color}12` }}>{lcfg.label}</span>; })()}
                      <span className="px-2 py-0.5 rounded-md" style={{ fontSize: 9, fontWeight: 700, color: T.textTertiary, background: "rgba(255,255,255,0.04)" }}>{CAT_CONFIG[selected.category as SnippetCategory]?.label}</span>
                      <div className="w-px h-3" style={{ background: T.border }} />
                      {selected.tags.map(tag => (
                        <span key={tag} className="flex items-center gap-1" style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>
                          <Tag size={8} />{tag}
                        </span>
                      ))}
                      <div className="ml-auto flex items-center gap-3">
                        <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>{selected.code.split("\n").length} lines</span>
                        <div className="flex items-center gap-1">
                          <Clock size={9} color={T.textDim} />
                          <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>{selected.lastUsed ?? "never"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye size={9} color={T.textDim} />
                          <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>×{selected.usageCount}</span>
                        </div>
                        {selected.author && <span style={{ fontSize: 9, color: T.textDim }}>by {selected.author ?? "JPE Studio"}</span>}
                        {selected.builtin && <Badge color={T.textMuted} bg="rgba(255,255,255,0.03)">Built-in</Badge>}
                      </div>
                    </div>

                    {/* Code preview */}
                    <div className="flex-1 overflow-y-auto" style={{ background: T.bgDeep }}>
                      <SyntaxHighlight code={selected.code} lang={selected.lang} />
                    </div>

                    {/* Preview footer */}
                    <div className="flex items-center justify-between px-4 py-2 flex-shrink-0" style={{ borderTop: `1px solid ${T.border}`, background: T.bgPanel }}>
                      <div className="flex items-center gap-2">
                        <Lightbulb size={10} color={T.textDim} />
                        <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>Double-click in editor to insert at cursor</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { copySnippet(selected); }}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all"
                          style={{ fontSize: 10, color: T.textTertiary, background: "rgba(255,255,255,0.02)", border: `1px solid ${T.borderSubtle}` }}
                          onMouseEnter={e => { e.currentTarget.style.color = T.textPrimary; }}
                          onMouseLeave={e => { e.currentTarget.style.color = T.textTertiary; }}
                        >
                          <Copy size={10} /> Copy Code
                        </button>
                        <button
                          onClick={() => toast.info("Insert at cursor — click in editor first")}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all"
                          style={{ fontSize: 10, color: T.violet, background: T.violetDim, border: `1px solid ${T.borderViolet}` }}
                          onMouseEnter={e => { e.currentTarget.style.background = `${T.violet}20`; }}
                          onMouseLeave={e => { e.currentTarget.style.background = T.violetDim; }}
                        >
                          <ArrowUpRight size={10} /> Insert
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center" style={{ background: T.bgDeep }}>
                    <Layers size={36} color={T.textDim} className="mb-3" />
                    <span style={{ fontSize: 13, color: T.textMuted }}>Select a snippet to preview</span>
                    <span style={{ fontSize: 10, color: T.textDim, marginTop: 4 }}>Or create a new one with the button above</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SnippetManager;

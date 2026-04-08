/* ─────────────────────────────────────────────────────────────
   JPE Studio — AI Assistant View (Gemini Edition)
   Powered by Google Gemini via @google/generative-ai.
   Supports multi-turn chat with streaming, model selection,
   API key management, and Sims 4 modding domain prompts.
   ───────────────────────────────────────────────────────────── */
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Sparkles, Send, Copy, CheckCircle2, RotateCcw, Code2,
  Languages, Shield, Bug, Rocket, Lightbulb, FileCode,
  ChevronRight, Zap, Globe, Settings, Key, Eye, EyeOff,
  X, ChevronDown, AlertTriangle, Cpu, RefreshCw,
  type LucideIcon,
} from "lucide-react";
import { T } from "../pages/jpe-theme";
import { Eyebrow, Badge, GlowDot, IconBtn } from "../pages/jpe-shared";
import { motion, AnimatePresence, easing, duration as dur } from "./jpe-motion";
import { toast } from "sonner";
import {
  GeminiClient,
  getGeminiKey, setGeminiKey, clearGeminiKey, hasGeminiKey,
  GEMINI_MODELS, GeminiPrompts,
  type GeminiModelId,
} from "./jpe-gemini";

/* ── Types ──────────────────────────────────────────────────── */
interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  streaming?: boolean;
  codeBlock?: { language: string; code: string };
  suggestions?: string[];
  model?: string;
  error?: boolean;
}

/* ── Initial seed messages ──────────────────────────────────── */
const seedMessages: ChatMessage[] = [
  {
    id: "sys-1", role: "system",
    content: "JPE AI initialized — powered by Google Gemini. Enter your Gemini API key to begin real conversations, or explore the demo messages below.",
    timestamp: "15:42:18",
  },
  {
    id: "usr-1", role: "user",
    content: "Translate the Evil trait tuning file to JPE format",
    timestamp: "15:42:45",
  },
  {
    id: "ast-1", role: "assistant",
    content: "I've analyzed the Evil trait tuning XML and generated the JPE translation. Here's the core trait declaration:",
    timestamp: "15:42:47",
    codeBlock: {
      language: "jpe",
      code: `trait: Evil
  display_name: "Evil"
  type: PERSONALITY
  description: "These Sims enjoy being mean"
  ages: TEEN, YOUNGADULT, ADULT, ELDER

  conflicts_with:
    trait: Good
    trait: Childish

  on_add:
    buff: Evil_Aura
      reason: "Feeling Evil"`,
    },
    suggestions: ["Add custom interaction overrides", "Review conflicting trait list", "Generate STBL entries for all strings"],
    model: "gemini-2.0-flash",
  },
];

/* ── Gemini model tier pill ─────────────────────────────────── */
function TierPill({ tier }: { tier: "fast" | "balanced" | "powerful" }) {
  const cfg = {
    fast:     { color: T.emerald, label: "Fast"     },
    balanced: { color: T.cyan,    label: "Balanced"  },
    powerful: { color: T.violet,  label: "Powerful"  },
  }[tier];
  return (
    <span className="px-1.5 py-0 rounded-full" style={{ fontSize: 8, fontWeight: 700, color: cfg.color, background: `${cfg.color}15`, border: `1px solid ${cfg.color}25` }}>
      {cfg.label}
    </span>
  );
}

/* ── API Key setup panel ────────────────────────────────────── */
function ApiKeyPanel({ onDone }: { onDone: () => void }) {
  const [key, setKey] = useState(getGeminiKey());
  const [visible, setVisible] = useState(false);
  const [testing, setTesting] = useState(false);

  const save = async () => {
    if (!key.trim()) return;
    setTesting(true);
    try {
      // Quick validation: try a tiny generate
      const client = new GeminiClient(key.trim(), "gemini-2.0-flash-lite");
      await client.generate("Reply with just: OK");
      setGeminiKey(key.trim());
      toast.success("Gemini API key saved and verified!");
      onDone();
    } catch (err: any) {
      toast.error("Key verification failed", { description: err?.message?.slice(0, 80) ?? "Check your key and try again." });
    }
    setTesting(false);
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 p-8 gap-6">
      {/* Gemini branding */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center relative" style={{ background: `linear-gradient(135deg, #4285F4, #EA4335, #FBBC05, #34A853)`, padding: 2 }}>
          <div className="w-full h-full rounded-xl flex items-center justify-center" style={{ background: T.bgPanel }}>
            <Sparkles size={26} color="#4285F4" />
          </div>
        </div>
        <div className="text-center">
          <div style={{ fontSize: 18, fontWeight: 800, color: T.textPrimary, fontFamily: T.display }}>Google Gemini</div>
          <div style={{ fontSize: 11, color: T.textMuted }}>for JPE Studio</div>
        </div>
      </div>

      {/* Key input */}
      <div className="w-full max-w-md space-y-3">
        <div style={{ fontSize: 11, color: T.textSecondary, textAlign: "center", lineHeight: 1.6 }}>
          Get your free API key at{" "}
          <span style={{ color: T.cyan }}>aistudio.google.com/apikey</span>
          {" "}— no credit card required.
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: T.bgInput, border: `1px solid ${T.border}` }}>
          <Key size={13} color={T.textMuted} />
          <input
            type={visible ? "text" : "password"}
            value={key}
            onChange={e => setKey(e.target.value)}
            placeholder="AIza…"
            className="flex-1 bg-transparent outline-none"
            style={{ fontSize: 12, fontFamily: T.mono, color: T.textPrimary }}
            onKeyDown={e => { if (e.key === "Enter") save(); }}
          />
          <button onClick={() => setVisible(p => !p)} className="p-1 rounded hover:bg-white/5">
            {visible ? <EyeOff size={12} color={T.textMuted} /> : <Eye size={12} color={T.textMuted} />}
          </button>
        </div>
        <button
          onClick={save}
          disabled={!key.trim() || testing}
          className="w-full py-2.5 rounded-xl transition-all disabled:opacity-40"
          style={{ fontSize: 13, fontWeight: 700, color: "#fff", background: `linear-gradient(135deg, #4285F4, #34A853)` }}
        >
          {testing ? <span className="flex items-center justify-center gap-2"><RefreshCw size={13} className="animate-spin" />Verifying…</span> : "Save & Connect"}
        </button>
        <div style={{ fontSize: 9, color: T.textDim, textAlign: "center" }}>
          Key is stored in localStorage only. Never transmitted to third parties.
        </div>
      </div>

      {/* Skip for demo */}
      <button onClick={onDone} style={{ fontSize: 11, color: T.textMuted }} className="hover:text-white transition-colors">
        Continue with demo mode →
      </button>
    </div>
  );
}

/* ── Main AI Assistant view ─────────────────────────────────── */
const aiCapabilities: { icon: LucideIcon; label: string; desc: string; color: string; prompt: string }[] = [
  { icon: Languages, label: "Translation",    desc: "XML to JPE conversion with context",  color: T.violet,      prompt: "Translate the Evil trait tuning file to JPE format" },
  { icon: Shield,    label: "Conflict Check", desc: "Detect mod compatibility issues",      color: T.emerald,     prompt: "Scan my project for conflicts with MCCC and Wicked Whims" },
  { icon: Code2,     label: "Code Gen",       desc: "Generate JPE, XML, or STBL entries",  color: T.cyan,        prompt: "Generate a new buff XML tuning file for a 'Cunning' moodlet" },
  { icon: Bug,       label: "Debugging",      desc: "Diagnose tuning errors and warnings",  color: T.rose,        prompt: "Explain this validation error: Unknown tuning type 'TraitConflictType'" },
  { icon: Lightbulb, label: "Best Practices", desc: "Optimization and naming tips",         color: T.amber,       prompt: "Review my Evil trait mod and suggest naming convention fixes" },
  { icon: Globe,     label: "Localization",   desc: "Multi-locale translation assistance",  color: T.violetBright, prompt: "Translate 'Evil Glee' moodlet strings to es-ES, fr-FR, and de-DE" },
];

export function AIAssistantView() {
  const [messages, setMessages]       = useState<ChatMessage[]>(seedMessages);
  const [input, setInput]             = useState("");
  const [streaming, setStreaming]     = useState(false);
  const [copiedId, setCopiedId]       = useState<string | null>(null);
  const [activeTab, setActiveTab]     = useState<"chat" | "models" | "setup">("chat");
  const [modelId, setModelId]         = useState<GeminiModelId>("gemini-2.0-flash");
  const [hasKey, setHasKey]           = useState(hasGeminiKey());
  const [showKeyPanel, setShowKeyPanel] = useState(!hasGeminiKey());
  const [modelPickerOpen, setModelPickerOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef        = useRef<GeminiClient | null>(null);
  const abortRef       = useRef<boolean>(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const currentModel = GEMINI_MODELS.find(m => m.id === modelId)!;

  /* ── Real streaming send via Gemini ── */
  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // Placeholder streaming bubble
    const astId = `ast-${Date.now()}`;
    const astBase: ChatMessage = {
      id: astId, role: "assistant", content: "", streaming: true,
      timestamp: new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      model: modelId,
    };
    setMessages(prev => [...prev, astBase]);
    setStreaming(true);
    abortRef.current = false;

    const key = getGeminiKey();
    if (!key) {
      // Demo mode — simulate a response
      await new Promise(r => setTimeout(r, 800));
      setMessages(prev => prev.map(m => m.id === astId ? {
        ...m,
        streaming: false,
        content: "⚠️ Demo mode — no Gemini API key configured. Click **Setup** to add your key and enable real AI responses. Meanwhile, here's a simulated answer: the Evil trait in Sims 4 is defined via `TunableSimData` with `trait_type = PERSONALITY` and a `conflict_weight` that governs how strongly it clashes with opposing traits like Good and Cheerful.",
        suggestions: ["Configure API key", "View model selection", "Translate current file"],
      } : m));
      setStreaming(false);
      return;
    }

    try {
      const client = new GeminiClient(key, modelId);
      let full = "";
      for await (const chunk of client.generateStream(text)) {
        if (abortRef.current) break;
        full += chunk;
        const snapshot = full;
        setMessages(prev => prev.map(m => m.id === astId ? { ...m, content: snapshot } : m));
      }
      // Finalize
      setMessages(prev => prev.map(m => m.id === astId ? {
        ...m,
        streaming: false,
        content: full || "(No response)",
        suggestions: ["Ask a follow-up", "Copy this response", "Start new conversation"],
      } : m));
    } catch (err: any) {
      setMessages(prev => prev.map(m => m.id === astId ? {
        ...m, streaming: false, error: true,
        content: `Error: ${err?.message ?? "Gemini request failed"}. Check your API key in Settings.`,
      } : m));
      toast.error("Gemini error", { description: err?.message?.slice(0, 80) });
    }
    setStreaming(false);
  }, [input, streaming, modelId]);

  const stopStreaming = () => { abortRef.current = true; };

  const copyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("Code copied!");
  };

  const newConversation = () => {
    setMessages(seedMessages);
    toast.success("New conversation started");
  };

  /* ── Show key panel if no key ── */
  if (showKeyPanel) {
    return (
      <div className="flex flex-col h-full" style={{ background: T.bgDeep }}>
        <div className="flex items-center justify-between px-4 py-1.5 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgPanel }}>
          <div className="flex items-center gap-2">
            <Sparkles size={14} color={T.violet} />
            <Eyebrow color={T.textPrimary}>AI ASSISTANT</Eyebrow>
            <Badge color="#4285F4" bg="rgba(66,133,244,0.12)">Gemini</Badge>
          </div>
        </div>
        <ApiKeyPanel onDone={() => { setHasKey(hasGeminiKey()); setShowKeyPanel(false); }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background: T.bgDeep }}>

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between px-4 py-1.5 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgPanel }}>
        <div className="flex items-center gap-3">
          <Sparkles size={14} color={T.violet} />
          <Eyebrow color={T.textPrimary}>AI ASSISTANT</Eyebrow>
          <div className="w-px h-4" style={{ background: T.border }} />
          {/* Model picker trigger */}
          <div className="relative">
            <button
              onClick={() => setModelPickerOpen(p => !p)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all"
              style={{
                fontSize: 10, fontWeight: 600,
                color: modelPickerOpen ? T.textPrimary : T.textSecondary,
                background: modelPickerOpen ? `rgba(66,133,244,0.12)` : "rgba(255,255,255,0.03)",
                border: `1px solid ${modelPickerOpen ? "rgba(66,133,244,0.3)" : T.borderSubtle}`,
              }}
            >
              <Cpu size={10} color="#4285F4" />
              <span>{currentModel.label}</span>
              <TierPill tier={currentModel.tier} />
              <ChevronDown size={9} color={T.textMuted} style={{ transform: modelPickerOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
            </button>
            <AnimatePresence>
              {modelPickerOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.96 }}
                  transition={{ duration: 0.14 }}
                  className="absolute top-full left-0 mt-1.5 rounded-xl overflow-hidden z-[400] min-w-[280px]"
                  style={{ background: T.bgElevated, border: `1px solid ${T.border}`, boxShadow: `0 16px 48px rgba(0,0,0,0.6)` }}
                >
                  {GEMINI_MODELS.map(m => (
                    <button
                      key={m.id}
                      onClick={() => { setModelId(m.id); setModelPickerOpen(false); toast.success(`Switched to ${m.label}`); }}
                      className="w-full flex items-start gap-3 px-4 py-3 text-left transition-all"
                      style={{ background: modelId === m.id ? "rgba(66,133,244,0.08)" : "transparent", borderBottom: `1px solid ${T.borderSubtle}` }}
                      onMouseEnter={e => { if (modelId !== m.id) e.currentTarget.style.background = T.bgHover; }}
                      onMouseLeave={e => { if (modelId !== m.id) e.currentTarget.style.background = "transparent"; }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span style={{ fontSize: 11, fontWeight: 600, color: modelId === m.id ? T.textPrimary : T.textSecondary }}>{m.label}</span>
                          <TierPill tier={m.tier} />
                          {m.badge && <span style={{ fontSize: 8, color: "#4285F4", background: "rgba(66,133,244,0.12)", padding: "1px 5px", borderRadius: 4, fontWeight: 700 }}>{m.badge}</span>}
                        </div>
                        <p style={{ fontSize: 10, color: T.textMuted, marginTop: 2, lineHeight: 1.4 }}>{m.desc}</p>
                        <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>{m.contextK}k ctx</span>
                      </div>
                      {modelId === m.id && <CheckCircle2 size={12} color="#4285F4" className="flex-shrink-0 mt-1" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {hasKey
            ? <Badge color={T.emerald} bg={T.emeraldDim}>Live</Badge>
            : <Badge color={T.amber} bg={T.amberDim}>Demo</Badge>
          }
        </div>
        <div className="flex items-center gap-1.5">
          {([
            { key: "chat" as const,   label: "Chat"         },
            { key: "models" as const, label: "Capabilities" },
            { key: "setup" as const,  label: "Setup"        },
          ]).map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className="px-2.5 py-1 rounded-lg transition-colors"
              style={{
                fontSize: 11, fontWeight: activeTab === tab.key ? 700 : 500,
                color: activeTab === tab.key ? T.textPrimary : T.textTertiary,
                background: activeTab === tab.key ? "rgba(255,255,255,0.05)" : "transparent",
                border: `1px solid ${activeTab === tab.key ? T.border : "transparent"}`,
              }}>
              {tab.label}
            </button>
          ))}
          <div className="w-px h-4" style={{ background: T.border }} />
          <IconBtn icon={RotateCcw} title="New conversation" onClick={newConversation} />
        </div>
      </div>

      {/* ── Tab: Setup ── */}
      {activeTab === "setup" && (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-md mx-auto space-y-4">
            <div style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary }}>Gemini API Setup</div>
            <div className="rounded-xl p-4 space-y-3" style={{ background: T.bgSurface, border: `1px solid ${T.border}` }}>
              <div className="flex items-center gap-2">
                <Key size={13} color={hasKey ? T.emerald : T.amber} />
                <span style={{ fontSize: 12, color: hasKey ? T.emerald : T.amber }}>
                  {hasKey ? "API key configured" : "No API key"}
                </span>
              </div>
              {hasKey && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: T.bgInput, border: `1px solid ${T.borderSubtle}` }}>
                  <span style={{ fontSize: 11, fontFamily: T.mono, color: T.textMuted }}>
                    {getGeminiKey().slice(0, 8)}{"•".repeat(20)}
                  </span>
                  <button onClick={() => { clearGeminiKey(); setHasKey(false); toast.success("Key removed"); }} className="ml-auto">
                    <X size={11} color={T.rose} />
                  </button>
                </div>
              )}
              <button
                onClick={() => setShowKeyPanel(true)}
                className="w-full py-2 rounded-lg transition-all"
                style={{ fontSize: 11, fontWeight: 600, color: "#fff", background: "linear-gradient(135deg, #4285F4, #34A853)" }}
              >
                {hasKey ? "Replace API Key" : "Add API Key"}
              </button>
            </div>
            <div className="rounded-xl p-4 space-y-2" style={{ background: T.bgSurface, border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted }}>ACTIVE MODEL</div>
              <div style={{ fontSize: 12, color: T.textPrimary }}>{currentModel.label}</div>
              <div style={{ fontSize: 10, color: T.textMuted }}>{currentModel.desc}</div>
              <div className="flex items-center gap-2 mt-1">
                <TierPill tier={currentModel.tier} />
                <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>{currentModel.contextK}k context</span>
              </div>
            </div>
            <div className="rounded-xl p-3" style={{ background: T.amberDim, border: `1px solid ${T.amber}20` }}>
              <div className="flex items-start gap-2">
                <AlertTriangle size={12} color={T.amber} className="flex-shrink-0 mt-0.5" />
                <p style={{ fontSize: 10, color: T.textSecondary, lineHeight: 1.5 }}>
                  JPE Studio is a development tool. Do not enter production API keys. Keys are stored in localStorage only.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Capabilities ── */}
      {activeTab === "models" && (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: `linear-gradient(135deg, #4285F4, #EA4335, #FBBC05, #34A853)`, padding: 2 }}>
                <div className="w-full h-full rounded-xl flex items-center justify-center" style={{ background: T.bgPanel }}>
                  <Sparkles size={22} color="#4285F4" />
                </div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, fontFamily: T.display, color: T.textPrimary }}>JPE AI Assistant</div>
              <p style={{ fontSize: 12, color: T.textTertiary, marginTop: 4 }}>Powered by Google Gemini with Sims 4 modding domain expertise</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {aiCapabilities.map((cap, i) => {
                const Icon = cap.icon;
                return (
                  <button key={i}
                    onClick={() => { setInput(cap.prompt); setActiveTab("chat"); }}
                    className="rounded-xl p-4 text-left transition-all"
                    style={{ background: T.bgGlass, border: `1px solid ${T.border}` }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = cap.color + "40"; e.currentTarget.style.background = `${cap.color}06`; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.bgGlass; }}
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${cap.color}15` }}>
                        <Icon size={15} color={cap.color} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: T.textPrimary }}>{cap.label}</span>
                    </div>
                    <p style={{ fontSize: 11, color: T.textTertiary, lineHeight: 1.5 }}>{cap.desc}</p>
                  </button>
                );
              })}
            </div>
            <div className="rounded-xl p-4" style={{ background: "rgba(66,133,244,0.08)", border: "1px solid rgba(66,133,244,0.2)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Zap size={13} color="#4285F4" />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#90CDF4" }}>Context-Aware via Gemini</span>
              </div>
              <p style={{ fontSize: 11, color: T.textSecondary, lineHeight: 1.6 }}>
                The AI Assistant uses Google Gemini's long context window to reason about your full project including
                file tree, open tabs, translation state, mod dependencies, and conflict reports. Switch models above
                to balance speed vs. depth.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Chat ── */}
      {activeTab === "chat" && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" onClick={() => setModelPickerOpen(false)}>
            {messages.map((msg, msgIdx) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: dur.normal, delay: msgIdx < 5 ? msgIdx * 0.03 : 0, ease: easing.outStandard }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[88%] ${msg.role === "system" ? "w-full" : ""}`}>

                  {/* System message */}
                  {msg.role === "system" && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${T.borderSubtle}` }}>
                      <GlowDot color={T.emerald} />
                      <span style={{ fontSize: 11, color: T.textMuted }}>{msg.content}</span>
                      <span className="ml-auto flex-shrink-0" style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>{msg.timestamp}</span>
                    </div>
                  )}

                  {/* User message */}
                  {msg.role === "user" && (
                    <div className="rounded-2xl rounded-tr-sm px-4 py-2.5" style={{ background: `linear-gradient(135deg, ${T.cyan}15, ${T.violet}10)`, border: `1px solid ${T.borderActive}` }}>
                      <p style={{ fontSize: 12, color: T.textPrimary, lineHeight: 1.5 }}>{msg.content}</p>
                      <div className="flex justify-end mt-1">
                        <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>{msg.timestamp}</span>
                      </div>
                    </div>
                  )}

                  {/* Assistant message */}
                  {msg.role === "assistant" && (
                    <div className="rounded-2xl rounded-tl-sm overflow-hidden" style={{ background: T.bgGlass, border: `1px solid ${msg.error ? T.rose + "40" : T.border}` }}>
                      {/* Header */}
                      <div className="flex items-center gap-2 px-4 py-2" style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
                        <Sparkles size={11} color={msg.error ? T.rose : "#4285F4"} />
                        <span style={{ fontSize: 10, fontWeight: 700, color: msg.error ? T.rose : "#90CDF4" }}>Gemini</span>
                        {msg.model && !msg.streaming && (
                          <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>{msg.model}</span>
                        )}
                        {msg.streaming && (
                          <div className="flex items-center gap-1">
                            {[0, 1, 2].map(i => (
                              <div key={i} className="w-1 h-1 rounded-full animate-bounce" style={{ background: "#4285F4", animationDelay: `${i * 150}ms`, animationDuration: "800ms" }} />
                            ))}
                          </div>
                        )}
                        <span className="ml-auto" style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>{msg.timestamp}</span>
                      </div>

                      {/* Body */}
                      <div className="px-4 py-3">
                        {/* Streamed / static content */}
                        {msg.content && (
                          <div style={{ fontSize: 12, color: msg.error ? T.rose : T.textSecondary, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                            {msg.content}
                            {msg.streaming && (
                              <span className="inline-block w-0.5 h-3 ml-0.5 animate-pulse" style={{ background: "#4285F4", verticalAlign: "text-bottom" }} />
                            )}
                          </div>
                        )}

                        {/* Code block */}
                        {msg.codeBlock && !msg.streaming && (
                          <div className="mt-3 rounded-xl overflow-hidden" style={{ border: `1px solid ${T.border}` }}>
                            <div className="flex items-center justify-between px-3 py-1.5" style={{ background: T.bgSurface, borderBottom: `1px solid ${T.border}` }}>
                              <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted, textTransform: "uppercase" }}>{msg.codeBlock.language}</span>
                              <button onClick={() => copyCode(msg.id, msg.codeBlock!.code)} className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-white/5">
                                {copiedId === msg.id ? <CheckCircle2 size={10} color={T.emerald} /> : <Copy size={10} color={T.textMuted} />}
                                <span style={{ fontSize: 9, color: copiedId === msg.id ? T.emerald : T.textMuted }}>
                                  {copiedId === msg.id ? "Copied" : "Copy"}
                                </span>
                              </button>
                            </div>
                            <pre className="p-3 overflow-x-auto" style={{ fontSize: 11, fontFamily: T.mono, color: T.emerald, background: T.bgDeep, lineHeight: 1.6, margin: 0 }}>
                              {msg.codeBlock.code}
                            </pre>
                          </div>
                        )}

                        {/* Suggestions */}
                        {msg.suggestions && !msg.streaming && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {msg.suggestions.map((s, i) => (
                              <button key={i} onClick={() => setInput(s)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors hover:bg-white/5"
                                style={{ fontSize: 10, color: T.cyan, background: T.cyanDim, border: `1px solid ${T.borderActive}` }}>
                                <ChevronRight size={9} />{s}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="flex-shrink-0 px-4 py-3" style={{ borderTop: `1px solid ${T.border}`, background: T.bgPanel }}>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center rounded-xl overflow-hidden" style={{ background: T.bgInput, border: `1px solid ${streaming ? "rgba(66,133,244,0.3)" : T.borderSubtle}` }}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder={hasKey ? "Ask Gemini about translations, conflicts, tuning…" : "Demo mode — add API key in Setup tab for real responses"}
                  className="flex-1 px-4 py-2.5 bg-transparent outline-none"
                  style={{ fontSize: 12, fontFamily: T.sans, color: T.textPrimary }}
                  disabled={streaming}
                />
                {streaming ? (
                  <button onClick={stopStreaming} className="px-3 py-2 transition-colors">
                    <X size={14} color={T.rose} />
                  </button>
                ) : (
                  <button onClick={handleSend} disabled={!input.trim()}
                    className="px-3 py-2 transition-colors"
                    style={{ opacity: input.trim() ? 1 : 0.35 }}>
                    <Send size={14} color="#4285F4" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              <span style={{ fontSize: 9, color: T.textDim, flexShrink: 0 }}>Quick:</span>
              {[
                "Translate current file to JPE",
                "Scan for mod conflicts",
                "Generate STBL entries",
                "Explain this tuning error",
              ].map((q, i) => (
                <button key={i} onClick={() => setInput(q)}
                  className="px-2 py-0.5 rounded-md transition-colors hover:bg-white/5 flex-shrink-0"
                  style={{ fontSize: 9, color: T.textMuted, background: "rgba(255,255,255,0.03)", border: `1px solid ${T.borderSubtle}` }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

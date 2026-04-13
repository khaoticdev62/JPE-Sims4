"use client";

import { useState } from "react";
import {
  Settings, Globe, Code2, Sparkles, Rocket,
  Palette, Shield, Database, Terminal, Keyboard, Bell,
  CheckCircle2, RotateCcw, Save, Image, Gauge,
  type LucideIcon,
} from "lucide-react";
import { T } from "./robust/jpe-theme";
import { Eyebrow, Badge } from "./robust/jpe-shared";
import {
  motion, AnimatePresence, FadeIn, StaggerList, StaggerItem,
} from "./jpe-motion";
import { useJpeSettings, type WallpaperPreset } from "./jpe-settings-context";
import { KeybindingsSection } from "./KeyboardShortcuts";
import { jpeColorThemes } from "./jpe-themes";
import { JpeButton } from "./jpe-design-system";
import { useUIStore } from "@/stores/useUIStore";

interface SettingSection {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

const sections: SettingSection[] = [
  { id: "general", label: "General", icon: Settings, color: T.textTertiary },
  { id: "editor", label: "Editor", icon: Code2, color: T.cyan },
  { id: "theme", label: "Appearance & Wallpaper", icon: Palette, color: T.cyanBright },
  { id: "translation", label: "Translation", icon: Globe, color: T.violet },
  { id: "ai", label: "AI Engine", icon: Sparkles, color: T.violetBright },
  { id: "security", label: "Security & Privacy", icon: Shield, color: T.emerald },
  { id: "build", label: "Build Pipeline", icon: Rocket, color: T.amber },
  { id: "analysis", label: "Analysis", icon: Sparkles, color: T.cyan },
  { id: "data", label: "Data & Storage", icon: Database, color: T.cyanDeep },
  { id: "terminal", label: "Console", icon: Terminal, color: T.rose },
  { id: "keybindings", label: "Keybindings", icon: Keyboard, color: T.amber },
  { id: "notifications", label: "Notifications", icon: Bell, color: T.textSecondary },
];

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} className="relative flex-shrink-0"
      style={{ width: 36, height: 20, borderRadius: 10, background: value ? T.emerald : "rgba(255,255,255,0.08)", transition: "background 0.2s", border: `1px solid ${value ? "rgba(72,187,120,0.3)" : T.borderSubtle}` }}>
      <motion.div
        className="absolute top-0.5 rounded-full"
        animate={{ left: value ? 17 : 2 }}
        transition={{ type: "spring", stiffness: 520, damping: 35 }}
        style={{
          width: 16, height: 16,
          background: value ? "#fff" : T.textMuted,
          boxShadow: value ? `0 0 6px ${T.emerald}50` : "none",
        }}
      />
    </button>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 px-1" style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
      <div className="flex-1 min-w-0 mr-4">
        <div style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary }}>{label}</div>
        {description && <div style={{ fontSize: 10, color: T.textMuted, marginTop: 2, lineHeight: 1.4 }}>{description}</div>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function SelectInput({ value, options, onChange }: { value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="px-2 py-1.5 rounded-lg outline-none cursor-pointer"
      style={{ fontSize: 11, fontFamily: T.mono, color: T.textSecondary, background: "rgba(255,255,255,0.04)", border: `1px solid ${T.borderSubtle}`, minWidth: 140 }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

/* ── Slider widget ── */
function Slider({ value, min, max, step, onChange, label }: {
  value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; label?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex items-center gap-3" style={{ minWidth: 200 }}>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${T.cyan} ${pct}%, rgba(255,255,255,0.08) ${pct}%)`,
          accentColor: T.cyan,
        }} />
      <span style={{ fontSize: 11, fontFamily: T.mono, color: T.textSecondary, minWidth: 36, textAlign: "right" }}>
        {label || value}
      </span>
    </div>
  );
}

/* ── Wallpaper preset card ── */
const wallpaperPresets: { id: WallpaperPreset; label: string; desc: string; gradient: string }[] = [
  { id: "none", label: "None", desc: "Solid dark background", gradient: `linear-gradient(135deg, ${T.bg}, ${T.bgPanel})` },
  { id: "particles", label: "Particles", desc: "Floating neon orbs", gradient: `linear-gradient(135deg, ${T.bgDeep}, ${T.violet}30, ${T.cyan}20)` },
  { id: "grid", label: "Cyber Grid", desc: "Perspective grid with glow", gradient: `linear-gradient(135deg, ${T.bgDeep}, ${T.cyan}25, ${T.violet}15)` },
  { id: "aurora", label: "Aurora", desc: "Ethereal gradient waves", gradient: `linear-gradient(135deg, ${T.violet}30, ${T.cyan}20, ${T.emerald}20)` },
  { id: "matrix", label: "Matrix Rain", desc: "Digital rain canvas effect", gradient: `linear-gradient(135deg, ${T.bgDeep}, ${T.emerald}20, ${T.cyan}15)` },
  { id: "custom", label: "Custom URL", desc: "Your own wallpaper image", gradient: `linear-gradient(135deg, ${T.bgSurface}, ${T.amber}15, ${T.rose}15)` },
];

export function SettingsView({ onRestartTutorial }: { onRestartTutorial?: () => void }) {
  const [activeSection, setActiveSection] = useState("general");
  const { settings: global, update: updateGlobal, reset: resetGlobal } = useJpeSettings();
  const { setHasCompletedTour, setTourOpen, setTutorialActive, setTutorialStep } = useUIStore();
  const [securityStatus, setSecurityStatus] = useState<{ isShielded: boolean; algorithm: string; provider: string } | null>(null);

  /* Fetch security status */
  useState(() => {
    if (typeof window !== 'undefined' && window.electron?.security?.vault) {
      window.electron.security.vault.status().then(res => {
        if (res.success) setSecurityStatus(res);
      });
    }
    return undefined;
  });
  const sidebarW = Math.round(220 / Math.max(global.fontScale, 1));

  /* ── Local editor/project settings ── */
  const [settings, setSettings] = useState({
    autoSave: true, autoSaveDelay: "1000",
    theme: "cyberpunk-dark", fontSize: "13", fontFamily: "JetBrains Mono",
    tabSize: "2", wordWrap: false, minimap: true, lineNumbers: true, bracketPairs: true,
    aiModel: "gpt-4o", aiConfidenceThreshold: "85", aiAutoSuggest: true, aiContextSize: "8000",
    translationEngine: "jpe-native", targetLocales: "ja_JP, de_DE, fr_FR, ko_KR",
    buildAutorun: false, buildOptimize: true, buildParallel: true, buildOutputDir: "build/",
    showNotifications: true, soundEffects: false,
    conflictSeverity: "warning", analysisOnSave: true,
    storageLocation: "~/Documents/JPE_Studio/", cacheSize: "512",
    consoleFontSize: "12", consoleScrollback: "1000",
  });
  const [saved, setSaved] = useState(false);

  const update = (key: string, value: any) => setSettings(prev => ({ ...prev, [key]: value }));

  const resetDefaults = () => {
    setSettings({
      autoSave: true, autoSaveDelay: "1000",
      theme: "cyberpunk-dark", fontSize: "13", fontFamily: "JetBrains Mono",
      tabSize: "2", wordWrap: false, minimap: true, lineNumbers: true, bracketPairs: true,
      aiModel: "gpt-4o", aiConfidenceThreshold: "85", aiAutoSuggest: true, aiContextSize: "8000",
      translationEngine: "jpe-native", targetLocales: "ja_JP, de_DE, fr_FR, ko_KR",
      buildAutorun: false, buildOptimize: true, buildParallel: true, buildOutputDir: "build/",
      showNotifications: true, soundEffects: false,
      conflictSeverity: "warning", analysisOnSave: true,
      storageLocation: "~/Documents/JPE_Studio/", cacheSize: "512",
      consoleFontSize: "12", consoleScrollback: "1000",
    });
    resetGlobal();
  };

  const saveAll = () => { setSaved(true); setTimeout(() => setSaved(false), 1500); };

  const renderSection = () => {
    switch (activeSection) {
      case "general":
        return (
          <>
            <SettingRow label="Auto Save" description="Automatically save files after changes">
              <Toggle value={settings.autoSave} onChange={v => update("autoSave", v)} />
            </SettingRow>
            <SettingRow label="Auto Save Delay" description="Delay in ms before auto-saving">
              <SelectInput value={settings.autoSaveDelay} onChange={v => update("autoSaveDelay", v)}
                options={[{ value: "500", label: "500ms" }, { value: "1000", label: "1s" }, { value: "2000", label: "2s" }, { value: "5000", label: "5s" }]} />
            </SettingRow>
            <SettingRow label="Sims 4 SDK Path" description="Path to the Sims 4 game installation">
              <div className="px-2 py-1 rounded-lg" style={{ fontSize: 10, fontFamily: T.mono, color: T.textMuted, background: "rgba(255,255,255,0.03)", border: `1px solid ${T.borderSubtle}` }}>
                C:\Program Files\EA\The Sims 4
              </div>
            </SettingRow>
            <SettingRow label="Mods Directory" description="Output directory for built packages">
              <div className="px-2 py-1 rounded-lg" style={{ fontSize: 10, fontFamily: T.mono, color: T.textMuted, background: "rgba(255,255,255,0.03)", border: `1px solid ${T.borderSubtle}` }}>
                ~/Documents/EA/The Sims 4/Mods
              </div>
            </SettingRow>
            <SettingRow label="Onboarding Tutorial" description="Restart the first-run guide">
              <JpeButton
                variant="secondary"
                size="sm"
                icon={Sparkles}
                onClick={() => {
                  setHasCompletedTour(false)
                  setTutorialStep(0)
                  setTutorialActive(true)
                  setTourOpen(true)
                  onRestartTutorial?.()
                }}
              >
                Restart Guide
              </JpeButton>
            </SettingRow>
          </>
        );
      case "editor":
        return (
          <>
            <SettingRow label="Font Size" description="Editor font size in pixels">
              <SelectInput value={settings.fontSize} onChange={v => update("fontSize", v)}
                options={[{ value: "11", label: "11px" }, { value: "12", label: "12px" }, { value: "13", label: "13px" }, { value: "14", label: "14px" }, { value: "16", label: "16px" }]} />
            </SettingRow>
            <SettingRow label="Font Family" description="Editor monospace font">
              <SelectInput value={settings.fontFamily} onChange={v => update("fontFamily", v)}
                options={[{ value: "JetBrains Mono", label: "JetBrains Mono" }, { value: "Fira Code", label: "Fira Code" }, { value: "Cascadia Code", label: "Cascadia Code" }, { value: "Source Code Pro", label: "Source Code Pro" }]} />
            </SettingRow>
            <SettingRow label="Tab Size" description="Number of spaces per tab">
              <SelectInput value={settings.tabSize} onChange={v => update("tabSize", v)}
                options={[{ value: "2", label: "2 spaces" }, { value: "4", label: "4 spaces" }, { value: "8", label: "8 spaces" }]} />
            </SettingRow>
            <SettingRow label="Word Wrap"><Toggle value={settings.wordWrap} onChange={v => update("wordWrap", v)} /></SettingRow>
            <SettingRow label="Minimap"><Toggle value={settings.minimap} onChange={v => update("minimap", v)} /></SettingRow>
            <SettingRow label="Line Numbers"><Toggle value={settings.lineNumbers} onChange={v => update("lineNumbers", v)} /></SettingRow>
            <SettingRow label="Bracket Pair Colorization"><Toggle value={settings.bracketPairs} onChange={v => update("bracketPairs", v)} /></SettingRow>
          </>
        );
      case "ai":
        return (
          <>
            <SettingRow label="AI Model" description="The language model used for AI features">
              <SelectInput value={settings.aiModel} onChange={v => update("aiModel", v)}
                options={[{ value: "gpt-4o", label: "GPT-4o" }, { value: "gpt-4-turbo", label: "GPT-4 Turbo" }, { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" }, { value: "claude-3", label: "Claude 3 Opus" }]} />
            </SettingRow>
            <SettingRow label="Confidence Threshold" description="Minimum confidence % for auto-accept">
              <SelectInput value={settings.aiConfidenceThreshold} onChange={v => update("aiConfidenceThreshold", v)}
                options={[{ value: "70", label: "70%" }, { value: "80", label: "80%" }, { value: "85", label: "85%" }, { value: "90", label: "90%" }, { value: "95", label: "95%" }]} />
            </SettingRow>
            <SettingRow label="Auto-Suggest" description="Show AI suggestions as you type">
              <Toggle value={settings.aiAutoSuggest} onChange={v => update("aiAutoSuggest", v)} />
            </SettingRow>
            <SettingRow label="Context Window" description="Max tokens sent as context to AI">
              <SelectInput value={settings.aiContextSize} onChange={v => update("aiContextSize", v)}
                options={[{ value: "4000", label: "4K tokens" }, { value: "8000", label: "8K tokens" }, { value: "16000", label: "16K tokens" }, { value: "32000", label: "32K tokens" }]} />
            </SettingRow>
          </>
        );
      case "security":
        return (
          <>
            <div className="mb-6 p-4 rounded-xl border relative overflow-hidden" style={{ background: T.bgGlass, borderColor: (securityStatus as any)?.isShielded ? `${T.emerald}30` : T.borderSubtle }}>
              {/* Pulse indicator */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ 
                  background: (securityStatus as any)?.isShielded ? T.emerald : T.amber,
                  boxShadow: `0 0 12px ${(securityStatus as any)?.isShielded ? T.emerald : T.amber}` 
                }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: (securityStatus as any)?.isShielded ? T.emerald : T.amber, letterSpacing: '0.05em' }}>
                  {(securityStatus as any)?.isShielded ? "LIVE SHIELD ACTIVE" : "PROTECTION LIMITED"}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg" style={{ background: (securityStatus as any)?.isShielded ? `${T.emerald}15` : 'rgba(255,255,255,0.05)' }}>
                  <Shield size={24} color={(securityStatus as any)?.isShielded ? T.emerald : T.textMuted} />
                </div>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary }}>Industrial AES-256 Vault</h3>
                  <p style={{ fontSize: 10, color: T.textMuted }}>Hardware-bound cryptographic infrastructure</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.borderSubtle}` }}>
                  <div style={{ fontSize: 9, color: T.textDim, marginBottom: 4 }}>ENCRYPTION STANDARD</div>
                  <div style={{ fontSize: 12, fontFamily: T.mono, fontWeight: 700, color: T.cyan }}>{(securityStatus as any)?.algorithm || 'AES-256-GCM'}</div>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.borderSubtle}` }}>
                  <div style={{ fontSize: 9, color: T.textDim, marginBottom: 4 }}>KEY DERIVATION</div>
                  <div style={{ fontSize: 11, fontFamily: T.mono, fontWeight: 700, color: T.violet }}>Hardware ID (Sealed)</div>
                </div>
              </div>

              <p className="mt-4" style={{ fontSize: 10, color: T.textMuted, lineHeight: 1.5 }}>
                Your data is encrypted at rest using a machine-specific entropy key. Configuration files copied to other devices will be 
                unreadable, ensuring industrial-grade local security.
              </p>
            </div>

            <SettingRow label="Clear Sensitive Data" description="Wipe all API keys and encrypted preferences">
              <JpeButton variant="danger" size="sm" onClick={() => {
                if (confirm("Are you sure? This will wipe all AI keys and local settings.")) {
                  resetGlobal();
                }
              }}>
                Wipe Vault
              </JpeButton>
            </SettingRow>
          </>
        );
      case "translation":
        return (
          <>
            <SettingRow label="Translation Engine" description="The engine used for JPE translations">
              <SelectInput value={settings.translationEngine} onChange={v => update("translationEngine", v)}
                options={[{ value: "jpe-native", label: "JPE Native" }, { value: "stbl-direct", label: "STBL Direct" }, { value: "hybrid", label: "Hybrid Mode" }]} />
            </SettingRow>
            <SettingRow label="Target Locales" description="Comma-separated list of target locales">
              <input value={settings.targetLocales} onChange={e => update("targetLocales", e.target.value)}
                className="px-2 py-1.5 rounded-lg outline-none"
                style={{ fontSize: 10, fontFamily: T.mono, color: T.textSecondary, background: "rgba(255,255,255,0.04)", border: `1px solid ${T.borderSubtle}`, width: 220 }} />
            </SettingRow>
          </>
        );
      case "build":
        return (
          <>
            <SettingRow label="Auto Build" description="Automatically build on file save">
              <Toggle value={settings.buildAutorun} onChange={v => update("buildAutorun", v)} />
            </SettingRow>
            <SettingRow label="Optimize Output" description="Apply minification and compression">
              <Toggle value={settings.buildOptimize} onChange={v => update("buildOptimize", v)} />
            </SettingRow>
            <SettingRow label="Parallel Build" description="Use multiple threads for building">
              <Toggle value={settings.buildParallel} onChange={v => update("buildParallel", v)} />
            </SettingRow>
            <SettingRow label="Output Directory" description="Where built packages are placed">
              <div className="px-2 py-1 rounded-lg" style={{ fontSize: 10, fontFamily: T.mono, color: T.textMuted, background: "rgba(255,255,255,0.03)", border: `1px solid ${T.borderSubtle}` }}>
                {settings.buildOutputDir}
              </div>
            </SettingRow>
          </>
        );

      /* ════════════════════════════════════════════════════════════
         APPEARANCE & WALLPAPER  (uses global context)
         ════════════════════════════════════════════════════════════ */
      case "theme":
        return (
          <>
            {/* ══════ COLOR THEME ══════ */}
            <div className="py-4" style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
              <div className="flex items-center gap-2 mb-1">
                <Palette size={13} color={T.cyanBright} />
                <Eyebrow color={T.textPrimary}>COLOR THEME</Eyebrow>
                <span className="px-1.5 py-0.5 rounded" style={{ fontSize: 8, fontWeight: 700, color: T.cyan, background: T.cyanDim, letterSpacing: "0.06em" }}>NEW</span>
              </div>
              <p style={{ fontSize: 10, color: T.textMuted, lineHeight: 1.4, marginBottom: 14 }}>
                Choose a cyberpunk accent palette. The primary and secondary colors affect the IDE chrome,
                drag handles, and active indicators throughout the workspace.
              </p>
              <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
                {jpeColorThemes.map(theme => {
                  const isActive = global.colorTheme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => updateGlobal("colorTheme", theme.id)}
                      className="flex items-start gap-3 p-3.5 rounded-xl text-left transition-all relative overflow-hidden"
                      style={{
                        background: isActive ? `${theme.swatches[0]}0a` : "rgba(255,255,255,0.015)",
                        border: `1.5px solid ${isActive ? `${theme.swatches[0]}45` : T.borderSubtle}`,
                        boxShadow: isActive ? `0 0 20px ${theme.swatches[0]}10` : "none",
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
                      {/* Chromatic strip */}
                      <div className="absolute top-0 left-0 right-0 h-0.5" style={{
                        background: isActive
                          ? `linear-gradient(90deg, ${theme.swatches[0]}, ${theme.swatches[1]})`
                          : "transparent",
                        transition: "background 0.2s",
                      }} />
                      {/* Swatches */}
                      <div className="flex flex-col gap-1 flex-shrink-0 mt-0.5">
                        {theme.swatches.map((color, i) => (
                          <div key={i} className="w-4 h-4 rounded-md border" style={{
                            background: color,
                            borderColor: "rgba(255,255,255,0.1)",
                            boxShadow: isActive ? `0 0 6px ${color}40` : "none",
                          }} />
                        ))}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span style={{ fontSize: 12, fontWeight: 700, color: isActive ? theme.swatches[0] : T.textPrimary }}>{theme.name}</span>
                          {isActive && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-4 h-4 rounded-full flex items-center justify-center"
                              style={{ background: theme.swatches[0] }}
                            >
                              <CheckCircle2 size={10} color="#fff" />
                            </motion.div>
                          )}
                        </div>
                        <p style={{ fontSize: 10, color: T.textMuted, lineHeight: 1.4 }}>{theme.description}</p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <div className="w-12 h-1 rounded-full" style={{ background: `linear-gradient(90deg, ${theme.swatches[0]}, ${theme.swatches[1]})` }} />
                          <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textDim }}>by {theme.author}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Current theme live preview */}
              <div className="mt-4 rounded-xl p-4 relative overflow-hidden" style={{ background: T.bgGlass, border: `1px solid ${T.border}` }}>
                <div className="absolute top-0 left-0 right-0 h-px" style={{
                  background: `linear-gradient(90deg, transparent, ${jpeColorThemes.find(t => t.id === global.colorTheme)?.swatches[0] ?? T.cyan}60, transparent)`,
                }} />
                <Eyebrow color={T.textMuted}>LIVE PREVIEW — {jpeColorThemes.find(t => t.id === global.colorTheme)?.name ?? "Obsidian Crystal"}</Eyebrow>
                <div className="mt-3 flex items-center gap-3">
                  {(() => {
                    const theme = jpeColorThemes.find(t => t.id === global.colorTheme);
                    if (!theme) return null;
                    return (
                      <>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: `${theme.swatches[0]}12`, border: `1px solid ${theme.swatches[0]}30` }}>
                          <div className="w-2 h-2 rounded-full" style={{ background: theme.swatches[0], boxShadow: `0 0 6px ${theme.swatches[0]}60` }} />
                          <span style={{ fontSize: 11, fontFamily: T.mono, fontWeight: 600, color: theme.swatches[0] }}>Primary</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: `${theme.swatches[1]}12`, border: `1px solid ${theme.swatches[1]}30` }}>
                          <div className="w-2 h-2 rounded-full" style={{ background: theme.swatches[1], boxShadow: `0 0 6px ${theme.swatches[1]}60` }} />
                          <span style={{ fontSize: 11, fontFamily: T.mono, fontWeight: 600, color: theme.swatches[1] }}>Secondary</span>
                        </div>
                        <div className="flex-1 px-3 py-1.5 rounded-lg" style={{ background: T.bgDeep, border: `1px solid ${T.border}` }}>
                          <span style={{ fontSize: 11, fontFamily: T.mono, color: theme.swatches[0] }}>interaction </span>
                          <span style={{ fontSize: 11, fontFamily: T.mono, color: theme.swatches[1] }}>hug_friend</span>
                          <span style={{ fontSize: 11, fontFamily: T.mono, color: T.textMuted }}> {"{"}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* ── GLOBAL UI SCALE / FONT SIZE ── */}
            <div className="py-4" style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
              <div className="flex items-center gap-2 mb-1">
                <Gauge size={13} color={T.cyan} />
                <Eyebrow color={T.textPrimary}>GLOBAL UI SCALE</Eyebrow>
              </div>
              <p style={{ fontSize: 10, color: T.textMuted, lineHeight: 1.4, marginBottom: 10 }}>
                Adjusts the overall size of all text and UI elements across the entire IDE.
              </p>
              <Slider
                value={global.fontScale}
                min={0.85} max={1.6} step={0.05}
                onChange={v => updateGlobal("fontScale", v)}
                label={`${Math.round(global.fontScale * 100)}%`}
              />
              <div className="flex items-center justify-between mt-2">
                <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>85%</span>
                <div className="flex items-center gap-2">
                  {[0.85, 1.0, 1.15, 1.3, 1.5].map(v => (
                    <button key={v} onClick={() => updateGlobal("fontScale", v)}
                      className="px-2 py-0.5 rounded-md transition-colors"
                      style={{
                        fontSize: 9, fontFamily: T.mono, fontWeight: global.fontScale === v ? 700 : 500,
                        color: global.fontScale === v ? T.cyan : T.textDim,
                        background: global.fontScale === v ? T.cyanDim : "transparent",
                        border: `1px solid ${global.fontScale === v ? `${T.cyan}30` : "transparent"}`,
                      }}>
                      {Math.round(v * 100)}%
                    </button>
                  ))}
                </div>
                <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>160%</span>
              </div>
              {/* Live preview */}
              <div className="mt-4 rounded-xl p-3" style={{ background: T.bgGlass, border: `1px solid ${T.border}` }}>
                <Eyebrow color={T.textMuted}>PREVIEW</Eyebrow>
                <p className="mt-2" style={{ fontSize: 12 * global.fontScale, color: T.textPrimary, lineHeight: 1.5 }}>
                  The quick brown fox jumps over the lazy dog.
                </p>
                <code className="block mt-1" style={{ fontSize: 11 * global.fontScale, fontFamily: T.mono, color: T.cyan }}>
                  {"trait Evil { buff_Evil_Sims4 }"}
                </code>
              </div>
            </div>

            {/* ── UI Options ── */}
            <SettingRow label="Frosted Glass Panels" description="Apply blur effect to translucent panels">
              <Toggle value={global.uiBlur} onChange={v => updateGlobal("uiBlur", v)} />
            </SettingRow>
            <SettingRow label="Code Minimap" description="Show minimap panel in the code editor">
              <Toggle value={global.minimapEnabled} onChange={v => updateGlobal("minimapEnabled", v)} />
            </SettingRow>
            <SettingRow label="Animations" description="Enable motion and transition effects">
              <Toggle value={global.animationsEnabled} onChange={v => updateGlobal("animationsEnabled", v)} />
            </SettingRow>
            <SettingRow label="Compact Mode" description="Tighter spacing for smaller displays">
              <Toggle value={global.compactMode} onChange={v => updateGlobal("compactMode", v)} />
            </SettingRow>

            {/* ════ LIVE WALLPAPER ════ */}
            <div className="py-4">
              <div className="flex items-center gap-2 mb-1">
                <Image size={13} color={T.violet} />
                <Eyebrow color={T.textPrimary}>LIVE WALLPAPER</Eyebrow>
              </div>
              <p style={{ fontSize: 10, color: T.textMuted, lineHeight: 1.4, marginBottom: 12 }}>
                Choose an animated background rendered behind all workspace panels.
              </p>

              {/* Preset grid */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {wallpaperPresets.map(p => {
                  const isActive = global.wallpaper === p.id;
                  return (
                    <button key={p.id} onClick={() => updateGlobal("wallpaper", p.id)}
                      className="rounded-xl p-2.5 text-left transition-all relative overflow-hidden"
                      style={{
                        background: p.gradient,
                        border: `1.5px solid ${isActive ? T.cyan : T.borderSubtle}`,
                        boxShadow: isActive ? `0 0 12px ${T.cyan}30` : "none",
                      }}>
                      {isActive && (
                        <motion.div layoutId="wallpaper-indicator"
                          className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                          style={{ background: T.cyan }}
                          transition={{ type: "spring", stiffness: 520, damping: 35 }}>
                          <CheckCircle2 size={10} color="#fff" />
                        </motion.div>
                      )}
                      <span className="block" style={{ fontSize: 11, fontWeight: 700, color: isActive ? T.textPrimary : T.textSecondary }}>{p.label}</span>
                      <span className="block mt-0.5" style={{ fontSize: 9, color: T.textMuted }}>{p.desc}</span>
                    </button>
                  );
                })}
              </div>

              {/* Wallpaper opacity */}
              <SettingRow label="Wallpaper Opacity" description="How visible the animated background is">
                <Slider
                  value={global.wallpaperOpacity}
                  min={5} max={80} step={5}
                  onChange={v => updateGlobal("wallpaperOpacity", v)}
                  label={`${global.wallpaperOpacity}%`}
                />
              </SettingRow>

              {/* Animation speed */}
              <SettingRow label="Animation Speed" description="Speed multiplier for wallpaper animations">
                <Slider
                  value={global.wallpaperSpeed}
                  min={0.25} max={3} step={0.25}
                  onChange={v => updateGlobal("wallpaperSpeed", v)}
                  label={`${global.wallpaperSpeed}x`}
                />
              </SettingRow>

              {/* Custom URL input */}
              {global.wallpaper === "custom" && (
                <div className="mt-3">
                  <Eyebrow color={T.textMuted}>CUSTOM WALLPAPER URL</Eyebrow>
                  <input
                    value={global.customWallpaperUrl}
                    onChange={e => updateGlobal("customWallpaperUrl", e.target.value)}
                    placeholder="https://example.com/wallpaper.jpg"
                    className="w-full mt-2 px-3 py-2 rounded-lg outline-none"
                    style={{
                      fontSize: 11, fontFamily: T.mono, color: T.textSecondary,
                      background: "rgba(255,255,255,0.04)", border: `1px solid ${T.borderSubtle}`,
                    }}
                  />
                  <p className="mt-1.5" style={{ fontSize: 9, color: T.textDim, lineHeight: 1.4 }}>
                    Supports JPG, PNG, or WebP image URLs. Image will be darkened and desaturated for readability.
                  </p>
                </div>
              )}
            </div>
          </>
        );
      case "analysis":
        return (
          <>
            <SettingRow label="Conflict Severity" description="Default conflict reporting level">
              <SelectInput value={settings.conflictSeverity} onChange={v => update("conflictSeverity", v)}
                options={[{ value: "info", label: "Info" }, { value: "warning", label: "Warning" }, { value: "error", label: "Error" }]} />
            </SettingRow>
            <SettingRow label="Analyze on Save" description="Run analysis when files are saved">
              <Toggle value={settings.analysisOnSave} onChange={v => update("analysisOnSave", v)} />
            </SettingRow>
          </>
        );
      case "notifications":
        return (
          <>
            <SettingRow label="Show Notifications"><Toggle value={settings.showNotifications} onChange={v => update("showNotifications", v)} /></SettingRow>
            <SettingRow label="Sound Effects"><Toggle value={settings.soundEffects} onChange={v => update("soundEffects", v)} /></SettingRow>
          </>
        );
      case "data":
        return (
          <>
            <SettingRow label="Storage Location" description="Where JPE Studio stores project data">
              <div className="px-2 py-1 rounded-lg" style={{ fontSize: 10, fontFamily: T.mono, color: T.textMuted, background: "rgba(255,255,255,0.03)", border: `1px solid ${T.borderSubtle}` }}>
                {settings.storageLocation}
              </div>
            </SettingRow>
            <SettingRow label="Cache Size" description="Maximum disk cache in MB">
              <SelectInput value={settings.cacheSize} onChange={v => update("cacheSize", v)}
                options={[{ value: "256", label: "256 MB" }, { value: "512", label: "512 MB" }, { value: "1024", label: "1 GB" }, { value: "2048", label: "2 GB" }]} />
            </SettingRow>
          </>
        );
      case "terminal":
        return (
          <>
            <SettingRow label="Console Font Size" description="Font size for diagnostics console">
              <SelectInput value={settings.consoleFontSize} onChange={v => update("consoleFontSize", v)}
                options={[{ value: "10", label: "10px" }, { value: "11", label: "11px" }, { value: "12", label: "12px" }, { value: "13", label: "13px" }, { value: "14", label: "14px" }]} />
            </SettingRow>
            <SettingRow label="Scrollback Buffer" description="Maximum number of log lines to retain">
              <SelectInput value={settings.consoleScrollback} onChange={v => update("consoleScrollback", v)}
                options={[{ value: "500", label: "500 lines" }, { value: "1000", label: "1,000 lines" }, { value: "5000", label: "5,000 lines" }, { value: "10000", label: "10,000 lines" }]} />
            </SettingRow>
          </>
        );
      case "keybindings":
        return <KeybindingsSection />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p style={{ fontSize: 12, color: T.textMuted }}>Select a category from the sidebar</p>
          </div>
        );
    }
  };

  const activeInfo = sections.find(s => s.id === activeSection)!;

  return (
    <div className="flex flex-col h-full" style={{ background: T.bgDeep }}>
      {/* Toolbar */}
      <FadeIn y={-8}>
      <div className="flex items-center justify-between px-4 py-1.5 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgPanel }}>
        <div className="flex items-center gap-3">
          <Settings size={14} color={T.textTertiary} />
          <Eyebrow color={T.textPrimary}>SETTINGS</Eyebrow>
          <div className="w-px h-4" style={{ background: T.border }} />
          <Badge color={T.textMuted} bg="rgba(255,255,255,0.04)">JPE Studio v4.2.0</Badge>
        </div>
        <div className="flex items-center gap-2">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg"
            style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${T.borderSubtle}`, fontSize: 11, color: T.textMuted }}
            onClick={resetDefaults}>
            <RotateCcw size={11} /> Reset Defaults
          </motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg"
            style={{ background: saved ? T.emerald : T.emeraldDim, border: `1px solid rgba(72,187,120,0.2)`, fontSize: 11, fontWeight: 600, color: saved ? "#fff" : T.emerald }}
            onClick={saveAll}>
            <Save size={11} /> {saved ? "Saved!" : "Save All"}
          </motion.button>
        </div>
      </div>
      </FadeIn>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <div className="flex flex-col flex-shrink-0" style={{ width: sidebarW, borderRight: `1px solid ${T.border}`, background: T.bgPanel }}>
          <StaggerList className="flex-1 overflow-y-auto py-2">
            {sections.map(s => {
              const isActive = s.id === activeSection;
              const Icon = s.icon;
              return (
                <StaggerItem key={s.id}>
                <button onClick={() => setActiveSection(s.id)}
                  className="w-full flex items-center gap-2.5 px-4 py-2 transition-colors text-left relative"
                  style={{
                    background: isActive ? `${s.color}10` : "transparent",
                    color: isActive ? T.textPrimary : T.textTertiary,
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = T.bgHover; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = isActive ? `${s.color}10` : "transparent"; }}>
                  {isActive && (
                    <motion.div
                      layoutId="settings-tab-indicator"
                      className="absolute left-0 top-0 bottom-0 w-[2px]"
                      style={{ background: s.color, boxShadow: `0 0 6px ${s.color}50` }}
                      transition={{ type: "spring", stiffness: 520, damping: 35 }}
                    />
                  )}
                  <Icon size={13} color={isActive ? s.color : T.textMuted} />
                  <span style={{ fontSize: 12, fontWeight: isActive ? 700 : 500 }}>{s.label}</span>
                </button>
                </StaggerItem>
              );
            })}
          </StaggerList>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <activeInfo.icon size={16} color={activeInfo.color} />
                  <h2 style={{ fontSize: 16, fontWeight: 700, fontFamily: T.display, color: T.textPrimary }}>{activeInfo.label}</h2>
                </div>
                {renderSection()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

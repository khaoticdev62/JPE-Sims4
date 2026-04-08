import { useMemo } from "react";
import {
  Code2, Languages, Network, Rocket, Library, Puzzle, Bug, BarChart3,
  Sparkles, FileCode, Globe, Package, AlertTriangle, CheckCircle2,
  Activity, Cpu, Clock, GitBranch, TrendingUp, Zap, ArrowRight,
  Shield, Braces, type LucideIcon,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
} from "recharts";
import { T } from "../pages/jpe-theme";
import type { WorkspaceMode } from "../pages/jpe-theme";
import { Eyebrow, GlowDot, Badge, ProgressBar } from "../pages/jpe-shared";
import { SafeChartContainer } from "./SafeChartContainer";
import {
  motion, AnimatePresence, StaggerList, StaggerItem,
  easing, duration as dur, FadeIn,
} from "./jpe-motion";
import { useJpeSettings } from "./jpe-settings-context";
import { QuickStartChecklist } from "./OnboardingTour";

// Stable data - seeded so it doesn't change on every render
const perfData = Array.from({ length: 30 }, (_, i) => ({
  t: i, cpu: 30 + Math.sin(i * 0.4) * 18 + ((i * 7 + 3) % 8),
  mem: 50 + Math.cos(i * 0.3) * 12 + ((i * 5 + 1) % 6),
}));

const coverageData = [
  { locale: "en_US", coverage: 100 }, { locale: "ja_JP", coverage: 87 },
  { locale: "de_DE", coverage: 92 }, { locale: "fr_FR", coverage: 78 },
  { locale: "ko_KR", coverage: 65 }, { locale: "zh_CN", coverage: 71 },
];

const recentFiles = [
  { name: "S4_034AEECB_trait_Evil.xml", status: "modified", time: "2m ago", icon: FileCode, color: "#63B3ED" },
  { name: "ja_JP.stbl", status: "warning", time: "8m ago", icon: Globe, color: "#A78BFA" },
  { name: "mod_injector.ts4script", status: "modified", time: "15m ago", icon: Code2, color: "#48BB78" },
  { name: "overrides.json", status: "modified", time: "22m ago", icon: Braces, color: "#F6AD55" },
  { name: "en_US.stbl", status: "ready", time: "1h ago", icon: Globe, color: "#A78BFA" },
];

const quickActions: { label: string; icon: LucideIcon; color: string; mode: WorkspaceMode; desc: string }[] = [
  { label: "Translate Files", icon: Languages, color: T.violet, mode: "translation", desc: "Run AI translation" },
  { label: "Build Package", icon: Rocket, color: T.amber, mode: "build", desc: "Export .package" },
  { label: "Scan Conflicts", icon: Shield, color: T.emerald, mode: "conflicts", desc: "Detect issues" },
  { label: "Open Editor", icon: Code2, color: T.cyan, mode: "code", desc: "Code workspace" },
  { label: "View Graph", icon: Network, color: T.cyanDeep, mode: "depgraph", desc: "Dependency map" },
  { label: "AI Assistant", icon: Sparkles, color: T.violetBright, mode: "ai", desc: "Get AI help" },
];

const activityLog = [
  { text: "Build #4218 completed successfully", color: T.emerald, time: "2m ago", icon: CheckCircle2 },
  { text: "String table ja_JP missing 3 entries", color: T.amber, time: "5m ago", icon: AlertTriangle },
  { text: "AI translated 8 strings (91.2% avg confidence)", color: T.violet, time: "8m ago", icon: Sparkles },
  { text: "Conflict detected: WickedWhims override", color: T.rose, time: "12m ago", icon: AlertTriangle },
  { text: "Project loaded: Evil_Trait_Override", color: T.cyan, time: "15m ago", icon: CheckCircle2 },
  { text: "SDK connected: Build 1.108.329.1030", color: T.textTertiary, time: "15m ago", icon: Cpu },
];

export function DashboardView({ onNavigate }: { onNavigate: (mode: WorkspaceMode) => void }) {
  const { settings: { fontScale } } = useJpeSettings();
  // Responsive grid spans: at high zoom, widen cards to avoid cramping
  const extreme = fontScale >= 1.5;
  const high = fontScale >= 1.3;
  const spanActions = extreme ? 12 : high ? 12 : 8;
  const spanHealth = extreme ? 12 : high ? 12 : 4;
  const spanCard = extreme ? 12 : high ? 6 : 4;
  const activityCols = extreme ? 1 : 2;

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: T.bgDeep }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: dur.complex, ease: easing.outStandard }}
        className="flex items-center justify-between px-6 py-4 flex-shrink-0"
        style={{ background: T.bgPanel, borderBottom: `1px solid ${T.border}` }}
      >
        <div>
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: dur.normal, delay: 0.06, ease: easing.outStandard }}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${T.cyan}, ${T.violet})`,
                boxShadow: `0 0 20px rgba(99,179,237,0.2)`,
              }}
            >
              <Braces size={20} color="#fff" strokeWidth={2.5} />
            </motion.div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, fontFamily: T.display, color: T.textPrimary, lineHeight: 1.2 }}>
                Welcome back, Developer
              </h1>
              <p style={{ fontSize: 12, color: T.textTertiary, marginTop: 2 }}>
                Evil_Trait_Override &mdash; Last session: 2 minutes ago
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {[
            { label: "Files", value: "14", color: T.cyan },
            { label: "Strings", value: "4,218", color: T.violet },
            { label: "Translated", value: "92.2%", color: T.emerald },
            { label: "Conflicts", value: "1", color: T.rose },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: dur.normal, delay: 0.1 + i * 0.04, ease: easing.outStandard }}
              className="text-center px-3"
            >
              <div style={{ fontSize: 18, fontFamily: T.mono, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 9, color: T.textMuted, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginTop: 3 }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="flex-1 p-4 grid grid-cols-12 gap-4 auto-rows-min content-start">
        {/* Quick Actions */}
        <FadeIn delay={0.05} className="rounded-xl overflow-hidden" style={{ background: T.bgGlass, border: `1px solid ${T.border}`, gridColumn: `span ${spanActions}` }}>
          <div className="px-4 py-2.5 flex items-center gap-2" style={{ borderBottom: `1px solid ${T.border}` }}>
            <Zap size={13} color={T.amber} />
            <Eyebrow color={T.textPrimary}>QUICK ACTIONS</Eyebrow>
          </div>
          <StaggerList className={`grid gap-2 p-3`} style={{ gridTemplateColumns: `repeat(${extreme ? 2 : 3}, minmax(0, 1fr))` }}>
            {quickActions.map((action, i) => {
              const Icon = action.icon;
              return (
                <StaggerItem key={i}>
                  <motion.button
                    onClick={() => onNavigate(action.mode)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl transition-colors group text-left w-full"
                    style={{ background: `${action.color}06`, border: `1px solid ${action.color}15` }}
                    whileHover={{ scale: 1.02, transition: { duration: dur.fast } }}
                    whileTap={{ scale: 0.97 }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${action.color}12`; e.currentTarget.style.borderColor = `${action.color}30`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = `${action.color}06`; e.currentTarget.style.borderColor = `${action.color}15`; }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${action.color}15` }}>
                      <Icon size={16} color={action.color} />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: T.textPrimary }}>{action.label}</div>
                      <div style={{ fontSize: 10, color: T.textMuted }}>{action.desc}</div>
                    </div>
                    <ArrowRight size={12} color={T.textDim} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.button>
                </StaggerItem>
              );
            })}
          </StaggerList>
        </FadeIn>

        {/* Project Health */}
        <FadeIn delay={0.1} className="rounded-xl overflow-hidden" style={{ background: T.bgGlass, border: `1px solid ${T.border}`, gridColumn: `span ${spanHealth}` }}>
          <div className="px-4 py-2.5 flex items-center gap-2" style={{ borderBottom: `1px solid ${T.border}` }}>
            <Activity size={13} color={T.emerald} />
            <Eyebrow color={T.textPrimary}>PROJECT HEALTH</Eyebrow>
          </div>
          <div className="p-3 space-y-3">
            {[
              { label: "Translation Coverage", pct: 92, color: T.emerald },
              { label: "Schema Validation", pct: 100, color: T.cyan },
              { label: "Build Status", pct: 100, color: T.amber },
              { label: "Conflict Resolution", pct: 83, color: T.rose },
              { label: "AI Confidence Avg", pct: 91, color: T.violet },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span style={{ fontSize: 11, color: T.textSecondary }}>{item.label}</span>
                  <span style={{ fontSize: 10, fontFamily: T.mono, fontWeight: 700, color: item.color }}>{item.pct}%</span>
                </div>
                <ProgressBar pct={item.pct} color={item.color} height={4} />
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Recent Files */}
        <FadeIn delay={0.15} className="rounded-xl overflow-hidden" style={{ background: T.bgGlass, border: `1px solid ${T.border}`, gridColumn: `span ${spanCard}` }}>
          <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderBottom: `1px solid ${T.border}` }}>
            <div className="flex items-center gap-2">
              <Clock size={13} color={T.cyan} />
              <Eyebrow color={T.textPrimary}>RECENT FILES</Eyebrow>
            </div>
            <button onClick={() => onNavigate("code")} className="px-2 py-0.5 rounded transition-colors hover:bg-white/5">
              <span style={{ fontSize: 10, color: T.cyan }}>View all</span>
            </button>
          </div>
          <StaggerList className="py-1">
            {recentFiles.map((f, i) => {
              const FIcon = f.icon;
              const statusColor: Record<string, string> = { ready: T.emerald, modified: T.cyan, warning: T.amber };
              return (
                <StaggerItem key={i}>
                  <button onClick={() => onNavigate("code")}
                    className="w-full flex items-center gap-2.5 px-3 py-2 transition-colors text-left hover:bg-white/5">
                    <FIcon size={13} color={f.color} />
                    <span className="flex-1 truncate" style={{ fontSize: 11, color: T.textSecondary }}>{f.name}</span>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor[f.status] || T.textDim }} />
                    <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>{f.time}</span>
                  </button>
                </StaggerItem>
              );
            })}
          </StaggerList>
        </FadeIn>

        {/* Performance Monitor */}
        <FadeIn delay={0.18} className="rounded-xl overflow-hidden" style={{ background: T.bgGlass, border: `1px solid ${T.border}`, gridColumn: `span ${spanCard}` }}>
          <div className="px-4 py-2.5 flex items-center gap-2" style={{ borderBottom: `1px solid ${T.border}` }}>
            <Cpu size={13} color={T.cyanBright} />
            <Eyebrow color={T.textPrimary}>SYSTEM PERFORMANCE</Eyebrow>
          </div>
          <div className="p-3" style={{ height: 160 }}>
            <SafeChartContainer>
              <AreaChart data={perfData} accessibilityLayer={false} clipPathId="clip-dash-perf">
                <defs key="dash-perf-defs">
                  <linearGradient id="dashCpuGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={T.cyan} stopOpacity={0.12} />
                    <stop offset="95%" stopColor={T.cyan} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="dashMemGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={T.violet} stopOpacity={0.12} />
                    <stop offset="95%" stopColor={T.violet} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis key="dash-perf-xaxis" dataKey="t" hide />
                <YAxis key="dash-perf-yaxis" hide domain={[0, 100]} />
                <Area key="dash-perf-cpu" type="monotone" dataKey="cpu" stroke={T.cyan} fill="url(#dashCpuGrad)" strokeWidth={1.5} dot={false} name="dash-cpu" isAnimationActive={false} />
                <Area key="dash-perf-mem" type="monotone" dataKey="mem" stroke={T.violet} fill="url(#dashMemGrad)" strokeWidth={1.5} dot={false} name="dash-mem" isAnimationActive={false} />
              </AreaChart>
            </SafeChartContainer>
          </div>
          <div className="flex items-center justify-center gap-4 pb-2">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ background: T.cyan }} /><span style={{ fontSize: 10, color: T.textMuted }}>CPU</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ background: T.violet }} /><span style={{ fontSize: 10, color: T.textMuted }}>Memory</span></div>
          </div>
        </FadeIn>

        {/* Translation Coverage */}
        <FadeIn delay={0.21} className="rounded-xl overflow-hidden" style={{ background: T.bgGlass, border: `1px solid ${T.border}`, gridColumn: `span ${spanCard}` }}>
          <div className="px-4 py-2.5 flex items-center gap-2" style={{ borderBottom: `1px solid ${T.border}` }}>
            <Globe size={13} color={T.violet} />
            <Eyebrow color={T.textPrimary}>LOCALE COVERAGE</Eyebrow>
          </div>
          <div className="p-3" style={{ height: 160 }}>
            <SafeChartContainer>
              <BarChart data={coverageData} accessibilityLayer={false} clipPathId="clip-dash-coverage">
                <defs key="dash-coverage-defs" />
                <XAxis key="dash-cov-xaxis" dataKey="locale" tick={{ fontSize: 9, fill: T.textMuted }} axisLine={false} tickLine={false} />
                <YAxis key="dash-cov-yaxis" hide domain={[0, 100]} />
                <Bar key="dash-cov-bar" dataKey="coverage" radius={[3, 3, 0, 0]} fill={T.violet} name="dash-coverage" isAnimationActive={false} />
              </BarChart>
            </SafeChartContainer>
          </div>
        </FadeIn>

        {/* Activity Feed */}
        <FadeIn delay={0.24} className="rounded-xl overflow-hidden" style={{ background: T.bgGlass, border: `1px solid ${T.border}`, gridColumn: "span 12" }}>
          <div className="px-4 py-2.5 flex items-center gap-2" style={{ borderBottom: `1px solid ${T.border}` }}>
            <TrendingUp size={13} color={T.amber} />
            <Eyebrow color={T.textPrimary}>ACTIVITY</Eyebrow>
          </div>
          <StaggerList className="grid gap-px" style={{ background: T.border, gridTemplateColumns: `repeat(${activityCols}, minmax(0, 1fr))` }}>
            {activityLog.map((item, i) => {
              const Icon = item.icon;
              return (
                <StaggerItem key={i}>
                  <div className="flex items-center gap-3 px-4 py-2.5" style={{ background: T.bgDeep }}>
                    <Icon size={12} color={item.color} />
                    <span className="flex-1" style={{ fontSize: 11, color: T.textSecondary }}>{item.text}</span>
                    <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>{item.time}</span>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerList>
        </FadeIn>
      </div>
    </div>
  );
}
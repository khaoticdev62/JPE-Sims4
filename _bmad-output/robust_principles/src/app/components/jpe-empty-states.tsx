/**
 * jpe-empty-states.tsx
 * Reusable empty state components for all major features in JPE Studio
 */

import { type LucideIcon, FileCode, Folder, Search, Package, Puzzle, Library, GitBranch, Database, Languages, Book, Code2, AlertTriangle, Inbox, Plus, Download, Upload, RefreshCw, Sparkles, Network, Bug, BarChart3, Settings } from "lucide-react";
import { T } from "../pages/jpe-theme";
import { JpeButton } from "./jpe-design-system";
import { motion } from "./jpe-motion";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  iconColor?: string;
  actions?: Array<{
    label: string;
    icon?: LucideIcon;
    variant?: "primary" | "secondary" | "ghost";
    onClick: () => void;
  }>;
  illustration?: "floating-icons" | "grid" | "simple";
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  iconColor = T.textMuted,
  actions = [],
  illustration = "simple",
}: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center h-full p-8 text-center"
      style={{ fontFamily: T.sans }}
    >
      <div className="max-w-md">
        {/* Icon with optional floating decoration */}
        {illustration === "floating-icons" ? (
          <div className="relative mb-6" style={{ height: 80 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div
                className="rounded-full p-5"
                style={{ background: `${iconColor}15` }}
              >
                <Icon size={40} color={iconColor} strokeWidth={1.5} />
              </div>
            </motion.div>
            {/* Floating decorative icons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.3, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="absolute top-0 right-8"
            >
              <FileCode size={20} color={T.textMuted} strokeWidth={1.5} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.3, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="absolute bottom-0 left-8"
            >
              <Folder size={20} color={T.textMuted} strokeWidth={1.5} />
            </motion.div>
          </div>
        ) : illustration === "grid" ? (
          <div className="relative mb-6" style={{ height: 80 }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-3 gap-2 opacity-20"
            >
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 4,
                    background: T.border,
                  }}
                />
              ))}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div
                className="rounded-full p-5"
                style={{ background: T.bgPanel }}
              >
                <Icon size={40} color={iconColor} strokeWidth={1.5} />
              </div>
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="mb-6 inline-flex"
          >
            <div
              className="rounded-full p-5"
              style={{ background: `${iconColor}15` }}
            >
              <Icon size={40} color={iconColor} strokeWidth={1.5} />
            </div>
          </motion.div>
        )}

        {/* Title */}
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: T.textPrimary,
            marginBottom: 8,
          }}
        >
          {title}
        </motion.h3>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          style={{
            fontSize: 13,
            color: T.textSecondary,
            lineHeight: 1.6,
            marginBottom: actions.length > 0 ? 24 : 0,
          }}
        >
          {description}
        </motion.p>

        {/* Actions */}
        {actions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="flex gap-2 justify-center flex-wrap"
          >
            {actions.map((action, i) => (
              <JpeButton
                key={i}
                variant={action.variant || "primary"}
                size="md"
                icon={action.icon}
                onClick={action.onClick}
              >
                {action.label}
              </JpeButton>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PRESET EMPTY STATES
   ═══════════════════════════════════════════════════════════════ */

export function EmptyFileExplorer({ onCreateFile, onOpenFolder }: { onCreateFile?: () => void; onOpenFolder?: () => void }) {
  return (
    <EmptyState
      icon={Folder}
      iconColor={T.cyan}
      title="No Files Open"
      description="Start by creating a new file or opening an existing project folder."
      illustration="floating-icons"
      actions={[
        ...(onCreateFile ? [{ label: "New File", icon: Plus, variant: "primary" as const, onClick: onCreateFile }] : []),
        ...(onOpenFolder ? [{ label: "Open Folder", icon: Folder, variant: "secondary" as const, onClick: onOpenFolder }] : []),
      ]}
    />
  );
}

export function EmptyModLibrary({ onBrowse, onImport }: { onBrowse?: () => void; onImport?: () => void }) {
  return (
    <EmptyState
      icon={Library}
      iconColor={T.cyanBright}
      title="No Mods in Library"
      description="Your mod library is empty. Browse the community library or import local .package files to get started."
      illustration="grid"
      actions={[
        ...(onBrowse ? [{ label: "Browse Community", icon: Download, variant: "primary" as const, onClick: onBrowse }] : []),
        ...(onImport ? [{ label: "Import Local Mod", icon: Upload, variant: "secondary" as const, onClick: onImport }] : []),
      ]}
    />
  );
}

export function EmptyPluginList({ onBrowseMarketplace }: { onBrowseMarketplace?: () => void }) {
  return (
    <EmptyState
      icon={Puzzle}
      iconColor={T.violet}
      title="No Plugins Installed"
      description="Extend JPE Studio with community plugins for linting, formatting, and advanced mod tools."
      illustration="simple"
      actions={[
        ...(onBrowseMarketplace ? [{ label: "Browse Marketplace", icon: Sparkles, variant: "primary" as const, onClick: onBrowseMarketplace }] : []),
      ]}
    />
  );
}

export function EmptySearchResults({ query, onClearSearch }: { query: string; onClearSearch?: () => void }) {
  return (
    <EmptyState
      icon={Search}
      iconColor={T.textMuted}
      title="No Results Found"
      description={`No matches for "${query}". Try adjusting your search terms or filters.`}
      illustration="simple"
      actions={[
        ...(onClearSearch ? [{ label: "Clear Search", icon: RefreshCw, variant: "ghost" as const, onClick: onClearSearch }] : []),
      ]}
    />
  );
}

export function EmptyGitHistory({ onInitRepo }: { onInitRepo?: () => void }) {
  return (
    <EmptyState
      icon={GitBranch}
      iconColor={T.amber}
      title="No Git Repository"
      description="Initialize a Git repository to track changes, create branches, and collaborate with others."
      illustration="simple"
      actions={[
        ...(onInitRepo ? [{ label: "Initialize Repository", icon: Plus, variant: "primary" as const, onClick: onInitRepo }] : []),
      ]}
    />
  );
}

export function EmptyTranslationTable({ onAddLocale }: { onAddLocale?: () => void }) {
  return (
    <EmptyState
      icon={Languages}
      iconColor={T.violet}
      title="No Translation Entries"
      description="Add string entries to start translating your mod into multiple languages."
      illustration="simple"
      actions={[
        ...(onAddLocale ? [{ label: "Add Entry", icon: Plus, variant: "primary" as const, onClick: onAddLocale }] : []),
      ]}
    />
  );
}

export function EmptyDocumentation({ onViewDocs }: { onViewDocs?: () => void }) {
  return (
    <EmptyState
      icon={Book}
      iconColor={T.emerald}
      title="No Documentation Available"
      description="Documentation for this feature is not yet available. Check back soon or visit the community wiki."
      illustration="simple"
      actions={[
        ...(onViewDocs ? [{ label: "View Wiki", icon: Book, variant: "secondary" as const, onClick: onViewDocs }] : []),
      ]}
    />
  );
}

export function EmptyCodeEditor({ onSelectFile }: { onSelectFile?: () => void }) {
  return (
    <EmptyState
      icon={Code2}
      iconColor={T.cyan}
      title="No File Selected"
      description="Select a file from the explorer panel to start editing code."
      illustration="simple"
      actions={[
        ...(onSelectFile ? [{ label: "Open Explorer", icon: Folder, variant: "ghost" as const, onClick: onSelectFile }] : []),
      ]}
    />
  );
}

export function EmptyDiagnostics({ onRunBuild }: { onRunBuild?: () => void }) {
  return (
    <EmptyState
      icon={AlertTriangle}
      iconColor={T.textMuted}
      title="No Diagnostics"
      description="All clear! Run a build or validation to see warnings and errors."
      illustration="simple"
      actions={[
        ...(onRunBuild ? [{ label: "Run Build", icon: RefreshCw, variant: "ghost" as const, onClick: onRunBuild }] : []),
      ]}
    />
  );
}

export function EmptyNotifications() {
  return (
    <EmptyState
      icon={Inbox}
      iconColor={T.textMuted}
      title="No Notifications"
      description="You're all caught up! We'll notify you of updates, builds, and errors here."
      illustration="simple"
    />
  );
}

export function EmptyDependencyGraph({ onScanProject }: { onScanProject?: () => void }) {
  return (
    <EmptyState
      icon={Network}
      iconColor={T.emerald}
      title="No Dependencies Detected"
      description="Scan your project to visualize mod dependencies and detect conflicts."
      illustration="simple"
      actions={[
        ...(onScanProject ? [{ label: "Scan Project", icon: RefreshCw, variant: "primary" as const, onClick: onScanProject }] : []),
      ]}
    />
  );
}

export function EmptyBreakpoints({ onAddBreakpoint }: { onAddBreakpoint?: () => void }) {
  return (
    <EmptyState
      icon={Bug}
      iconColor={T.rose}
      title="No Breakpoints Set"
      description="Set breakpoints in your code to pause execution and inspect variables during debugging."
      illustration="simple"
      actions={[
        ...(onAddBreakpoint ? [{ label: "Learn About Debugging", icon: Book, variant: "ghost" as const, onClick: onAddBreakpoint }] : []),
      ]}
    />
  );
}

export function EmptyAnalysisData({ onRunAnalysis }: { onRunAnalysis?: () => void }) {
  return (
    <EmptyState
      icon={BarChart3}
      iconColor={T.emerald}
      title="No Analysis Data"
      description="Run a performance analysis to see metrics, charts, and optimization suggestions."
      illustration="grid"
      actions={[
        ...(onRunAnalysis ? [{ label: "Run Analysis", icon: Play, variant: "primary" as const, onClick: onRunAnalysis }] : []),
      ]}
    />
  );
}

export function EmptySnippets({ onCreateSnippet }: { onCreateSnippet?: () => void }) {
  return (
    <EmptyState
      icon={Code2}
      iconColor={T.violet}
      title="No Snippets Saved"
      description="Create reusable code snippets for JPE, XML, and Python to speed up your workflow."
      illustration="simple"
      actions={[
        ...(onCreateSnippet ? [{ label: "Create Snippet", icon: Plus, variant: "primary" as const, onClick: onCreateSnippet }] : []),
      ]}
    />
  );
}

export function EmptyVault({ onUploadAsset }: { onUploadAsset?: () => void }) {
  return (
    <EmptyState
      icon={Package}
      iconColor={T.violet}
      title="Rebel's Vault is Empty"
      description="Upload custom assets, textures, and resources to your personal vault for quick access."
      illustration="grid"
      actions={[
        ...(onUploadAsset ? [{ label: "Upload Asset", icon: Upload, variant: "primary" as const, onClick: onUploadAsset }] : []),
      ]}
    />
  );
}

export function EmptySettings() {
  return (
    <EmptyState
      icon={Settings}
      iconColor={T.textMuted}
      title="No Settings Available"
      description="This feature doesn't have any configurable settings yet."
      illustration="simple"
    />
  );
}

/* ═══════════════════════════════════════════════════════════════
   LOADING SKELETON STATES
   ═══════════════════════════════════════════════════════════════ */

export function LoadingFileTree() {
  return (
    <div className="p-3 space-y-2">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex items-center gap-2" style={{ paddingLeft: (i % 3) * 12 }}>
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 2,
              background: T.border,
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
          <div
            style={{
              width: `${60 + (i % 4) * 20}%`,
              height: 12,
              borderRadius: 2,
              background: T.border,
              animation: "pulse 1.5s ease-in-out infinite",
              animationDelay: `${i * 0.1}s`,
            }}
          />
        </div>
      ))}
    </div>
  );
}

export function LoadingModCards() {
  return (
    <div className="grid grid-cols-1 gap-3 p-3">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          style={{
            height: 120,
            borderRadius: 6,
            background: T.bgSurface,
            border: `1px solid ${T.border}`,
            animation: "pulse 1.5s ease-in-out infinite",
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}

export function LoadingCodeEditor() {
  return (
    <div className="flex flex-col h-full p-4 gap-2">
      {[...Array(20)].map((_, i) => (
        <div key={i} className="flex gap-2">
          <div
            style={{
              width: 30,
              height: 14,
              borderRadius: 2,
              background: T.border,
              opacity: 0.3,
            }}
          />
          <div
            style={{
              width: `${40 + (i % 5) * 15}%`,
              height: 14,
              borderRadius: 2,
              background: T.border,
              animation: "pulse 1.5s ease-in-out infinite",
              animationDelay: `${i * 0.05}s`,
            }}
          />
        </div>
      ))}
    </div>
  );
}

export function LoadingPanel() {
  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <div
        style={{
          height: 24,
          width: "60%",
          borderRadius: 4,
          background: T.border,
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      />
      <div
        style={{
          height: 2,
          width: "100%",
          background: T.border,
        }}
      />
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          style={{
            height: 60,
            borderRadius: 4,
            background: T.border,
            animation: "pulse 1.5s ease-in-out infinite",
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
}

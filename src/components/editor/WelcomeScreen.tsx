import { FolderOpen, FilePlus, Save, Hammer, Search, Bug, Zap, Braces } from 'lucide-react'
import { motion } from '@/components/jpe-motion'
import { T } from '../robust/jpe-theme'
import { JpeCard, JpeButton } from '../jpe-design-system'

interface WelcomeScreenProps {
  onOpenProject?: () => void
  onAddFile?: () => void
  hasProject: boolean
}

const shortcuts = [
  { keys: 'Ctrl+S', icon: Save, label: 'Save file', color: T.cyan },
  { keys: 'Ctrl+Shift+B', icon: Hammer, label: 'Compile Logic', color: T.emerald },
  { keys: 'Ctrl+F', icon: Search, label: 'Search Block', color: T.cyan },
  { keys: 'Ctrl+J', icon: Bug, label: 'Diagnostics', color: T.rose },
]

export default function WelcomeScreen({ onOpenProject, onAddFile, hasProject }: WelcomeScreenProps) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-[#0a0c10] relative overflow-hidden">
      {/* Spectral Background Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#63B3ED]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Hero Logo */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center mb-12 relative z-10"
      >
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-[#63B3ED]/40 rounded-3xl blur-2xl animate-pulse" />
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-[#63B3ED] to-[#8B5CF6] flex items-center justify-center shadow-2xl border border-white/20">
            <Braces size={40} color="#fff" strokeWidth={2.5} />
          </div>
        </div>
        <h1 className="text-3xl font-black text-[#E2E8F0] tracking-tighter mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
          STUDIO_NEXUS
        </h1>
        <div className="flex items-center justify-center gap-2">
           <Zap size={12} className="text-[#63B3ED] animate-pulse" />
           <p className="text-sm font-mono text-[#A0AEC0] uppercase tracking-widest">Initialization Pending</p>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="flex gap-6 mb-16 relative z-10">
        {hasProject && onAddFile && (
          <JpeButton
            variant="spectral"
            size="lg"
            icon={FilePlus}
            onClick={onAddFile}
            className="h-auto py-6 px-8 flex-col gap-3 rounded-2xl"
          >
            Add Sources
          </JpeButton>
        )}
        {onOpenProject && (
          <JpeButton
            variant="spectral"
            size="lg"
            icon={FolderOpen}
            onClick={onOpenProject}
            className="h-auto py-6 px-8 flex-col gap-3 rounded-2xl"
          >
            {hasProject ? 'Switch Project' : 'Load Project'}
          </JpeButton>
        )}
      </div>

      {/* Keyboard Shortcuts Table */}
      <div className="w-full max-w-md relative z-10">
        <JpeCard icon={Zap} title="SYSTEM_COMMANDS">
          <div className="space-y-3 p-2">
            {shortcuts.map(({ keys, icon: Icon, label, color }) => (
              <div
                key={keys}
                className="flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                    <Icon className="w-3.5 h-3.5" style={{ color }} />
                  </div>
                  <span className="text-xs font-medium text-[#A0AEC0] group-hover:text-[#E2E8F0] transition-colors tracking-tight">{label}</span>
                </div>
                <div className="flex gap-1">
                  {keys.split('+').map(k => (
                    <kbd key={k} className="text-[10px] font-mono bg-black/40 text-[#A0AEC0] px-2 py-0.5 rounded border border-white/5 shadow-inner">
                      {k}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </JpeCard>
      </div>

      {/* Industrial Status Footer */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 opacity-30">
         <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[9px] font-mono uppercase tracking-[0.2em]">Core_Stable</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[9px] font-mono uppercase tracking-[0.2em]">Sync_Active</span>
         </div>
      </div>
    </div>
  )
}

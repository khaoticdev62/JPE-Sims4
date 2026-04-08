import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Zap, 
  GitBranch, 
  Hammer, 
  X, 
  Sparkles, 
  AlertTriangle, 
  Info,
  ChevronRight,
  Target
} from 'lucide-react'
import { Explanation } from '@/services/ai/types'
import { Diagnostic } from '@/types'
import { RichText } from './RichText'
import Button from './Button'

interface AIExplanationModalProps {
  isOpen: boolean
  onClose: () => void
  onFix: () => void
  explanation: Explanation | null | undefined
  diagnostic: Diagnostic | null | undefined
  isFixing?: boolean
}

/**
 * AIExplanationModal - High-fidelity "Better Exceptions" style report.
 * Provides structured root-cause analysis and logical breakdowns for JPE Studio.
 */
export const AIExplanationModal: React.FC<AIExplanationModalProps> = ({
  isOpen,
  onClose,
  onFix,
  explanation,
  diagnostic,
  isFixing = false
}) => {
  if (!isOpen || !explanation || !diagnostic) return null

  const severity = diagnostic.severity || 'info'
  const _isFatal = severity === 'error'

  // Severity-based theme mapping
  const themes = {
    error: {
      accent: 'border-state-error text-state-error',
      bg: 'bg-state-error/5',
      icon: <AlertTriangle className="w-5 h-5 text-state-error" />
    },
    warning: {
      accent: 'border-state-warning text-state-warning',
      bg: 'bg-state-warning/5',
      icon: <AlertTriangle className="w-5 h-5 text-state-warning" />
    },
    info: {
      accent: 'border-state-info text-state-info',
      bg: 'bg-state-info/5',
      icon: <Info className="w-5 h-5 text-state-info" />
    },
    hint: {
      accent: 'border-slate-400 text-slate-400',
      bg: 'bg-slate-400/5',
      icon: <Info className="w-5 h-5 text-slate-400" />
    }
  }

  const theme = themes[severity as keyof typeof themes] || themes.info

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl max-h-[85vh] bg-bg-secondary border border-border-subtle rounded-xl overflow-hidden flex flex-col shadow-2xl"
        >
          {/* Header Banner (Better Exceptions Style) */}
          <div className={`px-6 py-5 border-b border-border-subtle ${theme.bg} relative overflow-hidden`}>
            {/* Background Grain/Flare */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent-primary via-transparent to-transparent" />
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg border bg-bg-primary ${theme.accent}`}>
                  {theme.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
                      AI Diagnostic Report
                    </span>
                    <Sparkles className="w-3 h-3 text-accent-primary animate-pulse" />
                  </div>
                  <h2 className="text-xl font-black text-text-primary tracking-tight">
                    {diagnostic.code ? diagnostic.code.toUpperCase() : 'TUNING_ERROR'}
                  </h2>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-bg-tertiary rounded-full transition-colors text-text-tertiary hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Scrolled Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
            
            {/* Card 1: Overview & Root Cause */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-text-tertiary mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-state-warning" />
                    What happened?
                  </h3>
                  <RichText text={explanation.overview} className="text-sm border-l-2 border-state-warning/30 pl-4" />
                </section>
                
                {explanation.rootCause && (
                  <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-text-tertiary mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4 text-state-error" />
                      Root Cause
                    </h3>
                    <RichText text={explanation.rootCause} className="text-sm border-l-2 border-state-error/30 pl-4" />
                  </section>
                )}
              </div>

              {/* Side Card: Summary List */}
              <div className="space-y-4">
                <div className="p-4 bg-bg-tertiary rounded-lg border border-border-subtle">
                  <h4 className="text-[10px] font-bold uppercase text-text-tertiary mb-3">Key Fields Involved</h4>
                  <div className="space-y-2">
                    {explanation.keyFields.map((field, i) => (
                      <div key={i} className="text-[11px] font-mono p-1.5 bg-bg-primary rounded text-accent-primary border border-accent-primary/10 truncate">
                        {field}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="p-4 bg-bg-tertiary rounded-lg border border-border-subtle">
                  <h4 className="text-[10px] font-bold uppercase text-text-tertiary mb-3">In-Game Impact</h4>
                  <ul className="text-[11px] space-y-2 text-text-secondary list-disc pl-4 leading-relaxed">
                    {explanation.effects.map((effect, i) => (
                      <li key={i}>{effect}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Card 2: Logic Path */}
            {explanation.logicPath && (
              <section className="p-5 bg-accent-primary/5 border border-accent-primary/10 rounded-lg">
                <h3 className="text-xs font-bold uppercase tracking-widest text-accent-primary mb-4 flex items-center gap-2">
                  <GitBranch className="w-4 h-4" />
                  Sims 4 Logic Path
                </h3>
                <RichText text={explanation.logicPath} className="text-sm" />
              </section>
            )}

            {/* Card 3: Fix Strategy */}
            {explanation.fixStrategy && (
              <section className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-4 flex items-center gap-2">
                  < Hammer className="w-4 h-4" />
                  Fix Strategy
                </h3>
                <RichText text={explanation.fixStrategy} className="text-sm" />
              </section>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-border-subtle bg-bg-primary flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] text-text-tertiary">
              <ChevronRight className="w-3 h-3" />
              <span>Reference documentation available at sims.wiki</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" onClick={onClose}>
                Disregard
              </Button>
              <Button 
                onClick={() => !isFixing && onFix()}
                className="bg-accent-primary hover:bg-accent-primary/80 text-white flex items-center gap-2"
                disabled={isFixing}
              >
                {isFixing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Apply Suggested Fix
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}


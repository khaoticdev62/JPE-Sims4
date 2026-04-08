"use client";

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity,
  Settings2,
  Sparkles,
  Zap,
  Loader2,
  AlertCircle,
  AlertTriangle,
  Info,
  Filter
} from 'lucide-react'
import { Diagnostic } from '@/types'
import { t } from '@/constants/locales'
import { revealInMonaco } from '@/utils/editor'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface DiagnosticsPanelProps {
  diagnostics: Diagnostic[]
  onSelectDiagnostic?: (diagnostic: Diagnostic) => void
  onFix?: (diagnostic: Diagnostic) => void
  onExplain?: (diagnostic: Diagnostic) => void
  isFixing?: boolean
  isExplaining?: boolean
  processingId?: string | null
  className?: string
  isOpen?: boolean
}

/**
 * DiagnosticsPanel - Professional Problem/Diagnostic view
 * Used in both the Bottom Panel and the Right Panel sidebar
 */
export default function DiagnosticsPanel({
  diagnostics,
  onSelectDiagnostic,
  onFix,
  onExplain,
  isFixing = false,
  isExplaining = false,
  processingId = null,
  className = '',
  isOpen = true,
}: DiagnosticsPanelProps) {
  const [filter, setFilter] = useState<'all' | 'error' | 'warning' | 'info'>('all')

  // Filter diagnostics
  const filteredDiagnostics =
    filter === 'all' ? diagnostics : diagnostics.filter((d) => d.severity === filter)

  const isAnyProcessing = isFixing || isExplaining

  // Severity configuration matching design system tokens
  const severityConfig = {
    error: { 
      color: 'text-state-error', 
      bg: 'bg-state-error/5', 
      border: 'border-state-error/20',
      icon: <AlertCircle className="w-4 h-4 text-state-error" />, 
      label: 'Error' 
    },
    warning: { 
      color: 'text-state-warning', 
      bg: 'bg-state-warning/5', 
      border: 'border-state-warning/20',
      icon: <AlertTriangle className="w-4 h-4 text-state-warning" />, 
      label: 'Warning' 
    },
    info: { 
      color: 'text-state-info', 
      bg: 'bg-state-info/5', 
      border: 'border-state-info/20',
      icon: <Info className="w-4 h-4 text-state-info" />, 
      label: 'Info' 
    },
    hint: {
      color: 'text-text-tertiary',
      bg: 'bg-background-tertiary/5',
      border: 'border-border-subtle/20',
      icon: <Info className="w-4 h-4 text-text-tertiary" />,
      label: 'Hint'
    }
  }

  const handleDiagnosticClick = (diag: Diagnostic) => {
    if (onSelectDiagnostic) {
      onSelectDiagnostic(diag)
    } else {
      revealInMonaco(diag)
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className={`fixed right-0 top-12 bottom-0 w-80 bg-background-secondary border-l border-border-subtle shadow-2xl flex flex-col transition-transform duration-300 z-[100] ${isOpen ? 'translate-x-0' : 'translate-x-full'} ${className}`}
    >
      {/* Header / Summary bar */}
      <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-background-primary/50 relative">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-accent-primary" />
          <h2 className="font-semibold text-sm tracking-tight text-text-primary uppercase tracking-tighter">
            {t('editor.diagnostics', 'en')}
          </h2>
          <Badge variant="outline" className="text-[10px] py-0 h-4 border-accent-primary/20 bg-accent-primary/5 text-accent-primary font-mono">
            {diagnostics.length}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-7 w-7 text-text-tertiary" aria-label="Filter diagnostics">
            <Filter className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 text-text-tertiary" aria-label="Diagnostics settings">
            <Settings2 className="w-3 h-3" />
          </Button>
        </div>

        {/* Screen reader announcement for diagnostic count */}
        <div aria-live="polite" className="sr-only">
          {diagnostics.length} diagnostic{diagnostics.length !== 1 ? 's' : ''} found
        </div>

        {/* Global AI Progress Bar (Finding 10: Missing Global Progress) */}
        <AnimatePresence>
          {isAnyProcessing && (
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-accent-primary origin-left shadow-[0_0_8px_rgba(var(--accent-primary-rgb),0.5)]"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Filter Chips */}
      <div className="px-3 py-2 flex gap-1 border-b border-border-subtle bg-background-secondary/50" role="group" aria-label="Diagnostic severity filters">
        {(['all', 'error', 'warning', 'info'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            aria-label={`Show ${f} diagnostics`}
            aria-pressed={filter === f}
            className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tight transition-all border ${
              filter === f
                ? 'bg-accent-primary border-accent-primary text-background-primary'
                : 'text-text-tertiary border-transparent hover:bg-background-tertiary hover:text-text-secondary'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List Container */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-background-secondary">
        {filteredDiagnostics.length > 0 ? (
          <div className="divide-y divide-border-subtle/10">
            {filteredDiagnostics.map((d, i) => {
              const severityInfo = severityConfig[d.severity || 'info'] || severityConfig.info
              // Finding 5: Unique Processing ID (Line-Column-Code)
              const stableKey = `${d.line}-${d.column}-${d.code || 'err'}`
              const isProcessingThis = processingId === stableKey
              
              return (
                <motion.div
                  key={`${stableKey}-${i}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`p-3 cursor-pointer transition-all hover:bg-background-tertiary/40 group relative border-l-2 ${
                    d.severity === 'error' ? 'border-l-state-error/40' : 
                    d.severity === 'warning' ? 'border-l-state-warning/40' : 
                    'border-l-transparent'
                  } ${severityInfo.bg}`}
                  onClick={() => handleDiagnosticClick(d)}
                >
                  <div className="flex gap-3">
                    <div className="mt-0.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                      {severityInfo.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
                          Line {d.line} • Col {d.column}
                        </span>
                        {d.code && (
                          <span className={`text-[9px] font-bold ${severityInfo.color} px-1.5 py-0.5 rounded-sm bg-current/10 uppercase`}>
                            {d.code}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-text-primary leading-relaxed break-words pr-2 font-medium">
                        {d.message}
                      </p>
                    </div>
                  </div>

                  {/* AI Action Buttons */}
                  <div className="mt-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-1 group-hover:translate-y-0 duration-200">
                    {onExplain && (
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          onExplain(d)
                        }}
                        className="h-7 text-[10px] gap-1.5 bg-background-primary/50 border-accent-primary/20 hover:border-accent-primary hover:bg-accent-primary hover:text-white"
                        disabled={isAnyProcessing}
                      >
                        {isProcessingThis && isExplaining ? (
                          <Loader2 className="w-3 h-3 animate-spin shadow-none" />
                        ) : (
                          <Sparkles className="w-3 h-3" />
                        )}
                        Explain
                      </Button>
                    )}

                    {onFix && (
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          onFix(d)
                        }}
                        className="h-7 text-[10px] gap-1.5 bg-background-primary/50 border-emerald-500/20 hover:border-emerald-500 hover:bg-emerald-500 hover:text-white"
                        disabled={isAnyProcessing}
                      >
                        {isProcessingThis && isFixing ? (
                          <Loader2 className="w-3 h-3 animate-spin shadow-none" />
                        ) : (
                          <Zap className="w-3 h-3" />
                        )}
                        AI Fix
                      </Button>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-16 h-16 bg-accent-primary/5 rounded-full flex items-center justify-center mb-4 text-2xl"
            >
              🌿
            </motion.div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary">
              All Clear
            </h3>
            <p className="text-[10px] mt-2 text-text-tertiary max-w-[180px] leading-relaxed">
              No issues detected {filter !== 'all' ? `for the "${filter}" filter` : ''} in the current scope.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

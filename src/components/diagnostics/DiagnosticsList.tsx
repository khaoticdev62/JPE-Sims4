import React, { useMemo, useState } from 'react'
import { ChevronRight, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { motion, AnimatePresence } from '../jpe-motion'
import type { Diagnostic } from '@/types/index'
import DiagnosticItem from './DiagnosticItem'
import { T } from '../robust/jpe-theme'
import { cn } from '@/utils/cn'

interface DiagnosticsListProps {
  diagnostics: Diagnostic[]
  onNavigate?: (fileId: string, line: number, column: number) => void
}

/**
 * Categorized list of diagnostics with collapsible sections - Industrialized for Story 3.3
 */
export default function DiagnosticsList({
  diagnostics,
  onNavigate,
}: DiagnosticsListProps) {
  const [collapsedCategories, setCollapsedCategories] = useState<string[]>([])

  const categories = useMemo(() => {
    const cats: Record<string, Diagnostic[]> = {
      error: [],
      warning: [],
      info: []
    }

    diagnostics.forEach((diag) => {
      const severity = diag.severity || 'info'
      if (cats[severity]) {
        cats[severity].push(diag)
      } else {
        cats.info.push(diag)
      }
    })

    return cats
  }, [diagnostics])

  const toggleCategory = (cat: string) => {
    setCollapsedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  if (diagnostics.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-40">
        <div className="w-16 h-16 rounded-full bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center mb-4">
           <span className="text-2xl">🌿</span>
        </div>
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500">Zero Criticalities Found</h3>
        <p className="text-[10px] text-text-muted mt-2 max-w-[200px] leading-relaxed">
          Your JPE syntax is structurally sound. Ready for industrial synthesis.
        </p>
      </div>
    )
  }

  const catConfig = {
    error: { icon: AlertCircle, label: 'Errors', color: 'text-state-error', bg: 'bg-state-error/5', border: 'border-state-error/20' },
    warning: { icon: AlertTriangle, label: 'Warnings', color: 'text-state-warning', bg: 'bg-state-warning/5', border: 'border-state-warning/20' },
    info: { icon: Info, label: 'Info', color: 'text-state-info', bg: 'bg-state-info/5', border: 'border-state-info/20' }
  } as const

  return (
    <div className="space-y-4 pb-8">
      {(Object.keys(catConfig) as Array<keyof typeof catConfig>).map((catKey) => {
        const catDiags = categories[catKey]
        if (catDiags.length === 0) return null

        const config = catConfig[catKey]
        const isCollapsed = collapsedCategories.includes(catKey)

        return (
          <div key={catKey} className="flex flex-col">
            {/* ── CATEGORY HEADER ── */}
            <button
              onClick={() => toggleCategory(catKey)}
              className={cn(
                "flex items-center gap-2 w-full px-3 py-1.5 transition-all outline-none group sticky top-0 z-10 backdrop-blur-md border-y",
                config.bg, config.border
              )}
            >
              <ChevronRight 
                size={12} 
                className={cn("text-text-muted transition-transform duration-200", !isCollapsed && "rotate-90")} 
              />
              <config.icon size={12} className={cn(config.color)} />
              <span className={cn("text-[10px] font-black uppercase tracking-[0.2em]", config.color)}>
                {config.label}
              </span>
              <span className="ml-auto text-[9px] font-mono opacity-50 text-text-primary px-1.5 py-0.5 rounded-full bg-black/20">
                {catDiags.length}
              </span>
            </button>

            {/* ── CATEGORY ITEMS ── */}
            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="divide-y divide-white/[0.03]">
                    {catDiags.map((diag, idx) => (
                      <DiagnosticItem
                        key={diag.id || `${catKey}-${idx}`}
                        diagnostic={diag}
                        fileName={diag.fileId.split('/').pop() || diag.fileId}
                        onNavigate={onNavigate}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

import React from 'react'
import { Search, Filter, Layers, X, ChevronDown } from 'lucide-react'
import { useDiagnosticStore } from '@/stores/useDiagnosticStore'
import { useProjectStore } from '@/stores/useProjectStore'
import { T } from '../robust/jpe-theme'
import { cn } from '@/utils/cn'

/**
 * Filter controls for diagnostics panel - Industrialized for Story 3.3
 */
export default function DiagnosticsFilters() {
  const { 
    searchQuery, setSearchQuery,
    activeSeverityFilter, setSeverityFilter,
    activeFileFilter, setFileFilter
  } = useDiagnosticStore()
  
  const { currentProject } = useProjectStore()

  const severities = [
    { id: 'all', label: 'All', color: 'text-text-primary' },
    { id: 'error', label: 'Errors', color: 'text-state-error' },
    { id: 'warning', label: 'Warnings', color: 'text-state-warning' },
    { id: 'info', label: 'Info', color: 'text-state-info' }
  ] as const

  return (
    <div 
      className="flex items-center gap-4 px-4 py-2 border-b border-white/5 bg-black/20"
      style={{ borderColor: T.border }}
    >
      {/* ── SEARCH INPUT ── */}
      <div className="relative group flex-1 max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted group-focus-within:text-cyan transition-colors" />
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter issues..."
          className="w-full bg-white/[0.03] border border-white/5 rounded-md pl-9 pr-8 py-1.5 text-[11px] font-mono text-text-primary placeholder:text-text-muted/40 outline-none focus:border-cyan/30 transition-all"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-text-muted hover:text-white transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* ── SEVERITY TOGGLES ── */}
      <div className="flex items-center gap-1 bg-white/[0.02] p-1 rounded-lg border border-white/5">
        {severities.map((s) => (
          <button
            key={s.id}
            onClick={() => setSeverityFilter(s.id)}
            className={cn(
               "px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-md transition-all border",
               activeSeverityFilter === s.id 
                ? "bg-white/5 border-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.05)]" 
                : "border-transparent text-text-muted hover:text-text-secondary"
            )}
          >
            <span className={cn(activeSeverityFilter === s.id ? s.color : '')}>
              {s.label}
            </span>
          </button>
        ))}
      </div>

      <div className="w-px h-4 bg-white/10 mx-1" />

      {/* ── FILE SELECTOR ── */}
      <div className="relative">
        <select
          value={activeFileFilter || ''}
          onChange={(e) => setFileFilter(e.target.value || null)}
          className="appearance-none bg-white/[0.03] border border-white/5 rounded-md pl-8 pr-8 py-1.5 text-[11px] font-mono text-text-primary outline-none focus:border-cyan/30 transition-all cursor-pointer min-w-[140px]"
        >
          <option value="">Across Entire Project</option>
          {currentProject?.files.map(file => (
            <option key={file.id} value={file.id}>{file.name}</option>
          ))}
        </select>
        <Layers className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
      </div>

      {/* ── SETTINGS / ACTIONS ── */}
      <div className="flex items-center gap-2 ml-auto">
        <button 
          title="Filter Settings"
          className="p-1.5 text-text-muted hover:text-cyan transition-colors"
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

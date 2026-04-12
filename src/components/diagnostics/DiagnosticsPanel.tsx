"use client";

import React, { useRef } from 'react'
import { 
  Trash2, 
  UploadCloud, 
  FileSearch, 
  Brain, 
  Loader2, 
  ShieldCheck,
  MoreVertical,
  XCircle
} from 'lucide-react'
import { useDiagnosticStore } from '@/stores/useDiagnosticStore'
import { useEditorStore } from '@/stores/useEditorStore'
import { useProjectStore } from '@/stores/useProjectStore'
import { toast } from 'sonner'
import DiagnosticsFilters from './DiagnosticsFilters'
import DiagnosticsList from './DiagnosticsList'
import { T } from '../robust/jpe-theme'
import { cn } from '@/utils/cn'

/**
 * Industrialized Diagnostics Panel - Story 3.3
 * Professional Triage Center for JPE Studio
 */
export default function DiagnosticsPanel() {
  const { 
    getFilteredDiagnostics, 
    clearDiagnostics,
    diagnostics 
  } = useDiagnosticStore()
  
  const { openTab } = useEditorStore()
  const { isAiScanning, setAiScanning, currentProject: project, saveProject } = useProjectStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredDiagnostics = getFilteredDiagnostics()

  // Calculate counts for the header
  const counts = {
    errors: diagnostics.filter(d => d.severity === 'error').length,
    warnings: diagnostics.filter(d => d.severity === 'warning').length,
    info: diagnostics.filter(d => d.severity === 'info').length,
  }

  const handleNavigate = (fileId: string, line: number, column: number) => {
    openTab({
      id: `tab-${fileId}`,
      fileId,
      name: fileId.split('/').pop() || fileId,
      isDirty: false,
    })
    
    // In a real editor, we'd also trigger cursor placement here
    // For now, we assume the editor handles this via state synchronization if needed
  }

  const handleManualScan = async () => {
    if (!project) return
    toast.info("Synthesizing Diagnostic Report...")
    await saveProject() // Triggers the scan in useProjectStore
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // ... existing file upload logic ...
    toast.info("Log analysis coming soon to industrial diagnostics.")
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]" style={{ color: T.textSecondary }}>
      {/* ── INDUSTRIAL HEADER ── */}
      <div 
        className="flex items-center justify-between px-4 h-10 border-b border-white/5 bg-black/40 backdrop-blur-xl"
        style={{ borderColor: T.borderSubtle }}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white italic">Problems</h2>
            <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-white/10 rounded-full text-[9px] font-mono text-white/50">
              {diagnostics.length}
            </span>
          </div>

          <div className="w-px h-3 bg-white/10" />

          {/* Real-time Counts */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
              <div className="w-2 h-2 rounded-full bg-state-error shadow-[0_0_8px_rgba(255,0,0,0.4)]" />
              <span className="text-[10px] font-black text-state-error uppercase tracking-widest">{counts.errors}</span>
            </div>
            <div className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
              <div className="w-2 h-2 rounded-full bg-state-warning shadow-[0_0_8px_rgba(255,191,0,0.4)]" />
              <span className="text-[10px] font-black text-state-warning uppercase tracking-widest">{counts.warnings}</span>
            </div>
            <div className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
              <div className="w-2 h-2 rounded-full bg-state-info shadow-[0_0_8px_rgba(0,191,255,0.4)]" />
              <span className="text-[10px] font-black text-state-info uppercase tracking-widest">{counts.info}</span>
            </div>
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-1">
          {isAiScanning && (
            <div className="flex items-center gap-2 mr-3 px-2 py-1 rounded bg-cyan/5 border border-cyan/10 animate-pulse">
              <Brain size={12} className="text-cyan" />
              <span className="text-[9px] font-black uppercase text-cyan tracking-widest">Augmenting...</span>
              <Loader2 size={10} className="animate-spin text-cyan" />
            </div>
          )}
          
          <button 
            onClick={handleManualScan}
            disabled={isAiScanning}
            className="p-1.5 text-text-muted hover:text-cyan transition-colors rounded hover:bg-white/5 disabled:opacity-30"
            title="Scan Project"
          >
            <FileSearch size={14} />
          </button>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 text-text-muted hover:text-amber-500 transition-colors rounded hover:bg-white/5"
            title="Upload Exceptions Log"
          >
            <UploadCloud size={14} />
          </button>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".txt" 
          />

          <div className="w-px h-3 bg-white/10 mx-1" />

          <button 
            onClick={() => clearDiagnostics()}
            className="p-1.5 text-text-muted hover:text-state-error transition-colors rounded hover:bg-white/5"
            title="Clear All Problems"
          >
            <Trash2 size={14} />
          </button>

          <button className="p-1.5 text-text-muted hover:text-white transition-colors">
            <MoreVertical size={14} />
          </button>
        </div>
      </div>

      {/* ── FILTERS BAR ── */}
      <DiagnosticsFilters />

      {/* ── DIAGNOSTICS LIST ── */}
      <div className="flex-1 overflow-y-auto scrollbar-hide bg-black/10">
        <DiagnosticsList 
          diagnostics={filteredDiagnostics}
          onNavigate={handleNavigate}
        />
      </div>

      {/* ── PANEL FOOTER ── */}
      <div 
        className="flex items-center justify-between px-4 h-6 border-t border-white/5 bg-black/60 text-[9px] font-black uppercase tracking-[0.2em] text-text-muted"
        style={{ borderColor: T.borderSubtle }}
      >
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={10} className="text-emerald-500" />
            Integrity Scanner: Online
          </span>
          <span className="opacity-30">|</span>
          <span>Source: Pipeline 2.1</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span>Filtered: {filteredDiagnostics.length}</span>
          <span className="opacity-30">|</span>
          <span>Total: {diagnostics.length}</span>
        </div>
      </div>
    </div>
  )
}

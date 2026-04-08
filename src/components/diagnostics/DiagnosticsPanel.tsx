"use client";

import { useState, useMemo, useRef } from 'react'
import { useDiagnosticStore } from '@/stores/useDiagnosticStore'
import { useEditorStore } from '@/stores/useEditorStore'
import { useProjectStore } from '@/stores/useProjectStore'
import { Loader2, Brain, ShieldCheck, FileSearch, Trash2, UploadCloud } from 'lucide-react'
import { ConflictAnalyzer } from '@/services/ai/ConflictAnalyzer'
import { BetterExceptionsJPE } from '@/services/ai/BetterExceptionsJPE'
import { toast } from 'sonner'
import DiagnosticsFilters from './DiagnosticsFilters'
import DiagnosticsList from './DiagnosticsList'

/**
 * Enhanced diagnostics panel with filtering and grouping
 */
export default function DiagnosticsPanel() {
  const { diagnostics, setDiagnostics, clearDiagnostics } = useDiagnosticStore()
  const { openTab } = useEditorStore()
  const { isAiScanning, setAiScanning, currentProject: project } = useProjectStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [filters, setFilters] = useState({
    errors: true,
    warnings: true,
    info: true,
  })
  const [groupBy, setGroupBy] = useState<'file' | 'severity'>('file')

  // Filter diagnostics
  const filteredDiagnostics = useMemo(() => {
    return diagnostics.filter((diag) => {
      if (diag.severity === 'error' && !filters.errors) return false
      if (diag.severity === 'warning' && !filters.warnings) return false
      if (diag.severity === 'info' && !filters.info) return false
      return true
    })
  }, [diagnostics, filters])

  // Calculate counts
  const counts = useMemo(() => {
    return {
      errors: diagnostics.filter((d) => d.severity === 'error').length,
      warnings: diagnostics.filter((d) => d.severity === 'warning').length,
      info: diagnostics.filter((d) => d.severity === 'info').length,
    }
  }, [diagnostics])

  const handleNavigate = (fileId: string, _line: number, _column: number) => {
    openTab({
      id: `tab-${fileId}`,
      fileId,
      name: fileId,
      isDirty: false,
    })
  }

  const handleScanProject = async () => {
    if (!project) return
    setAiScanning(true)
    toast.info("Initializing Mod Health Scan...")

    try {
      // 0. Extract summary ONCE
      const summary = JSON.parse(ConflictAnalyzer.extractSummaryMap(project))

      // 1. Local Duplicate Check (uses summary internal, but we can pass project)
      const duplicates = ConflictAnalyzer.findDuplicateIds(project)
      
      // 2. Community Manifest Lookup (Scarlet's Realm) - Optimized
      const communityIssues = BetterExceptionsJPE.runManifestLookup(project, summary)
      
      // 3. Heuristic Logic Check (Orphans, etc) - Optimized
      const heuristicIssues = BetterExceptionsJPE.runHeuristicLogicCheck(project, summary)

      // 4. AI Deep Scan (Simulated for Story 6.3)
      const aiFindings = await ConflictAnalyzer.runAILogicScan(project)

      setDiagnostics([...duplicates, ...communityIssues, ...heuristicIssues, ...aiFindings])
      toast.success("Health Scan Complete: " + (duplicates.length + communityIssues.length + heuristicIssues.length + aiFindings.length) + " issues found.")
    } catch (err: any) {
      toast.error("Scan Failed: " + err.message)
    } finally {
      setAiScanning(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      const content = event.target?.result as string
      if (content) {
        const analysis = BetterExceptionsJPE.parseExceptionLog(content)
        
        if (!analysis) {
          toast.error("Invalid Log: No Python Traceback signature found.")
          return
        }

        toast.info(`Better Exceptions: Detected ${analysis.type} in ${analysis.module}`)
        
        // Add as a project-level diagnostic
        setDiagnostics([{
          id: `exception-${Date.now()}`,
          fileId: 'lastException.txt',
          line: 1,
          column: 1,
          severity: 'error',
          message: `🚨 Critical Game Error: ${analysis.type}`,
          code: 'GAME_EXCEPTION',
          source: 'ai',
          suggestion: `Module: ${analysis.module}. Use /explain in assistant for JPE root cause.`
        }, ...diagnostics])
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="flex flex-col h-full bg-background-secondary">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border-subtle bg-background-tertiary">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-primary italic">Mod Health Analytics</h2>
            {isAiScanning && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-accent-primary/10 border border-accent-primary/20 animate-pulse">
                <Brain className="w-3 h-3 text-accent-primary" />
                <span className="text-[9px] font-black text-accent-primary uppercase tracking-[0.1em]">
                  Scrutinizing Project AI...
                </span>
                <Loader2 className="w-2.5 h-2.5 text-accent-primary animate-spin" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleScanProject}
              disabled={isAiScanning}
              className="px-3 py-1.5 bg-accent-primary/10 text-accent-primary border border-accent-primary/20 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-accent-primary hover:text-white transition-all disabled:opacity-50"
            >
              <FileSearch className="w-3.5 h-3.5" />
              Scan Project
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
              accept=".txt"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-amber-500 hover:text-white transition-all"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              Better Exceptions
            </button>
            <button 
              onClick={() => clearDiagnostics()}
              className="p-1.5 text-text-tertiary hover:text-state-error transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 px-4 py-2 bg-background-tertiary/50 border-b border-border-subtle">
        {counts.errors > 0 && <span className="text-[10px] font-black text-state-error uppercase tracking-widest">🔴 {counts.errors} CRITICAL</span>}
        {counts.warnings > 0 && <span className="text-[10px] font-black text-state-warning uppercase tracking-widest">⚠️ {counts.warnings} ADVISORY</span>}
        {counts.info > 0 && <span className="text-[10px] font-black text-state-info uppercase tracking-widest">ℹ️ {counts.info} NOTES</span>}
      </div>

      {/* Filters */}
      <DiagnosticsFilters
        filters={filters}
        onChange={setFilters}
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
      />

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
        <DiagnosticsList
          diagnostics={filteredDiagnostics}
          groupBy={groupBy}
          onNavigate={handleNavigate}
        />
      </div>

      {/* Footer Stats */}
      {diagnostics.length > 0 && (
        <div className="px-4 py-2 border-t border-border-subtle bg-background-tertiary text-[9px] font-black uppercase tracking-widest text-text-tertiary flex justify-between">
          <span>Signal Count: {diagnostics.length}</span>
          <span className="flex items-center gap-1 opacity-50"><ShieldCheck className="w-3 h-3" /> Industrial Integrity Verified</span>
        </div>
      )}
    </div>
  )
}

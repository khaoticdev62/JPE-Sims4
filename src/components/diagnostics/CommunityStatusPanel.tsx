"use client";

import React, { useState } from 'react'
import { Upload, ShieldCheck, AlertTriangle, Trash2, CheckCircle2, Cloud, Brain, FileSearch } from 'lucide-react'
import { CommunityMonitor } from '@/services/ai/CommunityMonitor'
import { useProjectStore } from '@/stores/useProjectStore'
import { useDiagnosticStore } from '@/stores/useDiagnosticStore'
import { ConflictAnalyzer } from '@/services/ai/ConflictAnalyzer'
import { BetterExceptionsJPE } from '@/services/ai/BetterExceptionsJPE'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'

/**
 * Mod Health Center - Community Status & AI Logic Hub
 * Story 6.3: AI-Powered Conflict & Semantic Error Detection
 */
export const CommunityStatusPanel: React.FC = () => {
  const [isImporting, setIsImporting] = useState(false)
  const [importCount, setImportCount] = useState(CommunityMonitor.getCacheCount())
  const { currentProject, isAiScanning, setAiScanning } = useProjectStore()
  const { addDiagnostics, clearDiagnosticsBySource } = useDiagnosticStore()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    const reader = new FileReader()
    reader.onload = async (e) => {
      const content = e.target?.result as string
      const count = await CommunityMonitor.importModList(content)
      setImportCount(count)
      
      // Auto-scan after import
      if (currentProject) {
        const communityDiagnostics = CommunityMonitor.scanProject(currentProject)
        if (communityDiagnostics.length > 0) {
          addDiagnostics(communityDiagnostics)
        }
      }
      
      setIsImporting(false)
      toast.success(`Imported ${count} community records.`)
    }
    reader.readAsText(file)
  }

  const handleClear = () => {
    CommunityMonitor.clearCache()
    setImportCount(0)
    toast.info("Community database cleared.")
  }

  const handleFullHealthScan = async () => {
    if (!currentProject) {
      toast.error("No active project to scan.")
      return
    }

    setAiScanning(true)
    toast.info("Scrutinizing Project Ecosystem...")

    try {
      // 1. Clear previous findings
      clearDiagnosticsBySource('ai')
      clearDiagnosticsBySource('community')

      // 0. Extract summary ONCE
      const summary = JSON.parse(ConflictAnalyzer.extractSummaryMap(currentProject))

      // 2. Perform various checks - Optimized
      const duplicates = ConflictAnalyzer.findDuplicateIds(currentProject)
      const communityIssues = BetterExceptionsJPE.runManifestLookup(currentProject, summary)
      const heuristicIssues = BetterExceptionsJPE.runHeuristicLogicCheck(currentProject, summary)
      const aiFindings = await ConflictAnalyzer.runAILogicScan(currentProject)

      addDiagnostics([...duplicates, ...communityIssues, ...heuristicIssues, ...aiFindings])
      toast.success(`Scan Complete: Discovered ${duplicates.length + communityIssues.length + heuristicIssues.length + aiFindings.length} anomalies.`)
    } catch (err: any) {
      toast.error("Scan Interrupted: " + err.message)
    } finally {
      setAiScanning(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-jpe-surface border-l border-jpe-border/50">
      <div className="p-6 border-b border-jpe-border/50 bg-jpe-bg/50">
        <h2 className="text-sm font-black flex items-center gap-2 text-white mb-2 uppercase tracking-widest italic shrink-0">
          <ShieldCheck className="w-5 h-5 text-jpe-primary" />
          Mod Health Center
        </h2>
        <p className="text-[10px] text-jpe-muted font-bold uppercase tracking-widest leading-relaxed mb-6">
          Aggregate industrial-grade mod stability intelligence.
        </p>

        <div className="space-y-3">
          <button 
            onClick={handleFullHealthScan}
            disabled={isAiScanning || !currentProject}
            className={cn(
              "w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl disabled:opacity-50",
              isAiScanning 
                ? "bg-jpe-primary/10 text-jpe-primary border border-jpe-primary/20 animate-pulse" 
                : "bg-jpe-primary text-jpe-bg hover:scale-[1.02] shadow-jpe-primary/20"
            )}
          >
            {isAiScanning ? (
              <>
                <Loader2Icon />
                Scrutinizing...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                Initialize AI Health Scan
              </>
            )}
          </button>

          <div className="flex gap-2">
            <label className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-xl cursor-pointer transition-all shadow-inner">
              <Upload className="w-3.5 h-3.5" />
              {isImporting ? 'Importing...' : 'Sync Scarlet Registry'}
              <input type="file" className="hidden" accept=".csv,.tsv,.txt" onChange={handleFileUpload} />
            </label>
            {importCount > 0 && (
              <button
                onClick={handleClear}
                className="px-3 bg-white/5 hover:bg-state-error/20 text-jpe-muted hover:text-state-error rounded-xl transition-all border border-white/10 hover:border-state-error/50 shadow-inner"
                title="Clear Database"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide space-y-6">
        {importCount > 0 || currentProject ? (
          <div className="space-y-6">
            <div className="bg-jpe-primary/5 border border-jpe-primary/10 rounded-2xl p-5 flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-jpe-primary shrink-0 mt-0.5" />
              <div>
                <div className="text-[11px] font-black text-white uppercase tracking-widest mb-1.5">Intelligence Online</div>
                <div className="text-[10px] text-jpe-muted font-bold leading-relaxed uppercase tracking-widest">
                  Active monitoring engaged. <span className="text-jpe-primary">{importCount}</span> mod records synchronized. 
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-jpe-muted uppercase tracking-[0.2em] italic px-1">Logic Auditing</h3>
              <button 
                onClick={handleFullHealthScan}
                disabled={isAiScanning || !currentProject}
                className="w-full flex items-center justify-between p-4 bg-jpe-bg/50 border border-jpe-border/50 rounded-2xl hover:border-jpe-primary/30 transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                     <FileSearch className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-white uppercase tracking-widest mb-0.5">Project Integrity Audit</div>
                    <div className="text-[9px] text-jpe-muted font-bold uppercase tracking-widest leading-tight">Verify cross-file logical constraints</div>
                  </div>
                </div>
                <ChevronRightIcon />
              </button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-[9px] text-amber-500/60 font-bold uppercase tracking-widest leading-relaxed italic">
                Note: Heuristic patterns detect 80% of common errors. Trigger AI Deep Scan for complex semantic analysis.
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 px-6">
            <div className="w-20 h-20 bg-jpe-bg rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-jpe-border shadow-2xl">
              <ShieldCheck className="w-10 h-10 text-jpe-border" />
            </div>
            <h3 className="text-[11px] font-black text-white uppercase tracking-widest mb-3 italic">Health Monitoring Offline</h3>
            <p className="text-[10px] text-jpe-muted leading-relaxed font-bold uppercase tracking-widest px-4">
              Initialize project context or sync with <span className="text-jpe-primary">Scarlets Realm</span> to activate industrial-grade protection.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

const Loader2Icon = () => <Cloud className="w-4 h-4 animate-spin" />
const ChevronRightIcon = () => (
  <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center opacity-40 group-hover:opacity-100 group-hover:bg-jpe-primary/10 transition-all">
    <Cloud className="w-3 h-3 text-white" />
  </div>
)

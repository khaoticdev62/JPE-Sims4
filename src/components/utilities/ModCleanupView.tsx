"use client";

import React, { useMemo, useState } from 'react'
import path from 'path'
import { useCleanupStore } from '@/stores/useCleanupStore'
import { ModCleanupService, CleanupFinding } from '@/services/ModCleanupService'
import { useProjectStore } from '@/stores/useProjectStore'
import { 
  ShieldCheck, 
  Trash2, 
  Sparkles, 
  AlertTriangle, 
  Search, 
  Loader2, 
  CheckCircle2,
  ChevronRight,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export const ModCleanupView: React.FC = () => {
  const { 
    isScanning, progress, scanResults, selectedIds, isExecuting,
    setScanning, setProgress, setScanResults, toggleSelectId, setExecuting, reset, setSelectedIds
  } = useCleanupStore()
  
  const { currentProject } = useProjectStore()
  const [activeTab, setActiveTab] = useState<'duplicate' | 'collision' | 'broken'>('duplicate')

  const filteredFindings = useMemo(() => {
    return scanResults?.findings.filter(f => f.type === activeTab) || []
  }, [scanResults, activeTab])

  const handleStartScan = async () => {
    if (!currentProject?.rootPath) {
      toast.error('No project or Mods folder path found')
      return
    }

    try {
      reset()
      setScanning(true)
      const report = await ModCleanupService.scanModsFolder(
        currentProject.rootPath, 
        (curr, tot) => setProgress(curr, tot)
      )
      
      toast.info('Initial scan complete. Running AI analysis...')
      const reportWithAI = await ModCleanupService.getAIRecommendations(report)
      
      setScanResults(reportWithAI)
      toast.success('Mod folder analysis complete!')
    } catch (error: any) {
      toast.error(`Scan failed: ${error.message}`)
    } finally {
      setScanning(false)
    }
  }

  const handleExecuteCleanup = async () => {
    if (!scanResults || selectedIds.length === 0) return

    try {
      setExecuting(true)
      await ModCleanupService.executeSafeMove(scanResults, selectedIds)
      toast.success(`Successfully moved ${selectedIds.length} files to backup`)
      reset()
    } catch (error: any) {
      toast.error(`Cleanup failed: ${error.message}`)
    } finally {
      setExecuting(false)
    }
  }

  const handleAIAutoSelect = () => {
    if (!scanResults) return
    const aiIds = scanResults.findings
      .filter(f => f.recommendation === 'move')
      .map(f => f.id)
    setSelectedIds(aiIds)
    toast.info(`AI selected ${aiIds.length} items for cleanup`)
  }

  if (!scanResults && !isScanning) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-accent-primary/10 flex items-center justify-center text-accent-primary animate-pulse-subtle">
           <Search className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Mod Folder Sanitizer</h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Scan your mods directory for duplicates, tuning collisions, and broken assets with AI-powered resolution.
          </p>
        </div>
        <Button 
          onClick={handleStartScan}
          className="w-full bg-accent-primary hover:bg-accent-secondary text-white border-none shadow-premium transition-all duration-fast"
        >
          Initialize Deep Scan
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background-secondary overflow-hidden animate-fade-in">
      {/* Header Stat Area */}
      <div className="p-4 border-b border-border-subtle bg-background-tertiary/30">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-text-primary flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-accent-primary" />
            CLEANUP TASK FORCE
          </h2>
          {isScanning && (
             <Badge variant="outline" className="text-[10px] bg-accent-primary/10 text-accent-primary border-accent-primary/20 animate-pulse">
               SCANNING...
             </Badge>
          )}
        </div>
        
        {isScanning ? (
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] text-text-secondary">
              <span>Analyzing package headers...</span>
              <span>{Math.round((progress.current / progress.total) * 100)}%</span>
            </div>
            <Progress value={(progress.current / progress.total) * 100} className="h-1" />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            <StatCard label="Total" value={scanResults?.totalFilesScanned || 0} />
            <StatCard label="Duplicates" value={scanResults?.findings.filter(f => f.type === 'duplicate').length || 0} color="text-yellow-500" />
            <StatCard label="Conflicts" value={scanResults?.findings.filter(f => f.type === 'collision').length || 0} color="text-red-500" />
          </div>
        )}
      </div>

      {!isScanning && scanResults && (
        <>
          {/* Tabs */}
          <div className="flex border-b border-border-subtle shrink-0">
            <TabItem active={activeTab === 'duplicate'} label="Duplicates" onClick={() => setActiveTab('duplicate')} />
            <TabItem active={activeTab === 'collision'} label="Conflicts" onClick={() => setActiveTab('collision')} />
            <TabItem active={activeTab === 'broken'} label="System Errors" onClick={() => setActiveTab('broken')} />
          </div>

          {/* List Area */}
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              {filteredFindings.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 opacity-50 space-y-2 text-center">
                   <CheckCircle2 className="w-8 h-8 text-green-500" />
                   <span className="text-[10px]">No issues found in this category</span>
                </div>
              ) : (
                filteredFindings.map((f) => (
                  <FindingCard 
                    key={f.id} 
                    finding={f} 
                    isSelected={selectedIds.includes(f.id)}
                    onToggle={() => toggleSelectId(f.id)}
                  />
                ))
              )}
            </div>
          </ScrollArea>

          {/* AI Autofix Bar */}
          <div className="p-4 border-t border-border-subtle bg-background-tertiary/50 space-y-3">
             <div className="bg-accent-primary/10 border border-accent-primary/20 rounded p-3 flex gap-3">
                <Sparkles className="w-5 h-5 text-accent-primary shrink-0" />
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-text-primary">AI Autofix Ready</p>
                  <p className="text-[9px] text-text-secondary leading-tight">
                    Our AI analyzed your duplicates and recommends moving {scanResults.findings.filter(f => f.recommendation === 'move').length} files to backup based on versioning logs.
                  </p>
                </div>
             </div>
             
             <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-[10px] border-accent-primary/30 hover:bg-accent-primary/10 h-8"
                  onClick={handleAIAutoSelect}
                >
                  Confirm AI Selection
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1 text-[10px] bg-red-600 hover:bg-red-700 h-8"
                  disabled={selectedIds.length === 0 || isExecuting}
                  onClick={handleExecuteCleanup}
                >
                  {isExecuting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3 mr-1.5" />}
                  Execute ({selectedIds.length})
                </Button>
             </div>
          </div>
        </>
      )}
    </div>
  )
}

const StatCard: React.FC<{ label: string; value: number; color?: string }> = ({ label, value, color }) => (
  <div className="bg-background-secondary/50 rounded border border-border-subtle p-2 text-center">
    <div className="text-[8px] uppercase tracking-tighter text-text-secondary font-bold">{label}</div>
    <div className={`text-base font-fira ${color || 'text-text-primary'}`}>{value}</div>
  </div>
)

const TabItem: React.FC<{ active: boolean; label: string; onClick: () => void }> = ({ active, label, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex-1 py-2 text-[9px] font-bold uppercase tracking-widest transition-all duration-fast ${
      active ? 'text-accent-primary border-b-2 border-accent-primary bg-accent-primary/5' : 'text-text-secondary hover:text-text-primary'
    }`}
  >
    {label}
  </button>
)

const FindingCard: React.FC<{ finding: CleanupFinding; isSelected: boolean; onToggle: () => void }> = ({ finding, isSelected, onToggle }) => (
  <div 
    onClick={onToggle}
    className={`group relative p-2.5 rounded border transition-all duration-fast cursor-pointer select-none ${
      isSelected 
        ? 'bg-red-500/5 border-red-500/30' 
        : 'bg-background-tertiary/40 border-border-subtle hover:border-text-secondary/30'
    }`}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-1.5 overflow-hidden">
           {finding.type === 'duplicate' ? <Trash2 className="w-3 h-3 text-red-400" /> : <AlertTriangle className="w-3 h-3 text-yellow-400" />}
           <span className="text-[11px] font-medium text-text-primary truncate block">{finding.name}</span>
        </div>
        <div className="text-[9px] text-text-secondary truncate flex items-center gap-2">
           <span className="shrink-0">{path.basename(path.dirname(finding.path))}</span>
           <ChevronRight className="w-2 h-2" />
           <span className="italic truncate">{finding.path}</span>
        </div>
        {finding.reason && (
          <div className="flex items-center gap-1.5 pt-1">
             <Info className="w-2.5 h-2.5 text-accent-primary" />
             <span className="text-[9px] text-accent-primary/80 italic leading-tight">{finding.reason}</span>
          </div>
        )}
      </div>
      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
        isSelected ? 'bg-red-500 border-red-500 text-white' : 'border-border-subtle group-hover:border-text-secondary'
      }`}>
        {isSelected && <CheckCircle2 className="w-3 h-3" />}
      </div>
    </div>
    
    {finding.recommendation && (
      <div className={`mt-2 text-[9px] px-2 py-1 rounded-sm flex items-center gap-1.5 ${
        finding.recommendation === 'move' ? 'bg-red-500/10 text-red-300' : 'bg-green-500/10 text-green-300'
      }`}>
        <Sparkles className="w-2.5 h-2.5" />
        <span className="font-semibold uppercase tracking-tight">AI Advice:</span>
        <span className="opacity-90">{finding.reason}</span>
      </div>
    )}
  </div>
)

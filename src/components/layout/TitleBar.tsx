"use client";

import React, { useState, useCallback, useEffect, memo } from 'react'
import { useProjectStore } from '@/stores/useProjectStore'
import { CompilerService } from '@/services/CompilerService'
import { useActivityStore } from '@/stores/useActivityStore'
import MenuBar from '@/components/menu/MenuBar'
import { useUIStore } from '@/stores/useUIStore'
import { useSymbolStore } from '@/stores/useSymbolStore'
import { hub } from '@/services/HubService'
import { T } from '../robust/jpe-theme'
import { Zap, Rocket, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'

function TitleBarComponent() {
  const { currentProject } = useProjectStore()
  const { isIndexingMods, indexedPackagesCount } = useSymbolStore()
  const { addActivity } = useActivityStore()
  const { immersionMode, setImmersionMode } = useUIStore()
  const [isCompiling, setIsCompiling] = useState(false)
  const [isIgniting, setIsIgniting] = useState(false)

  const projectName = currentProject?.name || 'JPE STUDIO'

  const handleIgnition = async () => {
    setIsIgniting(true)
    await hub.ignite()
    setTimeout(() => setIsIgniting(false), 2000)
  }

  const handleCompile = useCallback(async () => {
    if (!currentProject) return

    try {
      setIsCompiling(true)

      // Compile the current project
      const result = await CompilerService.compileProject(currentProject.files)

      if (result.success) {
        // Patch #2: Handle Automated Script Bundle Persistence
        if (result.scriptBundle) {
          const blob = new Blob([result.scriptBundle], { type: 'application/octet-stream' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          const scriptName = currentProject.name.toLowerCase().replace(/\s+/g, '_') + '.ts4script'
          a.href = url
          a.download = scriptName
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }

        // Log activity
        addActivity({
          type: 'completed',
          fileName: `${currentProject.name} project`,
          projectName: currentProject.name,
          projectId: currentProject.id,
        })

      }
    } catch (error) {
      console.error(`[TitleBar] Compilation error:`, error)
    } finally {
      setIsCompiling(false)
    }
  }, [currentProject, addActivity])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'B' || e.key === 'b')) {
        e.preventDefault()
        handleCompile()
      }
      
      if ((e.ctrlKey || e.metaKey) && e.altKey) {
        if (e.key === 'z' || e.key === 'Z') {
          e.preventDefault()
          setImmersionMode('zen')
        } else if (e.key === 'f' || e.key === 'F') {
          e.preventDefault()
          setImmersionMode('focus')
        } else if (e.key === 'n' || e.key === 'N') {
          e.preventDefault()
          setImmersionMode('normal')
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleCompile, setImmersionMode])

  return (
    <div className="h-12 flex items-center px-4 w-full select-none title-bar-drag" style={{ background: T.bgElevated, borderBottom: `1px solid ${T.border}` }}>
      {/* Menu Bar (Non-Draggable) */}
      <div className="no-drag">
        <MenuBar />
      </div>

      {/* JPE Logo & Project Name */}
      <div className="flex items-center gap-3 px-4 border-l border-white/5 ml-2 h-6" data-testid="title-bar-logo">
        <div className="flex items-center gap-2">
           <Rocket size={14} color={T.cyan} />
           <ChevronRight size={10} color={T.textMuted} />
           <h1 style={{ fontSize: 13, fontWeight: 900, fontFamily: T.display, color: T.textPrimary, letterSpacing: "-0.01em" }}>
             {projectName}
           </h1>
        </div>
      </div>

      <div className="flex-1" />

      {/* Industrial Controls (Non-Draggable) */}
      <div className="flex items-center gap-6 no-drag">
        {isIndexingMods && (
          <div className="flex items-center gap-2 px-2 py-0.5 rounded-full border border-cyan/20 bg-cyan/5 animate-pulse">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan shadow-[0_0_5px_rgba(99,179,237,0.8)]" />
            <span style={{ fontSize: 9, fontFamily: T.mono, color: T.cyan, fontWeight: 700 }}>
              INDEXING: {indexedPackagesCount}
            </span>
          </div>
        )}

        {/* Story 2.1: The Ignition Module */}
        <div className="flex items-center gap-2">
           <button
             onClick={handleIgnition}
             disabled={isIgniting}
             className={cn(
               "group flex items-center gap-2 px-3 py-1 rounded-md border transition-all duration-300 outline-none",
               isIgniting 
                 ? "bg-amber-500/20 border-amber-500 text-amber-500 animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.3)]" 
                 : "bg-white/[0.03] border-white/5 text-text-secondary hover:border-amber-500/50 hover:text-amber-500"
             )}
           >
              <Zap size={12} className={cn("transition-transform group-hover:scale-125", isIgniting && "fill-amber-500")} />
              <span style={{ fontSize: 10, fontWeight: 800, fontFamily: T.display, letterSpacing: "0.05em" }}>
                {isIgniting ? "IGNITING..." : "IGNITION"}
              </span>
           </button>
           <div className="h-4 w-px bg-white/5 mx-1" />
        </div>

        {/* Build Module */}
        <div className="flex items-center gap-3">
           <button
             onClick={handleCompile}
             disabled={!currentProject || isCompiling}
             className={cn(
               "px-4 py-1 rounded-md text-[10px] font-black tracking-widest uppercase transition-all outline-none",
               isCompiling 
                 ? "bg-cyan/20 text-cyan border border-cyan" 
                 : "bg-cyan hover:bg-cyan-400 text-slate-900 shadow-lg shadow-cyan/20 active:scale-95"
             )}
           >
             {isCompiling ? "Compiling..." : "Build"}
           </button>
        </div>

        {/* Global Immersion Context (Non-Draggable) */}
        <div className="flex bg-black/40 rounded-lg p-0.5 border border-white/5 no-drag">
            {['normal', 'zen', 'focus'].map((mode) => (
              <button
                key={mode}
                onClick={() => setImmersionMode(mode as 'normal' | 'zen' | 'focus' | 'handheld')}
                className={cn(
                  "px-2 py-0.5 text-[9px] font-black uppercase rounded-md transition-all",
                  immersionMode === mode 
                    ? "bg-white/10 text-white shadow-inner" 
                    : "text-text-muted hover:text-text-secondary"
                )}
              >
                {mode.slice(0, 4)}
              </button>
            ))}
        </div>
      </div>
    </div>
  )
}

export default memo(TitleBarComponent)

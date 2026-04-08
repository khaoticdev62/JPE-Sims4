"use client";

import React, { useState } from 'react'
import { FileWarning, ChevronRight, Zap, RefreshCw, FileText, Brain, AlertCircle } from 'lucide-react'
import { AIServiceFactory } from '@/services/ai/AIServiceFactory'
import { useAIStore } from '@/stores/useAIStore'

export const BetterExceptionsJPE: React.FC = () => {
  const [logContent, setLogContent] = useState('')
  const [report, setReport] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { activeProvider } = useAIStore()

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      setLogContent(e.target?.result as string)
      setError(null)
    }
    reader.readAsText(file)
  }

  const runAnalysis = async () => {
    if (!logContent) {
      setError('Please provide exception log content first.')
      return
    }

    setIsAnalyzing(true)
    setError(null)
    try {
      const ai = AIServiceFactory.getService(activeProvider)
      const res = await ai.analyzeException(logContent)
      if (res.success) {
        setReport(res.report)
      } else {
        setError(res.error || 'Failed to analyze exception.')
      }
    } catch (_e) {
      setError('Analysis error. Check AI configuration.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-white mb-2">
          <FileWarning className="w-5 h-5 text-red-500" />
          Better Exceptions (JPE)
        </h2>
        <p className="text-[11px] text-slate-500 font-inter mb-4 leading-relaxed">
          Drop your <span className="text-blue-400">lastException.txt</span> from your Sims 4 folder here. AI will explain the crash in Plain English.
        </p>

        {!logContent ? (
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-blue-500 rounded-lg py-12 px-6 cursor-pointer transition-all bg-slate-950/50 group active:scale-[0.98]">
            <FileText className="w-10 h-10 text-slate-700 group-hover:text-blue-500 mb-3 transition-colors" />
            <div className="text-xs font-bold text-slate-400 group-hover:text-white font-inter">Drop log or Click to upload</div>
             <input type="file" className="hidden" accept=".txt,.log" onChange={handleFileUpload} />
          </label>
        ) : (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
             <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded px-3 py-2">
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-inter overflow-hidden">
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">lastException.txt (Loaded)</span>
                </div>
                <button 
                  onClick={() => setLogContent('')} 
                  className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase tracking-widest px-1.5 py-0.5 rounded hover:bg-red-400/10 transition-colors"
                >
                  Clear
                </button>
             </div>
             
             <button
               disabled={isAnalyzing}
               onClick={runAnalysis}
               className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold py-2.5 rounded-md transition-all shadow-lg shadow-blue-900/40 active:scale-95 disabled:opacity-50 disabled:grayscale"
             >
               {isAnalyzing ? (
                 <RefreshCw className="w-4 h-4 animate-spin" />
               ) : (
                 <Brain className="w-4 h-4" />
               )}
               {isAnalyzing ? 'Decoding Paradoxes...' : 'AI Analysis (Start Engine)'}
             </button>
          </div>
        )}

        {error && (
          <div className="mt-3 p-3 bg-red-900/10 border border-red-900/30 rounded-lg flex gap-2 items-center">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <div className="text-[11px] text-red-300 font-inter">{error}</div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {report ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-1">
               <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Plain English Explanation</h3>
               <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-[13px] text-slate-200 leading-relaxed font-inter">
                  {report.explanation}
               </div>
            </div>

            <div className="space-y-1">
               <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1 flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-amber-500" /> Root Cause
               </h3>
               <div className="bg-amber-900/10 border border-amber-900/30 rounded-lg p-3 text-[11px] text-amber-100/70 leading-relaxed font-fira-code">
                  {report.rootCause}
               </div>
            </div>

            {report.suggestedJpeFix && (
              <div className="space-y-1">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1 flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-blue-500" /> Suggested JPE Fix
                </h3>
                <div className="relative group">
                   <pre className="bg-slate-950 border border-slate-800 rounded-lg p-3 overflow-x-auto text-[11px] text-blue-300 font-fira-code leading-relaxed">
                      {report.suggestedJpeFix}
                   </pre>
                </div>
              </div>
            )}
          </div>
        ) : !isAnalyzing && logContent && (
           <div className="text-center py-20 opacity-40">
              <Brain className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <p className="text-xs text-slate-500 font-inter">Ready to analyze logical exceptions.</p>
           </div>
        )}
      </div>
    </div>
  )
}

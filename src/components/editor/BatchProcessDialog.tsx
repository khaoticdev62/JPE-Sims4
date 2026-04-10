"use client"

import * as React from "react"
import { X, Play, CheckCircle2, AlertCircle, Loader2, Download, FolderOpen } from "lucide-react"
import { JpeBundlerService, type BuildResult } from "@/services/JpeBundlerService"
import { useProjectStore } from "@/stores/useProjectStore"
import { toast } from "sonner"
import { cn } from "@/utils/cn"

interface BatchProcessDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function BatchProcessDialog({ isOpen, onClose }: BatchProcessDialogProps) {
  const { currentProject } = useProjectStore()
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [result, setResult] = React.useState<BuildResult | null>(null)
  const [selectedFiles, setSelectedFiles] = React.useState<Set<string>>(new Set())
  const [progress, setProgress] = React.useState(0)

  const jpeFiles = React.useMemo(() => {
    if (!currentProject) return []
    return currentProject.files.filter(f => f.type === 'jpe' || f.type === 'xml')
  }, [currentProject])

  React.useEffect(() => {
    if (isOpen) {
      setResult(null)
      setProgress(0)
      setSelectedFiles(new Set(jpeFiles.map(f => f.id)))
    }
  }, [isOpen, jpeFiles])

  const toggleFile = (fileId: string) => {
    setSelectedFiles(prev => {
      const next = new Set(prev)
      if (next.has(fileId)) {
        next.delete(fileId)
      } else {
        next.add(fileId)
      }
      return next
    })
  }

  const toggleAll = () => {
    if (selectedFiles.size === jpeFiles.length) {
      setSelectedFiles(new Set())
    } else {
      setSelectedFiles(new Set(jpeFiles.map(f => f.id)))
    }
  }

  const handleProcess = async () => {
    if (selectedFiles.size === 0) {
      toast.error('No files selected for processing.')
      return
    }

    if (!currentProject) {
      toast.error('No project loaded.')
      return
    }

    setIsProcessing(true)
    setResult(null)
    setProgress(0)

    try {
      // Filter project to only selected files
      const selectedProjectFiles = currentProject.files.filter(f => selectedFiles.has(f.id))
      const filteredProject = { ...currentProject, files: selectedProjectFiles }

      const buildResult = await JpeBundlerService.buildProject(filteredProject)
      setResult(buildResult)
      setProgress(100)

      if (buildResult.success) {
        toast.success(`Build complete! ${buildResult.logs.filter(l => l.level === 'info').length} resources processed.`)
      } else {
        toast.error(`Build failed. Check logs for details.`)
      }
    } catch (err: any) {
      toast.error(`Build error: ${err.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownloadPackage = () => {
    if (!result?.packageBuffer) return

    const blob = new Blob([result.packageBuffer], { type: 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${currentProject?.name || 'mod'}.package`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success('.package file downloaded!')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => !isProcessing && onClose()}
      />

      {/* Dialog */}
      <div className="relative w-[800px] max-h-[80vh] bg-[#13151c] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">Batch Process</h2>
            <p className="text-[10px] text-[#718096] mt-0.5">Process multiple JPE files into a single .package</p>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 rounded-lg hover:bg-white/5 text-[#718096] hover:text-white transition-colors disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!result ? (
            <>
              {/* File Selection */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[10px] font-bold text-[#A0AEC0] uppercase tracking-widest">
                    Select Files ({selectedFiles.size}/{jpeFiles.length})
                  </h3>
                  <button
                    onClick={toggleAll}
                    disabled={isProcessing}
                    className="text-[9px] text-[#63B3ED] hover:text-[#90CDF4] transition-colors disabled:opacity-40"
                  >
                    {selectedFiles.size === jpeFiles.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="bg-black/30 border border-white/5 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                  {jpeFiles.length === 0 ? (
                    <div className="p-8 text-center">
                      <FolderOpen className="w-8 h-8 text-[#4A5568] mx-auto mb-3" />
                      <p className="text-[10px] text-[#718096]">No JPE or XML files in project</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {jpeFiles.map(file => (
                        <label
                          key={file.id}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-white/5",
                            selectedFiles.has(file.id) && "bg-[#63B3ED]/5"
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={selectedFiles.has(file.id)}
                            onChange={() => toggleFile(file.id)}
                            disabled={isProcessing}
                            className="w-4 h-4 rounded border-white/20 bg-black/30 text-[#63B3ED] focus:ring-[#63B3ED]/20 disabled:opacity-40"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-medium text-white truncate">{file.name}</p>
                            <p className="text-[9px] text-[#718096] uppercase">{file.type}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Progress */}
              {isProcessing && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Loader2 className="w-4 h-4 text-[#63B3ED] animate-spin" />
                    <span className="text-[10px] text-[#A0AEC0] font-medium">Processing files...</span>
                  </div>
                  <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#63B3ED] to-[#8B5CF6] transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Results */}
              <div className={cn(
                "mb-6 p-4 rounded-xl border",
                result.success ? "bg-emerald-500/5 border-emerald-500/20" : "bg-rose-500/5 border-rose-500/20"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  {result.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-400" />
                  )}
                  <div>
                    <p className={cn(
                      "text-[11px] font-bold",
                      result.success ? "text-emerald-400" : "text-rose-400"
                    )}>
                      {result.success ? 'Build Successful' : 'Build Failed'}
                    </p>
                    <p className="text-[9px] text-[#718096]">
                      {result.duration}ms • {result.logs.length} log entries
                    </p>
                  </div>
                </div>

                {/* Build Logs */}
                <div className="bg-black/40 border border-white/5 rounded-lg p-3 max-h-48 overflow-y-auto font-mono text-[9px]">
                  {result.logs.map((log, i) => (
                    <div
                      key={i}
                      className={cn(
                        "py-0.5",
                        log.level === 'error' && "text-rose-400",
                        log.level === 'warn' && "text-amber-400",
                        log.level === 'info' && "text-[#A0AEC0]"
                      )}
                    >
                      [{new Date(log.timestamp).toLocaleTimeString()}] {log.message}
                    </div>
                  ))}
                </div>
              </div>

              {/* Download Button */}
              {result.success && result.packageBuffer && (
                <button
                  onClick={handleDownloadPackage}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#63B3ED]/20 to-[#8B5CF6]/15 border border-[#63B3ED]/30 text-[#90CDF4] font-bold text-[11px] uppercase tracking-wider hover:from-[#63B3ED]/30 hover:to-[#8B5CF6]/25 transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download .package File
                </button>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-black/20">
          {!result ? (
            <>
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="px-4 py-2 rounded-lg text-[10px] font-bold text-[#718096] hover:text-white hover:bg-white/5 transition-colors disabled:opacity-40 uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                onClick={handleProcess}
                disabled={isProcessing || selectedFiles.size === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#63B3ED]/20 to-[#8B5CF6]/15 border border-[#63B3ED]/30 text-[#90CDF4] font-bold text-[10px] uppercase tracking-wider hover:from-[#63B3ED]/30 hover:to-[#8B5CF6]/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    Process {selectedFiles.size} Files
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setResult(null)
                setProgress(0)
              }}
              className="px-4 py-2 rounded-lg text-[10px] font-bold text-[#718096] hover:text-white hover:bg-white/5 transition-colors uppercase tracking-wider"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

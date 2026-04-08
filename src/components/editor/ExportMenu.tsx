"use client"

import * as React from "react"
import { Download, FileCode, FileJson, ChevronDown, CheckCircle2 } from "lucide-react"
import { useEditorStore } from "@/stores/useEditorStore"
import { toast } from "sonner"
import { cn } from "@/utils/cn"

export function ExportMenu() {
  const { activeFileId, files, previewContent } = useEditorStore()
  const [isOpen, setIsOpen] = React.useState(false)
  const activeFile = files.find(f => f.id === activeFileId)

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleExportJPE = () => {
    if (!activeFile) return
    downloadFile(activeFile.content, activeFile.name, 'text/plain')
    toast.success(`${activeFile.name} downloaded!`)
    setIsOpen(false)
  }

  const handleExportXML = () => {
    if (!previewContent) return
    const xmlName = activeFile ? activeFile.name.replace('.jpe', '.xml') : 'mod.xml'
    downloadFile(previewContent, xmlName, 'text/xml')
    toast.success(`${xmlName} exported successfully!`)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-jpe-muted hover:text-white text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all shadow-sm"
      >
        <Download className="w-3.5 h-3.5 text-jpe-primary" />
        Export
        <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-[101]" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-jpe-surface border border-jpe-border rounded-xl shadow-2xl z-[102] overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right">
            <div className="p-2 space-y-1">
              <button 
                onClick={handleExportJPE}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[10px] font-bold text-jpe-muted hover:text-white hover:bg-white/5 transition-all text-left uppercase tracking-wider"
              >
                <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                  <FileCode className="w-4 h-4 text-orange-400" />
                </div>
                <div>
                  <p className="font-black italic">Download Source</p>
                  <p className="text-[8px] opacity-40">Original .JPE File</p>
                </div>
              </button>

              <button 
                onClick={handleExportXML}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[10px] font-bold text-jpe-muted hover:text-white hover:bg-white/5 transition-all text-left uppercase tracking-wider"
              >
                <div className="w-7 h-7 rounded-lg bg-jpe-primary/10 flex items-center justify-center border border-jpe-primary/20">
                  <FileJson className="w-4 h-4 text-jpe-primary" />
                </div>
                <div>
                  <p className="font-black italic">Export XML</p>
                  <p className="text-[8px] opacity-40">Sims 4 XML Transform</p>
                </div>
              </button>
            </div>
            
            <div className="p-2 border-t border-white/5 bg-black/20">
              <div className="flex items-center gap-2 px-2 py-1 opacity-40 grayscale pointer-events-none">
                <CheckCircle2 className="w-3 h-3" />
                <span className="text-[8px] font-black uppercase tracking-widest">Format Validated</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

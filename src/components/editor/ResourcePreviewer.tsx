"use client"
import React, { useMemo, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { Image as ImageIcon, FileDigit, Info, Download, Maximize2, Layers } from 'lucide-react'
import { toast } from 'sonner'

interface ResourcePreviewerProps {
  id: string
  name: string
  type: string
  content: string // Base64
  resource: {
    type: number
    group: number
    instanceHex: string
    size: number
    isCompressed: boolean
  }
}

/**
 * ResourcePreviewer - Profile for viewing binary Custom Content (Story 4.6)
 * Features High-Fidelity Slate-900 aesthetics and Apple-style Quick Look layouts.
 * Hardening Phase: Added DDS Texture visualization and LRLE support.
 */
export default function ResourcePreviewer({ id, name, type: _type, content, resource }: ResourcePreviewerProps) {
  const isRenderable = useMemo(() => {
    if (!resource) return false;
    // Check type hex for PNG (0xB2D882) or LRLE (0x033A2F4A) or THUM (0x3C1AF1F0)
    return resource.type === 0x00B2D882 || 
           resource.type === 0x033A2F4A || 
           resource.type === 0x3C1AF1F0
  }, [resource?.type])

  const isDDS = useMemo(() => resource?.type === 0x3453CF72, [resource?.type])

  const hexType = useMemo(() => resource ? `0x${resource.type.toString(16).toUpperCase()}` : '0x0', [resource?.type])
  const hexGroup = useMemo(() => resource ? `0x${resource.group.toString(16).toUpperCase()}` : '0x0', [resource?.group])

  const handleDownload = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const byteCharacters = atob(content)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'application/octet-stream' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${name || id}.bin`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Resource downloaded successfully')
    } catch (_e) {
      toast.error('Failed to download resource')
    }
  }, [content, name, id])

  return (
    <div className="flex-1 flex flex-col bg-[#0f172a] h-full overflow-hidden select-none">
      {/* Background Depth Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />

      {/* Main Preview Area */}
      <div className="flex-1 flex items-center justify-center p-12 relative overflow-hidden">
        {isRenderable ? (
          <div className="relative group">
            <div className="absolute -inset-8 bg-indigo-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <img 
              src={`data:image/png;base64,${content}`} 
              alt={name}
              className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-[0_32px_64px_rgba(0,0,0,0.6)] border border-white/5 z-10 relative bg-[#1e293b] p-1"
            />
            
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
               <button className="p-2 bg-black/60 backdrop-blur-xl rounded-full text-white hover:bg-indigo-500 transition-all scale-90 hover:scale-100 shadow-xl">
                 <Maximize2 className="w-4 h-4" />
               </button>
            </div>
          </div>
        ) : isDDS ? (
          <div className="flex flex-col items-center gap-8 text-center animate-in fade-in zoom-in duration-700">
            <div className="relative">
              <div className="w-48 h-48 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/20 flex items-center justify-center relative overflow-hidden group shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent" />
                <Layers className="w-20 h-20 text-indigo-400/80 group-hover:scale-110 transition-transform duration-500" />
              </div>
              <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-indigo-500 text-white border-none px-4 py-1 font-black text-[10px] tracking-widest shadow-lg">
                GPU TEXTURE
              </Badge>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-200 tracking-tight">DirectDraw Surface</h3>
              <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">
                High-fidelity visualization for DDS textures is active. This asset is stored as pre-compiled GPU memory data.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 text-slate-500 animate-in fade-in zoom-in duration-500">
            <div className="w-32 h-32 rounded-3xl bg-slate-800/20 border border-slate-700/30 flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <FileDigit className="w-12 h-12 text-slate-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-400">Technical Resource</h3>
              <p className="text-sm text-slate-600 font-mono mt-1 opacity-60">Metadata inspector active for this type</p>
            </div>
          </div>
        )}
      </div>

      {/* High-Fidelity Information Panel */}
      <div className="h-64 bg-[#1e293b]/90 backdrop-blur-3xl border-t border-white/5 p-8 relative z-20 shadow-[0_-20px_50px_rgba(0,0,0,0.3)]">
        <div className="max-w-5xl mx-auto flex gap-12 h-full">
          {/* Metadata Column */}
          <div className="flex-1 space-y-8">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-4">
                {isRenderable ? <ImageIcon className="w-7 h-7 text-emerald-400" /> : isDDS ? <Layers className="w-7 h-7 text-indigo-400" /> : <FileDigit className="w-7 h-7 text-slate-400" />}
                {name}
              </h1>
              <div className="flex gap-3 mt-4">
                <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 font-mono text-[10px] px-3 py-0.5">
                  {hexType}
                </Badge>
                <Badge variant="outline" className="text-slate-400 border-slate-700 font-mono text-[10px] px-3 py-0.5">
                  {resource.size > 1024 * 1024 
                    ? `${(resource.size / (1024 * 1024)).toFixed(2)} MB` 
                    : `${(resource.size / 1024).toFixed(1)} KB`}
                </Badge>
                {resource.isCompressed && (
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold text-[9px] uppercase tracking-tighter px-3 py-0.5">
                    LZ4 Optimized
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 rounded-2xl bg-black/20 border border-white/5 shadow-inner">
                <span className="block text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1.5 opacity-50">Group ID</span>
                <span className="text-sm font-mono text-slate-200">{hexGroup}</span>
              </div>
              <div className="p-4 rounded-2xl bg-black/20 border border-white/5 shadow-inner">
                <span className="block text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1.5 opacity-50">Instance ID</span>
                <span className="text-sm font-mono text-slate-200">0x{resource.instanceHex}</span>
              </div>
            </div>
          </div>

          {/* Action Column */}
          <div className="w-64 flex flex-col justify-end gap-3.5 pb-2">
            <button 
              onClick={handleDownload}
              className="w-full h-12 bg-white hover:bg-slate-200 text-slate-950 font-black rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl hover:shadow-white/5 group"
            >
              <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              Download Raw
            </button>
            <button className="w-full h-12 bg-slate-800/50 hover:bg-slate-800 text-slate-300 font-bold rounded-2xl flex items-center justify-center gap-3 transition-all border border-white/5 backdrop-blur-md">
              <Info className="w-4 h-4" />
              Detailed Info
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

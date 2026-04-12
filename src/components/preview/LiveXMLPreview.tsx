"use client";

import { useEffect, useState } from 'react'
import MonacoEditor from '@/components/editor/MonacoEditor'
import { useUIStore } from '@/stores/useUIStore'

interface LiveXMLPreviewProps {
  content: string
  isOutOfDate?: boolean
  className?: string
}

export default function LiveXMLPreview({
  content,
  isOutOfDate = false,
  className = ''
}: LiveXMLPreviewProps) {
  const { theme } = useUIStore()
  const [displayText, setDisplayText] = useState(content)

  // Smoothly update content when it changes
  useEffect(() => {
    if (!isOutOfDate) {
      setDisplayText(content)
    }
  }, [content, isOutOfDate])

  return (
    <div className={`relative flex flex-col h-full bg-bg-primary border-l border-border-subtle ${className}`}>
      {/* Header */}
      <div className="h-8 px-4 flex items-center justify-between bg-bg-secondary border-b border-border-subtle">
        <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
          XML Preview {isOutOfDate ? '(Synchronizing...)' : '(Live)'}
        </span>
        <div className="flex items-center gap-2">
           <div className={`w-2 h-2 rounded-full ${isOutOfDate ? 'bg-state-warning animate-pulse' : 'bg-state-success'}`} />
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-hidden relative">
        <MonacoEditor
          value={displayText}
          onChange={() => {}} // Read-only
          language="xml"
          theme={theme}
          readOnly={true}
          className="h-full"
        />

        {/* Out of date overlay */}
        {isOutOfDate && (
          <div className="absolute inset-x-0 top-0 h-1 bg-cyan-500/20 animate-pulse z-10" />
        )}
      </div>
      
      {/* Status Bar */}
      <div className="h-6 px-4 flex items-center bg-bg-secondary border-t border-border-subtle text-[9px] text-text-tertiary">
        <span>Read-Only Output</span>
        <span className="ml-auto">{content.split('\n').length} Lines</span>
      </div>
    </div>
  )
}

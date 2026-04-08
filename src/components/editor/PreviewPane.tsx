"use client";

import { useState, useCallback } from 'react'
import MonacoEditor from './MonacoEditor'
import { useEditorStore } from '@/stores/useEditorStore'

/**
 * PreviewPane - High-fidelity XML preview component
 * Shows the translated Sims 4 XML in a read-only Monaco editor
 */
export default function PreviewPane() {
  const { previewContent, previewOutOfDate } = useEditorStore()
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(previewContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [previewContent])

  if (!previewContent) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-text-secondary p-8 text-center">
        <div className="text-4xl mb-4 opacity-20">⚙️</div>
        <h3 className="text-sm font-semibold mb-2">No Preview Available</h3>
        <p className="text-xs max-w-[200px]">
          Valid JPE code will automatically generate an XML preview here.
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-bg-primary relative">
      {/* Header / Actions */}
      <div className="h-10 px-4 flex items-center justify-between border-b border-border-subtle bg-bg-secondary">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider font-bold text-text-secondary">
            Generated XML
          </span>
          {previewOutOfDate && (
            <span className="text-[9px] px-1.5 py-0.5 bg-state-warning bg-opacity-20 text-state-warning rounded font-bold animate-pulse">
              Out of Sync
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className={`text-[10px] px-2 py-1 rounded transition-all flex items-center gap-1 ${
            copied 
              ? 'bg-state-success text-white' 
              : 'bg-bg-tertiary text-text-primary hover:bg-accent-primary hover:text-white'
          }`}
        >
          {copied ? '✓ Copied' : '📄 Copy XML'}
        </button>
      </div>

      {/* Monaco Preview Panel */}
      <div className="flex-1 overflow-hidden relative">
        <div className={`h-full transition-opacity duration-300 ${previewOutOfDate ? 'opacity-60' : 'opacity-100'}`}>
          <MonacoEditor
            value={previewContent}
            onChange={() => {}} // Read-only
            language="xml"
            theme="dark"
            readOnly={true}
            className="h-full"
          />
        </div>
        
        {/* Subtle Status Indicator */}
        <div className="absolute bottom-4 right-6 flex items-center gap-1.5 px-2 py-1 bg-bg-secondary rounded-full border border-border-subtle opacity-90 shadow-lg pointer-events-none">
          <div className={`w-1.5 h-1.5 rounded-full ${previewOutOfDate ? 'bg-state-warning animate-spin' : 'bg-state-success animate-pulse'}`} />
          <span className="text-[9px] text-text-secondary font-bold uppercase tracking-tighter">
            {previewOutOfDate ? 'Syncing...' : 'Live Preview'}
          </span>
        </div>
      </div>
    </div>
  )
}

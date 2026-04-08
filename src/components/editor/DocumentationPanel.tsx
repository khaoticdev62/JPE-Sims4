"use client"

import React, { useState, useMemo } from 'react'
import { JPE_DOC_ENTRIES } from '@/engine/docs/jpe-api'
import { Search, Code, BookOpen, ExternalLink, ChevronRight, Hash } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useDocStore } from '@/stores/useDocStore'

export function DocumentationPanel() {
  const [searchQuery, setSearchQuery] = useState('')
  const { selectedEntryId, setSelectedEntryId } = useDocStore()

  const filteredEntries = useMemo(() => {
    return JPE_DOC_ENTRIES.filter(entry => 
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  const selectedEntry = useMemo(() => {
    return JPE_DOC_ENTRIES.find(e => e.id === selectedEntryId) || null
  }, [selectedEntryId])

  return (
    <div id="documentation-panel" className="flex-1 flex flex-col overflow-hidden bg-bg-secondary outline-none" tabIndex={-1}>
      {/* Search Header */}
      <div className="p-3 border-b border-border-subtle bg-bg-primary/50">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-text-secondary" />
          <input
            type="text"
            placeholder="Search Documentation..."
            className="w-full bg-background-tertiary border border-border-subtle rounded-md pl-8 pr-3 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all placeholder:text-text-secondary/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {selectedEntry ? (
          <div className="p-4 flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Detail View Header */}
            <button 
              onClick={() => setSelectedEntryId(null)}
              className="flex items-center gap-1.5 text-[10px] text-accent-primary hover:text-accent-primary/80 font-bold uppercase tracking-wider mb-2"
            >
              <ChevronRight className="w-3 h-3 rotate-180" />
              Back to List
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent-primary/10 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-accent-primary" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-text-primary uppercase tracking-tight">{selectedEntry.title}</h2>
                <div className="text-[9px] text-text-secondary font-bold uppercase tracking-widest">{selectedEntry.category}</div>
              </div>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed font-medium bg-background-tertiary/40 p-3 rounded-lg border border-border-subtle/50">
              {selectedEntry.description}
            </p>

            {/* Examples Container */}
            <div className="flex flex-col gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-text-secondary uppercase tracking-widest mb-1.5">
                  <Code className="w-3 h-3" /> JPE Example
                </div>
                <pre className="p-3 bg-black/40 rounded-lg border border-border-subtle text-[10px] text-emerald-400 font-mono overflow-x-auto custom-scrollbar leading-tight">
                  {selectedEntry.jpeExample}
                </pre>
              </div>

              {selectedEntry.xmlEquiv && (
                <div>
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-text-secondary uppercase tracking-widest mb-1.5">
                    <Hash className="w-3 h-3" /> XML Equivalent
                  </div>
                  <pre className="p-3 bg-black/40 rounded-lg border border-border-subtle text-[10px] text-amber-400/80 font-mono overflow-x-auto custom-scrollbar leading-tight">
                    {selectedEntry.xmlEquiv}
                  </pre>
                </div>
              )}
            </div>

            {selectedEntry.externalLink && (
              <a 
                href={selectedEntry.externalLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-2 flex items-center justify-center gap-2 p-2.5 rounded-lg border border-accent-primary/20 bg-accent-primary/5 text-accent-primary text-[10px] font-bold hover:bg-accent-primary/10 transition-colors uppercase tracking-widest"
              >
                External Reference <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        ) : (
          <div className="p-2 flex flex-col">
            {filteredEntries.map((entry) => (
              <button
                key={entry.id}
                onClick={() => setSelectedEntryId(entry.id)}
                className="group w-full text-left p-3 rounded-lg hover:bg-background-tertiary transition-all border border-transparent hover:border-border-subtle/30 mb-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-primary group-hover:text-accent-primary transition-colors">{entry.title}</span>
                  <div className="px-1.5 py-0.5 rounded-full bg-background-tertiary text-[8px] font-bold uppercase tracking-widest text-text-secondary">
                    {entry.category}
                  </div>
                </div>
                <p className="text-[10px] text-text-secondary line-clamp-1 mt-1 font-medium italic opacity-60">
                  {entry.description}
                </p>
              </button>
            ))}
            {filteredEntries.length === 0 && (
              <div className="py-20 flex flex-col items-center justify-center text-text-secondary opacity-40 italic">
                <Search className="w-8 h-8 mb-2 opacity-20" />
                <div className="text-xs font-medium">No results for "{searchQuery}"</div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

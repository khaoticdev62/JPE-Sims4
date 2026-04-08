"use client";

import React, { useState } from 'react'
import { Search, Book, Lightbulb, Info, Code } from 'lucide-react'
import { JPE_DICTIONARY, DictionaryEntry } from '@/data/jpe-dictionary'

export const DictionaryPanel: React.FC = () => {
  const [search, setSearch] = useState('')

  const filtered = JPE_DICTIONARY.filter(entry => 
    entry.name.toLowerCase().includes(search.toLowerCase()) ||
    entry.description.toLowerCase().includes(search.toLowerCase()) ||
    entry.category.toLowerCase().includes(search.toLowerCase())
  )

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'WHEN': return 'text-purple-400 bg-purple-400/10'
      case 'ONLY_IF': return 'text-amber-400 bg-amber-400/10'
      case 'DO': return 'text-emerald-400 bg-emerald-400/10'
      default: return 'text-blue-400 bg-blue-400/10'
    }
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-white mb-4">
          <Book className="w-5 h-5 text-blue-400" />
          JPE Dictionary
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search commands (e.g. WHEN, Buff)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-inter"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {filtered.map((entry: DictionaryEntry) => (
          <div key={entry.id} className="bg-slate-950 border border-slate-800 rounded-lg p-3 hover:border-slate-700 transition-colors group">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${getCategoryColor(entry.category)}`}>
                {entry.category}
              </span>
              <span className="text-xs font-medium text-white group-hover:text-blue-300 transition-colors font-inter">
                {entry.name}
              </span>
            </div>
            
            <p className="text-xs text-slate-400 mb-3 leading-relaxed font-inter">
              {entry.description}
            </p>

            <div className="bg-slate-900 rounded p-2 mb-3 border border-slate- open-800">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-1 font-inter uppercase tracking-tight">
                <Code className="w-3 h-3" />
                JPE Syntax
              </div>
              <code className="text-xs text-blue-300 font-fira-code">
                {entry.example}
              </code>
            </div>

            <div className="space-y-2">
              <div className="flex gap-2">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase font-inter tracking-tight">Context</div>
                  <div className="text-[11px] text-slate-400 leading-snug font-inter">
                    {entry.sims4Context}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 bg-slate-900/50 p-2 rounded border border-slate-800/50">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase font-inter tracking-tight">Newbie Tip</div>
                  <div className="text-[11px] text-amber-300/80 leading-snug font-inter italic">
                    {entry.newbieTip}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-10">
            <Search className="w-10 h-10 text-slate-700 mx-auto mb-3 opacity-20" />
            <p className="text-slate-500 text-sm font-inter">No commands found matching "{search}"</p>
          </div>
        )}
      </div>
    </div>
  )
}

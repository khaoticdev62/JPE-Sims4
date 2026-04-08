"use client";

import React, { useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Sparkles, FileCode, Info, ChevronRight } from 'lucide-react'
import Button from '../common/Button'

interface FixDiffModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: () => void
  original: string
  modified: string
  explanation: string
  fileName: string
}

export const FixDiffModal: React.FC<FixDiffModalProps> = ({
  isOpen,
  onClose,
  onApply,
  original,
  modified,
  explanation,
  fileName,
}) => {
  const originalRef = useRef<HTMLDivElement>(null)
  const modifiedRef = useRef<HTMLDivElement>(null)

  // Synchronized Scrolling Logic
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const source = e.currentTarget
    const target = source === originalRef.current ? modifiedRef.current : originalRef.current
    
    if (target) {
      target.scrollTop = source.scrollTop
      target.scrollLeft = source.scrollLeft
    }
  }, [])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-6xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                  Review AI Fix
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-400 font-normal text-sm flex items-center gap-1.5">
                    <FileCode className="w-4 h-4" />
                    {fileName}
                  </span>
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Explanation Section */}
            <div className="px-6 py-4 bg-indigo-500/5 border-b border-slate-800">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-indigo-300 mb-1">AI Rationale</p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {explanation}
                  </p>
                </div>
              </div>
            </div>

            {/* Diff View */}
            <div className="flex-1 overflow-hidden flex divide-x divide-slate-800 bg-slate-950">
              {/* Original */}
              <div className="flex-1 flex flex-col min-w-0">
                <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800 text-[10px] uppercase tracking-wider font-bold text-slate-500 flex items-center justify-between">
                  Original
                  <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">Removed</span>
                </div>
                <div 
                  ref={originalRef}
                  onScroll={handleScroll}
                  className="flex-1 overflow-auto p-0 custom-scrollbar font-mono text-sm leading-6 flex"
                >
                  <div className="w-10 bg-slate-900/50 border-r border-slate-800 text-slate-600 text-right pr-2 py-4 select-none shrink-0">
                    {original.split('\n').map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>
                  <pre className="flex-1 p-4 text-slate-400 whitespace-pre scrollbar-hide overflow-x-auto">
                    {original}
                  </pre>
                </div>
              </div>

              {/* Modified/Fix */}
              <div className="flex-1 flex flex-col min-w-0">
                <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800 text-[10px] uppercase tracking-wider font-bold text-slate-500 flex items-center justify-between">
                  Suggested Fix
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Added</span>
                </div>
                <div 
                  ref={modifiedRef}
                  onScroll={handleScroll}
                  className="flex-1 overflow-auto p-0 bg-emerald-500/[0.02] custom-scrollbar font-mono text-sm leading-6 flex"
                >
                  <div className="w-10 bg-emerald-500/5 border-r border-slate-800 text-slate-500 text-right pr-2 py-4 select-none shrink-0">
                    {modified.split('\n').map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>
                  <pre className="flex-1 p-4 text-slate-100 whitespace-pre scrollbar-hide overflow-x-auto">
                    {modified}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-end gap-3">
            <Button
              variant="secondary"
              onClick={onClose}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Discard Fix
            </Button>
            <Button
              onClick={onApply}
              className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Apply Fix to Buffer
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

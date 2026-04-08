"use client";

import React from 'react'

interface RichTextProps {
  text: string
  className?: string
}

// Regex patterns defined outside to prevent re-compilation and state issues
const tuningIdPattern = /(\d{15,20})/g
const hashPattern = /(0x[0-9a-fA-F]{8,16})/g
const namePattern = /([A-Za-z_]+:[A-Za-z0-9_]{5,})/g
const pathPattern = /([a-zA-Z0-9_\-/]+\.(?:jpe|xml|python|package))/gi

/**
 * RichText - A semantic renderer for JPE Studio's AI outputs.
 */
export const RichText: React.FC<RichTextProps> = React.memo(({ text, className = '' }) => {
  if (!text) return null

  // Combined highlighting function
  const renderContent = (content: string): React.ReactNode[] => {
    const combinedPattern = new RegExp(
      `(${tuningIdPattern.source})|(${hashPattern.source})|(${namePattern.source})|(${pathPattern.source})`,
      'g'
    )

    const parts = content.split(combinedPattern)
    
    return parts.map((part, i) => {
      if (!part) return null
      
      // Use match instead of test to avoid lastIndex issues with 'g' flag in loops
      if (part.match(/^\d{15,20}$/)) {
        return <span key={i} className="text-accent-primary font-mono font-bold tracking-tight px-0.5 bg-accent-primary/5 rounded">{part}</span>
      }
      if (part.match(/^0x[0-9a-fA-F]{8,16}$/)) {
        return <span key={i} className="text-emerald-400 font-mono italic">{part}</span>
      }
      if (part.match(/^[A-Za-z_]+:[A-Za-z0-9_]{5,}$/)) {
        return <span key={i} className="text-state-warning font-semibold border-b border-state-warning/20">{part}</span>
      }
      if (part.match(/\.(?:jpe|xml|python|package)$/i)) {
        return <span key={i} className="text-state-info italic underline decoration-state-info/30">{part}</span>
      }
      
      return part
    })
  }

  const lines = React.useMemo(() => text.split('\n'), [text])
  
  return (
    <div className={`space-y-1.5 leading-relaxed text-text-primary ${className}`}>
      {lines.map((line, idx) => {
        const isListItem = line.trim().match(/^[-*•]/)
        return (
          <p key={idx} className={isListItem ? 'pl-4 relative' : ''}>
            {isListItem && <span className="absolute left-0 text-text-tertiary">•</span>}
            {renderContent(isListItem ? line.replace(/^[-*•]\s*/, '').trim() : line)}
          </p>
        )
      })}
    </div>
  )
})

"use client"

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTutorialStore} from '@/stores/useTutorialStore'
import { X, ChevronRight, ChevronLeft, HelpCircle, PartyPopper } from 'lucide-react'
import { createPortal } from 'react-dom'
import confetti from 'canvas-confetti'

export const TutorialOverlay: React.FC = () => {
  const { isActive, currentStepIndex, steps, nextStep, previousStep, skipTutorial } = useTutorialStore()
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const currentStep = steps[currentStepIndex]

  // Update target rect when step or window changes
  const updateRect = useCallback(() => {
    if (!currentStep || currentStep.targetSelector === 'body') {
      setTargetRect(null)
      return
    }

    const element = document.querySelector(currentStep.targetSelector)
    if (element) {
      setTargetRect(element.getBoundingClientRect())
    }
  }, [currentStep])

  useEffect(() => {
    if (isActive) {
      updateRect()
      window.addEventListener('resize', updateRect)
      const observer = new MutationObserver(updateRect)
      observer.observe(document.body, { childList: true, subtree: true })
      
      return () => {
        window.removeEventListener('resize', updateRect)
        observer.disconnect()
      }
    }
  }, [isActive, updateRect])

  if (!isActive) return null

  const isFirst = currentStepIndex === 0
  const isLast = currentStepIndex === steps.length - 1

  const tooltipPosition = useMemo(() => {
    if (!targetRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }

    const padding = 16
    switch (currentStep.position) {
      case 'right':
        return { top: targetRect.top, left: targetRect.right + padding }
      case 'left':
        return { top: targetRect.top, right: window.innerWidth - targetRect.left + padding }
      case 'bottom':
        return { top: targetRect.bottom + padding, left: targetRect.left }
      case 'top':
        return { bottom: window.innerHeight - targetRect.top + padding, left: targetRect.left }
      default:
        return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
    }
  }, [targetRect, currentStep])

  return createPortal(
    <div className="fixed inset-0 z-[100] pointer-events-none select-none">
      {/* Dark Backdrop with Spotlight Hole */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] pointer-events-auto"
        style={{
          clipPath: targetRect 
            ? `polygon(0% 0%, 0% 100%, ${targetRect.left}px 100%, ${targetRect.left}px ${targetRect.top}px, ${targetRect.right}px ${targetRect.top}px, ${targetRect.right}px ${targetRect.bottom}px, ${targetRect.left}px ${targetRect.bottom}px, ${targetRect.left}px 100%, 100% 100%, 100% 0%)`
            : 'none'
        }}
        onClick={skipTutorial}
      />

      {/* Spotlight Border (Animated) */}
      <AnimatePresence>
        {targetRect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              x: targetRect.left - 4,
              y: targetRect.top - 4,
              width: targetRect.width + 8,
              height: targetRect.height + 8
            }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute border-2 border-accent-primary rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.5)] pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Tooltip Card */}
      <motion.div
        key={currentStep.id}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.2 }}
        style={tooltipPosition}
        className="absolute w-80 bg-surface/90 backdrop-blur-md border border-secondary p-5 rounded-xl shadow-2xl pointer-events-auto"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-accent-primary/20 flex items-center justify-center">
              <HelpCircle className="w-3.5 h-3.5 text-accent-primary" />
            </div>
            <h3 className="font-bold text-sm text-text-primary uppercase tracking-tight">
              {currentStep.title}
            </h3>
          </div>
          <button 
            onClick={skipTutorial}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-text-secondary leading-relaxed mb-6 font-medium">
          {currentStep.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i === currentStepIndex ? 'w-4 bg-accent-primary' : 'bg-secondary'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {!isFirst && (
              <button
                onClick={previousStep}
                className="p-2 rounded-lg bg-background-tertiary text-text-secondary hover:text-text-primary hover:bg-background-tertiary/60 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => {
                if (isLast) {
                  confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#3b82f6', '#10b981', '#f59e0b']
                  });
                  setTimeout(skipTutorial, 1000);
                } else {
                  nextStep();
                }
              }}
              className="px-4 py-2 rounded-lg bg-accent-primary text-white text-xs font-bold shadow-lg shadow-accent-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              {isLast ? 'Finish' : 'Next'}
              {!isLast && <ChevronRight className="w-4 h-4" />}
              {isLast && <PartyPopper className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  )
}

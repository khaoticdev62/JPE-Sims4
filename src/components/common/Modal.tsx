import { ReactNode } from 'react'
import { T } from '@/components/robust/jpe-theme'
import { cn } from '@/components/ui/utils'
import { motion, AnimatePresence } from '@/components/jpe-motion'

interface ModalProps {
  isOpen: boolean
  title: string
  onClose: () => void
  children: ReactNode
  closeOnBackdropClick?: boolean
}

export default function Modal({
  isOpen,
  title,
  onClose,
  children,
  closeOnBackdropClick = true,
}: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4 overflow-hidden" 
          style={{ zIndex: T.zModal }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60"
            style={{ backdropFilter: T.glassBlur }}
            onClick={() => closeOnBackdropClick && onClose()}
          />

          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className={cn(
               "relative w-full max-w-md overflow-hidden border border-border bg-bgSurface/90 shadow-apple-lg",
               "backdrop-blur-xl rounded-2xl"
            )}
          >
            {/* Spectral Texture Overlay */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
              style={{ backgroundImage: T.noiseSvg }}
            />

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-transparent to-white/5">
              <h2 className="text-[11px] font-bold tracking-widest text-white uppercase italic">{title}</h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/10 rounded-md text-textTertiary hover:text-white transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-5 text-[11px] text-textPrimary leading-relaxed relative">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

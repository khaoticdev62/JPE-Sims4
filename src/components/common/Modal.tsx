import { ReactNode } from 'react'

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
  if (!isOpen) return null

  const handleBackdropClick = () => {
    if (closeOnBackdropClick) onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-bg-primary bg-opacity-80"
        onClick={handleBackdropClick}
      />

      {/* Modal */}
      <div className="relative bg-bg-secondary rounded-lg shadow-apple-lg max-w-md w-full mx-4 border border-border-subtle">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary text-xl transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 text-text-primary">{children}</div>
      </div>
    </div>
  )
}

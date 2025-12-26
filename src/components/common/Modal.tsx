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
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleBackdropClick}
      />

      {/* Modal */}
      <div className="relative bg-slate-900 rounded-lg shadow-xl max-w-md w-full mx-4 border border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  )
}

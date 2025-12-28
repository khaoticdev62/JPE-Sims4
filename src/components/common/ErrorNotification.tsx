import { useEffect } from 'react'

interface ErrorNotificationProps {
  message: string | null
  isVisible: boolean
  onDismiss: () => void
  autoClose?: number // milliseconds, 0 = never auto-close
}

export function ErrorNotification({
  message,
  isVisible,
  onDismiss,
  autoClose = 5000,
}: ErrorNotificationProps) {
  useEffect(() => {
    if (!isVisible || !autoClose) return

    const timer = setTimeout(() => {
      onDismiss()
    }, autoClose)

    return () => clearTimeout(timer)
  }, [isVisible, autoClose, onDismiss])

  if (!isVisible || !message) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-sm z-50 animate-in slide-in-from-bottom-2 fade-in duration-300">
      <div className="bg-state-error border border-state-error rounded-lg p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 text-lg">❌</div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">{message}</p>
          </div>
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-white hover:opacity-75 transition-opacity"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}

export default ErrorNotification

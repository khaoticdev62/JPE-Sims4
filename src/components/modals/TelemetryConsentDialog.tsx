/**
 * Telemetry Consent Dialog
 * First-run consent dialog for anonymous telemetry opt-in
 */

import { useState } from 'react'
import { useTelemetryStore } from '@stores/useTelemetryStore'

interface TelemetryConsentDialogProps {
  isOpen: boolean
  onClose: () => void
}

export default function TelemetryConsentDialog({ isOpen, onClose }: TelemetryConsentDialogProps) {
  const [accepted, setAccepted] = useState(false)
  const { enableTelemetry, disableTelemetry } = useTelemetryStore()

  if (!isOpen) return null

  const handleAccept = () => {
    setAccepted(true)
    enableTelemetry()

    // Close after a short delay
    setTimeout(() => {
      onClose()
    }, 500)
  }

  const handleDecline = () => {
    disableTelemetry()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background-secondary rounded-lg shadow-2xl max-w-2xl w-full space-y-6">
        {/* Header */}
        <div className="p-6 border-b border-border-subtle space-y-2">
          <h2 className="text-2xl font-bold text-text-primary">Help Improve JPE Mod Translator</h2>
          <p className="text-sm text-text-secondary">
            We'd like to collect anonymous usage data to improve your experience
          </p>
        </div>

        {/* Content */}
        <div className="px-6 space-y-6">
          {/* What We Collect */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <span className="text-state-success">✅</span>
              What We Collect
            </h3>
            <ul className="space-y-2 pl-8 text-sm text-text-secondary">
              <li className="flex gap-2">
                <span className="text-accent-primary">•</span>
                <span>Feature usage (which buttons you click)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent-primary">•</span>
                <span>Performance metrics (build times, analysis times)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent-primary">•</span>
                <span>Error reports (crash logs, error messages)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent-primary">•</span>
                <span>Anonymous usage patterns</span>
              </li>
            </ul>
          </div>

          {/* What We DON'T Collect */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <span className="text-state-error">❌</span>
              What We DON'T Collect
            </h3>
            <ul className="space-y-2 pl-8 text-sm text-text-secondary">
              <li className="flex gap-2">
                <span className="text-accent-primary">•</span>
                <span>Personal information (name, email, address)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent-primary">•</span>
                <span>File contents or mod data</span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent-primary">•</span>
                <span>Project names or file paths</span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent-primary">•</span>
                <span>API keys or credentials</span>
              </li>
            </ul>
          </div>

          {/* Privacy Assurance */}
          <div className="bg-state-info/10 border border-state-info/30 rounded-lg p-4 space-y-2">
            <p className="text-sm text-state-info">
              <strong>🔒 Your Privacy:</strong> All data is anonymized using unique identifiers. We never
              collect personal information or sensitive content.
            </p>
          </div>

          {/* Consent Checkbox */}
          <label className="flex items-center gap-3 p-4 bg-background-tertiary rounded-lg border border-border-subtle cursor-pointer hover:border-accent-primary transition-colors">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="w-5 h-5 accent-accent-primary"
            />
            <span className="text-sm text-text-primary">
              I understand and accept anonymous telemetry collection
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 space-y-2">
          <button
            onClick={handleAccept}
            disabled={!accepted}
            className="w-full px-4 py-3 bg-accent-primary hover:bg-accent-focus disabled:opacity-50 disabled:cursor-not-allowed text-text-primary font-medium rounded-lg transition-colors"
          >
            Enable Telemetry
          </button>

          <button
            onClick={handleDecline}
            className="w-full px-4 py-3 bg-background-tertiary hover:bg-background-secondary text-text-secondary font-medium rounded-lg transition-colors"
          >
            No Thanks
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 pb-4 text-xs text-text-tertiary border-t border-border-subtle pt-4 space-y-1">
          <p>
            You can change your preferences anytime in Settings → Privacy & Telemetry
          </p>
          <a
            href="https://github.com/your-repo/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-primary hover:text-accent-focus transition-colors"
          >
            View Full Privacy Policy →
          </a>
        </div>
      </div>
    </div>
  )
}

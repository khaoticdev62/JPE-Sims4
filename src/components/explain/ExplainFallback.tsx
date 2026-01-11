/**
 * Explain Fallback Component
 * Displays fallback content when AI explanations are not available
 */

interface ExplainFallbackProps {
  fileName?: string
  onConfigureAPI?: () => void
}

export default function ExplainFallback({
  fileName,
  onConfigureAPI,
}: ExplainFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <div className="text-center max-w-sm space-y-4">
        <div className="text-5xl">🚀</div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-text-primary">AI Features Not Configured</h2>
          <p className="text-sm text-text-secondary">
            {fileName
              ? `AI explanations are not available yet. Configure your Claude API key to enable intelligent mod analysis.`
              : 'Configure your Claude API key to unlock AI-powered explanations and insights.'}
          </p>
        </div>

        <div className="bg-background-tertiary rounded-lg p-4 border border-border-subtle space-y-3">
          <div className="space-y-2 text-left">
            <h3 className="text-sm font-semibold text-text-primary">What you'll get:</h3>
            <ul className="text-sm text-text-secondary space-y-1">
              <li className="flex gap-2">
                <span className="text-accent-primary">✓</span>
                <span>AI-powered explanations of mod files</span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent-primary">✓</span>
                <span>Smart pattern recognition and suggestions</span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent-primary">✓</span>
                <span>Instant analysis of complex tuning</span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent-primary">✓</span>
                <span>Usage statistics and insights</span>
              </li>
            </ul>
          </div>
        </div>

        {onConfigureAPI && (
          <button
            onClick={onConfigureAPI}
            className="w-full px-4 py-3 bg-accent-primary hover:bg-accent-focus text-text-primary font-medium rounded-lg transition-colors"
          >
            Configure API Key
          </button>
        )}

        <div className="text-xs text-text-tertiary border-t border-border-subtle pt-4">
          <p>Need an API key?</p>
          <a
            href="https://console.anthropic.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-primary hover:text-accent-focus transition-colors"
          >
            Get Claude API access →
          </a>
        </div>

        <div className="bg-state-info/10 rounded-lg p-3 border border-state-info/30 text-left">
          <p className="text-xs text-state-info">
            <strong>💡 Free Tier Coming Soon:</strong> We're working on a free proxy tier that
            doesn't require your own API key.
          </p>
        </div>
      </div>
    </div>
  )
}

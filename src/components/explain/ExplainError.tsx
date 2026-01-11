/**
 * Explain Error Component
 * Displays error states with contextual messages and recovery actions
 */

interface ExplainErrorProps {
  error: string
  onRetry?: () => void
  onConfigureAPI?: () => void
}

type ErrorType = 'no-api-key' | 'rate-limit' | 'network' | 'api-error' | 'quota-exceeded' | 'unknown'

function getErrorType(error: string): ErrorType {
  const errorLower = error.toLowerCase()

  if (errorLower.includes('api key') || errorLower.includes('not configured')) {
    return 'no-api-key'
  }

  if (errorLower.includes('rate limit') || errorLower.includes('429')) {
    return 'rate-limit'
  }

  if (
    errorLower.includes('network') ||
    errorLower.includes('connection') ||
    errorLower.includes('timeout') ||
    errorLower.includes('econnrefused')
  ) {
    return 'network'
  }

  if (errorLower.includes('quota') || errorLower.includes('exceeded')) {
    return 'quota-exceeded'
  }

  if (errorLower.includes('401') || errorLower.includes('authentication')) {
    return 'api-error'
  }

  return 'unknown'
}

function getErrorConfig(type: ErrorType, error: string) {
  const configs: Record<ErrorType, { icon: string; title: string; message: string; suggestion: string }> = {
    'no-api-key': {
      icon: '🔑',
      title: 'API Key Required',
      message: 'Configure your Claude API key to enable AI-powered explanations.',
      suggestion: 'Go to Settings → AI Configuration to add your API key',
    },
    'rate-limit': {
      icon: '⏱️',
      title: 'Rate Limit Reached',
      message: 'You have exceeded the maximum requests per minute (50 requests/min).',
      suggestion: 'Please wait a moment before trying again',
    },
    'network': {
      icon: '🌐',
      title: 'Connection Error',
      message: 'Unable to connect to Claude API. Check your internet connection.',
      suggestion: 'Verify your network connection and try again',
    },
    'api-error': {
      icon: '⚠️',
      title: 'API Error',
      message: 'Invalid Claude API key or authentication failed.',
      suggestion: 'Check your API key and verify it\'s valid in the Anthropic console',
    },
    'quota-exceeded': {
      icon: '📊',
      title: 'Quota Exceeded',
      message: 'Your Claude API quota has been exceeded.',
      suggestion: 'Check your Anthropic account usage and upgrade if needed',
    },
    'unknown': {
      icon: '❌',
      title: 'Error',
      message: error || 'An unknown error occurred while fetching explanation.',
      suggestion: 'Try again or check your connection and API configuration',
    },
  }

  return configs[type]
}

export default function ExplainError({
  error,
  onRetry,
  onConfigureAPI,
}: ExplainErrorProps) {
  const errorType = getErrorType(error)
  const config = getErrorConfig(errorType, error)

  return (
    <div className="p-4 space-y-4">
      <div className="p-4 bg-state-error/10 border border-state-error/30 rounded-lg space-y-3">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">{config.icon}</span>
          <div className="flex-1">
            <h3 className="font-semibold text-state-error">{config.title}</h3>
            <p className="text-sm text-state-error/80 mt-1">{config.message}</p>
          </div>
        </div>

        <div className="bg-state-error/5 rounded p-3 border border-state-error/20">
          <p className="text-xs text-state-error">💡 {config.suggestion}</p>
        </div>

        <div className="flex gap-2 pt-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-3 py-2 text-sm font-medium bg-state-error hover:bg-state-error/90 text-white rounded transition-colors"
            >
              Retry
            </button>
          )}

          {onConfigureAPI && errorType === 'no-api-key' && (
            <button
              onClick={onConfigureAPI}
              className="px-3 py-2 text-sm font-medium bg-accent-primary hover:bg-accent-focus text-text-primary rounded transition-colors"
            >
              Configure API Key
            </button>
          )}

          {errorType === 'quota-exceeded' && (
            <a
              href="https://console.anthropic.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-sm font-medium bg-accent-primary hover:bg-accent-focus text-text-primary rounded transition-colors"
            >
              View Account
            </a>
          )}
        </div>
      </div>

      {/* Debug info */}
      {import.meta.env.DEV && (
        <div className="text-xs text-text-tertiary bg-background-tertiary p-2 rounded border border-border-subtle font-mono break-all">
          {error}
        </div>
      )}
    </div>
  )
}

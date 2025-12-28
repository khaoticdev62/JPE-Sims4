import React, { ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details for debugging
    console.error('Error caught by ErrorBoundary:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-bg-secondary border border-border-subtle rounded-lg p-6 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="text-4xl mr-4">⚠️</div>
              <div>
                <h1 className="text-xl font-semibold text-text-primary">Something went wrong</h1>
              </div>
            </div>

            <p className="text-text-secondary mb-4">
              An unexpected error occurred. The application encountered a problem and needs to recover.
            </p>

            {this.state.error && (
              <div className="mb-4 p-3 bg-bg-primary border border-state-error rounded text-state-error text-xs font-mono overflow-auto max-h-32">
                <p className="font-semibold mb-1">Error details:</p>
                <p className="break-words">{this.state.error.message}</p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={this.handleReset}
                className="flex-1 px-4 py-2 bg-accent-primary hover:bg-accent-focus text-text-primary rounded font-medium transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 px-4 py-2 bg-bg-tertiary hover:bg-bg-secondary text-text-primary rounded font-medium transition-colors"
              >
                Go Home
              </button>
            </div>

            <p className="text-xs text-text-secondary mt-4">
              If this problem persists, please reload the application.
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

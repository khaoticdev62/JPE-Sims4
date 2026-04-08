/**
 * ErrorBoundary — React error boundary component
 */
import * as React from "react";
import { AlertTriangle } from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="flex items-center gap-3 p-4 rounded-xl border border-rose/25"
          style={{ backgroundColor: "rgba(252,129,129,0.08)" }}
          role="alert"
        >
          <AlertTriangle className="h-4 w-4 text-rose shrink-0" />
          <div>
            <p className="text-[12px] font-semibold text-rose">Something went wrong</p>
            {this.state.error && (
              <p className="text-[10px] text-text-secondary mt-0.5 font-mono">{this.state.error.message}</p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

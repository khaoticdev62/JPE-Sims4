"use client";

/**
 * ErrorBoundary.tsx
 * Production-grade error boundary with crash recovery, error reporting, and graceful fallback UI
 */

import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home, Bug, Copy} from "lucide-react";
import { T } from "./robust/jpe-theme";
import { JpeButton } from "./jpe-design-system";
import { toast } from "sonner";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  level?: "app" | "feature" | "component";
  featureName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorCount: number;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0};
  }

  static getDerivedStateFromError(_error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { onError, level = "component", featureName } = this.props;

    // Increment error count
    this.setState(prev => ({
      error,
      errorInfo,
      errorCount: prev.errorCount + 1}));

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error(
        `[ErrorBoundary ${level}${featureName ? `: ${featureName}` : ""}]`,
        error,
        errorInfo
      );
    }

    // Store in localStorage for crash reports
    try {
      const crashLog = {
        timestamp: new Date().toISOString(),
        level,
        featureName,
        error: {
          message: error.message,
          stack: error.stack},
        componentStack: errorInfo.componentStack};
      const existing = JSON.parse(localStorage.getItem("jpe-crash-logs") || "[]");
      existing.push(crashLog);
      // Keep only last 10 crashes
      if (existing.length > 10) existing.shift();
      localStorage.setItem("jpe-crash-logs", JSON.stringify(existing));
    } catch {
      // Ignore localStorage errors
    }

    // Call custom error handler
    if (onError) {
      onError(error, errorInfo);
    }

    // Show toast notification for feature-level errors
    if (level === "feature") {
      toast.error(`${featureName || "Feature"} crashed`, {
        description: "The component has been reset. Your data is safe."});
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null});
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  copyErrorDetails = () => {
    const { error, errorInfo } = this.state;
    const details = `
JPE Studio Error Report
Time: ${new Date().toISOString()}
Error: ${error?.message}
Stack: ${error?.stack}
Component Stack: ${errorInfo?.componentStack}
    `.trim();
    navigator.clipboard.writeText(details)
      .then(() => toast.success("Error details copied to clipboard"))
      .catch(() => toast.error("Failed to copy error details"));
  };

  render() {
    const { hasError, error, errorInfo: _errorInfo, errorCount } = this.state;
    const { children, fallback, level = "component", featureName } = this.props;

    if (!hasError) {
      return children;
    }

    // Custom fallback
    if (fallback) {
      return fallback;
    }

    // Component-level: minimal inline error
    if (level === "component") {
      return (
        <div
          className="flex items-center justify-center p-4 rounded"
          style={{
            background: `rgba(244, 63, 94, 0.05)`,
            border: `1px solid ${T.rose}`,
            color: T.textSecondary}}
        >
          <AlertTriangle size={16} color={T.rose} className="mr-2" />
          <span style={{ fontSize: 12 }}>Component error</span>
          <button
            onClick={this.handleReset}
            style={{
              marginLeft: 8,
              fontSize: 11,
              color: T.cyan,
              textDecoration: "underline",
              cursor: "pointer"}}
          >
            Reset
          </button>
        </div>
      );
    }

    // Feature-level: card-style error
    if (level === "feature") {
      return (
        <div
          className="flex flex-col items-center justify-center h-full p-8"
          style={{ background: T.bgPanel, fontFamily: T.sans }}
        >
          <div
            className="flex flex-col items-center text-center max-w-md"
            style={{
              background: T.bgSurface,
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              padding: 32}}
          >
            <div
              className="rounded-full p-4 mb-4"
              style={{ background: `rgba(244, 63, 94, 0.1)` }}
            >
              <Bug size={32} color={T.rose} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: T.textPrimary, marginBottom: 8 }}>
              {featureName || "Feature"} Encountered an Error
            </h3>
            <p style={{ fontSize: 13, color: T.textSecondary, marginBottom: 16, lineHeight: 1.5 }}>
              Don't worry—your data is safe. You can reset this feature or reload the page.
            </p>
            {process.env.NODE_ENV === "development" && error && (
              <details
                className="w-full mb-4 text-left"
                style={{
                  background: T.bgPanel,
                  border: `1px solid ${T.border}`,
                  borderRadius: 4,
                  padding: 8}}
              >
                <summary
                  style={{
                    fontSize: 11,
                    color: T.textMuted,
                    cursor: "pointer",
                    fontFamily: T.mono}}
                >
                  Error Details
                </summary>
                <pre
                  style={{
                    fontSize: 10,
                    color: T.rose,
                    fontFamily: T.mono,
                    marginTop: 8,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word"}}
                >
                  {error.message}
                </pre>
              </details>
            )}
            <div className="flex gap-2 w-full">
              <JpeButton
                variant="primary"
                size="md"
                icon={RefreshCw}
                onClick={this.handleReset}
                className="flex-1"
              >
                Reset {featureName}
              </JpeButton>
              <JpeButton
                variant="ghost"
                size="md"
                icon={Copy}
                onClick={this.copyErrorDetails}
              />
            </div>
          </div>
        </div>
      );
    }

    // App-level: full-page error
    return (
      <div
        className="flex items-center justify-center w-screen h-screen"
        style={{ background: T.bgApp, fontFamily: T.sans }}
      >
        <div
          className="flex flex-col items-center text-center max-w-lg"
          style={{
            background: T.bgPanel,
            border: `1px solid ${T.border}`,
            borderRadius: 12,
            padding: 48}}
        >
          <div
            className="rounded-full p-6 mb-6"
            style={{ background: `rgba(244, 63, 94, 0.1)` }}
          >
            <AlertTriangle size={48} color={T.rose} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: T.textPrimary, marginBottom: 8 }}>
            JPE Studio Crashed
          </h1>
          <p style={{ fontSize: 14, color: T.textSecondary, marginBottom: 24, lineHeight: 1.6 }}>
            We're sorry—something went wrong. Your work is auto-saved. You can reload the app or
            report this issue.
          </p>

          {process.env.NODE_ENV === "development" && error && (
            <div
              className="w-full mb-6 text-left"
              style={{
                background: T.bgSurface,
                border: `1px solid ${T.border}`,
                borderRadius: 6,
                padding: 16,
                maxHeight: 200,
                overflow: "auto"}}
            >
              <div
                style={{
                  fontSize: 10,
                  fontFamily: T.mono,
                  color: T.textMuted,
                  marginBottom: 8}}
              >
                ERROR DETAILS (DEV MODE)
              </div>
              <pre
                style={{
                  fontSize: 11,
                  color: T.rose,
                  fontFamily: T.mono,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word"}}
              >
                {error.message}
                {"\n\n"}
                {error.stack}
              </pre>
            </div>
          )}

          <div className="flex gap-3 w-full">
            <JpeButton
              variant="primary"
              size="lg"
              icon={RefreshCw}
              onClick={this.handleReload}
              className="flex-1"
            >
              Reload App
            </JpeButton>
            <JpeButton
              variant="secondary"
              size="lg"
              icon={Home}
              onClick={this.handleGoHome}
              className="flex-1"
            >
              Go Home
            </JpeButton>
          </div>

          <button
            onClick={this.copyErrorDetails}
            style={{
              marginTop: 16,
              fontSize: 12,
              color: T.cyan,
              textDecoration: "underline",
              cursor: "pointer"}}
          >
            Copy error details for support
          </button>

          {errorCount > 1 && (
            <div
              style={{
                marginTop: 16,
                fontSize: 11,
                color: T.amber,
                fontFamily: T.mono}}
            >
              ⚠️ This error has occurred {errorCount} times
            </div>
          )}
        </div>
      </div>
    );
  }
}

/* ═══════════════════════════════════════════════════════════════
   UTILITY: Clear crash logs
   ═══════════════════════════════════════════════════════════════ */

export function clearCrashLogs() {
  try {
    localStorage.removeItem("jpe-crash-logs");
    toast.success("Crash logs cleared");
  } catch {
    toast.error("Failed to clear crash logs");
  }
}

export function getCrashLogs(): any[] {
  try {
    return JSON.parse(localStorage.getItem("jpe-crash-logs") || "[]");
  } catch {
    return [];
  }
}

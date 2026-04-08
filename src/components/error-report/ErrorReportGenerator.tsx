"use client";

/**
 * Error Report Generator
 * Generate shareable error reports for debugging
 */

import { useState } from 'react'
import ErrorReportPreview from './ErrorReportPreview'

interface Diagnostic {
  fileId: string
  fileName: string
  line: number
  column: number
  severity: 'error' | 'warning' | 'info'
  message: string
  code?: string
  suggestion?: string
}

interface Project {
  name: string
  path?: string
  files: Array<{ id: string; name: string }>
}

interface ErrorReportGeneratorProps {
  diagnostics: Diagnostic[]
  project?: Project
  onClose?: () => void
}

export default function ErrorReportGenerator({
  diagnostics,
  project,
  onClose
}: ErrorReportGeneratorProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [copied, setCopied] = useState(false)

  const generateReport = (): string => {
    const osInfo = navigator.userAgent
    const appVersion = '1.0.0'
    const timestamp = new Date().toISOString()

    const errorCount = diagnostics.filter((d) => d.severity === 'error').length
    const warningCount = diagnostics.filter((d) => d.severity === 'warning').length
    const infoCount = diagnostics.filter((d) => d.severity === 'info').length

    const diagnosticsText = diagnostics
      .map(
        (d) =>
          `${d.fileName}:${d.line}:${d.column}
    [${d.severity.toUpperCase()}] ${d.code || 'UNKNOWN'}: ${d.message}
    ${d.suggestion ? `    Suggestion: ${d.suggestion}` : ''}`
      )
      .join('\n\n')

    const report = `JPE Mod Translator - Error Report
Generated: ${timestamp}

=== System Information ===
OS: ${osInfo}
App Version: ${appVersion}
Timestamp: ${timestamp}

=== Project Information ===
Name: ${project?.name || 'Unknown'}
Files: ${project?.files.length || 0}

=== Error Summary ===
Total Errors: ${errorCount}
Total Warnings: ${warningCount}
Total Info: ${infoCount}
Total Issues: ${diagnostics.length}

=== Diagnostics ===
${diagnosticsText || 'No diagnostics'}

=== How to Report ===
1. Copy this entire report
2. Visit: https://github.com/khaoticdev62/JPE-Sims4/issues
3. Create a new issue and paste this report
4. Add any additional context about your actions

=== Troubleshooting ===
- Clear your browser cache and reload the app
- Try validating individual files instead of the whole project
- Check that all XML files have proper structure (opening and closing tags)
- Ensure STBL references match actual string table keys`

    return report
  }

  const handleCopy = async () => {
    const report = generateReport()

    try {
      await navigator.clipboard.writeText(report)
      setCopied(true)

      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (error) {
      console.error('Failed to copy report:', error)
    }
  }

  const handleDownload = () => {
    const report = generateReport()
    const element = document.createElement('a')
    const file = new Blob([report], { type: 'text/plain' })

    element.href = URL.createObjectURL(file)
    element.download = `error-report-${Date.now()}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleDownloadMarkdown = () => {
    const report = generateReport()
    const markdownReport = `\`\`\`
${report}
\`\`\``

    const element = document.createElement('a')
    const file = new Blob([markdownReport], { type: 'text/markdown' })

    element.href = URL.createObjectURL(file)
    element.download = `error-report-${Date.now()}.md`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  if (showPreview) {
    return (
      <ErrorReportPreview
        report={generateReport()}
        onClose={() => setShowPreview(false)}
        onCopy={handleCopy}
        onDownload={handleDownload}
        onDownloadMarkdown={handleDownloadMarkdown}
        copied={copied}
      />
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background-secondary rounded-lg shadow-2xl max-w-md w-full mx-4 space-y-6">
        {/* Header */}
        <div className="p-6 border-b border-border-subtle">
          <h2 className="text-xl font-bold text-text-primary mb-1">Error Report</h2>
          <p className="text-sm text-text-secondary">
            Generate and share error details for debugging
          </p>
        </div>

        {/* Content */}
        <div className="px-6 space-y-4">
          {/* Summary */}
          <div className="bg-background-tertiary rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-semibold text-text-primary">Report Contents</h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">System Info</span>
                <span className="text-text-primary">✓</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Project Info</span>
                <span className="text-text-primary">✓</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Errors</span>
                <span className="text-text-primary">
                  {diagnostics.filter((d) => d.severity === 'error').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Warnings</span>
                <span className="text-text-primary">
                  {diagnostics.filter((d) => d.severity === 'warning').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Total Issues</span>
                <span className="text-text-primary">{diagnostics.length}</span>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-state-info/10 border border-state-info/30 rounded-lg p-3">
            <p className="text-xs text-state-info">
              ℹ️ This report helps us debug issues. It contains error details and system info
              but no sensitive data.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 space-y-2">
          <button
            onClick={() => setShowPreview(true)}
            className="w-full px-4 py-2 bg-accent-primary hover:bg-accent-focus text-text-primary rounded-lg font-medium transition-colors"
          >
            Preview Report
          </button>

          <button
            onClick={handleCopy}
            className="w-full px-4 py-2 bg-background-tertiary hover:bg-background-secondary text-text-primary rounded-lg font-medium transition-colors"
          >
            {copied ? '✓ Copied to Clipboard' : 'Copy to Clipboard'}
          </button>

          <button
            onClick={handleDownload}
            className="w-full px-4 py-2 bg-background-tertiary hover:bg-background-secondary text-text-primary rounded-lg font-medium transition-colors"
          >
            Download as Text
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="w-full px-4 py-2 bg-background-tertiary hover:bg-background-secondary text-text-primary rounded-lg font-medium transition-colors"
          >
            Download as Markdown
          </button>

          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-background-tertiary hover:bg-background-secondary text-text-secondary rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Error Report Preview
 * Display error report in formatted view before sharing
 */

interface ErrorReportPreviewProps {
  report: string
  onClose: () => void
  onCopy: () => void
  onDownload: () => void
  onDownloadMarkdown: () => void
  copied: boolean
}

export default function ErrorReportPreview({
  report,
  onClose,
  onCopy,
  onDownload,
  onDownloadMarkdown,
  copied
}: ErrorReportPreviewProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background-secondary rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] mx-4 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border-subtle">
          <h2 className="text-xl font-bold text-text-primary mb-1">Error Report Preview</h2>
          <p className="text-sm text-text-secondary">
            Review before sharing (safe to post on public issues)
          </p>
        </div>

        {/* Report Content */}
        <div className="flex-1 overflow-auto p-6">
          <pre className="text-xs text-text-secondary bg-background-tertiary rounded p-4 overflow-x-auto whitespace-pre-wrap break-words max-h-96 overflow-y-auto font-mono leading-relaxed">
            {report}
          </pre>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-border-subtle space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onCopy}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                copied
                  ? 'bg-state-success text-text-primary'
                  : 'bg-accent-primary hover:bg-accent-focus text-text-primary'
              }`}
            >
              {copied ? '✓ Copied' : 'Copy Report'}
            </button>

            <button
              onClick={onDownload}
              className="px-4 py-2 bg-background-tertiary hover:bg-background-secondary text-text-primary rounded-lg font-medium transition-colors"
            >
              Download (.txt)
            </button>

            <button
              onClick={onDownloadMarkdown}
              className="px-4 py-2 bg-background-tertiary hover:bg-background-secondary text-text-primary rounded-lg font-medium transition-colors"
            >
              Download (.md)
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-background-tertiary hover:bg-background-secondary text-text-primary rounded-lg font-medium transition-colors"
            >
              Back
            </button>
          </div>

          {/* Help Text */}
          <div className="bg-state-info/10 border border-state-info/30 rounded-lg p-3 mt-2">
            <p className="text-xs text-state-info">
              💡 <strong>Tip:</strong> Copy or download this report and share it on the project GitHub
              issues page. It helps us debug your problem faster.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

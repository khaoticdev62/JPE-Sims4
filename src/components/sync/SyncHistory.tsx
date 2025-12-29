/**
 * Sync History Log
 * Displays history of sync operations
 */

interface SyncHistoryItem {
  timestamp: Date
  action: string
  filesCount: number
  status: 'success' | 'error' | 'warning'
  details?: string
}

interface SyncHistoryProps {
  items: SyncHistoryItem[]
}

export default function SyncHistory({ items }: SyncHistoryProps) {
  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      default:
        return '•'
    }
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'success':
        return 'text-state-success'
      case 'error':
        return 'text-state-error'
      case 'warning':
        return 'text-state-warning'
      default:
        return 'text-text-secondary'
    }
  }

  const formatTime = (date: Date): string => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 1000 / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString()
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-text-secondary text-sm">No sync history yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="p-4 bg-background-tertiary rounded-lg border-l-4"
          style={{
            borderLeftColor:
              item.status === 'success'
                ? '#2E8540'
                : item.status === 'error'
                  ? '#E12D39'
                  : '#F5A623'
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-lg ${getStatusColor(item.status)}`}>
                  {getStatusIcon(item.status)}
                </span>
                <p className="text-sm font-medium text-text-primary">{item.action}</p>
              </div>

              <div className="flex items-center gap-4 text-xs text-text-secondary">
                <span>{item.filesCount} file{item.filesCount !== 1 ? 's' : ''}</span>
                <span>{formatTime(item.timestamp)}</span>
              </div>

              {item.details && (
                <p className="text-xs text-text-tertiary mt-2 italic">{item.details}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

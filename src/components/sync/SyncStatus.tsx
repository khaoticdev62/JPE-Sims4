/**
 * Sync Status Indicator
 * Shows current sync state and connection status
 */

interface SyncStatusProps {
  enabled: boolean
  lastSync: Date | null
  syncing: boolean
}

export default function SyncStatus({ enabled, lastSync, syncing }: SyncStatusProps) {
  const getStatusDisplay = () => {
    if (syncing) {
      return {
        icon: '🔄',
        text: 'Syncing...',
        color: 'text-state-info'
      }
    }

    if (!enabled) {
      return {
        icon: '⏸️',
        text: 'Sync Disabled',
        color: 'text-text-secondary'
      }
    }

    if (lastSync) {
      return {
        icon: '☁️',
        text: 'Synced',
        color: 'text-state-success'
      }
    }

    return {
      icon: '⏳',
      text: 'Waiting',
      color: 'text-text-secondary'
    }
  }

  const status = getStatusDisplay()

  return (
    <div className="flex items-center gap-4 p-4 bg-background-tertiary rounded-lg">
      <div className={`text-3xl ${status.icon === '🔄' ? 'animate-spin' : ''}`}>
        {status.icon}
      </div>

      <div className="flex-1">
        <p className={`text-lg font-semibold ${status.color}`}>{status.text}</p>

        {enabled && lastSync && (
          <p className="text-xs text-text-secondary mt-1">
            Files synced to cloud ✓
          </p>
        )}

        {!enabled && (
          <p className="text-xs text-text-secondary mt-1">
            Enable cloud sync to start syncing your projects
          </p>
        )}
      </div>

      {enabled && (
        <div className="flex flex-col gap-2">
          <div className="w-3 h-3 rounded-full bg-state-success animate-pulse" />
          <p className="text-xs text-text-secondary">Connected</p>
        </div>
      )}
    </div>
  )
}

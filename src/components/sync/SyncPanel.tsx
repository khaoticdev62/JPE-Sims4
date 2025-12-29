/**
 * Cloud Sync Panel
 * UI for cloud/mobile sync features (backend integration planned for future phase)
 */

import { useState, useEffect } from 'react'
import SyncStatus from './SyncStatus'
import SyncHistory from './SyncHistory'

interface SyncHistoryItem {
  timestamp: Date
  action: string
  filesCount: number
  status: 'success' | 'error' | 'warning'
  details?: string
}

export default function SyncPanel() {
  const [syncEnabled, setSyncEnabled] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [syncHistory, setSyncHistory] = useState<SyncHistoryItem[]>([
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 2),
      action: 'Synced 12 files to cloud',
      filesCount: 12,
      status: 'success'
    },
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      action: 'Synced 12 files to cloud',
      filesCount: 12,
      status: 'success'
    },
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      action: 'Conflict resolved in trait_Active.xml',
      filesCount: 1,
      status: 'warning',
      details: 'Local version kept'
    }
  ])

  const handleSync = async () => {
    setSyncing(true)

    try {
      // Simulate sync operation
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const newEntry: SyncHistoryItem = {
        timestamp: new Date(),
        action: `Synced 12 files to cloud`,
        filesCount: 12,
        status: 'success'
      }

      setLastSync(new Date())
      setSyncHistory((prev) => [newEntry, ...prev])
    } catch (error) {
      const errorEntry: SyncHistoryItem = {
        timestamp: new Date(),
        action: 'Sync failed',
        filesCount: 0,
        status: 'error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }

      setSyncHistory((prev) => [errorEntry, ...prev])
    } finally {
      setSyncing(false)
    }
  }

  const getTimeSinceLastSync = (): string => {
    if (!lastSync) return 'Never'

    const now = new Date()
    const diffMs = now.getTime() - lastSync.getTime()
    const diffMins = Math.floor(diffMs / 1000 / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }

  return (
    <div className="flex flex-col h-full bg-background-primary">
      {/* Header */}
      <div className="p-6 border-b border-border-subtle">
        <h2 className="text-2xl font-bold text-text-primary mb-2">Cloud Sync</h2>
        <p className="text-sm text-text-secondary">
          Sync your projects across devices (Backend integration coming soon)
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Status Card */}
        <div className="bg-background-secondary border border-border-subtle rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-text-primary">Sync Status</h3>

          <SyncStatus
            enabled={syncEnabled}
            lastSync={lastSync}
            syncing={syncing}
          />

          <p className="text-xs text-text-tertiary">
            Last synced: {getTimeSinceLastSync()}
          </p>
        </div>

        {/* Controls */}
        <div className="bg-background-secondary border border-border-subtle rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-text-primary">Settings</h3>

          <div className="space-y-3">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-text-primary block mb-1">
                  Enable Cloud Sync
                </label>
                <p className="text-xs text-text-secondary">
                  Automatically sync your projects to cloud
                </p>
              </div>

              <button
                onClick={() => setSyncEnabled(!syncEnabled)}
                className={`
                  relative inline-flex h-8 w-14 items-center rounded-full transition-colors
                  ${syncEnabled ? 'bg-accent-primary' : 'bg-border-subtle'}
                `}
              >
                <span
                  className={`
                    inline-block h-6 w-6 transform rounded-full bg-white transition-transform
                    ${syncEnabled ? 'translate-x-7' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>

            {/* Sync Button */}
            <button
              onClick={handleSync}
              disabled={!syncEnabled || syncing}
              className={`
                w-full px-4 py-3 rounded-lg font-medium transition-all
                ${
                  syncEnabled && !syncing
                    ? 'bg-accent-primary hover:bg-accent-focus text-text-primary cursor-pointer'
                    : 'bg-background-tertiary text-text-tertiary cursor-not-allowed opacity-50'
                }
              `}
            >
              {syncing ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin">⏳</div>
                  Syncing...
                </div>
              ) : (
                'Sync Now'
              )}
            </button>
          </div>
        </div>

        {/* Sync History */}
        <div className="bg-background-secondary border border-border-subtle rounded-lg p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Sync History</h3>

          <SyncHistory items={syncHistory} />
        </div>

        {/* Info Box */}
        <div className="bg-state-info/10 border border-state-info/30 rounded-lg p-4">
          <p className="text-sm text-state-info">
            <span className="font-semibold">Note:</span> Cloud sync backend is currently in development.
            Sync functionality will be available in a future release. This UI is for planning and testing
            purposes.
          </p>
        </div>
      </div>
    </div>
  )
}

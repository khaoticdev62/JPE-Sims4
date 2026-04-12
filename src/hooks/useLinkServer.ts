import { useEffect } from 'react'
import { useLiveSyncStore, LiveLog } from '@/stores/useLiveSyncStore'
import { v4 as uuidv4 } from 'uuid'

declare global {
  interface Window {
    electron: {
      on: (channel: string, func: (...args: any[]) => void) => void
      removeListener: (channel: string, func: (...args: any[]) => void) => void
      invoke: (channel: string, ...args: any[]) => Promise<any>
    }
  }
}

/**
 * useLinkServer (Story 13.1)
 * Reactive hook for handling Spectral Link events in the renderer.
 */
export function useLinkServer() {
  const { setConnectionStatus, addLog } = useLiveSyncStore()

  useEffect(() => {
    // 1. Status Monitoring
    const handleStatus = (payload: any) => {
      console.log('[LinkServer] Status:', payload)
      if (payload.status === 'connected' || payload.status === 'listening') {
        setConnectionStatus(true)
      } else if (payload.status === 'disconnected') {
        setConnectionStatus(false)
      }
    }

    // 2. High-Fidelity Event Ingestion
    const handleEvent = (event: any) => {
      const log: LiveLog = {
        id: uuidv4(),
        timestamp: event.timestamp || Date.now(),
        severity: event.severity || 'info',
        message: event.payload?.message || JSON.stringify(event.payload),
        source: 'TS4_ENGINE',
        traceback: event.payload?.traceback,
        exceptionType: event.payload?.exception_type
      }
      addLog(log)
    }

    if (!window.electron) return

    window.electron.on('sync:status', handleStatus)
    window.electron.on('sync:event', handleEvent)

    return () => {
      if (window.electron) {
        window.electron.removeListener('sync:status', handleStatus)
        window.electron.removeListener('sync:event', handleEvent)
      }
    }
  }, [setConnectionStatus, addLog])

  /**
   * Send a command back to the TS4 bridge
   */
  const sendCommand = async (type: string, payload: any) => {
    if (!window.electron) {
      console.warn('[useLinkServer] Electron API missing, command skipped:', type)
      return
    }
    return await window.electron.invoke('bridge:sendCommand', type, payload)
  }

  return { sendCommand }
}

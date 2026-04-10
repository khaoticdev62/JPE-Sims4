/**
 * Live Bridge Types (Epic 9)
 *
 * Shared types for JPE-Live synchronization bridge.
 */

export type BridgeStatus = 'disconnected' | 'connecting' | 'connected' | 'error' | 'damped'

export interface BridgeConnection {
  status: BridgeStatus
  scriptVersion: string
  gameVersion: string | null
  lastHeartbeat: number | null
  uptime: number
  message: string
}

export interface BridgeMetrics {
  cpu: number
  latency: number
  memory: number
  messagesSent: number
  messagesReceived: number
  errors: number
}

export interface BridgeEvent {
  type: 'HEARTBEAT' | 'LOG' | 'EXCEPTION' | 'TUNING_EXEC' | 'HANDSHAKE'
  timestamp: number
  payload: any
  severity: 'info' | 'warn' | 'error' | 'critical'
  source?: string
}

export interface BridgeConfig {
  enabled: boolean
  modsPath: string
  port: number
  host: string
  autoReconnect: boolean
  maxReconnectAttempts: number
  reconnectDelay: number
}

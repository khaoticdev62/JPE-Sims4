import net from 'net'
import { BrowserWindow } from 'electron'
import { BridgeEvent } from '../live-bridge/types/bridge'

/**
 * LinkServer (Story 13.1)
 * Industrial TCP server for bidirectional TS4 engine synchronization.
 * Listening on Port 9988.
 */
export class LinkServer {
  private server: net.Server | null = null
  private connections: Set<net.Socket> = new Set()
  private window: BrowserWindow | null = null
  private port: number = 9988

  constructor(window: BrowserWindow) {
    this.window = window
  }

  /**
   * Initialize and start the TCP Socket Server
   */
  public start(): void {
    if (this.server) return

    this.server = net.createServer((socket) => {
      this.handleConnection(socket)
    })

    this.server.on('error', (err) => {
      console.error('[LinkServer] Server error:', err)
      this.broadcastToRenderer('sync:status', { status: 'error', message: err.message })
    })

    this.server.listen(this.port, '127.0.0.1', () => {
      console.log(`[LinkServer] Spectral Link active on 127.0.0.1:${this.port}`)
      this.broadcastToRenderer('sync:status', { status: 'listening', port: this.port })
    })
  }

  /**
   * Stop the server and clean up connections
   */
  public stop(): void {
    this.connections.forEach((socket) => socket.destroy())
    this.connections.clear()
    this.server?.close()
    this.server = null
    console.log('[LinkServer] Server stopped.')
  }

  /**
   * Send a command to all connected TS4 bridge clients
   */
  public sendCommand(type: string, payload: any): void {
    const message = JSON.stringify({ type, payload, timestamp: Date.now() }) + '\n'
    this.connections.forEach((socket) => {
      socket.write(message)
    })
  }

  private handleConnection(socket: net.Socket): void {
    console.log(`[LinkServer] New engine connection: ${socket.remoteAddress}`)
    this.connections.add(socket)
    
    this.broadcastToRenderer('sync:status', { status: 'connected', client: socket.remoteAddress })

    let buffer = ''
    socket.on('data', (data) => {
      buffer += data.toString()
      const parts = buffer.split('\n')
      buffer = parts.pop() || ''

      for (const part of parts) {
        if (part.trim()) {
          this.handleMessage(part)
        }
      }
    })

    socket.on('close', () => {
      this.connections.delete(socket)
      this.broadcastToRenderer('sync:status', { status: 'disconnected', client: socket.remoteAddress })
    })

    socket.on('error', (err) => {
      console.error('[LinkServer] Socket error:', err)
    })
  }

  private handleMessage(rawMessage: string): void {
    try {
      const event = JSON.parse(rawMessage) as BridgeEvent
      
      // Industrial Packet Ingestion
      this.broadcastToRenderer('sync:event', event)

      // Sensory Trigger for high-impact events
      if (event.type === 'EXCEPTION') {
        this.broadcastToRenderer('sensory:trigger', 'error-fail', { message: 'Engine Exception Recieved' })
      }
    } catch (err) {
      console.error('[LinkServer] Failed to parse engine message:', err)
    }
  }

  private broadcastToRenderer(channel: string, payload: any): void {
    if (this.window && !this.window.isDestroyed()) {
      this.window.webContents.send(channel, payload)
    }
  }
}

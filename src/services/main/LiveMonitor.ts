import { BrowserWindow } from 'electron'
import fs from 'fs'
import path from 'path'
import os from 'os'

/**
 * LiveMonitor - Main-process service for Sims 4 engine synchronization.
 * Passively watches the Client.log for real-time mod debugging and "Spectral" sync pulses.
 */
export class LiveMonitor {
  private logPath: string
  private isWatching: boolean = false
  private window: BrowserWindow | null = null
  private lastSize: number = 0

  constructor(window: BrowserWindow) {
    this.window = window
    // Standard Sims 4 Documents path on Windows
    this.logPath = path.join(
      os.homedir(),
      'Documents',
      'Electronic Arts',
      'The Sims 4',
      'Client.log'
    )
  }

  /**
   * Start passive monitoring of the Sims 4 log
   */
  public start(): void {
    if (this.isWatching) return

    if (!fs.existsSync(this.logPath)) {
      console.warn(`[LiveMonitor] Client.log not found at: ${this.logPath}`)
      // We don't return here because the game might start later and create the file
    } else {
      this.lastSize = fs.statSync(this.logPath).size
    }

    this.isWatching = true
    console.log(`[LiveMonitor] Started monitoring: ${this.logPath}`)

    // Use a polling-style watch for better cross-platform stability with log files
    fs.watchFile(this.logPath, { interval: 1000 }, (curr, prev) => {
      if (curr.size > prev.size) {
        this.processNewLines(curr.size)
      } else if (curr.size < prev.size) {
        // Log was cleared or rotated
        this.lastSize = curr.size
      }
    })
  }

  /**
   * Stop monitoring
   */
  public stop(): void {
    if (!this.isWatching) return
    fs.unwatchFile(this.logPath)
    this.isWatching = false
    console.log('[LiveMonitor] Stopped monitoring.')
  }

  /**
   * Process appended lines in the log file
   */
  private processNewLines(newSize: number): void {
    try {
      const fd = fs.openSync(this.logPath, 'r')
      const buffer = Buffer.alloc(newSize - this.lastSize)
      fs.readSync(fd, buffer, 0, buffer.length, this.lastSize)
      fs.closeSync(fd)

      this.lastSize = newSize
      const content = buffer.toString('utf-8')
      const lines = content.split('\n').filter(line => line.trim().length > 0)

      lines.forEach(line => {
        this.analyzeLogLine(line)
      })
    } catch (err) {
      console.error('[LiveMonitor] Error reading Client.log appended content:', err)
    }
  }

  /**
   * Analyze log lines for "Spectral" synchronization triggers
   */
  private analyzeLogLine(line: string): void {
    // Basic heuristics for TS4 engine errors vs successful mod operations
    const isError = /error|failed|exception/i.test(line)
    const isWarning = /warn|caution/i.test(line)
    
    // Broadcast sync event to renderer
    this.window?.webContents.send('sync:event', {
      timestamp: Date.now(),
      raw: line,
      type: isError ? 'error' : (isWarning ? 'warning' : 'info'),
      source: 'TS4_ENGINE'
    })

    // If it's a high-impact error, trigger a priority sensory pulse
    if (isError) {
      this.window?.webContents.send('sensory:trigger', 'error-fail', { message: 'Engine Exception detected' })
    }
  }
}

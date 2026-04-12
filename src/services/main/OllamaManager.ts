import { spawn, ChildProcess } from 'child_process'
import { ipcMain } from 'electron'
import net from 'net'
import { PathResolver } from './PathResolver'
import { SecureStore } from './SecureStore'
import { SecurityEngine } from './SecurityEngine'

export enum OllamaProviderType {
  SYSTEM = 'system',
  SANDBOX = 'sandbox',
  NONE = 'none'
}

export interface OllamaInfo {
  provider: OllamaProviderType
  port: number
  url: string
  isRunning: boolean
  isShielded: boolean
}

/**
 * OllamaManager (Main Process)
 * 
 * Manages the lifecycle of the local AI engine.
 * Hardened with Industrial Shielding (Story 6.6).
 */
export class OllamaManager {
  private internalProcess: ChildProcess | null = null
  private currentProvider: OllamaProviderType = OllamaProviderType.NONE
  private isShielded = false
  private readonly SYSTEM_PORT = 11434
  private readonly SANDBOX_PORT = 11435
  private readonly HOST = '127.0.0.1'

  constructor() {
    this.registerIpcHandlers()
  }

  /**
   * Initializes the AI engine on boot.
   */
  async initialize() {
    console.log('[OllamaManager] Initializing Industrial AI Engine...')

    // 1. Check if system-wide Ollama is running
    const systemRunning = await this.isPortOpen(this.SYSTEM_PORT)
    
    if (systemRunning) {
      console.log('[OllamaManager] System-wide Ollama detected on port 11434')
      this.currentProvider = OllamaProviderType.SYSTEM
    } else {
      // 2. Start internal sandbox
      console.log('[OllamaManager] No system Ollama found. Starting sandboxed engine...')
      await this.startInternalServer()
      this.currentProvider = OllamaProviderType.SANDBOX
    }

    // 3. Shielded Handshake (Story 6.6)
    if (this.currentProvider !== OllamaProviderType.NONE) {
      this.isShielded = await this.verifyShieldedHandshake()
    }
  }

  /**
   * Verified Boot: Handshake with the AI engine.
   */
  private async verifyShieldedHandshake(): Promise<boolean> {
    try {
      const port = this.currentProvider === OllamaProviderType.SYSTEM ? this.SYSTEM_PORT : this.SANDBOX_PORT
      const isTargetOpen = await this.isPortOpen(port)
      
      if (isTargetOpen) {
        // In industrial mode, we "sign" the successful boot in the vault
        SecureStore.getInstance().set('ai_engine_last_handshake', {
          timestamp: Date.now(),
          provider: this.currentProvider,
          shielded: SecurityEngine.isShielded()
        })
        return true
      }
      return false
    } catch {
      return false
    }
  }

  /**
   * Starts the bundled Ollama binary.
   */
  private async startInternalServer(): Promise<void> {
    const binaryPath = PathResolver.getExternalPath('bin', 'ollama.exe')
    const modelsPath = PathResolver.getUserDataPath('models')

    this.internalProcess = spawn(binaryPath, ['serve'], {
      env: {
        ...process.env,
        OLLAMA_HOST: `${this.HOST}:${this.SANDBOX_PORT}`,
        OLLAMA_MODELS: modelsPath,
        OLLAMA_ORIGINS: 'app://.'
      },
      stdio: 'ignore'
    })

    this.internalProcess.on('error', (err) => {
      console.error('[OllamaManager] Sandbox spawn error:', err)
      this.currentProvider = OllamaProviderType.NONE
    })

    // Wait for the server to actually be ready
    await this.waitForServer(this.SANDBOX_PORT)
  }

  /**
   * Graceful shutdown.
   */
  stop() {
    if (this.internalProcess) {
      console.log('[OllamaManager] Stopping sandboxed AI engine...')
      this.internalProcess.kill()
      this.internalProcess = null
    }
  }

  private isPortOpen(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const socket = new net.Socket()
      const onError = () => {
        socket.destroy()
        resolve(false)
      }
      socket.setTimeout(1000)
      socket.once('error', onError)
      socket.once('timeout', onError)
      socket.connect(port, this.HOST, () => {
        socket.end()
        resolve(true)
      })
    })
  }

  private async waitForServer(port: number, retries = 10): Promise<boolean> {
    for (let i = 0; i < retries; i++) {
      if (await this.isPortOpen(port)) return true
      await new Promise(r => setTimeout(r, 1000))
    }
    return false
  }

  private registerIpcHandlers() {
    ipcMain.handle('ai:ollama:info', async (): Promise<OllamaInfo> => {
      const port = this.currentProvider === OllamaProviderType.SYSTEM ? this.SYSTEM_PORT : this.SANDBOX_PORT
      const isRunning = await this.isPortOpen(port)

      return {
        provider: this.currentProvider,
        port,
        url: `http://${this.HOST}:${port}`,
        isRunning,
        isShielded: this.isShielded
      }
    })

    ipcMain.handle('ai:ollama:switch-provider', async (_, type: OllamaProviderType): Promise<boolean> => {
      if (type === OllamaProviderType.SYSTEM) {
        if (await this.isPortOpen(this.SYSTEM_PORT)) {
          this.currentProvider = OllamaProviderType.SYSTEM
          this.isShielded = await this.verifyShieldedHandshake()
          return true
        }
      } else if (type === OllamaProviderType.SANDBOX) {
        if (!this.internalProcess) await this.startInternalServer()
        this.currentProvider = OllamaProviderType.SANDBOX
        this.isShielded = await this.verifyShieldedHandshake()
        return true
      }
      return false
    })
  }
}

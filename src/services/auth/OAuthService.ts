/**
 * OAuth Service
 * Handles centered popup management and postMessage communication for OAuth flows.
 */

export interface OAuthResult {
  provider: string
  token: string
  user: {
    name: string
    email?: string
    avatar?: string
  }
}

export class OAuthService {
  private static popup: Window | null = null
  private static messageHandler: ((event: MessageEvent) => void) | null = null

  /**
   * Open a centered OAuth popup window
   */
  static openPopup(url: string, provider: string): Promise<OAuthResult> {
    return new Promise((resolve, reject) => {
      // Clean up previous listeners
      if (this.messageHandler) {
        window.removeEventListener('message', this.messageHandler)
      }

      // Center the popup
      const width = 600
      const height = 700
      const left = window.screenX + (window.outerWidth - width) / 2
      const top = window.screenY + (window.outerHeight - height) / 2
      
      const features = `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`
      
      this.popup = window.open(url, `OAuth_${provider}`, features)
      
      if (!this.popup) {
        reject(new Error('Popup blocked. Please enable popups for this site.'))
        return
      }

      // Polling to detect window closure
      const pollTimer = setInterval(() => {
        if (this.popup?.closed) {
          clearInterval(pollTimer)
          window.removeEventListener('message', this.messageHandler!)
          reject(new Error('Authentication cancelled by user.'))
        }
      }, 500)

      // Listen for postMessage from the callback window
      this.messageHandler = (event: MessageEvent) => {
        // In production, ensure event.origin matches your app's origin
        if (event.data?.type === 'oauth-success' && event.data?.provider === provider) {
          clearInterval(pollTimer)
          window.removeEventListener('message', this.messageHandler!)
          this.popup?.close()
          resolve(event.data.result)
        } else if (event.data?.type === 'oauth-error') {
          clearInterval(pollTimer)
          window.removeEventListener('message', this.messageHandler!)
          this.popup?.close()
          reject(new Error(event.data.error || 'Authentication failed.'))
        }
      }

      window.addEventListener('message', this.messageHandler)
    })
  }

  /**
   * Helper to trigger simulated OAuth for testing
   */
  static async simulateLogin(provider: string): Promise<OAuthResult> {
    // For direct testing WITHOUT a real backend
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          provider,
          token: `simulated_${provider}_${Math.random().toString(36).substring(7)}`,
          user: {
            name: `Simulated ${provider} User`,
            email: `user@${provider.toLowerCase()}.test`,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider}`
          }
        })
      }, 1500)
    })
  }
}

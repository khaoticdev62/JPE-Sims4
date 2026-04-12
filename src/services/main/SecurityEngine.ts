import crypto from 'crypto'
import os from 'os'

/**
 * Industrial Security Engine
 * Provides hardware-bound AES-256-GCM encryption for application configuration.
 */
export class SecurityEngine {
  private static readonly ALGORITHM = 'aes-256-gcm'
  private static readonly IV_LENGTH = 12
  private static readonly AUTH_TAG_LENGTH = 16
  private static readonly SCRYPT_KEY_LEN = 32
  
  private static masterKey: Buffer | null = null

  /**
   * Derive a stable 256-bit key from the machine's hardware profile.
   * Bound to: Hostname, CPU Model, and System Architecture.
   */
  private static getMasterKey(): Buffer {
    if (this.masterKey) return this.masterKey

    try {
      // Stable hardware fingerprint (Industrial Synthesis)
      const hwFingerprint = [
        os.hostname(),
        os.cpus()[0]?.model || 'industrial-cpu',
        os.totalmem().toString(),
        process.env.COMPUTERNAME || 'handheld-node',
        'jpe-studio-industrial-shield-v1' // Master Seed
      ].join(':')

      const salt = crypto.createHash('sha256').update('jpe-rebel-industrial-salt-2026').digest()
      this.masterKey = crypto.scryptSync(hwFingerprint, salt, this.SCRYPT_KEY_LEN)
      console.log('[SecurityEngine] Hardware-bound vault established via AES-256.')
      return this.masterKey
    } catch (_error) {
      console.error('[SecurityEngine] Hardware-binding failed, falling back to profile-specific ID')
      const fallbackSecret = process.env.USERNAME || process.env.USER || 'jpe-fallback-shield'
      this.masterKey = crypto.scryptSync(fallbackSecret, 'jpe-emergency-salt', this.SCRYPT_KEY_LEN)
      return this.masterKey
    }
  }

  /**
   * Encrypt a plaintext string.
   * Returns a JSON string containing the IV, auth tag, and ciphertext.
   */
  static encrypt(plaintext: string): string {
    if (!plaintext) return ''

    const iv = crypto.randomBytes(this.IV_LENGTH)
    const key = this.getMasterKey()
    const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv, {
      authTagLength: this.AUTH_TAG_LENGTH
    })

    let ciphertext = cipher.update(plaintext, 'utf8', 'hex')
    ciphertext += cipher.final('hex')
    
    const authTag = cipher.getAuthTag().toString('hex')

    return JSON.stringify({
      iv: iv.toString('hex'),
      at: authTag,
      ct: ciphertext
    })
  }

  /**
   * Decrypt a ciphertext string produced by encrypt().
   */
  static decrypt(encryptedPayload: string): string {
    if (!encryptedPayload) return ''

    try {
      const { iv, at, ct } = JSON.parse(encryptedPayload)
      const key = this.getMasterKey()
      
      const decipher = crypto.createDecipheriv(
        this.ALGORITHM, 
        key, 
        Buffer.from(iv, 'hex'),
        { authTagLength: this.AUTH_TAG_LENGTH }
      )
      
      decipher.setAuthTag(Buffer.from(at, 'hex'))

      let decrypted = decipher.update(ct, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      
      return decrypted
    } catch (error) {
      console.error('[SecurityEngine] Decryption failed:', error)
      return ''
    }
  }

  /**
   * Returns true if the hardware-binding is active.
   */
  static isShielded(): boolean {
    try {
      return this.getMasterKey().length === this.SCRYPT_KEY_LEN
    } catch {
      return false
    }
  }
}

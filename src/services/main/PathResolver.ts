import { app } from 'electron'
import path from 'path'
import fs from 'fs'

/**
 * JPE Studio Path Resolver
 * 
 * Provides a unified strategy for resolving filesystem paths across 
 * Development and Production (ASAR) environments.
 */
export class PathResolver {
  private static readonly isDev = process.env.NODE_ENV === 'development'

  /**
   * Resolves a path internal to the application source/build.
   * In Dev: Relative to project root
   * In Prod: Inside the app.asar
   */
  static getInternalPath(...segments: string[]): string {
    let basePath = app.getAppPath()
    
    // Industrial Path Correction (Internal Discovery)
    // When app is launched via `electron dist-electron/main.js` (CLI/E2E), 
    // getAppPath() resolves to the distribution folder. To find siblings
    // like 'out' or correctly point to 'dist-electron', we must re-base 
    // to the project root.
    if (!app.isPackaged) {
      const normalizedBase = path.normalize(basePath)
      if (normalizedBase.endsWith('dist-electron') || normalizedBase.endsWith('dist-electron' + path.sep)) {
        basePath = path.dirname(normalizedBase)
      }
    }
    
    return path.join(basePath, ...segments)
  }

  /**
   * Resolves a path in the external 'resources' folder.
   * In Dev: Relative to project root (since resources aren't packed)
   * In Prod: In the 'resources' folder next to app.asar
   */
  static getExternalPath(...segments: string[]): string {
    const basePath = app.isPackaged 
      ? process.resourcesPath 
      : process.cwd()
    return path.join(basePath, ...segments)
  }

  /**
   * Resolves a path in the user's data directory.
   */
  static getUserDataPath(...segments: string[]): string {
    return path.join(app.getPath('userData'), ...segments)
  }

  /**
   * Specific helper for branding icons.
   * Prioritizes 'internal' assets first, then 'external'.
   */
  static getBrandingIconPath(): string {
    const iconNames = ['icon.ico', 'icon.png', 'logo.png']
    
    // Check internal 'public' first (Next.js copies these)
    for (const name of iconNames) {
      const internal = this.getInternalPath('out', name)
      if (fs.existsSync(internal)) return internal
    }

    // Fallback to project root assets
    for (const name of iconNames) {
      const external = this.getExternalPath('public', name)
      if (fs.existsSync(external)) return external
    }

    return ''
  }

  /**
   * Specific helper for Python scripts.
   * These MUST be external/unpacked.
   */
  static getPythonScriptPath(scriptName: string): string {
     // Based on electron-builder mapping
     return this.getExternalPath(scriptName)
  }

  /**
   * Resolves a static asset for the Protocol Handler.
   */
  static getStaticAssetPath(urlPath: string): string {
    // 1. Check internal out/ first
    const internalPath = this.getInternalPath('out', urlPath)
    if (fs.existsSync(internalPath)) return internalPath

    // 2. Check for index.html as fallback for SPA routing
    if (!path.extname(urlPath)) {
        const indexHtml = this.getInternalPath('out', urlPath, 'index.html')
        if (fs.existsSync(indexHtml)) return indexHtml
    }

    return internalPath // Return the internal path as default even if it fails exists check
  }
}

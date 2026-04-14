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
   * Resolves a path to the scripts/ directory.
   * Handles both dev and packaged modes.
   */
  static getScriptPath(scriptName: string): string {
    if (app.isPackaged) {
      return path.join(process.resourcesPath, scriptName)
    }
    return path.join(process.cwd(), scriptName)
  }

  /**
   * Resolves a static asset for the Protocol Handler.
   * Industrial fix for SPA routing: ensures assets like _next/ are resolved 
   * from the root even when requested from a deep client-side path.
   */
  static getStaticAssetPath(urlPath: string): string {
    let cleanPath = urlPath

    // 1. Root Asset Normalization: strip path prefixes if it looks like a Next.js asset/system path
    // e.g., 'projects/_next/static/...' -> '_next/static/...'
    if (cleanPath.includes('_next/') || cleanPath.includes('assets/') || cleanPath.includes('favicon.ico')) {
        const index = cleanPath.indexOf('_next/')
        if (index > 0) cleanPath = cleanPath.substring(index)
        
        const assetIndex = cleanPath.indexOf('assets/')
        if (assetIndex > 0) cleanPath = cleanPath.substring(assetIndex)
    }

    // 2. Initial resolution relative to internal 'out/'
    const targetPath = this.getInternalPath('out', cleanPath)
    
    // 3. If it's a file that exists, return it
    if (fs.existsSync(targetPath) && fs.statSync(targetPath).isFile()) {
      return targetPath
    }

    // 4. Directory check: if it's a directory, look for index.html
    const indexHtml = path.join(targetPath, 'index.html')
    if (fs.existsSync(indexHtml)) {
      return indexHtml
    }

    // 5. Global SPA Fallback: if no extension, serve the root index.html
    // This allows the React router to take over while keeping script paths correct.
    if (!path.extname(cleanPath)) {
        const rootIndex = this.getInternalPath('out', 'index.html')
        if (fs.existsSync(rootIndex)) return rootIndex
    }

    return targetPath 
  }
}

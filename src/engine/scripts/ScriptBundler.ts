import JSZip from 'jszip'
import type { ModFile } from '@/types/index'

/**
 * ScriptBundler - Industrial-grade Sims 4 Script Packager.
 * Bundles multiple Python source files into a standard Sims 4 .ts4script archive.
 * Optimized for high-throughput build pipelines with path preservation.
 */
export class ScriptBundler {
  /**
   * Bundle multiple Python files into a single .ts4script (ZIP) blob.
   * @param files Array of Python ModFiles to bundle.
   * @param projectRoot Optional root path to calculate relative paths.
   * @returns ArrayBuffer containing the ZIP data.
   * @throws Error with descriptive message on failure.
   */
  static async bundle(files: ModFile[], projectRoot?: string): Promise<ArrayBuffer> {
    if (files.length === 0) {
      throw new Error('No files provided for bundling.')
    }

    const zip = new JSZip()
    
    // 1. Filter for Python files only
    const pythonFiles = files.filter(f => f.type === 'py' || f.name.endsWith('.py'))
    
    if (pythonFiles.length === 0) {
      throw new Error('No Python files (.py) found in project to bundle.')
    }

    // 2. Add files to the archive with path preservation (Patch #1)
    pythonFiles.forEach(file => {
      // Calculate entry path: prefer relative path to avoid collisions
      let entryPath = file.name
      
      // If we have a full path and a project root, calculate relative path
      if (projectRoot && file.path.startsWith(projectRoot)) {
        entryPath = file.path.substring(projectRoot.length).replace(/^[/\\]+/, '')
      } 
      // Fallback: If path contains "scripts/" or "mods/", try to keep sub-structure
      else if (file.path.includes('/')) {
        const parts = file.path.split(/[/\\]/)
        const scriptIdx = parts.lastIndexOf('scripts')
        if (scriptIdx !== -1 && scriptIdx < parts.length - 1) {
          entryPath = parts.slice(scriptIdx + 1).join('/')
        }
      }

      // Ensure standard ZIP path separators
      entryPath = entryPath.replace(/\\/g, '/')
      
      // Patch #9: JSZip uses UTF-8 by default, but we ensure content is string
      zip.file(entryPath, file.content, { 
        createFolders: true,
        date: new Date()
      })
    })

    try {
      // 3. Generate the ZIP as an ArrayBuffer
      // Compression: DEFLATE (Level 9 for maximum industrial fidelity)
      const content = await zip.generateAsync({ 
        type: 'arraybuffer',
        compression: 'DEFLATE',
        compressionOptions: { level: 9 },
        encodeFileName: (name) => Buffer.from(name).toString('utf-8') // Explicit UTF-8 (Patch #9)
      })
      
      console.debug(`[ScriptBundler] Successfully bundled ${pythonFiles.length} scripts.`)
      return content
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown ZIP error'
      throw new Error(`[ScriptBundler] Packaging failed: ${msg}`) // Patch #3
    }
  }

  /**
   * Helper to determine if a project requires script bundling.
   */
  static needsBundling(files: ModFile[]): boolean {
    return files.some(f => f.type === 'py' || f.name.endsWith('.py'))
  }
}

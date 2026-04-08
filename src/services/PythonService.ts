import JSZip from 'jszip'
import { PythonParser } from '@/engine/parsers/PythonParser'

/**
 * PythonService - Orchestrates Sims 4 Python script reverse engineering.
 * Handles .ts4script archives and converts Python structures into JPE metadata.
 */
export class PythonService {
  /**
   * Extracts files from a .ts4script archive.
   */
  static async extractFromArchive(buffer: ArrayBuffer): Promise<Map<string, Uint8Array>> {
    try {
      const zip = await JSZip.loadAsync(buffer)
      const files = new Map<string, Uint8Array>()
      
      const filePromises = Object.keys(zip.files).map(async (relativePath) => {
        const file = zip.files[relativePath]
        if (!file.dir) {
          try {
            const data = await file.async('uint8array')
            files.set(relativePath, data)
          } catch (err) {
            console.warn(`[PythonService] Failed to extract ${relativePath}:`, err)
          }
        }
      })
      
      await Promise.all(filePromises)
      return files
    } catch (error) {
      console.error('[PythonService] Invalid .ts4script archive:', error)
      return new Map()
    }
  }

  /**
   * Sanitizes Python docstrings for JPE multiline compatibility
   */
  private static sanitizeDocstring(doc: string): string {
    if (!doc) return ''
    return doc
      .replace(/"/g, '\\"') // Escape quotes
      .replace(/\s+/g, ' ') // Collapse all whitespace (newlines and indentation)
      .trim()
  }

  /**
   * Converts a Python script into a human-readable JPE representation.
   * This is a "Skeletal Decompilation" that exposes structure for translation.
   */
  static decompileToJpe(source: string, fileName: string): string {
    const parsed = PythonParser.parse(source)
    
    let jpe = `/**\n * JPE TRANSLATION UNIT: Python Script\n`
    jpe += ` * Source: ${fileName}\n`
    jpe += ` * Type: ${parsed.metadata.hasTuningInjector ? 'TUNING_INJECTOR' : 'UTILITY_SCRIPT'}\n`
    jpe += ` */\n\n`

    jpe += `MODULE: "${fileName.replace(/\.(py|pyc)$/, '')}"\n`
    jpe += `VERSION: "1.0.0"\n\n`

    // Imports
    if (parsed.imports.length > 0) {
      jpe += `// External Dependencies\n`
      parsed.imports.forEach(imp => {
        jpe += `import: "${imp.module}"\n`
      })
      jpe += `\n`
    }

    // Classes
    parsed.classes.forEach(cls => {
      jpe += `class: "${cls.name}"\n`
      if (cls.baseClasses.length > 0) {
        jpe += `  inherits: [${cls.baseClasses.map(b => `"${b}"`).join(', ')}]\n`
      }
      if (cls.docstring) {
        jpe += `  description: "${this.sanitizeDocstring(cls.docstring)}"\n`
      }
      
      cls.methods.forEach(method => {
        jpe += `  method: "${method.name}"\n`
        if (method.parameters.length > 0) {
          jpe += `    params: [${method.parameters.map(p => `"${p}"`).join(', ')}]\n`
        }
      })
      jpe += `\n`
    })

    // Top-level Functions
    parsed.functions.forEach(func => {
      jpe += `function: "${func.name}"\n`
      if (func.parameters.length > 0) {
        jpe += `  params: [${func.parameters.map(p => `"${p}"`).join(', ')}]\n`
      }
      if (func.docstring) {
        jpe += `  description: "${this.sanitizeDocstring(func.docstring)}"\n`
      }
      jpe += `\n`
    })

    return jpe
  }

  /**
   * Identifies if a binary file is a compiled Python script (.pyc)
   */
  static isPyc(buffer: ArrayBuffer): boolean {
    const view = new DataView(buffer)
    if (buffer.byteLength < 4) return false
    
    // Check for Python magic number (Sims 4 uses Python 3.7/3.10)
    // Common magic: 0x42000d0a (3.7), 0x6f000d0a (3.10)
    const magic = view.getUint32(0, true)
    return (magic & 0x0000FFFF) === 0x0D0A
  }
}

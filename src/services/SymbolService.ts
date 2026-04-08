import { ModFile, MonacoCompletionItem, JpeSymbol } from '@/types'
import { STBLService } from './translation/stbl'
import { useSymbolStore } from '@/stores/useSymbolStore'

/**
 * SymbolService - Orchestrates project-wide symbol extraction
 * Scans XML and JPE files to build a global index of valid references.
 * Hardened for performance and stale-reference cleanup.
 */
export class SymbolService {
  /**
   * Rebuilds the global symbol index from all project files.
   * Uses chunked processing to avoid blocking the main thread.
   */
  static async indexProject(files: ModFile[]): Promise<void> {
    const { setIndexing, clearSymbols } = useSymbolStore.getState()
    
    setIndexing(true)
    clearSymbols()
    
    const CHUNK_SIZE = 50 // Process 50 files before yielding
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Index the individual file
      await this.updateFileIndex(file)
      
      // Yield to main thread every CHUNK_SIZE files
      if (i > 0 && i % CHUNK_SIZE === 0) {
        await new Promise(resolve => setTimeout(resolve, 0))
      }
    }

    setIndexing(false)
    console.debug(`[SymbolService] Project indexing complete for ${files.length} files.`)
  }

  /**
   * Updates the index for a single file (Incremental Update)
   * Now perfectly replaces the file's symbols, preventing stale references.
   */
  static async updateFileIndex(file: ModFile): Promise<void> {
    const { updateFileSymbols } = useSymbolStore.getState()
    
    // Skip files without content
    if (!file.content) return

    const interactions = new Set<string>()
    const stblKeys = new Set<string>()
    
    if (file.type === 'xml') {
      const found = this.extractInteractions(file.content)
      found.forEach(i => interactions.add(i))
    } else if (file.type === 'jpe' || file.type === 'stbl') {
      const found = this.extractStblKeys(file.content)
      found.forEach(k => stblKeys.add(k))
    }

    // Surgical update: replaces symbols for this specific FileID
    updateFileSymbols(file.id, interactions, stblKeys)
  }

  /**
   * Extracts interaction names from tuning XML
   * Pattern: <I n="interaction_name" ...>
   */
  private static extractInteractions(xml: string): string[] {
    const results: string[] = []
    const regex = /<I\s+[^>]*n="([^"]+)"/g
    let match
    
    while ((match = regex.exec(xml)) !== null) {
      if (match[1]) results.push(match[1])
    }
    
    return results
  }

  /**
   * Extracts and hashes strings from JPE content
   * Pattern: text: "string" or name: "string"
   */
  private static extractStblKeys(content: string): string[] {
    const results: string[] = []
    // Look for string-like properties in JPE (text, name, notification_text)
    const regex = /(?:text|name|notification_text):\s*"([^"]+)"/g
    let match
    
    while ((match = regex.exec(content)) !== null) {
      if (match[1]) {
        // Calculate hash key and format as 0xXXXXXXXX
        const key = STBLService.formatKey(match[1])
        results.push(key)
      }
    }
    
    return results
  }

  /**
   * Returns completion items for Monaco, merging project and external symbols.
   */
  static getCompletionItems(type: 'tuning' | 'stbl'): MonacoCompletionItem[] {
    const { getInteractions, getStblKeys, externalInteractions, externalStblKeys } = useSymbolStore.getState()
    const items: MonacoCompletionItem[] = []

    if (type === 'tuning') {
      // 1. Add Local Project Interactions
      getInteractions().forEach(name => {
        items.push({
          label: name,
          kind: 17, // Keyword
          detail: '[Project] Tuning',
          insertText: name
        })
      })

      // 2. Add External Mod Interactions
      externalInteractions.forEach((symbol, key) => {
        // Only add once (indexed by both ID and Name)
        if (key === symbol.name || !symbol.name) {
          items.push({
            label: symbol.name || symbol.id,
            kind: 17,
            detail: `[External] ${symbol.id}`,
            documentation: `Source: ${symbol.sourcePackage.split(/[/\\]/).pop()}`,
            insertText: symbol.name || symbol.id
          })
        }
      })
    } else {
      // STBL Keys
      getStblKeys().forEach(key => {
        items.push({
          label: key,
          kind: 14, // Constant
          detail: '[Project] String Key',
          insertText: key
        })
      })

      externalStblKeys.forEach((symbol) => {
        items.push({
          label: symbol.id,
          kind: 14,
          detail: '[External] String Key',
          documentation: `Source: ${symbol.sourcePackage.split(/[/\\]/).pop()}`,
          insertText: symbol.id
        })
      })
    }

    return items
  }

  /**
   * Resolves a symbol ID or Name to its source metadata (for Go-to-Definition)
   */
  static resolveExternalSymbol(query: string): JpeSymbol | null {
    const { externalInteractions, externalStblKeys } = useSymbolStore.getState()
    return (externalInteractions.get(query) || externalStblKeys.get(query) || null) as JpeSymbol | null
  }
}

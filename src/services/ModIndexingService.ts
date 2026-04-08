import { FileService } from './FileService'
import { DBPF_RESOURCE_TYPES } from '@/engine/parsers/types/package'
import { useSymbolStore, type ExternalSymbol } from '@/stores/useSymbolStore'
import { PackageService } from './PackageService'

/**
 * ModIndexingService - High-performance background indexer for Sims 4 folders.
 * Scans .package files to build a global database of cross-mod references.
 * Optimized with batching and memory management.
 * Includes debounced file watcher for auto-reindexing on folder changes.
 */
export class ModIndexingService {
  private static isIndexing = false
  private static watcherInterval: ReturnType<typeof setInterval> | null = null
  private static lastKnownPackages = new Set<string>()
  private static debounceTimer: ReturnType<typeof setTimeout> | null = null
  private static readonly DEBOUNCE_MS = 2000
  private static readonly POLL_INTERVAL_MS = 5000

  /**
   * Start watching a mods folder for changes and trigger debounced re-indexing.
   * Uses polling since browser environments don't have native fs.watch.
   */
  static startFolderWatcher(folderPath: string): void {
    this.stopFolderWatcher()

    console.log(`[ModIndexingService] Started file watcher for: ${folderPath}`)

    this.watcherInterval = setInterval(async () => {
      try {
        const packagePaths = await this.getAllPackagePaths(folderPath)
        const currentPackages = new Set(packagePaths)

        // Detect changes: added, removed, or modified files
        const hasChanges =
          currentPackages.size !== this.lastKnownPackages.size ||
          [...currentPackages].some(p => !this.lastKnownPackages.has(p))

        if (hasChanges) {
          this.lastKnownPackages = currentPackages
          this.debouncedReindex(folderPath)
        }
      } catch (err) {
        console.error('[ModIndexingService] Watcher poll error:', err)
      }
    }, this.POLL_INTERVAL_MS)
  }

  /**
   * Stop the active folder watcher.
   */
  static stopFolderWatcher(): void {
    if (this.watcherInterval) {
      clearInterval(this.watcherInterval)
      this.watcherInterval = null
      console.log('[ModIndexingService] File watcher stopped.')
    }
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }
  }

  /**
   * Debounced re-indexing trigger to avoid rapid consecutive scans.
   */
  private static debouncedReindex(folderPath: string): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }

    console.log('[ModIndexingService] Folder change detected, scheduling re-index...')

    this.debounceTimer = setTimeout(() => {
      console.log('[ModIndexingService] Triggering re-index after debounce.')
      this.indexModsFolder(folderPath)
      this.debounceTimer = null
    }, this.DEBOUNCE_MS)
  }

  /**
   * Capture the initial set of packages when first indexing (for change detection).
   */
  private static async capturePackageSnapshot(folderPath: string): Promise<Set<string>> {
    const paths = await this.getAllPackagePaths(folderPath)
    this.lastKnownPackages = new Set(paths)
    return this.lastKnownPackages
  }

  /**
   * Recursively scan a folder for Sims 4 packages and index their symbols.
   */
  static async indexModsFolder(folderPath: string): Promise<void> {
    if (this.isIndexing) return
    this.isIndexing = true

    const { setIndexingMods, setExternalSymbols, setIndexedPackagesCount } = useSymbolStore.getState()

    try {
      setIndexingMods(true)
      setIndexedPackagesCount(0)

      // 1. Collect all package files recursively
      const packagePaths = await this.getAllPackagePaths(folderPath)
      // Capture snapshot for change detection
      this.lastKnownPackages = new Set(packagePaths)
      const total = packagePaths.length
      
      const interactions = new Map<string, ExternalSymbol>()
      const stblKeys = new Map<string, ExternalSymbol>()
      
      // 2. Batch process packages to index their TOC
      const BATCH_SIZE = 5
      for (let i = 0; i < packagePaths.length; i += BATCH_SIZE) {
        const batch = packagePaths.slice(i, i + BATCH_SIZE)
        
        await Promise.all(batch.map(async (path) => {
          try {
            const buffer = await FileService.readFileBuffer(path)
            if (!buffer) return

            // Parse ONLY the index
            const data = await PackageService.loadPackage(path, buffer)
            if (data) {
              for (const res of data.resources) {
                const instanceHex = `0x${res.instance.toString(16).toUpperCase()}`
                
                if (res.type === DBPF_RESOURCE_TYPES.TuningInstance || 
                    res.type === DBPF_RESOURCE_TYPES.Buff || 
                    res.type === DBPF_RESOURCE_TYPES.Trait ||
                    res.type === DBPF_RESOURCE_TYPES.GameplayData) {
                  
                  // Extract Name for high-fidelity autocomplete
                  const name = await PackageService.getResourceName(res, buffer)
                  const symbol: ExternalSymbol = {
                    id: instanceHex,
                    name: name || undefined,
                    sourcePackage: path,
                    type: 'tuning'
                  }
                  
                  // Index by both ID and Name if available
                  interactions.set(instanceHex, symbol)
                  if (name) interactions.set(name, symbol)
                  
                } else if (res.type === DBPF_RESOURCE_TYPES.STBL) {
                  stblKeys.set(instanceHex, {
                    id: instanceHex,
                    sourcePackage: path,
                    type: 'stbl'
                  })
                }
              }
            }
          } catch (err) {
            console.error(`Failed to index package: ${path}`, err)
          }
        }))

        setIndexedPackagesCount(Math.min(i + BATCH_SIZE, total))
        // Yield to UI thread to prevent blocking
        await new Promise(resolve => setTimeout(resolve, 0))
      }

      setExternalSymbols(interactions, stblKeys)
      console.debug(`[ModIndexingService] Indexed ${total} packages, found ${interactions.size} interaction entries.`)
    } catch (error) {
      console.error('External mod indexing failed', error)
    } finally {
      this.isIndexing = false
      setIndexingMods(false)
    }
  }

  /**
   * Helper to recursively find all .package files with circular loop protection (Patch #7).
   */
  private static async getAllPackagePaths(dirPath: string, visited: Set<string> = new Set()): Promise<string[]> {
    if (visited.has(dirPath)) {
      console.warn(`[ModIndexingService] Circular symlink detected: ${dirPath}. Skipping.`)
      return []
    }
    visited.add(dirPath)

    const results: string[] = []
    const result = await FileService.listDirectory(dirPath)
    
    if (result.success && result.files) {
      for (const file of result.files) {
        const fullPath = `${dirPath}/${file.name}`
        if (file.isDirectory) {
          results.push(...(await this.getAllPackagePaths(fullPath, visited)))
        } else if (file.isFile && file.name.toLowerCase().endsWith('.package')) {
          results.push(fullPath)
        }
      }
    }
    
    return results
  }
}

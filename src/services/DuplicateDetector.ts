/**
 * Duplicate Detector Service
 *
 * Standalone service for detecting duplicate files in Sims 4 Mods folders.
 * Uses MD5 hashing and Instance ID awareness for accurate duplicate detection.
 * Extracted from ModCleanupService for reusability and testability.
 */

import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

export interface DuplicateGroup {
  /** MD5 hash shared by all files in this group */
  hash: string
  /** Files that share this hash */
  files: DuplicateFile[]
  /** Total size of duplicates (excluding one "keep" copy) */
  wastedSpace: number
  /** Recommendation for which file to keep */
  keepRecommendation: string
}

export interface DuplicateFile {
  /** Full file path */
  path: string
  /** File name */
  name: string
  /** File size in bytes */
  size: number
  /** Last modified timestamp */
  mtime: number
  /** MD5 hash */
  hash: string
}

export interface DuplicateDetectionResult {
  /** Groups of duplicate files */
  duplicateGroups: DuplicateGroup[]
  /** Total files scanned */
  totalFilesScanned: number
  /** Total duplicate files found */
  totalDuplicates: number
  /** Total wasted space in bytes */
  totalWastedSpace: number
}

/**
 * Duplicate Detector Service
 *
 * Scans directories for duplicate files using MD5 hashing
 * with size-based pre-filtering for efficiency.
 */
export class DuplicateDetector {
  /**
   * Scan a directory for duplicate files
   */
  static async scanForDuplicates(
    directoryPath: string,
    options: {
      fileExtensions?: string[]
      onProgress?: (current: number, total: number) => void
    } = {}
  ): Promise<DuplicateDetectionResult> {
    const { fileExtensions, onProgress } = options

    // 1. Get all files recursively
    const allFiles = await this.recursiveReaddir(directoryPath, fileExtensions)
    const totalFiles = allFiles.length

    // 2. Group files by size (quick pre-filter)
    const sizeMap = await this.groupFilesBySize(allFiles, onProgress)

    // 3. Hash only files with size collisions
    const hashMap = await this.hashFilesWithSizeCollisions(
      sizeMap,
      onProgress,
      totalFiles,
    )

    // 4. Build duplicate groups
    const duplicateGroups = await this.buildDuplicateGroups(hashMap)

    // 5. Calculate statistics
    const totalDuplicates = duplicateGroups.reduce(
      (sum, group) => sum + group.files.length - 1,
      0,
    )
    const totalWastedSpace = duplicateGroups.reduce(
      (sum, group) => sum + group.wastedSpace,
      0,
    )

    return {
      duplicateGroups,
      totalFilesScanned: totalFiles,
      totalDuplicates,
      totalWastedSpace,
    }
  }

  /**
   * Recursively read all files in a directory
   */
  private static async recursiveReaddir(
    dirPath: string,
    fileExtensions?: string[],
  ): Promise<string[]> {
    const files: string[] = []

    async function scanDir(currentPath: string) {
      try {
        const entries = await fs.readdir(currentPath, { withFileTypes: true })

        for (const entry of entries) {
          const fullPath = path.join(currentPath, entry.name)

          if (entry.isDirectory()) {
            await scanDir(fullPath)
          } else if (entry.isFile()) {
            // Filter by extension if specified
            if (
              !fileExtensions ||
              fileExtensions.length === 0 ||
              fileExtensions.some((ext) => entry.name.toLowerCase().endsWith(ext.toLowerCase()))
            ) {
              files.push(fullPath)
            }
          }
        }
      } catch (error) {
        console.warn(`Failed to read directory: ${currentPath}`, error)
      }
    }

    await scanDir(dirPath)
    return files
  }

  /**
   * Group files by size for pre-filtering
   */
  private static async groupFilesBySize(
    files: string[],
    onProgress?: (current: number, total: number) => void,
  ): Promise<Map<number, string[]>> {
    const sizeMap = new Map<number, string[]>()

    for (let i = 0; i < files.length; i++) {
      try {
        const stats = await fs.stat(files[i])
        if (!sizeMap.has(stats.size)) {
          sizeMap.set(stats.size, [])
        }
        sizeMap.get(stats.size)!.push(files[i])
      } catch (error) {
        console.warn(`Failed to stat file: ${files[i]}`, error)
      }

      if (onProgress) {
        onProgress(
          Math.floor((i / files.length) * 30), // 30% of progress for stat phase
          files.length,
        )
      }
    }

    return sizeMap
  }

  /**
   * Hash only files that have size collisions
   */
  private static async hashFilesWithSizeCollisions(
    sizeMap: Map<number, string[]>,
    onProgress?: (current: number, total: number) => void,
    totalFiles?: number,
  ): Promise<Map<string, string[]>> {
    const hashMap = new Map<string, string[]>()
    let processedCount = 0

    for (const [_size, paths] of sizeMap.entries()) {
      // Only hash files with size collisions
      if (paths.length > 1) {
        for (const filePath of paths) {
          try {
            const hash = await this.computeMD5(filePath)
            if (!hashMap.has(hash)) {
              hashMap.set(hash, [])
            }
            hashMap.get(hash)!.push(filePath)
          } catch (error) {
            console.warn(`Failed to hash file: ${filePath}`, error)
          }

          processedCount++
          if (onProgress && totalFiles) {
            onProgress(
              30 + Math.floor((processedCount / totalFiles) * 70), // Remaining 70% for hash phase
              totalFiles,
            )
          }
        }
      }
    }

    return hashMap
  }

  /**
   * Build duplicate groups from hash map
   */
  private static async buildDuplicateGroups(
    hashMap: Map<string, string[]>,
  ): Promise<DuplicateGroup[]> {
    const groups: DuplicateGroup[] = []

    for (const [hash, paths] of hashMap.entries()) {
      if (paths.length > 1) {
        const files: DuplicateFile[] = []

        for (const filePath of paths) {
          try {
            const stats = await fs.stat(filePath)
            files.push({
              path: filePath,
              name: path.basename(filePath),
              size: stats.size,
              mtime: stats.mtimeMs,
              hash,
            })
          } catch (error) {
            console.warn(`Failed to stat file: ${filePath}`, error)
          }
        }

        if (files.length > 1) {
          // Sort by modification time (newest first) to recommend keeping latest
          files.sort((a, b) => b.mtime - a.mtime)

          groups.push({
            hash,
            files,
            wastedSpace: files[0].size * (files.length - 1),
            keepRecommendation: files[0].path,
          })
        }
      }
    }

    // Sort groups by wasted space (largest first)
    return groups.sort((a, b) => b.wastedSpace - a.wastedSpace)
  }

  /**
   * Compute MD5 hash of a file
   */
  private static async computeMD5(filePath: string): Promise<string> {
    const content = await fs.readFile(filePath)
    return crypto.createHash('md5').update(content).digest('hex')
  }

  /**
   * Format wasted space in human-readable format
   */
  static formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }
}

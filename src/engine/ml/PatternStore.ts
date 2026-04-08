/**
 * Pattern Store
 * Persists and retrieves analyzed patterns from localStorage
 */

import type { ProjectPatterns, PatternStore as PatternStoreType } from './types'
import { safeStorage } from '@/utils/storage'

export class PatternStore {
  private static readonly STORE_KEY = 'jpe-pattern-analysis'
  private static readonly CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

  /**
   * Save analyzed patterns to localStorage
   */
  static savePatterns(patterns: ProjectPatterns, projectName: string = 'default'): void {
    try {
      const store: PatternStoreType = {
        projectPatterns: patterns,
        optimizations: [],
        cacheKey: projectName,
        timestamp: Date.now(),
      }

      const key = this.getStorageKey(projectName)
      safeStorage.setItem(key, JSON.stringify(store))

      console.debug(`[PatternStore] Patterns saved for project: ${projectName}`)
    } catch (error) {
      console.error('[PatternStore] Failed to save patterns:', error)
    }
  }

  /**
   * Load patterns from localStorage
   */
  static loadPatterns(projectName: string = 'default'): ProjectPatterns | null {
    try {
      const key = this.getStorageKey(projectName)
      const data = safeStorage.getItem(key)

      if (!data) {
        console.debug(`[PatternStore] No patterns found for project: ${projectName}`)
        return null
      }

      const store: PatternStoreType = JSON.parse(data)

      // Check if cache is expired
      if (Date.now() - store.timestamp > this.CACHE_TTL) {
        console.debug(`[PatternStore] Patterns expired for project: ${projectName}`)
        this.clearPatterns(projectName)
        return null
      }

      console.debug(`[PatternStore] Patterns loaded for project: ${projectName}`)
      return store.projectPatterns
    } catch (error) {
      console.error('[PatternStore] Failed to load patterns:', error)
      return null
    }
  }

  /**
   * Check if patterns exist and are valid for a project
   */
  static hasValidPatterns(projectName: string = 'default'): boolean {
    try {
      const key = this.getStorageKey(projectName)
      const data = safeStorage.getItem(key)

      if (!data) return false

      const store: PatternStoreType = JSON.parse(data)

      // Check if cache is expired
      if (Date.now() - store.timestamp > this.CACHE_TTL) {
        this.clearPatterns(projectName)
        return false
      }

      return store.projectPatterns !== null && store.projectPatterns.tuningPatterns.length > 0
    } catch {
      return false
    }
  }

  /**
   * Clear patterns for a specific project
   */
  static clearPatterns(projectName: string = 'default'): void {
    try {
      const key = this.getStorageKey(projectName)
      safeStorage.removeItem(key)

      console.debug(`[PatternStore] Patterns cleared for project: ${projectName}`)
    } catch (error) {
      console.error('[PatternStore] Failed to clear patterns:', error)
    }
  }

  /**
   * Clear all cached patterns
   */
  static clearAll(): void {
    try {
      const keys: string[] = []

      for (let i = 0; i < safeStorage.length; i++) {
        const key = safeStorage.key(i)
        if (key && key.startsWith(this.STORE_KEY)) {
          keys.push(key)
        }
      }

      keys.forEach((key) => {
        safeStorage.removeItem(key)
      })

      console.debug(`[PatternStore] All patterns cleared (${keys.length} entries)`)
    } catch (error) {
      console.error('[PatternStore] Failed to clear all patterns:', error)
    }
  }

  /**
   * Get storage statistics
   */
  static getStats() {
    try {
      let totalSize = 0
      let projectCount = 0

      for (let i = 0; i < safeStorage.length; i++) {
        const key = safeStorage.key(i)
        if (key && key.startsWith(this.STORE_KEY)) {
          const data = safeStorage.getItem(key)
          if (data) {
            totalSize += data.length
            projectCount++
          }
        }
      }

      return {
        projectCount,
        totalSize: Math.round(totalSize / 1024), // Convert to KB
        maxSize: 5 * 1024, // Typical localStorage limit in KB
      }
    } catch (error) {
      console.error('[PatternStore] Failed to get stats:', error)
      return { projectCount: 0, totalSize: 0, maxSize: 5120 }
    }
  }

  /**
   * Export all patterns as JSON
   */
  static exportAll(): Record<string, ProjectPatterns> {
    const result: Record<string, ProjectPatterns> = {}

    try {
      for (let i = 0; i < safeStorage.length; i++) {
        const key = safeStorage.key(i)
        if (key && key.startsWith(this.STORE_KEY)) {
          const data = safeStorage.getItem(key)
          if (data) {
            const store: PatternStoreType = JSON.parse(data)
            const projectName = key.replace(this.STORE_KEY + '_', '')
            if (store.projectPatterns) {
              result[projectName] = store.projectPatterns
            }
          }
        }
      }
    } catch (error) {
      console.error('[PatternStore] Failed to export patterns:', error)
    }

    return result
  }

  /**
   * Import patterns from JSON
   */
  static importPatterns(data: Record<string, ProjectPatterns>): void {
    try {
      Object.entries(data).forEach(([projectName, patterns]) => {
        this.savePatterns(patterns, projectName)
      })

      console.debug(`[PatternStore] Imported ${Object.keys(data).length} project patterns`)
    } catch (error) {
      console.error('[PatternStore] Failed to import patterns:', error)
    }
  }

  /**
   * Generate storage key for a project
   */
  private static getStorageKey(projectName: string): string {
    return `${this.STORE_KEY}_${projectName}`
  }
}

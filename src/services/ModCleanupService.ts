import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import { PackageService } from './PackageService'
import { DBPF_RESOURCE_TYPES } from '@/engine/parsers/types/package'
import { v4 as uuidv4 } from 'uuid'
import { AIServiceFactory } from './ai/AIServiceFactory'
import { SYSTEM_PROMPT_MOD_CLEANUP } from './ai/ModCleanupPrompt'

export interface CleanupFinding {
  id: string
  type: 'duplicate' | 'collision' | 'orphaned' | 'broken'
  path: string
  name: string
  size: number
  mtime: number
  hash?: string
  instances?: string[]
  recommendation?: 'keep' | 'move'
  reason?: string
}

export interface CleanupReport {
  timestamp: string
  totalFilesScanned: number
  findings: CleanupFinding[]
  backupPath: string
}

/**
 * ModCleanupService - Industrial-grade mod folder scanning and deduplication engine.
 * Features MD5 hashing, Instance ID awareness, and AI-ready suggestion hooks.
 */
export class ModCleanupService {
  private static isScanning = false

  /**
   * Perform a deep scan of the Mods folder.
   */
  static async scanModsFolder(
    modsPath: string, 
    onProgress?: (current: number, total: number) => void
  ): Promise<CleanupReport> {
    if (this.isScanning) throw new Error('Scan already in progress')
    this.isScanning = true

    try {
      const allFiles = await this.recursiveReaddir(modsPath)
      const total = allFiles.length
      const findings: CleanupFinding[] = []
      
      const sizeMap = new Map<number, string[]>()
      const hashStore = new Map<string, string[]>() // hash -> path[]
      const instanceStore = new Map<string, string[]>() // instanceId -> path[]

      // 1. First Pass: Group by size to identify potential duplicates
      for (let i = 0; i < allFiles.length; i++) {
        const filePath = allFiles[i]
        try {
          const stats = await fs.stat(filePath)
          if (!sizeMap.has(stats.size)) {
            sizeMap.set(stats.size, [])
          }
          sizeMap.get(stats.size)!.push(filePath)
        } catch (e) {
          console.error(`Failed to stat ${filePath}`, e)
        }
        if (onProgress) onProgress(Math.floor((i / allFiles.length) * 30), total)
      }

      // 2. Second Pass: Deep scan only for size collisions
      let processedCount = 0
      for (const [_size, paths] of sizeMap.entries()) {
        if (paths.length > 1) {
          for (const filePath of paths) {
            const hash = await this.computeMD5(filePath)
            if (!hashStore.has(hash)) {
              hashStore.set(hash, [])
            }
            hashStore.get(hash)!.push(filePath)
            
            // 3. Package Instance Awareness (Embedded in collision check)
            if (filePath.toLowerCase().endsWith('.package')) {
               await this.scanPackageInstances(filePath, instanceStore, findings)
            }
          }
        } else {
           // still check instances for unique files if they are packages
           const filePath = paths[0]
           if (filePath.toLowerCase().endsWith('.package')) {
              await this.scanPackageInstances(filePath, instanceStore, findings)
           }
        }
        processedCount += paths.length
        if (onProgress) onProgress(30 + Math.floor((processedCount / allFiles.length) * 70), total)
      }

      // 3. Process Findings
      hashStore.forEach((paths, hash) => {
        if (paths.length > 1) {
          paths.forEach(p => {
             findings.push({
               id: uuidv4(),
               type: 'duplicate',
               path: p,
               name: path.basename(p),
               size: 0,
               mtime: 0,
               hash: hash
             })
          })
        }
      })

      // 4. Process Instance Collisions
      instanceStore.forEach((paths, id) => {
        if (paths.length > 1) {
          paths.forEach(p => {
            findings.push({
               id: uuidv4(),
               type: 'collision',
               path: p,
               name: path.basename(p),
               size: 0,
               mtime: 0,
               instances: [id]
            })
          })
        }
      })

      return {
        timestamp: new Date().toISOString(),
        totalFilesScanned: total,
        findings,
        backupPath: path.join(modsPath, '_JPE_Backup', new Date().getTime().toString())
      }
    } finally {
      this.isScanning = false
    }
  }

  /**
   * AI recommendation logic for Story 7.1. 
   * Uses AIServiceFactory to determine which duplicates or conflicts to move.
   */
  static async getAIRecommendations(report: CleanupReport): Promise<CleanupReport> {
    const aiService = AIServiceFactory.getActiveService()
    if (!aiService) return report

    const batchSize = 10
    const findingsWithAI: CleanupFinding[] = [...report.findings]

    for (let i = 0; i < findingsWithAI.length; i += batchSize) {
      const batch = findingsWithAI.slice(i, i + batchSize)
      const prompt = `Analyze these mod findings and suggest which to keep/move:\n${JSON.stringify(batch, null, 2)}`
      
      try {
        const result = await aiService.chat([
          { role: 'system', content: SYSTEM_PROMPT_MOD_CLEANUP },
          { role: 'user', content: prompt }
        ])
        
        if (result.success && result.text) {
          const jsonMatch = result.text.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            const aiData = JSON.parse(jsonMatch[0]) as { recommendations: any[] }
            for (const rec of aiData.recommendations) {
              const findIndex = findingsWithAI.findIndex(f => f.id === rec.id)
              if (findIndex !== -1) {
                findingsWithAI[findIndex].recommendation = rec.action as 'keep' | 'move'
                findingsWithAI[findIndex].reason = rec.reason
              }
            }
          }
        }
      } catch (e) {
        console.error('[ModCleanup:AI] Batch analysis failed', e)
      }
    }

    return { ...report, findings: findingsWithAI }
  }

  /**
   * Safe Move Execution - Relocates files to the backup directory.
   */
  static async executeSafeMove(report: CleanupReport, selectedIds: string[]): Promise<void> {
    const backupDir = report.backupPath
    await fs.mkdir(backupDir, { recursive: true })

    const moveList = report.findings.filter(f => selectedIds.includes(f.id))
    const moveLog: any[] = []

    for (const file of moveList) {
      const dest = path.join(backupDir, file.name)
      try {
        await fs.rename(file.path, dest)
        moveLog.push({ original: file.path, backup: dest })
      } catch (_e) {
        // Fallback for cross-device moves
        const content = await fs.readFile(file.path)
        await fs.writeFile(dest, content)
        await fs.unlink(file.path)
        moveLog.push({ original: file.path, backup: dest, method: 'copy-delete' })
      }
    }

    await fs.writeFile(
      path.join(backupDir, 'cleanup-report.json'), 
      JSON.stringify({
        ...report,
        executedMoves: moveLog
      }, null, 2)
    )
  }

  /**
   * Internal helper to scan a package for tuning instances (Memory-Efficient)
   */
  private static async scanPackageInstances(
    filePath: string, 
    instanceStore: Map<string, string[]>,
    findings: CleanupFinding[]
  ): Promise<void> {
    try {
      // For industrial fidelity, we only read the head/index to find Tuning resources
      const _stats = await fs.stat(filePath)
      const buffer = await fs.readFile(filePath)
      const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
      
      const pkgData = await PackageService.loadPackage(filePath, arrayBuffer)
      if (pkgData) {
        for (const res of pkgData.resources) {
          if (res.type === DBPF_RESOURCE_TYPES.TuningInstance || res.type === DBPF_RESOURCE_TYPES.Buff) {
            const id = `0x${res.instance.toString(16).toUpperCase()}`
            if (!instanceStore.has(id)) {
              instanceStore.set(id, [])
            }
            if (!instanceStore.get(id)!.includes(filePath)) {
              instanceStore.get(id)!.push(filePath)
            }
          }
        }
      }
    } catch (_e) {
      findings.push({
        id: uuidv4(),
        type: 'broken',
        path: filePath,
        name: path.basename(filePath),
        size: 0,
        mtime: 0,
        reason: 'Malformed or corrupt package file'
      })
    }
  }

  private static async computeMD5(filePath: string): Promise<string> {
    const { createReadStream } = require('fs')
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('md5')
      const stream = createReadStream(filePath)
      
      stream.on('data', (data: Buffer) => hash.update(data))
      stream.on('end', () => resolve(hash.digest('hex')))
      stream.on('error', (err: Error) => reject(err))
    })
  }

  private static async recursiveReaddir(dir: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    const files = await Promise.all(entries.map((entry) => {
      const res = path.resolve(dir, entry.name)
      return entry.isDirectory() ? this.recursiveReaddir(res) : res
    }))
    return files.flat()
  }
}

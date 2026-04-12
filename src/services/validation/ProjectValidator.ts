import * as fs from 'fs'
import * as path from 'path'
import { RoundTripValidator, ValidationResult } from '../translation/round-trip-validator'

export interface BatchValidationResult {
  totalFiles: number
  successCount: number
  failureCount: number
  results: {
    filePath: string
    result: ValidationResult
  }[]
}

export class ProjectValidator {
  /**
   * Scans a directory for .xml files and validates their round-trip fidelity.
   * Uses parallel processing to maximize performance for industrial mod projects.
   */
  async validateProject(rootPath: string): Promise<BatchValidationResult> {
    if (!fs.existsSync(rootPath)) {
      throw new Error(`Path not found: ${rootPath}`)
    }
    const files = this.scanDir(rootPath)
    
    // Industrial Throttling: Process files in controlled chunks to prevent EMFILE/Memory exhaustion
    const CONCURRENCY_LIMIT = 10
    const results: { filePath: string; result: any }[] = []
    
    for (let i = 0; i < files.length; i += CONCURRENCY_LIMIT) {
      const chunk = files.slice(i, i + CONCURRENCY_LIMIT)
      const chunkResults = await Promise.all(
        chunk.map(async (file) => {
          const result = await RoundTripValidator.validateFile(file)
          return { filePath: file, result }
        })
      )
      results.push(...chunkResults)
    }

    // Single-pass reduction for peak efficiency
    return results.reduce((acc, curr) => {
      acc.results.push(curr)
      if (curr.result.success) {
        acc.successCount++
      } else {
        acc.failureCount++
      }
      return acc
    }, {
      totalFiles: files.length,
      successCount: 0,
      failureCount: 0,
      results: [] as { filePath: string; result: any }[]
    })
  }

  /**
   * Recursively scans for .xml files.
   */
  private scanDir(dir: string): string[] {
    let results: string[] = []
    const list = fs.readdirSync(dir)

    for (const file of list) {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)

      if (stat && stat.isDirectory()) {
        results = results.concat(this.scanDir(filePath))
      } else if (file.endsWith('.xml')) {
        results.push(filePath)
      }
    }

    return results
  }
}

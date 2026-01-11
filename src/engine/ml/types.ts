/**
 * ML Engine Types
 * Type definitions for pattern analysis and machine learning
 */

export interface TuningPattern {
  id: string
  tuningId: string
  frequency: number // How many times it appears
  confidence: number // 0-1 confidence score
  files: string[] // Which files contain this pattern
}

export interface EnumPattern {
  id: string
  value: string
  type: 'UPPERCASE_SNAKE' | 'PascalCase' | 'camelCase' | 'CONSTANT'
  frequency: number
  confidence: number
  examples: string[]
}

export interface StructuralPattern {
  id: string
  tagSequence: string[] // e.g., ['root', 'tuning', 'class']
  frequency: number
  confidence: number
  description: string
}

export interface NamingPattern {
  id: string
  prefix?: string
  suffix?: string
  pattern: string // Regex pattern for matching
  frequency: number
  confidence: number
  examples: string[]
}

export interface ProjectPatterns {
  tuningPatterns: TuningPattern[]
  enumPatterns: EnumPattern[]
  structuralPatterns: StructuralPattern[]
  namingPatterns: NamingPattern[]
  analysisTime: number // Time taken to analyze in ms
  filesAnalyzed: number
  timestamp: number
}

export interface Optimization {
  id: string
  type: 'redundancy' | 'naming' | 'unused' | 'duplicate'
  severity: 'low' | 'medium' | 'high'
  message: string
  suggestion: string
  impact: string
  files: string[]
}

export interface ModFile {
  name: string
  path: string
  content: string
  size: number
  lastModified: number
}

export interface PatternAnalysisResult {
  success: boolean
  patterns?: ProjectPatterns
  optimizations?: Optimization[]
  error?: string
  duration: number
  timestamp: number
}

export interface PatternStore {
  projectPatterns: ProjectPatterns | null
  optimizations: Optimization[]
  cacheKey: string
  timestamp: number
}

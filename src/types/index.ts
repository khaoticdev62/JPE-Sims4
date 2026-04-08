export type FileType = 'xml' | 'stbl' | 'ts4script' | 'package' | 'json' | 'cfg' | 'py' | 'jpe' | 'image' | 'binary'

export interface ModFile {
  id: string
  projectId: string
  name: string
  path: string
  type: FileType
  content: string
  jpe?: string
  isDirty: boolean
  compiledAt?: number
  size: number
  lastModified: number
}

export interface Project {
  id: string
  name: string
  rootPath: string
  files: ModFile[]
  metadata: {
    createdAt: number
    updatedAt: number
    version: string
    author?: string
    description?: string
  }
}

export interface Diagnostic {
  id: string
  fileId: string
  line: number
  column: number
  severity: 'error' | 'warning' | 'info' | 'hint'
  message: string
  code: string
  source?: 'ai' | 'community' | 'syntax'
  suggestion?: string
  endLine?: number
  endColumn?: number
  documentationLink?: string
}

export interface EditorTab {
  id: string
  fileId: string
  name: string
  isDirty: boolean
}

export interface ValidationResult {
  valid: boolean
  diagnostics: Diagnostic[]
  warnings: string[]
}

export interface JpeSymbol {
  id: string
  name: string
  sourcePackage: string
  type: 'tuning' | 'stbl' | 'interaction'
  metadata?: any
}

export interface MonacoCompletionItem {
  label: string
  kind: number
  detail: string
  insertText: string
  documentation?: string
}

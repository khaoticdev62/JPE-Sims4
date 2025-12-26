export type FileType = 'xml' | 'stbl' | 'ts4script' | 'package' | 'json' | 'cfg' | 'py'

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

export interface Diagnostic {
  id: string
  fileId: string
  line: number
  column: number
  severity: 'error' | 'warning' | 'info'
  message: string
  code: string
  suggestion?: string
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

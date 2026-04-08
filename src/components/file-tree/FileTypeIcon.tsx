import {
  FileCode,
  Languages,
  Code2,
  Package,
  FileText,
  FileJson,
  Settings,
  File,
} from 'lucide-react'
import type { FileType } from '@/types/index'

/** Color mapping for file type groups */
const FILE_TYPE_COLORS: Record<string, string> = {
  xml: 'text-blue-400',
  jpe: 'text-indigo-400',
  stbl: 'text-emerald-400',
  ts4script: 'text-purple-400',
  py: 'text-purple-400',
  package: 'text-orange-400',
  json: 'text-amber-400',
  cfg: 'text-slate-400',
}

/** Default color for unknown types */
const DEFAULT_COLOR = 'text-slate-400'

/**
 * Map file type to its corresponding Lucide icon component
 */
function getFileTypeIcon(type: FileType | string): React.ComponentType<{ className?: string; size?: number }> {
  switch (type) {
    case 'xml':
      return FileCode
    case 'stbl':
      return Languages
    case 'ts4script':
    case 'py':
      return Code2
    case 'package':
      return Package
    case 'jpe':
      return FileText
    case 'json':
      return FileJson
    case 'cfg':
      return Settings
    default:
      return File
  }
}

/**
 * Get the color class for a file type
 */
function getFileTypeColor(type: FileType | string): string {
  return FILE_TYPE_COLORS[type] ?? DEFAULT_COLOR
}

interface FileTypeIconProps {
  /** The file type (extension or FileType enum) */
  type: FileType | string
  /** Size in pixels (default: 16) */
  size?: number
  /** Custom class name override (replaces color class) */
  className?: string
}

/**
 * FileTypeIcon — renders the appropriate icon for a given file type.
 * Uses lucide-react icons with color coding by type group.
 */
export function FileTypeIcon({ type, size = 16, className }: FileTypeIconProps) {
  const Icon = getFileTypeIcon(type)
  const colorClass = className ?? getFileTypeColor(type)

  return <Icon className={colorClass} size={size} />
}

export default FileTypeIcon

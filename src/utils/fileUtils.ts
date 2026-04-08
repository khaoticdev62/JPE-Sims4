/**
 * File Utilities
 * 
 * Provides secure path handling and normalization for both
 * Node.js (Electron) and Web environments.
 */

/**
 * Normalizes a path by resolving ".." and "." segments.
 * Works without requiring the Node.js 'path' module.
 */
export function normalizePath(path: string): string {
  // Convert backslashes to forward slashes
  const p = path.replace(/\\/g, '/')
  const parts = p.split('/')
  const stack: string[] = []

  for (const part of parts) {
    if (part === '.' || part === '') continue
    if (part === '..') {
      if (stack.length > 0) stack.pop()
    } else {
      stack.push(part)
    }
  }

  // Preserve leading slash if originally present (absolute path in Posix)
  const prefix = p.startsWith('/') ? '/' : ''
  return prefix + stack.join('/')
}

/**
 * Sanitizes a path to ensure it remains within a specified root directory.
 * Prevents directory traversal attacks (ZipSlip, malicious project metadata).
 * 
 * @param root The intended base directory (absolute path)
 * @param relativePath The path to sanitize (relative or absolute)
 * @returns The absolute sanitized path within the root
 * @throws Error if the path attempts to escape the root
 */
export function sanitizePath(root: string, relativePath: string): string {
  const normalizedRoot = normalizePath(root)
  const normalizedPath = normalizePath(relativePath)

  // If the relative path is already absolute, check if it starts with root
  if (normalizedPath.startsWith(normalizedRoot)) {
    return normalizedPath
  }

  // Otherwise, treat it as relative to the root
  const fullPath = normalizePath(`${normalizedRoot}/${normalizedPath}`)

  if (!fullPath.startsWith(normalizedRoot)) {
    throw new Error(`Security Violation: Path traversal attempt detected to "${relativePath}"`)
  }

  return fullPath
}

/**
 * Checks if a filename is valid and safe (no special characters except . _ -)
 */
export function isSafeFileName(name: string): boolean {
  return /^[a-zA-Z0-9._-]+$/.test(name)
}

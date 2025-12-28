/**
 * Format a Unix timestamp to human-readable relative time
 * Examples: "2m ago", "1h ago", "3d ago", "12/27/2025"
 */
export function formatTimeAgo(timestamp: number): string {
  const now = Date.now()
  const diffMs = now - timestamp
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  // Less than a minute
  if (diffSec < 60) {
    return diffSec === 0 ? 'just now' : `${diffSec}s ago`
  }

  // Less than an hour
  if (diffMin < 60) {
    return `${diffMin}m ago`
  }

  // Less than a day
  if (diffHour < 24) {
    return `${diffHour}h ago`
  }

  // Less than a week
  if (diffDay < 7) {
    return `${diffDay}d ago`
  }

  // Format as date
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Format a Unix timestamp to short date format
 * Example: "Dec 27, 2025"
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Format a Unix timestamp to time format
 * Example: "3:45 PM"
 */
export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Format a Unix timestamp to full date and time
 * Example: "Dec 27, 2025 3:45 PM"
 */
export function formatDateTime(timestamp: number): string {
  return `${formatDate(timestamp)} ${formatTime(timestamp)}`
}

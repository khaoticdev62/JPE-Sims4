/**
 * API Service Types
 * Defines types for HTTP client and credential management
 */

export interface ApiRequestConfig {
  timeout?: number
  retries?: number
  retryDelay?: (retryCount: number) => number
}

export interface ApiResponse<T> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
}

export interface ApiError {
  message: string
  status?: number
  statusText?: string
  code?: string
  originalError?: Error
}

export interface CredentialConfig {
  service: string
  account: string
}

export interface HttpClientConfig {
  baseURL?: string
  timeout?: number
  headers?: Record<string, string>
}

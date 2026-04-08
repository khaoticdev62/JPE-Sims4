/**
 * HTTP Client
 * Axios-based HTTP client with automatic retry logic and error handling
 */

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios'
import axiosRetry from 'axios-retry'
import type { ApiResponse, ApiError, HttpClientConfig } from './types'

export class HttpClient {
  private client: AxiosInstance
  private config: HttpClientConfig

  constructor(config: HttpClientConfig = {}) {
    this.config = {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      ...config,
    }

    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: this.config.headers,
    })

    // Configure automatic retry logic
    axiosRetry(this.client, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        // Retry on network errors and 5xx responses
        return (
          axiosRetry.isNetworkOrIdempotentRequestError(error) ||
          (error.response?.status ?? 0) >= 500
        )
      },
    })

    // Add response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        console.debug(`[HTTP] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`)
        return response
      },
      (error) => {
        console.error(
          `[HTTP Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
          error.message
        )
        return Promise.reject(error)
      }
    )
  }

  /**
   * Perform a GET request
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<T>(url, config)
      return this.formatResponse(response)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Perform a POST request
   */
  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<T>(url, data, config)
      return this.formatResponse(response)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Perform a PUT request
   */
  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<T>(url, data, config)
      return this.formatResponse(response)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Perform a PATCH request
   */
  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch<T>(url, data, config)
      return this.formatResponse(response)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Perform a DELETE request
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<T>(url, config)
      return this.formatResponse(response)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Set authorization header
   */
  setAuthToken(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  /**
   * Remove authorization header
   */
  removeAuthToken(): void {
    delete this.client.defaults.headers.common['Authorization']
  }

  /**
   * Format Axios response to ApiResponse
   */
  private formatResponse<T>(response: AxiosResponse<T>): ApiResponse<T> {
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers as Record<string, string>,
    }
  }

  /**
   * Handle and format errors
   */
  private handleError(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
      return {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        code: error.code,
        originalError: error,
      }
    }

    if (error instanceof Error) {
      return {
        message: error.message,
        originalError: error,
      }
    }

    return {
      message: 'An unknown error occurred',
    }
  }
}

// Export singleton instance
let instance: HttpClient | null = null

export function getHttpClient(config?: HttpClientConfig): HttpClient {
  if (!instance) {
    instance = new HttpClient(config)
  }
  return instance
}

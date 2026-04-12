"use client";
/**
 * jpe-error-handling.tsx
 * Centralized error handling utilities for async operations, API calls, and file operations
 */

import { toast } from "sonner";
import { AlertTriangle, Wifi, Clock } from "lucide-react";
import { _T } from "./robust/jpe-theme";

/* ═══════════════════════════════════════════════════════════════
   ERROR TYPES
   ═══════════════════════════════════════════════════════════════ */

export class JpeError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = "JpeError";
  }
}

export class NetworkError extends JpeError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, "NETWORK_ERROR", context);
    this.name = "NetworkError";
  }
}

export class ValidationError extends JpeError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, "VALIDATION_ERROR", context);
    this.name = "ValidationError";
  }
}

export class FileOperationError extends JpeError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, "FILE_ERROR", context);
    this.name = "FileOperationError";
  }
}

export class TimeoutError extends JpeError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, "TIMEOUT_ERROR", context);
    this.name = "TimeoutError";
  }
}

/* ═══════════════════════════════════════════════════════════════
   ASYNC OPERATION WRAPPER
   ═══════════════════════════════════════════════════════════════ */

export interface AsyncOperationOptions {
  /** Show loading toast */
  showLoadingToast?: boolean;
  /** Loading message */
  loadingMessage?: string;
  /** Success message (null to disable) */
  successMessage?: string | null;
  /** Error message prefix */
  errorPrefix?: string;
  /** Timeout in milliseconds */
  timeout?: number;
  /** Retry attempts */
  retries?: number;
  /** Retry delay in milliseconds */
  retryDelay?: number;
  /** Silent mode (no toasts) */
  silent?: boolean;
  /** Custom error handler */
  onError?: (error: Error) => void;
}

export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  options: AsyncOperationOptions = {}
): Promise<T | null> {
  const {
    showLoadingToast = false,
    loadingMessage = "Processing...",
    successMessage = "Success",
    errorPrefix = "Operation failed",
    timeout = 30000,
    retries = 0,
    retryDelay = 1000,
    silent = false,
    onError,
  } = options;

  let toastId: string | number | undefined;

  if (showLoadingToast && !silent) {
    toastId = toast.loading(loadingMessage);
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Wrap in timeout
      const result = await Promise.race([
        operation(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new TimeoutError(`Operation timed out after ${timeout}ms`)), timeout)
        ),
      ]);

      // Success
      if (toastId) {
        toast.dismiss(toastId);
      }
      if (successMessage && !silent) {
        toast.success(successMessage);
      }

      return result;
    } catch (_error) {
      lastError = _error instanceof Error ? _error : new Error(String(_error));

      // If retries remaining, wait and retry
      if (attempt < retries) {
        console.warn(`[ErrorHandling] Retry ${attempt + 1}/${retries} after ${retryDelay}ms`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }

      // All retries exhausted
      break;
    }
  }

  // Handle final error
  if (toastId) {
    toast.dismiss(toastId);
  }

  if (!silent && lastError) {
    const errorMessage = getErrorMessage(lastError);
    toast.error(`${errorPrefix}: ${errorMessage}`, {
      icon: getErrorIcon(lastError),
      description: getErrorDescription(lastError),
    });
  }

  if (onError && lastError) {
    onError(lastError);
  }

  // Log to console
  console.error(`[ErrorHandling] ${errorPrefix}:`, lastError);

  return null;
}

/* ═══════════════════════════════════════════════════════════════
   ERROR MESSAGE EXTRACTION
   ═══════════════════════════════════════════════════════════════ */

function getErrorMessage(error: Error): string {
  if (error instanceof NetworkError) return "Network connection failed";
  if (error instanceof TimeoutError) return "Request timed out";
  if (error instanceof ValidationError) return "Validation failed";
  if (error instanceof FileOperationError) return "File operation failed";
  return error.message || "Unknown error";
}

function getErrorDescription(error: Error): string | undefined {
  if (error instanceof NetworkError) return "Check your internet connection and try again.";
  if (error instanceof TimeoutError) return "The operation took too long. Try again or check your connection.";
  if (error instanceof ValidationError) return "Please check your input and try again.";
  if (error instanceof FileOperationError && error.context?.filename) {
    return `File: ${error.context.filename}`;
  }
  return undefined;
}

function getErrorIcon(error: Error) {
  if (error instanceof NetworkError) return <Wifi size={16} color={T.rose} />;
  if (error instanceof TimeoutError) return <Clock size={16} color={T.amber} />;
  if (error instanceof ValidationError) return <AlertTriangle size={16} color={T.amber} />;
  return <XCircle size={16} color={T.rose} />;
}

/* ═══════════════════════════════════════════════════════════════
   SPECIFIC OPERATION HELPERS
   ═══════════════════════════════════════════════════════════════ */

export async function handleFileOperation<T>(
  operation: () => Promise<T>,
  filename?: string,
  options?: Partial<AsyncOperationOptions>
): Promise<T | null> {
  return withErrorHandling(operation, {
    errorPrefix: "File operation failed",
    successMessage: options?.successMessage ?? null,
    onError: (error) => {
      throw new FileOperationError(error.message, { filename });
    },
    ...options,
  });
}

export async function handleApiCall<T>(
  operation: () => Promise<T>,
  endpoint?: string,
  options?: Partial<AsyncOperationOptions>
): Promise<T | null> {
  return withErrorHandling(operation, {
    errorPrefix: "API call failed",
    timeout: 10000,
    retries: 2,
    retryDelay: 500,
    onError: (_error) => {
      if (!navigator.onLine) {
        throw new NetworkError("No internet connection", { endpoint });
      }
    },
    ...options,
  });
}

export async function handleBuildOperation<T>(
  operation: () => Promise<T>,
  options?: Partial<AsyncOperationOptions>
): Promise<T | null> {
  return withErrorHandling(operation, {
    showLoadingToast: true,
    loadingMessage: "Building...",
    successMessage: "Build completed successfully",
    errorPrefix: "Build failed",
    timeout: 60000, // 1 minute
    ...options,
  });
}

export async function handleTranslation<T>(
  operation: () => Promise<T>,
  options?: Partial<AsyncOperationOptions>
): Promise<T | null> {
  return withErrorHandling(operation, {
    showLoadingToast: true,
    loadingMessage: "Translating...",
    successMessage: "Translation completed",
    errorPrefix: "Translation failed",
    timeout: 30000,
    ...options,
  });
}

/* ═══════════════════════════════════════════════════════════════
   VALIDATION HELPERS
   ═══════════════════════════════════════════════════════════════ */

export function validateNotEmpty(value: string, fieldName: string): void {
  if (!value || value.trim().length === 0) {
    throw new ValidationError(`${fieldName} cannot be empty`);
  }
}

export function validateFileExtension(filename: string, allowedExtensions: string[]): void {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (!ext || !allowedExtensions.includes(ext)) {
    throw new ValidationError(
      `Invalid file type. Allowed: ${allowedExtensions.join(", ")}`,
      { filename, allowedExtensions }
    );
  }
}

export function validateJSON(jsonString: string): any {
  try {
    return JSON.parse(jsonString);
  } catch {
    throw new ValidationError("Invalid JSON format");
  }
}

export function validateXML(xmlString: string): boolean {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, "text/xml");
    const errors = doc.getElementsByTagName("parsererror");
    if (errors.length > 0) {
      throw new ValidationError("XML parsing error", {
        error: errors[0].textContent,
      });
    }
    return true;
  } catch (_error) {
    if (_error instanceof ValidationError) throw _error;
    throw new ValidationError("Invalid XML format");
  }
}

/* ═══════════════════════════════════════════════════════════════
   SAFE STORAGE OPERATIONS (with error handling)
   ═══════════════════════════════════════════════════════════════ */

export function safeLocalStorageGet<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch (_error) {
    console.error(`[Storage] Failed to read ${key}:`, _error);
    return defaultValue;
  }
}

export function safeLocalStorageSet(key: string, value: any): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (_error) {
    console.error(`[Storage] Failed to write ${key}:`, _error);
    if (_error instanceof Error && _error.name === "QuotaExceededError") {
      toast.error("Storage quota exceeded", {
        description: "Clear old data to free up space.",
      });
    }
    return false;
  }
}

export function safeLocalStorageRemove(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (_error) {
    console.error(`[Storage] Failed to remove ${key}:`, _error);
    return false;
  }
}

/* ═══════════════════════════════════════════════════════════════
   NETWORK STATUS DETECTION
   ═══════════════════════════════════════════════════════════════ */

export function isOnline(): boolean {
  return navigator.onLine;
}

export function onNetworkChange(callback: (online: boolean) => void): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}

/* ═══════════════════════════════════════════════════════════════
   DEBOUNCED ERROR REPORTER (prevent error spam)
   ═══════════════════════════════════════════════════════════════ */

const errorCache = new Map<string, number>();
const ERROR_DEBOUNCE_MS = 5000;

export function reportError(error: Error, context?: Record<string, any>): void {
  const key = `${error.name}:${error.message}`;
  const lastReported = errorCache.get(key) || 0;
  const now = Date.now();

  if (now - lastReported < ERROR_DEBOUNCE_MS) {
    // Skip duplicate error within debounce window
    return;
  }

  errorCache.set(key, now);

  // Log to console
  console.error("[Error Report]", error, context);

  // In production, send to error tracking service
  if (process.env.NODE_ENV === "production") {
    // TODO: Send to Sentry, LogRocket, etc.
    // trackError(error, context);
  }
}

import { afterEach, beforeAll, afterAll, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
} as any

// Suppress console errors during tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})

// Global Electron Mock for Automated Bridge Audits
Object.defineProperty(window, 'electron', {
  value: {
    transform: {
      run: vi.fn().mockImplementation(async () => {
        const start = Date.now()
        // Simulate local engine latency
        await new Promise(r => setTimeout(r, 20))
        return { success: true, xml: '<test></test>', duration: Date.now() - start }
      })
    },
    ai: {
      invoke: vi.fn().mockImplementation(async (provider) => {
        const start = Date.now()
        // Simulate bridge overhead
        await new Promise(r => setTimeout(r, 50))
        return { success: true, data: { text: `Mock response for ${provider}` }, performance: { duration: Date.now() - start } }
      })
    },
    scarlet: {
      fetch: vi.fn().mockImplementation(async () => {
        const start = Date.now()
        await new Promise(r => setTimeout(r, 100))
        return { success: true, mods: [], count: 0, performance: { totalTime: Date.now() - start } }
      })
    },
    ts4rebels: {
      invoke: vi.fn().mockImplementation(async (action) => {
        const start = Date.now()
        await new Promise(r => setTimeout(r, 150))
        return { success: true, data: { action }, performance: { duration: Date.now() - start } }
      })
    }
  },
  writable: true
});

import '@testing-library/jest-dom'

// Mock electron APIs
jest.mock('electron', () => ({
  ipcRenderer: {
    invoke: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
  },
  contextBridge: {
    exposeInMainWorld: jest.fn(),
  },
}))

// Mock window.electron
Object.defineProperty(window, 'electron', {
  value: {
    file: {
      openFolder: jest.fn(),
      openFile: jest.fn(),
      saveFile: jest.fn(),
    },
    on: jest.fn(),
    off: jest.fn(),
  },
})

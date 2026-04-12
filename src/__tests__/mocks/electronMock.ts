/**
 * Electron Mock for Jest
 *
 * Provides a helper to inject window.electron and window.ipc into the JSDOM
 * for testing environment-specific code paths.
 */

// This file is a helper module, not a test suite.
// This placeholder prevents Jest from treating this as a test file.
describe('electronMock module', () => {
  it('is a helper module (no tests)', () => {
    expect(true).toBe(true)
  })
})

export const mockElectron = () => {
  const invokeMock = jest.fn();
  const sendMock = jest.fn();
  const onMock = jest.fn();
  const removeListenerMock = jest.fn();

  const electronAPI = {
    file: {
      openFolder: jest.fn(),
      readFile: jest.fn(),
      writeFile: jest.fn(),
      exists: jest.fn(),
    },
    ts4rebels: {
      invoke: invokeMock,
    },
    window: {
      minimize: jest.fn(),
      maximize: jest.fn(),
      close: jest.fn(),
    },
    ipc: {
      invoke: invokeMock,
      send: sendMock,
      on: onMock,
      removeListener: removeListenerMock,
    },
    // Direct access if needed
    invoke: invokeMock,
    send: sendMock,
    on: onMock,
    off: removeListenerMock,
  };

  // Inject into global window
  (global as any).window = global.window || {};
  (global as any).window.electron = electronAPI;
  (global as any).window.ipc = electronAPI;

  return {
    electron: electronAPI,
    invoke: invokeMock,
    send: sendMock,
    on: onMock,
  };
};

export const clearElectronMock = () => {
  if ((global as any).window) {
    delete (global as any).window.electron;
    delete (global as any).window.ipc;
  }
};

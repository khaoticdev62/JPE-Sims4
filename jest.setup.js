const { webcrypto } = require('node:crypto');
require('fake-indexeddb/auto');
require('@testing-library/jest-dom');

/**
 * Enforce Web Crypto API polyfill for JSDOM
 * Note: Primary polyfills now reside in jest.env.js for earlier initialization
 */
if (!global.crypto) {
  global.crypto = webcrypto;
} else if (!global.crypto.subtle) {
  Object.defineProperty(global.crypto, 'subtle', {
    value: webcrypto.subtle,
    writable: false,
    configurable: true
  });
}

console.log('DEBUG: jest.setup.js loaded and environment-specific polyfills confirmed (Crypto, IDB, ResizeObserver, structuredClone)');

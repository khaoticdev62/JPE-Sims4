const React = require('react');

const { webcrypto } = require('node:crypto');
require('fake-indexeddb/auto');
require('@testing-library/jest-dom');

/**
 * Global mock for lucide-react to avoid ESM import issues.
 * lucide-react ships as ESM-only and breaks Jest's CommonJS transform.
 * We replace every icon with a simple div placeholder component.
 */
jest.mock('lucide-react', () => {
  return new Proxy(
    {},
    {
      get: (_target, prop) => {
        const MockIcon = React.forwardRef((props, ref) => {
          return React.createElement(
            'div',
            {
              ...props,
              ref,
              'data-testid': `icon-${String(prop).toLowerCase()}`,
            },
            props.children
          );
        });
        MockIcon.displayName = `LucideIcon(${String(prop)})`;
        return MockIcon;
      },
    }
  );
});

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

const JSDOMEnvironment = require('jest-environment-jsdom').default;

class CustomEnvironment extends JSDOMEnvironment {
  constructor(config, context) {
    super(config, context);
  }

  async setup() {
    await super.setup();
    
    // Polyfill Web Crypto API
    if (typeof this.global.crypto === 'undefined' || !this.global.crypto.subtle) {
      const { webcrypto } = require('node:crypto');
      this.global.crypto = webcrypto;
    }

    // Polyfill ResizeObserver (common JSDOM failure)
    if (typeof this.global.ResizeObserver === 'undefined') {
      this.global.ResizeObserver = class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
      };
    }
    
    // Ensure TextEncoder/Decoder are available
    if (typeof this.global.TextEncoder === 'undefined') {
      this.global.TextEncoder = require('node:util').TextEncoder;
      this.global.TextDecoder = require('node:util').TextDecoder;
    }

    // Polyfill structuredClone (Node 17+)
    if (typeof this.global.structuredClone === 'undefined') {
      try {
        this.global.structuredClone = require('node:util').structuredClone || global.structuredClone;
      } catch (e) {
        this.global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
      }
    }

    // Global Electron Mock for Automated Bridge Audits
    this.global.window = this.global.window || {};
    Object.defineProperty(this.global.window, 'electron', {
      value: {
        transform: {
          run: async () => {
            const start = Date.now();
            await new Promise(r => setTimeout(r, 20));
            return { success: true, xml: '<test></test>', duration: Date.now() - start };
          }
        },
        ai: {
          invoke: async (provider) => {
            const start = Date.now();
            await new Promise(r => setTimeout(r, 50));
            return { success: true, data: { text: `Mock response for ${provider}`, success: true }, performance: { duration: Date.now() - start } };
          }
        },
        scarlet: {
          fetch: async () => {
            const start = Date.now();
            await new Promise(r => setTimeout(r, 100));
            return { success: true, mods: [], count: 0, performance: { totalTime: Date.now() - start } };
          }
        },
        ts4rebels: {
          invoke: async (action) => {
            const start = Date.now();
            await new Promise(r => setTimeout(r, 150));
            return { success: true, data: { action }, performance: { duration: Date.now() - start } };
          }
        }
      },
      writable: true,
      configurable: true
    });
  }
}

module.exports = CustomEnvironment;

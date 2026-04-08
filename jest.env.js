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
  }
}

module.exports = CustomEnvironment;

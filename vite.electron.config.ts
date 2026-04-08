import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  build: {
    target: 'node20',
    lib: {
      entry: path.resolve(__dirname, 'src/main.ts'),
      name: 'JPEStudio',
      fileName: () => 'main.js',
      formats: ['cjs']
    },
    rollupOptions: {
      external: [
        'electron',
        'path',
        'fs',
        'os',
        'child_process',
        'util',
        'crypto',
        'stream',
        'buffer',
        'events',
        'net',
        'http',
        'https',
        'zlib',
        'module',
        'vm'
      ],
      output: {
        dir: 'dist-electron',
        format: 'cjs',
        entryFileNames: '[name].js'
      }
    },
    outDir: 'dist-electron',
    sourcemap: false,
    minify: false,
    ssr: true
  },
  ssr: {
    external: ['electron']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})

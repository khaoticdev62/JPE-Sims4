# Environment Configuration and Deployment

## Environment Variables

### Required Environment Variables
Create a `.env.local` file in the project root:

```env
# AI Providers (Server-Managed)
ANTHROPIC_API_KEY=your_claude_key
OPENAI_API_KEY=your_openai_key
GOOGLE_API_KEY=your_gemini_key
DASHSCOPE_API_KEY=your_qwen_key
```

### Environment Files
- `.env.example` - Example environment variables template
- `.env.local.example` - Local development example (copy to `.env.local`)
- `.env.local` - **Git ignored**, contains your local secrets

### Environment Variable Usage
- **Server-side only**: API keys are never exposed to client
- **User overrides**: Users can provide their own keys via browser LocalStorage (optional)
- **Hybrid key model**: System keys managed server-side, users can add personal keys for higher rate limits

## Configuration Files

### TypeScript Configuration
- `tsconfig.json` - Main TypeScript config for Next.js
- `tsconfig.node.json` - Node.js TypeScript config
- `tsconfig.electron.json` - Electron-specific TypeScript config
- `next-env.d.ts` - Next.js type declarations

### Next.js Configuration
- `next.config.js` - Next.js app configuration
  - React strict mode enabled
  - Webpack fallbacks configured for Electron compatibility
  - Image optimization disabled for file:// protocol (Electron)

### ESLint Configuration
- `eslint.config.mjs` - ESLint flat config
  - TypeScript ESLint recommended rules
  - React Hooks plugin
  - React plugin
  - Prettier integration
  - Custom rules for test files and service files

### Prettier Configuration
- `.prettierrc.json` - Code formatting rules
  - Single quotes
  - No semicolons
  - ES5 trailing commas
  - 90 character print width
  - 2 space tabs

### Tailwind Configuration
- `tailwind.config.ts` - TailwindCSS configuration
  - Custom cyberpunk theme with CSS variables
  - Dark mode via class
  - Custom animations and transitions
  - shadcn/ui compatibility

### PostCSS Configuration
- `postcss.config.js` - PostCSS plugins for Tailwind

### Jest Configuration
- `jest.config.js` - Jest test configuration
- `jest.setup.js` - Test setup file
- `jest.env.js` - Custom test environment

### Playwright Configuration
- `playwright.config.ts` - E2E test configuration
  - Chromium browser
  - Serial test execution
  - HTML reporting
  - Auto web server startup

### Electron Builder Configuration
- `electron-builder.yml` - Electron packaging configuration
  - Windows: NSIS installer
  - macOS: DMG with hardened runtime
  - Linux: AppImage
  - GitHub releases for distribution

### Python Configuration
- `pyproject.toml` - Python package configuration
  - Package name: jpe-sims4
  - Python version: >=3.11
  - Dependencies and optional dependencies
  - Build system: setuptools

### Git Configuration
- `.gitignore` - Files and directories to ignore
  - node_modules
  - dist, .next, build
  - .env.local
  - test-results
  - Various IDE and OS files

## Build Outputs

### Next.js Build
```bash
npm run build
```
- Output: `.next/` directory
- Optimized production build
- No linting during build (`--no-lint` flag)

### Electron Build
```bash
npm run electron:build
```
- Output: `dist-electron/` directory
- Compiled TypeScript for Electron main process

### Packaging
```bash
# Package for all platforms
npm run electron:package

# Platform-specific
npm run electron:package:win    # Windows NSIS installer
npm run electron:package:mac    # macOS DMG
npm run electron:package:linux  # Linux AppImage
```

### Release Artifacts
- Windows: `JPE Studio-<version>-Setup.exe`
- macOS: `JPE Studio-<version>.dmg`
- Linux: `JPE Studio-<version>.AppImage`

## Deployment

### GitHub Releases
- Automated via electron-builder
- Publish configuration in `electron-builder.yml`
- Provider: GitHub
- Release type: release
- Version tags: v-prefixed

### Development Workflow
1. Start dev server: `npm run dev`
2. Make changes
3. Run tests: `npm test`
4. Run linting: `npm run lint`
5. Build: `npm run build`
6. Commit and push
7. Tag release: `git tag v1.0.0`
8. Package and publish: `npm run electron:publish`

## Docker (Not Currently Configured)
- No Docker configuration files present
- Application designed for desktop distribution, not web hosting

## Monitoring & Analytics
- No analytics configured by default
- Privacy-focused (no user tracking)

## Backup & Recovery
- Git version control for code
- User data stored in local file system (Electron)
- No cloud backup configured yet

## Security Considerations

### API Key Management
- Keys stored in `.env.local` (git ignored)
- Server-side API routes protect keys from client exposure
- User-provided override keys stored in browser LocalStorage
- Never commit `.env.local` to repository

### Electron Security
- Node integration disabled in renderer
- Context isolation enabled
- Preload script for secure IPC
- Content Security Policy headers should be configured

### File System Access
- Electron has full file system access
- Validate file paths to prevent directory traversal
- Sanitize user input for file operations

## Environment-Specific Behavior

### Development
- Hot reloading enabled
- Verbose error messages
- React DevTools available
- Source maps enabled

### Production
- Optimized builds
- Minified code
- No console logs (in production build)
- Error boundaries catch and display user-friendly errors

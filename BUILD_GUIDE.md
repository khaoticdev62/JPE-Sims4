# Build & Deployment Guide

**Project**: JPE Mod Translator 2.0
**Version**: 1.0.0
**Last Updated**: December 26, 2025

---

## Overview

This guide covers building, packaging, and deploying JPE Mod Translator 2.0 as a standalone Electron application for Windows and macOS.

## Technology Stack

- **Build Tool**: Vite
- **Desktop Framework**: Electron 26.2.0
- **Packager**: electron-builder
- **TypeScript**: 5.2.2
- **React**: 18.2.0
- **Target Platforms**: Windows (x64), macOS (Intel & Apple Silicon)

---

## Build Environment Setup

### Prerequisites

```bash
Node.js >= 18.0.0
npm >= 9.0.0
Git >= 2.30.0
```

### Verify Installation

```bash
node --version      # Should be >= 18.0.0
npm --version       # Should be >= 9.0.0
git --version       # Should be >= 2.30.0
```

### Install Dependencies

```bash
npm install
```

This installs:
- Vite (build tool)
- Electron (desktop framework)
- electron-builder (packager)
- React & dependencies
- TypeScript & tooling
- Testing frameworks

---

## Development Build & Run

### Start Development Server

```bash
npm run dev
```

**What this does**:
- Starts Vite dev server on http://localhost:5173
- Watches for file changes
- Rebuilds on modification

### Run Electron in Development

```bash
npm run electron-dev
```

**What this does**:
- Starts Vite dev server (if not running)
- Launches Electron app pointing to dev server
- Opens DevTools for debugging
- Watches for changes and hot-reloads

### Run Only Electron

```bash
npm run electron
```

**Note**: Requires Vite dev server to be running separately

---

## Build for Production

### Full Build Process

```bash
npm run build
```

**What this does**:
1. TypeScript compilation check (`tsc`)
2. Vite production build (`vite build`)
   - Bundles React app to `dist/` directory
   - Minifies and optimizes
3. Electron-builder packaging
   - Compiles Electron main process
   - Packages binaries for configured platforms

**Output**:
- Windows: `dist/JPE Mod Translator-1.0.0.nsis` (installer)
- Windows: `dist/JPE Mod Translator-1.0.0.exe` (portable)
- macOS: `dist/JPE Mod Translator-1.0.0.dmg` (installer)
- macOS: `dist/JPE Mod Translator-1.0.0.zip` (archive)

### Web-Only Build

```bash
npm run build:web
```

**What this does**:
- TypeScript check
- Vite production build
- Creates `dist/` directory with web assets
- Skips Electron packaging

**Use case**: Testing web build without packaging

---

## Build Configuration

### Key Build Files

#### vite.config.ts
Configures:
- React plugin
- Build output directory (`dist/`)
- Path aliases (@components, @stores, etc.)

#### package.json Build Config
```json
{
  "build": {
    "appId": "com.jpemodtranslator.app",
    "productName": "JPE Mod Translator",
    "files": ["dist/**/*", "dist-electron/**/*"],
    "win": {
      "target": ["nsis", "portable"],
      "arch": ["x64"]
    },
    "mac": {
      "target": ["dmg", "zip"]
    }
  }
}
```

Key settings:
- **appId**: Unique identifier for app (used for updates)
- **productName**: Display name shown to users
- **files**: What to include in packaged app
- **win/mac**: Platform-specific targets
- **arch**: CPU architectures (x64 = 64-bit Intel)

#### tsconfig.json
- **target**: ES2020 (modern JavaScript)
- **strict**: true (strict type checking)
- **jsx**: react-jsx (React 17+ JSX)

---

## Electron Configuration

### Main Process (src/main.ts)

Handles:
- Window creation and lifecycle
- IPC communication
- File system access
- Menu and app controls

Key features:
- Development server in dev mode
- Preload script for security
- DevTools in development only
- Proper app lifecycle management

### Preload Script (src/preload.ts)

Provides secure bridge to renderer process:
- File operations (readFile, writeFile)
- Directory operations (listDirectory)
- File existence checking

Security features:
- No node integration
- Context isolation
- Controlled IPC exposure

### Security Settings

```typescript
webPreferences: {
  preload: path.join(__dirname, 'preload.js'),
  nodeIntegration: false,        // Disabled for security
  contextIsolation: true,         // Isolate renderer context
  enableRemoteModule: false,      // Disable remote module
}
```

---

## TypeScript Compilation

### Type Checking

```bash
npm run type-check
```

This runs:
```bash
tsc --noEmit
```

**What it does**:
- Checks all TypeScript files
- Reports type errors
- Doesn't generate output files
- Should pass before building

### Compiler Options

Key settings:
- **strict**: true (full type safety)
- **noUnusedLocals**: Warn on unused variables
- **noUnusedParameters**: Warn on unused parameters
- **noFallthroughCasesInSwitch**: No switch fallthrough
- **isolatedModules**: Treat each file independently

---

## Linting & Formatting

### Run Linter

```bash
npm run lint
```

**What it checks**:
- TypeScript syntax errors
- React best practices
- React hooks rules
- Code style consistency

### Format Code

```bash
npm run format
```

**What it does**:
- Runs Prettier
- Formats all source files
- Consistent code style
- Fixes formatting issues

**Before committing**, run:
```bash
npm run lint   # Check for errors
npm run format # Fix formatting
```

---

## Testing

### Run Tests

```bash
npm test
```

Runs Jest test suite:
- All unit tests
- All integration tests
- Coverage reporting

### Run Tests in Watch Mode

```bash
npm test:watch
```

Automatically reruns tests when files change.

### Generate Coverage Report

```bash
npm test:coverage
```

Creates coverage report in `coverage/` directory.

**Coverage thresholds**:
- Branches: 50%
- Functions: 50%
- Lines: 50%
- Statements: 50%

---

## Build Targets & Artifacts

### Windows Build

**NSIS Installer** (`JPE-Mod-Translator-1.0.0.nsis`)
- User-friendly installer
- Custom installation directory
- Start menu shortcuts
- Desktop shortcut
- Uninstaller

**Portable Executable** (`JPE-Mod-Translator-1.0.0.exe`)
- Single executable
- No installation required
- Works on any Windows machine
- Stores config in app directory

### macOS Build

**DMG Installer** (`JPE-Mod-Translator-1.0.0.dmg`)
- Standard macOS distribution format
- Drag-and-drop installation
- Volume icon

**ZIP Archive** (`JPE-Mod-Translator-1.0.0.zip`)
- Portable archive
- Can be distributed via web

---

## Distribution

### File Hosting

Recommended platforms:
- GitHub Releases (free, reliable)
- SourceForge
- Custom S3 bucket
- Azure Blob Storage

### Version Management

Current version: **1.0.0**

Format: `MAJOR.MINOR.PATCH`
- **MAJOR**: Breaking changes
- **MINOR**: New features, backwards compatible
- **PATCH**: Bug fixes, no new features

Update in:
- `package.json` (version field)
- Release notes
- Changelog

### Auto-Update Setup

electron-builder supports auto-updates via:
- GitHub releases (free)
- AWS S3
- Custom server
- Electron Update Server

Configuration in `electron-builder` config:
```json
"publish": {
  "provider": "github",
  "owner": "your-username",
  "repo": "repo-name"
}
```

---

## CI/CD Pipeline

### Automated Build

GitHub Actions can automatically:
1. Run tests on every push
2. Build binaries for all platforms
3. Create releases on tags
4. Upload to GitHub releases

See: `.github/workflows/build.yml` (to be created)

### Manual Build Steps

For local builds:

1. **Prepare**:
   ```bash
   git pull
   npm install
   ```

2. **Test**:
   ```bash
   npm run lint
   npm test
   npm run type-check
   ```

3. **Build**:
   ```bash
   npm run build
   ```

4. **Verify**:
   - Test installers on target platforms
   - Verify app runs correctly
   - Check file associations
   - Verify shortcuts

5. **Release**:
   - Create git tag
   - Create GitHub release
   - Upload binaries
   - Write release notes

---

## Troubleshooting

### Build Fails with TypeScript Errors

```bash
npm run type-check     # See all type errors
npm run lint           # Check ESLint errors
npm install            # Reinstall dependencies
```

### Electron Dev Mode Shows Blank Window

Ensure:
1. Vite dev server is running (`npm run dev`)
2. Port 5173 is accessible
3. No firewall blocking localhost
4. Try clearing cache: `rm -rf node_modules && npm install`

### Application Won't Start on macOS

May need:
```bash
xattr -rd com.apple.quarantine "/Applications/JPE Mod Translator.app"
```

### Build Too Large

Check:
- Unused dependencies in package.json
- Large assets in assets/ directory
- Debug symbols in production build

Optimize:
```bash
npm run build:web    # See build size
npm prune --production  # Remove dev dependencies
```

### Memory Issues During Build

For large projects:

```bash
NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

---

## Production Checklist

Before releasing:

- [ ] All tests pass (`npm test`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Binaries created successfully
- [ ] Version bumped in package.json
- [ ] Changelog updated
- [ ] Git tag created
- [ ] Release notes written
- [ ] Tested on target platforms (Windows, macOS)
- [ ] Installer/portable works
- [ ] App updates and auto-start work
- [ ] File operations work correctly
- [ ] File associations work (if applicable)
- [ ] Uninstall/removal works cleanly

---

## Platform-Specific Notes

### Windows

**Requirements**:
- Visual C++ Runtime (included in NSIS)
- Administrator may be needed for installation

**File Locations**:
- User data: `%APPDATA%\JPE Mod Translator\`
- Logs: `%APPDATA%\JPE Mod Translator\logs\`

**Signing** (optional):
- Code signing can be added to prevent SmartScreen warnings
- Requires certificate from trusted CA

### macOS

**Requirements**:
- macOS 10.13+
- Notarization (Apple requirement for distribution)

**File Locations**:
- User data: `~/Library/Application Support/JPE Mod Translator/`
- Logs: `~/Library/Logs/JPE Mod Translator/`

**Signing & Notarization**:
- Requires developer certificate
- Notarization needed for distribution outside App Store
- Process takes ~5-10 minutes

---

## Versioning Strategy

### Semantic Versioning

```
1.0.0
│ │ │
│ │ └── Patch (bug fixes, minor changes)
│ └──── Minor (new features, backwards compatible)
└────── Major (breaking changes)
```

### Release Cycle

- **Alpha**: Feature incomplete, bugs expected
- **Beta**: Feature complete, bugs being fixed
- **RC**: Release candidate, minimal changes
- **Release**: Production version

### Version Numbering Examples

- `1.0.0-alpha.1` → First alpha
- `1.0.0-beta.2` → Second beta
- `1.0.0-rc.1` → Release candidate
- `1.0.0` → Official release
- `1.1.0` → New features added
- `1.0.1` → Bug fix only

---

## Maintenance

### Regular Tasks

- **Weekly**: Review and merge pull requests
- **Monthly**: Update dependencies (`npm update`)
- **Quarterly**: Major dependency updates, security audits
- **On demand**: Bug fixes, patch releases

### Security Updates

- Subscribe to npm security advisories
- Run `npm audit` regularly
- Update dependencies promptly
- Security patches released immediately

### Dependency Management

```bash
npm audit              # Check for vulnerabilities
npm update             # Update to latest minor/patch
npm install <pkg>@latest  # Update specific package
npm ls                 # List all dependencies
```

---

## Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [electron-builder](https://www.electron.build/)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## Support

For build issues:
1. Check troubleshooting section above
2. Review GitHub issues
3. Check Electron and electron-builder documentation
4. Review build logs for specific errors

---

**Document Version**: 1.0
**Last Updated**: December 26, 2025
**Next Review**: Upon Phase 10 completion

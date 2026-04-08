# Deployment & Release Guide

**Project**: JPE Mod Translator 2.0
**Version**: 1.0.0
**Last Updated**: December 26, 2025

---

## Overview

This guide covers deploying JPE Mod Translator 2.0 to users via installers, GitHub Releases, and managing updates.

## Deployment Architecture

```
Development (main branch)
        ↓
    Commit/Push
        ↓
GitHub Actions (CI/CD)
    ├─ Run Tests
    ├─ Build Binaries
    └─ Create Release
        ↓
GitHub Releases
        ↓
User Downloads & Auto-Update
```

---

## Release Workflow

### 1. Prepare for Release

#### Update Version

In `package.json`:
```json
{
  "version": "1.0.0"
}
```

Update to new version following semantic versioning.

#### Update Changelog

Create entry in `CHANGELOG.md`:
```markdown
## [1.1.0] - 2025-12-27

### Added
- New feature description
- Another feature

### Fixed
- Bug fix description

### Changed
- Breaking change description

### Security
- Security fix description
```

#### Test Everything

```bash
npm run lint              # Run linter
npm run type-check        # TypeScript check
npm test                  # Run tests
npm run build             # Full build
```

### 2. Create Git Tag

```bash
# Update version first
npm version minor         # or major, patch, prerelease

# This automatically:
# - Updates package.json version
# - Commits with "1.1.0" message
# - Creates git tag "v1.1.0"
```

Or manually:

```bash
git tag -a v1.1.0 -m "Release version 1.1.0: Description of changes"
git push origin v1.1.0
```

### 3. Push to GitHub

```bash
git push
git push --tags
```

### 4. Create GitHub Release

#### Option A: GitHub Web Interface

1. Go to Repository → Releases
2. Click "Draft a new release"
3. Select tag (e.g., "v1.1.0")
4. Fill in release title: "JPE Mod Translator 1.1.0"
5. Write release notes
6. Upload binary files (if not using CI/CD)
7. Click "Publish release"

#### Option B: GitHub CLI

```bash
gh release create v1.1.0 \
  --title "JPE Mod Translator 1.1.0" \
  --notes "Release notes here" \
  dist/*.exe \
  dist/*.dmg
```

#### Option C: Automated (GitHub Actions)

See CI/CD section below.

---

## Continuous Integration & Deployment (CI/CD)

### GitHub Actions Workflow

Create `.github/workflows/release.yml`:

```yaml
name: Build & Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [windows-latest, macos-latest]

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Run type check
        run: npm run type-check

      - name: Run linter
        run: npm run lint

      - name: Build app
        run: npm run build

      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: ${{ matrix.os }}-build
          path: dist/

  release:
    needs: build
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Download all artifacts
        uses: actions/download-artifact@v3

      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            windows-latest-build/**/*.exe
            windows-latest-build/**/*.nsis
            macos-latest-build/**/*.dmg
            macos-latest-build/**/*.zip
          draft: false
          prerelease: ${{ contains(github.ref, 'alpha') || contains(github.ref, 'beta') || contains(github.ref, 'rc') }}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**What this does**:
1. Triggers on git tags (v1.0.0, v1.1.0, etc.)
2. Builds on Windows and macOS runners
3. Runs all tests and checks
4. Creates release and uploads binaries
5. Auto-detects pre-releases (alpha, beta, rc)

### Test Pipeline

```
Commit
  ↓
Tests
  ├─ Unit Tests (350+)
  ├─ Type Check (tsc)
  ├─ Linter (ESLint)
  └─ Build Check
       ↓
      Pass?
       ↓─ Yes → Build Binaries → Release
       └─ No  → Fail & Notify
```

---

## Distribution Channels

### GitHub Releases

**Pros**:
- Free
- Reliable
- Good download speeds
- Auto-update friendly
- Statistics available

**Setup**:
1. Create release with binaries
2. Users download from Releases page
3. Auto-update checks GitHub API

**URL Format**:
```
https://github.com/owner/repo/releases/download/v1.0.0/JPE-Mod-Translator-1.0.0.exe
```

### Website Download

Host on project website:
1. Download binaries from GitHub Releases
2. Upload to web server
3. Link from website
4. Serve with CDN (optional)

**Speed improvement**: CDN can distribute globally

### Auto-Update Server

Can implement custom update server:

```typescript
// In electron main process
autoUpdater.setFeedURL({
  provider: 'github',
  owner: 'username',
  repo: 'repo-name'
})

autoUpdater.checkForUpdatesAndNotify()
```

Or custom server:
```typescript
autoUpdater.setFeedURL({
  provider: 'generic',
  url: 'https://example.com/updates'
})
```

---

## Installation Methods

### Windows

#### NSIS Installer (Recommended)

File: `JPE-Mod-Translator-1.0.0.nsis`

Features:
- User-friendly wizard
- Custom installation directory
- Start Menu shortcuts
- Desktop shortcut
- Auto-uninstall

Installation:
1. Download .nsis file
2. Run installer
3. Follow wizard
4. Launch from Start Menu or Desktop

#### Portable Executable

File: `JPE-Mod-Translator-1.0.0.exe`

Features:
- Single executable
- No installation needed
- Runs anywhere
- Config stored in app directory

Installation:
1. Download .exe file
2. Run directly
3. No installation needed

### macOS

#### DMG Installer

File: `JPE-Mod-Translator-1.0.0.dmg`

Installation:
1. Download .dmg file
2. Double-click to mount
3. Drag app to Applications folder
4. Eject volume
5. Launch from Applications

#### ZIP Archive

File: `JPE-Mod-Translator-1.0.0.zip`

Installation:
1. Download .zip file
2. Double-click to extract
3. Move to Applications folder
4. Launch

---

## User Updates

### Auto-Update Flow

```
App Startup
    ↓
Check for Updates (GitHub)
    ├─ New Version Available?
    │   ↓─ Yes
    │   Update Download
    │       ↓
    │   Install on Next Launch
    │       ↓
    │   Notify User
    │
    └─ No → Continue
```

### Manual Update Check

Users can manually check:
1. Menu → Help → Check for Updates
2. Or download from Releases page

### Staged Rollout

For critical releases:
1. Release as pre-release first
2. Monitor issues
3. Promote to full release
4. Gradual deployment

---

## Rollback Procedure

If release has critical issues:

1. **Immediately**: Tag previous version release
   ```bash
   git tag -a v1.0.1-hotfix -m "Hotfix for critical issue"
   git push --tags
   ```

2. **Patch the issue**:
   - Fix code
   - Update version to 1.0.1
   - Commit and tag
   - Release

3. **Notify users**:
   - Update release notes
   - Post security notice
   - Recommend immediate upgrade

---

## Release Notes Template

```markdown
# JPE Mod Translator 1.1.0

**Release Date**: December 27, 2025

## What's New

### Features
- New XML format support
- Improved validation performance
- Better error messages

### Fixes
- Fixed file encoding issue
- Resolved memory leak
- Fixed UI glitches

### Changes
- Updated Electron to 26.2.0
- Improved code organization
- Better documentation

## Download

- [Windows Installer](https://github.com/.../JPE-Mod-Translator-1.1.0.nsis)
- [Windows Portable](https://github.com/.../JPE-Mod-Translator-1.1.0.exe)
- [macOS DMG](https://github.com/.../JPE-Mod-Translator-1.1.0.dmg)
- [macOS ZIP](https://github.com/.../JPE-Mod-Translator-1.1.0.zip)

## Installation

1. Download installer for your platform
2. Run installer
3. Follow setup wizard
4. Launch application

## Known Issues

None at this time.

## Upgrading

Auto-update will prompt you on next launch. Or manually download latest version.

## Contributors

Thanks to all contributors in this release.

## License

MIT License - See LICENSE file
```

---

## Verification Checklist

Before releasing:

- [ ] Version number updated in package.json
- [ ] CHANGELOG.md updated
- [ ] All tests passing
- [ ] Type checking passing
- [ ] Linter passing
- [ ] Build successful
- [ ] Binaries created for all platforms
- [ ] Release notes written
- [ ] Git tag created
- [ ] GitHub release created
- [ ] Binaries uploaded
- [ ] Release notes published
- [ ] Auto-update working
- [ ] Website updated
- [ ] Announcement posted (if applicable)

---

## Post-Release Monitoring

### User Issues

1. Monitor GitHub issues
2. Check crash reports
3. Review feedback
4. Priority: Patch critical issues immediately

### Performance Metrics

Track:
- Download counts
- Crash reports
- Update adoption rate
- User feedback

### Update Adoption

Monitor:
- % users on latest version
- Time to update
- Rollback needs

---

## Versioning Strategy

### Format

```
MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]

Examples:
1.0.0          → Release version
1.1.0-alpha.1  → First alpha
1.0.1-beta.2   → Second beta
1.0.0-rc.1     → Release candidate
```

### Guidelines

**MAJOR** (1.0.0 → 2.0.0):
- Breaking changes
- API incompatible
- Major feature overhaul
- Notify users of migration path

**MINOR** (1.0.0 → 1.1.0):
- New features
- Backwards compatible
- Enhanced functionality
- No breaking changes

**PATCH** (1.0.0 → 1.0.1):
- Bug fixes only
- No new features
- Backwards compatible
- Security fixes

**PRERELEASE** (1.0.0-alpha.1):
- Alpha: Feature incomplete
- Beta: Feature complete, bugs fixing
- RC: Near release, minimal changes

### Examples

| Version | Type | Reason |
|---------|------|--------|
| 1.0.0 | Initial | First release |
| 1.0.1 | Patch | Bug fixes |
| 1.1.0 | Minor | New validation rules |
| 2.0.0 | Major | Rewritten architecture |
| 1.1.0-alpha | Pre | Testing new features |

---

## Maintenance Timeline

| Timeframe | Task |
|-----------|------|
| Weekly | Review issues, PRs |
| Monthly | Update dependencies |
| Quarterly | Major updates, audits |
| Per release | Patch critical bugs |

---

## Signing & Notarization

### Windows Code Signing (Optional)

Prevents "Publisher Unknown" warning:

1. Obtain code signing certificate
2. Configure in electron-builder
3. Sign all binaries
4. Requires certificate from trusted CA

### macOS Code Signing & Notarization (Required)

For distribution outside App Store:

1. Register Apple Developer account
2. Create signing certificate
3. Build and sign app
4. Submit for notarization
5. Staple notarization to app
6. Distribute signed and notarized app

Configuration:
```json
{
  "mac": {
    "certificateFile": "certificate.p12",
    "certificatePassword": "password"
  }
}
```

---

## Security Best Practices

- [ ] Sign all releases
- [ ] Use HTTPS for downloads
- [ ] Verify binary checksums
- [ ] Scan binaries for malware
- [ ] Keep dependencies updated
- [ ] Report security issues responsibly
- [ ] Use secrets for signing credentials

---

## Resources

- [GitHub Releases API](https://docs.github.com/en/repositories/releasing-projects-on-github)
- [GitHub Actions](https://github.com/features/actions)
- [electron-builder](https://www.electron.build/)
- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

**Document Version**: 1.0
**Last Updated**: December 26, 2025
**Status**: Ready for implementation

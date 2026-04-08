# JPE Mod Translator 2.0 - Desktop App Quick Start

## ⚡ 30-Second Launch

### Option A: Run Portable Executable (Easiest)
```bash
# Double-click this file:
dist-native/JPE Mod Translator 2.0.0.exe

# Or from command line:
"dist-native/JPE Mod Translator 2.0.0.exe"
```

**That's it.** Application launches immediately.

---

## 🛠️ Development Mode (With Hot Reload)

```bash
# Install dependencies first (one time)
npm install

# Start development server + Electron
npm run dev:electron
```

**What happens:**
1. Vite dev server starts (http://localhost:3000)
2. Electron app launches automatically
3. Code changes auto-reload in app
4. DevTools available (Ctrl+Shift+I)

---

## 🔨 Build New Desktop App Version

```bash
# Build everything (web app + Electron + packages)
npm run dist

# Output: dist-native/JPE Mod Translator 2.0.0.exe (ready to distribute)
```

---

## 📦 Distribution Files

| File | Size | Use Case |
|------|------|----------|
| `dist-native/JPE Mod Translator 2.0.0.exe` | 189.4 MB | End users (single file) |
| `dist-native/win-unpacked/` | 879 MB | Full package distribution |
| `dist/` | Web assets | Check web app build |
| `dist-electron/` | Electron main process | Check Electron build |

---

## 🧪 Verify Build Success

```bash
# Check portable executable
file "dist-native/JPE Mod Translator 2.0.0.exe"
# Output: PE32 executable (Windows GUI)

# Check size
ls -lh "dist-native/JPE Mod Translator 2.0.0.exe"
# Output: 189M or similar

# Test run
"dist-native/JPE Mod Translator 2.0.0.exe"
# Should launch application
```

---

## 🐛 Troubleshooting

### App Won't Launch

**Check 1:** Windows Defender blocking?
```bash
# Add to antivirus exclusions and try again
```

**Check 2:** Is it a valid executable?
```bash
file "dist-native/JPE Mod Translator 2.0.0.exe"
# Should show: PE32 executable
```

**Check 3:** Rebuild it
```bash
npm install
npm run dist
```

---

## 🚀 For Distribution

1. Use: `dist-native/JPE Mod Translator 2.0.0.exe` (single file)
2. Upload to GitHub Releases
3. Share download link
4. Users: Double-click to run (no installation)

---

## 📋 What's Included

**In the portable .exe (189.4 MB):**
- ✅ Full React application
- ✅ Electron runtime (40.8.0)
- ✅ All dependencies bundled
- ✅ Web assets (CSS, JS, images)
- ✅ Icons and branding
- ✅ No external dependencies needed

**Run directly:**
- No installation required
- No additional downloads
- Works from any location
- Can run from USB drive

---

## 📚 Related Docs

- **Full Details:** See `BUILD_SUMMARY.md`
- **Development:** See `/docs/DEVELOPMENT.md`
- **User Guide:** See `THE_CODEX_USER_MANUAL.md`

---

**Status:** ✅ Ready to use and distribute

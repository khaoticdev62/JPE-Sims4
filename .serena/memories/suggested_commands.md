# Suggested Commands for JPE Studio Editor

## Development
```bash
# Web dev server (Next.js)
npm run dev

# Electron dev (Next.js + Electron together)
npm run electron:dev
```

## Building
```bash
# Next.js build (skips lint for speed)
npm run build

# Electron build
npm run electron:build

# Platform-specific distribution
npm run electron:dist:win    # Windows NSIS
npm run electron:dist:mac    # macOS DMG
npm run electron:dist:linux  # Linux AppImage
```

## Testing
```bash
# Jest unit/integration tests
npm test
npm run test:coverage        # With coverage
npm run test:integration     # Integration only

# Playwright E2E tests
npm run test:e2e
npm run test:e2e:ui          # With UI
npm run test:e2e:headed      # See browser
npm run test:e2e:report      # HTML report

# Python backend tests
npm run test:python

# Test fixtures (recent addition)
npm run test:fixtures

# All tests
npm run test:all
```

## Linting & Validation
```bash
# ESLint
npm run lint

# Fix lint issues
npx eslint --fix "src/**/*.{ts,tsx}"

# Format with Prettier
npx prettier --write "src/**/*.{ts,tsx}"

# Round-trip validation
npm run validate:roundtrip -- <xml_path>

# Decompile XML to JPE
npm run test:decompile -- <xml_path>
```

## Git Commands (Windows)
```bash
git status
git add .
git commit -m "message"
git push / git pull
git log --oneline -n 10
dir /b                    # List files
type <file>               # View file content
findstr /C:"pattern"      # Search (like grep)
```

## Python Commands
```bash
uv sync                   # Install dependencies
uv run jpe-sims4 --help   # Run CLI
uv run pytest -v          # Run tests
```

## Rust Commands
```bash
cd core
cargo build               # Build workspace
cargo build --release     # Release build
cargo test                # Run tests
cargo run -- <command>    # Run CLI
```
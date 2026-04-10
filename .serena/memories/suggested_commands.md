# Suggested Commands for JPE Studio Editor Development

## Development Server
```bash
# Start Next.js development server
npm run dev

# Start Electron development mode (runs Next.js + Electron)
npm run electron:dev
```

## Building
```bash
# Build Next.js application (skips linting for speed)
npm run build

# Build Electron application
npm run electron:build

# Package Electron app for distribution
npm run electron:package

# Package for specific platforms
npm run electron:package:win    # Windows
npm run electron:package:mac    # macOS
npm run electron:package:linux  # Linux
```

## Testing
```bash
# Run Jest unit/integration tests (TypeScript/React)
npm test

# Run integration tests only
npm run test:integration

# Run Playwright E2E tests
npm run test:e2e

# Run Playwright E2E tests with UI
npm run test:e2e:ui

# Run Playwright E2E tests in headed mode
npm run test:e2e:headed

# Show Playwright test report
npm run test:e2e:report

# Run Python backend tests
npm run test:python
# Or directly with pytest:
cd tests/python && pytest -v --tb=short

# Run all test suites (unit + integration + e2e)
npm run test:all
```

## Linting & Formatting
```bash
# Run ESLint
npm run lint

# Format with Prettier (if configured)
npx prettier --write "src/**/*.{ts,tsx}"

# Fix linting issues automatically
npx eslint --fix "src/**/*.{ts,tsx}"
```

## Validation & Utilities
```bash
# Validate roundtrip transformations
npm run validate:roundtrip

# Run with tsx directly (for TypeScript scripts)
npx tsx <script-path>
```

## Git & Version Control
```bash
# Standard git commands (Windows compatible)
git status
git add .
git commit -m "message"
git push
git pull
git log --oneline -10
```

## Windows-Specific Notes
- Use `dir` instead of `ls` (or install Git Bash/WSL for Unix commands)
- Use `type` instead of `cat` to view files
- Use `findstr` instead of `grep` (or use Git Bash)
- Path separator is `\` not `/` in Windows CMD/PowerShell
- Use `&&` to chain commands in CMD
- Use `;` to chain commands in PowerShell

## Python/UV Commands
```bash
# Install Python dependencies
uv sync

# Run Python scripts
uv run <script>

# Run Python CLI
uv run jpe-sims4 --help
```

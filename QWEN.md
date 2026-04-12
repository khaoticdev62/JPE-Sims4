# QWEN.md — JPE Studio Editor Context

## Project Overview

**JPE Studio Editor** is a professional, cyberpunk-themed IDE for **Sims 4 mod developers** to write, translate, and compile **Just Plain English (JPE)** logic into production-ready XML. It combines a full-featured code editor with AI-powered assistance and real-time XML transformations.

### Architecture Summary

This is a **multi-language, multi-runtime** project with three major engine layers:

| Layer | Language | Purpose |
|-------|----------|---------|
| **Web IDE (Frontend)** | TypeScript + React 19 + Next.js 15 | Cyberpunk-themed IDE UI with Monaco editor, AI integration, and workspace tools |
| **Electron Shell** | TypeScript + Electron 41 | Desktop wrapper with native file system access, tray menu, IPC, auto-updater, and LiveMonitor |
| **Core Engine (Rust)** | Rust (Cargo workspace) | High-performance JPE↔XML parsing, IR, and diagnostics engine |
| **Python Engine** | Python 3.11+ | Legacy Sims 4 file support, validation, generators, parsers, and predictive coding |

### Key Technologies

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS 3.4, Zustand (state), Jotai (atoms)
- **UI Components**: Radix UI primitives, shadcn/ui, Lucide React icons, Framer Motion (animations), Recharts (data viz)
- **Code Editor**: Monaco Editor (`@monaco-editor/react`) with custom JPE language registration
- **AI Providers**: Anthropic Claude, OpenAI GPT-4o, Google Gemini, Alibaba Qwen (via DashScope)
- **Desktop**: Electron 41, electron-builder, electron-updater, keytar (secure credential storage)
- **Rust Core**: Cargo workspace (6 crates) — `jpe_diag`, `jpe_ir`, `jpe_xml`, `jpe_lang`, `jpe_engine`, `jpe_cli`
- **Python Engine**: lxml, fast-xml-parser, Pillow, OpenCV, fuzzy matching, regex
- **Testing**: Jest + React Testing Library (unit), Playwright (E2E), Pytest (Python)

---

## Directory Structure

```
JPE_Mod_Translator_2.0/
├── src/                          # TypeScript/React frontend
│   ├── app/                      # Next.js App Router pages & layout
│   │   ├── layout.tsx            # Root layout with providers
│   │   ├── page.tsx              # Entry page
│   │   ├── globals.css           # Global styles
│   │   ├── studio/               # Main studio workspace
│   │   ├── auth/                 # Authentication routes
│   │   └── manual/               # Documentation/manual routes
│   ├── components/               # React UI components
│   │   ├── ui/                   # shadcn/ui base components
│   │   ├── providers/            # Context providers (GlobalTools, ShortcutProvider)
│   │   └── common/               # Shared components (ErrorBoundary, etc.)
│   ├── services/                 # Business logic services (~44 files)
│   │   ├── ai/                   # AI provider integrations
│   │   ├── api/                  # API route clients
│   │   ├── auth/                 # Authentication services
│   │   ├── editor/               # Editor-specific services
│   │   ├── translation/          # AI translation workflows
│   │   ├── validation/           # JPE/XML validation
│   │   └── main/                 # Electron main process services
│   ├── stores/                   # Zustand state stores
│   ├── hooks/                    # Custom React hooks
│   ├── engine/                   # Python engine bridge (IR, parsers, generators)
│   ├── utils/                    # Utility functions
│   ├── types/                    # TypeScript type definitions
│   ├── constants/                # Shared constants
│   ├── workers/                  # Web workers
│   ├── cli/                      # CLI tooling
│   ├── main.ts                   # Electron main process entry
│   ├── preload.ts                # Electron preload script
│   └── App.tsx                   # Root React component
├── core/                         # Rust core engine (Cargo workspace)
│   ├── crates/
│   │   ├── jpe_diag/             # Structured diagnostics (JSON serialization)
│   │   ├── jpe_ir/               # Intermediate representation for Sims 4 concepts
│   │   ├── jpe_xml/              # XML tuning parser & generator
│   │   ├── jpe_lang/             # JPE language parser & formatter
│   │   ├── jpe_engine/           # Orchestration engine for conversion workflows
│   │   └── jpe_cli/              # Command-line interface
│   └── Cargo.toml                # Workspace definition
├── engine/                       # Python engine (parsers, generators, validation)
│   ├── parsers/                  # JPE/XML parsers
│   ├── generators/               # Code generators
│   ├── validation/               # Validation logic
│   └── live/                     # Live monitoring
├── tests/                        # Test suites
│   ├── e2e/                      # Playwright E2E tests
│   ├── integration/              # Integration tests
│   ├── ai/                       # AI service tests
│   ├── python/                   # Python engine tests (pytest)
│   └── ui/                       # UI component tests
├── public/                       # Static assets (icons, etc.)
├── scripts/                      # Build & utility scripts
├── config/                       # Configuration files
├── plugins/                      # Plugin system
├── docs/                         # Documentation
├── design-artifacts/             # Design output artifacts
├── dist-electron/                # Compiled Electron output
├── release-dist/                 # Electron builder output (installer packages)
├── package.json                  # Node.js dependencies & scripts
├── pyproject.toml                # Python project definition
├── next.config.js                # Next.js configuration (static export mode)
├── tsconfig.json                 # TypeScript configuration
├── tsconfig.electron.json        # Electron-specific TypeScript config
├── electron-builder.yml          # Electron build/packaging config
├── tailwind.config.ts            # Tailwind CSS configuration
├── playwright.config.ts          # Playwright E2E config
├── jest.config.js                # Jest unit test config
└── electron-builder.yml          # Desktop app packaging (NSIS, DMG, AppImage)
```

---

## Building and Running

### Prerequisites

- **Node.js** 18.17+
- **Python** 3.11+
- **Rust** 1.70+ (for core engine)
- **npm** or **pnpm**

### Environment Setup

Create `.env.local` from `.env.local.example`:

```env
ANTHROPIC_API_KEY=your_claude_key
OPENAI_API_KEY=your_openai_key
GOOGLE_API_KEY=your_gemini_key
DASHSCOPE_API_KEY=your_qwen_key
```

### Web Development (Next.js)

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production (static export)
npm run build

# Start production server
npm run start

# Lint
npm run lint
```

### Electron Desktop App

```bash
# Run Electron in dev mode (starts Next.js dev + Electron)
npm run electron:dev

# Build Electron output
npm run electron:build

# Start built Electron app
npm run electron:start

# Package for distribution (all platforms)
npm run electron:publish

# Platform-specific builds
npm run electron:dist:win    # Windows (NSIS + Portable)
npm run electron:dist:mac    # macOS (DMG, x64 + arm64)
npm run electron:dist:linux  # Linux (AppImage + deb)
```

### Rust Core Engine

```bash
cd core

# Build workspace
cargo build

# Release build
cargo build --release

# Run tests
cargo test

# CLI usage
cargo run -- init ./MyModProject
cargo run -- import --xml-folder ./SomeModTuning --out ./MyModProject
cargo run -- check ./MyModProject
cargo run -- build --project ./MyModProject --out ./ExportedTuning --passthrough
```

### Python Engine

```bash
# Create virtual environment
python -m venv .venv
source .venv/Scripts/activate  # Windows
pip install -e .

# Run CLI
jpe-sims4      # CLI entry point
jpe-studio     # Studio entry point
```

### Testing

```bash
# Unit tests (Jest)
npm run test
npm run test:coverage

# Integration tests
npm run test:integration

# E2E tests (Playwright)
npm run test:e2e
npm run test:e2e:ui        # With UI
npm run test:e2e:headed    # Headed browser
npm run test:e2e:report    # View report

# Python tests (Pytest)
npm run test:python

# Run all tests
npm run test:all

# Round-trip validation
npm run validate:roundtrip
```

---

## Development Conventions

### TypeScript

- **Strict mode** enabled (`"strict": true` in tsconfig.json)
- **Path aliases** configured:
  - `@/*` → `./src/*`
  - `@components/*` → `./src/components/*`
  - `@services/*` → `./src/services/*`
  - `@stores/*` → `./src/stores/*`
  - `@hooks/*` → `./src/hooks/*`
  - `@utils/*` → `./src/utils/*`
  - `@engine/*` → `./src/engine/*`
  - `@types/*` → `./src/types/*`
  - `@constants/*` → `./src/constants/*`
  - `@styles/*` → `./src/styles/*`
  - `@app/*` → `./src/app/*`

### React Conventions

- **React 19** with hooks pattern
- **Named exports** preferred (only `App.tsx` uses default export)
- **TypeScript interfaces** for all props
- **Context providers** for global state (ThemeProvider, ShortcutProvider, AutoSaveProvider)
- **Error boundaries** wrap major sections
- **Animations** use Framer Motion (`framer-motion` package)

### Styling

- **Tailwind CSS 3.4** for layout utilities (spacing, flexbox, grid)
- **Inline styles** for colors via design tokens (import `T` from theme files)
- **Never hardcode hex colors** — use token system
- **Cyberpunk dark theme** as default (`#0a0c10` base background)
- **Glassmorphism** effects with `backdrop-filter: blur(24px)`
- **Font families**: Inter (sans), JetBrains Mono (mono), Outfit (display)

### State Management

- **Zustand** for complex global state (project state, editor state)
- **Jotai** for lightweight atomic state
- **LocalStorage** for persistence (settings, last-used mode, API key overrides)

### Testing Practices

- **Jest** for unit tests with `@testing-library/react`
- **Playwright** for E2E tests with headed mode and UI mode
- **Pytest** for Python engine tests with `--tb=short` output
- **Mock data** should be deterministic (seeded, not random)
- **Test files** co-located or in `/tests/` directory

### AI Integration

- **Server-side API routes** protect API keys (not exposed to client by default)
- **Hybrid key model**: users can override with personal keys via LocalStorage
- **Supported providers**: Claude 3.5 Sonnet, GPT-4o, Gemini 1.5 Pro, Qwen-Plus
- **Use cases**: code suggestions, error fixing, JPE→XML translation, mod analysis

### Security

- **Zero-storage policy** for user API keys (LocalStorage only, never sent to servers)
- **Context isolation** and **nodeIntegration: false** in Electron
- **keytar** for secure native credential storage (externaled from client bundle)
- **Encrypted communication** via server-managed API routes

---

## Key File Types & Sims 4 Modding Context

The IDE specializes in these Sims 4 modding file formats:

| Extension | Description |
|-----------|-------------|
| `.jpe` | Just Plain English source files (custom format) |
| `.xml` | XML tuning files (traits, buffs, CAS, interactions) |
| `.stbl` | String tables with FNV-32a hashing |
| `.ts4script` | Python script injection files |
| `.package` | Compiled Sims 4 mod packages (DBPF format) |
| `.json` | Configuration and manifest files |

### Important Patterns

- **Instance IDs**: `S4_034AEECB` format (hex after `S4_`)
- **FNV-32a hash** for string table keys
- **Round-trip conversion**: JPE ↔ XML with full fidelity
- **Passthrough elements**: unsupported XML elements preserved during conversion

---

## Workspace Modes

The application has 15 distinct workspace modes:
`dashboard`, `code`, `translation`, `jpe` (string tables), `depgraph`, `conflicts`, `build`, `library`, `plugin`, `debug`, `datavis`, `ai`, `settings`, `vault`, `diff`

---

## Electron IPC Handlers

The Electron main process exposes these handler categories:

1. **File Dialogs**: `file:open`, `file:save`, `file:openFile`
2. **File System**: `file:readFile`, `file:writeFile`, `file:listDirectory`, `file:exists`, `file:createDirectory`, `file:deleteFile`
3. **Binary Operations**: `file:readFileBuffer`, `file:writeFileBuffer`, `file:readSlice`, `file:appendFileBuffer`, `file:truncateFile`
4. **Project Operations**: `project:openDirectory`, `project:reveal`, `project:delete`, `project:search`, `project:replaceInFiles`, `project:rename`, `project:readFile`
5. **Window Controls**: `window:minimize`, `window:maximize`, `window:close`
6. **Compile**: `compile`, `compile:result`
7. **Sensory Hub**: `sensory:trigger`, `sensory:latency-pong`
8. **Sims 4 Engine**: `sims4:getModsPath`

---

## Important Notes for AI Code Generation

1. **Always use path aliases** (`@/`, `@components/`, etc.) instead of relative paths
2. **Never hardcode colors** — use the design token system (`T.*`)
3. **React 19** is in use — be aware of breaking changes from React 18
4. **Next.js 15** with App Router — use server/client component patterns correctly
5. **Tailwind 3.4** (not v4) — config file exists at `tailwind.config.ts`
6. **Static export mode** — `output: 'export'` in next.config.js (no SSR at runtime)
7. **Strict TypeScript** — no `any` without justification, proper typing required
8. **Cyberpunk theme** — maintain the dark charcoal + cyan/violet accent aesthetic
9. **Sims 4 terminology** — use correct terms (tuning, STBL, instance ID, package, DBPF)
10. **Multi-runtime awareness** — changes in `/src/` (web) vs `src/main.ts` (Electron) vs `/core/` (Rust) vs `/engine/` (Python) have different implications

# JPE Studio Editor - Project Overview

## Purpose
Professional cyberpunk-themed IDE for Sims 4 mod developers to write Just Plain English (JPE) logic with real-time XML transformations and AI intelligence.

## Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript 5
- **Styling**: Tailwind CSS 3.4+, shadcn/ui, Radix UI, Framer Motion
- **State**: Zustand (23 stores), Jotai (atoms)
- **Editor**: Monaco Editor (@monaco-editor/react)
- **AI**: Claude 3.5 Sonnet, GPT-4o, Gemini 1.5 Pro, Qwen-Plus, Ollama (local)
- **Desktop**: Electron 41, electron-builder, electron-updater
- **Python Backend**: jpe-sims4 package (Python 3.11+, lxml, Pillow, OpenCV)
- **Rust Core**: 6-crate workspace (jpe_diag, jpe_ir, jpe_xml, jpe_lang, jpe_engine, jpe_cli)

## Architecture
```
src/
├── app/              # Next.js pages (layout.tsx, page.tsx, studio/, auth/, manual/)
├── components/       # 200+ React components (ui/, jpe/, editor/, layout/, modals/)
├── services/         # 70+ service classes (ai/, api/, editor/, translation/, validation/)
├── stores/           # 23 Zustand stores
├── hooks/            # 18 custom hooks
├── engine/           # TypeScript engine (parsers, validators, translators)
├── cli/              # CLI tools (jpe-cli.ts, validate-roundtrip.ts, decompile-service.ts)
├── main.ts           # Electron main process
├── preload.ts        # Electron preload
└── workers/          # Web workers

core/                 # Rust core engine (6 crates)
engine/               # Python engine (parsers, generators, validation)
tests/                # Python tests (pytest)
test-fixtures/        # Sample mod projects for testing
```

## Key Features
- Real-time JPE↔XML transformation with debounced preview
- Multi-model AI integration (4 cloud + 1 local provider)
- Server-side API routes (keys never exposed to client)
- Monaco Editor with custom JPE language registration
- Export Wizard for .package building
- STBL string table management with FNV-32a hashing
- TS4Rebels community integration (IPC-secured)
- Gamepad/controller support (Steam Deck compatible)
- Auto-save, live sync, diagnostics panel

## Recent Updates (April 2026)
- Added Ollama local AI support (1,073 lines)
- Export Wizard component
- ProjectValidator with parallel processing
- StblBatchService for multi-locale operations
- SearchService (Electron IPC-backed)
- ShortcutService with scope management
- Test fixtures suite (14 files, 7 categories)
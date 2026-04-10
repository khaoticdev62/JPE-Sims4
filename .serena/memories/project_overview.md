# JPE Studio Editor - Project Overview

## Purpose
JPE Studio Editor is a professional, high-fidelity web IDE for Sims 4 mod developers to write **Just Plain English (JPE)** logic with real-time XML transformations and enterprise-grade AI intelligence.

## Key Features
- Real-Time JPE-to-XML Transformation with instant preview
- Multi-Model AI Integration (Claude 3.5 Sonnet, OpenAI GPT-4o, Google Gemini 1.5 Pro, Alibaba Qwen-Plus)
- Enterprise-Grade Security with server-side API routes
- Monaco Editor with custom JPE language support
- Smart AI Fixes and Mod Analysis
- Export to `.jpe` source or `.xml`
- Electron desktop application support

## Architecture
- **Frontend**: Next.js 15+ (App Router) with React 18
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS 3.4+ with custom cyberpunk theme
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: Zustand and Jotai
- **Code Editor**: Monaco Editor
- **Desktop**: Electron 41+ with electron-builder
- **AI SDKs**: Anthropic, OpenAI, Google Generative AI, DashScope

## Python Backend
- **Package**: jpe-sims4 (core engine for translation)
- **Python Version**: 3.11+
- **Package Manager**: UV
- **Dependencies**: requests, lxml, Pillow, opencv-python, watchdog, rich, etc.
- **Entry Points**: jpe-sims4 (CLI), jpe-studio (Qt app)

## Project Structure
- `src/` - Frontend TypeScript/React code
  - `app/` - Next.js app router pages
  - `components/` - React components
  - `engine/` - Translation/transformation engine
  - `services/` - API and AI services
  - `stores/` - State management (Zustand)
  - `hooks/` - Custom React hooks
  - `utils/` - Utility functions
  - `__tests__/` - Frontend tests
- `tests/` - Python backend tests
- `public/` - Static assets
- `config/` - Configuration files
- `plugins/` - Plugin system
- `engine/` - Python engine code

## Design System
- Custom cyberpunk/spectral theme with CSS variables
- Primary colors: cyan, violet, emerald, rose, amber
- Dark mode support
- TailwindCSS with custom tokens

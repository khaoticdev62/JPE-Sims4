# Style and Conventions for JPE Studio Editor

## TypeScript/React

### File Naming
- Components: PascalCase (e.g., `Button.tsx`, `ExportWizard.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useEditorActions.ts`)
- Services: PascalCase (e.g., `CompilerService.ts`, `OllamaService.ts`)
- Stores: camelCase with `use` prefix (e.g., `useProjectStore.ts`)
- Utils: camelCase (e.g., `helpers.ts`)

### Code Style (Prettier config: `.prettierrc.json`)
- Single quotes
- No semicolons
- 90 char print width
- 2 space indent
- ES5 trailing commas
- Arrow parens always

### Type System
- Strict mode enabled (`"strict": true`)
- Explicit types for function params/returns
- Interfaces for objects, types for unions
- No implicit `any`

### Path Aliases
```
@/*           → ./src/*
@components/* → ./src/components/*
@services/*   → ./src/services/*
@stores/*     → ./src/stores/*
@hooks/*      → ./src/hooks/*
@utils/*      → ./src/utils/*
@engine/*     → ./src/engine/*
@types/*      → ./src/types/*
@constants/*  → ./src/constants/*
@styles/*     → ./src/styles/*
```

### Component Structure
```tsx
import { useState } from 'react'
import { cn } from '@/utils'

interface Props {
  variant?: 'primary' | 'secondary'
  onClick?: () => void
  children: React.ReactNode
}

export function Component({ variant = 'primary', onClick, children }: Props) {
  return <div>{children}</div>
}
```

### Naming Conventions
- Variables/functions: camelCase
- Classes/components: PascalCase
- Constants: UPPER_SNAKE_CASE
- Private members: _prefix
- Event handlers: handle prefix
- Booleans: is/has/should prefix

### Styling
- Tailwind CSS for layout (spacing, flexbox, grid)
- Design tokens via `T.*` from theme files
- Never hardcode hex colors
- `cn()` utility (tailwind-merge + clsx) for conditional classes
- Framer Motion for animations

## Python
- Type hints for all function signatures
- Docstrings for modules, classes, functions
- PEP 8 compliance
- Use `rich` for CLI formatting
- Async/await for I/O (aiohttp)

## Rust
- Edition 2021
- serde for serialization
- thiserror for error types
- tracing for logging
- pest for parsing

## ESLint Rules
- @typescript-eslint/no-unused-vars (unused vars must match /^_/u)
- react-hooks/rules-of-hooks (hooks must be top-level)
- no-useless-escape (no unnecessary escapes)
- jsx-a11y rules enforced
- React plugin rules enforced

## Common Patterns
- Zustand stores: immer middleware for immutable updates
- Services: singleton pattern with static getInstance()
- AI services: extend BaseAIService with retry logic
- Error handling: try/catch with type-safe error conversion
- IPC: Electron handlers in src/main.ts with sanitization
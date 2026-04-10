# Style and Conventions for JPE Studio Editor

## TypeScript/React Conventions

### File Naming
- Components: PascalCase (e.g., `Button.tsx`, `ProjectCard.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useCodeFix.ts`, `useAI.ts`)
- Utilities: camelCase (e.g., `transformXML.ts`, `helpers.ts`)
- Stores: camelCase with descriptive names (e.g., `useProjectStore.ts`)
- Services: PascalCase (e.g., `AIService.ts`, `CompilerService.ts`)
- Tests: `.test.ts` or `.test.tsx` suffix, or in `__tests__/` directories

### Code Style
- **Quotes**: Single quotes (Prettier config)
- **Semicolons**: Omitted (Prettier config)
- **Trailing Commas**: ES5 (in objects/arrays, but not function parameters)
- **Print Width**: 90 characters
- **Tab Width**: 2 spaces
- **Arrow Function Parens**: Always included

### Type Hints
- Strict mode enabled in `tsconfig.json`
- Use explicit type annotations for function parameters and return types
- Leverage TypeScript's type inference where obvious
- Use interfaces for object shapes, types for unions/intersections
- Custom type aliases for complex types

### Component Structure
```tsx
// 1. Imports
import { useState } from 'react'
import { cn } from '@/utils'

// 2. Props interface
interface ButtonProps {
  variant?: 'primary' | 'secondary'
  onClick?: () => void
  children: React.ReactNode
}

// 3. Component definition
export function Button({ variant = 'primary', onClick, children }: ButtonProps) {
  // Implementation
}
```

### Naming Conventions
- **Variables/Functions**: camelCase
- **Classes/Components/Interfaces**: PascalCase
- **Constants**: UPPER_SNAKE_CASE
- **Private members**: underscore prefix (e.g., `_handleClick`)
- **Event handlers**: `handle` prefix (e.g., `handleClick`, `handleChange`)
- **Boolean variables**: `is`, `has`, `should` prefixes (e.g., `isLoading`, `hasError`)

### Import Organization
```typescript
// 1. External dependencies
import { useState } from 'react'
import { cn } from '@/utils'

// 2. Internal modules (aliased)
import { AIService } from '@services/ai'
import { useProjectStore } from '@stores/useProjectStore'

// 3. Relative imports
import { Button } from './Button'
import styles from './styles.module.css'
```

### Module Aliases (from tsconfig.json)
- `@/*` → `./src/*`
- `@app/*` → `./src/app/*`
- `@components/*` → `./src/components/*`
- `@constants/*` → `./src/constants/*`
- `@engine/*` → `./src/engine/*`
- `@hooks/*` → `./src/hooks/*`
- `@services/*` → `./src/services/*`
- `@stores/*` → `./src/stores/*`
- `@styles/*` → `./src/styles/*`
- `@types/*` → `./src/types/*`
- `@utils/*` → `./src/utils/*`

### State Management
- Use **Zustand** for global state (stores in `src/stores/`)
- Use **Jotai** for atomic state where appropriate
- Use **React hooks** (useState, useReducer) for local component state
- Store slices pattern for complex state

### Error Handling
- Use try/catch blocks with specific error types
- Log errors with `console.error` or `console.warn`
- Display user-friendly error messages via toast notifications (sonner)
- Graceful degradation for AI service failures

### AI Service Patterns
- Server-side API routes for API key security
- Client-side never exposes API keys (except user-provided overrides in LocalStorage)
- Rate limiting and retry logic with axios-retry
- Fallback providers configured

### CSS/Styling
- **Primary**: TailwindCSS utility classes
- **Custom Theme**: CSS variables in `tailwind.config.ts`
- **Component Styling**: `cn()` utility (tailwind-merge + clsx) for conditional classes
- **Animations**: Framer Motion for complex animations, Tailwind for simple ones
- **Design Tokens**: Defined in CSS variables (e.g., `var(--jpe-cyan)`, `var(--jpe-bg)`)

### Testing Conventions
- **Unit Tests**: Jest + React Testing Library
- **E2E Tests**: Playwright (in `src/__tests__/e2e/specs/`)
- **Test Files**: Co-located with source or in `__tests__/` directories
- **Test Naming**: Descriptive test block names
- **Mocking**: Jest mocks for external services and APIs

### Python Conventions (Backend)
- Type hints for function signatures
- Docstrings for modules, classes, and functions
- PEP 8 compliance
- Use `rich` for CLI output formatting
- Async/await for I/O operations (aiohttp)

### Documentation
- JSDoc comments for public APIs
- README files for major modules
- Inline comments for complex logic only
- Self-documenting code preferred over excessive comments

### Accessibility
- ARIA labels on interactive elements
- Keyboard navigation support
- High contrast mode support
- Screen reader compatibility

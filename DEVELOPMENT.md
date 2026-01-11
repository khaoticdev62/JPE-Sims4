# JPE Mod Translator - Development Setup Guide

## Prerequisites

- Node.js 18+ and npm 9+
- Git
- A code editor (VS Code recommended)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React 18
- Zustand (state management)
- Electron (desktop framework)
- Tailwind CSS (styling)
- TypeScript
- Jest (testing)
- CodeMirror (code editor)

### 2. Start Development Server

For development with hot reload:

```bash
npm run dev
```

This starts the Vite development server on `http://localhost:3000`.

### 3. Run Electron in Development

In a separate terminal, run:

```bash
npm run electron-dev
```

This launches the Electron app and watches for changes. The app will reload when you save files.

## Available Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start Vite dev server (React only) |
| `npm run electron-dev` | Start Electron with hot reload |
| `npm run build` | Build for production (Electron + installer) |
| `npm run build:web` | Build web version only |
| `npm run test` | Run Jest tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate test coverage report |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript type checking |
| `npm run format` | Format code with Prettier |

## Project Structure

```
src/
├── main.ts              # Electron main process
├── main.tsx             # React entry point
├── preload.ts           # IPC bridge
├── App.tsx              # Root component
├── components/
│   └── layout/          # Main layout components
├── stores/              # Zustand state stores
├── services/            # Business logic services
├── engine/              # Translation & parsing engine (TBD)
├── types/               # TypeScript type definitions
├── utils/               # Helper utilities
├── constants/           # App constants
└── styles/              # Global CSS
```

## Key Technologies

### Frontend
- **React 18**: UI library with hooks
- **Zustand**: Lightweight state management
- **Tailwind CSS**: Utility-first CSS framework
- **TypeScript**: Type-safe JavaScript

### Desktop
- **Electron 26**: Cross-platform desktop framework
- **electron-builder**: App packaging and distribution

### Code Editor
- **CodeMirror 6**: Advanced code editor component
- Supports syntax highlighting for multiple languages

### Testing
- **Jest**: Unit testing framework
- **React Testing Library**: Component testing
- **TypeScript**: Type-safe tests

### Tooling
- **Vite**: Lightning-fast build tool
- **ESLint**: Code linting
- **Prettier**: Code formatting

## Zustand Stores

The app uses 4 main stores:

1. **useProjectStore**: Project and file management
2. **useEditorStore**: Editor state (tabs, content, cursor)
3. **useDiagnosticStore**: Error/warning diagnostics
4. **useUIStore**: UI preferences (theme, layout)

Access stores in components:
```tsx
import { useProjectStore } from '@stores/useProjectStore'

function MyComponent() {
  const { currentProject, createProject } = useProjectStore()
  // ...
}
```

## Styling

The app uses **Tailwind CSS** for styling:

```tsx
<div className="flex gap-4 bg-slate-900 text-slate-100">
  {/* Classes apply utilities directly */}
</div>
```

Dark mode is the default theme. See `src/styles/globals.css` for overrides.

## Adding New Components

1. Create file in appropriate subdirectory under `src/components/`
2. Use TypeScript and React hooks
3. Import types from `@types/index`
4. Import stores/services as needed

Example:
```tsx
import { useProjectStore } from '@stores/useProjectStore'

export default function MyComponent() {
  const { currentProject } = useProjectStore()

  return (
    <div className="p-4">
      {currentProject?.name}
    </div>
  )
}
```

## Testing

Write tests alongside your code:

```typescript
// src/components/MyComponent.test.tsx
import { render, screen } from '@testing-library/react'
import MyComponent from './MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText(/text/i)).toBeInTheDocument()
  })
})
```

Run tests: `npm test`

## Code Quality

Maintain code quality with:

```bash
npm run lint           # Find issues
npm run format         # Auto-format code
npm run type-check     # Check types
```

## Debugging

### React DevTools
Electron dev mode opens DevTools automatically (`F12`).

### Zustand DevTools
Zustand stores are configured with devtools middleware for debugging state changes.

### VSCode Debugging
Debug configurations are available for:
- Electron main process
- Jest tests

## Building for Production

```bash
npm run build
```

This creates:
- Optimized web build in `dist/`
- Electron app binaries in `dist-electron/`
- Platform-specific installers (Windows NSIS, Mac DMG)

## Environment Variables

Create `.env.local` for local development overrides:

```
VITE_API_URL=http://localhost:3000
VITE_LOG_LEVEL=debug
```

## Troubleshooting

### "Module not found" errors
- Run `npm install` to ensure all dependencies are installed
- Check path aliases in `vite.config.ts` match your imports

### Hot reload not working
- Ensure you're running `npm run electron-dev` (not just `npm run dev`)
- Check that ports 5173 and 5174 are available

### Type errors
- Run `npm run type-check` to see full type errors
- Import types explicitly: `import type { Project } from '@types/index'`

### Tests failing
- Ensure jest.setup.ts is being loaded
- Mock electron APIs if needed
- Check file paths use `@` alias correctly

## Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes and write tests
3. Run `npm run lint && npm run format`
4. Commit: `git commit -m "feat: description"`
5. Push and create a pull request

## Next Steps

See [STORIES.md](STORIES.md) for Sprint 1 implementation tasks.

Phase 1 (Week 1) focuses on:
- Project management (create, open, save)
- File addition and management
- Basic UI scaffolding

## Resources

- [Electron Docs](https://www.electronjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Zustand](https://github.com/pmndrs/zustand)
- [TypeScript](https://www.typescriptlang.org)

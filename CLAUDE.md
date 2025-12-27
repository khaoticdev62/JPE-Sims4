# Claude Code Configuration for JPE Sims 4 Mod Translation Suite

## Project Overview

JPE Sims 4 Mod Translation Suite - A professional desktop and mobile application for translating Sims 4 mods to JPE (Just Plain English) format. Modern Dark Mode aesthetic with Apple TV UX influence.

---

## Figma MCP Integration Rules

These rules define how to translate Figma designs into production code for this project. Follow this workflow for every Figma implementation task.

### Required Implementation Flow (Do Not Skip)

1. **Run get_design_context** first to fetch the structured design representation for the specific node(s)
2. **Run get_screenshot** for a visual reference of the node/variant being implemented
3. **If response is too large**, run get_metadata to get high-level node map, then re-fetch specific nodes
4. **Download assets** from the Figma MCP server endpoint (never create placeholders)
5. **Translate to project conventions** - Map Figma output to this project's styling, components, and patterns
6. **Validate against Figma** - Verify 1:1 visual parity with screenshot before marking complete

### Core Implementation Rules

- **IMPORTANT:** Treat Figma MCP output (React + Tailwind) as a design representation, NOT final code style
- **IMPORTANT:** Replace Tailwind classes with project tokens and conventions
- **IMPORTANT:** Reuse existing components from `@components/` instead of duplicating functionality
- **IMPORTANT:** Never hardcode colors - always use design tokens from `src/design-system/tokens.json`
- **IMPORTANT:** Use project path aliases - never use relative imports beyond parent directory

---

## Design System & Component Organization

### Directory Structure

```
src/
├── components/
│   ├── common/          # Atomic UI components (Button, Input, TextInput, Modal)
│   ├── layout/          # Layout primitives (EditorPane, Sidebar, TitleBar, RightPanel)
│   ├── modals/          # Dialog/Modal components (NewProjectDialog, AddFileDialog)
│   └── [features]/      # Feature-specific components (organized by feature)
├── design-system/       # Design tokens and prompt documentation
│   ├── tokens.json      # Design tokens (colors, typography, spacing)
│   └── prompts/         # Figma AI prompts (atomic + screen-level)
├── engine/              # Core processing engines (Parser, Compiler, Validator)
├── services/            # Business logic and service classes
├── stores/              # Zustand state management
├── hooks/               # Custom React hooks
└── types/               # TypeScript type definitions
```

### Component Naming & Structure

- **File names**: PascalCase (e.g., `Button.tsx`, `EditorPane.tsx`)
- **Exports**: Default export as named component (e.g., `export default function Button(...)`)
- **Props interface**: `[ComponentName]Props` extending appropriate HTMLElement attributes
- **Variants**: Use union type variants (e.g., `variant: 'primary' | 'secondary' | 'danger'`)
- **Composition**: All components must accept `className` prop for style composition

### Path Aliases (Use These)

```typescript
// ✅ CORRECT - Use path aliases
import Button from '@components/common/Button'
import { useProjectStore } from '@stores/useProjectStore'
import { CompilerService } from '@services/CompilerService'
import { ValidationEngine } from '@engine/validators/ValidationEngine'

// ❌ WRONG - Don't use relative imports
import Button from '../../../components/common/Button'
```

---

## Design Tokens & Styling System

### Design Tokens (from src/design-system/tokens.json)

All design values must come from the official token file. Never hardcode colors, typography, or spacing.

**Colors:**
```json
{
  "background-primary": "#000000",    // Deep dark base
  "background-secondary": "#121212",  // Slightly lighter
  "background-tertiary": "#1C1C1E",   // Card backgrounds
  "text-primary": "#FFFFFF",          // Main text
  "text-secondary": "#8E8E93",        // Secondary/disabled text
  "accent-primary": "#0A84FF",        // Primary action blue
  "accent-focus": "#007AFF",          // Focused state
  "border-subtle": "#38383A",         // Dividers/borders
  "state-error": "#FF453A",           // Error/destructive
  "state-success": "#32D74B",         // Success/positive
  "state-warning": "#FF9F0A"          // Warning/caution
}
```

**Typography:**
```json
{
  "fontFamily": "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto",
  "fontSize": {
    "xs": "0.75rem" (12px),
    "sm": "0.875rem" (14px),
    "base": "1rem" (16px),
    "lg": "1.125rem" (18px),
    "xl": "1.25rem" (20px),
    "2xl": "1.5rem" (24px),
    "3xl": "1.875rem" (30px)
  },
  "fontWeight": {
    "regular": 400,
    "medium": 500,
    "semibold": 600,
    "bold": 700
  }
}
```

**Spacing Scale (4px base):**
```json
{
  "0": "0px",
  "0.5": "2px",    // Fine spacing
  "1": "4px",      // Tight spacing
  "2": "8px",      // Small spacing
  "3": "12px",     // Modest spacing
  "4": "16px",     // Standard spacing
  "5": "20px",     // Medium spacing
  "6": "24px",     // Large spacing
  "8": "32px",     // X-Large spacing
  "10": "40px",    // XXL spacing
  "12": "48px",    // Big spacing
  "16": "64px"     // Extra big spacing
}
```

### Tailwind CSS Styling

- **Framework**: Tailwind CSS (v3.x)
- **Configuration**: `tailwind.config.js` at project root
- **Approach**: Utility-first with component composition
- **Custom theme**: Extended in `tailwind.config.js` theme.extend

**Styling Patterns:**
```tsx
// ✅ CORRECT - Use Tailwind with project tokens
function Card({ children, className = '' }) {
  return (
    <div className={`
      bg-background-tertiary
      border border-border-subtle
      rounded-lg
      p-4
      ${className}
    `}>
      {children}
    </div>
  )
}

// ✅ CORRECT - Use project design tokens
const buttonStyles = {
  primary: 'bg-accent-primary hover:bg-accent-focus text-text-primary',
  secondary: 'bg-background-secondary hover:bg-background-tertiary text-text-primary',
  danger: 'bg-state-error hover:opacity-90 text-text-primary'
}

// ❌ WRONG - Never hardcode colors
<div className="bg-blue-600">  // Don't do this!
```

---

## Desktop Application Layout

Per UI/UX PRD v2: Three-pane layout with bottom diagnostics bar.

### Main Workspace Architecture

```
┌─────────────────────────────────────────────────┐
│  Global Toolbar & Menu (File, Edit, View, etc) │
├──────────────┬─────────────────┬────────────────┤
│              │                 │                │
│   Project    │     Editor      │   Context      │
│   Explorer   │    (Tabs +      │   Pane         │
│   (Left)     │   Split Views)  │   (Right)      │
│              │    (Center)     │                │
│              │                 │                │
├──────────────┴─────────────────┴────────────────┤
│  Diagnostics & Build Console (Bottom)           │
└──────────────────────────────────────────────────┘
```

### Component Hierarchy

**Layout Components:**
- `TitleBar`: Global menu, toolbar, project selector
- `Sidebar`: Project explorer with file tree and icons
- `EditorPane`: Tabbed editor with split view support
- `RightPanel`: Context pane (preview, metadata, quick actions)
- Diagnostics panel (Problems list + Build log)

**Expected Layout Props:**
```tsx
interface EditorLayoutProps {
  showSidebar: boolean
  showContextPane: boolean
  showDiagnostics: boolean
  sidebarWidth?: number // in pixels
  contextPaneWidth?: number
  diagnosticsHeight?: number
}
```

---

## Component Patterns & Conventions

### Button Component

**Location**: `@components/common/Button.tsx`

**Usage:**
```tsx
import Button from '@components/common/Button'

<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>
```

**Variants**: `'primary' | 'secondary' | 'danger'`
**Sizes**: `'sm' | 'md' | 'lg'`
**Props**: Accepts all HTMLButtonElement attributes + `isLoading`, `variant`, `size`

### Input Component

**Location**: `@components/common/TextInput.tsx`

**Usage:**
```tsx
import TextInput from '@components/common/TextInput'

<TextInput
  label="Project Name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  error={hasError}
/>
```

### Modal Component

**Location**: `@components/common/Modal.tsx`

**Usage:**
```tsx
import Modal from '@components/common/Modal'

<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Confirm Action"
>
  <p>Are you sure?</p>
  <Button onClick={handleConfirm}>Confirm</Button>
</Modal>
```

### Dialog/Wizard Components

**Location**: `@components/modals/[DialogName].tsx`

Dialogs should be self-contained and handle their own state:
- `NewProjectDialog` - Create new project wizard
- `AddFileDialog` - Import files to project
- `OpenProjectDialog` - Project browser

---

## iOS Application Conventions

Per UI/UX PRD v2: Tab-based navigation (Projects, Files, Diagnostics, Settings).

### Mobile-Specific Patterns

**Tab Navigation:**
- Bottom tab bar with 4 tabs: Projects, Files, Diagnostics, Settings
- Consistent navigation structure across all tabs

**Component Sizing:**
- Minimum tap target: 44x44 pt (iOS HIG)
- Large, readable text with system fonts
- Touch-optimized spacing

**Responsive Behavior:**
- Desktop: Multi-pane layout (3 columns)
- Tablet: Adaptive layout (2 columns)
- Mobile: Single column, bottom navigation

### Device-Specific Styling

```tsx
// Use component props for responsive variants
<Button
  variant={isMobile ? 'block' : 'inline'}
  size={isMobile ? 'lg' : 'md'}
>
  Action
</Button>
```

---

## State Management

### Zustand Stores

**Location**: `@stores/`

**Store Conventions:**
```typescript
// src/stores/useProjectStore.ts
import { create } from 'zustand'

interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  addProject: (project: Project) => void
  setCurrentProject: (project: Project) => void
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  currentProject: null,
  addProject: (project) => set((state) => ({
    projects: [...state.projects, project]
  })),
  setCurrentProject: (project) => set({ currentProject: project }),
}))
```

**Store Types:**
- `useProjectStore` - Project and file state
- `useEditorStore` - Editor tabs and active file
- `useDiagnosticStore` - Validation results
- `useUIStore` - UI state (theme, panels visibility)

---

## Asset Handling

### Image & Icon Assets

**From Figma MCP Server:**
```typescript
// ✅ CORRECT - Use localhost sources directly
import { useDesignAssets } from '@hooks/useDesignAssets'

export function Component() {
  const { logoUrl, iconUrl } = useDesignAssets()

  return (
    <>
      <img src={logoUrl} alt="JPE Logo" />
      <img src={iconUrl} alt="Icon" />
    </>
  )
}

// ✅ CORRECT - Store in assets directory
// src/assets/
//   ├── icons/
//   ├── logos/
//   └── illustrations/
```

**Rules:**
- **IMPORTANT:** Use localhost sources from Figma MCP directly (don't create placeholders)
- **IMPORTANT:** Never install new icon packages - all assets come from Figma
- Store downloaded assets in `src/assets/` organized by type
- Export asset paths from `src/constants/assets.ts` for reuse

### Icon System

**Icon Components:**
```tsx
// Use SVG components for all icons
import { ChevronDownIcon, FileXmlIcon, AlertIcon } from '@components/icons'

<ChevronDownIcon size={20} color="accent-primary" />
```

**Icon Categories:**
- File-type icons (XML, JPE, STBL, Package)
- Diagnostic icons (Error, Warning, Info, Success)
- Action icons (Build, Run, Import, Export)
- Navigation icons (Back, Forward, Settings)

---

## Accessibility Requirements

### WCAG 2.1 AA Compliance

**Color & Contrast:**
- Minimum contrast ratio: 4.5:1 for normal text
- 3:1 for large text (18pt+)
- Don't rely on color alone - combine with shapes/labels

**Keyboard Navigation:**
- All interactive elements must be keyboard accessible
- Tab order: logical, left-to-right, top-to-bottom
- Focus indicators: visible and clear (minimum 2px outline)

**Screen Readers:**
- Semantic HTML: use proper heading hierarchy
- ARIA labels: for icons and hidden actions
- Live regions: for async updates (diagnostics)

**Mobile Accessibility:**
- Minimum 44x44 pt tap targets
- Dynamic Type support (scalable fonts)
- VoiceOver labels for file types and severity indicators

### Implementation Patterns

```tsx
// ✅ CORRECT - Semantic HTML with labels
<button
  aria-label="Close dialog"
  className="p-2 hover:bg-background-secondary rounded"
>
  ✕
</button>

<div role="status" aria-live="polite">
  Build completed with 3 warnings
</div>

// ❌ WRONG - Non-semantic, no labels
<div onClick={handleClose}>X</div>
```

---

## Performance Optimization

### Best Practices

**Code Splitting:**
- Use React.lazy() for route-based splitting
- Dynamic imports for feature modules

**Memoization:**
- Wrap expensive components with `React.memo()`
- Use `useMemo()` for heavy computations
- Use `useCallback()` for event handlers passed to children

**Image Optimization:**
- Lazy load images outside viewport
- Use WebP with PNG fallbacks where applicable
- Responsive images for different screen sizes

**State Management:**
- Keep Zustand stores minimal (only cross-component state)
- Use local component state for UI-only state
- Avoid deeply nested state structures

### Example Optimization

```tsx
// ✅ CORRECT - Memoized component with optimized render
const FileItem = React.memo(({ file, onSelect }) => {
  const handleClick = useCallback(() => {
    onSelect(file.id)
  }, [file.id, onSelect])

  return (
    <button onClick={handleClick} className="file-item">
      {file.name}
    </button>
  )
})
```

---

## Testing Requirements

### Unit Tests

**Location**: `__tests__/` directory adjacent to component

**Structure:**
```
src/components/common/
├── Button.tsx
├── Button.test.tsx
└── Button.stories.tsx  // Storybook (optional)
```

**Testing Library Queries:**
```typescript
// ✅ CORRECT - Use semantic queries
render(<Button>Click me</Button>)
expect(screen.getByRole('button')).toHaveTextContent('Click me')
expect(screen.getByLabelText('Confirm')).toBeInTheDocument()

// ❌ WRONG - Avoid implementation details
expect(container.querySelector('.btn-primary')).toBeInTheDocument()
```

### Test Coverage Goals

- **Core components**: 80%+ coverage
- **Business logic**: 90%+ coverage
- **UI interactions**: All variants and states
- **Error scenarios**: Happy path + error cases

---

## Development Workflow

### Running the Application

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Electron development
npm run electron-dev

# Build for production
npm run build

# Run tests
npm test
npm test:coverage

# Linting
npm run lint

# Type checking
npm run type-check

# Format code
npm run format
```

### Git Conventions

**Branch naming:**
- Feature: `feature/description`
- Fix: `fix/description`
- Chore: `chore/description`

**Commit messages:**
```
feat: Add user authentication
fix: Resolve editor lag on large files
chore: Update dependencies
docs: Add setup instructions
test: Add tests for validator
```

---

## Branding & Visual Identity

### Logo Usage

- **Primary**: Full logo (mark + wordmark) in UI headers
- **Mark-only**: App icon, favicons, badges
- **Minimum size**: 120px width (desktop), 16px (favicon)

### Color Palettes

**Brand Colors:**
- Primary: `#0A84FF` (accent-primary)
- Dark: `#000000` (background-primary)
- Light: `#F5F7FA` (reserved for documentation)

**Diagnostic Colors:**
- Error: `#FF453A` (destructive, failure)
- Warning: `#FF9F0A` (caution, attention needed)
- Info: `#2680C2` (informational)
- Success: `#32D74B` (positive, success)

**Don't:**
- Mix colors from other brands (especially Sims 4)
- Hardcode arbitrary colors
- Change approved colors without design review

### Typography Hierarchy

**For UI:**
- Headings: 2xl-3xl, semibold-bold
- Body: base, regular
- Labels: sm, medium
- Captions: xs, regular

---

## Special Considerations for JPE Translator

### Domain-Specific Components

**File-Type Visualization:**
- XML files: Show hierarchical structure
- JPE files: Show plain English sections
- Compilation results: Show before/after

**Validation Display:**
- Real-time error underlines (like IDE)
- Margin icons for quick navigation
- Grouped diagnostics panel

**Editor Integration:**
- Syntax highlighting (for XML/JPE)
- Autocompletion (enum values, tuning IDs)
- Quick navigation (go to definition, find references)

### Data Processing Pipeline Visualization

Components should visualize: XML → Parser → JPE/JPE-XML → Validator → Compiler → XML

Show progress, errors, and warnings at each stage.

---

## Figma Design-to-Code Checklist

When implementing designs from Figma:

- [ ] Ran `get_design_context` and `get_screenshot`
- [ ] Downloaded all assets from Figma MCP server
- [ ] Used project design tokens (not hardcoded colors)
- [ ] Reused existing components from `@components/`
- [ ] Followed component naming and structure conventions
- [ ] Used path aliases for imports (@components, @stores, etc.)
- [ ] Applied proper accessibility (ARIA labels, semantic HTML)
- [ ] Tested on desktop and mobile viewport sizes
- [ ] Verified 1:1 visual parity with Figma screenshot
- [ ] No unused dependencies or placeholder content
- [ ] Proper TypeScript types for all props
- [ ] Tailwind classes organized and readable

---

## Version Information

- **Project Version**: 1.0.0
- **Branding Version**: 1.0.0
- **Design Tokens Version**: 1.0.0
- **Last Updated**: December 27, 2025

---

## Contacts & Resources

- **Design Documentation**: See PDF files in project root
  - `jpe_sims4_ui_ux_prd_v2.pdf` - Complete UI/UX specification
  - `jpe_branding_style_guide_and_production_sop_v1.pdf` - Branding rules
  - `jpe_icon_system_prd_v1.pdf` - Icon specifications

- **Component Stories**: View in Storybook (when available)
- **Design System Tokens**: `src/design-system/tokens.json`
- **Build Guide**: `BUILD_GUIDE.md`

---

## Keeping Rules Updated

Update this file when:
- New component patterns are established
- Design tokens change
- Accessibility requirements are updated
- Project structure changes significantly
- Team conventions evolve

Maintain a version history in git commits for traceability.

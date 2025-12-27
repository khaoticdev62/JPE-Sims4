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

**Brand Palette Colors:**
```json
{
  "background-primary": "#151A24",    // Brand Navy - Main background
  "background-secondary": "#1E2633",  // Navy slightly lighter
  "background-tertiary": "#2A3447",   // Navy darkest - Cards
  "background-light": "#F5F7FA",      // Light backgrounds (future light mode)
  "text-primary": "#FFFFFF",          // Main text
  "text-secondary": "#B0B0B0",        // Secondary text
  "text-tertiary": "#777777",         // Tertiary/disabled text
  "accent-primary": "#2EC4B6",        // Brand Teal - Primary action
  "accent-focus": "#26A89B",          // Teal darker - Hover state
  "accent-light": "#E6F8F6",          // Teal light - Backgrounds
  "border-subtle": "#444444",         // Dividers/borders
  "border-light": "#B0B0B0",          // Light borders
  "state-error": "#E12D39",           // Error/destructive (red)
  "state-warning": "#F5A623",         // Warning/caution (amber)
  "state-info": "#2680C2",            // Info/informational (blue)
  "state-success": "#2E8540"          // Success/positive (green)
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

**Brand Colors (Official JPE Brand Palette):**
- Accent Primary: `#2EC4B6` (Brand Teal - Primary actions)
- Accent Focus: `#26A89B` (Teal darker - Hover state)
- Background Primary: `#151A24` (Brand Navy - Main backgrounds)
- Background Secondary: `#1E2633` (Navy lighter)
- Background Tertiary: `#2A3447` (Navy darkest)
- Text Primary: `#FFFFFF` (Main text)
- Text Secondary: `#B0B0B0` (Secondary text)
- Light Background: `#F5F7FA` (Reserved for light mode/documentation)

**Diagnostic Colors (from PRD):**
- Error: `#E12D39` (Destructive, failure)
- Warning: `#F5A623` (Caution, attention needed)
- Info: `#2680C2` (Informational)
- Success: `#2E8540` (Positive, success)

**Border Colors:**
- Subtle: `#444444` (Dividers/borders - dark)
- Light: `#B0B0B0` (Light borders)

**Don't:**
- Mix colors from other brands (especially Sims 4)
- Use Apple TV dark blue (#0A84FF) - this is NOT the brand color
- Hardcode arbitrary colors - always use tokens
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

## Design System Implementation Rules

These rules ensure consistent application of design tokens across all UI components and pages. **These rules are MANDATORY for all UI development.**

### Rule 1: Token-First Development

- **IMPORTANT:** Never hardcode any color values. All colors must use design tokens from `src/design-system/tokens.json`
- **IMPORTANT:** Never hardcode spacing values. Use the 4px-based scale defined in tokens
- **IMPORTANT:** Never hardcode typography values. Use font sizes and weights from tokens

**Implementation:**
```tsx
// ✅ CORRECT - Use tokens
<div className="bg-background-secondary text-text-primary p-4 rounded-lg">
  <h2 className="text-xl font-semibold">Heading</h2>
  <p className="text-base text-text-secondary">Description</p>
</div>

// ❌ WRONG - Hardcoded values
<div style={{ backgroundColor: '#1E2633', padding: '16px' }}>
  Never do this!
</div>
```

### Rule 2: Component Location and Organization

- **IMPORTANT:** All UI components must be in `src/components/`
- **Common/atomic components**: `src/components/common/` (Button, Input, Modal, etc.)
- **Layout components**: `src/components/layout/` (TitleBar, Sidebar, EditorPane, RightPanel)
- **Page components**: `src/components/` root level (StudioHomeDashboard, ProjectsPage, SettingsPage)
- **Modal dialogs**: `src/components/modals/` (NewProjectDialog, OpenProjectDialog, AddFileDialog)
- **Feature-specific**: `src/components/[featureName]/` (e.g., editor/, layout/)

**File structure:**
```
src/components/
├── common/
│   ├── Button.tsx
│   ├── TextInput.tsx
│   └── Modal.tsx
├── layout/
│   ├── TitleBar.tsx
│   ├── Sidebar.tsx
│   ├── EditorPane.tsx
│   └── RightPanel.tsx
├── modals/
│   ├── NewProjectDialog.tsx
│   └── OpenProjectDialog.tsx
├── editor/
│   ├── MonacoEditor.tsx
│   ├── DiagnosticsPanel.tsx
│   └── SearchReplace.tsx
├── StudioHomeDashboard.tsx
├── ProjectsPage.tsx
├── SettingsPage.tsx
└── AppNavigation.tsx
```

### Rule 3: Styling Approach

- **IMPORTANT:** Use Tailwind CSS utility classes for all styling
- **IMPORTANT:** Map Tailwind classes to design tokens: `bg-background-primary`, `text-text-primary`, `border-border-subtle`
- **IMPORTANT:** Accept and use `className` prop in all components for composition
- **IMPORTANT:** Never use inline styles or CSS-in-JS for standard styling

**Implementation:**
```tsx
interface ButtonProps extends HTMLButtonElement {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-accent-primary hover:bg-accent-focus text-text-primary',
    secondary: 'bg-background-secondary hover:bg-background-tertiary text-text-primary',
    danger: 'bg-state-error hover:opacity-90 text-text-primary'
  }

  const sizes = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  return (
    <button
      className={`
        rounded-lg transition-colors
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    />
  )
}
```

### Rule 4: Color Usage Guide

**Background Colors:**
- `bg-background-primary` - Main app backgrounds (#151A24)
- `bg-background-secondary` - Secondary panels, headers (#1E2633)
- `bg-background-tertiary` - Card backgrounds, tertiary panels (#2A3447)
- `bg-background-light` - Light mode backgrounds (future use)

**Text Colors:**
- `text-text-primary` - Main readable text (#FFFFFF)
- `text-text-secondary` - Secondary/metadata text (#B0B0B0)
- `text-text-tertiary` - Disabled/faint text (#777777)

**Accent Colors (Primary Actions):**
- `bg-accent-primary` / `text-accent-primary` - Primary CTA, highlights (#2EC4B6 brand teal)
- `hover:bg-accent-focus` - Hover state for accent elements (#26A89B)
- `bg-accent-light` - Light accent backgrounds (#E6F8F6)

**Diagnostic State Colors:**
- `bg-state-error` / `text-state-error` - Errors, failures (#E12D39 red)
- `bg-state-warning` / `text-state-warning` - Warnings, caution (#F5A623 amber)
- `bg-state-info` / `text-state-info` - Info messages (#2680C2 blue)
- `bg-state-success` / `text-state-success` - Success, completion (#2E8540 green)

**Border Colors:**
- `border-border-subtle` - Main borders, dividers (#444444)
- `border-border-light` - Light borders (#B0B0B0)

### Rule 5: State-Based Component Styling

All interactive components must support multiple states with proper styling:

**Button States:**
```tsx
// Active/focused state
.hover:bg-accent-focus

// Disabled state
.disabled:opacity-50 .disabled:cursor-not-allowed

// Loading state
.disabled:opacity-75 // Show loading indicator
```

**Input Field States:**
```tsx
// Focus state
.focus:border-accent-primary .focus:ring-1 .focus:ring-accent-primary

// Error state
.border-state-error .bg-state-error/10

// Success state
.border-state-success
```

### Rule 6: Component Composition Pattern

Every component must:
1. Accept a `className` prop for composition
2. Use consistent prop naming (follow TypeScript conventions)
3. Support `ref` forwarding where applicable
4. Include TypeScript interfaces for props
5. Default to sensible values

**Example Pattern:**
```tsx
import { forwardRef, HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated'
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          bg-background-secondary
          border border-border-subtle
          rounded-lg
          ${variant === 'elevated' && 'shadow-lg'}
          ${className}
        `}
        {...props}
      />
    )
  }
)

Card.displayName = 'Card'
export default Card
```

### Rule 7: Page and View Components

All page components (Dashboard, Projects, Settings, Editor) must:
- Include AppNavigation sidebar for navigation
- Use consistent header styling (page title + description)
- Apply brand navy background (`bg-background-primary`)
- Structure content with consistent spacing using token scale
- Implement responsive grid layouts

**Page Template:**
```tsx
import { useState } from 'react'
import { AppNavigation } from '@/components/AppNavigation'

export function MyPage({ onNavigate }) {
  const [activeNav, setActiveNav] = useState('pageName')

  const handleNavigate = (item: string) => {
    setActiveNav(item)
    onNavigate?.(item)
  }

  return (
    <div className="flex h-screen bg-background-primary">
      <AppNavigation activeItem={activeNav} onNavigate={handleNavigate} />

      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-8 py-8 space-y-10">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-text-primary">Page Title</h1>
            <p className="text-text-secondary">Description</p>
          </div>

          {/* Content sections */}
        </div>
      </div>
    </div>
  )
}
```

### Rule 8: Spacing and Layout

Use the token-based spacing scale consistently:
- `p-2` / `px-2` / `py-2` - 8px padding (use for small components)
- `p-4` / `px-4` / `py-4` - 16px padding (standard spacing)
- `p-6` / `px-6` / `py-6` - 24px padding (larger components)
- `p-8` - 32px padding (major sections)
- `gap-2` / `gap-4` / `gap-6` - Spacing between flex items

**Grid layouts:**
```tsx
// 2-column responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {items.map(item => <Card key={item.id}>{item}</Card>)}
</div>

// 3-column responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id}>{item}</Card>)}
</div>
```

### Rule 9: Diagnostic Components Styling

Components displaying diagnostics (errors, warnings, info) must use state colors:

**Error styling:**
```tsx
<div className="bg-state-error/10 border-l-4 border-state-error p-4 rounded">
  <p className="text-state-error font-semibold">Error Title</p>
  <p className="text-text-secondary text-sm">Error message</p>
</div>
```

**Warning styling:**
```tsx
<div className="bg-state-warning/10 border-l-4 border-state-warning p-4 rounded">
  <p className="text-state-warning font-semibold">Warning Title</p>
</div>
```

### Rule 10: Import Paths and Aliases

- **IMPORTANT:** Always use `@/` path aliases
- Never use relative imports beyond parent directory
- Group imports: React, third-party, internal, types

**Correct patterns:**
```tsx
// ✅ CORRECT
import { useState } from 'react'
import { useProjectStore } from '@/stores/useProjectStore'
import Button from '@/components/common/Button'
import { CompilerService } from '@/services/CompilerService'
import type { Project } from '@/types/index'

// ❌ WRONG - Relative imports
import Button from '../../../components/common/Button'
```

---

## Keeping Rules Updated

Update this file when:
- New component patterns are established
- Design tokens change
- Accessibility requirements are updated
- Project structure changes significantly
- Team conventions evolve

Maintain a version history in git commits for traceability.

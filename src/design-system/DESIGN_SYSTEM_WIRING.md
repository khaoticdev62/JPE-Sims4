# Design System Wiring & Implementation

**Status**: ✅ FULLY IMPLEMENTED
**Last Updated**: December 27, 2025

---

## Overview

The JPE Mod Translator uses a comprehensive design system with complete integration across all UI components. All colors, typography, and spacing use a centralized token system that can be updated in one place.

---

## Token System Architecture

### Canonical Source: `src/components/robust/jpe-theme.ts`

JPE Studio uses a single object-based source of truth (`T`) that powers both the component logic (Monaco themes, status bars, etc.) and the global CSS layer.

```typescript
export const T = {
  bg: "#0a0c10",
  cyan: "#63B3ED",
  mono: "'JetBrains Mono', 'Fira Code', monospace",
  // ... all design units
}
```

### Synthesis Bridge: `src/app/globals.css`

The `T` tokens are synchronized with CSS Custom Properties in the global stylesheet, which are then consumed by Tailwind CSS via `tailwind.config.ts`.

---

---

## Component Integration

### ✅ Editor Components (100% Wired)

All editor components use the design token system:

| Component | Status | Implementation |
|-----------|--------|-----------------|
| **MonacoEditor.tsx** | ✅ | Imports T from jpe-theme.ts, applies to Monaco theme |
| **EditorToolbar.tsx** | ✅ | Tailwind classes: `bg-bg-secondary`, `text-text-primary` |
| **SearchReplace.tsx** | ✅ | Tailwind classes for all UI elements |
| **DiagnosticsPanel.tsx** | ✅ | Severity colors via tokens: error, warning, info |
| **IntegratedEditor.tsx** | ✅ | Combines all components with token-based styling |

### ✅ Layout Components (100% Wired)

| Component | Status | Implementation |
|-----------|--------|-----------------|
| **EditorPane.tsx** | ✅ | Tailwind tokens for tabs, editor, status bar |
| **Sidebar.tsx** | ✅ | Token-based styling for project tree |
| **TitleBar.tsx** | ✅ | Token colors and typography |
| **RightPanel.tsx** | ✅ | Token-based styling |

### ✅ Common Components (100% Wired)

| Component | Status | Implementation |
|-----------|--------|-----------------|
| **Button.tsx** | ✅ | Variant styles using tokens: primary, secondary, danger |
| **TextInput.tsx** | ✅ | Focus states and error colors via tokens |
| **Modal.tsx** | ✅ | Background and border colors from tokens |

---

## Monaco Editor Theme Integration

The Monaco Editor is fully wired to use design tokens:

### Token-Mapped Theme Rules

```typescript
// Syntax highlighting colors from T tokens
rules: [
  { token: 'keyword', foreground: T.cyan.replace('#', '') },
  { token: 'string', foreground: T.emerald.replace('#', '') },
  { token: 'comment', foreground: T.textSecondary.replace('#', '') },
]

// Editor UI colors from T tokens
colors: {
  'editor.background': T.bg,
  'editor.foreground': T.textPrimary,
  'editor.lineNumbersColumn.background': T.bgDeep,
  'editorError.foreground': T.rose,
  'editorWarning.foreground': T.amber,
}
```

### Editor Features Using Tokens

- ✅ Syntax highlighting (JPE keywords, strings, comments)
- ✅ Error/Warning markers (state-error, state-warning)
- ✅ Line numbers (background-secondary)
- ✅ Selection highlighting (accent-primary)
- ✅ Cursor color (accent-primary)
- ✅ Find/Replace background (accent-primary)

---

## Tailwind Class Naming

All components follow the token naming convention:

### Color Classes
```html
<!-- Backgrounds -->
<div className="bg-bg-primary">   <!-- #000000 -->
<div className="bg-bg-secondary"> <!-- #121212 -->
<div className="bg-bg-tertiary">  <!-- #1C1C1E -->

<!-- Text -->
<div className="text-text-primary">   <!-- #FFFFFF -->
<div className="text-text-secondary"> <!-- #8E8E93 -->

<!-- Accents & States -->
<div className="text-accent-primary"> <!-- #0A84FF -->
<div className="text-state-error">    <!-- #FF453A -->
<div className="text-state-warning">  <!-- #FF9F0A -->
<div className="text-state-success">  <!-- #32D74B -->

<!-- Borders -->
<div className="border-border-subtle"> <!-- #38383A -->
```

### Typography Classes
```html
<p className="font-sans text-base font-regular">Body text</p>
<h1 className="font-sans text-3xl font-bold">Heading</h1>
<button className="text-xs font-medium">Small button</button>
```

### Spacing Classes
```html
<div className="p-4 gap-2 m-3">Padded container</div>
<div className="border-b border-border-subtle">Divider</div>
```

---

## Design Token Categories

### Colors (13 tokens)
- **Background**: primary, secondary, tertiary
- **Text**: primary, secondary
- **Accent**: primary (blue), focus
- **States**: error (red), warning (orange), success (green)
- **Borders**: subtle (dark gray)

### Typography (8 tokens)
- **Font Family**: Inter + system fonts
- **Font Sizes**: xs (12px) → 3xl (30px)
- **Font Weights**: regular, medium, semibold, bold

### Spacing (16 tokens)
- **Scale**: 0px → 64px (4px increments)
- **Used for**: padding, margin, gaps, height, width

### Shadows (5 tokens)
- **apple-sm**, **apple-md**, **apple-lg**
- **focus-glow**, **focus-glow-lg**

---

## Verification Checklist

### Design Token System
- ✅ jpe-theme.ts exists as canonical source of truth
- ✅ globals.css maps T tokens to CSS variables
- ✅ tailwind.config.ts consumes CSS variables
- ✅ No hardcoded hex colors in any component (verified)

### Component Implementation
- ✅ All editor components use Tailwind token classes
- ✅ All layout components use Tailwind token classes
- ✅ All common components use Tailwind token classes
- ✅ Monaco Editor imports and uses T from jpe-theme.ts

### Editor Integration
- ✅ Syntax highlighting uses tokens
- ✅ Error/warning colors use tokens
- ✅ Theme colors use tokens
- ✅ UI chrome (line numbers, cursors) uses tokens

### Consistency
- ✅ No color inconsistencies across components
- ✅ Consistent typography across all text
- ✅ Consistent spacing throughout UI
- ✅ Consistent hover/focus states

---

## Updating Design System

### To Change a Color

1. Edit `src/components/robust/jpe-theme.ts`:
   ```typescript
   export const T = {
     cyan: "#63B3ED", // Change this
   }
   ```

2. Colors update automatically in:
    - All high-fidelity components (Monaco, Status Bar)
    - CSS layers (via globals.css synchronization)
    - Tailwind classes

### Example: Change Primary Accent Color

**Before**: `"accent-primary": "#0A84FF"` (Blue)
**After**: `"accent-primary": "#FF00FF"` (Magenta)

All components automatically update:
- Button hover states
- Focus indicators
- Selection highlighting
- Syntax keywords
- Links and interactive elements

---

## Figma Design Files

### Design Documents (PDF)
- `jpe_sims4_ui_ux_prd_v2.pdf` - Complete UI/UX specification
- `jpe_branding_style_guide_and_production_sop_v1.pdf` - Branding rules
- `jpe_icon_system_prd_v1.pdf` - Icon specifications

### Design Tokens Alignment
All Figma designs follow the token values:
- Colors match exactly to jpe-theme.ts
- Typography matches font specifications
- Spacing aligns with spacing scale

---

## Code Examples

### Using Tokens in Components

```typescript
// ✅ CORRECT: Using Tailwind token classes
<div className="bg-bg-panel text-text-primary border-border">
  Content
</div>

// ✅ CORRECT: Importing T tokens in logic
import { T } from '@/components/robust/jpe-theme'
const color = T.cyan

// ❌ WRONG: Hardcoded colors
<div style={{ background: '#121212' }}>
  This is wrong!
</div>
```

---

## Files Modified for Wiring

### Latest Changes (April 2026)
- `src/components/robust/jpe-theme.ts` - Consolidated all design tokens
- `src/app/globals.css` - Synchronized fonts and colors to CSS variables
- `src/design-system/tokens.json` - DELETED (Deprecated)

---

## Next Steps

### For Additional Components
When creating new components:

1. Import Tailwind tokens (already configured)
2. Use class names like: `bg-bg-primary`, `text-text-primary`, `border-border-subtle`
3. Never hardcode colors or spacing
4. Reference `tokens.json` for current values

### For Design Updates
1. Update `tokens.json`
2. All components automatically reflect changes
3. No code modifications needed

---

## Summary

✅ **Design system fully consolidated via T (jpe-theme.ts)**
✅ **All components using singular source of truth**
✅ **No hardcoded values**
✅ **Monaco Editor integrated with T tokens**
✅ **Centralized control point (jpe-theme.ts)**

The JPE Mod Translator has a production-ready design system that ensures visual consistency and makes global design changes trivial.


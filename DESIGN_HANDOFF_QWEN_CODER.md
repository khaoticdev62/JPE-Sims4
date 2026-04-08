# JPE Studio — Design Handoff for Qwen Coder

**Document Version:** 1.0  
**Target AI:** Qwen Coder 2.5  
**Last Updated:** April 8, 2026  
**Purpose:** Complete technical specification for AI-assisted code generation and maintenance

---

## Executive Summary

JPE Studio is a professional cyberpunk-themed IDE for **Sims 4 modding** built with React 18, TypeScript, and Tailwind CSS v4. This document provides comprehensive technical specifications for AI code generation tools to maintain consistency with the existing architecture.

**Key Technologies:**
- React 18.3+ with TypeScript 5.x
- Tailwind CSS v4.0 (no config file)
- Motion library (formerly Framer Motion) for animations
- Recharts for data visualization
- React Router v7 for navigation
- Vite as build tool

---

## 1. Project Architecture

### 1.1 File Structure

```
/src
├── app
│   ├── App.tsx                 # Root component (default export required)
│   ├── routes.ts               # React Router configuration
│   ├── components/             # Reusable UI components
│   │   ├── jpe-design-system.tsx     # Core design system components
│   │   ├── jpe-settings-context.tsx  # Global settings provider
│   │   ├── jpe-motion.tsx            # Animation primitives
│   │   ├── jpe-themes.ts             # Theme definitions
│   │   ├── DashboardView.tsx         # Main dashboard
│   │   ├── StringTableManager.tsx    # STBL editor with FNV-32a
│   │   └── [50+ workspace components]
│   └── pages/
│       ├── JPEStudio.tsx       # Main workspace shell
│       ├── jpe-theme.ts        # Design tokens
│       ├── jpe-shared.tsx      # Shared components
│       └── jpe-data.ts         # Mock data structures
├── imports/                    # Figma imports and specs
└── styles/
    ├── index.css               # Global styles
    ├── theme.css               # CSS custom properties
    ├── tailwind.css            # Tailwind directives
    └── fonts.css               # Font imports
```

### 1.2 Design Token System

All components must import and use design tokens from `/src/app/pages/jpe-theme.ts`:

```typescript
import { T } from "../pages/jpe-theme";

// Color tokens
T.bg, T.bgDeep, T.bgPanel, T.bgSurface, T.bgElevated
T.bgHover, T.bgActive, T.bgGlass, T.bgInput
T.border, T.borderSubtle, T.borderActive, T.borderViolet

// Brand colors
T.cyan, T.cyanBright, T.cyanDim, T.cyanDeep
T.violet, T.violetBright, T.violetDim, T.violetDeep
T.emerald, T.rose, T.amber

// Text colors
T.textPrimary, T.textSecondary, T.textTertiary, T.textMuted, T.textDim

// Typography
T.mono, T.sans, T.display

// Effects
T.glassBlur, T.glowCyan, T.glowViolet
```

**Critical Rule:** Never hardcode colors. Always use `T.*` tokens.

---

## 2. Scaling System

### 2.1 Global Font Scaling

JPE Studio implements a **global scaling system (85%–160%)** managed via the `useJpeSettings()` hook:

```typescript
import { useJpeSettings } from "./jpe-settings-context";

function MyComponent() {
  const { settings: { fontScale } } = useJpeSettings();
  
  // Responsive layout based on scale
  const extreme = fontScale >= 1.5;
  const high = fontScale >= 1.3;
  
  // Adjust grid spans
  const columnSpan = extreme ? 12 : high ? 6 : 4;
  
  return (
    <div style={{ gridColumn: `span ${columnSpan}` }}>
      {/* Content */}
    </div>
  );
}
```

### 2.2 Responsive Breakpoints

```typescript
// Font scale thresholds
const extreme = fontScale >= 1.5;  // 150%+
const high = fontScale >= 1.3;     // 130%+
const medium = fontScale >= 1.0;   // 100%+
const low = fontScale < 0.9;       // Below 90%

// Layout adjustments
const columns = extreme ? 1 : high ? 2 : 3;
const gap = extreme ? 3 : 2;
const padding = extreme ? 6 : 4;
```

---

## 3. Animation System

### 3.1 Motion Library Setup

**Import Statement:**
```typescript
import { motion, AnimatePresence, easing, duration as dur } from "./jpe-motion";
```

**Never use:** `framer-motion` package (deprecated in this project)

### 3.2 Standard Animation Patterns

#### Fade In Entrance
```typescript
<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: dur.normal, ease: easing.outStandard }}
>
  {content}
</motion.div>
```

#### Staggered Lists
```typescript
import { StaggerList, StaggerItem } from "./jpe-motion";

<StaggerList>
  {items.map((item, i) => (
    <StaggerItem key={i}>
      {item.content}
    </StaggerItem>
  ))}
</StaggerList>
```

#### Interactive Buttons
```typescript
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.97 }}
  transition={{ duration: dur.fast }}
>
  Click me
</motion.button>
```

### 3.3 Duration Constants
```typescript
dur.fast    // 120ms - micro-interactions
dur.normal  // 200ms - standard transitions
dur.complex // 350ms - complex animations
```

### 3.4 Easing Functions
```typescript
easing.outStandard   // Standard ease-out
easing.inOutStandard // In-out cubic
easing.spring        // Spring physics
```

---

## 4. Component Development Guidelines

### 4.1 Component Template

```typescript
import { motion } from "./jpe-motion";
import { T } from "../pages/jpe-theme";
import { useJpeSettings } from "./jpe-settings-context";

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  const { settings: { fontScale } } = useJpeSettings();
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-xl overflow-hidden"
      style={{
        background: T.bgGlass,
        border: `1px solid ${T.border}`,
      }}
    >
      <div 
        className="px-4 py-2.5 flex items-center gap-2"
        style={{ borderBottom: `1px solid ${T.border}` }}
      >
        <h3 style={{ 
          fontSize: 13, 
          fontWeight: 700, 
          color: T.textPrimary,
          fontFamily: T.sans 
        }}>
          {title}
        </h3>
      </div>
      
      <div className="p-4">
        {/* Content */}
      </div>
    </motion.div>
  );
}
```

### 4.2 Styling Rules

**✅ DO:**
- Use inline styles for colors via `T.*` tokens
- Use Tailwind for layout, spacing, flexbox/grid
- Use `className` for utility classes
- Apply `fontFamily: T.mono` for code/numbers
- Apply `fontFamily: T.display` for headings

**❌ DON'T:**
- Use Tailwind text-color classes (text-blue-500)
- Use Tailwind font-size classes (text-xl, text-2xl)
- Use Tailwind font-weight classes (font-bold, font-semibold)
- Hardcode hex colors directly
- Create `tailwind.config.js` (using v4)

### 4.3 Typography System

```typescript
// Headings
<h1 style={{ 
  fontSize: 20, 
  fontWeight: 800, 
  fontFamily: T.display, 
  color: T.textPrimary 
}}>

// Body text
<p style={{ 
  fontSize: 12, 
  color: T.textSecondary 
}}>

// Labels (uppercase)
<span style={{ 
  fontSize: 10, 
  color: T.textMuted, 
  letterSpacing: "0.1em", 
  textTransform: "uppercase" as const 
}}>

// Code/Monospace
<code style={{ 
  fontSize: 11, 
  fontFamily: T.mono, 
  color: T.cyan 
}}>
```

---

## 5. Sims 4 Modding Context

### 5.1 Core Modding Concepts

JPE Studio specializes in:

1. **String Table Management (STBL)**
   - Binary format with FNV-32a hashing
   - Multi-locale support (en_US, ja_JP, de_DE, etc.)
   - Hash collision detection

2. **XML Tuning Files**
   - Game object definitions (traits, buffs, CAS parts)
   - Schema validation against game builds
   - Instance ID management (e.g., `S4_034AEECB`)

3. **Python Script Injection**
   - `.ts4script` file format
   - Game event hooks
   - Custom behavior injection

4. **Package Building (DBPF)**
   - `.package` file creation
   - Resource compression
   - Conflict detection with other mods

5. **Game Build Compatibility**
   - SDK version tracking (e.g., 1.108.329.1030)
   - API reference documentation
   - Breaking change detection

### 5.2 File Type Conventions

```typescript
// Recognized Sims 4 file extensions
const SIMS4_EXTENSIONS = [
  ".stbl",        // String tables
  ".xml",         // Tuning files
  ".ts4script",   // Python scripts
  ".package",     // Compiled mods
  ".json",        // Configuration
];

// Instance ID pattern
const INSTANCE_ID_PATTERN = /S4_[0-9A-F]{8}/;

// Example filenames
"S4_034AEECB_trait_Evil.xml"
"buff_Confident_00B2CEEB.xml"
"en_US.stbl"
"mod_injector.ts4script"
```

### 5.3 FNV-32a Hash Algorithm

```typescript
function fnv32a(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0; // Convert to unsigned 32-bit
}

// Usage in string tables
const stringKey = "trait_evil_display_name";
const hash = fnv32a(stringKey);
// Store hash as key in STBL file
```

---

## 6. Workspace Modes

JPE Studio has **15 distinct workspace modes**:

```typescript
type WorkspaceMode = 
  | "dashboard"   // Main overview
  | "code"        // XML/Python editor
  | "translation" // Multi-locale AI translation
  | "jpe"         // String table manager
  | "depgraph"    // Dependency visualization
  | "conflicts"   // Mod conflict resolver
  | "build"       // Package export wizard
  | "library"     // Mod library browser
  | "plugin"      // Extension management
  | "debug"       // Game testing/debugging
  | "datavis"     // Analytics dashboard
  | "ai"          // AI assistant
  | "settings"    // Configuration
  | "vault"       // Asset library
  | "diff";       // File comparison
```

### 6.1 Mode Navigation

```typescript
function handleModeChange(mode: WorkspaceMode) {
  // Update UI state
  setCurrentMode(mode);
  
  // Optional: Save to localStorage
  localStorage.setItem("jpe-last-mode", mode);
  
  // Show notification
  toast.success(`Switched to ${mode} mode`);
}
```

---

## 7. Keyboard Shortcuts

### 7.1 Global Shortcuts

```typescript
const SHORTCUTS = {
  "Ctrl+K": "Command Palette",
  "Ctrl+P": "Quick File Open",
  "Ctrl+S": "Save File",
  "Ctrl+B": "Build Package",
  "Ctrl+T": "AI Translation",
  "Ctrl+/": "Toggle Comments",
  "Ctrl+Shift+F": "Global Search",
  "Ctrl+1-9": "Switch Workspace Mode",
  "F5": "Run/Debug Mod",
  "F9": "Test in Sims 4",
};
```

### 7.2 Implementation Pattern

```typescript
import { useEffect } from "react";

function useKeyboardShortcut(key: string, callback: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === key && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        callback();
      }
    };
    
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [key, callback]);
}
```

---

## 8. Data Structures

### 8.1 Project Configuration

```typescript
interface JpeProject {
  id: string;
  name: string;
  path: string;
  type: "trait" | "buff" | "cas" | "script" | "mixed";
  gameVersion: string;
  locales: string[];
  metadata: {
    author: string;
    description: string;
    version: string;
    conflicts: string[];
  };
}
```

### 8.2 String Table Entry

```typescript
interface StblEntry {
  hash: number;           // FNV-32a hash
  key: string;            // Human-readable key
  value: string;          // Translated text
  locale: string;         // e.g., "en_US"
  status: "translated" | "pending" | "review";
  confidence?: number;    // AI translation confidence (0-100)
}
```

### 8.3 Mod Conflict

```typescript
interface ModConflict {
  id: string;
  type: "tuning" | "script" | "resource";
  instanceId: string;
  files: {
    ours: string;
    theirs: string;
    modName: string;
  };
  severity: "critical" | "warning" | "info";
  resolved: boolean;
}
```

---

## 9. AI Integration

### 9.1 Translation Workflow

```typescript
interface TranslationRequest {
  sourceLocale: string;
  targetLocales: string[];
  entries: StblEntry[];
  context: "trait" | "buff" | "dialog" | "ui";
}

interface TranslationResult {
  locale: string;
  translations: {
    key: string;
    value: string;
    confidence: number;
    alternatives?: string[];
  }[];
}
```

### 9.2 AI Assistant Context

When generating code for the AI assistant component:
- Provide Sims 4 modding documentation context
- Support questions about XML schema, tuning, Python API
- Suggest code templates for common mod types
- Explain game build compatibility issues

---

## 10. Performance Optimization

### 10.1 Chart Rendering

Always wrap Recharts components in `SafeChartContainer`:

```typescript
import { SafeChartContainer } from "./SafeChartContainer";

<SafeChartContainer>
  <AreaChart data={data} accessibilityLayer={false}>
    {/* Chart content */}
  </AreaChart>
</SafeChartContainer>
```

### 10.2 Large List Virtualization

For file lists with 1000+ items, consider virtualization:

```typescript
import { useVirtualizer } from "@tanstack/react-virtual";

function FileList({ files }: { files: string[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: files.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 32,
  });
  
  return (
    <div ref={parentRef} style={{ height: "400px", overflow: "auto" }}>
      {virtualizer.getVirtualItems().map(item => (
        <div key={item.key} style={{ height: item.size }}>
          {files[item.index]}
        </div>
      ))}
    </div>
  );
}
```

---

## 11. Error Handling

### 11.1 Toast Notifications

```typescript
import { toast } from "sonner";

// Success
toast.success("Package built successfully");

// Error
toast.error("FNV-32a hash collision detected");

// Warning
toast.warning("Translation confidence below 70%");

// Info
toast.info("Game build SDK updated");

// Custom duration
toast.success("Build complete", { duration: 5000 });
```

### 11.2 Error Boundaries

Wrap major sections in error boundaries:

```typescript
import { ErrorBoundary } from "./components/ErrorBoundary";

<ErrorBoundary>
  <DashboardView />
</ErrorBoundary>
```

---

## 12. Testing Considerations

### 12.1 Mock Data

Always use deterministic mock data for demos:

```typescript
// ✅ Good: Seeded randomness
const data = Array.from({ length: 30 }, (_, i) => ({
  value: 50 + Math.sin(i * 0.4) * 10
}));

// ❌ Bad: Pure randomness (changes every render)
const data = Array.from({ length: 30 }, () => ({
  value: Math.random() * 100
}));
```

### 12.2 Accessibility

- Use semantic HTML (`<button>`, `<nav>`, `<main>`)
- Provide `aria-label` for icon-only buttons
- Ensure keyboard navigation with `tabIndex`
- Maintain 4.5:1 contrast ratio (already met by theme tokens)

---

## 13. Build & Deployment

### 13.1 Package Installation

Before using any external package:

1. Check `package.json` if already installed
2. If not installed, use `install_package` tool
3. Then import and use

Example workflow:
```typescript
// 1. Check package.json
// 2. If missing, install:
// install_package(["@tanstack/react-virtual"])
// 3. Import:
import { useVirtualizer } from "@tanstack/react-virtual";
```

### 13.2 Import Paths

```typescript
// Components
import { MyComponent } from "./components/MyComponent";

// Pages
import { JPEStudio } from "./pages/JPEStudio";

// Tokens
import { T } from "./pages/jpe-theme";

// Design system
import { JpeButton } from "./components/jpe-design-system";

// Icons (from lucide-react)
import { Code2, Sparkles } from "lucide-react";
```

---

## 14. Common Patterns

### 14.1 Panel Header

```typescript
<div 
  className="px-4 py-2.5 flex items-center justify-between"
  style={{ 
    background: T.bgPanel, 
    borderBottom: `1px solid ${T.border}` 
  }}
>
  <div className="flex items-center gap-2">
    <Icon size={13} color={T.cyan} />
    <span style={{ 
      fontSize: 11, 
      fontWeight: 700, 
      color: T.textPrimary,
      letterSpacing: "0.1em",
      textTransform: "uppercase" as const
    }}>
      SECTION TITLE
    </span>
  </div>
  <button onClick={onAction} className="px-2 py-1 rounded hover:bg-white/5">
    <span style={{ fontSize: 10, color: T.cyan }}>Action</span>
  </button>
</div>
```

### 14.2 Status Badge

```typescript
<div 
  className="inline-flex items-center gap-1.5 px-2 py-1 rounded"
  style={{ 
    background: `${T.emerald}15`, 
    border: `1px solid ${T.emerald}30` 
  }}
>
  <div 
    className="w-1.5 h-1.5 rounded-full" 
    style={{ background: T.emerald }} 
  />
  <span style={{ fontSize: 10, color: T.emerald }}>Active</span>
</div>
```

### 14.3 Progress Bar

```typescript
<div className="w-full h-2 rounded-full overflow-hidden" style={{ background: T.bgSurface }}>
  <motion.div
    className="h-full rounded-full"
    style={{ background: T.cyan }}
    initial={{ width: 0 }}
    animate={{ width: `${percentage}%` }}
    transition={{ duration: dur.complex, ease: easing.outStandard }}
  />
</div>
```

---

## 15. Code Generation Checklist

When generating new components for JPE Studio:

- [ ] Import `T` from `jpe-theme.ts`
- [ ] Import `motion` from `jpe-motion.tsx`
- [ ] Use `useJpeSettings()` for fontScale
- [ ] Apply inline styles for colors (not Tailwind classes)
- [ ] Use `fontFamily: T.mono` for code/numbers
- [ ] Use `fontFamily: T.display` for headings
- [ ] Implement responsive scaling (extreme/high/medium)
- [ ] Add enter animations with `motion.div`
- [ ] Use staggered lists for multiple items
- [ ] Provide TypeScript types for all props
- [ ] Export as named function (not default unless App.tsx)
- [ ] Include hover states for interactive elements
- [ ] Add accessibility attributes (aria-label)
- [ ] Use `toast` for user feedback
- [ ] Wrap charts in `SafeChartContainer`
- [ ] Use Sims 4-specific terminology where applicable

---

## 16. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-04-08 | Initial design handoff documentation |

---

## 17. Contact & Support

For questions about this specification:
- Refer to existing codebase patterns
- Check `/src/imports/jpe-design-system-spec.md`
- Review component implementations in `/src/app/components/`

**End of Design Handoff Document**

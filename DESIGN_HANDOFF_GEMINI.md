# JPE Studio — Design Handoff for Gemini AI

**Document Version:** 2.1 (Industrial Phase 3)
**Target AI:** Google Gemini 2.0 / Gemini Pro
**Last Updated:** April 8, 2026
**Purpose:** Comprehensive design system and context documentation for natural language code generation

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Visual Design Language](#2-visual-design-language)
3. [Component Library](#3-component-library)
4. [Animation Principles](#4-animation-principles)
5. [The 'Ignition' Module](#5-the-ignition-module)
6. [Sims 4 Modding Domain](#6-sims-4-modding-domain)
6. [User Workflows](#6-user-workflows)
7. [Technical Architecture](#7-technical-architecture)
8. [Natural Language Patterns](#8-natural-language-patterns)
9. [Code Generation Guidelines](#9-code-generation-guidelines)
10. [Quality Assurance](#10-quality-assurance)

---

## 1. Project Overview

### 1.1 What is JPE Studio?

JPE Studio is a **professional-grade IDE for The Sims 4 modding** with a cinematic cyberpunk aesthetic. It empowers mod creators to:

- **Edit XML tuning files** for game objects (traits, buffs, CAS parts, interactions)
- **Manage string tables (.stbl)** with FNV-32a hashing for multi-language support
- **Write Python scripts** for game behavior injection
- **Build and package mods** into .package files (DBPF format)
- **Detect conflicts** between mods automatically
- **Use AI assistance** for translation and code generation
- **Test mods** directly within the Sims 4 game environment

### 1.2 Target Audience

- **Intermediate to advanced Sims 4 modders** who understand XML, Python basics
- **Content creators** building custom traits, buffs, careers, aspirations
- **Translation teams** localizing mods for international audiences
- **Tool developers** building extensions via the plugin system

### 1.3 Design Philosophy

**Cinematic Cyberpunk Aesthetic:**
- Dark backgrounds with high contrast text (#E2E8F0 on #0a0c10)
- Neon accent colors: cyan (#63B3ED) and violet (#8B5CF6)
- Glass morphism effects with backdrop blur
- Animated transitions for every interaction
- Modular panel-based layouts

**Accessibility First:**
- Global font scaling 85%-160%
- Keyboard shortcuts for all actions
- High contrast ratios (WCAG AA compliant)
- Screen reader support

**Performance Optimized:**
- Lazy loading for heavy components
- Virtualized lists for large file trees
- Debounced search and filtering
- Optimized chart rendering

---

## 2. Visual Design Language

### 2.1 Color Palette

**Background Layers (darkest to lightest):**
```
bgDeep:     #070810  → Outermost container, full-screen backgrounds
bg:         #0a0c10  → Standard background
bgPanel:    #0f1116  → Panel headers, navigation bars
bgSurface:  #13151c  → Card backgrounds, main content areas
bgElevated: #181b24  → Elevated panels, modals
bgHover:    #1b1f2a  → Hover states
bgActive:   #1f2330  → Active/pressed states
bgGlass:    rgba(15,17,22,0.88) → Glass morphism overlays
bgInput:    #0d0f15  → Input field backgrounds
```

**Brand Colors:**
```
Cyan Family (primary accent):
  cyan:       #63B3ED  → Standard cyan
  cyanBright: #90CDF4  → Highlighted states
  cyanDeep:   #4299E1  → Darker variant
  cyanDim:    rgba(99,179,237,0.12) → Subtle backgrounds

Violet Family (secondary accent):
  violet:       #8B5CF6  → Standard violet
  violetBright: #A78BFA  → Highlighted states
  violetDeep:   #7C3AED  → Darker variant
  violetDim:    rgba(139,92,246,0.12) → Subtle backgrounds

Semantic Colors:
  emerald:    #48BB78  → Success, valid states
  rose:       #FC8181  → Errors, conflicts
  amber:      #F6AD55  → Warnings, pending states
```

**Text Hierarchy:**
```
textPrimary:   #E2E8F0  → Headlines, primary content
textSecondary: #A0AEC0  → Body text, labels
textTertiary:  #718096  → Metadata, timestamps
textMuted:     #4A5568  → Disabled states, placeholders
textDim:       #2D3748  → Ultra-subtle dividers, shadows
```

**Borders & Effects:**
```
border:        rgba(255,255,255,0.06)  → Standard borders
borderSubtle:  rgba(255,255,255,0.03)  → Nearly invisible dividers
borderActive:  rgba(99,179,237,0.4)    → Active element borders
borderViolet:  rgba(139,92,246,0.35)   → Violet element borders

glassBlur:     blur(24px)              → Backdrop filter
glowCyan:      0 0 20px rgba(99,179,237,0.15)
glowViolet:    0 0 20px rgba(139,92,246,0.15)
```

### 2.2 Typography

JPE Studio utilizes a centralized typography system (`T.sans`, `T.display`, `T.mono`) loaded via unified Google Fonts in `layout.tsx`.

**Font Families (Canonical):**
```typescript
import { T } from "@/components/robust/jpe-theme";

T.display: "'Outfit', 'Inter', system-ui, sans-serif"
  → Used for: Page headers, dashboard hero text
  → Weights: 300, 400, 500, 600, 700, 800

T.sans: "'Inter', system-ui, sans-serif"
  → Used for: Most UI text, labels, status bar
  → Weights: 300, 400, 500, 600, 700, 800

T.mono: "'JetBrains Mono', monospace"
  → Used for: Monaco Editor, JPE code snippets
  → Weights: 300, 400, 500, 600, 700, 800
```

**Size Scale (in pixels):**
```
26px → Page titles (Dashboard, Settings)
20px → Section headers (Panel titles in main workspace)
16px → Subheadings, large body text
13px → Standard UI text (buttons, labels)
12px → Body text, descriptions
11px → Small labels, list items
10px → Metadata, tags, timestamps
9px  → Micro-text, breadcrumb separators
```

**Font Weights:**
```
400 → Regular body text
600 → Semi-bold labels
700 → Bold headings, emphasis
800 → Extra-bold titles, hero text
```

**Letter Spacing:**
```
0.1em → Uppercase labels (QUICK ACTIONS, PROJECT HEALTH)
0.05em → Small caps, tags
0em → Default for body text
```

### 2.3 Spacing System

**Padding Scale (Tailwind classes):**
```
p-1  → 4px   (micro spacing, icon padding)
p-2  → 8px   (tight button padding)
p-3  → 12px  (standard card padding)
p-4  → 16px  (comfortable card padding)
p-6  → 24px  (section padding)
p-8  → 32px  (page padding)
```

**Gap Scale (for flexbox/grid):**
```
gap-1  → 4px   (compact icon lists)
gap-2  → 8px   (standard button groups)
gap-3  → 12px  (card grids)
gap-4  → 16px  (section spacing)
gap-6  → 24px  (major section separation)
```

**Border Radius:**
```
rounded      → 4px   (small elements)
rounded-lg   → 8px   (buttons, badges)
rounded-xl   → 12px  (cards, panels)
rounded-2xl  → 16px  (large containers)
rounded-full → 9999px (circles, pills)
```

### 2.4 Layout Patterns

**12-Column Grid System:**
```typescript
// Full width
gridColumn: "span 12"

// Half width
gridColumn: "span 6"

// Third width
gridColumn: "span 4"

// Quarter width
gridColumn: "span 3"

// Responsive (scales with fontScale)
const columnSpan = extreme ? 12 : high ? 6 : 4;
gridColumn: `span ${columnSpan}`
```

**Flex Patterns:**
```typescript
// Horizontal stack with gap
className="flex items-center gap-2"

// Vertical stack
className="flex flex-col gap-4"

// Space between (navbar, header)
className="flex items-center justify-between"

// Centered content
className="flex items-center justify-center"
```

---

## 3. Component Library

### 3.1 Core Components

#### Panel Container
```typescript
<div 
  className="rounded-xl overflow-hidden"
  style={{ 
    background: T.bgGlass, 
    border: `1px solid ${T.border}` 
  }}
>
  <PanelHeader title="Panel Title" icon={Icon} color={T.cyan} />
  <div className="p-4">
    {/* Content */}
  </div>
</div>
```

#### Panel Header
```typescript
<div 
  className="px-4 py-2.5 flex items-center justify-between"
  style={{ borderBottom: `1px solid ${T.border}` }}
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
      TITLE
    </span>
  </div>
</div>
```

#### Action Button (Primary)
```typescript
<motion.button
  className="px-4 py-2 rounded-lg flex items-center gap-2"
  style={{ 
    background: T.cyan, 
    color: "#fff" 
  }}
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.97 }}
  onClick={handleClick}
>
  <Icon size={14} />
  <span style={{ fontSize: 12, fontWeight: 700 }}>Action</span>
</motion.button>
```

#### Action Button (Ghost)
```typescript
<motion.button
  className="px-3 py-1.5 rounded-lg transition-colors"
  style={{ 
    background: `${T.cyan}10`, 
    border: `1px solid ${T.cyan}20`,
    color: T.cyan
  }}
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.97 }}
  onMouseEnter={e => {
    e.currentTarget.style.background = `${T.cyan}20`;
    e.currentTarget.style.borderColor = `${T.cyan}40`;
  }}
  onMouseLeave={e => {
    e.currentTarget.style.background = `${T.cyan}10`;
    e.currentTarget.style.borderColor = `${T.cyan}20`;
  }}
>
  <span style={{ fontSize: 11, fontWeight: 600 }}>Action</span>
</motion.button>
```

#### Status Badge
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
  <span style={{ 
    fontSize: 10, 
    fontWeight: 600, 
    color: T.emerald 
  }}>
    Success
  </span>
</div>
```

#### Progress Bar
```typescript
import { ProgressBar } from "./jpe-shared";

<ProgressBar 
  pct={75} 
  color={T.cyan} 
  height={4} 
/>
```

#### Eyebrow Label (Uppercase Small Text)
```typescript
import { Eyebrow } from "./jpe-shared";

<Eyebrow color={T.textMuted}>SECTION LABEL</Eyebrow>
```

#### Status Dot
```typescript
<div 
  className="w-2 h-2 rounded-full" 
  style={{ background: T.emerald }} 
/>
```

### 3.2 List Components

#### File List Item
```typescript
<button 
  className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-white/5"
  onClick={handleClick}
>
  <FileIcon size={13} color={T.cyan} />
  <span 
    className="flex-1 truncate" 
    style={{ fontSize: 11, color: T.textSecondary }}
  >
    filename.xml
  </span>
  <span style={{ 
    fontSize: 9, 
    fontFamily: T.mono, 
    color: T.textDim 
  }}>
    2m ago
  </span>
</button>
```

#### Activity Log Item
```typescript
<div 
  className="flex items-center gap-3 px-4 py-2.5"
  style={{ background: T.bgDeep }}
>
  <Icon size={12} color={T.emerald} />
  <span 
    className="flex-1" 
    style={{ fontSize: 11, color: T.textSecondary }}
  >
    Build completed successfully
  </span>
  <span style={{ 
    fontSize: 9, 
    fontFamily: T.mono, 
    color: T.textDim 
  }}>
    2m ago
  </span>
</div>
```

### 3.3 Data Visualization

#### Area Chart (Performance Monitor)
```typescript
import { AreaChart, Area, XAxis, YAxis } from "recharts";
import { SafeChartContainer } from "./SafeChartContainer";

<SafeChartContainer>
  <AreaChart data={data} accessibilityLayer={false}>
    <defs>
      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor={T.cyan} stopOpacity={0.12} />
        <stop offset="95%" stopColor={T.cyan} stopOpacity={0} />
      </linearGradient>
    </defs>
    <XAxis dataKey="time" hide />
    <YAxis hide domain={[0, 100]} />
    <Area 
      type="monotone" 
      dataKey="value" 
      stroke={T.cyan} 
      fill="url(#areaGradient)" 
      strokeWidth={1.5} 
      dot={false}
      isAnimationActive={false}
    />
  </AreaChart>
</SafeChartContainer>
```

#### Bar Chart (Locale Coverage)
```typescript
<SafeChartContainer>
  <BarChart data={data} accessibilityLayer={false}>
    <XAxis 
      dataKey="locale" 
      tick={{ fontSize: 9, fill: T.textMuted }} 
      axisLine={false} 
      tickLine={false} 
    />
    <YAxis hide domain={[0, 100]} />
    <Bar 
      dataKey="coverage" 
      radius={[3, 3, 0, 0]} 
      fill={T.violet}
      isAnimationActive={false}
    />
  </BarChart>
</SafeChartContainer>
```

---

## 4. Animation Principles

### 4.1 Motion Philosophy

**Speed:**
- **Fast (120ms):** Micro-interactions (button press, toggle)
- **Normal (200ms):** Standard transitions (fade in, slide)
- **Complex (350ms):** Complex multi-property animations

**Easing:**
- **outStandard:** Most UI transitions (ease-out cubic)
- **inOutStandard:** Two-way animations (expand/collapse)
- **spring:** Playful interactions (not commonly used)

**Reduced Motion:**
- Always respect `prefers-reduced-motion` media query
- Provide instant state changes instead of animations
- Maintain visual feedback without motion

### 4.2 Common Animation Patterns

#### Fade In
```typescript
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: dur.normal }}
>
  {content}
</motion.div>
```

#### Fade In + Slide Up
```typescript
<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: dur.normal, ease: easing.outStandard }}
>
  {content}
</motion.div>
```

#### Scale on Hover
```typescript
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.97 }}
  transition={{ duration: dur.fast }}
>
  Click me
</motion.button>
```

#### Staggered Children
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

#### Conditional Rendering (with exit animation)
```typescript
import { AnimatePresence } from "./jpe-motion";

<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: dur.normal }}
    >
      {content}
    </motion.div>
  )}
</AnimatePresence>
```

### 4.3 Animation Delays

For sequential reveals (dashboard cards):
```typescript
<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ 
    duration: dur.normal, 
    delay: 0.1 + index * 0.05 
  }}
>
  {content}
</motion.div>
```

---

## 5. Sims 4 Modding Domain

### 5.1 Core Concepts

**String Tables (.stbl files):**
- Binary files containing localized text strings
- Each string has a FNV-32a hash as its key
- Format: `[hash: uint32][length: byte][text: utf8]`
- Locales follow ISO format: `en_US`, `ja_JP`, `de_DE`, etc.
- Used for: UI text, trait/buff names, dialog, notifications

**XML Tuning Files:**
- Define game objects and their behaviors
- Types:
  - **Traits:** Personality attributes (e.g., Evil, Romantic)
  - **Buffs:** Temporary mood effects (e.g., Confident, Sad)
  - **CAS Parts:** Create-a-Sim items (clothing, hair, accessories)
  - **Interactions:** Social/object interactions
  - **Careers/Aspirations:** Life goals and jobs
- Instance IDs: Unique 32-bit identifiers (e.g., `S4_034AEECB`)
- Schema validated against game build versions

**Python Scripts (.ts4script):**
- Injected into game runtime
- Hook into game events (Sim interactions, time progression)
- Written in Python 3.7 (game's embedded interpreter)
- Compiled into `.ts4script` packages
- Used for: Complex behaviors, custom systems, debugging

**Package Files (.package):**
- DBPF (Database Packed File) format
- Contains: Tuning XML, string tables, Python scripts, 3D models, textures
- Built by compression tools
- Installed in `Mods` folder
- Can override base game files (causes conflicts)

**Game Builds:**
- EA releases patches regularly (e.g., 1.108.329.1030)
- Each build may change XML schemas, Python APIs
- Mods must track compatible game versions
- Breaking changes require mod updates

### 5.2 FNV-32a Hashing

**Algorithm:**
```
1. Initialize hash = 0x811c9dc5 (FNV offset basis)
2. For each byte in string:
   a. hash = hash XOR byte
   b. hash = hash * 0x01000193 (FNV prime)
3. Return unsigned 32-bit integer
```

**Example:**
```
Input:  "trait_evil_display_name"
Output: 0x034AEECB (54423243 decimal)
```

**Collisions:**
- Rare but possible with large string tables
- JPE Studio detects and warns about collisions
- Solution: Rename conflicting keys

### 5.3 Common Mod Types

**Trait Mods:**
- Add new personality traits to Create-a-Sim
- Define buffs, commodity changes, behavioral adjustments
- Example: "Evil" trait makes Sims enjoy mean interactions

**Override Mods:**
- Replace base game files with modified versions
- High conflict potential
- Used to fix bugs or rebalance gameplay

**Script Mods:**
- Complex custom systems (new career paths, relationship mechanics)
- Require Python knowledge
- More fragile across game updates

**CAS CC (Custom Content):**
- New clothing, hair, makeup, accessories
- Usually safe (low conflict risk)
- Requires 3D modeling skills

### 5.4 Conflict Types

**Tuning Conflicts:**
- Two mods override the same instance ID
- Example: Both modify "trait_Evil"
- Solution: Merge XML files or choose one mod

**Script Conflicts:**
- Two mods inject conflicting Python code
- Harder to detect automatically
- Solution: Manual code review, compatibility patches

**Resource Conflicts:**
- Two mods provide different versions of same texture/model
- Game loads one randomly
- Solution: Rename resources with unique identifiers

### 5.5 Localization Workflow

1. **Extract strings** from XML tuning files
2. **Generate STBL entries** with FNV-32a hashes
3. **Translate** to target locales (en_US → ja_JP, de_DE, etc.)
4. **Use AI assistance** for initial translations
5. **Review translations** for context accuracy
6. **Export STBL files** for each locale
7. **Package** into .package file

---

## 6. User Workflows

### 6.1 Creating a New Mod

1. **Dashboard → Quick Actions → "Mod Templates"**
2. Select mod type: Trait / Buff / CAS / Script
3. Fill wizard form:
   - Mod name, author, description
   - Instance ID (auto-generated or custom)
   - Base game build version
4. Generate XML template and folder structure
5. **Switch to Code workspace** to edit XML
6. **Switch to String Table Manager** to add localized text
7. **Build Package** when ready to test
8. **Test in Game** via Debug workspace

### 6.2 Translating a Mod

1. **Dashboard → Quick Actions → "Translate Mods"**
2. Select target locales (ja_JP, de_DE, fr_FR, etc.)
3. AI scans XML files for text references
4. AI generates translations with confidence scores
5. User reviews translations in table view
6. Edit translations with low confidence (<70%)
7. **Export STBL files** for each locale
8. **Build Package** with all locales included

### 6.3 Resolving Conflicts

1. **Dashboard → Project Health** shows conflict count
2. **Quick Actions → "Scan Conflicts"** for detailed analysis
3. View conflict list with severity indicators
4. Select conflict → Open Conflict Resolution Wizard
5. See side-by-side diff of conflicting files
6. Choose resolution:
   - Keep ours
   - Keep theirs
   - Manual merge
7. Save merged file
8. Re-scan to verify resolution

### 6.4 Building and Packaging

1. **Dashboard → Quick Actions → "Build Package"**
2. Package Export Wizard opens
3. Configure:
   - Output filename
   - Included locales
   - Compression level
   - Metadata (author, version, description)
4. Validate:
   - Schema validation
   - Hash collision check
   - Conflict scan
5. Click "Build Package"
6. Download `.package` file
7. Copy to `Documents/Electronic Arts/The Sims 4/Mods/`
8. Test in game

---

## 7. Technical Architecture

### 7.1 Technology Stack

**Frontend:**
- React 19 (RC features used for Logic Graph synthesis)
- Next.js 15 (App Router, Server Actions v2)
- TypeScript 5.8 (Strict Industrial Mode)
- Tailwind CSS v3.4 (Spectral Branding remapped)
- Framer Motion 12.x (Optimized layout animations)

**Build Tools:**
- Next.js / Turbo (Fast Refresh v4)
- PostCSS / Autoprefixer

**Data Visualization & Logic:**
- @xyflow/react (Industrial-grade Logic Graph editor)
- d3-interpolate (Custom-bundled for SSR stability)
- Recharts (Static analytics dashboards)
- React Markdown (AI context rendering)

**Routing:**
- Next.js App Router (dynamic routing, layouts)

**State Management:**
- Zustand (Global UI and Project state)
- Jotai (Atomic state for editors)
- React Context (Theme and Accessibility settings)

**Notifications:**
- Sonner (toast notifications)

**Icons:**
- Lucide React (icon library)

### 7.2 Project Structure

```
/src
├── app/                         # Next.js App Router (15.x)
│   ├── (auth)/                  # Onboarding and auth logic
│   ├── studio/                  # Main IDE workspace
│   │   ├── layout.tsx           # Spectral shell layout
│   │   └── page.tsx             # Workspace entry
│   ├── layout.tsx               # Global root layout
│   ├── page.tsx                 # Landing page (Main Menu)
│   └── globals.css              # Main tailwind entries
├── components/                  # Reusable UI components
│   ├── robust/                  # Industrial-grade primitives
│   │   └── jpe-theme.ts         # SINGLE SOURCE OF TRUTH (T object)
│   ├── jpe-motion.tsx           # Motion wrappers (Framer Motion)
│   ├── spectral/                # High-fidelity Spectral cards/panels
│   ├── sidebar/                 # Project Explorer, AI Assistant
│   ├── robust/                  # Project-hardened components
│   │   └── jpe-theme.ts         # Design tokens (T object)
│   └── editor/                  # Code and Visual editors
├── stores/                      # Zustand and Jotai state stores
│   ├── useUIStore.ts            # Sidebar, navigation state
│   ├── useProjectStore.ts       # File system, XML data
│   └── useAIStore.ts            # AI chat and history
├── services/                    # Domain logic
│   ├── ai/                      # AI provider implementations
│   ├── stbl/                    # FNV-32a and STBL logic
│   └── xml/                     # XML parsing and validation
├── styles/                      # CSS Themes
│   └── theme.css                # JPE Studio design tokens
└── next.config.js               # Next.js configuration
```

### 7.3 State Management (Hardened)

JPE Studio uses a multi-layered state approach:
- **Zustand**: High-frequency UI state (sidebar toggles, active project).
- **Jotai**: Heavy-weight atomic state (file contents, logic graph nodes).
- **React Context**: Infrequently changed global settings (Theme, Font Scale).

Example Zustand usage:
```typescript
import { useUIStore } from "@/stores/useUIStore";

const activeMode = useUIStore(state => state.activeMode);
```

### 7.4 Routing (Next.js 15)

Routing is handled via the Next.js `app` directory. Navigation is performed via the `useRouter` hook or `Link` component.

### 7.5 AI Model SDKs (Spectral Integration)

The IDE integrates three major AI providers for translations and assistance:
- **Google Generative AI**: Primary model for logic synthesis.
- **Anthropic AI**: Preferred for complex Python script generation.
- **OpenAI**: Used for high-speed STBL translation batches.

Integration Pattern:
```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
```

### 7.6 Visual Logic Systems (XYFlow)

Logic nodes are rendered using `@xyflow/react` with a custom Spectral skin. Use the `VisualJpeEditor` to manage draggable node connections.
- **Nodes**: Glassmorphism backgrounds, neon borders.
- **Edges**: Glowing paths representing logic flow.


---

## 8. Natural Language Patterns

### 8.1 Understanding User Requests

When a user asks Gemini to generate code, look for these patterns:

**"Create a dashboard card showing..."**
→ Generate a `FadeIn` wrapped div with panel styling, appropriate icon, and chart/list content

**"Add a button that does X"**
→ Generate `motion.button` with hover/tap animations, proper styling, and onClick handler

**"Make a list of files with..."**
→ Generate `StaggerList` with `StaggerItem` children, each item clickable with file icon

**"Add a status badge for..."**
→ Generate inline-flex div with status dot and colored text

**"Create a panel showing Sims 4..."**
→ Include Sims 4-specific terminology (STBL, DBPF, instance IDs, game builds)

**"Animate the transition when..."**
→ Use `AnimatePresence` with enter/exit animations

### 8.2 Contextual Terminology

**When discussing features, use:**
- "String table" not "translation file"
- "Instance ID" not "unique ID"
- "STBL" not "string table binary"
- "Tuning file" not "config file"
- "Mod package" not "zip file"
- "Game build" not "version"
- "DBPF" not "package format"
- "FNV-32a hash" not "checksum"

**When discussing UI:**
- "Panel" not "container"
- "Workspace mode" not "tab" or "view"
- "Quick action" not "shortcut button"
- "Activity log" not "event history"
- "Project health" not "status overview"

---

## 9. Code Generation Guidelines

### 9.1 Component Generation Checklist

When Gemini generates a new component:

✅ **Imports:**
- [ ] `import { T } from "@/components/robust/jpe-theme";`
- [ ] `import { motion } from "@/components/jpe-motion";`
- [ ] `import { useUIStore } from "@/stores/useUIStore";`
- [ ] Icons from `lucide-react`

✅ **Styling:**
- [ ] Use `T.*` tokens for ALL colors (no hardcoded hex)
- [ ] Use inline `style` objects for colors
- [ ] Use Tailwind classes for layout, spacing, flex/grid
- [ ] NO Tailwind classes for font-size, font-weight, text-color

✅ **Typography:**
- [ ] `fontFamily: T.mono` for code, hashes, numbers
- [ ] `fontFamily: T.display` for large headings
- [ ] `fontFamily: T.sans` for body text
- [ ] Specify `fontSize` in pixels
- [ ] Specify `fontWeight` as numbers (400, 600, 700, 800)

✅ **Animations:**
- [ ] `initial`, `animate`, `transition` on motion elements
- [ ] `whileHover`, `whileTap` on buttons
- [ ] Use `dur.*` constants for duration
- [ ] Use `easing.*` constants for easing

✅ **Responsiveness:**
- [ ] Access `fontScale` from `useJpeSettings()`
- [ ] Define breakpoints (extreme, high, medium)
- [ ] Adjust layout based on breakpoints

✅ **Accessibility:**
- [ ] Semantic HTML (`<button>`, `<nav>`, `<main>`)
- [ ] `aria-label` on icon-only buttons
- [ ] Keyboard support (`onKeyDown`, `tabIndex`)

✅ **TypeScript:**
- [ ] Define props interface
- [ ] Type all function parameters
- [ ] Export as named function

### 9.2 Example: Generate Dashboard Card

**User Request:**
> "Create a dashboard card showing recent Sims 4 XML files with their modification times."

**Gemini Response:**
```typescript
import { motion } from "./jpe-motion";
import { T } from "../pages/jpe-theme";
import { Clock, FileCode } from "lucide-react";
import { StaggerList, StaggerItem, FadeIn, easing, duration as dur } from "./jpe-motion";

interface RecentFile {
  name: string;
  time: string;
  status: "modified" | "ready";
}

const recentFiles: RecentFile[] = [
  { name: "S4_034AEECB_trait_Evil.xml", time: "2m ago", status: "modified" },
  { name: "buff_Confident_00B2CEEB.xml", time: "15m ago", status: "ready" },
  { name: "loot_actions_tuning.xml", time: "1h ago", status: "modified" },
];

export function RecentFilesCard() {
  return (
    <FadeIn 
      delay={0.1} 
      className="rounded-xl overflow-hidden" 
      style={{ 
        background: T.bgGlass, 
        border: `1px solid ${T.border}`,
        gridColumn: "span 4"
      }}
    >
      <div 
        className="px-4 py-2.5 flex items-center gap-2" 
        style={{ borderBottom: `1px solid ${T.border}` }}
      >
        <Clock size={13} color={T.cyan} />
        <span style={{ 
          fontSize: 11, 
          fontWeight: 700, 
          color: T.textPrimary,
          letterSpacing: "0.1em",
          textTransform: "uppercase" as const
        }}>
          RECENT FILES
        </span>
      </div>
      
      <StaggerList className="py-1">
        {recentFiles.map((file, i) => {
          const statusColor = file.status === "modified" ? T.cyan : T.emerald;
          return (
            <StaggerItem key={i}>
              <button 
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-white/5"
              >
                <FileCode size={13} color={T.cyan} />
                <span 
                  className="flex-1 truncate" 
                  style={{ fontSize: 11, color: T.textSecondary }}
                >
                  {file.name}
                </span>
                <div 
                  className="w-1.5 h-1.5 rounded-full" 
                  style={{ background: statusColor }} 
                />
                <span style={{ 
                  fontSize: 9, 
                  fontFamily: T.mono, 
                  color: T.textDim 
                }}>
                  {file.time}
                </span>
              </button>
            </StaggerItem>
          );
        })}
      </StaggerList>
    </FadeIn>
  );
}
```

### 9.3 Example: Generate Interactive Button

**User Request:**
> "Add a button to start AI translation with a sparkles icon."

**Gemini Response:**
```typescript
import { motion } from "@/components/jpe-motion";
import { T } from "@/components/robust/jpe-theme";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { duration as dur } from "./jpe-motion";

function handleTranslate() {
  toast.info("Starting AI translation...");
  // Translation logic here
}

export function TranslateButton() {
  return (
    <motion.button
      className="px-4 py-2 rounded-lg flex items-center gap-2"
      style={{ 
        background: T.violet, 
        color: "#fff" 
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: dur.fast }}
      onClick={handleTranslate}
    >
      <Sparkles size={14} />
      <span style={{ fontSize: 12, fontWeight: 700 }}>
        Translate with AI
      </span>
    </motion.button>
  );
}
```

---

## 10. Quality Assurance

### 10.1 Visual Consistency Checklist

Before submitting generated code:

- [ ] All colors use `T.*` tokens (no hardcoded colors)
- [ ] Text hierarchy matches design (primary/secondary/tertiary)
- [ ] Spacing uses Tailwind classes (gap, padding, margin)
- [ ] Border radius appropriate for element size
- [ ] Icons sized consistently (12-16px for UI)
- [ ] Animations feel smooth (200ms standard)
- [ ] Hover states provide visual feedback
- [ ] Focus states visible for keyboard navigation

### 10.2 Functional Checklist

- [ ] Component compiles without TypeScript errors
- [ ] Props interface defined and used
- [ ] Event handlers defined (no inline anonymous functions in JSX)
- [ ] Key props on list items (unique and stable)
- [ ] Conditional rendering uses `&&` or ternary correctly
- [ ] No memory leaks (useEffect cleanup functions)
- [ ] Mock data realistic (Sims 4 filenames, version numbers)

### 10.3 Accessibility Checklist

- [ ] Keyboard navigable (Tab key moves focus)
- [ ] Focus visible (outline or background change)
- [ ] Semantic HTML (button not div for clickable)
- [ ] Alt text on images (if any)
- [ ] ARIA labels on icon-only buttons
- [ ] Contrast ratio 4.5:1 minimum (theme tokens ensure this)

### 10.4 Sims 4 Domain Accuracy

- [ ] File extensions correct (.stbl, .xml, .ts4script, .package)
- [ ] Instance IDs follow pattern (S4_[8 hex digits])
- [ ] Locale codes valid (en_US, ja_JP, de_DE, fr_FR, ko_KR, zh_CN)
- [ ] Game build versions realistic (1.xxx.xxx.xxxx)
- [ ] Terminology accurate (tuning, DBPF, FNV-32a, buff, trait)

---

## 11. Common Pitfalls to Avoid

### 11.1 Styling Mistakes

❌ **Wrong:**
```typescript
<div className="text-blue-500 text-xl font-bold">
```

✅ **Correct:**
```typescript
<div style={{ fontSize: 20, fontWeight: 700, color: T.cyan }}>
```

---

❌ **Wrong:**
```typescript
<div style={{ background: "#63B3ED" }}>
```

✅ **Correct:**
```typescript
<div style={{ background: T.cyan }}>
```

---

❌ **Wrong:**
```typescript
<h1 className="text-2xl font-extrabold text-white">
```

✅ **Correct:**
```typescript
<h1 style={{ 
  fontSize: 20, 
  fontWeight: 800, 
  fontFamily: T.display, 
  color: T.textPrimary 
}}>
```

### 11.2 Animation Mistakes

❌ **Wrong:**
```typescript
import { motion } from "framer-motion";
```

✅ **Correct:**
```typescript
import { motion } from "./jpe-motion";
```

---

❌ **Wrong:**
```typescript
<motion.div
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
```

✅ **Correct:**
```typescript
import { duration as dur, easing } from "./jpe-motion";

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: dur.normal, ease: easing.outStandard }}
>
```

### 11.3 TypeScript Mistakes

❌ **Wrong:**
```typescript
export default function MyComponent(props: any) {
```

✅ **Correct:**
```typescript
interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export function MyComponent({ title, onAction }: MyComponentProps) {
```

### 11.4 Sims 4 Domain Mistakes

❌ **Wrong terminology:**
> "configuration file", "settings.json", "hash ID"

✅ **Correct terminology:**
> "tuning file", "overrides.json", "instance ID"

---

## 12. Quick Reference

### 12.1 Import Statements

```typescript
// Design tokens
import { T } from "../pages/jpe-theme";

// Animation
import { motion, FadeIn, StaggerList, StaggerItem, easing, duration as dur } from "./jpe-motion";

// Settings
import { useJpeSettings } from "./jpe-settings-context";

// Notifications
import { toast } from "sonner";

// Icons
import { Icon1, Icon2 } from "lucide-react";

// Charts
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis } from "recharts";
import { SafeChartContainer } from "./SafeChartContainer";
```

### 12.2 Common Snippets

**Panel Header:**
```typescript
<div className="px-4 py-2.5 flex items-center gap-2" style={{ borderBottom: `1px solid ${T.border}` }}>
  <Icon size={13} color={T.cyan} />
  <span style={{ fontSize: 11, fontWeight: 700, color: T.textPrimary, letterSpacing: "0.1em", textTransform: "uppercase" as const }}>TITLE</span>
</div>
```

**Primary Button:**
```typescript
<motion.button
  className="px-4 py-2 rounded-lg flex items-center gap-2"
  style={{ background: T.cyan, color: "#fff" }}
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.97 }}
  transition={{ duration: dur.fast }}
  onClick={handleClick}
>
  <Icon size={14} />
  <span style={{ fontSize: 12, fontWeight: 700 }}>Action</span>
</motion.button>
```

**Status Badge:**
```typescript
<div className="inline-flex items-center gap-1.5 px-2 py-1 rounded" style={{ background: `${T.emerald}15`, border: `1px solid ${T.emerald}30` }}>
  <div className="w-1.5 h-1.5 rounded-full" style={{ background: T.emerald }} />
  <span style={{ fontSize: 10, fontWeight: 600, color: T.emerald }}>Status</span>
</div>
```

---

## 13. Conclusion

This design handoff document provides Gemini AI with comprehensive context for generating code that matches JPE Studio's design system, technical architecture, and domain expertise. 

**Key Takeaways:**
1. Always use `T.*` design tokens for colors
2. Import `motion` from `./jpe-motion`, not `framer-motion`
3. Use Sims 4-specific terminology and file patterns
4. Apply animations to all interactive elements
5. Respect the global font scaling system
6. Generate TypeScript with proper types
7. Follow the cyberpunk aesthetic (dark, neon, glass)

**End of Design Handoff Document**

---

**Document Version:** 1.0  
**Last Updated:** April 8, 2026  
**Maintained By:** JPE Studio Development Team

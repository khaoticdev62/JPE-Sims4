# JPE STUDIO — COMPLETE DESIGN SYSTEM FOR AI UI GENERATION
## Cyberpunk-Themed IDE Design System (1:1 Figma Implementation)

---

## 🎯 DESIGN TOKENS — EXACT VALUES REQUIRED

### COLOR PALETTE (MUST USE THESE EXACT HEX VALUES)

#### Background Layers (Dark Charcoal Foundation)
```
--bg:           #0a0c10    (Primary background)
--bg-deep:      #070810    (Deepest layer, code editor)
--bg-panel:     #0f1116    (Panel backgrounds)
--bg-surface:   #13151c    (Surface/elevated cards)
--bg-elevated:  #181b24    (Elevated elements, dropdowns)
--bg-hover:     #1b1f2a    (Hover states)
--bg-active:    #1f2330    (Active/selected states)
--bg-input:     #0d0f15    (Input fields)
--bg-glass:     rgba(15,17,22,0.88)  (Glassmorphism panels)
--bg-glass-hover: rgba(22,25,34,0.92) (Glassmorphism hover)
```

#### Accent Colors (Electric Cyberpunk)
```
--cyan:         #63B3ED    (Primary accent)
--cyan-bright:  #90CDF4    (Bright cyan for text)
--cyan-dim:     rgba(99,179,237,0.12)  (Dimmed backgrounds)
--cyan-deep:    #4299E1    (Deep cyan)
--violet:       #8B5CF6    (Secondary accent)
--violet-bright: #A78BFA   (Bright violet)
--violet-dim:   rgba(139,92,246,0.12)  (Dimmed backgrounds)
--violet-deep:  #7C3AED    (Deep violet)
```

#### Semantic/Status Colors
```
--emerald:      #48BB78    (Success, OK states)
--emerald-dim:  rgba(72,187,120,0.12)
--rose:         #FC8181    (Error, danger states)
--rose-dim:     rgba(252,129,129,0.10)
--amber:        #F6AD55    (Warning states)
--amber-dim:    rgba(246,173,85,0.10)
```

#### Border Colors
```
--border:           rgba(255,255,255,0.06)       (Standard borders)
--border-subtle:    rgba(255,255,255,0.03)       (Subtle dividers)
--border-active:    rgba(99,179,237,0.4)         (Active/focused borders)
--border-violet:    rgba(139,92,246,0.35)        (Violet accent borders)
--border-glow:      rgba(99,179,237,0.2)         (Glow effect borders)
```

#### Text Colors
```
--text-primary:     #E2E8F0    (Primary text)
--text-secondary:   #A0AEC0    (Secondary text, labels)
--text-tertiary:    #718096    (Tertiary text, icons)
--text-muted:       #4A5568    (Muted/disabled text)
--text-dim:         #2D3748    (Very dim text, line numbers)
```

#### Glow Effects
```
--glow-cyan:    0 0 20px rgba(99,179,237,0.15)
--glow-violet:  0 0 20px rgba(139,92,246,0.15)
```

#### Glassmorphism
```
--glass-blur:   blur(24px)
```

---

### TYPOGRAPHY (EXACT FONT STACKS)

#### Font Families
```
--font-sans:    'Inter', system-ui, sans-serif
--font-mono:    'JetBrains Mono', 'Fira Code', monospace
--font-display: 'Outfit', 'Inter', system-ui, sans-serif
```

#### Font Weights
```
--font-light:   300
--font-regular: 400
--font-medium:  500
--font-semibold: 600
--font-bold:    700
--font-extrabold: 800
```

#### Font Sizes (Common Usage)
```
--text-xs:   9px
--text-sm:   10px
--text-base: 11px
--text-md:   12px
--text-lg:   13px
--text-xl:   14px
--text-2xl:  16px
```

#### Letter Spacing
```
--tracking-tight:  0.02em
--tracking-wide:   0.14em  (uppercase labels)
```

---

### SPACING SYSTEM (4px Base Grid)
```
--space-1:  2px
--space-2:  4px
--space-3:  6px
--space-4:  8px
--space-5:  10px
--space-6:  12px
--space-8:  16px
--space-10: 20px
--space-12: 24px
--space-14: 28px
--space-16: 32px
```

---

### BORDER RADIUS
```
--radius-sm:  6px
--radius-md:  8px
--radius-lg:  10px
--radius-xl:  12px
--radius-2xl: 16px
--radius-full: 9999px (circles/pills)
```

---

### SHADOWS & EFFECTS
```
--shadow-sm:    0 2px 8px rgba(0,0,0,0.3)
--shadow-md:    0 4px 16px rgba(0,0,0,0.4)
--shadow-lg:    0 8px 32px rgba(0,0,0,0.5)
--shadow-glow-cyan:    0 0 12px rgba(99,179,237,0.15)
--shadow-glow-violet:  0 0 12px rgba(139,92,246,0.15)
--shadow-glow-cyan-intense: 0 0 20px rgba(99,179,237,0.25)
```

---

### TRANSITIONS
```
--transition-fast:   0.1s ease
--transition-base:   0.2s ease
--transition-slow:   0.3s ease
--transition-slower: 0.5s ease
```

---

## 🧩 COMPONENT LIBRARY — COMPLETE API SPECIFICATIONS

### 1. BUTTON (JpeButton)

**Props:**
- `variant`: "primary" | "secondary" | "ghost" | "danger" | "success" | "icon"
- `size`: "xs" | "sm" | "md" | "lg"
- `icon`: LucideIcon (left icon)
- `iconRight`: LucideIcon (right icon)
- `disabled`: boolean
- `loading`: boolean
- `onClick`: () => void
- `title`: string
- `className`: string
- `children`: ReactNode

**Size Specifications:**
```
xs:  { h: 24px, px: 8px,  fs: 10px, iconSize: 12px }
sm:  { h: 28px, px: 10px, fs: 11px, iconSize: 13px }
md:  { h: 32px, px: 14px, fs: 12px, iconSize: 14px }
lg:  { h: 38px, px: 18px, fs: 13px, iconSize: 16px }
```

**Variant Styles:**
```
primary:
  bg: linear-gradient(135deg, rgba(99,179,237,0.20), rgba(139,92,246,0.15))
  border: 1px solid rgba(99,179,237,0.4)
  color: #90CDF4
  hover: linear-gradient(135deg, rgba(99,179,237,0.30), rgba(139,92,246,0.25))
  glow: 0 0 20px rgba(99,179,237,0.15)

secondary:
  bg: #181b24
  border: 1px solid rgba(255,255,255,0.06)
  color: #A0AEC0
  hover: #1b1f2a

ghost:
  bg: transparent
  border: 1px solid transparent
  color: #718096
  hover: rgba(255,255,255,0.05)

danger:
  bg: rgba(252,129,129,0.12)
  border: 1px solid rgba(252,129,129,0.30)
  color: #FC8181
  hover: rgba(252,129,129,0.20)
  glow: 0 0 12px rgba(252,129,129,0.20)

success:
  bg: rgba(72,187,120,0.12)
  border: 1px solid rgba(72,187,120,0.30)
  color: #48BB78
  hover: rgba(72,187,120,0.20)
  glow: 0 0 12px rgba(72,187,120,0.20)

icon:
  bg: transparent
  border: 1px solid transparent
  color: #718096
  hover: rgba(255,255,255,0.06)
```

**Common Styles:**
```
font-family: 'Inter', system-ui, sans-serif
font-weight: 600
letter-spacing: 0.02em
border-radius: 8px
transition: all 0.2s ease
```

---

### 2. DROPDOWN (JpeDropdown)

**Props:**
- `items`: JpeDropdownItem[]
- `value`: string
- `onChange`: (id: string) => void
- `placeholder`: string (default: "Select...")
- `width`: number (default: 180)
- `size`: "xs" | "sm" | "md" | "lg"

**JpeDropdownItem Interface:**
```typescript
{
  id: string;
  label: string;
  icon?: LucideIcon;
  color?: string;
  disabled?: boolean;
  divider?: boolean;
}
```

**Dropdown Menu Styles:**
```
background: rgba(15,17,22,0.88)
backdrop-filter: blur(24px)
border: 1px solid rgba(255,255,255,0.06)
box-shadow: 0 8px 32px rgba(0,0,0,0.5)
border-radius: 12px
overflow: hidden
```

**Item Hover States:**
```
hover background: rgba(99,179,237,0.10)
selected background: rgba(99,179,237,0.08)
```

---

### 3. FILE TABS (JpeFileTabs)

**Props:**
- `tabs`: JpeFileTab[]
- `activeId`: string
- `onSelect`: (id: string) => void
- `onClose`: (id: string) => void (optional)
- `onAdd`: () => void (optional)

**JpeFileTab Interface:**
```typescript
{
  id: string;
  name: string;
  icon?: LucideIcon;
  iconColor?: string;
  modified?: boolean;
  pinned?: boolean;
}
```

**Tab Bar Styles:**
```
height: 34px
background: #0f1116
border-bottom: 1px solid rgba(255,255,255,0.06)
overflow-x: auto
```

**Individual Tab Styles:**
```
font-size: 11px
font-family: 'Inter', system-ui, sans-serif
border-right: 1px solid rgba(255,255,255,0.03)
padding: 0 12px
```

**Active Tab Indicator:**
```
top gradient line: linear-gradient(90deg, #63B3ED, #8B5CF6)
background: #070810
color: #E2E8F0
font-weight: 600
```

**Modified Indicator:**
```
dot: 6px circle, background: #F6AD55
```

**Pinned Indicator:**
```
star icon: 9px, fill: #F6AD55
```

---

### 4. CODE EDITOR (JpeCodeEditor)

**Props:**
- `lines`: JpeCodeLine[]
- `activeLine`: number
- `breakpoints`: number[]
- `highlights`: number[]
- `height`: number | string (default: 300)
- `title`: string
- `onLineClick`: (lineNum: number) => void

**JpeCodeLine Interface:**
```typescript
{
  num: number;
  text: string;
  type: "tag" | "attr" | "value" | "comment" | "keyword" | "string" | "plain";
}
```

**Syntax Highlighting Colors:**
```
tag:     #63B3ED (cyan)
attr:    #A78BFA (violet bright)
value:   #48BB78 (emerald)
comment: #4A5568 (muted)
keyword: #FC8181 (rose)
string:  #F6AD55 (amber)
plain:   #A0AEC0 (secondary)
```

**Editor Container:**
```
background: #070810
border: 1px solid rgba(255,255,255,0.06)
border-radius: 12px
overflow: hidden
```

**Line Number Gutter:**
```
width: 40px
font-size: 11px
font-family: 'JetBrains Mono', monospace
color: #2D3748 (dim)
text-align: right
padding-right: 12px
```

**Active Line:**
```
background: rgba(99,179,237,0.06)
```

**Breakpoint Indicator:**
```
left border: 3px solid #FC8181 (rose)
```

**Title Bar:**
```
background: #0f1116
border-bottom: 1px solid rgba(255,255,255,0.06)
padding: 6px 12px
text-transform: uppercase
letter-spacing: 0.1em
font-size: 10px
font-weight: 600
```

---

### 5. TOOL PANEL (JpeToolPanel)

**Props:**
- `title`: string
- `icon`: LucideIcon
- `iconColor`: string (default: #718096)
- `children`: ReactNode
- `collapsible`: boolean (default: true)
- `defaultOpen`: boolean (default: true)
- `actions`: ReactNode
- `badge`: string | number
- `headerColor`: string

**Panel Container:**
```
background: rgba(15,17,22,0.88)
backdrop-filter: blur(24px)
border: 1px solid rgba(255,255,255,0.06)
border-radius: 12px
overflow: hidden
```

**Header:**
```
padding: 8px 12px
font-size: 10px
font-weight: 700
letter-spacing: 0.14em
text-transform: uppercase
color: #A0AEC0
border-bottom: 1px solid rgba(255,255,255,0.06) (when open)
```

**Badge:**
```
padding: 1px 6px
font-size: 9px
font-family: 'JetBrains Mono', monospace
font-weight: 600
color: #63B3ED
background: rgba(99,179,237,0.12)
border-radius: 4px
```

---

### 6. NOTIFICATION (JpeNotification)

**Props:**
- `type`: "info" | "success" | "warning" | "error"
- `title`: string
- `message`: string
- `onDismiss`: () => void
- `action`: { label: string; onClick: () => void }
- `timestamp`: string

**Notification Types Configuration:**
```
info:
  icon: Info
  color: #63B3ED (cyan)
  bg: rgba(99,179,237,0.08)
  border-color: rgba(99,179,237,0.25)

success:
  icon: CheckCircle2
  color: #48BB78 (emerald)
  bg: rgba(72,187,120,0.08)
  border-color: rgba(72,187,120,0.25)

warning:
  icon: AlertTriangle
  color: #F6AD55 (amber)
  bg: rgba(246,173,85,0.08)
  border-color: rgba(246,173,85,0.25)

error:
  icon: XCircle
  color: #FC8181 (rose)
  bg: rgba(252,129,129,0.08)
  border-color: rgba(252,129,129,0.25)
```

**Container:**
```
background: rgba(15,17,22,0.88)
backdrop-filter: blur(24px)
border-radius: 12px
padding: 12px
max-width: 360px
box-shadow: 0 4px 24px rgba(0,0,0,0.4), 0 0 12px [color]10
```

**Accent Line:**
```
position: absolute left
width: 3px
height: 100%
background: [type color]
```

---

### 7. STATUS INDICATORS

#### JpeStatusDot
**Props:**
- `status`: "ok" | "warning" | "error" | "info" | "idle" | "running"
- `pulse`: boolean
- `size`: number (default: 8)

**Status Colors:**
```
ok:      #48BB78 (emerald)
warning: #F6AD55 (amber)
error:   #FC8181 (rose)
info:    #63B3ED (cyan)
idle:    #4A5568 (muted)
running: #8B5CF6 (violet)
```

#### JpeStatusBadge
**Props:**
- `status`: "ok" | "warning" | "error" | "info" | "idle" | "running"
- `label`: string
- `compact`: boolean

**Badge Styles:**
```
padding: 2px 8px (compact: 1px 6px)
font-size: 10px (compact: 9px)
font-family: 'JetBrains Mono', monospace
font-weight: 600
background: [color]12
border: 1px solid [color]20
border-radius: 6px
```

#### JpeProgressBar
**Props:**
- `value`: number
- `max`: number (default: 100)
- `color`: string (default: #63B3ED)
- `secondaryColor`: string
- `height`: number (default: 4)
- `animated`: boolean
- `label`: string

**Track:**
```
height: 4px
background: rgba(255,255,255,0.04)
border-radius: 9999px
```

**Fill:**
```
background: [color] (or gradient if secondaryColor provided)
box-shadow: 0 0 8px [color]40
border-radius: 9999px
transition: all 0.7s ease (if animated)
```

---

### 8. LOADING STATES

#### JpeSpinner
**Props:**
- `size`: number (default: 20)
- `color`: string (default: #63B3ED)

**Implementation:** SVG circle with animate-spin class

#### JpeSkeleton
**Props:**
- `width`: number | string
- `height`: number (default: 16)
- `rounded`: boolean (default: true)

**Styles:**
```
animation: pulse
background: linear-gradient(90deg, #181b24 25%, #1b1f2a 50%, #181b24 75%)
background-size: 200% 100%
border-radius: 6px
```

---

### 9. GRAPH VIEWER (JpeGraphViewer)

**Props:**
- `nodes`: JpeGraphNode[]
- `edges`: JpeGraphEdge[]
- `height`: number (default: 280)
- `onNodeClick`: (id: string) => void
- `selectedNode`: string

**JpeGraphNode Interface:**
```typescript
{
  id: string;
  label: string;
  x: number;  // percentage 0-100
  y: number;  // percentage 0-100
  color: string;
  size?: number;
  type?: string;
}
```

**JpeGraphEdge Interface:**
```typescript
{
  from: string;
  to: string;
  color?: string;
  dashed?: boolean;
}
```

**Container:**
```
height: 280px
background: #070810
border: 1px solid rgba(255,255,255,0.06)
border-radius: 12px
overflow: hidden
position: relative
```

**Grid Background:**
```
background-image: linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)
background-size: 40px 40px
opacity: 0.5
```

**Edges (SVG Lines):**
```
stroke: rgba(99,179,237,0.2)
stroke-width: 1.5
opacity: 0.6
stroke-dasharray: 4 4 (if dashed)
```

**Nodes:**
```
width/height: 28px (or custom size)
background: [color]25
border: 2px solid [color]60
border-radius: 9999px
box-shadow: 0 0 8px [color]15
```

**Selected Node:**
```
border: 2px solid [color]
box-shadow: 0 0 16px [color]40
z-index: 10
```

---

### 10. SHARED UTILITY COMPONENTS

#### Eyebrow
**Props:**
- `children`: ReactNode
- `color`: string (default: #718096)

**Styles:**
```
text-transform: uppercase
user-select: none
font-size: 10px
font-weight: 700
letter-spacing: 0.14em
font-family: 'Inter', system-ui, sans-serif
```

#### GlowDot
**Props:**
- `color`: string
- `pulse`: boolean

**Styles:**
```
width: 8px
height: 8px
border-radius: 9999px
background: [color]
box-shadow: 0 0 6px [color]80
```

#### Badge
**Props:**
- `children`: ReactNode
- `color`: string
- `bg`: string

**Styles:**
```
padding: 2px 8px
font-size: 10px
font-family: 'JetBrains Mono', monospace
font-weight: 600
border-radius: 6px
background: [bg]
border: 1px solid [color]20
```

#### PanelHeader
**Props:**
- `title`: string
- `icon`: LucideIcon
- `iconColor`: string (default: #718096)
- `actions`: ReactNode
- `count`: number

**Styles:**
```
padding: 8px 12px
border-bottom: 1px solid rgba(255,255,255,0.06)
display: flex
align-items: center
justify-content: space-between
```

#### IconBtn
**Props:**
- `icon`: LucideIcon
- `color`: string (default: #718096)
- `size`: number (default: 13)
- `onClick`: () => void
- `title`: string

**Styles:**
```
padding: 4px
border-radius: 6px
transition: background 0.2s ease
hover: rgba(255,255,255,0.05)
```

#### ProgressBar (Simple)
**Props:**
- `pct`: number
- `color`: string
- `height`: number (default: 3)

**Styles:**
```
height: 3px
background: rgba(255,255,255,0.04)
border-radius: 9999px
overflow: hidden
fill: linear-gradient(90deg, #8B5CF6, [color])
box-shadow: 0 0 6px [color]40
```

---

## 🎨 GLOBAL STYLE RULES

### Button Interactions
```css
button {
  font-size: 11px;
  font-weight: 500;
  line-height: 1.5;
  transition: box-shadow 0.2s ease, background 0.2s ease, transform 0.1s ease;
}

button:hover {
  box-shadow: 0 0 12px rgba(99, 179, 237, 0.15), 0 0 4px rgba(139, 92, 246, 0.12);
}

button:active {
  box-shadow: 0 0 18px rgba(99, 179, 237, 0.25), 0 0 6px rgba(139, 92, 246, 0.2);
}
```

### Labels (Uppercase Micro-typography)
```css
label {
  font-size: 11px;
  font-weight: 500;
  line-height: 1.5;
  text-transform: uppercase;
  letter-spacing: 0.14em;
}
```

### Range Slider (Cyberpunk Style)
```css
input[type="range"] {
  -webkit-appearance: none;
  height: 6px;
  border-radius: 3px;
  outline: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #63B3ED;
  border: 2px solid #0a0c10;
  box-shadow: 0 0 8px rgba(99,179,237,0.4);
  cursor: pointer;
  transition: box-shadow 0.2s ease, transform 0.1s ease;
}

input[type="range"]::-webkit-slider-thumb:hover {
  box-shadow: 0 0 14px rgba(99,179,237,0.6);
  transform: scale(1.15);
}
```

### Keyboard Focus Ring (Accessibility)
```css
:focus-visible {
  outline: 2px solid #63B3ED !important;
  outline-offset: 2px !important;
  box-shadow:
    0 0 0 4px rgba(99, 179, 237, 0.12),
    0 0 10px rgba(99, 179, 237, 0.2) !important;
}

button:focus-visible,
a:focus-visible {
  border-radius: 4px;
}

[role="treeitem"]:focus-visible,
[role="option"]:focus-visible,
[role="menuitem"]:focus-visible,
[role="tab"]:focus-visible {
  outline: 2px solid #63B3ED !important;
  outline-offset: 0px !important;
  box-shadow:
    inset 0 0 0 1px rgba(99, 179, 237, 0.15),
    0 0 8px rgba(99, 179, 237, 0.18) !important;
  border-radius: 4px;
}
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Scrollbar Hiding Utility
```css
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
```

---

## 🏗️ LAYOUT PATTERNS

### Panel Structure
```
┌─────────────────────────────────┐
│ PanelHeader (border-bottom)     │
├─────────────────────────────────┤
│                                 │
│  Content Area                   │
│  (scrollable if needed)         │
│                                 │
└─────────────────────────────────┘
```

### Sidebar Layout
```
┌──────────┬──────────────────────┐
│ Sidebar  │  Main Content Area   │
│ (280px)  │                      │
│          │                      │
└──────────┴──────────────────────┘
```

### Tab Bar + Content
```
┌─────────────────────────────────┐
│ Tab Bar (34px height)           │
├─────────────────────────────────┤
│                                 │
│  Tab Content                    │
│                                 │
└─────────────────────────────────┘
```

### Stacked Panels
```
┌─────────────────┐ ┌─────────────────┐
│ Panel 1         │ │ Panel 2         │
│ (glassmorphic)  │ │ (glassmorphic)  │
└─────────────────┘ └─────────────────┘
```

---

## 📦 RADIX UI COMPONENTS (Pre-styled)

All Radix components must be styled to match the design system:

- **accordion**: Collapsible sections with cyberpunk styling
- **alert-dialog**: Confirmation dialogs with glow effects
- **alert**: Status messages with semantic colors
- **aspect-ratio**: Image/media containers
- **avatar**: User profile images with glow borders
- **badge**: Status/label pills
- **breadcrumb**: Navigation breadcrumbs
- **button**: Primary interactive element (see Button spec)
- **calendar**: Date picker with dark theme
- **card**: Content containers with glassmorphism
- **carousel**: Image/content slider
- **chart**: Recharts-based data visualizations
- **checkbox**: Custom styled checkboxes
- **collapsible**: Expand/collapse containers
- **command**: Command palette (Ctrl+K)
- **context-menu**: Right-click menus
- **dialog**: Modal dialogs
- **drawer**: Slide-out panels
- **dropdown-menu**: Dropdown menus
- **form**: Form field wrappers
- **hover-card**: Hover tooltips
- **input-otp**: OTP input fields
- **input**: Text inputs
- **label**: Form labels (uppercase, letter-spacing)
- **menubar**: Menu bars
- **navigation-menu**: Nav menus
- **pagination**: Pagination controls
- **popover**: Popover containers
- **progress**: Progress bars
- **radio-group**: Radio button groups
- **resizable**: Resizable panels
- **scroll-area**: Custom scrollable areas
- **select**: Select dropdowns
- **separator**: Dividers
- **sheet**: Side sheets
- **sidebar**: Sidebar navigation
- **skeleton**: Loading placeholders
- **slider**: Range sliders
- **sonner**: Toast notifications
- **switch**: Toggle switches
- **table**: Data tables
- **tabs**: Tab navigation
- **textarea**: Multi-line text inputs
- **toggle-group**: Toggle button groups
- **toggle**: Toggle buttons
- **tooltip**: Hover tooltips

---

## 🎯 COMPONENT USAGE GUIDELINES

### When to Use Each Button Variant
```
primary: Main actions, CTAs, form submissions
secondary: Alternative actions, cancel buttons
ghost: Less prominent actions, toolbar buttons
danger: Destructive actions (delete, remove)
success: Confirmation actions, approve
icon: Toolbar icons, action icons without labels
```

### Typography Hierarchy
```
h1: 16px - Page titles
h2: 14px - Section titles
h3: 13px - Subsection titles
h4: 12px - Card titles, panel titles
body: 11px - Default text size
small: 10px - Labels, metadata
xs: 9px - Badge text, compact labels
```

### Color Usage Guidelines
```
cyan (#63B3ED): Primary actions, links, active states, highlights
violet (#8B5CF6): Secondary accents, gradients, special states
emerald (#48BB78): Success states, completed items, positive metrics
rose (#FC8181): Error states, destructive actions, negative metrics
amber (#F6AD55): Warning states, pending items, attention-needed items
```

### Spacing Guidelines
```
Use 4px base grid system
Tight spacing (2-4px): Icon gaps, inline elements
Medium spacing (8-12px): Component padding, section gaps
Large spacing (16-24px): Section spacing, panel gaps
```

### Border Radius Guidelines
```
6px: Small elements (badges, dots, small buttons)
8px: Buttons, inputs, dropdown items
10px: Cards, panels
12px: Large containers, modals
16px: Major sections, page containers
```

---

## 🚀 IMPLEMENTATION NOTES

### Tech Stack Requirements
```
React 18.3.1
Vite 6.3.5
Tailwind CSS 4.1.12
Radix UI (all components)
Lucide React (icons)
Framer Motion (animations)
Recharts (data visualization)
React Router 7.13.0
```

### Tailwind Configuration
```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        background: '#0a0c10',
        foreground: '#E2E8F0',
        primary: '#63B3ED',
        secondary: '#8B5CF6',
        muted: '#4A5568',
        accent: '#1b1f2a',
        destructive: '#FC8181',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '10px',
        xl: '12px',
        '2xl': '16px',
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(99,179,237,0.15)',
        'glow-violet': '0 0 20px rgba(139,92,246,0.15)',
      },
    },
  },
}
```

### CSS Variables Setup
```css
:root {
  /* Background colors */
  --bg: #0a0c10;
  --bg-deep: #070810;
  --bg-panel: #0f1116;
  --bg-surface: #13151c;
  --bg-elevated: #181b24;
  --bg-hover: #1b1f2a;
  --bg-active: #1f2330;
  --bg-input: #0d0f15;
  --bg-glass: rgba(15,17,22,0.88);
  
  /* Accent colors */
  --cyan: #63B3ED;
  --cyan-bright: #90CDF4;
  --violet: #8B5CF6;
  --violet-bright: #A78BFA;
  
  /* Semantic colors */
  --emerald: #48BB78;
  --rose: #FC8181;
  --amber: #F6AD55;
  
  /* Text colors */
  --text-primary: #E2E8F0;
  --text-secondary: #A0AEC0;
  --text-tertiary: #718096;
  --text-muted: #4A5568;
  
  /* Border colors */
  --border: rgba(255,255,255,0.06);
  --border-active: rgba(99,179,237,0.4);
  
  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  
  /* Effects */
  --glass-blur: blur(24px);
  --glow-cyan: 0 0 20px rgba(99,179,237,0.15);
}
```

---

## ✨ MICRO-INTERACTIONS & ANIMATIONS

### Hover States
```
Buttons: Background gradient intensifies + glow appears
Icons: Background rgba(255,255,255,0.05)
Cards/Panels: Subtle background color shift
Links: Color shifts to cyan
```

### Active/Pressed States
```
Buttons: Increased glow intensity
Inputs: Border color shifts to cyan
```

### Loading States
```
Spinner: Continuous rotation animation
Skeleton: Pulsing gradient animation
Progress Bar: Smooth width transition
```

### Entrance Animations
```
Panels: Fade in + slide up (200ms ease)
Modals: Fade in + scale up (300ms ease)
Notifications: Slide in from right (300ms ease)
```

---

## 🎨 COMPLETE COMPONENT INVENTORY (72+ Components)

### Core UI Components
1. JpeButton
2. JpeDropdown
3. JpeFileTabs
4. JpeCodeEditor
5. JpeToolPanel
6. JpeGraphViewer
7. JpeNotification
8. JpeStatusDot
9. JpeStatusBadge
10. JpeProgressBar
11. JpeSpinner
12. JpeSkeleton

### Shared Utilities
13. Eyebrow
14. GlowDot
15. Badge
16. PanelHeader
17. IconBtn
18. ProgressBar (Simple)

### IDE-Specific Components
19. AIAssistantView
20. ApiReferenceViewer
21. BatchOperations
22. BreadcrumbNav
23. BrowserCompatibility
24. BuildPipelineView
25. BuildProfileManager
26. ChangelogModal
27. CodeMinimap
28. CommandPalette
29. ConflictResolutionWizard
30. DashboardView
31. DependencyGraph
32. DiagnosticNexusView
33. DiffViewer
34. DocGenerator
35. EditHistoryPanel
36. ErrorBoundary
37. ExtensionsPanel
38. FileDiffViewer
39. FileOperationDialog
40. GlobalSearch
41. HotReloadWatcher
42. HoverDocPanel
43. InspectorPanel
44. JpeLanguageEditor
45. JpeWallpaper
46. KeyboardShortcuts
47. LivePreview
48. LocalizationCoverage
49. MasterBibleView
50. ModAtlasView
51. ModeExplorerPanels
52. ModHealthDashboard
53. ModSentinelView
54. ModTemplateWizard
55. ModValidator
56. NetworkStatusIndicator
57. NotificationCenter
58. OnboardingTour
59. PackageExportWizard
60. PerformanceHUD
61. ProjectSwitcher
62. RebelsVaultView
63. ReleaseManager
64. ResourceBrowser
65. SafeChartContainer
66. SettingsCalibrationView
67. SettingsView
68. SnippetManager
69. SourceControlPanel
70. SplashScreen
71. StringTableManager
72. SymbolOutline
73. TeamAnnotations
74. TestRunner
75. ToolsOverflowMenu
76. TranslationMemory
77. UsageAnalytics
78. WorkspaceProfiles

---

## 📐 CANVAS & LAYOUT SPECIFICATIONS

### Common Panel Dimensions
```
Standard Panel: 320px width
Sidebar: 280px width
Inspector: 300px width
Terminal: 40-60% height (bottom)
Modal: 600-800px width, auto height
Dialog: 400-500px width
```

### Grid System
```
Columns: 12-column grid for layouts
Gutter: 16px between columns
Margin: 24px page margins
```

### Z-Index Scale
```
base: 0
dropdown: 50
overlay: 100
dialog: 200
notification: 300
tooltip: 400
```

---

## 🎯 ACCESSIBILITY REQUIREMENTS

### Color Contrast Ratios
```
Normal text (≤18px): Minimum 4.5:1
Large text (>18px): Minimum 3:1
UI components: Minimum 3:1
```

### Keyboard Navigation
```
All interactive elements must be focusable
Visible focus ring on all elements (cyan glow)
Logical tab order
Escape closes modals/dialogs
Arrow keys for navigation in menus/lists
```

### Screen Reader Support
```
ARIA labels on all interactive elements
Role attributes on custom components
Live regions for dynamic content
Alt text on all images/icons
```

---

## 📝 PROMPT INSTRUCTIONS FOR AI UI GENERATION

When generating UI with this design system, follow these rules:

1. **USE EXACT COLOR VALUES** - Do not approximate. Use the exact hex values provided.

2. **MAINTAIN CYBERPUNK AESTHETIC** - Dark charcoal base + electric cyan/violet accents + glassmorphism + glow effects.

3. **FOLLOW 4PX GRID** - All spacing should be multiples of 4px (with exceptions for 1px borders).

4. **USE GLASSMORPHISM FOR PANELS** - `background: rgba(15,17,22,0.88)` + `backdrop-filter: blur(24px)`.

5. **ADD GLOW ON HOVER** - Interactive elements should have subtle cyan glow on hover.

6. **UPPERCASE LABELS** - All form labels and panel titles should be uppercase with `letter-spacing: 0.14em`.

7. **MONO FOR CODE/DATA** - Use JetBrains Mono for code, data displays, line numbers, badges.

8. **SMALL FONT SIZES** - This is an IDE interface. Use 9-13px for most text, 14-16px for titles only.

9. **ROUNDED CORNERS** - Use 8px for buttons/inputs, 12px for cards/panels.

10. **SUBTLE BORDERS** - Use `rgba(255,255,255,0.06)` for standard borders, not solid colors.

11. **DARK BY DEFAULT** - This is a dark theme only. Do not generate light theme variants.

12. **STATUS COLORS ARE SEMANTIC** - Emerald=success, Rose=error, Amber=warning, Cyan=info.

---

**END OF DESIGN SYSTEM SPECIFICATION**

*Generated from Figma Make export — Robust application development*
*Source: https://www.figma.com/design/TTIxPDPqNMKGlFXXuFuLlV/Robust-application-development*

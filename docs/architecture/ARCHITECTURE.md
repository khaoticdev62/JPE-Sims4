# System Architecture Document
## JPE Mod Translator 2.0

**Version**: 1.0
**Architect**: David
**Date**: December 26, 2025
**Tech Stack**: TypeScript + Electron + React + Zustand + Tailwind CSS + Jest
**Status**: Ready for Development Phase

---

## 1. Architecture Overview

### 1.1 High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     JPE MOD TRANSLATOR 2.0                       │
│                    Electron Desktop Application                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              PRESENTATION LAYER (React UI)               │   │
│  │                                                           │   │
│  │  ┌─────────────┐ ┌──────────┐ ┌──────────────────────┐  │   │
│  │  │  File Tree  │ │  Editor  │ │  Diagnostics Panel  │  │   │
│  │  │  Component  │ │Component │ │  Component          │  │   │
│  │  └─────────────┘ └──────────┘ └──────────────────────┘  │   │
│  │                                                           │   │
│  │  ┌─────────────┐ ┌──────────┐ ┌──────────────────────┐  │   │
│  │  │   Menu Bar  │ │  Wizard  │ │  Settings Dialog    │  │   │
│  │  │  Component  │ │Component │ │  Component          │  │   │
│  │  └─────────────┘ └──────────┘ └──────────────────────┘  │   │
│  │                                                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                    │
│                              ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │            STATE MANAGEMENT LAYER (Zustand)             │   │
│  │                                                           │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐ │   │
│  │  │ Project      │ │ Editor       │ │ Diagnostic       │ │   │
│  │  │ Store        │ │ Store        │ │ Store            │ │   │
│  │  └──────────────┘ └──────────────┘ └──────────────────┘ │   │
│  │                                                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                    │
│                              ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           APPLICATION LOGIC LAYER (Services)            │   │
│  │                                                           │   │
│  │  ┌──────────────────┐  ┌──────────────────────────────┐ │   │
│  │  │ File Service     │  │ Project Service              │ │   │
│  │  │ - Open          │  │ - New project                │ │   │
│  │  │ - Save          │  │ - Open project               │ │   │
│  │  │ - Export        │  │ - Save project               │ │   │
│  │  └──────────────────┘  └──────────────────────────────┘ │   │
│  │                                                           │   │
│  │  ┌──────────────────┐  ┌──────────────────────────────┐ │   │
│  │  │ Compiler Service │  │ Validator Service            │ │   │
│  │  │ - Compile JPE    │  │ - Real-time validation       │ │   │
│  │  │ - Generate XML   │  │ - Error detection            │ │   │
│  │  │ - Batch compile  │  │ - Suggestions                │ │   │
│  │  └──────────────────┘  └──────────────────────────────┘ │   │
│  │                                                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                    │
│                              ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         TRANSLATION ENGINE (Core Business Logic)        │   │
│  │                                                           │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │   │
│  │  │ JPE Parser   │  │ JPE Builder  │  │ JPE          │   │   │
│  │  │              │  │              │  │ Validator    │   │   │
│  │  │ Converts     │  │ Builds JPE   │  │              │   │   │
│  │  │ formats→JPE  │  │ objects      │  │ Validates    │   │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │   │
│  │                                                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                    │
│                              ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           FORMAT PARSERS & COMPILERS LAYER              │   │
│  │                                                           │   │
│  │  ┌───────────────┐ ┌───────────────┐ ┌────────────────┐  │   │
│  │  │ XML Parser    │ │ STBL Parser   │ │ Package Parser │  │   │
│  │  │ & Compiler    │ │ & Compiler    │ │ & Compiler     │  │   │
│  │  └───────────────┘ └───────────────┘ └────────────────┘  │   │
│  │                                                           │   │
│  │  ┌───────────────┐ ┌───────────────┐ ┌────────────────┐  │   │
│  │  │Script Parser  │ │Config Parser  │ │JSON Parser     │  │   │
│  │  │& Compiler     │ │& Compiler     │ │& Compiler      │  │   │
│  │  └───────────────┘ └───────────────┘ └────────────────┘  │   │
│  │                                                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                    │
│                              ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │            FILE SYSTEM & DATA LAYER                      │   │
│  │                                                           │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │   │
│  │  │ File System  │  │ Project      │  │ Version      │   │   │
│  │  │ Operations   │  │ Metadata     │  │ History DB   │   │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │   │
│  │                                                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                     ELECTRON MAIN PROCESS                        │
│     (Window management, file dialogs, native APIs)              │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Architecture Principles

1. **Layered Architecture**: Clear separation of concerns (UI → State → Logic → Parsers → FS)
2. **Modular Parsers**: Each file format (XML, STBL, etc.) is independent and testable
3. **Shared Engine**: Translation logic is format-agnostic, enabling iPhone app reuse
4. **Immutable State**: Zustand store with immutable updates prevents bugs
5. **Async First**: All I/O operations are async; non-blocking UI
6. **Real-Time Validation**: Validators run on every keystroke for instant feedback

---

## 2. Technology Stack Decision

### 2.1 Language: TypeScript

**Why TypeScript?**
- ✅ **Type Safety**: Catches errors at compile time, prevents null/undefined bugs
- ✅ **Better IDE Support**: Excellent autocomplete, inline documentation, refactoring
- ✅ **Scalability**: Easier to maintain large codebases; clear contracts between modules
- ✅ **Team Collaboration**: Self-documenting code; easier for community contributions
- ✅ **Performance**: Compiles to optimized JavaScript; no runtime overhead
- ✅ **Ecosystem**: All modern libraries (React, Electron) have excellent TS support

**Alternative Considered**: JavaScript
- ❌ No type safety; harder to catch bugs in solo development
- ❌ Refactoring is risky (no IDE support)
- ❌ Harder for community contributions without understanding code fully

**Decision**: ✅ **TypeScript**

### 2.2 Desktop Framework: Electron

**Why Electron?**
- ✅ **Cross-Platform**: One codebase for Windows & Mac (90%+ of modding community)
- ✅ **File System Access**: Full read/write access to mod files (required)
- ✅ **Packaging**: Easy distribution as .exe/.dmg
- ✅ **Developer Experience**: Web technologies (HTML/CSS/JS) are faster to develop
- ✅ **Ecosystem**: Large community, many examples, easy debugging
- ✅ **Shipping Speed**: Faster than native (Objective-C/C++)

**Alternative Considered**: Native (C#/Swift)
- ❌ Requires rewriting for each platform (2x development time)
- ❌ Steeper learning curve; slower solo development
- ❌ Harder for community contributions

**Alternative Considered**: Web/Cloud
- ❌ Requires cloud infrastructure (opposite of solo/open-source model)
- ❌ Sims 4 mods are local files; desktop app has better UX
- ❌ Can't support offline-first workflow

**Decision**: ✅ **Electron** (Latest LTS version)

### 2.3 UI Framework: React

**Why React?**
- ✅ **Component Reusability**: Build once, reuse in many places (editor tabs, dialogs, etc.)
- ✅ **Predictable State Flow**: State flows down, events bubble up (easy to understand)
- ✅ **Hot Reload**: Instant feedback while developing UI
- ✅ **Ecosystem**: Thousands of libraries, UI kits, examples
- ✅ **Performance**: Virtual DOM, memoization prevents unnecessary re-renders
- ✅ **Learning Curve**: Well-documented, large community

**Alternative Considered**: Vue
- ✅ Simpler syntax, smaller bundle
- ❌ Smaller ecosystem; fewer community resources
- ❌ Less suitable for complex UIs

**Alternative Considered**: Svelte
- ✅ Even simpler, smaller bundle
- ❌ Very new; fewer examples and ecosystem
- ❌ Risky for long-term maintenance

**Decision**: ✅ **React** (with Hooks, no class components)

### 2.4 State Management: Zustand

**Why Zustand?**
- ✅ **Minimal Boilerplate**: Create a store with 10 lines of code (vs Redux's 100)
- ✅ **Simple API**: `create()` hook, no actions/reducers/middleware
- ✅ **Type Safe**: Works perfectly with TypeScript
- ✅ **Performant**: Only re-renders components that use changed state
- ✅ **Lightweight**: ~500 bytes gzipped (vs Redux ~6kb)
- ✅ **DevTools**: Can hook into Redux DevTools for debugging

**Why Not Context API?**
- ❌ Causes unnecessary re-renders (all consumers re-render on any state change)
- ❌ Poor performance with large state trees
- ❌ Harder to scale to multiple stores

**Why Not Redux?**
- ❌ Excessive boilerplate for MVP scope
- ❌ Steep learning curve; slower to implement
- ✅ Can migrate to Redux later if needed (Zustand is compatible)

**Decision**: ✅ **Zustand** with DevTools integration

### 2.5 Styling: Tailwind CSS

**Why Tailwind CSS?**
- ✅ **Rapid Development**: Pre-built utility classes speed up UI creation
- ✅ **Consistency**: Enforced spacing, colors, sizes across the app
- ✅ **Small Bundle**: Only includes classes you use (tree-shaking)
- ✅ **Dark Mode**: Built-in dark mode support with one config
- ✅ **Responsive**: Mobile-first utilities for desktop/tablet/mobile
- ✅ **Customizable**: Easy theming and customization

**Alternative Considered**: CSS Modules
- ✅ Scoped styles prevent conflicts
- ❌ More boilerplate; slower to write
- ❌ Harder to maintain consistency across components

**Alternative Considered**: Styled Components
- ✅ Component-scoped styles
- ❌ Runtime overhead; slower performance
- ❌ Larger bundle size

**Decision**: ✅ **Tailwind CSS** with dark mode enabled

### 2.6 Testing Framework: Jest + React Testing Library

**Why Jest?**
- ✅ **Zero Config**: Works out of the box with Create React App / TypeScript
- ✅ **Snapshot Testing**: Catch UI regressions automatically
- ✅ **Mocking**: Built-in mocking for file system, native modules
- ✅ **Performance**: Parallel test execution; fast feedback
- ✅ **Coverage**: Built-in coverage reporting

**Why React Testing Library?**
- ✅ **User-Centric**: Tests how users interact, not implementation details
- ✅ **Accessibility**: Built-in a11y queries; tests are also accessibility tests
- ✅ **Less Brittle**: Refactor without breaking tests

**Decision**: ✅ **Jest + React Testing Library**

### 2.7 Build Tool: Vite

**Why Vite?**
- ✅ **Lightning Fast**: Native ES modules; < 1s HMR (hot module reload)
- ✅ **Zero Config**: Works out of the box with React + TypeScript
- ✅ **Optimized Build**: Automatic code splitting, tree-shaking
- ✅ **Modern**: Built for modern browsers; no legacy IE support
- ✅ **Growing Ecosystem**: Becoming industry standard

**Alternative Considered**: Webpack
- ✅ More mature, more plugins available
- ❌ Complex configuration; slower development experience
- ❌ Slower build times

**Decision**: ✅ **Vite** (with Electron builder integration)

### 2.8 Electron Bundler: electron-builder

**Why electron-builder?**
- ✅ **Simple Configuration**: One config file for build, publish, auto-updates
- ✅ **Cross-Platform**: Build Windows .exe and Mac .dmg from one codebase
- ✅ **Code Signing**: Integrated code signing and notarization
- ✅ **Auto-Updates**: Delta updates; only download changed parts
- ✅ **Installers**: Professional installers for Windows (no MSI required)

**Decision**: ✅ **electron-builder**

---

## 3. Component Architecture

### 3.1 React Component Hierarchy

```
App (Root)
├── TitleBar
│   ├── Menu
│   └── WindowControls
├── Main Layout (Flex)
│   ├── Sidebar (25% width)
│   │   ├── ProjectTree
│   │   │   ├── ProjectHeader
│   │   │   └── FileTreeNode (recursive)
│   │   └── QuickActions
│   ├── EditorPane (50% width)
│   │   ├── EditorTabs
│   │   │   └── EditorTab (multiple)
│   │   └── Editor
│   │       ├── CodeMirror (editor lib)
│   │       ├── Gutter
│   │       └── Minimap
│   └── RightPanel (25% width)
│       ├── DiagnosticsPanel
│       │   ├── DiagnosticItem (multiple)
│       │   └── DiagnosticFilter
│       ├── PreviewPanel (collapsed by default)
│       └── PropertiesPanel
└── Modals
    ├── NewProjectWizard
    ├── SettingsDialog
    ├── AboutDialog
    └── ConfirmDialog
```

### 3.2 Component Design Patterns

**Smart Components** (Containers)
- Connected to Zustand store
- Handle business logic and data fetching
- Examples: `App`, `EditorPane`, `ProjectTree`

**Dumb Components** (Presentational)
- Receive data via props
- Focus on rendering UI
- Reusable and testable
- Examples: `DiagnosticItem`, `FileTreeNode`, `EditorTab`

**Hooks** (Custom Logic)
- `useEditor` - Handle editor state and operations
- `useProject` - Project CRUD operations
- `useCompiler` - Compilation operations
- `useValidator` - Real-time validation

---

## 4. State Management Architecture (Zustand)

### 4.1 Store Structure

```typescript
// stores/useProjectStore.ts
interface Project {
  id: string;
  name: string;
  rootPath: string;
  files: ModFile[];
  metadata: ProjectMetadata;
}

interface ProjectStore {
  // State
  currentProject: Project | null;
  recentProjects: Project[];

  // Actions
  createProject: (name: string, path: string) => Promise<void>;
  openProject: (path: string) => Promise<void>;
  saveProject: () => Promise<void>;
  addFile: (project: Project, file: ModFile) => Promise<void>;
  removeFile: (project: Project, fileId: string) => Promise<void>;
}

// stores/useEditorStore.ts
interface EditorTab {
  id: string;
  fileId: string;
  fileName: string;
  content: string;
  isDirty: boolean;
  cursorPosition: { line: number; column: number };
}

interface EditorStore {
  // State
  tabs: EditorTab[];
  activeTabId: string | null;

  // Actions
  openTab: (file: ModFile) => void;
  closeTab: (tabId: string) => void;
  updateTabContent: (tabId: string, content: string) => void;
  setActiveTab: (tabId: string) => void;
  saveTab: (tabId: string) => Promise<void>;
}

// stores/useDiagnosticStore.ts
interface Diagnostic {
  id: string;
  fileId: string;
  line: number;
  column: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
  documentationLink?: string;
}

interface DiagnosticStore {
  // State
  diagnostics: Diagnostic[];
  filters: { showErrors: boolean; showWarnings: boolean; showInfo: boolean };

  // Actions
  setDiagnostics: (diagnostics: Diagnostic[]) => void;
  clearDiagnostics: () => void;
  filterDiagnostics: (filters: DiagnosticStore['filters']) => void;
}
```

### 4.2 Store Integration with Services

```
Component (useProjectStore hook)
       │
       ▼
Zustand Store (state + setters)
       │
       ▼
Service Layer (ProjectService, CompilerService, etc.)
       │
       ▼
Core Translation Engine (parsers, validators)
       │
       ▼
File System / External APIs
```

---

## 5. Translation Engine Architecture

### 5.1 Core Components

#### 5.1.1 JPE Format Specification

```typescript
// types/jpe.ts

// Root JPE Module
interface JPEModule {
  type: 'module';
  id: string;
  name: string;
  description?: string;
  sections: JPESection[];
}

// JPE Sections
type JPESection =
  | WhenSection
  | DoSection
  | ConditionSection
  | LocalizationSection
  | PropertySection;

interface WhenSection {
  type: 'when';
  triggers: JPETrigger[];
}

interface DoSection {
  type: 'do';
  actions: JPEAction[];
}

interface JPETrigger {
  subject: string;          // 'Sims', 'Lot', etc.
  verb: string;            // 'perform', 'enter', etc.
  object: string;          // 'action', 'room', etc.
  modifiers?: string[];    // additional conditions
}

interface JPEAction {
  verb: string;            // 'increase', 'trigger', etc.
  subject: string;         // 'friendship', 'animation', etc.
  amount?: number | string;
  conditions?: string[];
}
```

#### 5.1.2 Parser Architecture

Each format parser follows the same interface:

```typescript
// types/parser.ts

interface Parser {
  // Detect if file is this format
  canParse: (content: string, filename: string) => boolean;

  // Parse -> JPE
  parse: (content: string) => JPEModule;

  // JPE -> Compile
  compile: (jpe: JPEModule) => string;

  // Validate
  validate: (content: string) => ValidationResult;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

// Implementations
class XMLParser implements Parser { ... }
class STBLParser implements Parser { ... }
class PackageParser implements Parser { ... }
class ScriptParser implements Parser { ... }
```

#### 5.1.3 Validator Architecture

```typescript
// types/validator.ts

interface Validator {
  validate: (jpe: JPEModule) => ValidationResult;
  validateFile: (content: string) => ValidationResult;
}

class JPEValidator implements Validator {
  // Rules
  validateSyntax(jpe: JPEModule): ValidationError[];
  validateSemantics(jpe: JPEModule): ValidationError[];
  validateCompatibility(jpe: JPEModule): ValidationWarning[];
  suggestImprovements(jpe: JPEModule): ValidationSuggestion[];
}
```

### 5.2 Data Flow: Read → Translate → Edit → Compile

```
1. READ (File → JPE)
   ├─ User opens mod file (XML, STBL, .ts4script, etc.)
   ├─ Detect format based on extension/content
   ├─ Load appropriate parser (XMLParser, STBLParser, etc.)
   ├─ Parser.parse() → JPE intermediate format
   └─ Store in EditorStore

2. TRANSLATE (JPE → Display)
   ├─ JPE loaded from EditorStore
   ├─ Format for display (syntax highlighting, folding)
   ├─ Show in React Editor component
   └─ Ready for editing

3. EDIT (User modifications)
   ├─ User types in editor
   ├─ Each keystroke triggers validation
   ├─ Validator.validateFile() in real-time
   ├─ Diagnostics shown in DiagnosticStore
   ├─ Content stored in EditorStore
   └─ Mark tab as "dirty" (unsaved)

4. COMPILE (JPE → File)
   ├─ User clicks "Compile"
   ├─ Get JPE from EditorStore
   ├─ Compiler.compile(jpe) → target format
   ├─ Validate output format
   ├─ Write to file system
   ├─ Show success message
   └─ Clear "dirty" flag
```

---

## 6. Service Layer Architecture

### 6.1 Core Services

#### ProjectService
```typescript
class ProjectService {
  // Create new project
  async createProject(name: string, rootPath: string): Promise<Project>;

  // Load existing project
  async openProject(rootPath: string): Promise<Project>;

  // Save project metadata
  async saveProject(project: Project): Promise<void>;

  // Manage files
  async addFile(project: Project, filePath: string): Promise<ModFile>;
  async removeFile(project: Project, fileId: string): Promise<void>;
  async renameFile(project: Project, fileId: string, newName: string): Promise<void>;
}
```

#### CompilerService
```typescript
class CompilerService {
  // Parse file to JPE
  async parseFile(filePath: string): Promise<JPEModule>;

  // Compile JPE to format
  async compileToXML(jpe: JPEModule): Promise<string>;
  async compileToSTBL(jpe: JPEModule): Promise<Buffer>;
  async compileToPackage(jpe: JPEModule): Promise<Buffer>;

  // Batch operations
  async compileProject(project: Project): Promise<CompileResult>;
  async compileIncremental(project: Project, changed: string[]): Promise<CompileResult>;
}
```

#### ValidatorService
```typescript
class ValidatorService {
  // Real-time validation
  validateFile(content: string, fileType: string): ValidationResult;
  validateJPE(jpe: JPEModule): ValidationResult;

  // Async compatibility checking
  async checkCompatibility(jpe: JPEModule): Promise<CompatibilityResult>;

  // Suggestions
  getSuggestions(jpe: JPEModule): CodeSuggestion[];
}
```

#### FileService
```typescript
class FileService {
  // File I/O
  async readFile(filePath: string): Promise<string>;
  async writeFile(filePath: string, content: string): Promise<void>;
  async deleteFile(filePath: string): Promise<void>;

  // File system operations
  async listDirectory(dirPath: string): Promise<FileInfo[]>;
  async fileExists(filePath: string): Promise<boolean>;
  async getFileStats(filePath: string): Promise<FileStats>;

  // Export/Package
  async exportProject(project: Project, outputPath: string): Promise<void>;
  async createBackup(project: Project): Promise<string>;
}
```

---

## 7. File Structure & Module Organization

### 7.1 Directory Layout

```
jpe-mod-translator/
├── public/
│   ├── index.html
│   ├── icon.png
│   └── icons/
│       ├── 16x16.png
│       ├── 32x32.png
│       └── 512x512.png
│
├── src/
│   ├── main.ts                          # Electron main process
│   │   ├── createWindow()
│   │   ├── setupMenus()
│   │   └── setupIPC handlers
│   │
│   ├── preload.ts                       # IPC bridge
│   │
│   ├── renderer.tsx                     # React entry point
│   │
│   ├── components/                      # React components
│   │   ├── layout/
│   │   │   ├── TitleBar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── EditorPane.tsx
│   │   │   └── RightPanel.tsx
│   │   │
│   │   ├── editor/
│   │   │   ├── Editor.tsx
│   │   │   ├── EditorTabs.tsx
│   │   │   ├── CodeMirror.tsx
│   │   │   └── Gutter.tsx
│   │   │
│   │   ├── file-tree/
│   │   │   ├── ProjectTree.tsx
│   │   │   ├── FileTreeNode.tsx
│   │   │   └── ProjectHeader.tsx
│   │   │
│   │   ├── diagnostics/
│   │   │   ├── DiagnosticsPanel.tsx
│   │   │   ├── DiagnosticItem.tsx
│   │   │   └── DiagnosticFilter.tsx
│   │   │
│   │   ├── modals/
│   │   │   ├── NewProjectWizard.tsx
│   │   │   ├── SettingsDialog.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   └── AboutDialog.tsx
│   │   │
│   │   └── common/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Spinner.tsx
│   │       └── Toast.tsx
│   │
│   ├── stores/                          # Zustand stores
│   │   ├── useProjectStore.ts
│   │   ├── useEditorStore.ts
│   │   ├── useDiagnosticStore.ts
│   │   ├── useSettingsStore.ts
│   │   └── useUIStore.ts (collapsed panels, etc.)
│   │
│   ├── hooks/                           # Custom React hooks
│   │   ├── useEditor.ts
│   │   ├── useProject.ts
│   │   ├── useCompiler.ts
│   │   ├── useValidator.ts
│   │   └── useFile.ts
│   │
│   ├── services/                        # Business logic
│   │   ├── ProjectService.ts
│   │   ├── CompilerService.ts
│   │   ├── ValidatorService.ts
│   │   ├── FileService.ts
│   │   └── HistoryService.ts
│   │
│   ├── engine/                          # Translation engine (core)
│   │   ├── parsers/
│   │   │   ├── XMLParser.ts
│   │   │   ├── STBLParser.ts
│   │   │   ├── PackageParser.ts
│   │   │   ├── ScriptParser.ts
│   │   │   ├── ConfigParser.ts
│   │   │   ├── JSONParser.ts
│   │   │   └── ParserFactory.ts
│   │   │
│   │   ├── compilers/
│   │   │   ├── XMLCompiler.ts
│   │   │   ├── STBLCompiler.ts
│   │   │   ├── PackageCompiler.ts
│   │   │   ├── ScriptCompiler.ts
│   │   │   └── CompilerFactory.ts
│   │   │
│   │   ├── translators/
│   │   │   ├── JPETranslator.ts    # File → JPE
│   │   │   ├── JPEBuilder.ts       # Build JPE objects
│   │   │   └── JPEAnalyzer.ts      # Analyze JPE
│   │   │
│   │   ├── validators/
│   │   │   ├── JPEValidator.ts
│   │   │   ├── SyntaxValidator.ts
│   │   │   ├── SemanticValidator.ts
│   │   │   └── CompatibilityValidator.ts
│   │   │
│   │   └── types.ts                # JPE type definitions
│   │
│   ├── types/                           # TypeScript interfaces
│   │   ├── index.ts
│   │   ├── jpe.ts
│   │   ├── project.ts
│   │   ├── diagnostic.ts
│   │   └── validation.ts
│   │
│   ├── utils/                           # Utility functions
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   ├── paths.ts
│   │   ├── strings.ts
│   │   └── numbers.ts
│   │
│   ├── constants/
│   │   ├── app.ts
│   │   ├── ui.ts
│   │   └── formats.ts
│   │
│   ├── config/
│   │   ├── tailwind.config.ts
│   │   └── vite.config.ts
│   │
│   ├── App.tsx                          # Root React component
│   └── styles/
│       ├── globals.css
│       ├── themes.css
│       └── overrides.css
│
├── tests/                               # Jest test files
│   ├── unit/
│   │   ├── engine/
│   │   │   ├── parsers/
│   │   │   │   ├── XMLParser.test.ts
│   │   │   │   ├── STBLParser.test.ts
│   │   │   │   └── ...
│   │   │   ├── validators/
│   │   │   └── ...
│   │   ├── services/
│   │   │   ├── ProjectService.test.ts
│   │   │   ├── CompilerService.test.ts
│   │   │   └── ...
│   │   └── utils/
│   │
│   ├── integration/
│   │   ├── read-edit-compile.test.ts
│   │   ├── project-workflow.test.ts
│   │   └── ...
│   │
│   └── e2e/
│       ├── basic-workflow.test.ts
│       └── ...
│
├── .github/
│   └── workflows/
│       ├── test.yml              # Run tests on push
│       ├── build.yml             # Build distributable
│       └── release.yml           # Release to GitHub
│
├── electron-builder.json         # Electron packaging config
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
├── jest.config.js
├── .env.example
└── README.md
```

### 7.2 Module Boundaries & Dependencies

```
Layers (bottom-up, dependencies flow upward):

LAYER 1: TYPE DEFINITIONS
└── types/
    ├── jpe.ts (JPE format types)
    └── ...

LAYER 2: UTILITIES
└── utils/
    ├── strings, numbers, paths, etc.
    └── (no dependencies on other layers)

LAYER 3: TRANSLATION ENGINE
└── engine/
    ├── parsers/ (depend on types)
    ├── compilers/
    ├── translators/
    └── validators/

LAYER 4: SERVICES
└── services/
    ├── ProjectService (depends on FileService, engine)
    ├── CompilerService (depends on engine)
    ├── ValidatorService (depends on engine)
    ├── FileService (depends on types)
    └── HistoryService

LAYER 5: STORES (Zustand)
└── stores/
    ├── useProjectStore (depends on services)
    ├── useEditorStore
    ├── useDiagnosticStore
    └── useSettingsStore

LAYER 6: HOOKS
└── hooks/
    ├── useProject (depends on stores, services)
    ├── useEditor
    ├── useCompiler
    └── ...

LAYER 7: COMPONENTS (React)
└── components/
    ├── Smart components (depend on hooks, stores)
    ├── Presentational components (depend on types)
    └── (organized by feature)

LAYER 8: APPLICATION
└── App.tsx (root, orchestrates everything)
    └── main.ts (Electron process)
```

**Key Rule**: Lower layers never depend on higher layers
- ✅ Components can use services
- ❌ Services cannot import components

---

## 8. API Specifications

### 8.1 IPC (Electron Main ↔ Renderer)

```typescript
// Common IPC events
interface IPC {
  // File operations
  'file:open' → (filePath: string) → Promise<FileContent>;
  'file:save' → (filePath: string, content: string) → Promise<void>;
  'file:delete' → (filePath: string) → Promise<void>;

  // Project operations
  'project:create' → (name: string, path: string) → Promise<Project>;
  'project:open' → (path: string) → Promise<Project>;
  'project:save' → (project: Project) → Promise<void>;

  // Compilation
  'compiler:compile' → (jpeContent: string, targetFormat: string) → Promise<string>;

  // Dialogs
  'dialog:openFile' → () → Promise<string | null>;
  'dialog:openFolder' → () → Promise<string | null>;
  'dialog:saveFile' → (defaultPath: string) → Promise<string | null>;

  // Native notifications
  'notify:success' → (message: string) → void;
  'notify:error' → (message: string) → void;
}
```

### 8.2 Service APIs

```typescript
// ProjectService
interface ProjectService {
  createProject(name: string, rootPath: string): Promise<Project>;
  openProject(rootPath: string): Promise<Project>;
  saveProject(project: Project): Promise<void>;
  // ... etc
}

// CompilerService
interface CompilerService {
  parseFile(filePath: string): Promise<JPEModule>;
  compileToXML(jpe: JPEModule): Promise<string>;
  // ... etc
}
```

### 8.3 Component Props (Key Examples)

```typescript
// EditorProps
interface EditorProps {
  tab: EditorTab;
  onContentChange: (content: string) => void;
  onCursorMove: (pos: { line: number; column: number }) => void;
  diagnostics: Diagnostic[];
  readOnly?: boolean;
}

// DiagnosticItemProps
interface DiagnosticItemProps {
  diagnostic: Diagnostic;
  onClick: () => void;
  isSelected: boolean;
}

// FileTreeNodeProps
interface FileTreeNodeProps {
  file: ModFile;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}
```

---

## 9. Data Models

### 9.1 Project Structure

```typescript
interface Project {
  id: string;                           // UUID
  name: string;
  rootPath: string;                     // Absolute path
  files: ModFile[];
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    version: string;
    author?: string;
    description?: string;
  };
}

interface ModFile {
  id: string;                           // UUID
  projectId: string;
  name: string;
  path: string;                         // Relative to project root
  type: 'xml' | 'stbl' | 'package' | 'script' | 'config' | 'json';
  content: string;                      // Raw file content
  jpe?: JPEModule;                      // Parsed JPE (cached)
  isDirty: boolean;
  compiledAt?: Date;
  size: number;                         // Bytes
  lastModified: Date;
}
```

### 9.2 JPE Data Model

```typescript
interface JPEModule {
  type: 'module';
  id: string;
  name: string;
  description?: string;
  version: string;
  author?: string;
  sections: JPESection[];
  metadata: {
    sourceFormat: string;               // 'xml', 'stbl', etc.
    sourceFile: string;
    parsedAt: Date;
  };
}

type JPESection = WhenSection | DoSection | ConditionSection | LocalizationSection;

interface WhenSection {
  type: 'when';
  triggers: JPETrigger[];
}

interface JPETrigger {
  subject: string;                      // 'Sim', 'Lot', 'Game'
  verb: string;                         // 'performs', 'enters', 'starts'
  object: string;                       // 'action', 'event', etc.
  modifiers?: {
    name: string;
    value: string | number;
  }[];
}
```

### 9.3 Diagnostic Model

```typescript
interface Diagnostic {
  id: string;
  fileId: string;
  line: number;                         // 1-indexed
  column: number;                       // 1-indexed
  severity: 'error' | 'warning' | 'info' | 'hint';
  message: string;                      // Human readable
  code?: string;                        // Error code (e.g., 'JPE001')
  suggestion?: string;                  // How to fix
  documentationLink?: string;           // Learn more URL
  relatedLocations?: DiagnosticLocation[];
  tags?: ('unnecessary' | 'deprecated')[];
}

interface DiagnosticLocation {
  fileId: string;
  line: number;
  column: number;
  message?: string;
}
```

---

## 10. Key Architectural Decisions

### 10.1 Why JPE as Intermediate Format?

**Problem**: Supporting multiple input formats (XML, STBL, .ts4script, etc.) and output formats is complex.

**Solution**: Convert all formats to JPE (intermediate representation):

```
XML → JPE ← STBL
↓     ↑
Output in any format
```

**Benefits**:
- ✅ Validation logic works for all formats
- ✅ Easy to add new formats (just add parser/compiler)
- ✅ JPE editing is format-agnostic
- ✅ Can mix formats in same project
- ✅ Reusable in iPhone app (same engine)

### 10.2 Why Modular Parsers?

**Each format (XML, STBL, etc.) gets its own parser**:

```
XMLParser implements Parser { parse(), compile() }
STBLParser implements Parser { parse(), compile() }
PackageParser implements Parser { parse(), compile() }
...
```

**Benefits**:
- ✅ Independent development (parallel work)
- ✅ Easy testing (mock individual parsers)
- ✅ Easy to add/update formats
- ✅ Clear responsibility boundaries
- ✅ Can update one parser without affecting others

### 10.3 Why Real-Time Validation?

Validators run on every keystroke:

```
User types → DiagnosticStore updates → Red squiggles appear
```

**Benefits**:
- ✅ Immediate feedback (user learns while typing)
- ✅ Catches errors before compilation
- ✅ Prevents bad habits
- ✅ Educational (explains errors clearly)

### 10.4 Why Zustand over Context?

Context causes unnecessary re-renders:

```
Context: Any state change → all consumers re-render
Zustand: Only changed state → only consumers of that state re-render
```

With large edits, Context would cause constant re-renders.

---

## 11. Performance Considerations

### 11.1 Compilation Performance Target

| Operation | Target | Strategy |
|---|---|---|
| Parse small mod (< 500 lines) | < 100ms | In-memory parsing |
| Compile mod to XML | < 1sec | Native string building |
| Batch compile 10 mods | < 5sec | Parallel parsing |
| Real-time validation | < 50ms | Debounced (wait 500ms after typing) |
| Open project | < 1sec | Lazy load files |

### 11.2 Memory Optimization

- **Code splitting**: Lazy load dialogs, panels
- **Virtual scrolling**: File tree with 1000+ files only renders visible rows
- **Memoization**: React.memo() for expensive components
- **Zustand slicing**: Components subscribe to only needed store slice

### 11.3 UI Responsiveness

- **Non-blocking I/O**: All file operations are async
- **Progress indicators**: Show progress for long operations
- **Cancelable operations**: User can cancel compilation, compilation, etc.
- **Debouncing**: Validation waits 500ms after last keystroke before validating

---

## 12. Security Considerations

### 12.1 File Operations

- ✅ Never execute user files
- ✅ Validate file paths (prevent directory traversal)
- ✅ Sanitize user input before file operations
- ✅ Backup before overwriting files

### 12.2 Code Injection

- ✅ No eval() of user code
- ✅ Sanitize diagnostic suggestions
- ✅ Validate all parsed JPE objects
- ✅ Use TypeScript for type safety

### 12.3 Electron Security

- ✅ Disable nodeIntegration in BrowserWindow
- ✅ Enable contextIsolation
- ✅ Use preload.ts for IPC
- ✅ No dangerous APIs exposed

---

## 13. Build & Deployment

### 13.1 Development Workflow

```bash
# Development
npm install
npm run dev              # Vite dev server + Electron dev

# Testing
npm run test             # Jest tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report

# Linting & Formatting
npm run lint             # ESLint
npm run format           # Prettier
```

### 13.2 Build Process

```bash
# Build distributable
npm run build            # Vite build + Electron builder

# Output
dist/
├── JPE-Mod-Translator-1.0.0.exe    # Windows installer
├── JPE-Mod-Translator-1.0.0.dmg    # Mac installer
└── ...
```

### 13.3 Distribution

- **GitHub Releases**: Primary distribution
- **Auto-updates**: electron-updater checks for updates weekly
- **Code Signing**: Binaries signed for trust

---

## 14. Testing Strategy

### 14.1 Unit Tests (Jest)

**Target**: Core translation engine

```
engine/parsers/ → 90%+ coverage
engine/compilers/ → 90%+ coverage
engine/validators/ → 95%+ coverage
services/ → 80%+ coverage
utils/ → 100% coverage
```

### 14.2 Integration Tests

**Target**: Service interactions

```
ProjectService + FileService → Can create, open, save projects
CompilerService + Parsers → Compilation round-trips work
ValidatorService + Parsers → Validation catches errors
```

### 14.3 E2E Tests (Playwright - future)

**Target**: User workflows

```
User opens mod file → Sees JPE translation
User edits JPE → Sees real-time diagnostics
User compiles → Gets valid output file
```

### 14.4 Real-Mod Testing

**Before release**: Test against 50+ real Sims 4 mods

- Verify compilation produces valid XML
- Verify no data loss
- Measure performance on large mods

---

## 15. Accessibility Considerations

### 15.1 WCAG 2.1 AA Compliance (Best Effort)

- ✅ Keyboard navigation for all features
- ✅ Screen reader support (semantic HTML, ARIA labels)
- ✅ Color contrast ratio > 4.5:1
- ✅ Resizable text
- ✅ Error messages before form submission

### 15.2 Editor Accessibility

- ✅ Syntax highlighting is semantic (not color-only)
- ✅ Line numbers accessible to screen readers
- ✅ Keyboard shortcuts have alternatives
- ✅ Error messages at top of editor (announced to screen readers)

---

## 16. Localization Strategy

### 16.1 UI Localization

- ✅ All strings in separate i18n files (not hardcoded)
- ✅ Support EN, ES, FR, DE (MVP)
- ✅ Community can contribute translations
- ✅ Date/time formatting respects locale

### 16.2 Mod Content Localization

- ✅ JPE supports STBL sections (localization strings)
- ✅ Easy copy-paste for translation
- ✅ Compiles to correct STBL format

---

## 17. Documentation & Maintainability

### 17.1 Code Documentation

- ✅ TypeScript comments for complex logic
- ✅ JSDoc comments for public APIs
- ✅ Architecture.md (this document)
- ✅ Inline comments for "why", not "what"

### 17.2 Developer Guide

```
docs/
├── ARCHITECTURE.md         # This file
├── DEVELOPMENT.md          # Setup, contributing
├── TESTING.md              # Test strategy
├── ADDING_FORMATS.md       # How to add new file format
└── CODESTYLE.md            # Code style guidelines
```

---

## 18. Known Limitations & Future Improvements

### 18.1 MVP Limitations

- **No visual mod builder**: v3.0+ (requires UI/UX design)
- **No game integration**: Can't preview changes in game (would need Sims 4 SDK)
- **No cloud sync**: Local projects only (v2.0+)
- **Limited debugging**: No integrated game debugger

### 18.2 Future Improvements

**v1.1**: Incremental compilation, version history diffs
**v2.0**: iPhone app, cloud sync, visual builder foundation
**v3.0**: Full visual mod builder, mod marketplace integration, AI suggestions

---

## Document Control

**Version**: 1.0
**Status**: Ready for Development
**Next Review**: Post-MVP (Week 11)

**Architecture is sound. Ready to begin development phase.**

---

## Appendix: Quick Reference

### Architecture Diagram (Text)
```
User Input (React Components)
    ↓
Zustand Stores (State)
    ↓
Services (Business Logic)
    ↓
Translation Engine (Core JPE Logic)
    ↓
Format Parsers & Compilers
    ↓
File System & Electron APIs
```

### Key Files to Create First

1. `src/types/jpe.ts` - JPE type definitions
2. `src/engine/parsers/XMLParser.ts` - First format parser
3. `src/services/ProjectService.ts` - Project management
4. `src/stores/useProjectStore.ts` - Project state
5. `src/components/App.tsx` - Root component
6. `src/main.ts` - Electron main process

### Development Sequence

1. **Week 1**: Foundation (types, basic UI, electron setup)
2. **Week 2**: First parser (XML) + basic compilation
3. **Week 3**: Editor + real-time validation
4. **Weeks 4-6**: Remaining parsers + features
5. **Weeks 7-9**: Polish + testing + docs
6. **Week 10**: Buffer for fixes + release prep

---

**Ready to begin development. See you in Phase 4: Story Preparation!**

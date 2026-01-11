# Architecture Design Document
## JPE Mod Translator 2.0 - MVP Core (PRD01-03)

**Document Version**: 1.0
**Date**: December 26, 2025
**Scope**: PRD01 (Core Engine), PRD02 (JPE Language), PRD03 (Desktop App)
**Target Audience**: Architects, Lead Developers, DevOps Engineers
**Status**: READY FOR IMPLEMENTATION

---

## 1. ARCHITECTURAL OVERVIEW

### 1.1 System Context Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    External Systems                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  File System          Sims 4 Mod Files    Game Mods        │
│    (User)          (.xml, .stbl, etc)    (Downloaded)      │
│     │                       │                   │           │
└─────┼───────────────────────┼───────────────────┼───────────┘
      │                       │                   │
      ↓                       ↓                   ↓
┌──────────────────────────────────────────────────────────────┐
│          JPE STUDIO DESKTOP (Electron + React)              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              React UI Layer                          │   │
│  │  ┌──────────┬──────────┬──────────┬──────────┐       │   │
│  │  │ TitleBar │ Sidebar  │ Editor   │ RightPan│       │   │
│  │  │ (Menu)   │ (Files)  │ (Tabs)   │ (Diags) │       │   │
│  │  └──────────┴──────────┴──────────┴──────────┘       │   │
│  │           StatusBar + Settings Panel                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓↑                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         State Management & Business Logic            │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │  Zustand Stores:                            │   │   │
│  │  │  • useProjectStore (project state)          │   │   │
│  │  │  • useEditorStore (editor tabs, content)    │   │   │
│  │  │  • useDiagnosticStore (errors, warnings)    │   │   │
│  │  │  • useUIStore (preferences, theme)          │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓↑                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │    Translation & Processing Engine                   │   │
│  │  (Located in src/engine/)                           │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓↑                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │      File System & Project Management               │   │
│  │  (Read/write to user's file system)                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
      ↓                                              ↓
    User's                                    Generated Mod Files
  File System                                 (.xml, compiled output)
```

### 1.2 Layered Architecture

```
┌──────────────────────────────────────────────────────┐
│  LAYER 0: Electron IPC Bridge                        │  Main/Renderer
│  (Communication between main & renderer processes)   │
└──────────────────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────────────────┐
│  LAYER 1: React UI Components                        │
│  - Presentational components (Button, Input, etc.)   │
│  - Container components (Editor, Sidebar, etc.)      │
│  - Design system integration (tokens, themes)        │
└──────────────────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────────────────┐
│  LAYER 2: State Management & Hooks                   │
│  - Zustand stores                                    │
│  - Custom hooks (useKeyboardShortcuts, etc.)         │
│  - Context providers                                 │
└──────────────────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────────────────┐
│  LAYER 3: Business Logic & Services                  │
│  - File operations service                           │
│  - Project management                                │
│  - Editor commands                                   │
└──────────────────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────────────────┐
│  LAYER 4: Translation Engine (Core)                  │
│  - JPE ↔ XML translation                             │
│  - Format parsing                                    │
│  - Compilation pipeline                              │
└──────────────────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────────────────┐
│  LAYER 5: Diagnostic & Validation Engine             │
│  - Error detection                                   │
│  - Warning generation                                │
│  - Real-time validation                              │
└──────────────────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────────────────┐
│  LAYER 6: Format Parsers & Compilers                 │
│  - XML parser/compiler                               │
│  - STBL parser/compiler                              │
│  - Python script parser                              │
│  - Package file parser                               │
│  - Config file parser                                │
└──────────────────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────────────────┐
│  LAYER 7: File System & Node.js Native APIs          │
│  - File I/O                                          │
│  - Directory operations                              │
│  - System integration                                │
└──────────────────────────────────────────────────────┘
```

---

## 2. COMPONENT ARCHITECTURE

### 2.1 Module Structure

```
src/
├── components/                    # React UI Components
│   ├── common/                    # Reusable components
│   │   ├── Button.tsx             # Button component
│   │   ├── Modal.tsx              # Modal dialog
│   │   ├── TextInput.tsx          # Text input field
│   │   ├── Card.tsx               # Card container
│   │   └── ... (other common)
│   │
│   └── layout/                    # Layout components
│       ├── TitleBar.tsx           # Menu bar
│       ├── Sidebar.tsx            # File tree explorer
│       ├── EditorPane.tsx         # Main editor
│       ├── RightPanel.tsx         # Diagnostics panel
│       ├── StatusBar.tsx          # Status bar
│       └── App.tsx                # Root layout
│
├── stores/                        # Zustand state management
│   ├── projectStore.ts            # Project state
│   ├── editorStore.ts             # Editor state (tabs, content)
│   ├── diagnosticStore.ts         # Diagnostic errors/warnings
│   ├── uiStore.ts                 # UI state (theme, preferences)
│   └── index.ts                   # Store exports
│
├── hooks/                         # Custom React hooks
│   ├── useKeyboardShortcuts.ts   # Keyboard binding
│   ├── useAutoSave.ts             # Auto-save functionality
│   ├── useProjectOperations.ts    # Project operations
│   ├── useFileOperations.ts       # File operations
│   └── index.ts
│
├── services/                      # Business logic services
│   ├── fileService.ts             # File I/O (open, save, etc.)
│   ├── projectService.ts          # Project management
│   ├── editorService.ts           # Editor commands
│   ├── translationService.ts      # Translation operations
│   └── index.ts
│
├── engine/                        # Core Translation Engine (PRD01+02)
│   ├── translator/
│   │   ├── jpeToXml.ts            # JPE → XML translation
│   │   ├── xmlToJpe.ts            # XML → JPE translation
│   │   ├── formatters.ts          # Output formatting
│   │   └── index.ts
│   │
│   ├── parser/
│   │   ├── jpeParser.ts           # JPE parser (lexer + parser)
│   │   ├── xmlParser.ts           # XML parser wrapper
│   │   ├── stblParser.ts          # STBL format parser
│   │   ├── pythonParser.ts        # Python script parser
│   │   ├── packageParser.ts       # .package file parser
│   │   ├── configParser.ts        # .cfg, .json parser
│   │   └── index.ts
│   │
│   ├── validator/
│   │   ├── jpeValidator.ts        # JPE syntax validation
│   │   ├── semanticValidator.ts   # Semantic validation
│   │   ├── compatibilityValidator.ts  # Compatibility checking
│   │   ├── rules/
│   │   │   ├── syntaxRules.ts     # Syntax error rules
│   │   │   ├── semanticRules.ts   # Type/scope rules
│   │   │   ├── compatibilityRules.ts  # Game version rules
│   │   │   └── customRules.ts     # User-defined rules
│   │   └── index.ts
│   │
│   ├── compiler/
│   │   ├── jpeCompiler.ts         # JPE compiler
│   │   ├── xmlCompiler.ts         # XML compiler
│   │   ├── stblCompiler.ts        # STBL compiler
│   │   └── index.ts
│   │
│   ├── diagnostics/
│   │   ├── errorFormatter.ts      # Format errors for UI
│   │   ├── errorSuggester.ts      # Suggest fixes
│   │   ├── errorCategories.ts     # Error classification
│   │   └── index.ts
│   │
│   ├── language/
│   │   ├── jpeGrammar.ts          # JPE grammar definition (EBNF)
│   │   ├── jpeTokens.ts           # Token definitions
│   │   ├── jpeLexer.ts            # Tokenizer
│   │   └── index.ts
│   │
│   └── index.ts                   # Engine exports
│
├── types/                         # TypeScript type definitions
│   ├── jpe.ts                     # JPE language types
│   ├── diagnostic.ts              # Error/diagnostic types
│   ├── file.ts                    # File/project types
│   ├── editor.ts                  # Editor state types
│   └── index.ts
│
├── utils/                         # Utility functions
│   ├── format.ts                  # String formatting
│   ├── validation.ts              # Validation helpers
│   ├── ast.ts                     # AST manipulation
│   └── index.ts
│
├── constants/                     # Application constants
│   ├── keyBindings.ts             # Keyboard shortcuts
│   ├── errorMessages.ts           # Error message templates
│   ├── jpeKeywords.ts             # JPE language keywords
│   └── index.ts
│
├── styles/                        # Global styles
│   ├── globals.css                # Global styles
│   ├── variables.css              # CSS variables (from tokens)
│   └── themes.css                 # Theme definitions
│
├── design-system/
│   ├── tokens.json                # Design tokens (colors, spacing, etc.)
│   ├── components.ts              # Design system component styles
│   └── themes.ts                  # Theme configuration
│
├── main.ts                        # Electron main process
├── preload.ts                     # Electron preload script (IPC)
├── App.tsx                        # React root component
├── index.tsx                      # React entry point
└── vite-env.d.ts                  # Vite environment types

test/
├── unit/                          # Unit tests
│   ├── engine/
│   │   ├── translator.test.ts
│   │   ├── parser.test.ts
│   │   ├── validator.test.ts
│   │   └── compiler.test.ts
│   ├── services/
│   │   ├── fileService.test.ts
│   │   └── projectService.test.ts
│   └── utils/
│
├── integration/                   # Integration tests
│   ├── endToEnd.test.ts          # JPE → XML → JPE round-trip
│   ├── fileOperations.test.ts     # File read/write
│   └── translation.test.ts        # Full translation pipeline
│
└── fixtures/                      # Test data
    ├── mods/                      # Sample mod files
    ├── jpe/                       # Sample JPE files
    └── expected/                  # Expected outputs
```

### 2.2 Core Components Diagram

```
PRD01: CORE TRANSLATOR ENGINE
┌─────────────────────────────────────────────────────┐
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  src/engine/parser/                         │   │
│  │  ├─ jpeParser.ts     (JPE lexer + parser)   │   │
│  │  ├─ xmlParser.ts     (XML parsing)          │   │
│  │  ├─ stblParser.ts    (STBL format)          │   │
│  │  ├─ pythonParser.ts  (Python scripts)       │   │
│  │  ├─ packageParser.ts (.package files)       │   │
│  │  └─ configParser.ts  (.cfg/.json)           │   │
│  └─────────────────────────────────────────────┘   │
│                        ↓                            │
│  ┌─────────────────────────────────────────────┐   │
│  │  src/engine/translator/                     │   │
│  │  ├─ jpeToXml.ts      (JPE → XML)            │   │
│  │  ├─ xmlToJpe.ts      (XML → JPE)            │   │
│  │  └─ formatters.ts    (Output formatting)    │   │
│  └─────────────────────────────────────────────┘   │
│                        ↓                            │
│  ┌─────────────────────────────────────────────┐   │
│  │  src/engine/validator/                      │   │
│  │  ├─ jpeValidator.ts  (Syntax checks)        │   │
│  │  ├─ semanticValidator.ts (Type checks)      │   │
│  │  └─ compatibilityValidator.ts (Game v.)     │   │
│  └─────────────────────────────────────────────┘   │
│                        ↓                            │
│  ┌─────────────────────────────────────────────┐   │
│  │  src/engine/compiler/                       │   │
│  │  ├─ jpeCompiler.ts   (JPE → binary)         │   │
│  │  ├─ xmlCompiler.ts   (XML generation)       │   │
│  │  └─ stblCompiler.ts  (STBL generation)      │   │
│  └─────────────────────────────────────────────┘   │
│                        ↓                            │
│  ┌─────────────────────────────────────────────┐   │
│  │  src/engine/diagnostics/                    │   │
│  │  ├─ errorFormatter.ts (Format for UI)       │   │
│  │  ├─ errorSuggester.ts (Suggestions)         │   │
│  │  └─ errorCategories.ts (Classification)     │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘

PRD02: JPE LANGUAGE DEFINITION
┌─────────────────────────────────────────────────────┐
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  src/engine/language/                       │   │
│  │  ├─ jpeGrammar.ts    (EBNF grammar)        │   │
│  │  ├─ jpeTokens.ts     (Token definitions)    │   │
│  │  └─ jpeLexer.ts      (Tokenizer)            │   │
│  └─────────────────────────────────────────────┘   │
│              Used by parser/validator              │
│                                                     │
└─────────────────────────────────────────────────────┘

PRD03: DESKTOP APPLICATION
┌─────────────────────────────────────────────────────┐
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  src/components/layout/                     │   │
│  │  ├─ TitleBar.tsx     (Menu + title)         │   │
│  │  ├─ Sidebar.tsx      (File tree)            │   │
│  │  ├─ EditorPane.tsx   (Multi-tab editor)     │   │
│  │  ├─ RightPanel.tsx   (Diagnostics)          │   │
│  │  ├─ StatusBar.tsx    (Status info)          │   │
│  │  └─ App.tsx          (Root layout)          │   │
│  └─────────────────────────────────────────────┘   │
│                        ↓                            │
│  ┌─────────────────────────────────────────────┐   │
│  │  src/components/common/                     │   │
│  │  ├─ Button.tsx       (Reusable button)      │   │
│  │  ├─ Modal.tsx        (Modal dialog)         │   │
│  │  ├─ TextInput.tsx    (Text input)           │   │
│  │  ├─ Card.tsx         (Card container)       │   │
│  │  └─ ... (other reusable components)         │   │
│  └─────────────────────────────────────────────┘   │
│                        ↓                            │
│  ┌─────────────────────────────────────────────┐   │
│  │  src/stores/  (Zustand State Management)    │   │
│  │  ├─ projectStore.ts  (Project state)        │   │
│  │  ├─ editorStore.ts   (Editor state)         │   │
│  │  ├─ diagnosticStore.ts (Errors/warnings)    │   │
│  │  └─ uiStore.ts       (UI preferences)       │   │
│  └─────────────────────────────────────────────┘   │
│                        ↓                            │
│  ┌─────────────────────────────────────────────┐   │
│  │  src/services/  (Business Logic)            │   │
│  │  ├─ fileService.ts   (File I/O)             │   │
│  │  ├─ projectService.ts (Project mgmt)        │   │
│  │  ├─ editorService.ts (Editor commands)      │   │
│  │  └─ translationService.ts (Translation)     │   │
│  └─────────────────────────────────────────────┘   │
│                        ↓                            │
│  ┌─────────────────────────────────────────────┐   │
│  │  src/main.ts (Electron Main Process)        │   │
│  │  ├─ Window management                       │   │
│  │  ├─ IPC handlers                            │   │
│  │  ├─ Menu creation                           │   │
│  │  └─ App lifecycle                           │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 3. DATA FLOW ARCHITECTURE

### 3.1 Read Mod File Flow

```
User selects file
        ↓
┌──────────────────────────────────────┐
│  editorService.openFile(path)        │
└──────────────────────────────────────┘
        ↓
┌──────────────────────────────────────┐
│  fileService.readFile(path)          │
│  (Read from file system)             │
└──────────────────────────────────────┘
        ↓
   Determine format
  (XML, STBL, etc.)
        ↓
┌──────────────────────────────────────┐
│  Select appropriate parser           │
│  (xmlParser, stblParser, etc.)       │
└──────────────────────────────────────┘
        ↓
┌──────────────────────────────────────┐
│  Parse to AST (Abstract Syntax Tree) │
└──────────────────────────────────────┘
        ↓
┌──────────────────────────────────────┐
│  xmlToJpe.translate(ast)             │
│  (Convert to JPE format)             │
└──────────────────────────────────────┘
        ↓
┌──────────────────────────────────────┐
│  jpeValidator.validate(jpeContent)   │
│  (Check syntax & semantics)          │
└──────────────────────────────────────┘
        ↓
┌──────────────────────────────────────┐
│  Create diagnostic report            │
│  (Errors, warnings, info)            │
└──────────────────────────────────────┘
        ↓
┌──────────────────────────────────────┐
│  Update stores:                      │
│  • editorStore.addTab()              │
│  • editorStore.setContent()          │
│  • diagnosticStore.setDiagnostics()  │
└──────────────────────────────────────┘
        ↓
    UI updates and displays
   JPE content in editor with
   error highlights, diagnostics
```

### 3.2 Edit & Validate Flow

```
User types in editor
        ↓
  Every keystroke triggers
    onTextChange event
        ↓
┌──────────────────────────────────────┐
│  editorStore.updateContent()         │
│  (Update content in store)           │
└──────────────────────────────────────┘
        ↓
   Debounce 300ms
 (Wait for typing pause)
        ↓
┌──────────────────────────────────────┐
│  jpeValidator.validate(newContent)   │
│  (Syntax + semantic check)           │
└──────────────────────────────────────┘
        ↓
┌──────────────────────────────────────┐
│  errorFormatter.format(errors)       │
│  (Format for UI display)             │
└──────────────────────────────────────┘
        ↓
┌──────────────────────────────────────┐
│  diagnosticStore.setDiagnostics()    │
│  (Update error list)                 │
└──────────────────────────────────────┘
        ↓
    UI updates:
  • Error highlights in editor
  • Diagnostics panel updates
  • Status bar shows error count
```

### 3.3 Compile & Generate Flow

```
User clicks "Compile" button
        ↓
┌──────────────────────────────────────┐
│  editorService.compile(fileId)       │
└──────────────────────────────────────┘
        ↓
┌──────────────────────────────────────┐
│  Get current JPE content from store  │
└──────────────────────────────────────┘
        ↓
┌──────────────────────────────────────┐
│  jpeValidator.validate(content)      │
│  (Pre-compilation check)             │
└──────────────────────────────────────┘
        ↓
   Is valid?
    ↙    ↘
  No     Yes
  ↓       ↓
Error   Continue
  ↓
┌──────────────────────────────────────┐
│  jpeCompiler.compile(jpeContent)     │
│  (JPE → AST)                         │
└──────────────────────────────────────┘
        ↓
┌──────────────────────────────────────┐
│  jpeToXml.translate(ast)             │
│  (AST → XML)                         │
└──────────────────────────────────────┘
        ↓
┌──────────────────────────────────────┐
│  xmlCompiler.compile(xml)            │
│  (Validate + optimize)               │
└──────────────────────────────────────┘
        ↓
┌──────────────────────────────────────┐
│  fileService.writeFile(outputPath)   │
│  (Save to file system)               │
└──────────────────────────────────────┘
        ↓
┌──────────────────────────────────────┐
│  Show success notification           │
│  File saved at: [path]               │
└──────────────────────────────────────┘
```

### 3.4 Round-Trip Conversion Flow

```
JPE Format ←→ XML Format

Input: XML file
  ↓
┌──────────────────────────────────┐
│  xmlParser.parse(xmlContent)     │
│  → AST                           │
└──────────────────────────────────┘
  ↓
┌──────────────────────────────────┐
│  xmlToJpe.translate(ast)         │
│  → JPE format string             │
└──────────────────────────────────┘
  ↓
┌──────────────────────────────────┐
│  jpeValidator.validate(jpe)      │
│  → Error list                    │
└──────────────────────────────────┘
  ↓
JPE content shown in editor

---

Input: JPE file
  ↓
┌──────────────────────────────────┐
│  jpeParser.parse(jpeContent)     │
│  → AST                           │
└──────────────────────────────────┘
  ↓
┌──────────────────────────────────┐
│  jpeToXml.translate(ast)         │
│  → XML format string             │
└──────────────────────────────────┘
  ↓
┌──────────────────────────────────┐
│  xmlCompiler.compile(xml)        │
│  → Validated XML                 │
└──────────────────────────────────┘
  ↓
XML can be saved to file or displayed
```

---

## 4. TECHNOLOGY STACK

### 4.1 Core Technologies

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| **Language** | TypeScript 5.2+ | ✅ | Type safety, IDE support, scalability |
| **Runtime** | Node.js | 18+ | Electron requirement, native file access |
| **Framework** | Electron | 26+ | Cross-platform desktop, full file system access |
| **UI Framework** | React | 18+ | Component reuse, state management, ecosystem |
| **State Mgmt** | Zustand | 4.4+ | Lightweight, hooks-based, minimal boilerplate |
| **Styling** | Tailwind CSS | 3.4+ | Utility-first, design tokens integration, rapid dev |
| **Build Tool** | Vite | 5+ | Fast builds, hot reload, ES modules |
| **Testing** | Jest + React Testing Library | Latest | Standard, good community support |
| **Linting** | ESLint + Prettier | Latest | Code quality, formatting consistency |

### 4.2 Key Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.4.7",
    "electron-squirrel-startup": "^1.1.12",
    "monaco-editor": "^0.44.0",
    "lucide-react": "^0.263.1"
  },
  "devDependencies": {
    "typescript": "^5.2.2",
    "vite": "^5.0.8",
    "electron": "^26.2.0",
    "electron-builder": "^24.6.4",
    "@vitejs/plugin-react": "^4.2.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "jest": "^29.7.0",
    "@testing-library/react": "^14.0.0",
    "eslint": "^8.52.0",
    "prettier": "^3.0.3"
  }
}
```

### 4.3 Parser & Compiler Libraries

| Component | Library | Purpose |
|-----------|---------|---------|
| **XML Parsing** | `xml2js` or custom | Parse/generate XML files |
| **AST Manipulation** | Custom implementation | Transform between formats |
| **Tokenization** | Custom lexer | JPE tokenization |
| **Grammar** | Custom implementation | JPE language definition |
| **Code Generation** | Custom templates | Generate output code |

---

## 5. INTEGRATION POINTS

### 5.1 Electron Main ↔ Renderer Communication (IPC)

```
Renderer (React):
├─ ipc.openFile(path)
├─ ipc.saveFile(path, content)
├─ ipc.showSaveDialog()
├─ ipc.showOpenDialog()
├─ ipc.compileFile(content)
└─ ipc.getAppVersion()
        ↓↑
┌─────────────────────────────┐
│  Preload Bridge (preload.ts)│
│  (Secure IPC handlers)      │
└─────────────────────────────┘
        ↓↑
Main Process (main.ts):
├─ File system access
├─ Menu management
├─ Window management
└─ System integration
```

**IPC Handler Structure**:

```typescript
// preload.ts
contextBridge.exposeInMainWorld('ipc', {
  openFile: (path) => ipcRenderer.invoke('file:open', path),
  saveFile: (path, content) => ipcRenderer.invoke('file:save', { path, content }),
  compile: (content) => ipcRenderer.invoke('compile', content),
  // ... more handlers
})

// In React components
const handleOpenFile = async (path: string) => {
  const content = await window.ipc.openFile(path)
  editorStore.setContent(content)
}
```

### 5.2 React Component ↔ Store Integration

```
Component Lifecycle:
  Mount
    ↓
┌──────────────────────────────┐
│  useEffect hook              │
│  Subscribe to store changes  │
└──────────────────────────────┘
    ↓
┌──────────────────────────────┐
│  Store selector hook         │
│  e.g., const content =       │
│    editorStore((s) =>        │
│      s.tabs[activeTabId])    │
└──────────────────────────────┘
    ↓
┌──────────────────────────────┐
│  Re-render on store update   │
└──────────────────────────────┘
    ↓
  Unmount
```

### 5.3 Engine ↔ Services Integration

```
React Component
    ↓
    calls
    ↓
Business Logic Service
  (fileService, projectService)
    ↓
    calls
    ↓
Translation Engine
  (parser, translator, compiler)
    ↓
    calls
    ↓
Format Parsers
  (xmlParser, jpeParser, etc.)
    ↓
    returns
    ↓
AST / Result
    ↓
    updates
    ↓
Zustand Store
    ↓
    triggers
    ↓
React Re-render
```

---

## 6. STATE MANAGEMENT DESIGN

### 6.1 Zustand Store Structure

```typescript
// useProjectStore.ts
interface ProjectState {
  projectId: string
  projectName: string
  projectPath: string
  files: ProjectFile[]

  // Actions
  loadProject: (path: string) => Promise<void>
  saveProject: () => Promise<void>
  addFile: (file: ProjectFile) => void
  removeFile: (fileId: string) => void
  updateFile: (fileId: string, updates: Partial<ProjectFile>) => void
}

// useEditorStore.ts
interface EditorState {
  tabs: EditorTab[]      // Array of open files
  activeTabId: string    // Currently active tab

  // Actions
  addTab: (tab: EditorTab) => void
  removeTab: (tabId: string) => void
  setActiveTab: (tabId: string) => void
  updateContent: (tabId: string, content: string) => void
  markDirty: (tabId: string, isDirty: boolean) => void
}

// useDiagnosticStore.ts
interface DiagnosticState {
  diagnostics: Diagnostic[]  // Array of errors/warnings
  errorCount: number
  warningCount: number

  // Actions
  setDiagnostics: (diags: Diagnostic[]) => void
  clearDiagnostics: () => void
}

// useUIStore.ts
interface UIState {
  theme: 'dark' | 'light'
  fontSize: number
  sidebarWidth: number
  rightPanelWidth: number

  // Actions
  setTheme: (theme: 'dark' | 'light') => void
  setFontSize: (size: number) => void
  setSidebarWidth: (width: number) => void
}
```

### 6.2 Data Flow Pattern

```
User Action → Event Handler → Store Update → UI Re-render

Example: Typing in editor
  ↓
onTextChange event fires
  ↓
editorStore.updateContent(tabId, newContent)
  ↓
  [Debounce 300ms]
  ↓
jpeValidator.validate(newContent)
  ↓
diagnosticStore.setDiagnostics(errors)
  ↓
Component subscribes to:
  • editorStore.tabs[tabId].content
  • diagnosticStore.diagnostics
  ↓
Component re-renders with:
  • Updated content
  • Updated error highlights
  • Updated diagnostics panel
```

---

## 7. ERROR HANDLING & DIAGNOSTICS ARCHITECTURE

### 7.1 Diagnostic System Layers

```
┌──────────────────────────────────────┐
│  User Input (JPE Content)            │
└──────────┬───────────────────────────┘
           ↓
┌──────────────────────────────────────┐
│  LAYER 1: Lexical Analysis           │
│  - Tokenization                      │
│  - Syntax errors (missing keywords)  │
│  - Check: jpeTokens.ts               │
└──────────┬───────────────────────────┘
           ↓
┌──────────────────────────────────────┐
│  LAYER 2: Syntax Analysis            │
│  - AST construction                  │
│  - Structural errors                 │
│  - Check: jpeGrammar.ts              │
└──────────┬───────────────────────────┘
           ↓
┌──────────────────────────────────────┐
│  LAYER 3: Semantic Analysis          │
│  - Type checking                     │
│  - Scope resolution                  │
│  - Variable validation               │
│  - Check: semanticValidator.ts       │
└──────────┬───────────────────────────┘
           ↓
┌──────────────────────────────────────┐
│  LAYER 4: Compatibility Check        │
│  - Game version compatibility        │
│  - Mod conflict detection            │
│  - Deprecated feature warnings       │
│  - Check: compatibilityValidator.ts  │
└──────────┬───────────────────────────┘
           ↓
┌──────────────────────────────────────┐
│  Diagnostic Report                   │
│  - List of errors (categorized)      │
│  - Line numbers & context            │
│  - Severity levels                   │
│  - Suggested fixes                   │
└──────────────────────────────────────┘
```

### 7.2 Error Categories

| Category | Severity | Example | Blocks Compilation |
|----------|----------|---------|------------------|
| **Syntax Error** | Error | Missing keyword | ✅ Yes |
| **Type Error** | Error | Wrong type | ✅ Yes |
| **Reference Error** | Error | Undefined variable | ✅ Yes |
| **Semantic Warning** | Warning | Unused variable | ❌ No |
| **Compatibility Warning** | Warning | Deprecated feature | ❌ No |
| **Info Message** | Info | Suggestion | ❌ No |

---

## 8. FILE & PROJECT MANAGEMENT

### 8.1 Project Structure

```
my_mod_project/
├── project.json              # Project metadata
│   {
│     "id": "unique-id",
│     "name": "My Mod Project",
│     "version": "1.0.0",
│     "created": "2025-12-26",
│     "files": ["mod1.jpe", "mod2.jpe"]
│   }
│
├── mods/                     # Source JPE files
│   ├── mod1.jpe
│   ├── mod2.jpe
│   └── utilities.jpe
│
├── .compiled/                # Compiled output (gitignored)
│   ├── mod1.xml
│   ├── mod2.xml
│   ├── mod1.stbl
│   └── mod2.package
│
├── .history/                 # Version history (gitignored)
│   ├── mod1.jpe.v1
│   ├── mod1.jpe.v2
│   └── ...
│
└── .settings/                # Project settings
    └── settings.json
        {
          "theme": "dark",
          "fontSize": 14,
          "autoSave": true,
          "autoSaveInterval": 30000
        }
```

### 8.2 File Operations Flow

```
┌─────────────────────────────────────┐
│  FileService (fileService.ts)       │
│  High-level file operations         │
├─────────────────────────────────────┤
│  - openFile(path)                   │
│  - saveFile(path, content)          │
│  - createProject(path, name)        │
│  - addFileToProject(projectId, file)│
│  - deleteFile(fileId)               │
│  - exportMod(projectId, outputPath) │
└──────────┬──────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  Node.js fs Module                  │
│  File system access via Electron    │
├─────────────────────────────────────┤
│  - fs.readFile()                    │
│  - fs.writeFile()                   │
│  - fs.mkdir()                       │
│  - fs.rmdir()                       │
│  - fs.stat()                        │
└─────────────────────────────────────┘
```

---

## 9. PERFORMANCE CONSIDERATIONS

### 9.1 Performance Targets

| Operation | Target | Acceptable | Critical |
|-----------|--------|-----------|----------|
| **File Open** | < 500ms | < 1000ms | < 2000ms |
| **Compile** | < 2s | < 5s | < 10s |
| **Validation** | < 100ms (debounced) | < 300ms | < 500ms |
| **Syntax Highlight** | < 50ms | < 100ms | < 200ms |
| **Tab Switch** | < 100ms | < 200ms | < 500ms |
| **Memory Usage** | < 300MB | < 500MB | < 800MB |
| **Startup** | < 2s | < 3s | < 5s |

### 9.2 Optimization Strategies

**Code Splitting**:
- Lazy-load format parsers (only load when needed)
- Code-split validation rules
- Separate bundles for main/renderer processes

**Memoization**:
- Memoize validator results
- Cache AST trees for unchanged files
- Use React.memo for expensive components

**Debouncing**:
- Real-time validation debounced 300ms
- Auto-save debounced 1s
- Resize events debounced 200ms

**Worker Threads**:
- Consider Web Workers for heavy computation (future)
- Move compilation to background thread if needed

---

## 10. TESTING STRATEGY

### 10.1 Test Pyramid

```
              ▲
             ╱ ╲
            ╱   ╲  E2E Tests (10%)
           ╱     ╲ - Full workflows
          ╱───────╲
         ╱         ╲
        ╱           ╲  Integration Tests (30%)
       ╱             ╲ - Component + Engine
      ╱───────────────╲
     ╱                 ╲
    ╱                   ╲ Unit Tests (60%)
   ╱                     ╲ - Functions, classes
  ╱_______________________╲
```

### 10.2 Test Coverage by Component

| Component | Unit | Integration | E2E |
|-----------|------|-------------|-----|
| **Parsers** | ✅ High | ✅ Medium | ❌ |
| **Translators** | ✅ High | ✅ High | ❌ |
| **Validators** | ✅ High | ✅ Medium | ❌ |
| **Services** | ✅ High | ✅ High | ❌ |
| **Stores** | ✅ Medium | ✅ High | ❌ |
| **Components** | ✅ Medium | ✅ High | ✅ |
| **Main Process** | ✅ Low | ✅ Medium | ✅ High |

### 10.3 Test Data & Fixtures

```
test/fixtures/
├── mods/
│   ├── clothing_mod.xml      (Valid XML)
│   ├── traits_mod.xml        (Valid XML)
│   ├── broken_mod.xml        (Invalid - for error testing)
│   ├── large_mod.xml         (Performance testing)
│   └── complex_mod.xml       (Edge cases)
│
├── jpe/
│   ├── valid_simple.jpe      (Valid JPE)
│   ├── valid_complex.jpe     (Valid JPE)
│   ├── invalid_syntax.jpe    (Syntax errors)
│   ├── invalid_semantic.jpe  (Semantic errors)
│   └── roundtrip_test.jpe    (For round-trip validation)
│
└── expected/
    ├── clothing_mod.expected.jpe
    ├── traits_mod.expected.jpe
    └── ... (expected outputs)
```

---

## 11. BUILD & DEPLOYMENT

### 11.1 Build Process

```
npm run dev
  ↓
Vite dev server (localhost:3000)
  + Electron dev process
  + Hot reload on file change

npm run build
  ↓
┌──────────────────────────────┐
│  Vite build                  │
│  (Bundle React + assets)     │
└──────────┬───────────────────┘
           ↓
┌──────────────────────────────┐
│  Electron build              │
│  (Package main.js)           │
└──────────┬───────────────────┘
           ↓
┌──────────────────────────────┐
│  Electron-builder            │
│  (Create installers)         │
│  - Windows: NSIS installer   │
│  - macOS: DMG + ZIP          │
│  - Linux: AppImage (future)  │
└──────────────────────────────┘
```

### 11.2 CI/CD Pipeline

```
GitHub Actions:
  ↓
┌─────────────────────────────────┐
│  On Push to main/PR:            │
│  1. Install dependencies (npm)  │
│  2. Run linter (eslint)         │
│  3. Run tests (jest)            │
│  4. Build (npm run build)       │
│  5. Create artifacts            │
└─────────────────────────────────┘
```

### 11.3 Release Process

```
Tag Version (v1.0.0)
  ↓
GitHub Actions triggers
  ↓
Build for multiple platforms
  ↓
Create Release notes
  ↓
Upload to GitHub Releases
  ↓
Update website/docs
  ↓
Announce on community channels
```

---

## 12. SECURITY CONSIDERATIONS

### 12.1 Electron Security Best Practices

- ✅ Disable Node.js integration in renderer
- ✅ Use preload script for IPC
- ✅ Context isolation enabled
- ✅ Validate all IPC messages
- ✅ Sandbox enabled for renderer process
- ✅ CSP headers configured

### 12.2 Data Security

- ✅ Local files only (user's file system)
- ✅ No telemetry without opt-in
- ✅ No auto-updates without verification
- ✅ Validate user inputs before processing
- ✅ No stored passwords/secrets

---

## 13. EXTENSIBILITY DESIGN

### 13.1 Plugin Architecture (v2.0+)

```typescript
interface IPlugin {
  name: string
  version: string
  activate(context: PluginContext): void
  deactivate(): void
}

interface PluginContext {
  commands: CommandAPI
  editors: EditorAPI
  fs: FileSystemAPI
  validators: ValidatorAPI
  // ... other APIs
}

// Plugin types:
// - Format Parsers (add new file formats)
// - Validators (custom validation rules)
// - Commands (new menu items, shortcuts)
// - Tools (standalone utilities)
```

### 13.2 Modular Parser Design

```typescript
// Parsers are modular and pluggable

interface IFormatParser {
  canParse(path: string): boolean
  parse(content: string): AST
  compile(ast: AST): string
}

// Each format is a separate module
const xmlParser: IFormatParser = { ... }
const stblParser: IFormatParser = { ... }
const pythonParser: IFormatParser = { ... }

// Easy to add new parsers without modifying core
```

---

## 14. QUALITY GATES

### 14.1 Code Quality Standards

| Standard | Tool | Threshold |
|----------|------|-----------|
| **Linting** | ESLint | 0 errors, 0 warnings |
| **Formatting** | Prettier | 100% compliance |
| **Type Safety** | TypeScript | strict mode, 0 errors |
| **Test Coverage** | Jest | 70% overall, 90% core modules |
| **Build** | Vite/Electron | < 10s build time |

### 14.2 Pre-Commit Checks

```bash
git commit
  ↓
husky hook triggers
  ↓
┌─────────────────────────┐
│ lint-staged:            │
│ - ESLint staged files   │
│ - Prettier format       │
│ - TypeScript check      │
└────────┬────────────────┘
         ↓
   If any fail
   ↓
  Abort commit,
  fix issues,
  try again
```

---

## 15. MONITORING & METRICS

### 15.1 Development Metrics

- Build time (target: < 10s)
- Test execution time (target: < 60s)
- Code coverage (target: 70%+)
- Bundle size (target: < 100MB)
- Startup time (target: < 2s)

### 15.2 Runtime Metrics (Future)

- Crash rate
- Performance profiling
- Feature usage
- Error frequency
- User engagement

---

## 16. GLOSSARY & REFERENCES

### Technical Terms

| Term | Definition |
|------|-----------|
| **AST** | Abstract Syntax Tree - internal representation of code |
| **JPE** | Just Plain English - human-readable mod format |
| **IPC** | Inter-Process Communication - main ↔ renderer communication |
| **Zustand** | State management library for React |
| **Vite** | Build tool and dev server |
| **Electron** | Framework for building desktop apps with web technologies |
| **Preload** | Script that runs before renderer process, bridges IPC |
| **Lexer** | Converts source code to tokens |
| **Parser** | Converts tokens to AST |
| **Compiler** | Converts AST to executable/output format |

### Key Files

| File | Purpose |
|------|---------|
| `main.ts` | Electron main process |
| `preload.ts` | IPC bridge |
| `App.tsx` | React root component |
| `engine/index.ts` | Translation engine entry point |
| `stores/index.ts` | Zustand stores |
| `services/index.ts` | Business logic |

---

## 17. NEXT STEPS

### Phase 1: Setup (Week 1)
- [ ] Project structure initialization
- [ ] Webpack/Vite configuration
- [ ] Electron setup
- [ ] React project scaffold
- [ ] Design system integration
- [ ] CI/CD pipeline setup

### Phase 2: Core Engine (Weeks 2-4)
- [ ] Format parser implementations
- [ ] Translator core engine
- [ ] Validation rule engine
- [ ] Compilation pipeline
- [ ] Test infrastructure

### Phase 3: JPE Language (Weeks 3-5)
- [ ] Grammar specification
- [ ] Lexer implementation
- [ ] Parser implementation
- [ ] Code generator

### Phase 4: Desktop App (Weeks 4-7)
- [ ] React components
- [ ] State management setup
- [ ] Editor implementation
- [ ] File operations
- [ ] Menu system

### Phase 5: Integration & QA (Weeks 8-10)
- [ ] Integration testing
- [ ] Performance optimization
- [ ] Cross-platform testing
- [ ] Documentation
- [ ] Release preparation

---

## Document Control

**Version**: 1.0
**Date**: December 26, 2025
**Status**: APPROVED FOR IMPLEMENTATION
**Next Review**: End of Week 2
**Responsible**: Lead Architect + Development Team

---

**This architecture document is the technical blueprint for implementation. All development should align with this design.**

**STATUS: READY FOR TEAM IMPLEMENTATION** ✅

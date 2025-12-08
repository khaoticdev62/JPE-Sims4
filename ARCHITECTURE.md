# Architecture - JPE Sims 4 Mod Translator

## System Overview

The JPE Sims 4 Mod Translator is a comprehensive modding suite with a layered architecture supporting multiple platforms and interfaces.

```
┌─────────────────────────────────────────────────────────┐
│                    User Interfaces                       │
├─────────────────┬──────────────────┬──────────────────────┤
│  Desktop Studio │  iOS Native      │  React Native (A&i) │
│  (Tkinter)      │  (SwiftUI)       │  (TypeScript)       │
└────────┬────────┴────────┬─────────┴──────────────┬──────┘
         │                 │                        │
┌────────┴─────────────────┴────────────────────────┴──────┐
│                  Application Core                        │
├──────────────────────────────────────────────────────────┤
│  CLI (click)  │  Studio Router  │  Onboarding System    │
│  (jpe-sims4)  │  (__main__.py)  │  (The Codex)          │
└────────┬──────────────────────────────────────────────┬──┘
         │                                              │
┌────────┴──────────────────────────────────────────────┴──┐
│                 Engine Layer                             │
├──────────────────────────────────────────────────────────┤
│  Translation Engine (orchestration)                      │
│  ┌─────────────┬──────────┬──────────┬──────────────┐   │
│  │   Parsers   │Validators│Generators│Transformers │   │
│  │  (engine/)  │(validate)│(generate)│(plugins/)    │   │
│  └─────────────┴──────────┴──────────┴──────────────┘   │
└────────┬──────────────────────────────────────────────┬──┘
         │                                              │
┌────────┴──────────────────────────────────────────────┴──┐
│          Intermediate Representation (IR)                │
├──────────────────────────────────────────────────────────┤
│  ProjectIR, Interaction, Buff, Trait, TestSet, etc.     │
│  (engine/ir.py - Central Data Model)                    │
└────────┬──────────────────────────────────────────────┬──┘
         │                                              │
┌────────┴──────────────────────────────────────────────┴──┐
│            Support Services Layer                        │
├──────────────────────────────────────────────────────────┤
│  Config│Diagnostics│Security│Performance│Cloud│Plugins│
│        │ (errors,  │        │(async,   │ API │       │
│        │  reports) │        │monitoring)│    │       │
└──────────────────────────────────────────────────────────┘
```

---

## Module Structure

### Core Modules

#### `engine/` - Translation Pipeline

The heart of the application. Handles JPE → Sims 4 XML conversion.

```
engine/
├── __init__.py           # Main TranslationEngine class
├── ir.py                 # Intermediate Representation (Central!)
├── parsers/
│   ├── jpe_parser.py     # JPE format parser
│   ├── jpe_xml_parser.py # JPE-XML format parser
│   └── base.py           # Base parser class
├── generators/
│   ├── sims4_xml_gen.py  # Sims 4 XML generator
│   ├── jpe_xml_gen.py    # JPE-XML generator
│   └── base.py           # Base generator class
└── validation/
    ├── validator.py      # Core validation logic
    ├── ir_validator.py   # IR object validation
    └── rules.py          # Validation rules
```

**Key Responsibility**: Convert JPE syntax to intermediate representation, validate, and generate Sims 4 XML.

#### `diagnostics/` - Error & Reporting System

Comprehensive error detection and reporting with severity levels.

```
diagnostics/
├── errors.py            # Error classes with severity
├── error_system.py      # Error management (32KB)
├── reports.py           # Build report generation
├── logging.py           # Performance monitoring
└── color_schemes.py     # Error severity colors
```

**Key Responsibility**: Detect, categorize, and report errors with actionable messages.

#### `ui/` - Desktop Interface

Tkinter-based GUI with theming system.

```
ui/
├── theme_manager.py     # 10 theme system
├── ui_enhancements.py   # Component styling
├── studio_tabs.py       # Main interface tabs
└── components/
    ├── editor.py        # Code editor widget
    ├── explorer.py      # Project explorer
    └── console.py       # Build console
```

**Key Responsibility**: Provide intuitive desktop interface with consistent theming.

#### `onboarding/` - Interactive Learning

The Codex tutorial system for new users.

```
onboarding/
├── the_codex.py         # Tutorial engine (66KB)
├── the_codex_gui.py     # Tutorial UI (73KB)
├── teaching_system.py   # Lesson management
└── lessons/
    └── *.jpe            # Sample lessons
```

**Key Responsibility**: Guide new users through features interactively.

#### `plugins/` - Extension System

Plugin architecture for extensibility.

```
plugins/
├── __init__.py
├── base.py              # Plugin base classes
├── manager.py           # Plugin discovery & loading
├── registry.py          # Plugin registry
└── examples/
    └── sample_plugin.py
```

**Key Responsibility**: Enable custom parsers, generators, and validators.

#### `config/` - Configuration Management

Encrypted credential storage and settings.

```
config/
├── config_manager.py    # Main config manager
├── encryption.py        # AES-256 encryption
└── paths.py             # Path management
```

**Key Responsibility**: Secure storage of user settings and credentials.

#### `security/` - Input Validation

Path and input sanitization.

```
security/
├── validator.py         # Input validation
├── sanitizer.py         # Input sanitization
└── permissions.py       # File permission checks
```

**Key Responsibility**: Prevent security vulnerabilities (injection, path traversal).

#### `performance/` - Async & Monitoring

Asynchronous operations and performance tracking.

```
performance/
├── monitor.py           # Performance monitoring
├── async_ops.py         # Async operation runner
└── cache.py             # Result caching
```

**Key Responsibility**: Prevent UI freezing and track performance metrics.

#### `cloud/` - Cloud Services

Multi-device synchronization and backup.

```
cloud/
├── api.py               # Cloud API client (13KB)
├── sync.py              # Sync orchestration
├── auth.py              # Authentication
└── storage.py           # Encrypted storage
```

**Key Responsibility**: Enable secure cloud sync across devices.

### Application Interfaces

#### `__main__.py` - Application Router

Entry point that routes to CLI or Studio based on arguments.

#### `cli.py` - Command Line Interface

Command-line tool (`jpe-sims4` command).

```python
# Available commands
jpe-sims4 build <project>
jpe-sims4 validate <project>
jpe-sims4 info <project>
jpe-sims4 help
```

#### `studio.py` - Desktop GUI

Main Tkinter application (94KB) with:
- Project explorer
- Code editor with syntax highlighting
- Build console
- Reports viewer
- Documentation browser
- Settings manager

#### `installer.py` - Installation Wizard

Branded installation wizard for Windows (19KB).

---

## Data Flow

### Build Pipeline

```
1. Input Layer
   └─ JPE Files (discovered by filesystem scan)

2. Parsing Phase
   └─ Parsers → IR Objects (engine/parsers/)

3. Validation Phase
   └─ Validators → Error List (engine/validation/)

4. Generation Phase
   └─ Generators → Sims 4 XML (engine/generators/)

5. Output Layer
   └─ XML Files written to build/ directory

6. Reporting Phase
   └─ Build Report (diagnostics/reports.py)
```

### Example: Single Interaction Build

```
Input: src/interactions.jpe
│
├─ [Interactions]
├─ id: greet_neighbor
├─ display_name: Greet Neighbor
└─ end

        ↓ PARSER (jpe_parser.py)

Interaction(
    id="greet_neighbor",
    display_name="Greet Neighbor",
    ...
)

        ↓ VALIDATOR (validator.py)

ValidationError[] (empty if valid)

        ↓ GENERATOR (sims4_xml_gen.py)

<I c="interactions.GreetNeighbor">
    <T n="display_name">Greet Neighbor</T>
</I>

        ↓ OUTPUT

build/interactions.xml
```

---

## Error Flow

```
Error Detection
├─ Parse errors (jpe_parser.py)
├─ Validation errors (validator.py)
├─ Generation errors (generators/)
└─ Runtime errors (cloud, plugins)
        │
        ↓
Error Classification (errors.py)
├─ Severity: CRITICAL, WARNING, CAUTION, INFO, SUCCESS
├─ Category: ParseError, ValidationError, GenerationError
└─ Location: file_path, line_number, column_number
        │
        ↓
Error Reporting (reports.py)
├─ Build Report (.json)
├─ Error Summary (color-coded)
└─ User Notifications (Studio UI)
```

---

## Plugin System Architecture

### Plugin Lifecycle

```
1. Discovery
   └─ Scan plugins/ directory for .py files

2. Loading
   └─ Import and instantiate plugin classes

3. Registration
   └─ Register with PluginManager

4. Execution
   ├─ During parse phase (ParserPlugin)
   ├─ During validation phase (ValidatorPlugin)
   └─ During generation phase (GeneratorPlugin)

5. Cleanup
   └─ Call plugin.cleanup() after execution
```

### Plugin Types

#### ParserPlugin
Extends JPE format support:
```python
class CustomFormatParser(ParserPlugin):
    format_name = "myformat"
    def parse(self, file_path) -> ProjectIR
```

#### GeneratorPlugin
Generates custom output formats:
```python
class CustomFormatGen(GeneratorPlugin):
    format_name = "myformat_xml"
    def generate(self, ir, output_path) -> bool
```

#### ValidatorPlugin
Adds custom validation rules:
```python
class CustomValidator(ValidatorPlugin):
    rule_name = "custom_rules"
    def validate(self, ir) -> List[ValidationError]
```

---

## Cloud Architecture

### REST API Structure

```
/api/v1/
├── /auth
│   ├── POST /login
│   ├── POST /logout
│   └── POST /refresh
├── /projects
│   ├── GET /                 # List projects
│   ├── POST /                # Create project
│   ├── GET /:id              # Get project
│   ├── PUT /:id              # Update project
│   └── DELETE /:id           # Delete project
├── /files
│   ├── GET /                 # List files
│   ├── POST /upload          # Upload file
│   ├── GET /:id/download     # Download file
│   └── DELETE /:id           # Delete file
└── /sync
    ├── GET /status           # Get sync status
    ├── POST /resolve         # Resolve conflicts
    └── POST /pull            # Pull from cloud
```

### Synchronization Strategy

```
Local State       Cloud State       Resolution
─────────────────────────────────────────────
1.0               1.0        →      1.0 (in sync)
2.0               1.0        →      Conflict (local ahead)
1.0               2.0        →      Conflict (cloud ahead)
2.0               2.0        →      2.0 (in sync)
2.0 (modified)    1.0 (old)  →      Conflict (local changed)
```

**Conflict Resolution Options**:
- Keep local
- Accept cloud
- Merge (if compatible)

---

## Theme System

### Theme Architecture

```
ThemeManager
├── Load theme configuration
├── Apply colors to components
├── Update on theme change
└── Persist user preference

Available Themes:
├── Cyberpunk Neon (#EC127C, #0F0E11)
├── Sunset Glow (#FFA500, #2C1B00)
├── Forest Twilight (#2D5016, #0A0A0A)
├── Ocean Depths (#003A70, #001F2D)
├── Vintage Paper (#8B7355, #FFF8DC)
├── Cosmic Void (#8B00FF, #0A0000)
├── Tropical Paradise (#FF6B6B, #1B4332)
├── Ice Crystal (#E0FFFF, #003D5C)
├── Desert Sunset (#CC6600, #1A0000)
└── Midnight Purple (#6A0572, #0D0015)

Color Scheme Per Theme:
├── foreground: Text color
├── background: Window color
├── accent: Interactive elements
└── warning: Error/alert color
```

---

## Performance Considerations

### Async Operations

Long-running operations execute asynchronously:

```python
@async_operation
def build_project(project_path):
    """Runs in thread pool, UI stays responsive"""
    pass

# UI calls it without blocking
future = build_project(project_path)
monitor_progress(future)
```

### Caching Strategy

```
Parsed Files Cache
├─ Filename → Parsed AST
├─ Invalidate on file change
└─ TTL: 5 minutes

Validation Results Cache
├─ File content hash → Errors
├─ Invalidate on content change
└─ TTL: 1 minute

Generated XML Cache
├─ IR object ID → XML string
├─ Invalidate on rebuild
└─ TTL: Build session
```

### Memory Management

- **Project files**: Loaded on-demand
- **Large files**: Streamed processing
- **Cache**: LRU eviction when full
- **Monitoring**: Track heap usage in diagnostics

---

## Security Architecture

### Input Validation

```
User Input
    ↓
Sanitizer (removes dangerous chars)
    ↓
Validator (checks format/range)
    ↓
Accepted ✓ or Rejected ✗
```

### Path Protection

```
Requested Path
    ↓
Canonical conversion
    ↓
Check within project root
    ↓
Allow ✓ or Deny ✗ (directory traversal)
```

### Credential Storage

```
User Credential
    ↓
Derive encryption key (PBKDF2)
    ↓
Encrypt with AES-256-CBC
    ↓
Store in ~/.config/jpe/
    ↓
Retrieve: Decrypt on demand
```

---

## Testing Architecture

### Test Organization

```
tests/
├── test_engine.py           # Core engine tests
├── test_ir.py               # IR object tests
├── test_parsers.py          # Parser tests
├── test_validators.py       # Validator tests
├── test_generators.py       # Generator tests
├── test_plugins.py          # Plugin system tests
├── test_cloud.py            # Cloud API tests
├── test_ui.py               # UI component tests
└── fixtures/
    └── sample_projects/     # Test data
```

### Coverage Requirements

| Module | Target |
|--------|--------|
| engine | 95% |
| validation | 95% |
| diagnostics | 85% |
| cloud | 90% |
| plugins | 80% |
| ui | 70% |
| **Overall** | **80%+** |

---

## Deployment Architecture

### Build Artifacts

```
distribution/
├── jpe-sims4-1.0.0-py3-none-any.whl    # Pip package
├── jpe-sims4-1.0.0.tar.gz              # Source distribution
├── jpe-installer-1.0.0.exe             # Windows installer
├── jpe-sims4-1.0.0.dmg                 # macOS installer
└── jpe-sims4_1.0.0.deb                 # Debian/Ubuntu
```

### Installation Methods

```
┌─────────────────────────────────────┐
│    Installation Methods             │
├──────────────┬──────────┬───────────┤
│   pip        │ Native   │  From Src │
│   install    │ Installer│  Build    │
└──────────────┴──────────┴───────────┘
     │             │            │
     └─────────────┴────────────┘
              │
     ┌────────▼─────────┐
     │  Same Backend    │
     │   (Python + Qt)  │
     └──────────────────┘
```

---

## Extension Points

### How to Extend

#### Add New Parser Format
1. Create `engine/parsers/new_format_parser.py`
2. Inherit from `ParserPlugin`
3. Implement `parse()` method
4. Place in `plugins/` to auto-discover

#### Add New Output Format
1. Create `engine/generators/new_format_gen.py`
2. Inherit from `GeneratorPlugin`
3. Implement `generate()` method
4. Plugin manager auto-registers

#### Add Validation Rules
1. Create `engine/validation/custom_rules.py`
2. Inherit from `ValidatorPlugin`
3. Implement `validate()` method
4. Integrate with validation pipeline

---

## Performance Profile

### Typical Build Times

| Project Size | Parse | Validate | Generate | Total |
|--------------|-------|----------|----------|-------|
| 10 files | 100ms | 50ms | 150ms | 300ms |
| 100 files | 500ms | 200ms | 700ms | 1400ms |
| 1000 files | 4s | 1.5s | 5s | 10.5s |

### Memory Usage

| Phase | Memory |
|-------|--------|
| Idle | ~150MB |
| Building small project | ~200MB |
| Building large project | ~500MB |
| Peak (100+ file project) | ~800MB |

---

## Design Patterns Used

### Patterns in This Project

1. **Pipeline Pattern**: Parser → Validator → Generator
2. **Strategy Pattern**: Multiple parsers/generators
3. **Plugin Pattern**: Dynamic extension system
4. **Singleton**: ConfigManager, ThemeManager
5. **Factory**: Error creation by type
6. **Observer**: UI updates on build progress
7. **Repository**: Project file storage
8. **Adapter**: Convert between formats

---

**Version**: 1.0.0 | **Last Updated**: December 2024

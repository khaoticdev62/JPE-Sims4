# JPE API Reference Documentation

**Audience**: Software developers integrating JPE into their tools
**Version**: 1.0
**Last Updated**: December 8, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Core Engine API](#core-engine-api)
3. [File Type Support API](#file-type-support-api)
4. [Error Handling](#error-handling)
5. [Plugin Development](#plugin-development)
6. [Type Reference](#type-reference)
7. [Examples](#examples)
8. [Best Practices](#best-practices)

---

## Overview

The JPE API allows developers to integrate the Sims 4 mod translation engine into their own applications. It provides both high-level and low-level interfaces for building, validating, and managing mods.

### Core Modules

```
jpe_sims4/
├── engine/
│   ├── engine.py              # Main translation engine
│   ├── ir.py                  # Intermediate representation (data model)
│   ├── parsers/               # Input format handlers
│   ├── generators/            # Output format handlers
│   ├── validation/            # Validation system
│   └── sims4_file_support.py  # File type support
├── diagnostics/
│   ├── errors.py              # Error types and severity
│   ├── reports.py             # Report generation
│   └── logging.py             # Performance monitoring
├── plugins/
│   ├── manager.py             # Plugin orchestration
│   ├── registry.py            # Plugin registry
│   └── base.py                # Plugin base classes
└── config/
    └── config_manager.py      # Configuration and secrets
```

---

## Core Engine API

### TranslationEngine Class

**Purpose**: Orchestrates the entire translation pipeline

**Location**: `engine/engine.py`

#### Initialization

```python
from pathlib import Path
from engine.engine import TranslationEngine, EngineConfig

# Configure the engine
config = EngineConfig(
    project_root=Path("/path/to/project"),
    reports_directory=Path("/path/to/project/build")
)

# Create engine instance
engine = TranslationEngine(config)
```

**Parameters**:
- `project_root` (Path): Root directory of the JPE project
- `reports_directory` (Path): Directory for build reports

---

#### Method: build_from_jpe()

**Purpose**: Execute full build pipeline from JPE sources

**Signature**:
```python
def build_from_jpe(self, build_id: str) -> BuildReport
```

**Parameters**:
- `build_id` (str): Unique identifier for this build

**Returns**:
- `BuildReport`: Complete build results with errors and status

**Example**:
```python
report = engine.build_from_jpe("build_001")

if report.success:
    print("Build succeeded!")
    print(f"Generated {len(report.outputs)} files")
else:
    print("Build failed")
    for error in report.errors:
        print(f"  - {error.message_short}")
```

**Workflow**:
1. Parse JPE files → IR
2. Apply transform plugins
3. Validate IR
4. Generate Sims 4 XML
5. Apply generator plugins
6. Return report

---

#### Method: validate_project()

**Purpose**: Validate a project without building

**Signature**:
```python
def validate_project(self) -> List[EngineError]
```

**Returns**:
- List of validation errors (empty if valid)

**Example**:
```python
errors = engine.validate_project()
if errors:
    for error in errors:
        print(f"Error: {error.message_short}")
else:
    print("Project is valid")
```

---

### BuildReport Class

**Location**: `diagnostics/reports.py`

**Properties**:
```python
@dataclass
class BuildReport:
    build_id: str
    success: bool
    timestamp: datetime
    duration_ms: float

    # Error tracking
    errors: List[EngineError]
    warnings: List[EngineError]

    # Output files
    outputs: List[Path]

    # Metadata
    file_count: int
    interaction_count: int
    buff_count: int
    trait_count: int
```

**Methods**:
```python
# Check if build succeeded
if report.success:
    # ...

# Get errors by severity
critical_errors = [e for e in report.errors
                   if e.severity == ErrorSeverity.CRITICAL]

# Get output file paths
for output_file in report.outputs:
    print(f"Generated: {output_file}")
```

---

## File Type Support API

### Sims4FileManager Class

**Location**: `engine/sims4_file_support.py`

**Purpose**: Unified interface for file operations across all Sims 4 formats

#### Initialization

```python
from engine.sims4_file_support import create_file_manager

manager = create_file_manager()
```

Or manually:
```python
from engine.sims4_file_support import Sims4FileManager

manager = Sims4FileManager()
```

---

#### Method: detect_and_get_metadata()

**Purpose**: Detect file type and gather metadata

**Signature**:
```python
def detect_and_get_metadata(self, file_path: Path) -> Sims4FileMetadata
```

**Parameters**:
- `file_path` (Path): Path to the file

**Returns**:
- `Sims4FileMetadata`: File information

**Example**:
```python
from pathlib import Path

metadata = manager.detect_and_get_metadata(Path("interaction.xml"))

print(f"Type: {metadata.file_type.value}")
print(f"Format: {metadata.file_format.value}")
print(f"Size: {metadata.size_bytes} bytes")
```

---

#### Method: validate_file()

**Purpose**: Validate file structure and content

**Signature**:
```python
def validate_file(self, file_path: Path) -> Sims4FileValidationResult
```

**Returns**:
- `Sims4FileValidationResult`: Validation outcome

**Example**:
```python
result = manager.validate_file(Path("greeting.interaction"))

if result.is_valid:
    print("File is valid")
    for info in result.info:
        print(f"  ✓ {info}")
else:
    print("File has errors:")
    for error in result.errors:
        print(f"  ✗ {error}")

if result.warnings:
    print("Warnings:")
    for warning in result.warnings:
        print(f"  ⚠ {warning}")
```

---

#### Method: read_file()

**Purpose**: Read and parse a Sims 4 file

**Signature**:
```python
def read_file(self, file_path: Path) -> Dict[str, Any]
```

**Returns**:
- Dictionary with parsed content

**Example**:
```python
content = manager.read_file(Path("interaction.xml"))

if "error" in content:
    print(f"Error reading file: {content['error']}")
else:
    print(f"Root element: {content['root_tag']}")
    print(f"Attributes: {content['attributes']}")
    print(f"Children: {content['children']}")
```

---

#### Method: write_file()

**Purpose**: Write content to a Sims 4 file

**Signature**:
```python
def write_file(self, file_path: Path, content: Dict[str, Any]) -> bool
```

**Parameters**:
- `file_path` (Path): Output file path
- `content` (Dict): File content

**Returns**:
- Boolean: Success status

**Example**:
```python
content = {
    "root_tag": "Interaction",
    "attributes": {
        "instance_id": "12345",
        "name": "MyInteraction"
    },
    "children": {}
}

success = manager.write_file(Path("output.interaction"), content)

if success:
    print("File written successfully")
else:
    print("Failed to write file")
```

---

#### Method: get_supported_file_types()

**Purpose**: List all supported file types

**Signature**:
```python
def get_supported_file_types(self) -> List[str]
```

**Returns**:
- List of supported file type names

**Example**:
```python
types = manager.get_supported_file_types()
print(f"Supported types: {', '.join(types)}")
# Output: interaction, tuning, package, stbl, snippet, xml, json
```

---

### Sims4FileMetadata Class

**Location**: `engine/sims4_file_support.py`

**Properties**:
```python
@dataclass
class Sims4FileMetadata:
    file_path: Path
    file_type: Sims4FileType
    file_format: Sims4FileFormat
    size_bytes: int
    is_valid: bool = True
    created_timestamp: Optional[str] = None
    modified_timestamp: Optional[str] = None
    encoding: str = "utf-8"
    properties: Dict[str, Any] = field(default_factory=dict)
```

**Methods**:
```python
# Convert to dictionary
metadata_dict = metadata.to_dict()

# Access properties
print(metadata.file_type.value)     # "interaction"
print(metadata.file_format.value)   # "xml"
print(metadata.size_bytes)          # 2048
```

---

## Error Handling

### EngineError Class

**Location**: `diagnostics/errors.py`

**Properties**:
```python
@dataclass
class EngineError:
    code: str                    # Error code (e.g., "PARSE_ERROR")
    category: ErrorCategory      # Error type
    severity: ErrorSeverity      # Critical/Warning/Info
    message_short: str           # Concise error message
    message_long: str            # Detailed explanation
    file_path: Optional[Path] = None
    line_number: Optional[int] = None
    suggestions: List[str] = field(default_factory=list)
```

**ErrorSeverity Enum**:
```python
class ErrorSeverity(Enum):
    CRITICAL = "critical"  # Blocks build
    ERROR = "error"        # Build issue
    WARNING = "warning"    # Potential problem
    INFO = "info"          # Informational
```

**ErrorCategory Enum**:
```python
class ErrorCategory(Enum):
    PARSE = "parse"
    VALIDATION = "validation"
    GENERATION = "generation"
    PLUGIN = "plugin"
    RUNTIME = "runtime"
```

**Example**:
```python
report = engine.build_from_jpe("build_001")

for error in report.errors:
    if error.severity == ErrorSeverity.CRITICAL:
        print(f"CRITICAL: {error.message_short}")
        if error.file_path:
            print(f"  File: {error.file_path}:{error.line_number}")
        if error.suggestions:
            print("  Suggestions:")
            for suggestion in error.suggestions:
                print(f"    - {suggestion}")
```

---

## Plugin Development

### Creating a Custom Parser Plugin

**Base Class**: `plugins.base.ParserPlugin`

**Example**:
```python
from plugins.base import ParserPlugin, PluginBase
from engine.ir import ProjectIR

class MyCustomParser(ParserPlugin):
    def name(self) -> str:
        return "My Custom Parser"

    def version(self) -> str:
        return "1.0.0"

    def supported_extensions(self) -> List[str]:
        return [".myformat"]

    def parse(self, file_path: Path) -> Tuple[ProjectIR, List[EngineError]]:
        """Parse custom format to IR"""
        try:
            # Read file
            content = file_path.read_text()

            # Parse content
            # ... your parsing logic ...

            # Return IR and errors
            return project_ir, errors
        except Exception as e:
            return None, [EngineError(...)]
```

---

### Creating a Custom Generator Plugin

**Base Class**: `plugins.base.GeneratorPlugin`

**Example**:
```python
from plugins.base import GeneratorPlugin

class MyCustomGenerator(GeneratorPlugin):
    def name(self) -> str:
        return "My Custom Generator"

    def version(self) -> str:
        return "1.0.0"

    def supported_output_format(self) -> str:
        return "myformat"

    def generate(self, ir: ProjectIR, target_directory: Path) -> List[EngineError]:
        """Generate custom format from IR"""
        try:
            # Convert IR to custom format
            # ... your generation logic ...

            # Write output files
            output_file = target_directory / "output.myformat"
            output_file.write_text(generated_content)

            return []  # No errors
        except Exception as e:
            return [EngineError(...)]
```

---

### Registering Plugins

Plugins are automatically discovered in the `plugins/` directory:

```
plugins/
├── my_parser.py
├── my_generator.py
└── __init__.py
```

---

## Type Reference

### Core Intermediate Representation (IR)

**Location**: `engine/ir.py`

#### ProjectIR Class

```python
@dataclass
class ProjectIR:
    metadata: ProjectMetadata
    interactions: Dict[str, Interaction]
    buffs: Dict[str, Buff]
    traits: Dict[str, Trait]
    enums: Dict[str, EnumDefinition]
    loot_actions: Dict[str, LootAction]
```

**Example**:
```python
for interaction_id, interaction in ir.interactions.items():
    print(f"Interaction: {interaction.name}")
    print(f"  Duration: {interaction.duration}s")
    print(f"  Tests: {len(interaction.tests)} conditions")
    print(f"  Effects: {len(interaction.effects)} effects")
```

---

#### Interaction Class

```python
@dataclass
class Interaction:
    name: str
    description: Optional[str]
    instance_id: Optional[str]
    interaction_type: InteractionType
    duration: int
    tests: List[TestCondition]
    effects: List[Effect]
    category: Optional[str]
    cost: int = 0
    is_autonomous: bool = False
    priority: int = 100
```

---

#### Buff Class

```python
@dataclass
class Buff:
    name: str
    description: Optional[str]
    instance_id: Optional[str]
    mood_type: MoodType
    intensity: int  # 1-4
    duration: int  # seconds
    mood_gain: int  # -100 to +100
    icon: Optional[str]
    visible: bool = True
```

---

#### TestCondition Class

```python
@dataclass
class TestCondition:
    condition_type: str
    parameters: Dict[str, Any]
    negate: bool = False

    def __str__(self) -> str:
        # Returns human-readable condition
        pass
```

---

#### Effect Class

```python
@dataclass
class Effect:
    effect_type: str
    parameters: Dict[str, Any]

    def __str__(self) -> str:
        # Returns human-readable effect
        pass
```

---

## Examples

### Complete Build Pipeline Example

```python
from pathlib import Path
from engine.engine import TranslationEngine, EngineConfig
from diagnostics.errors import ErrorSeverity

# 1. Configure
config = EngineConfig(
    project_root=Path("./my_mod"),
    reports_directory=Path("./my_mod/build")
)

# 2. Create engine
engine = TranslationEngine(config)

# 3. Build
print("Building mod...")
report = engine.build_from_jpe("v1.0.0")

# 4. Analyze results
if report.success:
    print(f"✓ Build successful!")
    print(f"  Generated {len(report.outputs)} files")
    print(f"  {report.interaction_count} interactions")
    print(f"  {report.buff_count} buffs")
else:
    print("✗ Build failed")

    critical = [e for e in report.errors
                if e.severity == ErrorSeverity.CRITICAL]
    warnings = [e for e in report.warnings]

    print(f"\nCritical errors ({len(critical)}):")
    for error in critical:
        print(f"  {error.message_short}")

    print(f"\nWarnings ({len(warnings)}):")
    for warning in warnings:
        print(f"  {warning.message_short}")

# 5. Output files
for output_path in report.outputs:
    print(f"Generated: {output_path}")
```

---

### File Validation Example

```python
from pathlib import Path
from engine.sims4_file_support import create_file_manager

manager = create_file_manager()

# Find all interaction files
for interaction_file in Path("./mods").glob("*.interaction"):
    result = manager.validate_file(interaction_file)

    status = "✓" if result.is_valid else "✗"
    print(f"{status} {interaction_file.name}")

    if not result.is_valid:
        for error in result.errors:
            print(f"    Error: {error}")

    if result.warnings:
        for warning in result.warnings:
            print(f"    Warning: {warning}")
```

---

### Custom Plugin Example

```python
from pathlib import Path
from plugins.base import ParserPlugin
from engine.ir import ProjectIR, Interaction
from diagnostics.errors import EngineError

class JsonParser(ParserPlugin):
    """Parse JSON-format mod definitions"""

    def name(self) -> str:
        return "JSON Format Parser"

    def version(self) -> str:
        return "1.0.0"

    def supported_extensions(self) -> List[str]:
        return [".jpe.json"]

    def parse(self, file_path: Path) -> Tuple[ProjectIR, List[EngineError]]:
        import json

        errors = []

        try:
            # Load JSON
            with open(file_path) as f:
                data = json.load(f)

            # Create IR
            ir = ProjectIR(metadata=...)

            # Parse interactions from JSON
            for interaction_data in data.get("interactions", []):
                interaction = Interaction(
                    name=interaction_data["name"],
                    description=interaction_data.get("description"),
                    # ... more fields ...
                )
                ir.interactions[interaction.name] = interaction

            return ir, errors

        except json.JSONDecodeError as e:
            errors.append(EngineError(
                code="PARSE_ERROR",
                category=ErrorCategory.PARSE,
                severity=ErrorSeverity.ERROR,
                message_short=f"Invalid JSON: {e}",
                message_long=str(e),
                file_path=file_path,
                line_number=e.lineno
            ))
            return None, errors
```

---

## Best Practices

### 1. Always Check Report Success

```python
report = engine.build_from_jpe("build_001")

# DON'T do this:
output_files = report.outputs  # Might be empty!

# DO this:
if report.success:
    output_files = report.outputs
else:
    handle_build_error(report.errors)
```

---

### 2. Categorize Errors by Severity

```python
critical_errors = [e for e in report.errors
                   if e.severity == ErrorSeverity.CRITICAL]
warnings = [e for e in report.errors
            if e.severity == ErrorSeverity.WARNING]

if critical_errors:
    # Abort build
    raise BuildException(critical_errors[0].message_short)

if warnings:
    # Log but continue
    for warning in warnings:
        logger.warning(warning.message_short)
```

---

### 3. Use Error Suggestions

```python
for error in report.errors:
    print(f"Error: {error.message_short}")
    if error.suggestions:
        print("  Try this:")
        for suggestion in error.suggestions:
            print(f"    - {suggestion}")
```

---

### 4. Cache Metadata

```python
# Good: Cache frequent lookups
metadata_cache = {}

def get_metadata(file_path):
    if file_path not in metadata_cache:
        metadata_cache[file_path] = manager.detect_and_get_metadata(file_path)
    return metadata_cache[file_path]
```

---

### 5. Clear Cache When Needed

```python
# Clear metadata cache if files changed
manager.clear_cache()

# Rebuild with fresh metadata
report = engine.build_from_jpe("build_002")
```

---

## API Versioning

This API document describes **JPE API v1.0**

**Stability Guarantee**: The public API (methods prefixed without `_`) is stable and backward compatible within major versions.

**Internal API**: Methods prefixed with `_` are internal and subject to change without notice.

---

## Troubleshooting

### Build Fails with "Unknown Module"

**Cause**: Plugin not discovered
**Solution**: Ensure plugin is in `plugins/` directory with proper `__init__.py`

```bash
ls -la plugins/
```

---

### File Validation Always Fails

**Cause**: Missing handler for file type
**Solution**: Check `manager.get_supported_file_types()`

```python
types = manager.get_supported_file_types()
if "mytype" not in types:
    # Register custom handler
    manager._registry.register(MyCustomHandler())
```

---

### Slow Build Performance

**Cause**: Too many validation checks
**Solution**: Use caching and async operations

```python
# Cache metadata
metadata = manager.detect_and_get_metadata(path)

# Reuse for multiple operations
if not metadata.is_valid:
    # Skip further processing
    continue
```

---

## FAQ

**Q: Can I use JPE in my commercial application?**
A: Yes, if it's released under compatible license (check LICENSE file).

**Q: How do I contribute plugins?**
A: Submit pull requests to the repository following the plugin development guidelines.

**Q: What's the maximum mod size?**
A: No hard limit, but very large mods may be slow. Consider splitting into multiple mods.

**Q: Can I embed the engine in a web service?**
A: Yes, but be aware of resource constraints. Use caching and rate limiting.

---

**For more help, see**:
- JPE Master Bible: `JPE_MASTER_BIBLE.md`
- Advanced Patterns: `JPE_ADVANCED_PATTERNS.md`
- Sims 4 File Support: `SIMS4_FILE_TYPE_SUPPORT.md`

---

**Generated with Claude Code**
**Version**: 1.0
**Last Updated**: December 8, 2025

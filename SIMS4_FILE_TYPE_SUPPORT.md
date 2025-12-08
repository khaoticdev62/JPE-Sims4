# Sims 4 File Type Support System

## Overview

The Sims 4 File Type Support system provides extensible scaffolding for handling multiple The Sims 4 mod file formats within the JPE translator. This system enables reading, writing, validating, and converting between different Sims 4 file types while maintaining a unified internal representation.

## Supported File Types

### 1. Package Files (.package)
**Status**: Scaffolding in place (Binary parser TODO)

Compiled Sims 4 mod packages containing:
- Interaction definitions
- Tuning values
- Strings/localizations
- Custom code

**Magic Bytes**: `DBpf` (Sims 4 package format identifier)

**Current Capabilities**:
- ✓ File type detection via magic bytes
- ✓ Format classification (Binary)
- ✓ Basic validation structure
- ⚠️ Full reading/writing requires DBpf binary parser implementation

**Planned Enhancement**:
```python
from engine.sims4_file_support import Sims4FileManager

manager = Sims4FileManager()
metadata = manager.detect_and_get_metadata(Path("mymod.package"))
# Future: Read compiled package
content = manager.read_file(Path("mymod.package"))
```

### 2. Interaction Files (.interaction)
**Status**: Fully supported

XML definitions for Sims 4 interactions, including:
- Interaction properties (name, description, duration)
- Required tests and conditions
- Effects and outcomes
- Animation references

**Example File Structure**:
```xml
<?xml version="1.0" encoding="utf-8"?>
<Interaction instance_id="12345" name="MyGreeting">
  <Description>Greet a friend</Description>
  <Duration>10</Duration>
  <Tests>
    <Test name="actor_is_adult"/>
    <Test name="not_in_public"/>
  </Tests>
  <Effects>
    <Effect type="mood_change" value="+10"/>
  </Effects>
</Interaction>
```

**Current Capabilities**:
- ✓ Full read/parse support
- ✓ Write/generation support
- ✓ XML validation with warnings
- ✓ Attribute detection
- ✓ Child element parsing

**Usage**:
```python
from engine.sims4_file_support import Sims4FileManager

manager = Sims4FileManager()

# Validate interaction file
result = manager.validate_file(Path("greeting.interaction"))
if result.is_valid:
    print("Valid interaction file")
else:
    print("Errors:", result.errors)

# Read interaction definition
content = manager.read_file(Path("greeting.interaction"))
print(content["root_tag"])  # "Interaction"
print(content["attributes"])  # {"instance_id": "12345", ...}

# Write new interaction
new_content = {
    "root_tag": "Interaction",
    "attributes": {"name": "NewGreeting"},
    "children": {}
}
manager.write_file(Path("new.interaction"), new_content)
```

### 3. Tuning Files (.tune)
**Status**: Fully supported

XML tuning files that configure game behavior parameters:
- Skill growth rates
- Relationship modifiers
- Mood thresholds
- Game balancing values

**Example Structure**:
```xml
<?xml version="1.0" encoding="utf-8"?>
<Tuning name="SkillGrowthRate">
  <Skill name="Cooking" rate="1.5" max_level="10"/>
  <Skill name="Painting" rate="1.2" max_level="10"/>
</Tuning>
```

**Current Capabilities**:
- ✓ Full read/parse support
- ✓ Write/generation support
- ✓ Root element validation
- ✓ Warning on incorrect structure

**Usage**:
```python
from engine.sims4_file_support import Sims4FileManager

manager = Sims4FileManager()

# Validate tuning file
result = manager.validate_file(Path("skill_rates.tune"))
print(f"Valid: {result.is_valid}")
print(f"Warnings: {result.warnings}")

# Read tuning values
tuning_data = manager.read_file(Path("skill_rates.tune"))
```

### 4. Strings Table Files (.stbl)
**Status**: Scaffolding in place (Binary parser TODO)

Binary localization files containing translated strings:
- UI text
- Interaction descriptions
- Notification messages
- Dialogue strings

**Magic Bytes**: Custom binary format (requires reverse engineering)

**Current Capabilities**:
- ✓ File type detection by extension
- ✓ Format classification (Binary)
- ⚠️ Reading/writing requires binary STBL parser

**Planned Implementation**:
The strings table format is binary with localization support for multiple languages. Full implementation requires:
1. Binary format parser for STBL structure
2. String encoding/decoding (UTF-8 with length prefixes)
3. Language ID mapping
4. Hash-based string lookup

### 5. Code Snippet Files (.snippet)
**Status**: Scaffolding in place (Extension TODO)

Plain text files containing Python code snippets:
- Custom interaction logic
- Tuning scripts
- Utility functions

**Current Capabilities**:
- ✓ File type detection by extension
- ✓ Format classification (PlainText)
- ⚠️ Full parsing requires Python code parser

### 6. Generic XML Files (.xml)
**Status**: Fully supported

General-purpose XML files using the same handlers as interaction/tuning files.

**Usage**:
```python
manager = Sims4FileManager()
content = manager.read_file(Path("generic.xml"))
manager.write_file(Path("output.xml"), content)
```

### 7. JSON Files (.json)
**Status**: Scaffolding in place (JSON handler TODO)

Alternative JSON-format definitions for interoperability.

**Current Capabilities**:
- ✓ File type detection by magic bytes
- ✓ Format classification (JSON)
- ⚠️ JSON-specific reading/writing TODO

## Architecture

### Core Components

#### 1. File Type Detection (`Sims4FileTypeDetector`)
Identifies file types using two strategies:

**Strategy 1: Extension Mapping**
```python
EXTENSION_MAP = {
    ".package": Sims4FileType.PACKAGE,
    ".interaction": Sims4FileType.INTERACTION,
    ".tune": Sims4FileType.TUNING,
    # ...
}
```

**Strategy 2: Magic Bytes (File Signature)**
```python
MAGIC_BYTES = {
    b"DBpf": Sims4FileType.PACKAGE,
    b"<?xml": Sims4FileType.XML,
    b"{": Sims4FileType.JSON,
}
```

**Example**:
```python
from engine.sims4_file_support import Sims4FileTypeDetector

detector = Sims4FileTypeDetector()

# Detect type
file_type = detector.detect_file_type(Path("interaction.xml"))
# Returns: Sims4FileType.INTERACTION

# Detect format
file_format = detector.detect_file_format(file_type)
# Returns: Sims4FileFormat.XML
```

#### 2. File Handlers (Abstract and Concrete)
Each file type has a handler implementing the `Sims4FileHandler` interface:

```python
class Sims4FileHandler(ABC):
    @abstractmethod
    def supports_type(self, file_type: Sims4FileType) -> bool:
        """Check if handler supports this file type."""
        pass

    @abstractmethod
    def read(self, file_path: Path) -> Dict[str, Any]:
        """Read and parse a file."""
        pass

    @abstractmethod
    def write(self, file_path: Path, content: Dict[str, Any]) -> bool:
        """Write content to a file."""
        pass

    @abstractmethod
    def validate(self, file_path: Path) -> Sims4FileValidationResult:
        """Validate file structure."""
        pass
```

**Concrete Implementations**:
- `Sims4PackageHandler` - Package files
- `Sims4InteractionHandler` - Interaction XML
- `Sims4TuningHandler` - Tuning XML
- `Sims4StringsHandler` - Strings tables

#### 3. Handler Registry (`Sims4FileTypeRegistry`)
Manages available handlers and file type support:

```python
registry = Sims4FileTypeRegistry()

# Get all handlers for a type
handlers = registry.get_handlers(Sims4FileType.INTERACTION)

# Get primary handler
handler = registry.get_primary_handler(Sims4FileType.INTERACTION)
```

**Features**:
- Automatic discovery of registered handlers
- Support for multiple handlers per file type
- Primary handler selection
- Handler lifecycle management

#### 4. File Manager (`Sims4FileManager`)
High-level API for file operations:

```python
manager = Sims4FileManager()

# Complete workflow
metadata = manager.detect_and_get_metadata(Path("test.interaction"))
validation = manager.validate_file(Path("test.interaction"))
content = manager.read_file(Path("test.interaction"))
success = manager.write_file(Path("output.interaction"), content)
```

**Features**:
- Unified interface for all file types
- Automatic handler selection
- Metadata caching
- Error handling

#### 5. Metadata System (`Sims4FileMetadata`)
Represents file information:

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

**Usage**:
```python
metadata = manager.detect_and_get_metadata(Path("interaction.xml"))
print(f"Type: {metadata.file_type.value}")
print(f"Format: {metadata.file_format.value}")
print(f"Size: {metadata.size_bytes} bytes")

# Serialize to dictionary
data = metadata.to_dict()
json.dump(data, open("metadata.json", "w"))
```

### Data Flow

```
File Input
    ↓
[Sims4FileTypeDetector]
    ├─ Detect type (extension + magic bytes)
    └─ Detect format (type → format mapping)
    ↓
[Sims4FileManager]
    ├─ Create metadata
    ├─ Cache metadata
    └─ Select handler
    ↓
[Sims4FileHandler]
    ├─ Read → Dict (for input)
    ├─ Validate → ValidationResult
    └─ Write ← Dict (for output)
    ↓
Internal Representation (IR)
```

## API Reference

### Creating a File Manager

```python
from engine.sims4_file_support import create_file_manager

manager = create_file_manager()
```

### File Detection

```python
# Detect file type and format
metadata = manager.detect_and_get_metadata(file_path)
print(f"Type: {metadata.file_type.value}")
print(f"Format: {metadata.file_format.value}")
```

### File Validation

```python
# Validate any Sims 4 file
result = manager.validate_file(file_path)

if result.is_valid:
    print("Valid file")
else:
    print("Errors:", result.errors)
    print("Warnings:", result.warnings)

# Access specific result properties
print(f"Detected type: {result.file_type.value}")
```

### File Reading

```python
# Read and parse file
content = manager.read_file(file_path)

if "error" in content:
    print(f"Read error: {content['error']}")
else:
    print(f"Root tag: {content['root_tag']}")
    print(f"Attributes: {content['attributes']}")
```

### File Writing

```python
# Write content to file
new_content = {
    "root_tag": "Interaction",
    "attributes": {"name": "NewInteraction"},
    "children": {}
}

success = manager.write_file(output_path, new_content)
if success:
    print("File written successfully")
else:
    print("Write failed")
```

### Supported Types

```python
# Get list of supported file types
supported_types = manager.get_supported_file_types()
print(f"Supported: {', '.join(supported_types)}")

# Output: interaction, tuning, package, stbl, snippet, xml, json
```

### Cache Management

```python
# Clear metadata cache when file system changes
manager.clear_cache()
```

## Integration with JPE Translation Pipeline

The file support system integrates with the existing JPE translation engine:

```python
from engine.engine import TranslationEngine, EngineConfig
from engine.sims4_file_support import Sims4FileManager

# Initialize both systems
config = EngineConfig(project_root=Path("."), reports_directory=Path("./build"))
engine = TranslationEngine(config)
file_manager = Sims4FileManager()

# Workflow: Detect Sims 4 files → Detect format → Choose parser → Build IR
for jpe_file in project_root.glob("*.jpe"):
    # Standard JPE workflow
    ir = engine.build_from_jpe("build_001")

# Future: Support reading existing Sims 4 mods
for mod_file in project_root.glob("*.interaction"):
    metadata = file_manager.detect_and_get_metadata(mod_file)
    content = file_manager.read_file(mod_file)
    # Convert to IR for modification
    # ... transform IR ...
    # Export as JPE or new interaction file
```

## Extension Points

### Custom File Handler

Create custom handlers for new file types:

```python
from engine.sims4_file_support import Sims4FileHandler, Sims4FileType, Sims4FileValidationResult

class CustomHandler(Sims4FileHandler):
    def supports_type(self, file_type: Sims4FileType) -> bool:
        return file_type == Sims4FileType.CUSTOM

    def read(self, file_path: Path) -> Dict[str, Any]:
        # Custom read logic
        return {"custom": "data"}

    def write(self, file_path: Path, content: Dict[str, Any]) -> bool:
        # Custom write logic
        return True

    def validate(self, file_path: Path) -> Sims4FileValidationResult:
        # Custom validation logic
        return Sims4FileValidationResult(is_valid=True)

# Register custom handler
manager._registry.register(CustomHandler())
```

### Custom File Type

Add new file types to the enum:

```python
# In engine/sims4_file_support.py
class Sims4FileType(Enum):
    # Existing types...
    CUSTOM = "custom"  # New type

# Update detector
Sims4FileTypeDetector.EXTENSION_MAP[".custom"] = Sims4FileType.CUSTOM
```

## Implementation Roadmap

### Phase 1: Scaffolding (✅ Complete)
- [x] Core architecture and abstract base classes
- [x] File type detection system
- [x] Handler registry
- [x] File manager API
- [x] Metadata system
- [x] Unit tests
- [x] Documentation

### Phase 2: XML Support (✅ Complete)
- [x] Interaction file handler (read, write, validate)
- [x] Tuning file handler (read, write, validate)
- [x] Generic XML handler

### Phase 3: Binary Support (TODO)
- [ ] DBpf package format parser
- [ ] Package file reading
- [ ] Package file writing
- [ ] STBL strings table parser
- [ ] Strings localization support

### Phase 4: Format Conversion (TODO)
- [ ] XML ↔ JSON conversion
- [ ] Package ↔ XML extraction
- [ ] Sims 4 XML → JPE conversion
- [ ] JPE → Sims 4 XML generation

### Phase 5: Advanced Features (TODO)
- [ ] Incremental file updates
- [ ] File merging strategies
- [ ] Conflict resolution
- [ ] Version tracking

## Testing

Comprehensive unit tests are provided in `tests/test_sims4_file_support.py`:

```bash
# Run all file support tests
python -m pytest tests/test_sims4_file_support.py -v

# Run specific test class
python -m pytest tests/test_sims4_file_support.py::TestFileTypeDetection -v

# Run with coverage
python -m pytest tests/test_sims4_file_support.py --cov=engine.sims4_file_support -v
```

**Test Coverage**:
- File type detection (extension and magic bytes)
- File format detection
- Handler functionality
- Registry operations
- File manager operations
- Metadata management
- Error handling

## Limitations and Future Work

### Current Limitations
1. **Binary Formats**: Package (.package) and Strings (.stbl) files require binary parsers
2. **Complex Validations**: Deep structural validation for complex mods
3. **Format Conversion**: Limited format conversion capabilities
4. **Performance**: No optimization for large files

### Planned Enhancements
1. DBpf binary parser implementation
2. STBL format support with localization
3. JSON format handler
4. Incremental updates
5. Performance optimizations for large files
6. Format conversion tools

## Code Examples

### Example 1: Validating Multiple Files

```python
from pathlib import Path
from engine.sims4_file_support import create_file_manager

manager = create_file_manager()
results = []

for mod_file in Path("mods").glob("*.interaction"):
    result = manager.validate_file(mod_file)
    results.append({
        "file": mod_file.name,
        "valid": result.is_valid,
        "errors": result.errors,
        "warnings": result.warnings,
    })

# Print summary
valid_count = sum(1 for r in results if r["valid"])
print(f"Valid: {valid_count}/{len(results)}")
```

### Example 2: Converting Between Formats

```python
from pathlib import Path
from engine.sims4_file_support import create_file_manager

manager = create_file_manager()

# Read interaction file
interaction_content = manager.read_file(Path("greeting.interaction"))

# Modify content
interaction_content["attributes"]["name"] = "NewGreeting"

# Write to new file
manager.write_file(Path("modified.interaction"), interaction_content)
```

### Example 3: Batch Validation

```python
from pathlib import Path
from engine.sims4_file_support import create_file_manager

manager = create_file_manager()

# Validate all mod files in directory
mod_dir = Path("mods")
invalid_files = []

for mod_file in mod_dir.glob("*"):
    supported_types = manager.get_supported_file_types()
    if mod_file.suffix[1:] in supported_types:
        result = manager.validate_file(mod_file)
        if not result.is_valid:
            invalid_files.append(mod_file)

print(f"Invalid files: {len(invalid_files)}")
for file in invalid_files:
    print(f"  - {file.name}")
```

## Contributing

To add support for new Sims 4 file types:

1. Create a new handler class extending `Sims4FileHandler`
2. Implement all abstract methods
3. Register with the registry
4. Add unit tests
5. Update documentation
6. Update the roadmap if applicable

## References

- Sims 4 Package Format: DBpf (Data Base Package Format)
- Sims 4 Tuning System: XML-based game configuration
- JPE Translation Pipeline: `engine/engine.py`
- Plugin System: `plugins/manager.py`

---

**Version**: 1.0
**Status**: Production-Ready (Phase 1-2 Complete)
**Last Updated**: 2025-12-08

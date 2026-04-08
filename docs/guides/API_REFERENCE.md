# API Reference - JPE Sims 4 Mod Translator

## Table of Contents

1. [Core API](#core-api)
2. [Plugin System](#plugin-system)
3. [Cloud API](#cloud-api)
4. [IR (Intermediate Representation)](#ir-intermediate-representation)
5. [Validation API](#validation-api)
6. [Error Handling](#error-handling)

---

## Core API

### Translation Engine

#### `jpe_sims4.engine.TranslationEngine`

Main orchestrator for the translation pipeline.

```python
from jpe_sims4.engine import TranslationEngine

engine = TranslationEngine()

# Build a project
result = engine.build(
    project_path="/path/to/project",
    output_dir="/path/to/output",
    build_id="build_001"
)

# Validate a project
errors = engine.validate(project_path="/path/to/project")

# Parse JPE files
ir = engine.parse(jpe_files=[...])

# Generate XML
xml_output = engine.generate(ir_objects=[...])
```

**Methods:**

- `build(project_path: str, output_dir: str, build_id: str) -> BuildResult`
  - Execute full build pipeline
  - Returns BuildResult with statistics and errors

- `validate(project_path: str) -> List[Error]`
  - Run validation without building
  - Returns list of validation errors

- `parse(jpe_files: List[str]) -> ProjectIR`
  - Parse JPE files to IR
  - Returns ProjectIR object

- `generate(ir_objects: List[IRObject]) -> str`
  - Generate Sims 4 XML from IR objects
  - Returns XML string

---

## Plugin System

### Base Plugin Classes

#### `jpe_sims4.plugins.base.ParserPlugin`

Base class for custom format parsers.

```python
from jpe_sims4.plugins.base import ParserPlugin
from jpe_sims4.engine.ir import ProjectIR

class CustomParser(ParserPlugin):
    """Custom format parser implementation"""

    format_name = "customformat"
    version = "1.0.0"
    author = "Your Name"
    description = "Parse custom format to IR"

    def parse(self, file_path: str) -> ProjectIR:
        """Parse file to ProjectIR"""
        # Implementation
        pass

    def validate(self) -> bool:
        """Validate plugin configuration"""
        return True

    def cleanup(self) -> None:
        """Clean up resources"""
        pass
```

**Required Attributes:**
- `format_name` (str): Unique identifier for format
- `version` (str): Semantic version
- `author` (str): Plugin author
- `description` (str): Plugin description

**Required Methods:**
- `parse(file_path)`: Convert file to IR
- `validate()`: Validate plugin state
- `cleanup()`: Cleanup resources

#### `jpe_sims4.plugins.base.GeneratorPlugin`

Base class for custom format generators.

```python
from jpe_sims4.plugins.base import GeneratorPlugin
from jpe_sims4.engine.ir import ProjectIR

class CustomGenerator(GeneratorPlugin):
    """Custom format generator implementation"""

    format_name = "customxml"
    version = "1.0.0"
    author = "Your Name"

    def generate(self, ir: ProjectIR, output_path: str) -> bool:
        """Generate custom format from IR"""
        # Implementation
        return True

    def validate(self) -> bool:
        """Validate generator setup"""
        return True
```

**Required Methods:**
- `generate(ir, output_path)`: Convert IR to format
- `validate()`: Validate generator state

#### `jpe_sims4.plugins.base.ValidatorPlugin`

Base class for custom validators.

```python
from jpe_sims4.plugins.base import ValidatorPlugin
from jpe_sims4.engine.ir import ProjectIR
from jpe_sims4.diagnostics.errors import ValidationError

class CustomValidator(ValidatorPlugin):
    """Custom validation rules"""

    rule_name = "custom_rules"
    version = "1.0.0"

    def validate(self, ir: ProjectIR) -> List[ValidationError]:
        """Validate IR against custom rules"""
        errors = []
        # Validation logic
        return errors
```

### Plugin Manager

#### `jpe_sims4.plugins.manager.PluginManager`

Manages plugin discovery, loading, and execution.

```python
from jpe_sims4.plugins.manager import PluginManager

manager = PluginManager()

# Discover plugins
manager.discover_plugins(plugin_dir="/path/to/plugins")

# Register custom plugin
manager.register_plugin(CustomParser())

# Get plugin by format
parser = manager.get_parser("customformat")

# Execute all parsers
results = manager.execute_parsers(jpe_files=[...])

# List available plugins
plugins = manager.list_plugins()
```

**Methods:**

- `discover_plugins(plugin_dir: str) -> int`
  - Auto-discover plugins from directory
  - Returns count of discovered plugins

- `register_plugin(plugin: BasePlugin) -> bool`
  - Manually register a plugin
  - Returns success status

- `get_parser(format_name: str) -> ParserPlugin`
  - Get parser for specific format

- `get_generator(format_name: str) -> GeneratorPlugin`
  - Get generator for specific format

- `execute_parsers(jpe_files: List[str]) -> List[ProjectIR]`
  - Execute all registered parsers

- `list_plugins() -> List[PluginInfo]`
  - List all loaded plugins

---

## Cloud API

### Authentication

#### `jpe_sims4.cloud.api.CloudAPI`

```python
from jpe_sims4.cloud.api import CloudAPI

api = CloudAPI(api_url="https://api.example.com")

# User Authentication
auth_result = api.authenticate(
    email="user@example.com",
    password="secure_password"
)

if auth_result.success:
    token = auth_result.token
else:
    print(f"Error: {auth_result.error}")

# Sign out
api.sign_out()

# Verify token
is_valid = api.verify_token(token)
```

### Project Management

```python
# Create project
project = api.create_project(
    name="My Mod",
    description="A cool mod",
    version="1.0.0"
)

# Get project
project = api.get_project(project_id="proj_123")

# List projects
projects = api.list_projects(page=1, page_size=10)

# Update project
api.update_project(
    project_id="proj_123",
    name="Updated Name",
    description="Updated description"
)

# Delete project
api.delete_project(project_id="proj_123")
```

### File Management

```python
# Upload file
upload = api.upload_file(
    project_id="proj_123",
    file_path="/path/to/file.jpe",
    file_type="jpe"
)

# Download file
api.download_file(
    project_id="proj_123",
    file_id="file_456",
    save_path="/path/to/destination"
)

# List files
files = api.list_files(
    project_id="proj_123",
    file_type="jpe"
)

# Delete file
api.delete_file(
    project_id="proj_123",
    file_id="file_456"
)
```

### Synchronization

```python
# Get sync status
status = api.get_sync_status(project_id="proj_123")

# Sync project
sync_result = api.sync_project(
    project_id="proj_123",
    local_revision=10,
    remote_revision=12
)

if sync_result.has_conflicts:
    # Handle conflicts
    for conflict in sync_result.conflicts:
        print(f"Conflict in {conflict.file_name}")

# Resolve conflict (keep local)
api.resolve_conflict(
    project_id="proj_123",
    file_id="file_456",
    resolution="local"
)
```

### Error Handling

```python
from jpe_sims4.cloud.errors import CloudAPIError

try:
    result = api.authenticate(email, password)
except CloudAPIError as e:
    print(f"Cloud API Error: {e.error_code}")
    print(f"Message: {e.message}")
    print(f"Details: {e.details}")
```

---

## IR (Intermediate Representation)

### Base Classes

#### `jpe_sims4.engine.ir.IRObject`

Base class for all IR objects.

```python
from jpe_sims4.engine.ir import IRObject

class CustomIRObject(IRObject):
    """Custom intermediate representation object"""

    def __init__(self, id: str, name: str):
        super().__init__()
        self.id = id
        self.name = name

    def validate(self) -> List[ValidationError]:
        """Validate IR object"""
        errors = []
        if not self.id:
            errors.append(ValidationError("id is required"))
        return errors

    def to_dict(self) -> dict:
        """Serialize to dictionary"""
        return {
            "id": self.id,
            "name": self.name
        }

    @classmethod
    def from_dict(cls, data: dict):
        """Deserialize from dictionary"""
        return cls(
            id=data["id"],
            name=data["name"]
        )
```

### Core IR Classes

#### `Interaction`

Represents a Sims 4 interaction.

```python
from jpe_sims4.engine.ir import Interaction, Participant

interaction = Interaction(
    id="greet_neighbor",
    display_name="Greet Neighbor",
    description="Say hello to neighbor",
    participants=[
        Participant(role="Actor", description="The greeter"),
        Participant(role="Target", description="The neighbor")
    ]
)

# Validate
errors = interaction.validate()

# Serialize
data = interaction.to_dict()
```

#### `Buff`

Represents a temporary buff/moodlet.

```python
from jpe_sims4.engine.ir import Buff

buff = Buff(
    id="happy_buff",
    display_name="Happy",
    description="Feeling happy",
    duration=300,
    effect_value=1.0
)
```

#### `Trait`

Represents a permanent trait.

```python
from jpe_sims4.engine.ir import Trait

trait = Trait(
    id="friendly_trait",
    display_name="Friendly",
    description="Generally friendly",
    default_level=1,
    max_level=5
)
```

#### `TestSet`

Represents validation conditions.

```python
from jpe_sims4.engine.ir import TestSet, Test

test_set = TestSet(
    id="friendship_test",
    tests=[
        Test(
            test_type="RELATIONSHIP",
            sim1="Actor",
            sim2="Target",
            condition="friendship_level",
            value=50
        )
    ]
)
```

#### `LootAction`

Represents rewards/loot.

```python
from jpe_sims4.engine.ir import LootAction

loot = LootAction(
    id="reward_happiness",
    loot_type="modify_buff",
    target_buff="happy_buff",
    amount=1
)
```

#### `ProjectIR`

Container for all IR objects in a project.

```python
from jpe_sims4.engine.ir import ProjectIR

project_ir = ProjectIR(
    project_metadata={...},
    interactions=[...],
    buffs=[...],
    traits=[...],
    test_sets=[...],
    loot_actions=[...]
)

# Validate entire project
errors = project_ir.validate()

# Get statistics
stats = project_ir.get_statistics()
```

---

## Validation API

### Error Classes

#### `jpe_sims4.diagnostics.errors.ValidationError`

Base validation error.

```python
from jpe_sims4.diagnostics.errors import ValidationError

error = ValidationError(
    message="Invalid ID format",
    error_type="SYNTAX_ERROR",
    file_path="/path/to/file.jpe",
    line_number=42,
    column_number=15,
    severity="CRITICAL"
)

print(error.message)
print(error.file_path)
print(error.line_number)
```

**Severity Levels:**
- `CRITICAL`: Gameplay-blocking errors
- `WARNING`: Compatibility issues
- `CAUTION`: Potential conflicts
- `INFO`: Informational
- `SUCCESS`: Positive confirmations

#### Error Types

```python
from jpe_sims4.diagnostics.errors import (
    ParseError,
    ValidationError,
    GenerationError,
    RuntimeError
)
```

### Validator Classes

#### `jpe_sims4.engine.validation.Validator`

```python
from jpe_sims4.engine.validation import Validator
from jpe_sims4.engine.ir import ProjectIR

validator = Validator()

# Validate IR object
errors = validator.validate(ir_object)

# Validate project
errors = validator.validate_project(project_ir)

# Get validation report
report = validator.get_report()
```

**Methods:**

- `validate(obj: IRObject) -> List[ValidationError]`
  - Validate single IR object

- `validate_project(project: ProjectIR) -> List[ValidationError]`
  - Validate entire project

- `get_report() -> ValidationReport`
  - Get detailed validation report

---

## Error Handling

### Try-Catch Pattern

```python
from jpe_sims4.diagnostics.errors import ValidationError

try:
    result = engine.build(project_path)
except ValidationError as e:
    print(f"Validation failed: {e.message}")
    print(f"Location: {e.file_path}:{e.line_number}")
    print(f"Severity: {e.severity}")
except Exception as e:
    print(f"Unexpected error: {e}")
```

### Error Recovery

```python
from jpe_sims4.engine.validation import Validator

validator = Validator()
errors = validator.validate(ir_object)

# Filter by severity
critical_errors = [e for e in errors if e.severity == "CRITICAL"]
warnings = [e for e in errors if e.severity == "WARNING"]

if critical_errors:
    print(f"Fix {len(critical_errors)} critical errors")
else:
    print(f"Proceed with {len(warnings)} warnings")
```

---

## Configuration API

### `jpe_sims4.config.ConfigManager`

```python
from jpe_sims4.config import ConfigManager

config = ConfigManager()

# Load configuration
config.load()

# Get value
theme = config.get("ui.theme", default="cyberpunk")

# Set value
config.set("ui.theme", "sunset")

# Save configuration
config.save()

# Get all settings
settings = config.get_all()
```

### Encrypted Storage

```python
# Store sensitive data
config.set_encrypted("cloud.api_key", "secret_key_here")

# Retrieve sensitive data
api_key = config.get_encrypted("cloud.api_key")

# Delete sensitive data
config.delete_encrypted("cloud.api_key")
```

---

## Logging API

### `jpe_sims4.diagnostics.logging`

```python
import logging
from jpe_sims4.diagnostics.logging import setup_logging

# Setup logging
logger = setup_logging(
    log_file="logs/app.log",
    log_level=logging.DEBUG
)

# Log messages
logger.info("Application started")
logger.warning("Configuration missing")
logger.error("Build failed", exc_info=True)

# Performance monitoring
from jpe_sims4.diagnostics.logging import measure_time

@measure_time
def expensive_operation():
    # This will be timed automatically
    pass
```

---

## Type Hints

All API functions include type hints for IDE support:

```python
from typing import List, Dict, Optional
from jpe_sims4.engine.ir import ProjectIR, IRObject
from jpe_sims4.diagnostics.errors import ValidationError

def process_project(
    project_path: str,
    output_dir: str,
    options: Optional[Dict[str, any]] = None
) -> List[ValidationError]:
    """Process a project and return validation errors"""
    pass
```

---

## Version Compatibility

- **API Version**: 1.0.0
- **Python**: 3.8+
- **Last Updated**: December 2024

---

## Additional Resources

- [Core Documentation](./DOCUMENTATION.md)
- [Plugin Development Guide](#plugin-system)
- [GitHub Repository](https://github.com/khaoticdev62/JPE-Sims4)

---

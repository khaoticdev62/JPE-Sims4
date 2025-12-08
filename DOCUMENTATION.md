# JPE Sims 4 Mod Translator - Complete Documentation

## Table of Contents

1. [Overview](#overview)
2. [Key Features](#key-features)
3. [Getting Started](#getting-started)
4. [Core Concepts](#core-concepts)
5. [User Interface](#user-interface)
6. [Translation Pipeline](#translation-pipeline)
7. [JPE Language Guide](#jpe-language-guide)
8. [Advanced Features](#advanced-features)
9. [Mobile Applications](#mobile-applications)
10. [Cloud Synchronization](#cloud-synchronization)
11. [Plugin System](#plugin-system)
12. [Troubleshooting](#troubleshooting)

---

## Overview

The **JPE Sims 4 Mod Translator** is a comprehensive application suite that revolutionizes Sims 4 mod development. Instead of writing complex XML, creators can use simple, human-readable JPE (Just Plain English) syntax to build professional-grade mods.

### What is JPE?

JPE is an English-like domain-specific language (DSL) designed specifically for The Sims 4 modding community. It abstracts away XML complexity while maintaining full compatibility with the game engine.

### Project Status

✅ **Production Ready** - All 8 development phases completed
✅ **Fully Tested** - Comprehensive test suite with high coverage
✅ **Desktop Application** - Full-featured Tkinter GUI with 10 themes
✅ **Mobile Support** - Native iOS and React Native cross-platform apps
✅ **Cloud Integration** - Multi-device synchronization and backup
✅ **Extensible** - Plugin architecture for custom functionality

---

## Key Features

### Desktop Studio Application
- **Intuitive Interface**: Tabbed editor with project explorer, code editor, build tools, and reporting
- **10 Unique Themes**: Cyberpunk Neon, Sunset Glow, Forest Twilight, Ocean Depths, Vintage Paper, Cosmic Void, Tropical Paradise, Ice Crystal, Desert Sunset, Midnight Purple
- **Real-time Validation**: Immediate feedback on code errors and warnings
- **Project Management**: Complete project lifecycle from creation to deployment

### Translation Engine
- **Multi-format Support**: JPE → JPE-XML → Sims 4 XML
- **Validation System**: Comprehensive error detection with color-coded severity levels
- **Extensible Architecture**: Plugin system for custom transformations
- **Performance Optimized**: Asynchronous operations prevent UI freezing

### Mobile Applications
- **Native iOS App**: SwiftUI-based application for iOS 14+
- **React Native App**: Cross-platform support for Android and iOS
- **Offline Functionality**: Full access to projects without internet connection
- **Cloud Sync**: Automatic synchronization when connected

### Cloud Services
- **Project Management**: Create, update, and delete projects in the cloud
- **Secure Authentication**: OAuth 2.0 based authentication
- **Encrypted Storage**: All credentials stored with AES-256 encryption
- **Conflict Resolution**: Automatic handling of multi-device conflicts

### Onboarding System (The Codex)
- **10 Interactive Lessons**: From basics to advanced techniques
- **Step-by-step Tutorials**: Hands-on learning with real projects
- **Immediate Feedback**: Learn by doing with instant validation
- **Progressive Difficulty**: Master concepts at your own pace

---

## Getting Started

### System Requirements

- **Desktop**: Windows 6.0+, macOS 10.14+, or Linux (Ubuntu 18.04+)
- **Python**: 3.8+ (3.11+ recommended)
- **RAM**: 512MB minimum, 2GB+ recommended
- **Disk Space**: 500MB for full installation
- **iOS**: iOS 14.0 or later
- **Android**: Android 8.0 or later

### Installation

See [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md) for detailed setup instructions.

### First Steps

1. **Launch the Application**
   ```bash
   jpe-studio
   ```

2. **Create a New Project**
   - Click "New Project" in the welcome screen
   - Enter project name, ID, and author information
   - Choose a theme for your workspace

3. **Create Your First Interaction**
   - Navigate to the Editor tab
   - Create a new file: `src/interactions.jpe`
   - Use the JPE syntax to define an interaction

4. **Build Your Project**
   - Click the "Build" button
   - Review the build report
   - Check the XML output in the `build/` directory

---

## Core Concepts

### Intermediate Representation (IR)

The IR is the central data model representing all Sims 4 concepts:

```
JPE File → Parser → IR → Validator → Generator → Sims 4 XML
```

**Key IR Classes:**
- `Interaction` - Defines interactions between Sims
- `Buff` - Temporary effects on Sims
- `Trait` - Permanent characteristics
- `EnumDefinition` - Custom enumeration types
- `TestSet` - Validation conditions
- `LootAction` - Reward definitions
- `LocalizedString` - Multi-language support
- `ProjectMetadata` - Project information

### Build Pipeline

1. **Discovery Phase**: Locate all JPE files in the project
2. **Parsing Phase**: Convert JPE syntax to IR objects
3. **Validation Phase**: Check IR consistency and completeness
4. **Generation Phase**: Convert IR to Sims 4 XML format
5. **Reporting Phase**: Generate build reports with statistics

### Error Severity Levels

- **CRITICAL** (Red): Gameplay-blocking errors - build fails
- **WARNING** (Orange): Compatibility issues - build succeeds with caution
- **CAUTION** (Yellow): Potential conflicts - informational
- **INFO** (Blue): General information
- **SUCCESS** (Green): Positive confirmations

---

## User Interface

### Main Window

The Studio application features five main tabs:

#### 1. Project Explorer
- View project structure
- Browse source files
- Navigate to specific definitions
- Quick search functionality

#### 2. Code Editor
- Syntax highlighting for JPE
- Auto-completion suggestions
- Real-time validation indicator
- Line numbers and error markers

#### 3. Build Console
- Execute build operations
- Monitor build progress
- View build statistics
- Download generated files

#### 4. Reports Tab
- Build reports with statistics
- Error and warning summaries
- Performance metrics
- Export capabilities

#### 5. Documentation
- Integrated help system
- JPE syntax reference
- Tutorials and examples
- The Codex onboarding

#### 6. Settings
- Theme selection
- Editor preferences
- Cloud synchronization settings
- Plugin management

### Theme System

Each theme provides consistent color schemes:
- **Foreground**: Text and primary elements
- **Background**: Window and panel backgrounds
- **Accent**: Highlights and interactive elements
- **Warning**: Error and alert colors

Themes are applied globally to all UI components and can be changed instantly.

---

## Translation Pipeline

### JPE Syntax → IR Conversion

The JPE parser converts human-readable syntax into structured IR objects:

```
[Interactions]
id: greet_neighbor
display_name: Greet Neighbor
description: Polite greeting
participant: role:Actor, description:Initiator
participant: role:Target, description:Recipient
end
```

Becomes:
```python
Interaction(
    id="greet_neighbor",
    display_name="Greet Neighbor",
    description="Polite greeting",
    participants=[
        Participant(role="Actor", description="Initiator"),
        Participant(role="Target", description="Recipient")
    ]
)
```

### IR → Sims 4 XML Conversion

The XML generator converts IR objects to game-compatible format:

```xml
<I c="greeting.interactions.GreetNeighbor">
    <T n="display_name">Greet Neighbor</T>
    <T n="description">Polite greeting</T>
    <L n="participants">
        <I c="interactions.Participant" s="Actor">
            <T n="description">Initiator</T>
        </I>
    </L>
</I>
```

---

## JPE Language Guide

### Basic Syntax

#### Project Definition
```
[Project]
name: My Awesome Mod
id: my_awesome_mod
version: 1.0.0
author: Your Name
game_version: 1.0.0+
description: A comprehensive mod description
end
```

#### Interaction Definition
```
[Interactions]
id: unique_interaction_id
display_name: Display Name
description: What does this interaction do?
participant: role:Actor, description:The one performing
participant: role:Target, description:The one affected
test: condition_name
loot_action: reward_name
animation: animation_id
duration: 10.0
end
```

#### Buff Definition
```
[Buffs]
id: buff_id
display_name: Buff Name
description: Effect description
duration: 300
effect_value: 0.5
emotion: happy
emotion_intensity: 2
end
```

#### Trait Definition
```
[Traits]
id: trait_id
display_name: Trait Name
description: Trait description
default_level: 1
max_level: 5
cost: 1
end
```

#### Test Set Definition
```
[TestSets]
id: test_set_name
tests:
  - test_type:SIM_INFO, sim_id:Target, test:has_trait, trait:trait_id
  - test_type:RELATIONSHIP, sim1:Actor, sim2:Target, test:friendship_level, min:50
end
```

#### Loot Action Definition
```
[LootActions]
id: loot_action_name
loot_type: modify_buff
buff_id: buff_id
amount: 1
end
```

#### Enum Definition
```
[Enums]
id: custom_enum
values:
  - option_one
  - option_two
  - option_three
end
```

### Data Types

| Type | Description | Example |
|------|-------------|---------|
| `string` | Text values | `"Hello World"` |
| `integer` | Whole numbers | `42`, `-1` |
| `float` | Decimal numbers | `3.14`, `0.5` |
| `boolean` | True/False | `true`, `false` |
| `duration` | Time in seconds | `300`, `60.5` |
| `identifier` | Unique IDs | `my_interaction` |

### Comments

```
; Single-line comment
; Another comment line

#{
  Multi-line comment
  Useful for longer explanations
}#
```

---

## Advanced Features

### Plugin System

Extend the translator with custom parsers, generators, and validators:

```python
from jpe_sims4.plugins.base import ParserPlugin

class CustomFormatParser(ParserPlugin):
    """Custom format support"""

    format_name = "custom"
    version = "1.0.0"

    def parse(self, file_path):
        """Parse custom format to IR"""
        # Implementation here
        pass
```

See [API_REFERENCE.md](./API_REFERENCE.md) for complete plugin documentation.

### Cloud Synchronization

#### Setup
1. Enable cloud sync in Settings
2. Create a cloud account or sign in
3. Choose synchronization frequency
4. Select which projects to sync

#### Features
- **Automatic Sync**: Background synchronization
- **Conflict Resolution**: Handle concurrent edits
- **Selective Sync**: Choose which projects to synchronize
- **Encrypted Storage**: AES-256 encryption for all data

### Performance Optimization

#### Async Operations
Long-running operations run asynchronously:
- Build operations
- File I/O
- Network requests
- Validation processing

#### Caching
Results are cached to improve performance:
- Parsed files
- Validation results
- Generated XML

#### Monitoring
Built-in performance monitoring:
- Operation timing
- Memory usage
- CPU utilization
- Build statistics

---

## Mobile Applications

### iOS Application

**Features:**
- Native SwiftUI interface
- Offline project access
- Cloud synchronization
- Project creation and editing
- Real-time validation feedback

**Installation:**
- Download from App Store (when available)
- Or build from source: `ios_app/` directory

### React Native Application

**Features:**
- Cross-platform support (iOS + Android)
- Unified interface across platforms
- Offline functionality
- Cloud sync integration
- Push notifications

**Installation:**
```bash
cd mobile_app
npm install
npm run build
```

---

## Cloud Synchronization

### Architecture

The cloud API provides RESTful endpoints for:
- User authentication
- Project management
- File storage
- Multi-device synchronization
- Conflict resolution

### API Endpoints

See [API_REFERENCE.md](./API_REFERENCE.md) for complete endpoint documentation.

### Security

- **Authentication**: OAuth 2.0
- **Encryption**: AES-256 for data at rest
- **Transport**: HTTPS only
- **Credentials**: Secure storage with key derivation

---

## Plugin System

### Creating Plugins

1. **Create Plugin Class**
   ```python
   from jpe_sims4.plugins.base import ParserPlugin

   class MyPlugin(ParserPlugin):
       format_name = "myformat"
       version = "1.0.0"
   ```

2. **Implement Required Methods**
   - `parse()` - Parse format to IR
   - `validate()` - Validate plugin configuration
   - `cleanup()` - Clean up resources

3. **Register Plugin**
   - Place in `plugins/` directory
   - Plugin manager auto-discovers it

See [API_REFERENCE.md](./API_REFERENCE.md) for detailed plugin development guide.

---

## Troubleshooting

Common issues and solutions:

### Application Won't Start
- **Check Python version**: `python --version` (requires 3.8+)
- **Install dependencies**: `pip install -e .`
- **Check logs**: Look in `logs/` directory

### Build Fails
- **Validate syntax**: Check error messages in build report
- **Check file format**: Ensure .jpe files are UTF-8 encoded
- **Review error details**: Click on errors for detailed explanations

### Cloud Sync Issues
- **Check connection**: Ensure internet connectivity
- **Verify credentials**: Re-authenticate in Settings
- **Check storage**: Ensure sufficient disk space
- **Review logs**: Check `logs/cloud.log` for details

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for more solutions.

---

## Additional Resources

- [Installation Guide](./INSTALLATION_GUIDE.md)
- [API Reference](./API_REFERENCE.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [Architecture Overview](./ARCHITECTURE.md)
- [Changelog](./CHANGELOG.md)
- [The Codex User Manual](./THE_CODEX_USER_MANUAL.md)

---

## Support

- 📖 Documentation: See files in this repository
- 🐛 Issues: Report bugs on GitHub
- 💡 Discussions: Share ideas and ask questions
- 📧 Contact: See project homepage

---

**Version**: 1.0.0 | **Last Updated**: December 2024

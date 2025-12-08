# JPE Sims 4 Mod Translator

The JPE (Just Plain English) Sims 4 Mod Translator is a powerful and secure tool that enables creators to develop The Sims 4 mods using a simple, human-readable syntax instead of complex XML files.

## Features

- **Simple Syntax**: Write Sims 4 mods using plain English-like syntax
- **Project Management**: Complete project structure with source, build, and configuration directories
- **Multi-format Support**: Import/export between JPE, JPE-XML, and Sims 4 XML formats
- **Validation**: Comprehensive validation with detailed error messages and suggestions
- **Extensible**: Plugin system for custom parsers, generators, and transforms
- **Cloud Sync**: Securely synchronize projects across devices (optional)
- **Onboarding**: Interactive tutorial system for new users
- **Security First**: Built-in security measures and input validation
- **Performance Optimized**: Async operations to prevent UI blocking
- **10 Unique Themes**: Customize your workspace with various themes

## Security Features

- **Secure Configuration**: Encrypted storage for sensitive data like API keys
- **Path Validation**: Protection against directory traversal attacks
- **Input Sanitization**: All user inputs are validated and sanitized
- **File Size Limits**: Automatic protection against huge file uploads
- **Secure Communication**: Encrypted API communications for cloud sync
- **Permission Checks**: Proper file system permission validation

## Installation

### Using Pip
```bash
pip install jpe-sims4
```

### Using the GUI Installer
1. Download the installer from the releases page
2. Run the setup wizard
3. Follow the on-screen instructions

## Quick Start

### Command Line Interface

```bash
# Create a new project
mkdir my_mod_project
cd my_mod_project
mkdir src config build

# Create your first mod file (src/interactions.jpe)
echo "[Interactions]
id: greet_neighbor
display_name: Greet Neighbor
description: Politely greet a nearby neighbor
participant: role:Actor, description:The person initiating the greeting
participant: role:Target, description:The neighbor being greeted
end" > src/interactions.jpe

# Build your project
jpe-sims4 build . --build-id my_build_001
```

### Studio Application

```bash
# Launch the desktop studio
jpe-studio
```

## Features

### 10 Unique Themes
Choose from 10 hyper unique themes:
- Cyberpunk Neon
- Sunset Glow
- Forest Twilight
- Ocean Depths
- Vintage Paper
- Cosmic Void
- Tropical Paradise
- Ice Crystal
- Desert Sunset
- Midnight Purple

### Interactive Teaching System
- 10 comprehensive lessons for new users
- Step-by-step tutorials from basics to advanced features
- Hands-on exercises with immediate feedback

### Complete Onboarding
- Dummy-proof installation wizard
- Guided setup process
- Initial project creation tutorial

### Testing Mode
- Built-in test suite for validating JPE syntax
- Comprehensive validation of all components
- Performance testing capabilities

### Advanced Security
- Secure credential storage
- Path traversal protection
- Input validation and sanitization
- File size and type restrictions

## JPE Syntax Guide

### Project Definition
```
[Project]
name: My Awesome Mod
id: my_awesome_mod
version: 1.0.0
author: Your Name
end
```

### Interaction Definition
```
[Interactions]
id: interaction_id
display_name: Display Name
description: Description of the interaction
participant: role:Actor, description:The actor
participant: role:Target, description:The target
end
```

### Buff Definition
```
[Buffs]
id: buff_id
display_name: Buff Name
description: Buff description
duration: 60
end
```

## Performance Features

- **Asynchronous Operations**: UI never freezes during long operations
- **Performance Monitoring**: Built-in performance tracking and optimization
- **Memory Efficient**: Optimized memory usage for large projects
- **Progress Tracking**: Real-time progress updates for long operations

## Documentation

### For New Users
- **[JPE Quick Start Guide](JPE_QUICK_START.md)** - 10-minute beginner guide with installation, first mod creation, and 5 starter templates
- **[JPE Master Bible](JPE_MASTER_BIBLE.md)** - Comprehensive 1000+ line reference covering all JPE syntax, patterns, and techniques

### For Mod Creators
- **[Templates Directory](templates/)** - 25 production-ready copy-paste templates organized by category:
  - Social Interactions (6 templates)
  - Romantic Interactions (3 templates)
  - Skills & Learning (4 templates)
  - Moods & Emotions (3 templates)
  - Home & Family (2 templates)
  - Traits & Preferences (2 templates)
  - Objects & Activities (2 templates)
  - Fitness & Wellness (2 templates)
  - Hobbies & Crafts (2 templates)
  - Career Development (1 template)

- **[Templates README](templates/README.md)** - Guide to using templates, customization options, and best practices

### For Developers
- **[Sims 4 File Type Support](SIMS4_FILE_TYPE_SUPPORT.md)** - Complete documentation for the extensible file type support system:
  - File type detection and validation
  - Handler architecture
  - Integration with JPE pipeline
  - Extension points for custom handlers
  - Support roadmap for .package, .interaction, .tune, .stbl files

### Architecture Documentation
- **[Advanced Features and Distribution](ADVANCED_FEATURES_AND_DISTRIBUTION.md)** - Documentation for studio features, build system, and CI/CD pipeline
- **[Implementation Complete](IMPLEMENTATION_COMPLETE.md)** - Summary of all 8 phases and production-ready status

## Development

To contribute to the project:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite: `python -m pytest tests/`
6. Submit a pull request

### Running Tests

```bash
# Run all tests
python -m pytest tests/

# Run tests with coverage
python -m pytest tests/ --cov=jpe_sims4

# Run specific test file
python -m pytest tests/test_ir.py

# Run Sims 4 file type support tests
python -m pytest tests/test_sims4_file_support.py -v
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
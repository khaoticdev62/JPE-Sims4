# JPE Studio: Deck Edition

A native Steam Deck application for creating The Sims 4 mods using the JPE (Just Plain English) translation system. Full controller-driven modding environment with predictive coding support.

## Overview

**JPE Studio: Deck Edition** is a complete mod development environment optimized for handheld gameplay. It brings the full power of the desktop JPE Sims 4 Mod Translator to your Steam Deck, with:

- **Controller-first design** - Navigate and edit entirely with the Steam Deck controller
- **Predictive coding system** - Context-aware suggestions for faster mod creation
- **Multi-format support** - JPE, JPE-XML, and Sims 4 XML tuning files
- **Comprehensive diagnostics** - Real-time error detection and quick-fixes
- **Offline-first operation** - Everything runs locally on your device

## System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **Device** | Steam Deck LCD | Steam Deck OLED |
| **OS** | SteamOS 3.0+ | SteamOS 3.5+ |
| **Storage** | 100 MB free space | 500 MB free space |
| **RAM** | 512 MB | 1 GB+ |
| **Python** | 3.11+ | 3.11+ |

## Installation

### From GUI Installer (Recommended)
When you run the main JPE Sims 4 Mod Translator installer, the Steam Deck Edition is available as an optional component:

1. Launch the installer
2. Select "Choose Components"
3. Enable "Steam Deck Edition"
4. Complete installation

### Manual Installation (Desktop Mode)
1. Download the latest AppImage: `jpe-studio-deck-<version>.AppImage`
2. Mark as executable: `chmod +x jpe-studio-deck-<version>.AppImage`
3. Add to Steam as a Non-Steam Game
4. Configure the custom Steam Input profile for optimal controller layout

### Via Flatpak (Alternative)
```bash
flatpak install org.jpe.studio.deck
```

## Getting Started

### First Launch
1. Open JPE Studio: Deck Edition from Steam or your applications menu
2. Choose **"Browse Projects"** to find existing Sims 4 mod projects
3. Or select **"New Project"** to create a blank modding workspace

### Basic Workflow
1. **Open** a project or create one from scratch
2. **Edit** JPE files using the built-in editor with predictive suggestions
3. **Translate** between formats (JPE ↔ JPE-XML ↔ Sims 4 XML)
4. **Validate** to catch errors before building
5. **Build** to generate final Sims 4-compatible mod files
6. **Review** diagnostics and quick-fixes for any issues

## Controller Layout

### Navigation & Editing
| Button | Action |
|--------|--------|
| **D-Pad** | Navigate menus and lists (Up/Down/Left/Right) |
| **Left Joystick** | Scroll through project files and content |
| **Right Joystick** | Pan horizontally in editor |
| **A Button** | Confirm/Select/Accept suggestion |
| **B Button** | Back/Cancel/Dismiss overlay |
| **X Button** | Cycle next suggestion |
| **Y Button** | Open Predictive Actions overlay |
| **L1 / R1** | Switch between tabs (Projects, Files, Editor, Problems, Predictive) |
| **L2** | Step backward in suggestion history |
| **R2** | Step forward in suggestion history |
| **L3 (Click)** | Toggle Prediction Lock (keeps suggestions visible) |
| **R3 (Click)** | Trigger Quick Suggest at cursor |
| **L4 (Paddle)** | Execute highest-ranked macro for context |
| **L5 (Paddle)** | Open macro picker overlay |
| **R4 (Paddle)** | Apply recommended quick-fix |
| **R5 (Paddle)** | Show recently used templates |
| **Right Trackpad** | Fine-grained text cursor positioning |
| **Start** | Context menu for selected item |
| **Select** | Settings / preferences |

## Game Mode vs Desktop Mode

### Game Mode (Full Screen)
- Fullscreen, single-window experience
- Optimized controller navigation
- Simplified top-level navigation: Projects → Files → Editor → Problems → Predictive
- Default display uses native 1280×800 resolution
- All major workflows fully accessible via buttons

### Desktop Mode (Windowed)
- Resizable window with multi-pane layout
- Supports keyboard, mouse, and controller simultaneously
- Enhanced UI with menubar and right-click context menus
- Denser components with more screen real estate
- Ideal for connected displays and accessories

## Key Features

### 1. Multi-Format Translation
- **JPE (Just Plain English)** - Human-readable mod syntax
- **JPE-XML** - English-first XML intermediate format
- **Sims 4 XML** - Standard game tuning files
- **Round-trip compilation** - Bidirectional format conversion with consistency guarantee

### 2. Predictive Coding System
The predictive engine learns from your edits and suggests:
- **Next tokens** - Likely next words based on context
- **Templates** - Common interaction/buff/trait/loot structures
- **Quick-fixes** - Automated solutions for detected errors
- **Macros** - User-defined snippets and transformations

Suggestions are context-aware (interaction, buff, trait, loot, etc.) and ranked by frequency.

### 3. Comprehensive Diagnostics
Real-time error detection with:
- **Severity levels**: Critical (red), Warning (orange), Caution (yellow), Info (blue)
- **Error categories**: Syntax, semantic, reference, type mismatches
- **Line/column information** - Navigate directly to errors
- **Quick-fix suggestions** - Automatic repair recommendations
- **Exportable reports** - Markdown/HTML/JSON formats

### 4. Project Management
- **Automatic file discovery** - Scans for .jpe, .jpe.xml, .xml, .stbl, .package, .ts4script
- **Project indexing** - Fast access to mod entities (interactions, buffs, traits, etc.)
- **Settings management** - Game path, build output, language preferences
- **Recent projects** - Quick access to recently edited projects

### 5. Performance Monitoring
- **Async operations** - No UI blocking during long operations
- **Progress tracking** - Real-time progress indicators
- **Lightweight** - Target under 1.5 GB RAM usage
- **Fast startup** - Under 5 seconds cold start on Steam Deck SSD
- **Predictive latency** - Initial suggestions appear within 150ms

## Supported File Types

### Read/Write
- `.jpe` or `.jpe.txt` - JPE source files
- `.jpe.xml` - JPE-XML source files
- Raw XML tuning files
- JSON configuration files

### Read-Only (via adapters)
- `.package` containers (Sims 4 mod packages)
- `.ts4script` (Python script archives)
- STBL string tables
- CFG and INI configuration files

## Screen Layouts

### Projects Screen
- Browse saved projects
- View last opened date and error count
- Actions:
  - **A** - Open project
  - **X** - Open project settings
  - **Y** - Rescan mods
  - **Start/Select** - Add/Remove project

### Files Screen
- Tree view of project files
- Filtering modes: All / XML only / JPE/JPE-XML only / Errors only
- Actions:
  - **A** - Open file in editor
  - **X** - Toggle filter
  - **Y** - Quick actions (Translate, Compile, Show errors)

### Editor Screen
- Central editing area for JPE / JPE-XML / XML
- Top bar: Filename, view mode toggle, Translate/Compile buttons
- Bottom bar: Line/column position, input mode, suggestion state
- Inline suggestions and bottom suggestion bar
- Supports all three view modes simultaneously

### Problems Screen
- All diagnostics sorted by severity and file
- Shows error code, description, file path, line number
- Actions:
  - **A** - Jump to error line in editor
  - **Y** - Filter by severity
  - **R4** - Open quick-fix suggestions

### Predictive Screen
- Grid of recommendation templates
- Recently applied actions
- User-defined macros
- Navigate with joystick/D-pad, apply with **A**

## Data Storage

All data is stored locally on your device:
- **Projects** - Standard directory structure (src/, config/, build/)
- **Settings & preferences** - `~/.local/share/jpe-studio-deck/`
- **Predictive database** - Local SQLite with token statistics, templates, macros
- **Cache & temp files** - Cleaned up automatically

**Privacy**: No telemetry by default. Optional usage metrics can be enabled but never include raw mod content.

## Offline Operation

JPE Studio: Deck Edition operates fully offline. All components (engine, predictive system, adapters) work without internet connectivity:
- ✅ Parse and translate mods
- ✅ Validate and diagnose errors
- ✅ Generate output files
- ✅ Run predictive suggestions
- ✅ Manage projects

Optional cloud sync features are planned for future releases.

## Performance Targets

- **Cold start** - Under 5 seconds on Steam Deck SSD
- **Project scanning** - Index ~5,000 files without blocking UI
- **Predictive latency** - Suggestions within 150ms of trigger
- **Memory usage** - Target under 1.5 GB RAM for typical session

## Troubleshooting

### Controller Not Detected
1. Ensure controller is paired in Steam Settings
2. Verify "Gamepad" input method is enabled in Steam Input
3. Try unplugging and reconnecting the controller

### Performance Issues
1. Close unnecessary Steam Deck applications
2. Reduce project size if working with very large mod collections
3. Disable animations in preferences if needed

### Project Won't Open
1. Verify project has valid `src/` and `config/` directories
2. Check file permissions (should be readable/writable by your user)
3. Look for error details in the Problems panel

### Predictive Suggestions Not Appearing
1. Ensure Predictive is enabled in settings
2. Check that you're in a valid editing context (JPE/JPE-XML file)
3. The predictive database builds over time - initial suggestions may be limited

## Documentation

- **User Manual** - See `THE_CODEX_USER_MANUAL.md` for comprehensive guide
- **Language Guide** - `prd02_jpe_language_and_jpe_xml.pdf` for JPE syntax
- **Controller Reference** - Built-in help accessible via **Select** button
- **Quick Start** - First-time launcher provides interactive tutorial

## Support & Feedback

- **Report Issues** - https://github.com/tuwana/jpe-sims4/issues
- **PRD Documentation** - Full technical specifications in `jpe_steam_deck_prd_filesystem_fulltext.pdf`
- **Community** - Join the Sims 4 modding community

## What's Different from Desktop Edition?

| Feature | Desktop | Deck Edition |
|---------|---------|--------------|
| **UI Framework** | Tkinter | Pygame (controller-optimized) |
| **Input Method** | Keyboard/Mouse | Controller-first |
| **Resolution** | Flexible | 1280×800 / 854×480 |
| **Predictive System** | Limited | Full with templates & macros |
| **Multi-pane Layout** | Yes | Game Mode: Single, Desktop: Multi |
| **Performance** | PC specs | Steam Deck optimized |

## License

MIT License - See LICENSE file for details

## Credits

**JPE Sims 4 Mod Translator** - Tuwana Development Team

Steam Deck Edition engineering combines the proven desktop engine with hand-optimized control schemes and predictive systems for handheld mod development.
# JPE Studio Editor - Main Interface Wireframe

## Overall Layout: Three-Panel Design

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ JPE Studio Editor - [example.jpe]                                   [ _ □ ×] │
├─────────────────────────────────────────────────────────────────────────────┤
│ [☰] File  Edit  View  Tools  Help                            │□□□│□□□│⚙️│ │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────────────────────────────────────────────────┐ │
│ │   SIDEBAR   │ │                        MAIN EDITOR                      │ │
│ │             │ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │  📁 Project │ │ │ interaction "Friendly Ask About Day":             │ │ │
│ │  📄 example │ │ │   id: 123456789012345678                        │ │ │
│ │  📁 interac-│ │ │   target: Sim                                   │ │ │
│ │    tions    │ │ │   pie_menu: Friendly                            │ │ │
│ │  📁 buffs   │ │ │                                                 │ │ │
│ │  📁 traits  │ │ │   available_when:                               │ │ │
│ │             │ │ │     - actor is teen_or_older                    │ │ │
│ │ 🧩 Mod Ele- │ │ │     - target is not sleeping                    │ │ │
│ │   ments     │ │ │                                                 │ │ │
│ │  🎭 Interac-│ │ │   on_success:                                   │ │ │
│ │    tions(12)│ │ │     - apply buff "Happy +1" to target for 2h    │ │ │
│ │  💫 Buffs(8)│ │ └─────────────────────────────────────────────────────┘ │
│ │  🧬 Traits(5)│ │                        │ PREVIEW PANEL │                │ │
│ │             │ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ 🛠️ Tools    │ │ │              XML PREVIEW (LIVE)                   │ │ │
│ │  🔍 Search  │ │ │ ┌─────────────────────────────────────────────────┐ │ │
│ │  ⚙️ Settings │ │ │ │ <interaction id="123456789012345678"          │ │ │
│ │             │ │ │ │          name="Friendly Ask About Day">         │ │ │
│ │ 📊 Stats    │ │ │ │   <target_type>Sim</target_type>               │ │ │
│ │  📈 Usage   │ │ │ │   <pie_menu_category>Friendly</pie_menu_categ. │ │ │
│ │             │ │ │ │   <tests>                                      │ │ │
│ │ 📚 Docs     │ │ │ │     <test type="age">teen_or_older</test>      │ │ │
│ │             │ │ │ │     <test type="sleeping">false</test>         │ │ │
│ │             │ │ │ │   </tests>                                     │ │ │
│ │             │ │ │ │   <loot_actions>                               │ │ │
│ │             │ │ │ │     <loot type="apply_buff" buff="Happy +1"   │ │ │
│ │             │ │ │ │          target="target" duration="2h"/>      │ │ │
│ │             │ │ │ │   </loot_actions>                              │ │ │
│ │             │ │ │ │ </interaction>                                  │ │ │
│ │             │ │ │ └─────────────────────────────────────────────────┘ │ │
│ │             │ │ │ Status: [✓ Valid JPE] [Transformed: 0.2s] [Ln:12] │ │ │
│ └─────────────┘ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Detailed Component Breakdown

### 1. Top Application Bar
- Application title: "JPE Studio Editor"
- Current file indicator: "[example.jpe]"
- Standard window controls: minimize, maximize, close
- Main menu: File, Edit, View, Tools, Help
- Quick access icons: search, settings, notifications

### 2. Sidebar (Left Panel)
**Project Explorer Section:**
- Project root folder
- Collapsible file structure (interactions/, buffs/, traits/)
- Individual .jpe files with appropriate icons
- Right-click context menu for file operations

**Mod Elements Section:**
- Categorized mod elements (Interactions, Buffs, Traits)
- Count indicators (e.g., "Interactions (12)")
- Quick access to common elements
- Visual icons for each element type

**Tools Section:**
- Search functionality
- Settings/configuration
- Stats and usage information
- Documentation links

### 3. Main Editor Panel
**Editor Header:**
- File name with close button
- Tabbed interface for multiple files
- File status indicators (saved/dirty)

**Code Editor Area:**
- Syntax-highlighted JPE code
- Line numbers
- Code folding indicators
- Error/warning markers in margin
- Contextual help tooltips

### 4. Preview Panel (Bottom/Right Panel)
**Preview Header:**
- Title: "XML Preview (LIVE)"
- Toggle for preview visibility
- Export/copy buttons

**XML Preview Area:**
- Real-time transformed XML output
- Synchronized scrolling with editor
- Highlighting corresponding elements
- Validation status display

**Status Bar:**
- File validation status
- Transformation time
- Current line/column position
- Encoding and line ending information

## Interactive Elements

### Hover States
- File explorer items show quick action buttons on hover
- Code elements show documentation tooltips
- Preview elements highlight corresponding source lines

### Context Menus
- Right-click in editor for JPE-specific actions
- Right-click in file explorer for file operations
- Right-click in preview for export options

### Keyboard Shortcuts
- Ctrl+S: Save file
- Ctrl+/: Toggle comment
- Ctrl+Space: Show completions
- F1: Show documentation
- Ctrl+Shift+P: Command palette

## Responsive Behavior
- Sidebar can be collapsed/expanded
- Preview panel can be resized or moved to right side
- Editor area adjusts to available space
- Elements reflow appropriately on smaller screens

## Color Scheme
- Dark theme optimized for code editing
- Syntax highlighting colors specifically for JPE constructs
- High contrast for accessibility
- Visual indicators for different element types
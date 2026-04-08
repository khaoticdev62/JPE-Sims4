# JPE Studio Editor - Front-End Specification

## 1. Overview

### Purpose
The JPE Studio Editor is a specialized code editor for creating and managing JPE (Just Plain English) files used in Sims 4 mod development. The editor provides a tailored environment that bridges the gap between human-readable JPE syntax and Sims 4 compatible XML tuning files.

### Target Users
- Sims 4 modders of varying skill levels
- Game designers creating custom interactions
- Content creators developing new gameplay elements

## 2. Design Principles

### 2.1 User-Centric Design
- Prioritize ease of use for modders of all skill levels
- Provide clear visual feedback for all actions
- Minimize cognitive load with intuitive layouts

### 2.2 Efficiency
- Streamlined workflows for common tasks
- Keyboard shortcuts for power users
- Context-sensitive help and suggestions

### 2.3 Clarity
- Clear visual distinction between different element types
- Real-time feedback on syntax and validation
- Intuitive mapping between JPE and XML representations

## 3. Interface Components

### 3.1 Main Layout
The interface follows a three-panel layout:

```
┌─────────────────┬─────────────────────────────────────────────────────────────┐
│     Sidebar     │                          Main Editor                        │
│                 │                                                             │
│  Project        │  ┌─────────────────────────────────────────────────────┐   │
│  Explorer       │  │  interaction "Friendly Ask About Day":            │   │
│                 │  │    id: 123456789012345678                       │   │
│  Mod Elements   │  │    target: Sim                                  │   │
│                 │  │    pie_menu: Friendly                             │   │
│  Tools          │  │                                                 │   │
│                 │  │    available_when:                               │   │
│                 │  │      - actor is teen_or_older                   │   │
│                 │  │      - target is not sleeping                   │   │
│                 │  │                                                 │   │
│                 │  │    on_success:                                   │   │
│                 │  │      - apply buff "Happy +1" to target for 2h   │   │
│                 │  └─────────────────────────────────────────────────────┘   │
│                 │                          Preview Panel                      │
│                 │  ┌─────────────────────────────────────────────────────┐   │
│                 │  │  <interaction id="..." name="Friendly...">       │   │
│                 │  │    <target_type>Sim</target_type>                 │   │
│                 │  │    <pie_menu_category>Friendly</pie_menu_categ.  │   │
│                 │  │    <tests>                                       │   │
│                 │  │      <test type="age">teen_or_older</test>       │   │
│                 │  │    </tests>                                      │   │
│                 │  │  </interaction>                                  │   │
│                 │  └─────────────────────────────────────────────────────┘   │
└─────────────────┴─────────────────────────────────────────────────────────────┘
```

### 3.2 Sidebar Components

#### 3.2.1 Project Explorer
- **Purpose**: Navigate and manage project files
- **Elements**:
  - Collapsible folder structure
  - File icons with type identification
  - Right-click context menu for file operations
  - Drag-and-drop support for reorganization

#### 3.2.2 Mod Elements Browser
- **Purpose**: Quick access to different mod element types
- **Elements**:
  - Categorized lists (Interactions, Buffs, Traits)
  - Count indicators for each category
  - Visual icons for quick recognition
  - Search/filter functionality

#### 3.2.3 Tools Panel
- **Purpose**: Access to editor tools and utilities
- **Elements**:
  - Search functionality
  - Settings and preferences
  - Statistics and usage information
  - Documentation links

### 3.3 Main Editor Panel

#### 3.3.1 Editor Header
- **Elements**:
  - Tabbed interface for multiple files
  - File name with close button
  - File status indicators (saved/dirty)
  - Action buttons (save, undo, redo)

#### 3.3.2 Code Editor Area
- **Requirements**:
  - Syntax highlighting for JPE constructs
  - Line numbers and code folding
  - Error/warning markers in margin
  - Contextual help tooltips
  - Auto-completion with JPE-specific suggestions
  - Bracket matching and indentation guides

### 3.4 Preview Panel

#### 3.4.1 Preview Header
- **Elements**:
  - Title with "XML Preview (LIVE)" indicator
  - Toggle for preview visibility
  - Export/copy buttons
  - Refresh button

#### 3.4.2 XML Preview Area
- **Requirements**:
  - Real-time transformed XML output
  - Synchronized scrolling with editor
  - Highlighting corresponding elements
  - Collapsible sections for readability
  - Copy-to-clipboard functionality

#### 3.4.3 Status Bar
- **Elements**:
  - File validation status
  - Transformation time
  - Current line/column position
  - Encoding and line ending information

## 4. Visual Design

### 4.1 Color Palette
- **Primary Background**: #1e293b (dark slate)
- **Secondary Background**: #334155 (slate)
- **Surface**: #0f172a (dark blue)
- **Text**: #f1f5f9 (light gray)
- **Primary Accent**: #2563eb (blue)
- **Secondary Accent**: #4f46e5 (indigo)
- **Border**: #475569 (medium gray)

### 4.2 Typography
- **Code Font**: Fira Code, Consolas, monospace (14px)
- **UI Font**: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto (13px)
- **Headers**: Medium weight (500)
- **Body**: Regular weight (400)

### 4.3 Iconography
- **File Types**: Different icons for .jpe files, folders, etc.
- **Mod Elements**: Unique icons for interactions (🎭), buffs (💫), traits (🧬)
- **Actions**: Standard UI icons for save, copy, export, etc.
- **Status**: Icons for validation (✓, ⚠, ❌), loading states

## 5. Interaction Patterns

### 5.1 Keyboard Shortcuts
- **Ctrl+S**: Save file
- **Ctrl+/**: Toggle comment
- **Ctrl+Space**: Show completions
- **Ctrl+F**: Find in file
- **Ctrl+Shift+F**: Find in project
- **F1**: Show documentation
- **Ctrl+Shift+P**: Command palette
- **Ctrl+[, Ctrl+]**: Fold/unfold code sections

### 5.2 Hover States
- File explorer items show quick action buttons on hover
- Code elements show documentation tooltips
- Preview elements highlight corresponding source lines
- Buttons show subtle color change on hover

### 5.3 Context Menus
- Right-click in editor: "Go to Definition", "Find Usages", "Refactor", "Comment"
- Right-click in file explorer: "New File", "Rename", "Delete", "Open in Terminal"
- Right-click in preview: "Copy XML", "Export to File", "View in Browser"

## 6. Responsiveness

### 6.1 Adaptive Layout
- Sidebar can be collapsed/expanded
- Preview panel can be resized or moved to right side
- Editor area adjusts to available space
- Elements reflow appropriately on smaller screens

### 6.2 Touch Support (Future)
- Optimized touch targets for tablet use
- Gesture support for common actions
- Responsive design for various screen sizes

## 7. Accessibility

### 7.1 Keyboard Navigation
- Full functionality accessible via keyboard
- Logical tab order through interface
- Visible focus indicators

### 7.2 Screen Reader Support
- Proper ARIA labels for all interactive elements
- Semantic HTML structure
- Alt text for icons and images

### 7.3 Color Contrast
- WCAG AA compliance for text/background contrast
- Alternative indicators beyond color alone
- High contrast mode support

## 8. Performance Requirements

### 8.1 Responsiveness
- UI updates within 16ms (60fps) for smooth interactions
- Code completion suggestions within 100ms
- File opening within 500ms for files under 1MB

### 8.2 Memory Usage
- Efficient memory management for large projects
- Lazy loading of components when possible
- Proper cleanup of unused resources

## 9. Integration Points

### 9.1 JPE Engine API
- Real-time transformation of JPE to XML
- Validation against JPE grammar rules
- Error reporting with precise locations
- Project build functionality

### 9.2 File System
- File creation, deletion, and modification
- Project structure management
- Integration with version control systems

## 10. Error States and Edge Cases

### 10.1 Loading States
- Visual indicators during file operations
- Progress bars for longer operations
- Skeleton screens for preview areas

### 10.2 Error Handling
- Clear error messages with actionable guidance
- Graceful degradation when services unavailable
- Recovery options for failed operations

### 10.3 Empty States
- Helpful messaging when project is empty
- Guidance for getting started
- Quick actions to create new content

## 11. Future Enhancements

### 11.1 Visual Mod Designer
- Graphical interface for creating mod elements
- Drag-and-drop composition tools
- WYSIWYG interaction designer

### 11.2 Advanced Debugging
- Integration with Sims 4 testing tools
- Performance analysis features
- Conflict detection with other mods

### 11.3 Collaboration Features
- Real-time collaborative editing
- Comment and review system
- Change tracking and history
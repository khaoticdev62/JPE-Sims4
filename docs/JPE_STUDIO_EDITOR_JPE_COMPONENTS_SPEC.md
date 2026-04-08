# JPE Studio Editor - JPE-Specific UI Components Specification

## 1. Overview

This document specifies the UI components that are unique to the JPE Studio Editor, designed specifically to support the JPE (Just Plain English) language for Sims 4 mod development. These components go beyond standard code editor features to provide specialized functionality for JPE authors.

## 2. JPE-Specific Components

### 2.1 JPE Element Inspector

#### Purpose
Provide detailed information about the selected JPE element, including its properties, relationships, and validation status.

#### Location
Right sidebar, docked below the file explorer or as a floating panel

#### Components
- **Element Type**: Clear identification of the element (interaction, buff, trait)
- **Properties Panel**: All properties of the selected element with edit capability
- **Relationships**: Links to other elements this element references
- **Validation Status**: Real-time validation results for the element
- **Documentation**: Contextual help and examples for the element type

#### Visual Design
- Clean card-based layout with clear section headers
- Color-coded status indicators (valid: green, warning: yellow, error: red)
- Expandable sections for detailed information
- Quick action buttons for common operations

#### Interaction
- Automatically updates when cursor moves to different elements
- Click on properties to jump to their location in code
- Edit properties directly in the inspector (synchronized with code)
- Expand/collapse sections as needed

### 2.2 Mod Element Palette

#### Purpose
Quick access to common JPE elements and templates for rapid mod creation.

#### Location
Left sidebar, above the file explorer or as a separate tab

#### Components
- **Interaction Templates**: Pre-built interaction patterns (socials, autonomous, etc.)
- **Buff Templates**: Common buff types (moodlets, effects, etc.)
- **Trait Templates**: Standard trait patterns (personality, skill, etc.)
- **Test Templates**: Common condition patterns (age, relationship, etc.)
- **Action Templates**: Frequent loot action patterns (apply buff, modify stat, etc.)

#### Visual Design
- Grid layout with visual icons for each template
- Hover previews showing template structure
- Search and filter capabilities
- Category grouping with expandable sections

#### Interaction
- Drag and drop templates into editor
- Click to insert template at cursor position
- Right-click for customization options
- Filter by category or search by name

### 2.3 JPE Syntax Validator Panel

#### Purpose
Provide detailed validation feedback specific to JPE syntax and Sims 4 requirements.

#### Location
Bottom panel, alongside the XML preview

#### Components
- **Validation Summary**: Count of errors, warnings, and info messages
- **Detailed Messages**: List of all validation issues with severity indicators
- **Quick Fix Suggestions**: One-click fixes for common issues
- **Sims 4 Compliance**: Specific checks for Sims 4 mod requirements
- **Performance Warnings**: Potential performance issues in the mod

#### Visual Design
- Tabbed interface (Errors, Warnings, Info)
- Color-coded severity levels
- Collapsible message details
- Line number references for quick navigation
- Action buttons for quick fixes

#### Interaction
- Click on messages to jump to relevant code location
- Apply quick fixes with one click
- Expand/collapse message details
- Filter by severity level
- Clear resolved issues

### 2.4 JPE-to-XML Transformation Visualizer

#### Purpose
Visual representation of how JPE elements map to XML structure, helping users understand the transformation process.

#### Location
Bottom panel, as an alternative view to raw XML preview

#### Components
- **Visual Mapping**: Graphical representation of JPE to XML element relationships
- **Synchronized Highlighting**: Highlight corresponding elements in both views
- **Transformation Rules**: Explanation of how each JPE construct becomes XML
- **Difference Viewer**: Show changes between original and transformed XML
- **Element Details**: Detailed view of specific element transformations

#### Visual Design
- Flowchart-style visualization with arrows showing relationships
- Color-coded elements matching syntax highlighting
- Interactive nodes that can be expanded for details
- Side-by-side comparison view
- Zoom and pan controls for large transformations

#### Interaction
- Click on visual elements to jump to source in editor
- Hover for detailed transformation information
- Toggle between different visualization modes
- Zoom in/out for detailed inspection
- Export visualization as image

### 2.5 Sims 4 Object Browser

#### Purpose
Browse and reference existing Sims 4 objects, traits, buffs, and other game elements.

#### Location
Left sidebar, as a tab or expandable section

#### Components
- **Object Categories**: Different types of Sims 4 elements (objects, traits, buffs, etc.)
- **Search Functionality**: Search by name, ID, or description
- **Preview Panel**: Visual preview of selected elements when available
- **Reference Insertion**: One-click insertion of references into code
- **Compatibility Information**: Information about which game packs are required

#### Visual Design
- Tree view with expandable categories
- Thumbnail previews where available
- Search bar with filtering options
- Clean list view with essential information
- Status indicators for game pack requirements

#### Interaction
- Search and filter elements
- Double-click to insert reference into editor
- Right-click for additional options (view details, copy reference, etc.)
- Drag and drop references into editor
- Expand categories to browse

### 2.6 JPE Template Manager

#### Purpose
Manage and organize JPE templates for different mod types and patterns.

#### Location
Modal dialog or dedicated panel

#### Components
- **Template Library**: Collection of available templates
- **Custom Templates**: User-created templates
- **Template Editor**: Interface for creating and modifying templates
- **Template Categories**: Organization of templates by type or use case
- **Import/Export**: Share templates with other users

#### Visual Design
- Grid layout with template previews
- Category tags for organization
- Search and filter controls
- Preview pane showing template structure
- Action buttons for management tasks

#### Interaction
- Browse templates by category or search
- Preview templates before insertion
- Create new templates from selected code
- Edit existing templates
- Import/export templates as files

### 2.7 JPE Refactoring Tools

#### Purpose
Specialized refactoring tools for JPE-specific patterns and structures.

#### Location
Context menu in editor, or as commands in command palette

#### Components
- **Rename Element**: Safely rename interactions, buffs, traits with reference updates
- **Extract Pattern**: Create reusable templates from selected code
- **Inline Reference**: Replace references with their definitions
- **Move Element**: Move elements between files while updating references
- **Generate Documentation**: Create documentation comments for elements

#### Visual Design
- Modal dialogs for complex refactoring operations
- Preview of changes before applying
- Progress indicators for multi-file operations
- Confirmation dialogs for potentially destructive operations

#### Interaction
- Right-click context menu in editor
- Command palette entries for refactoring
- Preview changes before applying
- Undo capability for refactoring operations
- Progress tracking for large operations

### 2.8 JPE Debugging Console

#### Purpose
Debug JPE transformations and validate mod behavior before deployment.

#### Location
Bottom panel, as a tab alongside other panels

#### Components
- **Transformation Logs**: Detailed logs of the JPE to XML transformation process
- **Error Simulation**: Simulate different game states to test mod behavior
- **Performance Metrics**: Measure transformation time and resource usage
- **State Inspector**: Inspect the internal state of the transformation engine
- **Test Runner**: Run automated tests on JPE code

#### Visual Design
- Multi-tabbed interface for different debugging aspects
- Color-coded log levels (info, warning, error, debug)
- Collapsible log entries with details
- Progress bars for ongoing operations
- Clear visual hierarchy of information

#### Interaction
- Filter logs by level or content
- Expand/collapse log entries
- Copy log content for sharing
- Run specific tests or validation checks
- Clear logs when needed

## 3. Component Integration

### 3.1 State Synchronization
All components must stay synchronized with the current editor state:
- When a different file is opened, components update to reflect that file
- When code is modified, validation and preview components update automatically
- When the cursor moves, the element inspector updates to show the current element

### 3.2 Performance Considerations
- Components should update efficiently without blocking the UI
- Heavy operations should be performed asynchronously
- Components should be lazy-loaded when possible
- Memory usage should be minimized for large projects

### 3.3 User Customization
- Users should be able to show/hide components as needed
- Component layouts should be customizable and persistable
- Default configurations should be provided for different user types
- Component settings should be project-specific when appropriate

## 4. Accessibility Requirements

### 4.1 Keyboard Navigation
- All components must be fully navigable via keyboard
- Keyboard shortcuts should be consistent across components
- Focus indicators must be clearly visible
- Screen reader compatibility is essential

### 4.2 Visual Accessibility
- All components must meet WCAG AA contrast requirements
- Visual indicators should have non-color alternatives
- Text sizes should be adjustable
- Animations should be optional or reducible

## 5. Future Enhancements

### 5.1 AI-Assisted Features
- Intelligent code completion based on Sims 4 patterns
- Automatic generation of common mod elements
- Smart refactoring suggestions
- Error prediction and prevention

### 5.2 Collaboration Tools
- Real-time collaborative editing
- Comment and review system for JPE code
- Change tracking and history
- Shared template libraries

### 5.3 Advanced Visualization
- 3D preview of mod effects in game context
- Interactive simulation of interaction flows
- Dependency visualization for complex mod networks
- Performance impact visualization
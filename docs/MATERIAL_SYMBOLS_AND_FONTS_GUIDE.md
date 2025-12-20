# Material Symbols and Fonts Guide

## 1. Overview
This document establishes the standard typography and iconography for the JPE Sims 4 Mod Translator project, ensuring a consistent, modern, and accessible user experience across all platforms (Desktop, Mobile, Web).

## 2. Typography
The project uses the **Google Material Type System**.

### Primary Font: Roboto
*   **Usage:** Headings, Body text, UI labels.
*   **Weights:**
    *   **Light (300):** Large display text.
    *   **Regular (400):** Body text, default labels.
    *   **Medium (500):** Subheadings, button text.
    *   **Bold (700):** High-emphasis headings.
*   **Source:** [Google Fonts: Roboto](https://fonts.google.com/specimen/Roboto)

### Code Font: Roboto Mono
*   **Usage:** Code editors, JPE syntax display, debug logs.
*   **Source:** [Google Fonts: Roboto Mono](https://fonts.google.com/specimen/Roboto+Mono)

### Implementation
*   **Directory:** `ui/assets/fonts/`
*   **Files:** `Roboto-Regular.ttf`, `Roboto-Medium.ttf`, `Roboto-Bold.ttf`, `RobotoMono-Regular.ttf`.

## 3. Iconography
The project uses **Google Material Symbols** (variable icon font).

### Specification
*   **Style:** **Outlined** (Default), **Rounded** (for "Friendly" themes), **Sharp** (for "Cyberpunk" themes).
*   **Fill:** 0 (Default), 1 (Active states).
*   **Weight:** 400 (Regular).
*   **Grade:** 0.
*   **Optical Size:** 24px (Standard), 20px (Small), 40px (Large).

### Source
*   [Google Fonts: Material Symbols](https://fonts.google.com/icons)

### Implementation
*   **Method A (Qt/Desktop):** Load the `MaterialSymbolsOutlined.ttf` font file. Use the unicode codepoint or ligature string (if supported) to render icons.
*   **Method B (Web/Mobile):** Use SVG files or the standard Google Fonts CSS API.
*   **Naming Convention:** Snake_case (e.g., `arrow_forward`, `save_as`).

## 4. Google Stitch for UX Assets
**Google Stitch** is an AI-powered design tool used to generate high-fidelity UX assets and complex UI components.

### Use Cases
*   **Complex Icons:** When a standard Material Symbol doesn't exist.
*   **Themed Backgrounds:** Generating "Cyberpunk" or "Nature" background textures for the hyper-themes.
*   **Layout Prototyping:** Generating HTML/CSS for new dashboard widgets.

### Workflow
1.  **Prompt:** Use the Stitch interface (or simulated prompt) to describe the asset.
    *   *Example:* "Generate a semi-transparent modal background with a futuristic neon hexagonal pattern in #2C5F99 and #FF008C."
    *   *Example:* "Create an SVG icon representing 'mod conflict detection' in Material Design 3 outlined style."
2.  **Refine:** Iteratively adjust the prompt for style matching (e.g., "Make lines thinner", "Add padding").
3.  **Export:** Save as **SVG** (for vector scalability) or **PNG** (for complex textures).
4.  **Integrate:** Place in `ui/assets/images/` or `ui/assets/icons/custom/`.

## 5. Implementation Strategy for Developers

### Directory Structure
```
ui/
└── assets/
    ├── fonts/
    │   ├── Roboto-Regular.ttf
    │   ├── Roboto-Bold.ttf
    │   └── MaterialSymbolsOutlined.ttf
    └── icons/
        └── custom/ (Stitch-generated SVGs)
```

### Qt Integration (Python)
```python
from PySide6.QtGui import QFontDatabase, QFont

def load_fonts():
    QFontDatabase.addApplicationFont("ui/assets/fonts/Roboto-Regular.ttf")
    QFontDatabase.addApplicationFont("ui/assets/fonts/MaterialSymbolsOutlined.ttf")

def get_icon_font(size=24):
    font = QFont("Material Symbols Outlined")
    font.setPixelSize(size)
    return font
```

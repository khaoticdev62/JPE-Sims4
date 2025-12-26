# Layout Components Prompt

## Context
Design the core layout structures for "JPE Mod Translator 2.0". These components define the application's structure and spatial relationships, adhering to the "Modern Dark Mode" and "Apple TV UX" guidelines.

## Components to Design

### 1. Card
- **Usage:** Primary container for content (Project items, Mod files).
- **Visuals:**
  - `background-secondary` or `background-tertiary` fill.
  - Subtle border (`border-subtle`).
  - **Focus State:** 
    - Scale up (1.02x - 1.05x).
    - Drop shadow/Glow (`accent-focus` color).
    - Z-index elevation.
  - **Hover State:** Slight brightness increase.

### 2. Modal
- **Usage:** Critical actions (New Project, Settings, Confirmations).
- **Visuals:**
  - Centered overlay with backdrop blur (Glassmorphism).
  - `background-tertiary` fill with high opacity.
  - Distinct shadow to separate from background.
  - Smooth entry/exit animations (scale/fade).

### 3. Sidebar (Navigation)
- **Usage:** Primary navigation (Projects, Studio, Settings).
- **Visuals:**
  - Fixed width, full height.
  - `background-secondary` fill.
  - "Floaty" navigation items (pills) that highlight on focus.

## Technical Constraints
- Use flexbox/grid for internal layouts.
- Ensure spacing follows the `spacing` token scale (e.g., `4`, `6`, `8`).
- Transitions must be performant (transform/opacity only).

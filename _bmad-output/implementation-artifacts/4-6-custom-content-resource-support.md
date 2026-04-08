# Story 4.6: Custom Content (CC) Resource Support

## Overview
**Story ID**: 4.6
**Epic**: Epic 4: Advanced Modding & Reverse Engineering
**Status**: done

As a Modder,
I want to browse and manage non-tuning resources in my .package files,
So that I can organize textures and assets alongside my logic.

## Acceptance Criteria
- [x] **Given** a Sims 4 .package file containing binary assets (PNG, DDS, LRLE).
- [x] **When** the package is opened in the Resource Browser.
- [x] **Then** I see a list of non-tuning resources with their Type, Group, and Instance IDs.
- [x] **And** selecting an image resource (PNG/DDS) displays a high-fidelity visual preview in the editor pane.

## Developer Context
### Goals
- Expand `.package` processing beyond XML tuning.
- Implement a read-only "Resource Browser" for binary assets.
- Integrate a visual previewer for common image formats used in Sims 4 CC (PNG, DDS).

### Technical Requirements
- **Service**: Update `PackageService.ts` to identify non-tuning resource types (e.g., `0x00B2D882` for PNG).
- **UI**: Create a `ResourcePreviewer.tsx` component that can render raw byte arrays as images.
- **Library**: Use a lightweight DDS to PNG converter if direct DDS rendering is not supported by the browser/Electron.

### Dependencies
- Story 4.2 (.package File Reader) - Must use existing package reading logic.

## Technical Guardrails
- **Performance**: Deep-load binary assets only on selection; do not buffer all images for a large package.
- **Aesthetics**: Follow the Slate-900 design system with Apple-style "Quick Look" UI for previews.

## Testing Requirements
- Unit tests for resource type detection.
- Integration tests for visual preview mounting.

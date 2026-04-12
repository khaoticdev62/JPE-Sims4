# Story 12.1: Global Industrial Presence - GitHub & Branding

**Epic:** 12 - Industrial Presence & Market Launch  
**Status:** ready-for-dev  
**Author:** Antigravity (on behalf of khaoticdev)

## Description

Create a professional, high-fidelity GitHub presence for JPE Studio 2.1 that captures the distinct voices of both expert Sims 4 modders and total beginners. This includes a sleek `README.md`, high-quality branding assets (logo, banner), and visual proofs (screenshots/videos) captured directly from the industrial UI.

## User Persona Alignment

- **The Expert (Alex)**: Focus on the "Industrial Power" of the XML-to-JPE engine, local AI autonomy, and hardware-bound security.
- **The Newbie (Maya)**: Focus on the "Aha!" moment of human-readable mods, the zero-fatigue Zen HUD, and the guiding onboarding tour.

## Acceptance Criteria (BDD)

### Scenario 1: Expert Modder Visual Audit
- **Given** I am an expert modder looking for a professional tool
- **When** I land on the JPE Studio GitHub repository
- **Then** I see a high-density "Workbench" screenshot showcasing the JPE grammar and real-time XML synchronization
- **And** I find a technical section describing the hardware-bound AES-256 handshake and GGUF local model distribution

### Scenario 2: Newbie Modder Discovery
- **Given** I have never created a Sims 4 mod before
- **When** I read the "Getting Started" section of the README
- **Then** the language is welcoming, jargon-free, and highlights the "Just Plain English" (JPE) translation benefit
- **And** I see a screenshot of the "Zen Mode" with a clean, bioluminescent interface

### Scenario 3: Brand Cohesion
- **Given** I am browsing through the repository files
- **When** I look at the assets in `docs/assets/`
- **Then** I find a professionally designed logo (Teal/Slate) and a wide-scale Spectral banner that matches the app's "Industrial Synthesis" aesthetic

### Scenario 4: Visual Substantiation
- **Given** I want to see the app in action before downloading
- **When** I scroll to the "Visual Highlights" section
- **Then** I find a short video or GIF showing the "Technical Ignition" (boot sequence) and a live XML-to-JPE translation scan

### Scenario 5: Steam Deck Optimization
- **Given** I am browsing the GitHub on my Steam Deck
- **When** I look at the "Handheld Studio" section
- **Then** I see high-fidelity assets specifically formatted for the Steam Deck UI (Capsules, Banners, Hero images)
- **And** the text highlights "Focus Mode" and "Chorded Controller Shortcuts" for 800p productivity

## Technical Requirements

1.  **Branding Assets**:
    - Logo: 512x512 Teal-themed insignia.
    - Banner: 1200x400 high-fidelity Spectral landscape.
2.  **Steam Deck Assets**:
    - Vertical Capsule: 600x900 (High-res).
    - Horizontal Banner: 920x430.
    - Library Hero: 1920x620.
3.  **README Structure**:
    - Hero Image (Banner).
    - Headline & Slogan.
    - "The Expert's Toolkit" vs "The Beginner's Bridge" comparison.
    - Features List (Categorized).
    - Visual Gallery (Screenshots/GIFs).
    - Technical Stack & Security.
3.  **Visual Capture**:
    - Use Playwright script `scripts/capture_branding_assets.ts` to automate UI captures at 1280x800 (Steam Deck resolution) and 1920x1080.

## Implementation Guardrails

- **Do Not** use stock placeholder images. Generate actual branding assets.
- **Do Not** use generic AI-sounding blurbs. Maintain the "Industrial Studio" voice.
- **Maintain** the Spectral design system colors: Teal (#2DD4BF), Slate-900 (#0F172A), and Bioluminescent glows.
建设

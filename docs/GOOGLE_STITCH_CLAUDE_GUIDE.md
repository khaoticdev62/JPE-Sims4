# Google Stitch & Claude Synergy Guide

## 1. The Power of Synergy
This guide explains how to combine **Google Stitch** (design methodology and tokens) with **Claude 3.5 Sonnet** (AI reasoning) to generate high-fidelity UX assets for JPE Studio.

## 2. Workflow: AI-Driven Asset Generation

### Step 1: Contextual Priming
Before generating an asset, Claude must be primed with the JPE Design System. Use the `ClaudePrompter` to send the `DESIGN_TOKENS` as a system message.

### Step 2: The "Stitch Prompt" Generation
Instead of writing a prompt manually, ask Claude to generate a "Google Stitch Optimized Prompt."

**Claude System Instruction**:
> "You are an expert UI designer for JPE Studio. Your goal is to write a prompt for Google Stitch. Use the Neon Purple brand palette (#8638fa), Material Design 3 guidelines, and specific JPE tokens (Surface 0: #251A3A)."

### Step 3: Direct SVG Authoring
Claude can bypass the Stitch web interface by directly generating SVG code that follows the Stitch aesthetic.

**Example Request to Claude**:
*"Generate a 'Mod Conflict' illustration in the Google Stitch style. Use a hexagonal base, neon purple outlines, and a red warning highlight."*

## 3. Implementing the "Stitch Helper"
We provide a Python utility to automate this process.

```python
from ai.claude_stitch_helper import StitchHelper

# Initialize helper with Claude 3.5 Sonnet
helper = StitchHelper(model="claude-3-5-sonnet")

# Generate a brand-aligned SVG
svg_code = helper.generate_asset(
    concept="Advanced Build Success",
    asset_type="illustration",
    theme="cyberpunk"
)
```

## 4. Prompt Engineering for Stitch (Claude Edition)

When using Claude to generate prompts for the Stitch tool, use these "Magic Keywords":
- **"Volumetric Glow"**: For the Neon Purple accent.
- **"Translucent Frosted Glass"**: For Surface 0 / Surface 1 elements.
- **"Mathematical Precision"**: For geometric background patterns.
- **"Non-intrusive metadata"**: For dashboard widget designs.

## 5. Verification & Optimization
1.  **Claude Review**: After generating an SVG, send the code back to Claude for a "Contrast and Accessibility" audit.
2.  **Stitch Refinement**: If the visual isn't perfect, use Stitch's iterative slider to adjust weight and grade, then feed those values back into Claude's memory.

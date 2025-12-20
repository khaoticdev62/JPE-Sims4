# Claude Implementation Plan for JPE Studio

## Overview
This plan outlines the integration of Anthropic's Claude models (via Google Vertex AI) into the JPE Sims 4 Mod Translator ecosystem. This integration enhances the predictive authoring engine with advanced reasoning, code generation, and design capabilities.

## 1. Core Integration Components

### 1.1 Protyping & Prompters
The integration utilizes a specialized `Prompter` architecture to ensure Claude receives high-quality, context-aware instructions.

- **`ClaudePrompter`**: Responsible for formatting messages into the Anthropic-specific format.
  - Handles `system` messages for behavioral guardrails.
  - Supports `user` messages for specific tasks (mod creation, debugging).
  - Manages `stop_sequences` to ensure valid JPE/XML output.

### 1.2 Model Selection
We standardize on the following models via Vertex AI:
- **Claude 3.5 Sonnet**: Primary model for UI/UX generation and complex mod logic.
- **Claude 3 Opus**: Used for high-stakes validation and deep architectural analysis.
- **Claude 3 Haiku**: Used for low-latency inline completions and basic syntax checks.

### 1.3 Agentic Architecture
Claude is implemented as a subclass of `AgentClient` and `BaseLlm`, allowing it to:
- Access tools (file system, compilers).
- Maintain conversation history.
- Provide structured output (JSON/SVG) for UI integration.

## 2. Technical Implementation Steps

### 2.1 API Conversion
Utilize the `GoogleApiToOpenApiConverter` to bridge the gap between Google's Discovery services (used for Stitch integration) and Claude's tool-calling capabilities. This allows Claude to "understand" and interact with Google-hosted design services.

### 2.2 Vertex AI Integration
```python
class Claude(BaseLlm):
    """Claude model integration via Vertex AI."""
    def __init__(self, model: str = "claude-3-5-sonnet@20240620", project: str = None):
        self.model_name = model
        self.client = vertexai.generative_models.GenerativeModel(model)
        # Integration logic here
```

### 2.3 Error Grading & Benchmarking
Implement `ClaudeApiGradingBenchmark` to evaluate the quality of AI-generated mod fixes against canonical Sims 4 tuning patterns.

## 3. Synergy with Google Stitch
Claude acts as the "Brain" behind the "Stitch" designer. While Stitch provides the visual methodology and tokens, Claude generates the precise prompts and SVG code required to produce brand-aligned assets.

## 4. Security & Compliance
- **Data Anonymization**: All file paths and usernames are stripped before being sent to the Claude API.
- **Opt-in Policy**: Remote AI features require explicit user consent in Global Settings.
- **Local Fallback**: The system defaults to the SQLite predictive engine if the Claude API is unavailable.

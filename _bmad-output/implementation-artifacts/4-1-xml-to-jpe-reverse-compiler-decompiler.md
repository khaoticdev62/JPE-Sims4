# Story 4.1: XML-to-JPE Reverse Compiler (Decompiler)

**Epic 4: Advanced Modding & Reverse Engineering**
**Status: ready-for-dev**

## 🎯 Goal

Enable modders to import existing Sims 4 XML tuning files and convert them into the "Just Plain English" (JPE) format for easier editing and visualization.

## 🏗️ Technical Context

The JPE language is a "Semantic Layer" over Sims 4 XML. While a basic structural translation (Tag -> [Section]) works for simple metadata, true decompilation requires **pattern-matching** common Sims 4 XML structures back into JPE keywords.

### Core Mappings (Semantic Rehydration)

| Sims 4 XML Pattern | JPE Keyword | Description |
| :--- | :--- | :--- |
| `<L n="tests">` | `ONLY_IF` | List of conditional tests. |
| `<V n="enabled">` | `WHEN` | Conditional variant/toggle. |
| `<U n="outcome">` | `DO` | Interaction outcome or response. |
| `<T n="text">` | `text = "..."` | Localized string reference. |
| `i="12345"` | `id = "12345"` | Instance ID (in Metadata). |

## 📝 Acceptance Criteria

### AC1: Structural Reconstruction

- **Given** a valid Sims 4 XML tuning file.
- **When** the `xmlToJpe` service is executed.
- **Then** the root attributes (`i`, `c`, `m`) are extracted into a `[Metadata]` section.
- **And** hierarchical nested tags are converted into JPE `[Section]` blocks with correct indentation.

### AC2: Keyword Rehydration

- **Given** an XML element representing a list of tests (`n="tests"`).
- **When** decompiled.
- **Then** it is represented using the `ONLY_IF` block syntax rather than a generic `[L]` section.

### AC3: Round-trip Fidelity

- **Given** an XML file.
- **When** decompiled to JPE and then immediately re-compiled to XML.
- **Then** the resulting XML must be functionally equivalent to the source (**Identity Mapping**).

## 🛠️ Implementation Guardrails

- **Parser Choice**: Utilize the existing `XMLParser` to generate the `XMLElement` AST.
- **AST Generation**: Convert `XMLElement` into `ASTNode` (JPE AST) to leverage existing JPE stringification logic.
- **Location**: Implementation should reside in [src/engine/translators/xmlToJpe.ts](file:///c:/Users/thecr/Desktop/JPE_Mod_Translator_2.0/src/engine/translators/xmlToJpe.ts).

## 🧪 Testing Requirements

- **Unit Test**: `src/__tests__/engine/xmlToJpe.test.ts`
- **Scenarios**:
  - Empty Metadata
  - Nested Interaction with Outcome
  - Conditional Tests (`ONLY_IF` conversion)
  - FnV-64 Hash Reference matching

# BMAD Tasks

This directory contains **21 executable task workflows** that guide agents through specific development activities. Each task file contains detailed step-by-step instructions for accomplishing a particular goal.

## Task Categories

### Story & Epic Management

- `create-next-story.md` - Draft a detailed user story from requirements
- `create-brownfield-story.md` - Create story for brownfield (existing system) change
- `brownfield-create-epic.md` - Define epic for brownfield project

### Requirements & Planning

- `advanced-elicitation.md` - Deep requirements gathering and elicitation
- `facilitate-brainstorming-session.md` - Run structured brainstorming sessions
- `create-deep-research-prompt.md` - Create research prompts for analysis

### Documentation

- `create-doc.md` - Create any document from a template
- `document-project.md` - Document existing project structure
- `shard-doc.md` - Split large documents for context management
- `index-docs.md` - Create index/table of contents for documents

### Quality Assurance

- `test-design.md` - Create comprehensive test strategy and test cases
- `qa-gate.md` - Execute quality gate decision (PASS/CONCERNS/FAIL/WAIVED)
- `review-story.md` - Comprehensive story review including QA validation
- `trace-requirements.md` - Map requirements to tests (traceability)
- `nfr-assess.md` - Assess non-functional requirements (performance, security, etc.)
- `risk-profile.md` - Create risk assessment and mitigation plan

### Process Management

- `execute-checklist.md` - Run any checklist for validation
- `correct-course.md` - Assess and correct project direction
- `validate-next-story.md` - Validate story completeness before implementation
- `kb-mode-interaction.md` - Interact with knowledge base and learning mode
- `apply-qa-fixes.md` - Apply fixes from QA findings

### Frontend Development

- `generate-ai-frontend-prompt.md` - Create prompts for AI UI generation tools

## Quick Reference

| Task | Purpose | Input | Output | Typically Run By |
|------|---------|-------|--------|------------------|
| `create-doc` | Generate document from template | Template + content | Documentation | Any agent |
| `create-next-story` | Draft user story | Requirements | Story YAML | Scrum Master |
| `test-design` | Design test strategy | Requirements, acceptance criteria | Test design doc | QA |
| `qa-gate` | Quality decision gate | Story + review findings | Gate decision file | QA |
| `review-story` | Comprehensive review | Story, architecture, PRD | Review results | QA |
| `trace-requirements` | Requirements to tests | Acceptance criteria | Traceability matrix | QA |
| `execute-checklist` | Run validation checklist | Checklist + artifact | Validation results | Any agent |
| `document-project` | Document existing project | Project structure | Project doc | Analyst |

## How Tasks Work

### Task Execution Flow

1. **Load Task File**: Agent loads the task markdown
2. **Read Instructions**: Agent follows step-by-step instructions
3. **Load Dependencies**: On demand, load referenced templates/checklists
4. **Execute Sequentially**: Don't skip steps; follow exact order
5. **Produce Output**: Generate specified output artifacts
6. **Validate Results**: Check against validation criteria

### Task Structure

Each task file includes:

```markdown
# [Task Name]

## Purpose
- Why this task exists
- What problem it solves

## Prerequisites
- Required inputs
- Needed files/context

## SEQUENTIAL Task Execution (step-by-step)
### Step 1: [Task Name]
- Detailed instructions
- What to do
- What to produce

### Step 2: [Next Step]
- Continue execution
- Follow exact instructions

## Validation
- How to verify output
- Pass/fail criteria

## Output
- What gets created
- Where it's stored
```

## Task Dependencies

Tasks load dependencies on demand:

- **Templates**: YAML files for document structure
- **Checklists**: Markdown files for validation criteria
- **Data Files**: Knowledge base and reference materials
- **Configuration**: Settings from `core-config.yaml`

## Important Task Patterns

### Anti-Hallucination Verification

Many tasks include verification steps:

- Cross-reference claims with source documents
- Verify technical decisions are supported by requirements
- Flag unsupported technical choices
- Ensure traceability to original requirements

**Why**: Agents can hallucinate details not in requirements. Verification prevents this.

### Comprehensive Review Pattern

Quality tasks follow comprehensive review:

1. **Template Compliance**: Check structure and completeness
2. **Requirements Coverage**: Map features to requirements
3. **Acceptance Criteria**: Verify all criteria will be met
4. **Testing**: Plan comprehensive tests
5. **Risk Assessment**: Identify potential issues
6. **Gate Decision**: PASS/CONCERNS/FAIL/WAIVED

### Documentation Pattern

Documentation tasks follow consistent steps:

1. **Load Configuration**: Get document settings from `core-config.yaml`
2. **Select Template**: Load appropriate YAML template
3. **Fill Content**: Complete all sections and placeholders
4. **Validate**: Check completeness and consistency
5. **Store**: Save per project configuration
6. **Cross-reference**: Link to related documents

## Special Task Instructions

### Elicitation Tasks

Tasks with `elicit=true` require user interaction:

- `advanced-elicitation.md` - Deep requirements gathering
- `facilitate-brainstorming-session.md` - Group ideation
- `create-deep-research-prompt.md` - Research preparation

**Important**: Don't skip elicitation for efficiency. User input improves quality.

### Sequential Execution

All tasks use `## SEQUENTIAL Task Execution`:

- Execute steps in exact order
- Don't skip or reorder steps
- Complete each step before moving to next
- Don't combine steps

**Why**: Each step builds on previous work. Skipping steps causes incomplete output.

### Validation Criteria

Each task includes validation:

- **Critical Issues**: Must be fixed; blocks progress
- **Should-Fix Issues**: Important quality improvements
- **Nice-to-Have**: Optional enhancements
- **Go/No-Go Decision**: Ready to proceed or needs work

## Command Patterns

### Create Documents

```
*create-doc {template}     # Create doc from template
*create-doc               # Show available templates
```

Common templates:
- `prd-tmpl` - Product Requirements Document
- `architecture-tmpl` - System Architecture
- `front-end-spec-tmpl` - Frontend Specification
- `story-tmpl` - User Story

### Run Checklists

```
*execute-checklist {checklist}    # Run validation checklist
```

Common checklists:
- `story-draft-checklist` - Story quality check
- `architect-checklist` - Architecture review
- `po-master-checklist` - Product Owner review

### Create Stories

```
*draft                         # Create next story (Scrum Master)
*create-next-story {epic}      # Story from epic
```

### Quality Gates

```
*gate {story}                  # Run quality gate (QA)
*review {story}                # Comprehensive review (QA)
*test-design {story}           # Create test design (QA)
```

## Configuration Considerations

Tasks respect `core-config.yaml` settings:

```yaml
markdownExploder: true        # Split large docs automatically
prd:
  prdSharded: true            # Split PRD into sections
architecture:
  architectureSharded: true   # Split architecture docs
qa:
  qaLocation: docs/qa         # Where QA files are stored
```

## Usage Examples

### Create a Product Requirements Document

```
Agent: Product Manager
Task: create-doc
Command: *create-doc prd-tmpl
Process:
  1. Load prd-tmpl.yaml
  2. Fill in all sections
  3. Validate completeness
  4. Output to docs/prd.md
```

### Create a User Story

```
Agent: Scrum Master
Task: create-next-story
Command: *draft
Process:
  1. Load requirements from PRD/architecture
  2. Break down into user story
  3. Create acceptance criteria
  4. Define dev notes and tasks
  5. Validate against story template
  6. Output story YAML
```

### Review a Story for Quality

```
Agent: QA
Task: review-story
Command: *review {story}
Process:
  1. Load story file
  2. Validate template compliance
  3. Check acceptance criteria coverage
  4. Create test design
  5. Assess risks
  6. Write QA Results
  7. Create gate decision
  8. Output review document + gate file
```

## Best Practices

1. **Follow Steps Exactly**: Tasks are carefully designed workflows
2. **Don't Skip Steps**: Each step builds on previous work
3. **Validate at Each Step**: Check output before proceeding
4. **Load Dependencies On-Demand**: Only load files when needed
5. **Keep Artifact Chain**: Store outputs for traceability
6. **Document Decisions**: Use provided sections for reasoning
7. **Reference Sources**: Always trace back to requirements

## Quality Expectations

### Completeness

- All template sections filled
- No unresolved placeholders ({{VAR}})
- All requirements addressed
- Ready for next phase

### Accuracy

- Requirements correctly interpreted
- Technical claims verified
- No hallucinated details
- Traceable to source documents

### Consistency

- Format matches templates
- Terminology consistent
- Cross-references correct
- Naming conventions followed

## See Also

- **[Agents README](../agents/README.md)** - Which agents run which tasks
- **[Templates README](../templates/README.md)** - Document structure templates
- **[Workflows README](../workflows/README.md)** - Task sequencing in workflows
- **[Checklists README](../checklists/README.md)** - Validation criteria
- **[BMAD Knowledge Base](../data/bmad-kb.md)** - Framework philosophy

## Task Execution Checklist

Before running a task:

- [ ] Read task purpose and prerequisites
- [ ] Load required files and templates
- [ ] Understand expected output
- [ ] Have necessary context available
- [ ] Plan adequate time for completion
- [ ] Prepare to validate results

After running a task:

- [ ] Verify all outputs generated
- [ ] Check validation criteria met
- [ ] Cross-reference related documents
- [ ] Store artifacts per configuration
- [ ] Update document index/links
- [ ] Mark task complete in tracking system

---

**Tasks are the executable workflows of BMAD-METHOD™**. They guide agent actions and ensure consistent, high-quality output across the development lifecycle.

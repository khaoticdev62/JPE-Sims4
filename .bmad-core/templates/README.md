# BMAD Document Templates

This directory contains **13 reusable YAML templates** that standardize the structure and content of key development artifacts. Templates ensure completeness, consistency, and quality across all projects.

## Template Categories

### Architecture Templates (4 files)

**Greenfield Architecture** - New system design

- `architecture-tmpl.yaml` - Core system architecture template
- `fullstack-architecture-tmpl.yaml` - Complete web application architecture
- `front-end-architecture-tmpl.yaml` - Frontend/UI layer architecture

**Brownfield Architecture** - Existing system documentation

- `brownfield-architecture-tmpl.yaml` - Documenting existing systems

### Product Templates (4 files)

**Requirements Documentation**

- `prd-tmpl.yaml` - Product Requirements Document (PRD)
- `brownfield-prd-tmpl.yaml` - BRD for changes to existing systems

**Planning Documents**

- `project-brief-tmpl.yaml` - High-level project overview
- `market-research-tmpl.yaml` - Market analysis and research findings

### Development Templates (3 files)

- `story-tmpl.yaml` - User story format with acceptance criteria
- `front-end-spec-tmpl.yaml` - Frontend component and UI specifications
- `qa-gate-tmpl.yaml` - Quality gate decision document

### Planning Template (1 file)

- `brainstorming-output-tmpl.yaml` - Brainstorming session results

## How Templates Work

### Template Purpose

Templates define:

1. **Required Sections**: What content must be included
2. **Structure**: How sections organize information
3. **Examples**: Sample content showing how to fill each section
4. **Validation Rules**: Criteria for completeness and quality
5. **Output Format**: YAML, Markdown, or hybrid structure

### Using Templates

```yaml
# Template Structure
section_name:
  type: content_type    # markdown, yaml, list, table
  description: What this section contains
  required: true        # Must be filled
  example: |
    Example of what complete content looks like
```

### Template Variables

Templates use placeholders for dynamic content:

```
{{ProjectName}}         - Project name
{{EpicNum}}            - Epic identifier
{{StoryNum}}           - Story identifier
{{RoleName}}           - Role/agent name
_TBD_                  - To be determined
_PENDING_              - Awaiting information
```

## Architecture Templates

### Core Architecture Template (`architecture-tmpl.yaml`)

**When to use**: Greenfield projects with new system design

**Sections**:
- **Project Context**: Project goals, constraints, timeline
- **System Overview**: 30,000-foot view of system
- **Architecture Layers**: Frontend, backend, data, infrastructure
- **Components**: Major system components and responsibilities
- **Data Model**: Entity relationships and schema
- **API Design**: REST/GraphQL endpoints and contracts
- **Integration Points**: External system connections
- **Technology Choices**: Stack justification
- **Non-Functional Requirements**: Performance, security, scalability, etc.
- **Deployment Architecture**: Environments and deployment strategy
- **Dependencies**: External libraries, services, tools
- **Risks & Mitigations**: Technical risks and how they're addressed

**Output**: Usually 15-30 pages when complete

### Fullstack Architecture Template (`fullstack-architecture-tmpl.yaml`)

**When to use**: Complete web applications (frontend + backend + database)

**Includes**:
- Everything from core template
- Frontend architecture patterns (SPA, components, state management)
- Backend architecture patterns (microservices, monolith, serverless)
- Database schema and relationships
- Frontend-backend integration patterns
- Complete technology stack justification

**Output**: Usually 25-40 pages when complete

### Frontend Architecture Template (`front-end-architecture-tmpl.yaml`)

**When to use**: UI/frontend-specific system design

**Sections**:
- **UI Architecture**: Component hierarchy and patterns
- **State Management**: How data flows through application
- **Styling Approach**: CSS strategy, design tokens, theme system
- **Build & Tooling**: Build process, bundling, optimization
- **Performance Optimization**: Code splitting, lazy loading, caching
- **Accessibility**: WCAG compliance, semantic HTML
- **Browser Support**: Target browsers and compatibility strategy
- **Responsive Design**: Breakpoints and mobile-first approach
- **User Interactions**: Navigation, forms, animations
- **Integration**: Connecting to backend APIs
- **Testing Strategy**: Testing pyramid and coverage
- **Error Handling**: User-facing error states

**Output**: Usually 10-20 pages when complete

### Brownfield Architecture Template (`brownfield-architecture-tmpl.yaml`)

**When to use**: Documenting existing systems for modification

**Sections**:
- **Current State**: As-is system documentation
- **Architecture Diagram**: Visual representation
- **Key Components**: Major system pieces
- **Data Model**: Current database schema
- **External Dependencies**: All external systems
- **Known Issues**: Technical debt and problems
- **Performance Characteristics**: How system currently performs
- **Scaling Limitations**: Current capacity constraints
- **Proposed Changes**: What we're changing and why
- **Migration Strategy**: How to transition from old to new
- **Rollback Plan**: How to revert if problems occur

**Output**: Usually 15-25 pages

## Product Templates

### Product Requirements Document (`prd-tmpl.yaml`)

**When to use**: Define what to build before architecture/development

**Sections**:
- **Problem Statement**: What problem we're solving
- **User Research**: Customer insights and pain points
- **Market Opportunity**: Market size, trends, competition
- **Vision & Goals**: What success looks like
- **Product Overview**: How our solution works
- **Core Features**: Must-have capabilities
- **User Personas**: Who we're building for
- **User Stories & Use Cases**: How users interact with product
- **Non-Functional Requirements**: Performance, security, scalability needs
- **Acceptance Criteria**: How to measure success
- **Success Metrics**: KPIs and business metrics
- **Roadmap**: Phased feature rollout
- **Risks & Dependencies**: Threats and blockers
- **Resource Requirements**: Team, budget, timeline

**Output**: Usually 20-30 pages when complete

### Brownfield PRD (`brownfield-prd-tmpl.yaml`)

**When to use**: Document requirements for changes to existing products

**Differs from PRD**:
- Focuses on changes, not entire product
- References existing features
- Emphasizes backward compatibility
- Includes migration considerations
- Documents deprecation strategy

**Output**: Usually 10-20 pages

### Project Brief (`project-brief-tmpl.yaml`)

**When to use**: Quick project overview during discovery phase

**Sections**:
- **Project Name & Goal**: What we're building
- **Problem**: What we're solving
- **Success Criteria**: How we measure success
- **Timeline**: High-level schedule
- **Resources**: Team and budget
- **Key Stakeholders**: Who cares about this
- **Assumptions**: What we believe to be true
- **Risks**: Major blockers or concerns
- **Next Steps**: What happens next

**Output**: Usually 5-10 pages

### Market Research (`market-research-tmpl.yaml`)

**When to use**: Analyze market, competition, and opportunities

**Sections**:
- **Market Overview**: Industry landscape and trends
- **Market Size**: TAM, SAM, SOM analysis
- **Customer Analysis**: Who are we targeting
- **Competitive Landscape**: Direct and indirect competitors
- **Competitive Analysis**: Competitor strengths/weaknesses
- **Market Opportunities**: Gaps and openings
- **Market Risks**: Threats and challenges
- **Trend Analysis**: Where market is heading
- **Recommendations**: Strategic recommendations based on research

**Output**: Usually 15-25 pages

## Development Templates

### User Story Template (`story-tmpl.yaml`)

**When to use**: Create individual development tasks

**Sections**:
- **Story Header**: Epic, number, title
- **User Story Statement**: "As [role] I want [feature] so that [benefit]"
- **Acceptance Criteria**: Specific testable conditions
- **Dev Notes**: Technical implementation guidance
- **Testing**: How to validate implementation
- **Tasks/Subtasks**: Specific development work
- **File Changes**: What files will be created/modified
- **Dev Agent Record**: What developer should know
- **QA Results**: Quality validation findings (QA writes)
- **Change Log**: Version history and modifications

**Output**: Usually 2-5 pages per story

### Frontend Spec Template (`front-end-spec-tmpl.yaml`)

**When to use**: Specify UI components and interactions

**Sections**:
- **Component Overview**: What this component does
- **Visual Design**: Design, colors, typography
- **States & Variants**: Normal, hover, active, disabled, loading, error
- **Interactions**: User actions and responses
- **Accessibility**: ARIA labels, keyboard navigation
- **Responsive Behavior**: Mobile, tablet, desktop views
- **Integration**: How component connects to backend
- **Performance**: Optimization considerations
- **Browser Support**: Supported browsers
- **Implementation Notes**: Special technical considerations

**Output**: Usually 5-10 pages per component

### QA Gate Template (`qa-gate-tmpl.yaml`)

**When to use**: Document quality gate decisions

**Sections**:
- **Story Reference**: Which story is being gated
- **Review Date**: When review was conducted
- **Reviewer**: Who conducted review
- **Summary**: Quick overview of findings
- **Requirements Coverage**: Do all requirements have tests?
- **Test Analysis**: Test quality and sufficiency
- **Risk Assessment**: Identified risks
- **Gate Decision**: PASS / CONCERNS / FAIL / WAIVED
- **Action Items**: What needs to be fixed
- **Sign-off**: Approval for moving forward

**Output**: Usually 3-5 pages per gate decision

### Brainstorming Output (`brainstorming-output-tmpl.yaml`)

**When to use**: Document brainstorming session results

**Sections**:
- **Session Info**: Date, participants, topic
- **Goal**: What we were brainstorming
- **Brainstorm Results**: All ideas generated
- **Initial Filtering**: Remove duplicates/non-viable
- **Categorization**: Organize by theme
- **Voting/Scoring**: Prioritize ideas
- **Top Ideas**: Most promising options
- **Action Items**: Follow-up tasks
- **Next Steps**: How we proceed

**Output**: Usually 5-10 pages

## Template Usage Workflow

### Step 1: Select Template

```
agent: "As Product Manager, create a PRD"
command: *create-doc prd-tmpl
```

### Step 2: Load Template

Agent loads `prd-tmpl.yaml` and understands:
- Required sections
- Examples for each section
- Validation rules
- Output expectations

### Step 3: Fill Content

For each section:
- Replace placeholder text with real content
- Ensure section requirements met
- Follow example structure
- Complete all subsections

### Step 4: Validate

Before finishing:
- [ ] All required sections completed
- [ ] No placeholder text remains
- [ ] Cross-references are accurate
- [ ] Format is consistent
- [ ] Meets validation criteria

### Step 5: Store & Link

- Save to configured location (per `core-config.yaml`)
- Update document index
- Cross-reference related documents
- Store in version control

## Template Best Practices

1. **Use Complete Examples**: Follow the example structure exactly
2. **Fill All Sections**: Don't skip "optional" sections
3. **Be Specific**: Vague content causes problems downstream
4. **Cross-Reference**: Link to related documents
5. **Validate Early**: Check completeness as you go
6. **Keep Consistent**: Use same terminology and style throughout
7. **Update Regularly**: Keep artifacts synchronized as you learn

## Template Validation

Each template defines validation:

### Structure Validation
- All required sections present
- Correct section hierarchy
- Proper formatting (YAML structure)
- No malformed content

### Content Validation
- Required fields completed
- No placeholder text remains
- All acceptance criteria specific and testable
- Cross-references are valid
- No contradictions between sections

### Quality Validation
- Content is clear and unambiguous
- Technical claims are verifiable
- Decisions are justified
- Completeness is adequate for next phase

## See Also

- **[Tasks README](../tasks/README.md)** - How to execute template creation
- **[Agents README](../agents/README.md)** - Which agents use which templates
- **[Workflows README](../workflows/README.md)** - Template creation in workflows
- **[Core Config](../core-config.yaml)** - Where templates are stored
- **[BMAD Knowledge Base](../data/bmad-kb.md)** - Documentation principles

## Template Statistics

| Category | Count | Total Pages |
|----------|-------|------------|
| Architecture | 4 | 60-100 |
| Product | 4 | 40-70 |
| Development | 3 | 20-35 |
| Planning | 1 | 5-10 |
| **Total** | **13** | **125-215** |

*(Page counts when fully completed with real project content)*

## Custom Templates

To create custom templates:

1. Copy existing template as starting point
2. Add/remove sections based on needs
3. Update required fields list
4. Define validation rules
5. Add examples
6. Register in agent dependencies
7. Document template purpose

## Configuration Integration

Templates respect `core-config.yaml`:

```yaml
prd:
  prdFile: docs/prd.md        # Where PRD is stored
  prdVersion: v4              # Version tracking
  prdSharded: true            # Split large PRD

architecture:
  architectureFile: docs/architecture.md
  architectureVersion: v4
  architectureSharded: true   # Split large docs

qa:
  qaLocation: docs/qa         # Where QA files go
```

---

**Templates ensure quality and consistency**. They guide agents to produce complete, validated artifacts that serve as reliable input for downstream phases.

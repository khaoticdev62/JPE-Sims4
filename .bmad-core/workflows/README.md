# BMAD Workflows

This directory contains **6 predefined project workflows** that orchestrate agent teams through complete development lifecycle. Each workflow defines the sequence of tasks, agent responsibilities, and handoff points for a specific project type.

## Workflow Types

### Greenfield Workflows (3 files)

For **new projects** from scratch:

- `greenfield-fullstack.yaml` - Complete web/service application
- `greenfield-service.yaml` - Backend/API service only
- `greenfield-ui.yaml` - Frontend/UI application only

### Brownfield Workflows (3 files)

For **existing codebase** modifications:

- `brownfield-fullstack.yaml` - Full-stack changes to existing system
- `brownfield-service.yaml` - Backend changes to existing system
- `brownfield-ui.yaml` - Frontend changes to existing system

## Choosing a Workflow

### Greenfield Decisions

**Use greenfield-fullstack when**:
- Building a new complete web application (frontend + backend)
- New e-commerce site, SaaS product, mobile app backend
- Complete system from scratch needed

**Use greenfield-service when**:
- Building only a backend service or API
- Creating a microservice
- No frontend component yet

**Use greenfield-ui when**:
- Building frontend for existing backend
- Creating standalone UI without backend
- Frontend specialist project

### Brownfield Decisions

**Use brownfield-fullstack when**:
- Adding major features to existing web application
- Complete redesign of app (front + back)
- Significant changes across layers

**Use brownfield-service when**:
- Adding APIs to existing system
- Backend refactoring
- Adding new backend functionality

**Use brownfield-ui when**:
- Redesigning user interface
- Frontend modernization (e.g., React migration)
- Adding new UI features to existing app

## Workflow Structure

Each workflow file contains:

```yaml
workflow:
  name: Descriptive name
  icon: 🚀
  description: Purpose of workflow

sequence:
  phase_1:
    agent: [agent_id]
    task: task_name
    input: What's needed before this phase
    output: What gets created
    handoff: How artifact passes to next phase

flow_diagram:
  # ASCII diagram showing agent sequence

decision_guidance:
  - When to escalate to architect
  - When to proceed to development
  - Exit criteria for each phase
```

## Typical Workflow Sequence

### Phase 1: Discovery & Planning

**Lead Agent**: Business Analyst (analyst) or Product Manager (pm)

**Activities**:
- Document requirements and goals
- Research market and competitors
- Create project brief
- Identify constraints and risks
- Plan approach

**Output**: Project Brief, Market Research (if applicable)

### Phase 2: Product Strategy

**Lead Agent**: Product Manager (pm)

**Activities**:
- Define product vision
- Create PRD (Product Requirements Document)
- Plan feature roadmap
- Define success metrics
- Get stakeholder alignment

**Output**: PRD, Roadmap, Acceptance Criteria

### Phase 3: System Architecture

**Lead Agent**: Architect (architect)

**Activities**:
- Design system architecture
- Select technology stack
- Plan data model
- Design APIs and integrations
- Plan infrastructure
- Document non-functional requirements

**Output**: Architecture Document, Technology Decisions, Infrastructure Plan

### Phase 4: Story Preparation

**Lead Agent**: Scrum Master (sm) / Product Owner (po)

**Activities**:
- Break PRD into stories
- Create acceptance criteria
- Define implementation tasks
- Prioritize work
- Prepare for development

**Output**: User Stories, Dev Tasks, Backlog

### Phase 5: Design & Specification

**Lead Agent**: UX Expert (ux-expert) or Frontend Architect

**Activities**:
- Create UI/UX designs
- Write component specifications
- Define interactions
- Plan frontend architecture
- Create design system

**Output**: Wireframes, Specifications, Design System

### Phase 6: Development

**Lead Agent**: Developer (dev)

**Activities**:
- Implement features per stories
- Write unit tests
- Code review
- Performance optimization
- Debug issues

**Output**: Working Code, Test Suite, Implementation

### Phase 7: Quality Assurance

**Lead Agent**: QA (qa)

**Activities**:
- Design test strategy
- Create test cases
- Execute comprehensive tests
- Risk assessment
- Quality gate decision

**Output**: Test Design, Test Results, Gate Decision

### Phase 8: Deployment

**Lead Agent**: DevOps/Infrastructure (infra-devops-platform)

**Activities**:
- Prepare infrastructure
- Set up CI/CD pipeline
- Plan deployment
- Execute deployment
- Monitor and support

**Output**: Deployed System, Monitoring Setup

## Workflow Handoff Points

Handoffs occur when:

1. **Artifact is Complete**: Previous phase produces required output
2. **Validation Passes**: Quality gates are met
3. **Agreement**: Both agents confirm readiness
4. **Storage**: Artifact is saved and linked

### Example Handoff

```
Analyst creates: Project Brief
├─ Contains: Problem, goals, timeline, stakeholders
├─ Validated via: checklist completion
└─ Passed to: Product Manager

Product Manager receives: Project Brief
├─ Reads: Goals and constraints
├─ Creates: Product Requirements Document
└─ Hands off to: Architect
```

## Workflow Variations

### Expedited Workflow

Skip discovery phase if requirements are clear:

1. Start with clear PRD
2. Go directly to architecture
3. Proceed with story preparation
4. Continue to development

### Iterative Workflow

Run mini-cycles for small features:

1. Product Owner: Define small set of stories
2. Developer: Implement quickly
3. QA: Rapid testing
4. Deploy: Get feedback
5. Repeat with next feature

### Parallel Development

Different agents work simultaneously:

- UX designing while architecture is finalized
- Infrastructure setup while frontend development starts
- QA designing tests while dev writes code

## Making Decisions in Workflows

### Escalation Decision

Escalate to architecture when:
- Technical decision is unclear
- Multiple technology options equally viable
- Risk assessment suggests need for deeper analysis
- Non-functional requirements are complex
- System complexity is high

### Go/No-Go Decision Points

**Before Development**:
- [ ] Architecture is complete
- [ ] Stories have acceptance criteria
- [ ] Team is aligned
- [ ] Resources are allocated

**Before QA**:
- [ ] Code is complete
- [ ] Unit tests pass
- [ ] Code review approved
- [ ] Performance targets met

**Before Deployment**:
- [ ] QA gate passes
- [ ] Security review approved
- [ ] Infrastructure is ready
- [ ] Deployment plan is finalized

## Brownfield-Specific Considerations

### Impact Analysis Phase

Brownfield workflows include impact analysis:

- What existing functionality will be affected?
- What data needs to migrate?
- How do we handle backward compatibility?
- What's the rollback plan?

### Incremental Deployment

Brownfield typically uses phased deployment:

1. Deploy to staging
2. Run comprehensive regression tests
3. Deploy to production in phases
4. Monitor for issues
5. Be ready to rollback

### Documentation Update

Update existing documentation:

- Architecture changes
- API changes
- Database schema changes
- Process changes

## Workflow Configuration

Workflows respect project configuration:

```yaml
# From core-config.yaml
prd:
  prdLocation: docs/prd.md        # Where PRD lives

architecture:
  architectureLocation: docs/architecture.md

qa:
  qaLocation: docs/qa             # Where QA artifacts go
```

## Using Workflows

### Activate Workflow

```
"As architect, let's follow greenfield-fullstack workflow for the new product"
"We'll use brownfield-service workflow to add the new API"
```

### Execute Phases

```
Phase 1: *create-doc project-brief
Phase 2: *create-doc prd-tmpl
Phase 3: *create-doc architecture-tmpl
Phase 4: *draft (create story)
Phase 5: *create-doc front-end-spec-tmpl
Phase 6: implement per story
Phase 7: *review {story}
Phase 8: deploy
```

### Track Progress

Each phase produces artifacts:
- ✅ Project Brief (Analyst)
- ✅ PRD (Product Manager)
- ✅ Architecture (Architect)
- ✅ Stories (Scrum Master)
- ✅ Designs (UX Expert)
- ✅ Code (Developer)
- ✅ Test Results (QA)
- ✅ Deployment (DevOps)

## Workflow Diagrams

Each workflow file includes an ASCII diagram showing:

```
Analyst    PM         Architect    Dev        QA
  |        |            |          |          |
  +------->+            |          |          |
           +----------->+          |          |
                        +--------->+          |
                                   +--------->+
                                            |
                                        [DONE]
```

## Agent Team for Each Workflow

### Greenfield Workflows

Requires:
- bmad-orchestrator (coordination)
- analyst (discovery)
- pm (product management)
- architect (system design)
- ux-expert (UI/UX design)
- po (backlog management)
- dev (implementation)
- qa (quality assurance)
- infra-devops-platform (infrastructure)

**Use Team**: team-fullstack (includes all except analyst)

### Brownfield Workflows

Requires:
- bmad-orchestrator
- architect (assesses impact)
- po (manages changes)
- dev (implements changes)
- qa (validates changes)
- infra-devops-platform (deployment)

**Use Team**: team-fullstack or team-no-ui

## Customizing Workflows

To create custom workflows:

1. Copy existing similar workflow
2. Modify sequence if needed
3. Update agent assignments
4. Change task sequence
5. Document decision points
6. Add to workflow list
7. Register with teams

## Workflow Best Practices

1. **Follow Sequence**: Execute phases in order
2. **Complete Each Phase**: Don't skip steps
3. **Validate at Gates**: Check before moving forward
4. **Document Decisions**: Record why you made choices
5. **Cross-Reference**: Link artifacts between phases
6. **Communicate Handoffs**: Ensure agent transition clarity
7. **Track Progress**: Know what phase you're in

## Common Workflow Issues

### Issue: Skipping Architecture

**Problem**: Want to start coding immediately

**Solution**: Architecture prevents costly refactoring later

### Issue: Incomplete Stories

**Problem**: Dev can't implement unclear stories

**Solution**: QA review of stories before dev starts

### Issue: Late QA Discovery

**Problem**: Testing finds problems in final phase

**Solution**: Test design during architecture phase

### Issue: Deployment Surprises

**Problem**: Infrastructure issues found during deployment

**Solution**: Infrastructure planning in architecture phase

## See Also

- **[Agents README](../agents/README.md)** - Who executes workflows
- **[Tasks README](../tasks/README.md)** - Individual workflow steps
- **[Templates README](../templates/README.md)** - Artifacts produced
- **[BMAD Knowledge Base](../data/bmad-kb.md)** - Workflow philosophy

## Workflow Statistics

| Workflow | Phases | Typical Duration | Lead Agents |
|----------|--------|------------------|------------|
| greenfield-fullstack | 8 | 6-12 weeks | PM → Arch → Dev |
| greenfield-service | 6 | 4-8 weeks | PM → Arch → Dev |
| greenfield-ui | 5 | 4-6 weeks | UX → Dev |
| brownfield-fullstack | 6 | 3-8 weeks | Arch → Dev |
| brownfield-service | 5 | 2-6 weeks | Arch → Dev |
| brownfield-ui | 4 | 2-4 weeks | UX → Dev |

*(Timelines are typical ranges based on project scope)*

---

**Workflows orchestrate the complete development lifecycle**. They ensure nothing falls through the cracks and all agents work together effectively toward project success.

# BMAD-METHOD™ Core Framework

This directory contains the core BMAD-METHOD™ (Business Motivated Agile Development) framework - a comprehensive system for AI-assisted software development using role-based agent coordination.

## Directory Structure

### `/agents`
**10 specialized AI agent definitions** representing different development roles:

- `ux-expert.md` - UX/UI Designer (Sally 🎨)
- `pm.md` - Product Manager
- `architect.md` - System Architect
- `po.md` - Product Owner (Sarah 📝)
- `sm.md` - Scrum Master (Bob 🏃)
- `dev.md` - Full Stack Developer
- `qa.md` - Quality Architect (Quinn 🧪)
- `analyst.md` - Business Analyst (Mary 📊)
- `bmad-orchestrator.md` - Workflow Coordinator
- `bmad-master.md` - Master Task Executor

**Each agent includes**:
- Persona definition (name, role, style, core principles)
- Activation instructions
- Available commands with exact syntax
- Dependencies (tasks, templates, checklists, data)
- Customization options

**To activate an agent**: Mention them naturally - "As architect, design..." or "Use UX Expert to..."

### `/tasks`
**21 executable task workflows** for common development activities:

- **Story & Epic**: `create-next-story.md`, `brownfield-create-epic.md`
- **Planning**: `advanced-elicitation.md`, `facilitate-brainstorming-session.md`
- **Architecture**: `create-doc.md` (with architecture templates)
- **Development**: `create-doc.md` (with frontend/story templates)
- **Quality Assurance**: `test-design.md`, `trace-requirements.md`, `qa-gate.md`, `review-story.md`
- **Risk Management**: `risk-profile.md`, `nfr-assess.md`
- **Documentation**: `shard-doc.md`, `document-project.md`, `index-docs.md`
- **Process**: `execute-checklist.md`, `correct-course.md`

**Each task includes**:
- Clear purpose statement
- Step-by-step execution instructions
- Input/output specifications
- Validation criteria
- Anti-hallucination verification steps

### `/templates`
**13 reusable document templates** for standardized artifacts:

**Architecture Templates**:
- `architecture-tmpl.yaml` - Greenfield system design
- `fullstack-architecture-tmpl.yaml` - Complete fullstack architecture
- `brownfield-architecture-tmpl.yaml` - Existing system documentation
- `front-end-architecture-tmpl.yaml` - Frontend architecture

**Product Templates**:
- `prd-tmpl.yaml` - Product Requirements Document
- `brownfield-prd-tmpl.yaml` - BRD for existing systems
- `project-brief-tmpl.yaml` - Project overview
- `market-research-tmpl.yaml` - Market analysis

**Development Templates**:
- `story-tmpl.yaml` - User story format
- `front-end-spec-tmpl.yaml` - Frontend specifications
- `qa-gate-tmpl.yaml` - Quality gate decision template

**Planning Templates**:
- `brainstorming-output-tmpl.yaml` - Brainstorm results capture

**Each template**:
- Defines required sections
- Provides placeholder examples
- Includes validation rules
- Specifies output formats

### `/workflows`
**6 predefined project workflows** for end-to-end development:

**Greenfield Projects** (new development):
- `greenfield-fullstack.yaml` - Complete web/service application
- `greenfield-service.yaml` - Backend/API service
- `greenfield-ui.yaml` - Frontend application

**Brownfield Projects** (existing codebase changes):
- `brownfield-fullstack.yaml` - Full-stack modifications
- `brownfield-service.yaml` - Backend service updates
- `brownfield-ui.yaml` - Frontend updates

**Each workflow**:
- Defines sequence of development phases
- Maps agents to responsibilities
- Specifies handoff points
- Includes decision trees
- Provides flow diagrams

### `/checklists`
**6 quality assurance checklists** for validation gates:

- `story-draft-checklist.md` - User story quality validation
- `story-dod-checklist.md` - Definition of Done verification
- `architect-checklist.md` - Architecture review criteria
- `pm-checklist.md` - Project management validation
- `po-master-checklist.md` - Product Owner comprehensive review
- `change-checklist.md` - Change control validation

**Each checklist**:
- Lists specific validation criteria
- Includes assessment questions
- Provides pass/fail/concern decision points
- Enables LLM-driven automation

### `/data`
**Knowledge base and reference data**:

- `bmad-kb.md` (32 KB) - Complete BMAD-METHOD™ knowledge base
  - Core principles and philosophy
  - Agent roles and responsibilities
  - Workflow patterns and conventions
  - Best practices and anti-patterns
  - Expansion pack information

- `technical-preferences.md` - Technology stack preferences
- `elicitation-methods.md` - Requirements gathering techniques
- `brainstorming-techniques.md` - Ideation methodologies
- `test-levels-framework.md` - Testing strategy framework
- `test-priorities-matrix.md` - Test prioritization logic

### `/agent-teams`
**Pre-configured agent team compositions**:

- `team-all.yaml` - All agents (includes wildcard for expansion pack agents)
- `team-fullstack.yaml` - Full-stack development team
- `team-no-ui.yaml` - Backend/service-only team
- `team-ide-minimal.yaml` - IDE minimal workflow team

**Teams define**:
- Agents included
- Available workflows
- Communication patterns
- Responsibilities matrix

### `/utils`
**Utility files and helpers**:

- `bmad-doc-template.md` - Documentation template
- `workflow-management.md` - Workflow execution guidance

### Configuration Files

**`core-config.yaml`** - Framework-wide configuration:
```yaml
markdownExploder: true              # Split large documents
qa:
  qaLocation: docs/qa               # QA document location
prd:
  prdFile: docs/prd.md              # PRD location
  prdVersion: v4
  prdSharded: true                  # Split PRD into sections
architecture:
  architectureFile: docs/architecture.md
  architectureVersion: v4
  architectureSharded: true         # Split architecture
```

**`install-manifest.yaml`** - Installation tracking:
- Version information (v4.44.3)
- Installed IDEs (gemini, qwen-code)
- Expansion packs (bmad-infrastructure-devops)
- File hash tracking

## Documentation Files

- **`user-guide.md`** - Getting started guide for new users
- **`working-in-the-brownfield.md`** - Working with existing codebases
- **`enhanced-ide-development-workflow.md`** - IDE integration patterns
- **`bmad-doc-template.md`** - Template for documentation

## Key Concepts

### Agent Activation

Agents are activated by:
1. Mentioning them naturally: "As [agent], ..."
2. Using reference: "Use [agent title] to..."
3. Running specific commands: "*[command]"

### Task Execution

Tasks are executable workflows:
1. Load task file and follow instructions exactly
2. Load dependencies (templates, checklists, data) on demand
3. Execute in sequence (don't skip steps)
4. Produce specified outputs
5. Validate against criteria

### Template Usage

Templates standardize artifacts:
1. Load template YAML
2. Fill placeholders ({{VAR}})
3. Validate against required sections
4. Generate document
5. Store in configured location

### Workflow Execution

Workflows orchestrate agent teams:
1. Start with initial agent
2. Execute sequence of tasks
3. Pass artifacts between agents
4. Make decisions at gates
5. Handoff to next agent

## Customization

### Modifying Agents

- Edit agent files in `/agents/`
- Update agent title, persona, or commands
- Add new dependencies (tasks, templates)
- Run validation: `bmad-method validate`

### Creating Custom Tasks

1. Create new `.md` file in `/tasks/`
2. Follow task template structure
3. Reference in agent dependencies
4. Test with relevant agents

### Adding New Templates

1. Create template in `/templates/`
2. Define required sections
3. Include placeholder examples
4. Add to relevant agent commands
5. Update `team-*.yaml` if needed

### Creating Agent Teams

1. Create new `.yaml` file in `/agent-teams/`
2. List agents and their roles
3. Specify available workflows
4. Document team composition
5. Register in IDE configurations

## Best Practices

### For Agent Development
- Keep agent definitions focused and lean
- Document customization clearly
- Test activation and commands
- Maintain consistent formatting

### For Task Creation
- Break complex workflows into clear steps
- Include validation at each step
- Provide specific output formats
- Enable LLM automation with clear criteria

### For Template Design
- Define all required sections
- Provide complete examples
- Include validation rules
- Keep structure consistent

### For Workflow Design
- Define clear handoff points
- Map agents to responsibilities
- Include decision trees
- Document assumptions

## Integration Points

### IDE Integration
- `.claude/settings.local.json` - Claude Code settings
- `.gemini/commands/BMad/` - Gemini configuration
- `.qwen/commands/BMad/` - Qwen configuration

### Expansion Packs
- Located in `.bmad-*` directories
- Include agents, tasks, templates, checklists
- Reference via `@{.bmad-pack-name/type/file}`

### Project Integration
- Reference agents in natural language
- Use workflow commands
- Store artifacts per configuration
- Track changes in version control

## Version Information

- **Framework Version**: 4.44.3
- **Latest Update**: December 21, 2025
- **Installed Expansion Packs**: bmad-infrastructure-devops (v1.12.0)

## Next Steps

1. **Read Agent Definitions**: Choose an agent and read their full definition
2. **Explore Tasks**: Pick a task and understand its execution steps
3. **Review Templates**: See template structure and placeholder patterns
4. **Study Workflows**: Understand agent sequencing and handoffs
5. **Start a Project**: Activate an agent and begin development

## Support

- **Knowledge Base**: `data/bmad-kb.md` - Complete BMAD philosophy and patterns
- **User Guide**: `user-guide.md` - Getting started
- **Agent Capabilities**: `agents/` - Read any agent file for full definition
- **Task Workflows**: `tasks/` - Step-by-step execution guides

---

**Powered by BMAD-METHOD™** - Business Motivated Agile Development

# BMAD Agents

This directory contains **10 specialized AI agent definitions** that represent different roles in the development lifecycle. Each agent has a distinct persona, expertise, and set of commands.

## Quick Reference

| File | Agent | Role | Icon |
|------|-------|------|------|
| `ux-expert.md` | Sally | UX/UI Designer | 🎨 |
| `pm.md` | Product Manager | Product Strategy | 📊 |
| `architect.md` | Architect | System Design | 🏗️ |
| `po.md` | Sarah | Product Owner | 📝 |
| `sm.md` | Bob | Scrum Master | 🏃 |
| `dev.md` | Full Stack Developer | Implementation | 💻 |
| `qa.md` | Quinn | Quality Architect | 🧪 |
| `analyst.md` | Mary | Business Analyst | 📊 |
| `bmad-orchestrator.md` | Orchestrator | Workflow Coordinator | 🎯 |
| `bmad-master.md` | Master Executor | Multi-Domain Expert | 🔧 |

## How to Use Agents

### Activation

Mention agents naturally in your prompts:

```
"As architect, design the system architecture for..."
"Use UX Expert to create wireframes for..."
"Have the developer implement the authentication..."
```

### Commands

Each agent has commands prefixed with `*`:

```
*help              # Show available commands
*draft             # Create a story (Scrum Master)
*review {story}    # Review a story (QA)
*create-doc        # Create a document
*exit              # Exit agent mode
```

### Dependencies

Agents load files on demand when tasks are executed:

- **Templates** - Document templates for output generation
- **Tasks** - Workflow files that guide execution
- **Checklists** - Validation criteria for quality gates
- **Data** - Reference information and guidelines

## Agent Categories

### Planning & Product

**Product Manager (`pm.md`)**: Strategy and high-level planning
- Create PRDs (Product Requirements Documents)
- Define product strategy and roadmap
- Prioritize features
- Stakeholder communication

**Product Owner (`po.md`)**: Tactical product management
- Backlog management and prioritization
- Story refinement and acceptance criteria
- Sprint planning and milestone definition
- Dependency management

**Business Analyst (`analyst.md`)**: Discovery and analysis
- Market research and competitive analysis
- Brainstorming and ideation
- Project briefs and discovery documentation
- Existing system documentation (brownfield)

### Design & Experience

**UX Expert (`ux-expert.md`)**: User experience and interface design
- Wireframes and prototypes
- Frontend specifications
- User journey mapping
- Design system documentation
- AI-powered UI generation (v0, Lovable)

### Development

**Architect (`architect.md`)**: System architecture and technology selection
- System design and architecture documentation
- Technology stack selection
- API design and microservices architecture
- Infrastructure planning
- Non-functional requirements analysis

**Full Stack Developer (`dev.md`)**: Implementation and coding
- Code implementation across all layers
- Debugging and troubleshooting
- Refactoring and optimization
- Development best practices
- Language and framework selection

### Quality & Process

**Quality Architect (`qa.md`)**: Quality assurance and testing
- Test architecture and strategy
- Quality gate decisions (PASS/CONCERNS/FAIL/WAIVED)
- Requirements traceability
- Risk assessment and mitigation
- Non-functional requirements validation

**Scrum Master (`sm.md`)**: Agile process and team coordination
- User story creation and preparation
- Epic management and breakdown
- Retrospectives and process improvement
- Ceremony facilitation
- Team velocity tracking

### Coordination

**BMad Master Orchestrator (`bmad-orchestrator.md`)**: Multi-agent coordination
- Workflow orchestration
- Multi-agent task coordination
- Agent role switching guidance
- When-to-escalate decisions
- Cross-functional collaboration

**BMad Master Executor (`bmad-master.md`)**: Universal expert
- Comprehensive expertise across all domains
- One-off tasks requiring broad knowledge
- Running many sequential tasks
- Acting as a single agent across domains

## Agent Structure

Each agent file contains:

```yaml
# Activation Instructions
- How to activate (mention or refer naturally)
- What to do on activation (greet and run *help)
- How to load dependencies

# Agent Definition
- name: The agent's name/persona
- id: Identifier used in commands
- title: Full formal title
- icon: Emoji representation
- customization: Specialized expertise

# Persona
- role: Primary responsibility area
- style: Communication and work style
- identity: Background and expertise level
- focus: Main areas of emphasis
- core_principles: Guiding values

# Commands
- *help: List available commands
- *[command]: Specific agent commands

# Dependencies
- tasks: Task workflows the agent can execute
- templates: Document templates available
- checklists: Quality validation checklists
- data: Reference information
```

## Agent Interactions

### Typical Workflow

1. **Analyst** (`analyst.md`) - Discover and plan
   - Create project brief
   - Conduct market research
   - Document brownfield system

2. **Product Manager** (`pm.md`) - Define strategy
   - Create PRD based on discovery
   - Define product strategy
   - Plan roadmap

3. **Architect** (`architect.md`) - Design system
   - Create architecture from PRD
   - Select technologies
   - Plan implementation phases

4. **Scrum Master** (`sm.md`) - Prepare work
   - Break down stories from architecture
   - Create detailed story specifications
   - Define acceptance criteria

5. **Developer** (`dev.md`) - Implement
   - Code implementation based on stories
   - Unit testing
   - Debug and optimize

6. **QA** (`qa.md`) - Validate quality
   - Test design and test case creation
   - Run comprehensive reviews
   - Quality gate decisions

### Agent Collaboration Points

- **Analyst ↔ Product Manager**: Discovery informs strategy
- **Product Manager ↔ Architect**: Strategy guides system design
- **Architect ↔ Scrum Master**: Architecture breaks into stories
- **Scrum Master ↔ Developer**: Stories guide implementation
- **Developer ↔ QA**: Implementation gets validated
- **QA ↔ Product Manager**: Acceptance criteria alignment

## When to Use Each Agent

| Task | Agent | Command |
|------|-------|---------|
| Understand existing system | Analyst | `*brainstorm` or `*create-doc` |
| Define what to build | Product Manager | `*create-doc` with prd-tmpl |
| Design how to build it | Architect | `*create-doc` with architecture |
| Prepare development work | Scrum Master | `*draft` or `*create-next-story` |
| Build the feature | Developer | `*create-doc` or direct coding |
| Validate quality | QA | `*review` or `*test-design` |
| Coordinate multiple agents | Orchestrator | `*help` and direct coordination |
| Single expert for broad task | Master | `*help` for all capabilities |

## Customization

Agents can be customized through the `customization` field:

- **Specialized expertise**: "Expert in Kubernetes and cloud-native architectures"
- **Technology preferences**: "Deep experience with React, Next.js, and TypeScript"
- **Domain focus**: "Gaming industry specialist"
- **Constraint awareness**: "Works within GDPR/compliance requirements"

## Command Syntax

All agent commands use `*` prefix:

```
*help                          # Show available commands
*command-name                  # Run simple command
*command-name {argument}       # Command with argument
*command-name {arg1} {arg2}    # Multiple arguments
```

## Tips for Working with Agents

1. **Activate One at a Time**: Clarity improves quality
2. **Use Natural Language**: "As developer" vs "activate dev-agent"
3. **Reference Files Directly**: Agents load dependencies on demand
4. **Follow Task Instructions**: Agents execute workflows exactly as written
5. **Validate Outputs**: Use checklists to validate agent work
6. **Maintain Context**: Keep related documents available for reference
7. **Cross-Reference Artifacts**: Link stories to PRDs, PRDs to architecture

## Architecture Review

All agents follow the same core structure, ensuring:

- **Consistency**: Uniform activation, commands, and behavior
- **Autonomy**: Each agent has clear scope and responsibilities
- **Integration**: Agents work together through artifact handoffs
- **Quality**: Built-in validation through checklists and gates

## Next Steps

1. **Read an Agent Definition**: Pick any agent and read their full file
2. **Understand Their Commands**: See what each agent can do
3. **Explore Their Dependencies**: Understand what resources they use
4. **Use in Your Project**: Activate an agent and start working

## See Also

- **[BMAD-METHOD Knowledge Base](../data/bmad-kb.md)** - Framework philosophy
- **[Tasks](../tasks/README.md)** - Executable workflows agents use
- **[Workflows](../workflows/README.md)** - Agent sequences and coordination
- **[Checklists](../checklists/README.md)** - Quality validation criteria
- **[Parent README](../README.md)** - Framework overview

---

**Agent-Based Development**: Each agent has specialized expertise. Choose the right agent for your task, follow their guidance, and rely on their knowledge domain.

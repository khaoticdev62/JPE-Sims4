# JPE Mod Translator 2.0

## Overview

**JPE Mod Translator 2.0** is an AI-powered development orchestration platform built on the **BMAD-METHOD™** (Business Motivated Agile Development) framework. It enables teams to leverage specialized AI agents working together to manage complex software development projects, from initial planning through implementation and quality assurance.

### Core Features

- **Role-Based AI Agents**: 10 core agents representing different development roles (architect, developer, product manager, QA, etc.)
- **Workflow Orchestration**: Predefined workflows for greenfield and brownfield projects
- **Multi-IDE Integration**: Works with Claude Code, Google Gemini, and Alibaba Qwen IDEs
- **Template-Driven Development**: Comprehensive templates for PRDs, architecture, stories, and more
- **Quality Gates**: Built-in checklists and validation workflows for quality assurance
- **Expansion Packs**: Modular extensions for specialized domains (DevOps, game development, etc.)

## Getting Started

### Project Structure

```
JPE_Mod_Translator_2.0/
├── .bmad-core/                      # Core BMAD framework
│   ├── agents/                      # AI agent definitions
│   ├── tasks/                       # Executable task workflows
│   ├── templates/                   # Document and artifact templates
│   ├── workflows/                   # Project workflow definitions
│   ├── checklists/                  # Quality assurance checklists
│   ├── data/                        # Knowledge base and reference data
│   ├── agent-teams/                 # Pre-configured agent teams
│   └── core-config.yaml             # Framework configuration
├── .bmad-infrastructure-devops/     # DevOps & Infrastructure expansion pack
├── .claude/                         # Claude Code IDE integration
├── .gemini/                         # Google Gemini IDE integration
├── .qwen/                           # Alibaba Qwen IDE integration
├── conductor/                       # Application conductor/setup
├── web-bundles/                     # Web-deployable agent bundles
├── AGENTS.md                        # Auto-generated agent registry
└── [PDFs]                           # Comprehensive PRDs and specifications
```

### Quick Start

1. **Choose Your IDE Integration**:
   - Claude Code: Uses `.claude/` configuration
   - Google Gemini: Uses `.gemini/` configuration
   - Alibaba Qwen: Uses `.qwen/` configuration

2. **Select Your Team**:
   - `team-all.yaml`: All agents
   - `team-fullstack.yaml`: Full-stack development (UI + backend + infrastructure)
   - `team-no-ui.yaml`: Backend and service development
   - `team-ide-minimal.yaml`: Minimal cycle for IDE workflow

3. **Start a Project**:
   - Reference an agent naturally: "As architect, design the system"
   - Run a workflow: Select greenfield or brownfield workflow
   - Execute tasks: Use agent commands to run specific workflows

### Available Agents

| Agent | Role | When To Use |
|-------|------|-------------|
| **ux-expert** | UX/UI Designer | Wireframes, prototypes, frontend specs, user experience |
| **pm** | Product Manager | PRDs, product strategy, roadmap planning |
| **architect** | System Architect | System design, architecture docs, tech selection |
| **analyst** | Business Analyst | Market research, competitive analysis, discovery |
| **dev** | Full Stack Developer | Code implementation, debugging, best practices |
| **sm** | Scrum Master | Story creation, epic management, process guidance |
| **qa** | Quality Architect | Test design, quality gates, risk assessment |
| **po** | Product Owner | Backlog management, story refinement, prioritization |
| **bmad-orchestrator** | Workflow Coordinator | Multi-agent coordination, role switching guidance |
| **infra-devops-platform** | DevOps Engineer | Infrastructure design, CI/CD, cloud architecture |

## Key Concepts

### Workflows

BMAD provides 6 predefined workflows:

- **Greenfield Projects**: New project development
  - `greenfield-fullstack.yaml` - Complete web/service application
  - `greenfield-service.yaml` - Backend service only
  - `greenfield-ui.yaml` - Frontend only

- **Brownfield Projects**: Existing codebase modifications
  - `brownfield-fullstack.yaml` - Changes across full stack
  - `brownfield-service.yaml` - Backend changes
  - `brownfield-ui.yaml` - Frontend changes

### Templates

Document templates for standardized artifacts:

- **Architecture**: `architecture-tmpl.yaml`, `fullstack-architecture-tmpl.yaml`
- **Product**: `prd-tmpl.yaml`, `project-brief-tmpl.yaml`
- **Development**: `story-tmpl.yaml`
- **Frontend**: `front-end-spec-tmpl.yaml`
- **Quality**: `qa-gate-tmpl.yaml`

### Configuration

Key configuration file: `.bmad-core/core-config.yaml`

Controls:
- Document sharding (splitting large documents)
- PRD and architecture file locations
- QA document locations
- Markdown explosion settings

## Documentation

- **[User Guide](./.bmad-core/user-guide.md)** - Getting started guide
- **[Brownfield Guide](./.bmad-core/working-in-the-brownfield.md)** - Working with existing codebases
- **[BMAD Knowledge Base](./.bmad-core/data/bmad-kb.md)** - Framework principles and patterns
- **[AGENTS.md](./AGENTS.md)** - Complete agent registry with full definitions

## Development

### Running Tasks

Tasks are executable workflows that generate artifacts:

```
*create-doc {template}        # Create document from template
*draft                        # Draft next user story
*review-story {story}         # Comprehensive QA review
*validate-infrastructure      # Review infrastructure design
*execute-checklist {checklist} # Run QA checklist
```

### Quality Gates

All stories pass through quality gates:

1. **Story Validation** - Structure and completeness
2. **Requirements Traceability** - Coverage assessment
3. **Risk Assessment** - Potential issues identification
4. **Test Design** - Test strategy creation
5. **QA Gate** - Final quality approval

### Configuration Files

- `.claude/settings.local.json` - Claude Code IDE settings
- `.gemini/commands/BMad/` - Gemini IDE configuration
- `.qwen/commands/BMad/` - Qwen IDE configuration

## Expansion Packs

### Infrastructure & DevOps

Includes DevOps engineering specialist agent with:

- `infra-devops-platform` agent for infrastructure work
- Infrastructure architecture templates
- Infrastructure validation and review tasks
- Infrastructure checklists

Install status: **Installed (v1.12.0)**

## Using with Your Project

1. **Initialize your project**:
   ```bash
   git init
   git add .
   git commit -m "Initial BMAD-METHOD framework setup"
   ```

2. **Start the workflow**:
   - Activate your chosen agent
   - Run `*help` to see available commands
   - Execute workflows or tasks

3. **Commit regularly**:
   - Use conventional commits (feat:, fix:, docs:, refactor:)
   - Keep artifacts in version control
   - Cross-reference related documents

## Best Practices

1. **Use Agents Intentionally**: Each agent has specific expertise - use the right agent for the task
2. **Follow Templates**: Templates ensure completeness and consistency
3. **Run Quality Gates**: Always validate stories and designs before implementation
4. **Document Decisions**: Use checklists and artifacts to document reasoning
5. **Cross-Reference**: Link related documents (stories to tasks, architecture to PRDs)
6. **Keep Configuration Updated**: Update `core-config.yaml` as project evolves

## IDE Integration

The project is configured for multiple IDEs:

- **Claude Code** (.claude/): Full agent integration with all commands
- **Google Gemini** (.gemini/): TOML-based command configuration
- **Alibaba Qwen** (.qwen/): TOML-based command configuration

To use with an IDE:
1. Open this repository
2. Reference agents naturally in prompts
3. Run commands with `*` prefix (e.g., `*draft`, `*help`)

## Next Steps

1. **Read the User Guide**: [.bmad-core/user-guide.md](./.bmad-core/user-guide.md)
2. **Explore AGENTS.md**: [AGENTS.md](./AGENTS.md) - Full agent definitions and capabilities
3. **Check out Examples**: See `.bmad-core/examples/` for sample projects
4. **Review Core Configuration**: [.bmad-core/core-config.yaml](./.bmad-core/core-config.yaml)

## Support & Resources

- **Framework Documentation**: `.bmad-core/` directory
- **Agent Definitions**: `.bmad-core/agents/` - Read any agent file for full persona and commands
- **Task Workflows**: `.bmad-core/tasks/` - Detailed task execution instructions
- **Product Requirements**: `*.pdf` files in root directory - Comprehensive PRDs for the JPE system

## Version

**Framework Version**: 4.44.3
**Infrastructure DevOps Pack Version**: 1.12.0
**Last Updated**: December 21, 2025

## License & Attribution

Powered by **BMAD-METHOD™** - Business Motivated Agile Development
Built for AI-assisted software development with role-based agent coordination

---

**Ready to start building?** Choose an agent above and begin your project workflow!

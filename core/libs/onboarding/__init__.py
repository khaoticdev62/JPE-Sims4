"""Onboarding documentation system for JPE Sims 4 Mod Translator."""

import json
from pathlib import Path
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict

import sys
from pathlib import Path
# Add the parent directory to the path to allow imports
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from diagnostics.comprehensive import DiagnosticsTranslator


@dataclass
class DocumentationSection:
    """A section of documentation."""
    id: str
    title: str
    content: str
    order: int = 0
    prerequisites: List[str] = None
    related_topics: List[str] = None
    
    def __post_init__(self):
        if self.prerequisites is None:
            self.prerequisites = []
        if self.related_topics is None:
            self.related_topics = []


class OnboardingManager:
    """Manages onboarding documentation and user progress."""
    
    def __init__(self, docs_path: Optional[Path] = None):
        self.translator = DiagnosticsTranslator()
        self.sections: Dict[str, DocumentationSection] = {}
        self.user_progress: Dict[str, bool] = {}
        
        # Set up default documentation sections
        self._setup_default_docs()
        
        # If a docs path is provided, try to load custom documentation
        if docs_path and docs_path.exists():
            self.load_custom_docs(docs_path)
    
    def _setup_default_docs(self):
        """Set up default onboarding documentation sections."""
        default_sections = [
            DocumentationSection(
                id="getting_started",
                title="Getting Started",
                content="""# Getting Started with JPE Sims 4 Mod Translator

Welcome to the JPE Sims 4 Mod Translator! This tool helps you create Sims 4 mods using a simple, English-like syntax.

## What You'll Learn
- How to set up your first project
- Basic mod structure
- Creating interactions, buffs, and traits

## Requirements
- Python 3.11 or higher
- Basic understanding of Sims 4 modding concepts

Let's begin by creating your first project!""",
                order=1
            ),
            DocumentationSection(
                id="project_structure",
                title="Project Structure",
                content="""# Project Structure

A JPE Sims 4 project has a specific structure that organizes your mod files:

```
my_project/
├── config/           # Project configuration files
│   └── project.jpe   # Main project definition
├── src/              # Source files for your mod
│   ├── interactions.jpe  # Interaction definitions
│   ├── buffs.jpe         # Buff definitions
│   └── traits.jpe        # Trait definitions
├── build/            # Generated output files
└── docs/             # Documentation (optional)
```

## Key Directories

### config/
Contains project-level configuration including metadata and global settings.

### src/
Contains your mod definitions in JPE format.

### build/
Automatically generated files that can be used in The Sims 4.

## Next Steps
Try creating this structure for your first project!""",
                order=2,
                prerequisites=["getting_started"]
            ),
            DocumentationSection(
                id="jpe_syntax",
                title="JPE Syntax",
                content="""# JPE Syntax

JPE (Just Plain English) is a human-readable format for defining Sims 4 mods.

## Basic Structure

JPE files use sections and key-value pairs:

```
[SectionName]
key: value
another_key: another value
end
```

## Project Definition

```
[Project]
name: My Awesome Mod
id: my_awesome_mod
version: 1.0.0
author: Your Name
end
```

## Interaction Definition

```
[Interactions]
id: greet_neighbor
display_name: Greet Neighbor
description: Politely greet a nearby neighbor
participant: role:Actor, description:The person initiating the greeting
participant: role:Target, description:The neighbor being greeted
end
```

## Buff Definition

```
[Buffs]
id: happy_visitor
display_name: Happy Visitor
description: Feeling welcomed by a friendly neighbor
duration: 60
end
```

## String Definition

```
[Strings]
key: greet_neighbor_name
text: Greet Neighbor
locale: en_US
end
```

Try creating a simple interaction to practice!""",
                order=3,
                prerequisites=["project_structure"]
            ),
            DocumentationSection(
                id="building_projects",
                title="Building Projects",
                content="""# Building Projects

Once you've created your JPE files, you can build your project to generate Sims 4 mod files.

## Command Line

```
jpe-sims4 build /path/to/project --build-id my-build-001
```

## Studio Application

1. Open the Studio application
2. Choose "File" → "Open Project"
3. Select your project directory
4. Click "Build Project" in the Build tab

## What Gets Generated

The build process creates Sims 4-compatible XML files in the `build/` directory. These files can be placed in your Sims 4 mod folder.

## Build Reports

After each build, you'll receive a report showing:
- Success or failure status
- Any errors found
- Warnings about potential issues
- Suggestions for fixes

Try building a simple project now!""",
                order=4,
                prerequisites=["jpe_syntax"]
            ),
            DocumentationSection(
                id="troubleshooting",
                title="Troubleshooting",
                content="""# Troubleshooting

Common issues and solutions when working with JPE Sims 4.

## Syntax Errors

**Problem**: Build fails with parse errors
**Solution**: Check for missing colons, incorrect section names, or unclosed sections

## Missing References

**Problem**: Warnings about undefined references
**Solution**: Make sure all referenced resources (buffs, traits, etc.) are properly defined

## File Not Found

**Problem**: Can't locate project files
**Solution**: Verify your project structure matches the expected format

## Need Help?

- Check the error messages for specific suggestions
- Review the JPE syntax documentation
- Use the validate command: `jpe-sims4 validate /path/to/project`

Try fixing a simple error using these guidelines!""",
                order=5,
                prerequisites=["building_projects"],
                related_topics=["jpe_syntax"]
            )
        ]
        
        # Add all default sections
        for section in default_sections:
            self.sections[section.id] = section
    
    def load_custom_docs(self, docs_path: Path):
        """Load custom documentation from a directory."""
        # Look for documentation files
        for doc_file in docs_path.glob("*.json"):
            try:
                with open(doc_file, 'r', encoding='utf-8') as f:
                    doc_data = json.load(f)
                
                section = DocumentationSection(
                    id=doc_data['id'],
                    title=doc_data['title'],
                    content=doc_data['content'],
                    order=doc_data.get('order', 0),
                    prerequisites=doc_data.get('prerequisites', []),
                    related_topics=doc_data.get('related_topics', [])
                )
                self.sections[section.id] = section
            except Exception:
                # If custom docs can't be loaded, continue with defaults
                continue
    
    def get_next_section(self, current_section_id: Optional[str] = None) -> Optional[DocumentationSection]:
        """Get the next section in the learning path."""
        if not current_section_id:
            # Return the first section (order = 1)
            for section in sorted(self.sections.values(), key=lambda s: s.order):
                if section.order == 1:
                    return section
            return None
        
        current_section = self.sections.get(current_section_id)
        if not current_section:
            return None
        
        # Find the next section by order
        next_order = current_section.order + 1
        for section in self.sections.values():
            if section.order == next_order:
                # Check if prerequisites are met
                if self._prerequisites_met(section):
                    return section
        
        return None
    
    def _prerequisites_met(self, section: DocumentationSection) -> bool:
        """Check if all prerequisites for a section are completed."""
        for prereq_id in section.prerequisites:
            if not self.user_progress.get(prereq_id, False):
                return False
        return True
    
    def get_available_sections(self) -> List[DocumentationSection]:
        """Get all sections that are currently available to the user."""
        available = []
        for section in sorted(self.sections.values(), key=lambda s: s.order):
            if self._prerequisites_met(section):
                available.append(section)
        return available
    
    def mark_section_complete(self, section_id: str) -> bool:
        """Mark a documentation section as completed."""
        if section_id in self.sections:
            self.user_progress[section_id] = True
            return True
        return False
    
    def is_onboarding_complete(self) -> bool:
        """Check if the user has completed all onboarding sections."""
        all_ids = set(self.sections.keys())
        completed_ids = set(id for id, completed in self.user_progress.items() if completed)
        return all_ids.issubset(completed_ids)
    
    def get_onboarding_progress(self) -> Dict[str, any]:
        """Get a summary of the user's onboarding progress."""
        total_sections = len(self.sections)
        completed_sections = sum(1 for completed in self.user_progress.values() if completed)
        remaining_sections = total_sections - completed_sections
        
        return {
            "total_sections": total_sections,
            "completed_sections": completed_sections,
            "remaining_sections": remaining_sections,
            "progress_percentage": int((completed_sections / total_sections) * 100) if total_sections > 0 else 0,
            "completed_sections_list": [id for id, completed in self.user_progress.items() if completed],
            "next_section": self.get_next_section()
        }
    
    def get_section_content(self, section_id: str) -> Optional[DocumentationSection]:
        """Get the content for a specific documentation section."""
        return self.sections.get(section_id)
    
    def get_related_sections(self, section_id: str) -> List[DocumentationSection]:
        """Get related sections for a given section."""
        section = self.sections.get(section_id)
        if not section:
            return []
        
        related = []
        for related_id in section.related_topics:
            related_section = self.sections.get(related_id)
            if related_section:
                related.append(related_section)
        return related


class StudioDocumentationProvider:
    """Provides documentation content specifically formatted for the Studio UI."""
    
    def __init__(self, onboarding_manager: OnboardingManager):
        self.onboarding = onboarding_manager
    
    def get_formatted_content(self, section_id: str) -> str:
        """Get documentation content formatted for the Studio UI."""
        section = self.onboarding.get_section_content(section_id)
        if not section:
            return "Documentation section not found."
        
        content = section.content
        
        # Add navigation hints for the UI
        next_section = self.onboarding.get_next_section(section_id)
        if next_section:
            content += f"\n\n## Continue Learning\nNext: [{next_section.title}](doc:{next_section.id})"
        
        related_sections = self.onboarding.get_related_sections(section_id)
        if related_sections:
            content += f"\n\n## Related Topics\n"
            for rel_section in related_sections:
                content += f"- [{rel_section.title}](doc:{rel_section.id})\n"
        
        return content
    
    def get_tutorial_steps(self) -> List[Dict[str, str]]:
        """Get a list of tutorial steps for the UI."""
        steps = []
        available = self.onboarding.get_available_sections()
        
        for section in sorted(available, key=lambda s: s.order):
            status = "completed" if self.onboarding.user_progress.get(section.id, False) else "available"
            steps.append({
                "id": section.id,
                "title": section.title,
                "status": status,
                "content_preview": section.content.split('\n')[0] if section.content else ""
            })
        
        return steps
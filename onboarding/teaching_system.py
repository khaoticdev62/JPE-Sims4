"""Teaching and Onboarding System for JPE Sims 4 Mod Translator."""

import tkinter as tk
from tkinter import ttk
from typing import List, Dict, Callable, Optional
import json
from pathlib import Path


class Lesson:
    """Represents a single lesson in the teaching system."""
    
    def __init__(self, id: str, title: str, description: str, content: str, 
                 objectives: List[str], prerequisites: List[str] = None):
        self.id = id
        self.title = title
        self.description = description
        self.content = content
        self.objectives = objectives
        self.prerequisites = prerequisites or []
        self.completed = False


class TeachingMode:
    """Interactive teaching system with full lessons."""
    
    def __init__(self):
        self.lessons: Dict[str, Lesson] = {}
        self.current_lesson: Optional[Lesson] = None
        self.progress: Dict[str, bool] = {}
        self._initialize_lessons()
    
    def _initialize_lessons(self):
        """Initialize all lessons for the teaching system."""
        # Lesson 1: Introduction to JPE
        self.lessons["intro_jpe"] = Lesson(
            id="intro_jpe",
            title="Introduction to JPE",
            description="Learn the basics of Just Plain English for Sims 4 modding",
            content="""
# Introduction to JPE (Just Plain English)

JPE is a human-readable format for creating Sims 4 mods without complex XML.

## What is JPE?
- Simple, English-like syntax
- Human-readable and editable
- Translates to Sims 4 XML automatically

## Basic Structure
JPE files use sections and key-value pairs:

```
[SectionName]
key: value
another_key: another value
end
```

## Example: Simple Project
```
[Project]
name: My First Mod
id: my_first_mod
version: 1.0.0
end
```

## Your Task
Create a simple project definition in the editor below with:
- Name: "Learning JPE"
- ID: "learning_jpe"
- Version: "0.1.0"
""",
            objectives=["Understand JPE structure", "Create a basic project", "Identify sections and keys"]
        )
        
        # Lesson 2: Project Structure
        self.lessons["project_structure"] = Lesson(
            id="project_structure",
            title="Project Structure",
            description="Understand the proper structure for JPE projects",
            content="""
# JPE Project Structure

A well-structured JPE project follows specific conventions:

## Project Directory
```
my_project/
├── config/
│   └── project.jpe      # Project definition
├── src/                 # Source files
│   ├── interactions.jpe # Interactions
│   ├── buffs.jpe        # Buffs
│   └── traits.jpe       # Traits
├── build/               # Generated files
└── docs/                # Documentation
```

## Source File Organization
- interactions.jpe: All interaction definitions
- buffs.jpe: All buff definitions
- traits.jpe: All trait definitions
- enums.jpe: All enumeration definitions

## Example: Organized Files
```
[Project]
name: Organized Project
id: organized_project
version: 1.0.0
end
```

## Your Task
Create a proper project structure in the workspace with the correct directories.
""",
            objectives=["Create project directories", "Organize source files", "Understand file purposes"],
            prerequisites=["intro_jpe"]
        )
        
        # Lesson 3: Creating Interactions
        self.lessons["create_interactions"] = Lesson(
            id="create_interactions",
            title="Creating Interactions",
            description="Learn how to create Sims 4 interactions with JPE",
            content="""
# Creating Interactions

Interactions are actions that Sims can perform on other Sims, objects, or themselves.

## Basic Interaction Structure
```
[Interactions]
id: unique_interaction_id
display_name: Display Name
description: What the interaction does
participant: role:Actor, description:The one performing the action
participant: role:Target, description:The one receiving the action
end
```

## Interaction Properties
- id: Unique identifier (required)
- display_name: Name shown in game
- description: Tooltip description
- participants: Roles in the interaction
- autonomy_disabled: Whether the interaction is autonomous

## Example: Greet Interaction
```
[Interactions]
id: greet_neighbor
display_name: Greet Neighbor
description: Politely greet a nearby neighbor
participant: role:Actor, description:The person greeting
participant: role:Target, description:The person being greeted
autonomy_disabled: false
end
```

## Your Task
Create a simple interaction that allows Sims to "Wave Hello" to each other.
""",
            objectives=["Define an interaction", "Set display name and description", "Specify participants"],
            prerequisites=["project_structure"]
        )
        
        # Lesson 4: Creating Buffs
        self.lessons["create_buffs"] = Lesson(
            id="create_buffs",
            title="Creating Buffs",
            description="Learn how to create Sims 4 buffs with JPE",
            content="""
# Creating Buffs

Buffs are temporary status effects that modify a Sim's mood, needs, or abilities.

## Basic Buff Structure
```
[Buffs]
id: unique_buff_id
display_name: Buff Display Name
description: What the buff does
duration: duration_in_minutes (optional)
end
```

## Buff Properties
- id: Unique identifier (required)
- display_name: Name shown in game
- description: Tooltip description
- duration: How long the buff lasts (in minutes, optional)
- traits: Related traits (optional)

## Example: Happy Visiting Buff
```
[Buffs]
id: happy_visiting
display_name: Happy Visitor
description: Feeling welcomed by a friendly neighbor
duration: 60
end
```

## Your Task
Create a buff called "Motivated" that lasts for 30 minutes and makes Sims feel more productive.
""",
            objectives=["Define a buff", "Set duration", "Create descriptive text"],
            prerequisites=["create_interactions"]
        )
        
        # Lesson 5: Creating Traits
        self.lessons["create_traits"] = Lesson(
            id="create_traits",
            title="Creating Traits",
            description="Learn how to create Sims 4 traits with JPE",
            content="""
# Creating Traits

Traits are permanent characteristics that define a Sim's personality and behavior.

## Basic Trait Structure
```
[Traits]
id: unique_trait_id
display_name: Trait Display Name
description: What the trait represents
end
```

## Trait Properties
- id: Unique identifier (required)
- display_name: Name shown in game
- description: Tooltip description
- buffs: Associated buffs (optional)

## Example: Friendly Trait
```
[Traits]
id: friendly_spirit
display_name: Friendly Spirit
description: This Sim enjoys making friends and socializing
end
```

## Your Task
Create a trait called "Bookworm" for Sims who love reading and learning.
""",
            objectives=["Define a trait", "Create descriptive text", "Understand trait purpose"],
            prerequisites=["create_buffs"]
        )
        
        # Lesson 6: Working with Strings
        self.lessons["working_strings"] = Lesson(
            id="working_strings",
            title="Working with Strings",
            description="Learn how to create localized strings with JPE",
            content="""
# Working with Strings

Strings are localized text elements used for names, descriptions, and other display text.

## Basic String Structure
```
[Strings]
key: unique_string_key
text: The actual text content
locale: language_locale (optional, defaults to en_US)
end
```

## String Properties
- key: Unique identifier (required)
- text: The actual text content (required)
- locale: Language code (optional, defaults to en_US)

## Example: Interaction String
```
[Strings]
key: greet_neighbor_name
text: Greet Neighbor
locale: en_US
end

[Strings]
key: greet_neighbor_desc
text: Politely greet a nearby neighbor
locale: en_US
end
```

## Your Task
Create localized strings for one of your previous interactions or buffs.
""",
            objectives=["Create localized strings", "Use proper keys", "Set appropriate text"],
            prerequisites=["create_traits"]
        )
        
        # Lesson 7: Advanced Features
        self.lessons["advanced_features"] = Lesson(
            id="advanced_features",
            title="Advanced Features",
            description="Explore advanced JPE features and capabilities",
            content="""
# Advanced Features

Learn about advanced JPE capabilities for more complex mods.

## Enums (Enumerations)
```
[Enums]
id: mood_types
option: happy:0
option: sad:1
option: excited:2
option: calm:3
end
```

## Referencing Other Elements
You can reference other elements by ID:
```
[Traits]
id: bookworm_trait
display_name: Bookworm
buffs: study_buff, focus_buff
end
```

## Complex Interactions
```
[Interactions]
id: complex_interaction
display_name: Complex Action
description: An action with multiple effects
# More complex definitions possible
end
```

## Your Task
Create an enum and reference it in a trait or interaction.
""",
            objectives=["Create an enum", "Reference elements", "Use advanced features"],
            prerequisites=["working_strings"]
        )
        
        # Lesson 8: Building and Testing
        self.lessons["building_testing"] = Lesson(
            id="building_testing",
            title="Building and Testing",
            description="Learn how to build your JPE project and test it",
            content="""
# Building and Testing

Learn how to compile your JPE project and test it in the game.

## Building Process
1. Open your project in the Studio
2. Click 'Build Project' in the Build tab
3. Check the build report for errors
4. Find generated files in the build/ directory

## Testing in Game
1. Copy generated XML files to your Sims 4 mod folder
2. Enable testing cheats: testingcheats on
3. Look for your new interactions/trait in the game

## Common Issues
- Check for syntax errors in JPE files
- Ensure all referenced elements exist
- Verify proper file structure

## Your Task
Build your project and examine the build output.
""",
            objectives=["Build a project", "Examine build output", "Test in game"],
            prerequisites=["advanced_features"]
        )
        
        # Lesson 9: Publishing Your Mod
        self.lessons["publishing_mod"] = Lesson(
            id="publishing_mod",
            title="Publishing Your Mod",
            description="Learn how to package and publish your Sims 4 mod",
            content="""
# Publishing Your Mod

Learn how to package and distribute your finished mod.

## Packaging for Distribution
1. Ensure all required files are included
2. Create a package with proper folder structure
3. Test the package thoroughly
4. Create documentation

## Distribution Platforms
- ModTheSims
- Nexus Mods
- Your own website

## Best Practices
- Include clear installation instructions
- Provide good documentation
- Test on multiple game versions
- Keep backups of source files

## Your Task
Package a simple mod with installation instructions.
""",
            objectives=["Package a mod", "Create documentation", "Prepare for distribution"],
            prerequisites=["building_testing"]
        )
        
        # Lesson 10: Troubleshooting
        self.lessons["troubleshooting"] = Lesson(
            id="troubleshooting",
            title="Troubleshooting",
            description="Common issues and how to solve them",
            content="""
# Troubleshooting

Learn to identify and fix common problems with JPE mods.

## Common Syntax Errors
- Missing colons in key-value pairs
- Unclosed sections (missing 'end')
- Invalid characters in IDs
- Mismatched quotes

## Validation Errors
- Undefined references
- Duplicate IDs
- Missing required fields
- Invalid value types

## Debugging Process
1. Read error messages carefully
2. Check line numbers in error reports
3. Verify file structure
4. Test incrementally

## Your Task
Debug a provided file with intentional errors.
""",
            objectives=["Identify errors", "Debug syntax issues", "Fix common problems"],
            prerequisites=["publishing_mod"]
        )
    
    def start_lesson(self, lesson_id: str) -> bool:
        """Start a specific lesson."""
        if lesson_id in self.lessons:
            lesson = self.lessons[lesson_id]
            
            # Check prerequisites
            for prereq in lesson.prerequisites:
                if not self.progress.get(prereq, False):
                    return False  # Prerequisites not met
            
            self.current_lesson = lesson
            return True
        return False
    
    def complete_lesson(self, lesson_id: str) -> bool:
        """Mark a lesson as completed."""
        if lesson_id in self.lessons:
            self.progress[lesson_id] = True
            return True
        return False
    
    def get_lesson_count(self) -> int:
        """Get total number of lessons."""
        return len(self.lessons)
    
    def get_completed_count(self) -> int:
        """Get number of completed lessons."""
        return sum(1 for status in self.progress.values() if status)
    
    def get_next_lesson(self) -> Optional[Lesson]:
        """Get the next incomplete lesson."""
        for lesson_id, lesson in self.lessons.items():
            if not self.progress.get(lesson_id, False):
                # Check if prerequisites are met
                prereqs_met = all(self.progress.get(prereq, False) for prereq in lesson.prerequisites)
                if prereqs_met:
                    return lesson
        return None
    
    def get_lesson_by_id(self, lesson_id: str) -> Optional[Lesson]:
        """Get a specific lesson by ID."""
        return self.lessons.get(lesson_id)


class OnboardingManager:
    """Dummy-proof onboarding system with guided tutorials."""
    
    def __init__(self):
        self.current_step = 0
        self.total_steps = 5
        self.onboarding_complete = False
        self.steps = [
            {
                "title": "Welcome to JPE Sims 4",
                "content": "Welcome to the JPE Sims 4 Mod Translator! This tool helps you create Sims 4 mods using simple, plain English.\n\nClick 'Next' to begin your journey into mod creation!",
                "image": "welcome"
            },
            {
                "title": "Project Setup",
                "content": "First, you need to create a project. A project contains all your mod files.\n\n1. Click 'File' → 'New Project'\n2. Choose a directory for your project\n3. Give your project a name\n\nThe tool will create the proper folder structure automatically.",
                "image": "project_setup"
            },
            {
                "title": "Creating Your First Mod",
                "content": "Now let's create your first mod element:\n\n1. Open the Editor tab\n2. Create a simple interaction using JPE syntax\n3. Try creating a 'Wave Hello' interaction:\n\n[Interactions]\nid: wave_hello\ndisplay_name: Wave Hello\ndescription: Politely wave to someone\nend",
                "image": "first_mod"
            },
            {
                "title": "Building Your Mod",
                "content": "Once you've created your mod elements:\n\n1. Click the 'Build' tab\n2. Click 'Build Project'\n3. Check the build report for any errors\n4. Find your generated XML files in the 'build' folder",
                "image": "build"
            },
            {
                "title": "Success!",
                "content": "Congratulations! You've completed the basic onboarding.\n\nYou now know how to:\n- Create a project\n- Write JPE code\n- Build your mod\n\nContinue with the teaching system to learn more advanced features!",
                "image": "success"
            }
        ]
    
    def get_current_step(self):
        """Get the current onboarding step."""
        if self.current_step < len(self.steps):
            return self.steps[self.current_step]
        return None
    
    def next_step(self):
        """Move to the next step."""
        if self.current_step < len(self.steps) - 1:
            self.current_step += 1
            return True
        else:
            self.onboarding_complete = True
            return False
    
    def prev_step(self):
        """Move to the previous step."""
        if self.current_step > 0:
            self.current_step -= 1
            return True
        return False
    
    def reset(self):
        """Reset the onboarding process."""
        self.current_step = 0
        self.onboarding_complete = False
    
    def get_progress(self):
        """Get completion progress."""
        return (self.current_step + 1) / len(self.steps) if self.steps else 0


class TestMode:
    """Interactive testing environment for JPE code."""
    
    def __init__(self):
        self.tests: Dict[str, Dict] = {}
        self.results: Dict[str, bool] = {}
        self.current_test: Optional[str] = None
        self._initialize_tests()
    
    def _initialize_tests(self):
        """Initialize test cases for JPE syntax and functionality."""
        # Test 1: Basic Syntax
        self.tests["basic_syntax"] = {
            "title": "Basic JPE Syntax",
            "description": "Test basic JPE syntax with proper sections and end statements",
            "code": """
[Project]
name: Test Project
id: test_project
version: 1.0.0
end
""",
            "expected": True
        }
        
        # Test 2: Interaction Definition
        self.tests["interaction_def"] = {
            "title": "Interaction Definition",
            "description": "Test proper interaction definition with all required elements",
            "code": """
[Interactions]
id: test_interaction
display_name: Test Interaction
description: A test interaction
participant: role:Actor, description:The actor
end
""",
            "expected": True
        }
        
        # Test 3: Missing End Statement (should fail)
        self.tests["missing_end"] = {
            "title": "Missing End Statement",
            "description": "Test code with missing end statement (should fail validation)",
            "code": """
[Project]
name: Test Project
id: test_project
version: 1.0.0
""",
            "expected": False
        }
        
        # Test 4: Empty ID (should fail)
        self.tests["empty_id"] = {
            "title": "Empty ID Test",
            "description": "Test code with empty ID (should fail validation)",
            "code": """
[Interactions]
id: 
display_name: Test Interaction
end
""",
            "expected": False
        }
        
        # Test 5: Valid Buff Definition
        self.tests["buff_def"] = {
            "title": "Buff Definition",
            "description": "Test proper buff definition",
            "code": """
[Buffs]
id: test_buff
display_name: Test Buff
description: A test buff
duration: 60
end
""",
            "expected": True
        }
    
    def run_all_tests(self) -> Dict[str, bool]:
        """Run all tests and return results."""
        from engine.parsers.jpe_parser import JpeParser
        from pathlib import Path
        import tempfile
        
        parser = JpeParser()
        
        for test_id, test_data in self.tests.items():
            try:
                # Create a temporary file with the test code
                with tempfile.TemporaryDirectory() as temp_dir:
                    temp_file = Path(temp_dir) / "test.jpe"
                    temp_file.write_text(test_data["code"])
                    
                    # Try to parse the code
                    project_ir, errors = parser.parse_project(Path(temp_dir))
                    
                    # Check if errors occurred
                    has_errors = len(errors) > 0
                    expected_success = test_data["expected"]
                    
                    # Test passes if expected and actual results match
                    self.results[test_id] = (not has_errors) == expected_success
            except Exception:
                # If parsing fails unexpectedly, mark as failed
                self.results[test_id] = False
        
        return self.results
    
    def run_single_test(self, test_id: str) -> bool:
        """Run a single test."""
        if test_id in self.tests:
            results = self.run_all_tests()
            return results.get(test_id, False)
        return False
    
    def get_test_results(self) -> Dict[str, Dict[str, any]]:
        """Get detailed test results."""
        all_results = self.run_all_tests()
        detailed_results = {}
        
        for test_id, result in all_results.items():
            test_data = self.tests[test_id]
            detailed_results[test_id] = {
                "title": test_data["title"],
                "description": test_data["description"],
                "expected": test_data["expected"],
                "actual": result,
                "passed": result == test_data["expected"]
            }
        
        return detailed_results
    
    def get_summary(self) -> Dict[str, any]:
        """Get a summary of test results."""
        all_results = self.run_all_tests()
        total = len(all_results)
        passed = sum(1 for result in all_results.values() if result)
        
        return {
            "total_tests": total,
            "passed_tests": passed,
            "failed_tests": total - passed,
            "success_rate": (passed / total) * 100 if total > 0 else 0
        }


# Global instances
teaching_system = TeachingMode()
onboarding_system = OnboardingManager()
test_system = TestMode()
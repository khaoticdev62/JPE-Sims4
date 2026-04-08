# Template Builder Wizard Guide

**For**: JPE Studio Users
**Version**: 1.0
**Status**: Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Launching the Wizard](#launching-the-wizard)
3. [Step-by-Step Guide](#step-by-step-guide)
4. [Tips & Tricks](#tips--tricks)
5. [Troubleshooting](#troubleshooting)
6. [Advanced Usage](#advanced-usage)
7. [API Reference](#api-reference)

---

## Overview

The Template Builder Wizard is an interactive GUI tool that guides you through creating JPE templates without needing to write code. It's designed for:

- **Beginners**: Create templates using a visual wizard
- **Experienced Users**: Quickly prototype new template ideas
- **Teams**: Standardize template creation process
- **Educators**: Teach JPE concepts visually

### Key Features

✅ **Step-by-Step Wizard**: 5 simple steps to complete template
✅ **Real-Time Preview**: See generated JPE code as you create
✅ **Pre-Defined Options**: 50+ common tests and effects
✅ **Custom Buffs**: Create unlimited custom emotion buffs
✅ **Auto-Save**: Save as `.jpe` file with metadata
✅ **No Syntax Knowledge Required**: Visual interface handles all syntax

---

## Launching the Wizard

### From JPE Studio

**Method 1: Menu**
```
File → New Template → Template Builder Wizard
```

**Method 2: Toolbar**
Click the "New Template" button (wand icon) in the toolbar

**Method 3: Keyboard Shortcut**
```
Ctrl+Shift+T  (Windows/Linux)
Cmd+Shift+T   (macOS)
```

### From Command Line

```bash
jpe-studio --template-wizard
```

### Programmatically

```python
from ui.template_builder_wizard import create_template_builder_window
import tkinter as tk

root = tk.Tk()
window = create_template_builder_window(root)
root.mainloop()
```

---

## Step-by-Step Guide

### Step 1: Basic Information

This step gathers the fundamental details about your interaction.

#### Interaction Name
**What to enter**: A clear, descriptive name for the interaction

**Good examples:**
- `Greet Friend`
- `Romantic Kiss`
- `Cook Dinner`

**Bad examples:**
- `Interaction 1` (unclear)
- `x` (too short)
- `The Sim Performs an Action to Another Sim` (too long)

**Naming Guidelines:**
- Use 2-4 words
- Capitalize each word
- Be specific enough to understand at a glance
- Avoid numbers or special characters

#### Description
**What to enter**: Player-facing text that explains what the interaction does

**Good examples:**
- "Share a passionate kiss with your romantic partner"
- "Cook a delicious meal in the kitchen"
- "Have a deep conversation with a friend"

**Bad examples:**
- "Kiss" (too short)
- "Blah blah interaction" (unclear)
- "Execute romantic gesture protocol 5" (too technical)

**Description Guidelines:**
- Write for players, not programmers
- Explain what happens and why they'd want it
- 5-20 words is ideal
- Don't mention technical details (tests, buffs, etc.)

#### Category (Optional)
**What this does**: Helps organize templates in your library

**Available Categories:**
- Social (interactions between Sims)
- Skill (learning and development)
- Entertainment (fun activities)
- Romance (romantic interactions)
- Family (family relationships)
- Career (job-related interactions)

**When to use:**
- Always pick the closest match
- Pick "Social" if unsure

---

### Step 2: Type & Duration

This step defines how the interaction works and how long it lasts.

#### Interaction Type

**Social**
- Between two Sims
- Requires a target
- Examples: Greet, Kiss, Compliment

**Object**
- Sim interacts with an object
- Examples: Cook, Paint, Play Guitar

**Autonomous**
- Sims do it on their own, sometimes without player input
- Examples: Sleep, Eat, Relax

**Looping**
- Interaction that repeats
- Examples: Meditate, Exercise, Practice

#### Duration

Duration is how long the interaction takes, measured in seconds.

**Quick Interactions (5-15 seconds)**
- Greetings
- Compliments
- Quick checks

**Medium Interactions (20-60 seconds)**
- Conversations
- Simple activities
- Social events

**Long Interactions (120+ seconds)**
- Skill building
- Complex social interactions
- Elaborate activities

**Duration Guidelines:**
- Longer interactions should have bigger rewards
- Quick interactions should have small impacts
- Real-world timing: Kissing ≈ 15s, Cooking ≈ 60s, Meditation ≈ 300s

---

### Step 3: Conditions (Tests)

Tests define when the interaction is available. Only check the conditions that apply.

#### Age & Lifecycle Tests

```
actor is adult          - Only works for adult Sims
actor is teen           - Only works for teen Sims
both are adults         - Both must be adults
```

**When to use:**
- Age-appropriate interactions (dating → adults only)
- Age-specific activities (playing tag → teens/kids)

#### Mood & Emotions Tests

```
actor is in good mood        - Sim must be happy
actor is in bad mood         - Sim must be sad/angry
actor is in focus mood       - Sim must be focused
target is in good mood       - Target must be happy
```

**When to use:**
- Interactions that require emotional state
- Happy interactions require good mood
- Deep conversations work better with good mood

#### Relationship Tests

```
actor knows target              - Must have met
actor is friends with target    - Must have friendship
actor is in love with target    - Must have romance
actor is best friend with target - Must be best friends
```

**When to use:**
- Social interactions need some relationship
- Romantic interactions need in-love status
- Romantic kiss → "actor is in love with target"
- Simple greeting → "actor knows target"

#### Skill & Status Tests

```
actor has skill level 3+    - Requires at least skill 3
actor is not tired          - Sim must have energy
actor is not busy           - Sim must be available
```

**When to use:**
- Advanced interactions require high skills
- Long interactions use up energy → "not tired"
- Important interactions → "not busy"

#### Location Tests

```
not in public        - Must be in private location
in home lot          - Must be at home
location has equipment - Location needs specific items
```

**When to use:**
- Intimate interactions → "not in public"
- Skill activities need equipment
- Home activities → "in home lot"

#### Best Practices for Tests

1. **Start Restrictive**: Put most restrictive tests first
   - Age requirements before mood requirements
   - Relationship requirements before location

2. **Add Enough Tests**: 2-4 tests is typical
   - Too few: Interaction happens all the time
   - Too many: Interaction never happens

3. **Be Realistic**: Not every interaction needs restrictions
   - Simple greetings might not need tests
   - Complex interactions need multiple tests

---

### Step 4: Effects

Effects are what happens when the interaction completes. Check all effects that apply.

#### Mood Changes

```
increase mood by 10    - Small mood boost
increase mood by 20    - Medium mood boost
increase mood by 30    - Large mood boost
remove sad feeling     - Stop sadness
remove angry feeling   - Stop anger
```

**Examples:**
- Happy interaction → "increase mood by 20"
- Cheer up interaction → "remove sad feeling" + "increase mood by 30"
- Calming interaction → "remove angry feeling"

#### Relationships

```
increase friendship +5      - Small friendship boost
increase friendship +15     - Moderate friendship increase
increase friendship +30     - Large friendship increase
increase romance +10        - Small romance boost
increase romance +30        - Significant romance increase
```

**Examples:**
- Greet friend → "increase friendship +5"
- Deep talk → "increase friendship +30"
- Romantic kiss → "increase romance +30"
- Couple activity → "increase romance +10" + "increase friendship +15"

#### Skills

```
increase cooking skill by 1      - Small cooking gain
increase painting skill by 1     - Small painting gain
increase logic skill by 2        - Moderate logic gain
```

**Examples:**
- Cook dinner → "increase cooking skill by 1"
- Study session → "increase logic skill by 2"
- Paint → "increase painting skill by 1"

#### Buffs to Add

```
add happy feeling        - Happiness buff
add focused feeling      - Focus buff
add energized feeling    - Energy buff
add tired feeling        - Fatigue buff
```

**Examples:**
- Fun interaction → "add happy feeling"
- Study session → "add focused feeling"
- Workout → "add energized feeling"
- Long activity → "add tired feeling"

#### Effect Best Practices

1. **Balance Rewards**:
   - Simple interactions: 1-2 effects
   - Complex interactions: 3-5 effects
   - Powerful interactions: 5+ effects

2. **Match Interaction Type**:
   - Social → relationship and mood effects
   - Skill → skill and mood effects
   - Fun → mood effects

3. **Avoid Contradictions**:
   - Don't "increase mood" and "add sad feeling"
   - Don't "add tired feeling" and "add energized feeling"

---

### Step 5: Custom Buffs

Create custom emotion/feeling buffs that appear in the game.

#### Buff Components

**Name**: Short name for the buff (e.g., "Romantic Feeling")

**Description**: What the Sim feels (e.g., "Feeling romantic and connected")

**Mood Type**:
- Positive: Makes Sim happy
- Negative: Makes Sim unhappy
- Neutral: No mood impact

**Intensity (1-4)**:
- 1 = Very mild (barely noticeable)
- 2 = Mild (small impact)
- 3 = Strong (significant impact)
- 4 = Very Strong (major impact)

**Duration (seconds)**:
- 60 = 1 minute
- 300 = 5 minutes
- 600 = 10 minutes
- 3600 = 1 hour

#### Creating Buffs

1. Enter the buff name
2. Enter a description (what the Sim feels)
3. Choose mood type (positive/negative/neutral)
4. Set intensity (1-4)
5. Set duration (in seconds)
6. Click "Add Buff"

#### Example Buffs

**Romantic Feeling**
- Description: "Feeling romantic and emotionally connected"
- Mood Type: Positive
- Intensity: 3
- Duration: 300 (5 minutes)

**Triumphant Feeling**
- Description: "Just achieved something great!"
- Mood Type: Positive
- Intensity: 4
- Duration: 600 (10 minutes)

**Awkward Feeling**
- Description: "Feeling socially awkward"
- Mood Type: Negative
- Intensity: 2
- Duration: 180 (3 minutes)

#### Buff Best Practices

1. **Keep Names Simple**: 1-2 words
   - Good: "Happy Feeling", "Energized"
   - Bad: "The State of Being Extremely Happy"

2. **Match Intensity to Duration**:
   - Strong feelings (3-4) should last short times (< 10 min)
   - Mild feelings (1-2) can last longer

3. **Create 1-3 Custom Buffs Per Template**:
   - Too many: Overwhelming UI
   - Too few: Not enough flavor

4. **Use Descriptive Names**:
   - Specific: "Inspired", "Validated", "Satisfied"
   - Avoid generic: "Good Feeling", "Effect"

---

## Tips & Tricks

### Tip 1: Use Preview Frequently

Click "Preview" to see the generated JPE code at any time. This helps you:
- Verify the code looks correct
- Learn JPE syntax gradually
- Catch issues early

### Tip 2: Start Simple

Create simple templates first to learn the system:
1. Simple greeting (2 tests, 2 effects)
2. Simple skill building (3 tests, 3 effects)
3. Simple romantic interaction (4 tests, 4 effects)

Then try complex interactions.

### Tip 3: Use Consistent Naming

Keep buff names consistent across templates:
- All happy buffs: "Happy Feeling", "Very Happy", "Extremely Happy"
- All focused buffs: "Focused", "Very Focused"
- All tired buffs: "Tired", "Exhausted"

### Tip 4: Test the Duration

Durations should feel realistic:
- Greeting: 10s
- Conversation: 30-45s
- Skill building: 60s
- Complex interaction: 90-120s
- Meditation: 300s

### Tip 5: Combine Multiple Relationship Buffs

Use multiple buffs to create complex emotional states:
```
Happy Feeling (positive, 2, 180s) - Base emotion
Romantic Feeling (positive, 3, 300s) - Relationship context
Satisfied Feeling (positive, 2, 240s) - Action outcome
```

### Tip 6: Export and Modify

After creating a template with the wizard:
1. Save the template
2. Open it in JPE Studio
3. Make fine-tuning adjustments in code
4. Re-save

This combines ease of wizard with power of code editing.

---

## Troubleshooting

### "Preview shows syntax errors"

**Cause**: Invalid test/effect name
**Solution**: Check that test/effect names match exactly from the list

### "Template won't save"

**Cause**: Missing required field
**Solution**: Make sure you've entered:
- Interaction name
- Description
- At least one effect

### "Interaction never appears in game"

**Cause**: Too many restrictive tests
**Solution**: Preview and verify tests are correct:
- Remove tests that shouldn't apply
- Check test spelling exactly
- Try with 0 tests first, then add back gradually

### "Buff doesn't show up"

**Cause**: Buff name might be too similar to existing buff
**Solution**: Rename to something unique like "Custom Happy Feeling"

### "Duration seems wrong in game"

**Cause**: Game might scale durations differently
**Solution**: Try different duration values and test in-game to calibrate

---

## Advanced Usage

### Programmatic Template Creation

```python
from ui.template_builder_wizard import (
    TemplateConfig,
    InteractionType,
    TestCondition,
    Effect,
)

# Create config programmatically
config = TemplateConfig(
    name="My Interaction",
    description="What it does",
    interaction_type=InteractionType.SOCIAL,
    duration=30,
)

# Add tests
config.tests.append(TestCondition(condition_type="both are adults"))

# Add effects
config.effects.append(Effect(effect_type="increase mood by 20"))

# Add buff
config.buffs["Happy Feeling"] = {
    "description": "Feeling happy",
    "mood_type": "positive",
    "intensity": 2,
    "duration": 180,
    "mood_gain": 15,
}

# Generate JPE code
jpe_code = config.to_jpe()
print(jpe_code)
```

### Batch Template Creation

```python
from ui.template_builder_wizard import TemplateConfig, InteractionType
from pathlib import Path

# Create multiple templates programmatically
templates = [
    {
        "name": "Greet",
        "description": "Say hello",
        "duration": 10,
    },
    {
        "name": "Kiss",
        "description": "Kiss romantically",
        "duration": 15,
    },
    {
        "name": "Hug",
        "description": "Give a hug",
        "duration": 12,
    },
]

for template_data in templates:
    config = TemplateConfig(
        **template_data,
        interaction_type=InteractionType.SOCIAL,
    )

    jpe_code = config.to_jpe()
    output_path = Path(f"templates/{template_data['name'].lower()}.jpe")
    output_path.write_text(jpe_code)
```

### Extending the Wizard

Add custom tests and effects:

```python
from ui.template_builder_wizard import TemplateBuilderWizard

wizard = TemplateBuilderWizard(root)

# Add custom test category
wizard.COMMON_TESTS["Custom Tests"] = {
    "custom test 1": "Description",
    "custom test 2": "Description",
}

# Add custom effect category
wizard.COMMON_EFFECTS["Custom Effects"] = {
    "custom effect 1": "Description",
    "custom effect 2": "Description",
}
```

---

## API Reference

### TemplateConfig Class

```python
@dataclass
class TemplateConfig:
    name: str                                    # Template name
    description: str                             # Player-facing description
    interaction_type: InteractionType            # Type of interaction
    duration: int                                # Duration in seconds
    tests: List[TestCondition] = []              # Condition tests
    effects: List[Effect] = []                   # Effects on completion
    buffs: Dict[str, Dict[str, Any]] = {}       # Custom buffs
    category: Optional[str] = None               # Category
    cost: int = 0                                # AP/resource cost
    is_autonomous: bool = False                  # Can happen autonomously

    def to_jpe(self) -> str:                    # Generate JPE code
    def to_dict(self) -> Dict[str, Any]:        # Serialize to dict
    @classmethod
    def from_dict(cls, data: Dict) -> TemplateConfig:  # Deserialize
```

### TestCondition Class

```python
@dataclass
class TestCondition:
    condition_type: str                  # Test name
    parameters: Dict[str, Any] = {}     # Optional parameters
    negate: bool = False                 # Negate the test

    def to_string(self) -> str:          # Convert to JPE syntax
```

### Effect Class

```python
@dataclass
class Effect:
    effect_type: str                     # Effect name
    parameters: Dict[str, Any] = {}     # Optional parameters

    def to_string(self) -> str:          # Convert to JPE syntax
```

### TemplateBuilderWizard Class

```python
class TemplateBuilderWizard:
    def __init__(self, parent: tk.Widget,
                 on_save: Optional[Callable] = None)

    def create_wizard_window(self) -> tk.Toplevel:
    def show_preview(self) -> None:
    def save_template(self) -> None:
    def next_step(self) -> None:
    def previous_step(self) -> None:

    # Pre-defined options
    COMMON_TESTS: Dict[str, Dict[str, str]]
    COMMON_EFFECTS: Dict[str, Dict[str, str]]
```

---

## Examples

### Example 1: Simple Greeting Template

1. **Step 1**: Name: "Greet Warmly", Description: "Give a warm, friendly greeting"
2. **Step 2**: Type: Social, Duration: 10 seconds
3. **Step 3**: Test: "actor is not alone"
4. **Step 4**: Effects: "increase mood by 5", "increase friendship +3"
5. **Step 5**: No custom buffs needed

### Example 2: Romantic Kiss Template

1. **Step 1**: Name: "Romantic Kiss", Description: "Share a passionate kiss"
2. **Step 2**: Type: Social, Duration: 15 seconds
3. **Step 3**: Tests: "both are adults", "actor is in love with target", "not in public"
4. **Step 4**: Effects: "increase romance +30", "increase mood by 25"
5. **Step 5**: Custom buff: "Romantic Feeling" (positive, intensity 3, 300s)

### Example 3: Skill Building Template

1. **Step 1**: Name: "Practice Cooking", Description: "Work on cooking skills"
2. **Step 2**: Type: Object, Duration: 60 seconds
3. **Step 3**: Tests: "actor is not tired", "location has equipment"
4. **Step 4**: Effects: "increase cooking skill by 1", "add focused feeling"
5. **Step 5**: No custom buffs (use "Focused Feeling" effect instead)

---

## Best Practices Checklist

- [ ] Interaction name is clear (2-4 words)
- [ ] Description explains what happens (5-20 words)
- [ ] Type matches the interaction
- [ ] Duration feels realistic (5-300+ seconds)
- [ ] Tests are specific but not too restrictive (2-4 tests)
- [ ] Effects match the interaction type
- [ ] Custom buffs have clear names
- [ ] Buff moods make sense (positive for happy, etc.)
- [ ] Preview looks correct before saving
- [ ] Template file is saved with clear name

---

**For more help**:
- See JPE Master Bible for advanced patterns
- See JPE Quick Start for basic templates
- Check TEMPLATE_BUILDER_GUIDE.md for wizard help

---

**Generated with Claude Code**
**Version**: 1.0
**Status**: Production Ready

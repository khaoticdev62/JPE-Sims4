# 📖 JPE Master Bible - Complete Guide to Just Plain English

**Version**: 1.0.0
**Last Updated**: December 2024
**Difficulty**: Beginner to Advanced
**Time to Learn**: 2-4 hours

---

## 🎯 Table of Contents

1. [What is JPE?](#what-is-jpe)
2. [Getting Started](#getting-started)
3. [JPE Syntax Fundamentals](#jpe-syntax-fundamentals)
4. [Core Concepts](#core-concepts)
5. [Complete Language Reference](#complete-language-reference)
6. [Common Patterns](#common-patterns)
7. [Advanced Techniques](#advanced-techniques)
8. [Troubleshooting](#troubleshooting)
9. [Tips & Tricks](#tips--tricks)

---

## What is JPE?

### Overview

**JPE** stands for **Just Plain English** – a simple, readable syntax for creating The Sims 4 mods without complex XML or programming knowledge.

Instead of writing XML like:
```xml
<?xml version="1.0" encoding="utf-8"?>
<interactions>
  <interaction>
    <name>Greet Sim</name>
    <description>Say hello to another Sim</description>
    <tests>
      <test>Sim must be adult</test>
    </tests>
  </interaction>
</interactions>
```

You write JPE like:
```jpe
Greet Sim
  description: "Say hello to another Sim"
  tests:
    - Sim must be adult
```

### Why JPE?

✅ **Human-Readable** - Plain English instead of XML
✅ **Beginner-Friendly** - No programming experience needed
✅ **Fast to Write** - Less syntax, more content
✅ **Less Error-Prone** - Simpler structure = fewer mistakes
✅ **Easy to Maintain** - Clear structure easy to update

### What Can You Create?

JPE supports creating:
- ✅ Interactions (social, object, autonomous)
- ✅ Buffs (moodlets and effects)
- ✅ Traits (permanent sim characteristics)
- ✅ Tests (conditions for actions)
- ✅ Tuning files (behavior customization)
- ✅ Loot tables (reward systems)
- ✅ Localization (multi-language support)

---

## Getting Started

### Installation

#### Option 1: Standalone Installer
1. Download from [GitHub Releases](https://github.com/khaoticdev62/JPE-Sims4)
2. Run the installer for your platform
3. Follow setup wizard
4. Launch JPE Studio

#### Option 2: Portable Version
1. Download portable ZIP
2. Extract to any folder
3. Run JPE-Studio.exe (Windows) or open app (macOS)
4. No installation required!

#### Option 3: From Source
```bash
git clone https://github.com/khaoticdev62/JPE-Sims4.git
cd JPE-Sims4
pip install -e .
python studio.py
```

### Your First JPE File

1. **Create a new file** in JPE Studio
2. **Save it** with `.jpe` extension (e.g., `my_mod.jpe`)
3. **Write your first interaction**:

```jpe
Simple Greeting
  description: "A simple greeting interaction"
  actor_capabilities:
    - can_super_afford
  tests:
    - actor is an adult
```

4. **Build it** (File → Build or Ctrl+B)
5. **Export** to your Sims 4 Mods folder
6. **Test in-game**!

---

## JPE Syntax Fundamentals

### File Structure

Every JPE file has this structure:

```jpe
[Comments]
[Imports/Includes]
[Element Definitions]
```

### Comments

Comments start with `#`:

```jpe
# This is a comment explaining the next interaction
My Interaction Name
  # Comments can appear anywhere
  description: "Does something cool"
```

### Basic Element

The simplest JPE element:

```jpe
Element Name
  property: value
  another_property: "value with special chars"
```

### Indentation (CRITICAL!)

JPE uses **indentation** to show hierarchy:

```jpe
Parent Element
  child_property: value
  nested_object:
    grandchild: value
    another_grandchild: value
```

**Rule**: Each level deeper = 2 more spaces of indentation

### Data Types

JPE supports these data types:

#### Strings (Text)
Use double quotes for text with spaces or special characters:
```jpe
description: "This is a string"
name: SimpleWord  # Can omit quotes for single words
```

#### Numbers
```jpe
duration: 100  # Integer
chance: 0.75   # Decimal/Float
```

#### Booleans (True/False)
```jpe
enabled: true
disabled: false
```

#### Lists/Arrays
Use dashes for multiple items:
```jpe
tests:
  - test one
  - test two
  - test three
```

Or inline with brackets:
```jpe
tests: [test one, test two, test three]
```

#### Objects/Nested Properties
Use indentation:
```jpe
interaction:
  name: "My Interaction"
  description: "Does something"
  duration: 50
```

---

## Core Concepts

### Interactions

Interactions are **actions Sims can perform**.

#### Basic Interaction

```jpe
Wave Hello
  description: "Give a friendly wave"
  type: social
  duration: 10
  autonomy_weight: 1.5
```

#### Interaction with Tests

Tests are **conditions** that must be true for the interaction to work:

```jpe
Romantic Kiss
  description: "Kiss your romantic partner romantically"
  type: social
  duration: 20
  tests:
    - actor is adult
    - actor is romantic with target
    - target is adult
    - both Sims are not familial
```

#### Interaction with Effects

Effects are **what happens** when the interaction completes:

```jpe
Cook Meal
  description: "Prepare a delicious meal"
  duration: 60
  effects:
    - increase cooking skill by 2
    - create food item
    - add "cooked food" buff
```

### Buffs (Moodlets)

Buffs are **temporary effects** on Sims (like feeling happy or sad).

```jpe
Well Rested
  description: "This Sim got enough sleep"
  mood_type: positive
  intensity: 2
  duration: 480  # minutes
  decay_rate: 0.5
  mood_gain: 15
```

### Traits

Traits are **permanent characteristics** that define a Sim.

```jpe
Loves Animals
  description: "This Sim loves all animals"
  category: hobby
  conflict_traits:
    - hates animals
  interactions:
    - pet cat
    - pet dog
    - talk to pets
```

### Tests

Tests are **conditions** for interactions.

```jpe
Adult Only Interaction
  description: "Only adults can do this"
  type: social
  tests:
    - actor is adult
    - actor is not a child
    - actor is not a toddler
```

---

## Complete Language Reference

### Interaction Properties

| Property | Type | Example | Description |
|----------|------|---------|-------------|
| `description` | string | `"Give a hug"` | User-friendly description |
| `type` | string | `social` | Type: social, object, autonomous |
| `duration` | number | `30` | How long in game minutes |
| `autonomy_weight` | number | `1.5` | Likelihood Sims do autonomously |
| `tests` | list | See examples | Conditions to enable |
| `effects` | list | See examples | Outcomes when complete |
| `animations` | list | `[wave, smile]` | Visual animations |
| `sounds` | list | `[greeting, laugh]` | Audio effects |

### Common Test Patterns

```jpe
# Age tests
- actor is adult
- actor is teen
- actor is child
- actor is toddler
- actor is baby

# Relationship tests
- actor is friends with target
- actor is romantic with target
- actor is enemies with target
- actor is familial with target

# Skill tests
- actor has cooking skill
- actor cooking skill >= 5
- actor cooking skill < 3

# Mood tests
- actor is happy
- actor is sad
- actor mood >= 50
- actor mood <= -30

# Status tests
- actor is alive
- actor is home
- actor is hungry
- actor is tired
- actor is at work
```

### Common Effect Patterns

```jpe
# Skill effects
- increase cooking skill by 2
- increase painting skill by 1
- decrease fitness skill by 1

# Buff effects
- add happy moodlet
- add sad moodlet
- add "well rested" buff
- remove tired buff

# Object effects
- create food
- create painting
- destroy object
- give money 500

# Relationship effects
- increase friendship +20
- decrease romance -10
- establish friendship
- break relationship

# Mood effects
- increase mood by 50
- decrease mood by 30
- set mood to 75
```

### Buff Properties

| Property | Type | Example | Description |
|----------|------|---------|-------------|
| `description` | string | `"Feeling great"` | What this buff does |
| `mood_type` | string | `positive/negative` | Emotion type |
| `intensity` | number | `2` | Strength 1-5 |
| `duration` | number | `480` | Minutes until expires |
| `mood_gain` | number | `15` | Mood points added |
| `decay_rate` | number | `0.5` | How fast it fades |
| `visible` | boolean | `true` | Show in UI? |
| `can_remove` | boolean | `true` | Can player remove? |

### Trait Properties

| Property | Type | Example | Description |
|----------|------|---------|-------------|
| `description` | string | `"Loves swimming"` | Trait description |
| `category` | string | `hobby` | Trait category |
| `rare` | boolean | `false` | Uncommon trait? |
| `cost` | number | `3` | Point cost to unlock |
| `conflict_traits` | list | `[hates water]` | Incompatible traits |
| `interactions` | list | `[swim, dive]` | Special interactions |
| `buffs` | list | `[happy in water]` | Automatic buffs |

---

## Common Patterns

### Pattern 1: Simple Social Interaction

```jpe
Compliment Appearance
  description: "Tell someone they look great"
  type: social
  duration: 10
  tests:
    - actor is not shy
    - actor is not evil
    - target is not angry at actor
  effects:
    - increase friendship +10
    - add positive moodlet
```

### Pattern 2: Skilled Activity

```jpe
Paint Masterpiece
  description: "Create a beautiful painting"
  type: object
  duration: 120
  tests:
    - actor painting skill >= 8
    - actor is not tired
    - has painting supplies
  effects:
    - increase painting skill by 5
    - increase mood by 50
    - create painting worth 1000 simoleons
```

### Pattern 3: Conditional Interaction

```jpe
Ask for Help
  description: "Ask someone to help you"
  type: social
  duration: 15
  tests:
    - actor is sad
    - target is good friend
    - target is in good mood
    - actor does not have pride trait
  effects:
    - increase friendship +15
    - remove sad moodlet
    - add feeling better buff
```

### Pattern 4: Coupled Buffs and Interactions

```jpe
Energized Feeling
  description: "This Sim feels full of energy"
  mood_type: positive
  intensity: 3
  duration: 240
  mood_gain: 20

---

Jump Around Energetically
  description: "Express this energy by jumping around"
  type: autonomous
  duration: 5
  tests:
    - actor has "energized feeling" buff
  effects:
    - increase fun by 30
```

### Pattern 5: Trait System

```jpe
Book Lover
  description: "This Sim loves books and reading"
  category: hobby
  cost: 2
  conflict_traits:
    - hates books
  buffs:
    - happy when reading
  interactions:
    - read book
    - discuss book
    - recommend book
```

---

## Advanced Techniques

### Technique 1: Chained Interactions

Create interactions that lead to other interactions:

```jpe
Ask on Date
  description: "Invite to go on a date"
  type: social
  duration: 20
  tests:
    - actor is romantic with target
    - target is single or in relationship with actor
    - both are adults
  effects:
    - trigger "go on date" interaction
    - increase romance +30

---

Go on Date
  description: "Spend a romantic evening together"
  type: social
  duration: 180
  tests:
    - both Sims are dating
    - both are free for 3 hours
  effects:
    - increase romance +50
    - add "had romantic evening" buff
    - increase both mood by 30
```

### Technique 2: Skill-Based Progression

```jpe
Cooking Level 1
  description: "Learn basic cooking"
  type: object
  tests:
    - actor cooking skill >= 0
    - actor cooking skill < 2
  effects:
    - teach basic recipes
    - increase cooking skill by 1

---

Cooking Level 5
  description: "Master intermediate cooking"
  type: object
  tests:
    - actor cooking skill >= 4
    - actor cooking skill < 7
  effects:
    - teach advanced recipes
    - increase cooking skill by 2
    - unlock "gourmet cooking" interaction

---

Cooking Level 10
  description: "Become a master chef"
  type: object
  tests:
    - actor cooking skill >= 9
  effects:
    - teach master recipes
    - increase cooking skill by 3
    - unlock "legendary dish" interaction
```

### Technique 3: Multi-Condition Testing

```jpe
Perfect Romance Scene
  description: "The ultimate romantic moment"
  type: social
  duration: 60
  tests:
    # Both must be right relationship level
    - actor is romantic with target
    - target is romantic with actor

    # Both must have good moods
    - actor mood >= 50
    - target mood >= 50

    # Must be the right time/place
    - target is at home
    - it is nighttime

    # Both must be ready
    - actor is not tired
    - target is not tired
    - both are not angry

    # Special condition
    - actor has "confident" buff
  effects:
    - increase romance +100
    - add "romantic moment" buff
    - increase mood by 100
    - unlock "propose" interaction
```

### Technique 4: Buff Stacking and Management

```jpe
Minor Scare
  description: "A small fright"
  mood_type: negative
  intensity: 1
  duration: 60
  mood_gain: -5

---

Major Scare
  description: "A big fright"
  mood_type: negative
  intensity: 3
  duration: 180
  mood_gain: -20

---

Terrified
  description: "Extremely scared"
  mood_type: negative
  intensity: 5
  duration: 360
  mood_gain: -50
  # Will stack with other negative buffs

---

Get Reassured
  description: "Someone calms you down"
  type: social
  duration: 15
  tests:
    - actor has any scare buff
    - target is close friend
  effects:
    - remove all scare buffs
    - add comforted buff
```

### Technique 5: Object-Based Systems

```jpe
Video Game System
  description: "Play video games"
  type: object
  duration: 90
  tests:
    - has video game console
    - actor is not tired
    - actor is home
  effects:
    - increase video game skill by 2
    - increase mood by 40
    - increase fun by 50
    - can trigger "get addicted" buff

---

Gaming Addiction
  description: "Can't stop playing"
  mood_type: negative
  intensity: 3
  duration: 480
  buffs_triggered:
    - loss of productivity
    - reduced school/work performance
  effects:
    - decrease other activity enjoyment
    - increase video game autonomy
```

---

## Troubleshooting

### Common Errors and Fixes

#### Error: "Unknown property: xyz"

**Problem**: You used a property name that JPE doesn't recognize.

**Solution**: Check the property spelling and capitalization. JPE is case-sensitive!

```jpe
# ❌ WRONG
My Interaction
  Descripton: "Typo in property name"  # "Descripton" not "description"

# ✅ RIGHT
My Interaction
  description: "Fixed!"
```

#### Error: "Invalid indentation"

**Problem**: Your indentation doesn't match the rules.

**Solution**: Use exactly 2 spaces per indent level.

```jpe
# ❌ WRONG - Mixed spaces and tabs
Interaction
    description: "Too many spaces"  # Uses 4 spaces
  property: value  # Goes back to 2

# ✅ RIGHT - Consistent 2-space indentation
Interaction
  description: "Correct indentation"
  property: value
```

#### Error: "Tests not recognized"

**Problem**: Test format is wrong.

**Solution**: Tests must be a list (start with `-`) or inline list:

```jpe
# ❌ WRONG
My Interaction
  tests: actor is adult

# ✅ RIGHT - As a list
My Interaction
  tests:
    - actor is adult
    - actor is not child

# ✅ RIGHT - As inline list
My Interaction
  tests: [actor is adult, actor is not child]
```

#### Error: "Buff not found"

**Problem**: You referenced a buff that doesn't exist in your file.

**Solution**: Make sure the buff is defined before you use it:

```jpe
# ❌ WRONG - Using buff before defining it
Happy Interaction
  effects:
    - add "feeling wonderful" buff

Feeling Wonderful  # Buff defined after use
  mood_type: positive

# ✅ RIGHT - Define buff first
Feeling Wonderful
  mood_type: positive
  duration: 240

---

Happy Interaction
  effects:
    - add "feeling wonderful" buff
```

#### Error: "Invalid effect syntax"

**Problem**: Effect format is incorrect.

**Solution**: Effects must follow these patterns:

```jpe
# ✅ Correct effect formats
effects:
  - increase cooking skill by 2      # [action] [target] [amount]
  - add happy moodlet                # [action] [target]
  - increase friendship +20          # [action] [target] [sign][amount]
  - trigger "other interaction"      # [action] [quoted name]
```

### Debugging Tips

#### Tip 1: Use Comments to Section Your Code

```jpe
# INTERACTIONS
# ============

Greeting Interaction
  description: "Say hello"

# BUFFS
# =====

Happy Buff
  mood_type: positive
```

#### Tip 2: Validate as You Write

In JPE Studio:
- Use **Build** → **Validate** frequently
- Watch the error panel for issues
- Fix problems immediately

#### Tip 3: Test One Thing at a Time

Don't write 50 interactions then build. Instead:
1. Write 1 interaction
2. Build and validate
3. Test in-game
4. Fix any issues
5. Add next interaction

#### Tip 4: Use Simple Names

```jpe
# ❌ TOO COMPLEX
This Is A Very Long Interaction That Does Many Things

# ✅ BETTER
Complex Action
  description: "This is a very long interaction that does many things"
```

---

## Tips & Tricks

### Tip 1: Naming Conventions

Use consistent naming for easier reading:

```jpe
# Interactions: [Verb] [Noun]
- Greet Sim
- Cook Meal
- Learn Skill

# Buffs: [Adjective] [Noun]
- Happy Feeling
- Tired Exhaustion
- Romantic Excitement

# Traits: [Trait Description]
- Loves Animals
- Hates Water
- Good Listener
```

### Tip 2: Reusable Buff Groups

Define common buff combinations:

```jpe
Excellent Feeling
  mood_type: positive
  intensity: 4
  duration: 480

---

Great Day
  description: "Combination of multiple positive feelings"
  buffs:
    - add excellent feeling
    - add productive feeling
    - add lucky feeling
  effects:
    - increase mood by 100
```

### Tip 3: Skill Level Gating

Unlock features based on skill:

```jpe
Cook Simple Meal
  type: object
  tests:
    - actor cooking skill >= 1
    - actor cooking skill < 5

---

Cook Elaborate Meal
  type: object
  tests:
    - actor cooking skill >= 5
    - actor cooking skill < 8

---

Cook Legendary Dish
  type: object
  tests:
    - actor cooking skill >= 8
```

### Tip 4: Relationship-Based Access

Gate interactions by relationship:

```jpe
Casual Greeting
  tests:
    - actor and target are acquainted

---

Friendly Chat
  tests:
    - actor and target are friends

---

Romantic Kiss
  tests:
    - actor is romantic with target
```

### Tip 5: Environmental Conditions

Check surroundings:

```jpe
Beach Swim
  tests:
    - actor is at beach
    - actor is not tired
    - it is daytime

---

Pool Party
  tests:
    - actor is at home
    - actor has pool
    - actor has friends over
    - it is nighttime
```

### Tip 6: Version Comments

Document changes:

```jpe
# v1.0 - Initial release
# v1.1 - Added romantic greeting interaction
# v1.2 - Fixed friendship buff duration
# v1.3 - Added skill progression system

Greeting
  description: "Simple hello"
```

### Tip 7: Testing Framework

Create test interactions to validate:

```jpe
# TEST INTERACTIONS - Remove before release!

Test Buff Addition
  description: "Verify buffs work"
  effects:
    - add test buff

---

Test Skill Increase
  description: "Verify skills work"
  effects:
    - increase cooking skill by 5

---

Test Friendship
  description: "Verify relationships"
  effects:
    - increase friendship +50
```

### Tip 8: Documentation in Files

Add helpful comments:

```jpe
# Friendly Greetings Pack
# =======================
# These interactions let Sims greet each other based on relationship level.
# Compatible with: Get Together, City Living
# Requires: Base game
#
# Features:
# - Casual greetings (strangers)
# - Friendly greetings (friends)
# - Romantic greetings (partners)
# - Special greetings (best friends)

Casual Wave
  description: "Give a polite wave to a stranger"
  type: social
```

---

## Best Practices

### ✅ DO:

- ✅ Use descriptive names for interactions
- ✅ Add detailed descriptions to buffs
- ✅ Comment your code frequently
- ✅ Test in-game regularly
- ✅ Use consistent indentation
- ✅ Validate before building
- ✅ Start with simple interactions
- ✅ Document your changes

### ❌ DON'T:

- ❌ Use spaces in element names (use "My Name" as description instead)
- ❌ Mix indentation styles
- ❌ Create interactions without tests
- ❌ Ignore validation errors
- ❌ Write 100 things before testing
- ❌ Copy-paste without understanding
- ❌ Forget to save your file
- ❌ Release without in-game testing

---

## Quick Reference Card

### File Structure Template

```jpe
# File: my_mod.jpe
# Description: What this mod does
# Version: 1.0.0
# Author: Your Name

# BUFFS
# =====

Buff Name
  description: "What it does"
  mood_type: positive
  intensity: 2
  duration: 240
  mood_gain: 15

# INTERACTIONS
# ============

Interaction Name
  description: "What it does"
  type: social
  duration: 20
  tests:
    - actor is adult
  effects:
    - add "buff name" buff

# TRAITS
# ======

Trait Name
  description: "What it means"
  category: hobby
  conflict_traits: []
  interactions:
    - interaction name
```

### Common Commands Quick List

| Task | How |
|------|-----|
| Create interaction | `Interaction Name` then indent properties |
| Add test | `tests:` then `- test condition` |
| Add effect | `effects:` then `- effect action` |
| Create buff | `Buff Name` with buff properties |
| Create trait | `Trait Name` with trait properties |
| Add comment | Start line with `#` |
| Format list | Indent with `-` for each item |
| Validate | Build → Validate in Studio |
| Export | File → Export to Mods Folder |

---

## Resources

### Learn More

- **Quick Start Guide** - `JPE_QUICK_START.md`
- **Template Pack** - Browse `templates/` folder
- **Video Tutorials** - Coming soon!
- **Community Forums** - GitHub Discussions

### Getting Help

1. Check the **Troubleshooting** section above
2. Review **Template Pack** for examples
3. Search **Community Forums**
4. Ask on **GitHub Issues**
5. Check **API Reference** for property names

### Template Categories

Available templates:
- 🎭 Interactions (social, object, autonomous)
- 😊 Buffs (positive, negative, special)
- 🎯 Traits (hobbies, personalities, quirks)
- 💼 Skill Systems
- 💘 Relationship Systems
- 🏠 Home & Family
- 👥 Social Systems
- 🎮 Entertainment

---

## Glossary

| Term | Definition |
|------|-----------|
| **Interaction** | An action a Sim can perform |
| **Buff/Moodlet** | Temporary effect on a Sim |
| **Trait** | Permanent characteristic of a Sim |
| **Test** | Condition that must be true |
| **Effect** | Outcome when interaction completes |
| **Autonomy** | When Sims do things without player control |
| **JPE** | Just Plain English (this language!) |
| **Indentation** | Spaces showing structure/hierarchy |
| **Property** | Setting/attribute of an element |
| **Value** | What a property is set to |

---

## Final Notes

### You're Ready!

You now know:
✅ What JPE is and why it's awesome
✅ How to install and get started
✅ Complete syntax and all data types
✅ Core concepts (interactions, buffs, traits)
✅ Common patterns you'll use frequently
✅ Advanced techniques for complex mods
✅ How to debug and fix problems
✅ Best practices and tips

### Next Steps

1. **Open JPE Studio**
2. **Create a new file**
3. **Copy a template** from the pack
4. **Customize it** for your needs
5. **Build and validate**
6. **Test in-game**
7. **Share with community!**

### Keep Learning

- Experiment with different interactions
- Read other people's templates
- Try advanced patterns gradually
- Ask questions in the community
- Share what you learn!

---

**This Master Bible is your complete reference. Bookmark it, share it, and come back to it whenever you need help!**

Happy modding! 🎮✨

---

**Version**: 1.0.0
**Status**: Complete
**Last Updated**: December 2024
**Created with**: Claude Code + Community Love ❤️

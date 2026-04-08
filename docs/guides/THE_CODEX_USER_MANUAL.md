# 📚 **THE CODEX - Complete User Manual**

## **Table of Contents**
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Understanding JPE Syntax](#understanding-jpe-syntax)
4. [Creating Your First Mod](#creating-your-first-mod)
5. [Advanced Features](#advanced-features)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)

---

## **Introduction** <a name="introduction"></a>

### Welcome to JPE Sims 4 Modding!

The JPE (Just Plain English) Sims 4 Mod Translator is a revolutionary tool that makes creating The Sims 4 mods accessible to everyone, regardless of coding experience. Instead of wrestling with complex XML syntax, you can create Sims 4 mods using simple, readable English-like statements.

### What Makes JPE Special?
- **Readable Syntax**: Write code like you're writing instructions for a friend
- **Beginner-Friendly**: No prior coding experience required
- **Powerful Features**: Full access to all Sims 4 modding capabilities
- **Real-Time Validation**: Immediate feedback on errors and suggestions
- **Interactive Learning**: Built-in tutorial system (The Codex) to guide you

---

## **Getting Started** <a name="getting-started"></a>

### Installation
1. Make sure you have Python 3.11 or higher installed
2. Download the JPE Sims 4 Mod Translator package
3. Run the installer or extract the files to your preferred location
4. Launch the Desktop Studio application

### First Launch
When you first open the application, you'll see the main interface divided into several tabs:

- **Project Explorer**: Browse and manage your projects
- **Editor**: Where you write your JPE code
- **Build**: Compile and validate your projects
- **Reports**: View build results and error details
- **Documentation**: Access tutorials and help
- **Settings**: Customize the application appearance

### Creating Your First Project
1. Go to the **Project Explorer** tab
2. Click **"New Project"** from the toolbar
3. Select a directory for your project
4. Give your project a name
5. The application will create the necessary folder structure

Your project will contain:
- `src/` - Where you'll write your mod files
- `config/` - Project configuration and settings
- `build/` - Where compiled mods appear
- `docs/` - Documentation and tutorials

---

## **Understanding JPE Syntax** <a name="understanding-jpe-syntax"></a>

### Basic Structure
JPE files follow a simple pattern:

```
[SECTION TYPE]
property: value
another_property: another value
more_properties: value1, value2, value3
end
```

### Example: Simple Interaction
```
[Interactions]
id: wave_hello
display_name: Wave Hello
description: A friendly wave to greet others
participant: role:Actor, description:The person waving
participant: role:Target, description:The person being waved at
end
```

### Key Principles
1. **Square brackets** define sections
2. **Colons** separate properties from their values
3. **Commas** separate multiple values in a property
4. **end** closes a section
5. **Ids** should be unique and use underscores instead of spaces

---

## **Creating Your First Mod** <a name="creating-your-first-mod"></a>

### Step 1: Project Setup
Create a new project and open the `src/interactions.jpe` file.

### Step 2: Define an Interaction
Add this to your `interactions.jpe` file:

```
[Interactions]
id: offer_drink
display_name: Offer Drink
description: Offer a refreshing drink to a friend
participant: role:Actor, description:The person offering the drink
participant: role:Target, description:The friend receiving the drink
end
```

### Step 3: Define a Buff
Create or open `src/buffs.jpe` and add:

```
[Buffs]
id: refreshed_feeling
display_name: Refreshed Feeling
description: Feeling refreshed after enjoying a cool drink
duration: 30
end
```

### Step 4: Define a String
Create or open `src/strings.jpe` and add:

```
[Strings]
key: offer_drink_name
text: Offer Drink
locale: en_US
end

[Strings]
key: offer_drink_description
text: Offer a refreshing drink to a friend
locale: en_US
end
```

### Step 5: Build Your Project
1. Go to the **Build** tab
2. Click "Build Project"
3. Check the output for any errors
4. If successful, find your mod in the `build/` directory

---

## **Advanced Features** <a name="advanced-features"></a>

### Enums (Choice Lists)
```
[Enums]
id: drink_types
option: coffee:1
option: tea:2
option: juice:3
option: water:4
end
```

### Traits (Personality Characteristics)
```
[Traits]
id: tea_lover
display_name: Tea Lover
description: Enjoys drinking tea and often prepares it
end
```

### Complex Properties
Many elements can have complex properties with multiple options:

```
[Interactions]
id: prepare_hot_beverage
display_name: Prepare Hot Beverage
description: Make a warm drink for yourself or others
participant: role:Actor, description:The person preparing the drink
participant: role:Target, description:The person receiving the drink
tests: 
  - test: actor.has_skill:cooking >= 3
  - test: actor.has_object:teapot
effects: 
  - apply_buff: refreshed_feeling
  - increase_statistic: fun:5
end
```

---

## **Troubleshooting** <a name="troubleshooting"></a>

### Common Issues and Solutions

**Issue**: "Build failed: Missing 'end' statement"
- **Solution**: Make sure every section ends with `end`

**Issue**: "ID already exists"
- **Solution**: Check all your files for duplicate IDs and make each unique

**Issue**: "File not found" when building
- **Solution**: Make sure all required files are in the right folders

**Issue**: "Syntax error on line X"
- **Solution**: Check that line has proper formatting (colons, commas, etc.)

### Getting Help
1. Use the **Documentation** tab and **The Codex** tutorial system
2. Check the **Reports** tab for detailed error messages
3. Visit our community forums for additional support

---

## **Best Practices** <a name="best-practices"></a>

### 1. Use Descriptive IDs
- Good: `greet_neighbor_politely`
- Bad: `int1`, `interaction_123`

### 2. Organize Your Files
- Keep related elements in the same file when possible
- Use clear naming conventions
- Document complex elements with comments

### 3. Test Frequently
- Build your project regularly to catch errors early
- Validate before making complex changes
- Keep backups of working versions

### 4. Make Small Changes
- Add one new feature at a time
- Test after each change
- Build incrementally toward larger goals

### 5. Use The Codex
- Complete the tutorials to understand concepts
- Reference the documentation when stuck
- Practice with examples before creating complex mods

---

## **Next Steps**

Now that you understand the basics:
1. **Experiment**: Try creating simple interactions
2. **Learn**: Work through all of The Codex tutorial sections
3. **Expand**: Add more complex elements like traits and effects
4. **Share**: Join the community and share your creations
5. **Grow**: Create increasingly sophisticated mods

Remember: Every expert started as a beginner. Take your time, experiment safely, and enjoy the creative process!

---

## **Glossary**

- **JPE**: Just Plain English - the simplified modding language
- **Id**: Internal identifier for game elements
- **Display Name**: What players see in the game
- **Participant**: A Sim involved in an interaction (Actor, Target, etc.)
- **Buff**: Temporary moodlet that changes how a Sim feels
- **Trait**: Permanent personality characteristic
- **Enum**: A list of possible values for a choice
- **String**: Text that appears in the game
- **Section**: A group of related elements in JPE files

---

*The Codex is updated regularly with new content. Check for updates to stay current with the latest features and best practices.*
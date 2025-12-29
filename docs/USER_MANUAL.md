# 📚 JPE Studio Complete User Manual

**Your Friendly Guide to Translating Sims 4 Mods**

> "Translating mods has never been easier! This manual covers everything from 'Help, I'm brand new!' to 'I want to translate mods professionally.' You've got this! 🚀"

---

## 📖 Table of Contents

1. [Quick Overview](#quick-overview)
2. [Installation & Setup](#installation--setup)
3. [Getting Started (Your First Mod)](#getting-started-your-first-mod)
4. [The Main Workspace](#the-main-workspace)
5. [Basic Translation Workflow](#basic-translation-workflow)
6. [Core Features Explained](#core-features-explained)
7. [Advanced Features](#advanced-features)
8. [Team Collaboration](#team-collaboration)
9. [Troubleshooting](#troubleshooting)
10. [FAQ](#faq)
11. [Reference Guide](#reference-guide)

---

## Quick Overview

### What Is JPE Studio?

JPE Studio is software that helps you **translate Sims 4 mods into different languages**. Instead of manually editing mod files (which is technical and error-prone), JPE does the heavy lifting for you.

**Here's the simple version:**

```
📁 Your Mod (English)
      ↓
🔍 JPE: "Here's all the text that needs translating"
      ↓
✏️ You: "Here are the French translations"
      ↓
🔨 JPE: "Done! Here's your translated mod"
      ↓
📦 Translated Mod (French) - Ready to share!
```

### Who Should Use JPE Studio?

✅ **Mod creators** wanting players worldwide to enjoy their work
✅ **Translators** helping mods reach new languages
✅ **Translation teams** working together on projects
✅ **Anyone** who wants to translate a Sims 4 mod (no coding knowledge needed!)

### What JPE Studio Does

| Task | What JPE Does |
|------|---------------|
| **Scan** | Looks at your mod and identifies all text that can be translated |
| **Extract** | Pulls out all the translatable segments (dialogue, menus, descriptions) |
| **Suggest** | Offers AI-powered translation suggestions (optional - you can turn this off) |
| **Translate** | Lets you enter translations in a user-friendly editor |
| **Validate** | Checks that everything is correct before building |
| **Build** | Reconstructs your mod with the new translations included |
| **Export** | Saves your translated mod as a folder or ZIP file |

---

## Installation & Setup

### Step 1: Install Python (Only Once!)

JPE Studio needs Python installed on your computer. Don't worry—this is a one-time setup!

**What is Python?** Think of it like a "language" that computers understand. JPE is written in Python, so your computer needs to know how to read it.

#### Windows:

1. Open your web browser
2. Go to: **https://www.python.org/downloads/**
3. Click the big "Download Python 3.11" button (or newer)
4. Run the installer that downloads
5. ⚠️ **IMPORTANT:** Check the box that says "Add Python to PATH" (before clicking Install!)
6. Click "Install Now"
7. Wait for it to finish (it'll say "Setup was successful")

**How to know it worked:**
- Press `Windows key + R`
- Type: `cmd` and press Enter
- Type: `python --version` and press Enter
- You should see something like: `Python 3.11.0`

✅ **Success!** You're ready for the next step.

#### Mac:

1. Open Terminal (Applications → Utilities → Terminal)
2. Type: `python3 --version` and press Enter
3. If you see a version number, Python is already installed!
4. If not, go to https://www.python.org/downloads/ and follow the installer

#### Linux:

Python usually comes with Linux! Open Terminal and type:
```bash
python3 --version
```

### Step 2: Install JPE Studio

Now for the easy part!

1. **Open Command Prompt** (Windows) or **Terminal** (Mac/Linux)
   - Windows: Press `Windows key + R`, type `cmd`, press Enter
   - Mac/Linux: Open the Terminal app

2. **Type this command:**
   ```bash
   pip install jpe-sims4-studio
   ```

3. **Press Enter and wait**
   - You'll see lots of text scrolling (this is normal!)
   - It should end with: `Successfully installed jpe-sims4-studio`

✅ **Success!** JPE Studio is installed!

### Step 3: Launch JPE Studio

**Windows:**
1. Press `Windows key`
2. Type: `jpe-studio`
3. Press Enter

**Mac/Linux:**
1. Open Terminal
2. Type: `jpe-studio`
3. Press Enter

A beautiful window should open! Welcome to JPE Studio! 🎉

### First Time Setup

When JPE opens for the first time:

1. You'll see a welcome screen
2. Choose your language (English is default)
3. Choose your theme (Light or Dark - you can change this later!)
4. Click "Get Started"

✅ **You're in!** You can start your first translation project.

---

## Getting Started (Your First Mod)

### What You'll Need

- A Sims 4 mod folder OR a ZIP file containing a mod
- 5-10 minutes of your time
- Zero coding knowledge required! 😊

### Tutorial: Translate Your First Mod

Let's walk through a complete translation from start to finish.

#### Step 1: Load Your Mod (2 minutes)

1. **Open JPE Studio** (you already installed it!)

2. **Click the "New Project" button** (big purple button on Dashboard)
   - This opens a file picker window

3. **Find your mod folder**
   - Navigate to where your Sims 4 mods are stored
   - Select the mod folder (NOT a file inside it)
   - Click "Open"

**What JPE is doing right now:**
- Reading your mod folder
- Identifying all the files
- Checking for translatable content
- Creating a project file

**You'll see:**
- "Scanning mod..." message at bottom
- Progress bar filling up
- Once done: "Scan complete!"

**✅ Success!** Your mod is loaded.

**Alternative: Load a ZIP file**
- Click "New Project"
- Select a `.zip` file instead of a folder
- Click "Open"
- JPE handles the rest!

---

#### Step 2: View Extracted Segments (3 minutes)

1. **Click the "Projects" tab** on the left sidebar

2. **Look for your mod in the list**
   - You'll see the mod name and a folder icon
   - Next to it: a number showing how many translatable segments were found
   - Example: "My Awesome Mod (87 segments)"

3. **Click on your mod** to open it

4. **You'll see the "Translate" tab light up**
   - This shows all the text JPE found

**What you're seeing:**

| Column | Meaning |
|--------|---------|
| **Segment ID** | Unique number for this piece of text |
| **Source Text** | The original text (in English) |
| **Status** | Is this translated? Is it complete? |
| **Translation** | Your translations go here |

**Example:**

```
ID: 001
Source: "Welcome to my mod!"
Status: Empty (needs translation)
Translation: [empty - you'll fill this in]

ID: 002
Source: "Click here to continue"
Status: Empty (needs translation)
Translation: [empty - you'll fill this in]
```

**✅ Success!** You can see all the text that needs translating.

---

#### Step 3: Start Translating (5 minutes)

Now for the fun part!

1. **Click the first segment** in the list
   - It highlights in blue

2. **Look at the right side of the screen**
   - You'll see the Source text (in English)
   - Below it: an empty Translation box

3. **Click in the Translation box** and type your translation
   - Example: If the source says "Welcome!", type your translation
   - For Spanish: "¡Bienvenido!"
   - For French: "Bienvenue!"

4. **Press Tab or Enter** to move to the next segment

5. **Repeat for a few more segments**
   - Don't need to translate them all right now!
   - You're just practicing

**Using AI Suggestions (Optional):**

If AI is enabled:
- You'll see a lightbulb icon ✨
- Click it for an AI-powered translation suggestion
- Edit it if needed
- Press Tab to move to next

**✅ Excellent!** You've started translating! 🎉

---

#### Step 4: Save Your Progress (1 minute)

1. **Press `Ctrl + S`** (keyboard shortcut)
   - Or click "File" → "Save"

2. **You'll see a notification:** "Project saved!"
   - JPE auto-saves every minute too!

3. **Your translations are safe** even if you close JPE

**✅ Success!** Your work is saved.

---

#### Step 5: Build Your Translated Mod (2 minutes)

Once you've translated enough segments (or all of them!), let's create the translated mod:

1. **Click the "Build" tab** on the left sidebar

2. **Click "Build Now"** (big purple button)
   - JPE checks everything
   - Reconstructs your mod with translations
   - Takes 10-30 seconds usually

3. **You'll see:** "Build complete!"
   - A new folder appears with your translated mod
   - JPE shows you where it saved it

4. **Click "Open Folder"** to see your translated mod
   - You can now use this mod in Sims 4!

**What JPE just did:**
- Took your original mod files
- Replaced English text with your translations
- Kept everything else exactly the same
- Made sure nothing broke
- Gave you a ready-to-use mod

**✅ Congratulations!** You've created your first translated mod! 🎊

---

## The Main Workspace

### The Interface Explained

JPE Studio has a specific layout. Let's break it down:

```
┌─────────────────────────────────────────────────────┐
│ JPE Studio    [Home] [File] [Edit] [View]           │
├──────────────┬──────────────────────────────────────┤
│              │                                      │
│  SIDEBAR     │      MAIN WORKSPACE                  │
│              │      (Changes based on what          │
│  • Dashboard │       you're doing)                  │
│  • Projects  │                                      │
│  • Translate │                                      │
│  • Issues    │                                      │
│  • Build     │                                      │
│  • Plugins   │                                      │
│  • Docs      │                                      │
│  • Settings  │                                      │
│              │                                      │
└──────────────┴──────────────────────────────────────┘
```

### The Sidebar (Left)

**What it does:** Navigation menu. Click any option to switch to that view.

| Icon | Name | What It Does |
|------|------|-------------|
| 🏠 | **Dashboard** | Home screen with quick actions |
| 📂 | **Projects** | See all your translation projects |
| ✏️ | **Translate** | The editing workspace (where magic happens!) |
| ⚠️ | **Issues** | Problem detector (finds errors and warnings) |
| 🔨 | **Build** | Create translated mods |
| 🧩 | **Plugins** | Add extra features |
| 📖 | **Docs** | Help and guides |
| ⚙️ | **Settings** | Customize JPE to your liking |

### The Main Area (Right)

**What it does:** Changes based on what you're doing.

**Dashboard View:**
- Quick action buttons (New Project, Open, Import)
- Recent projects list
- Quick stats (total translations, projects, etc.)

**Projects View:**
- List of all your projects
- Shows progress for each project
- Double-click to open a project

**Translate View:**
- The actual translation editor
- Left side: List of segments
- Right side: Translation workspace
- Bottom: Status bar

**Issues View:**
- Shows any problems JPE found
- Organized by severity
- Click an issue to see details

**Build View:**
- Shows build history
- "Build Now" button
- Recent builds with timestamps

---

## Basic Translation Workflow

### The 5-Step Process

Every translation project follows these steps:

```
1. LOAD     → Get your mod into JPE
2. REVIEW   → See what needs translating
3. TRANSLATE → Enter your translations
4. VALIDATE → Check for errors
5. BUILD    → Create your translated mod
```

Let's explore each step in detail.

### Step 1: LOAD - Getting Your Mod Ready

**Where to start:** Dashboard → "New Project" button

**What happens:**
1. A file picker opens
2. You select your mod (folder or ZIP)
3. JPE scans it and extracts segments

**How long it takes:** 30 seconds to 2 minutes (depending on mod size)

**What you'll see:**
- "Scanning..." message
- Progress bar
- "Scan complete!" when done

**Possible messages:**

✅ **"Scan complete! 87 segments found"**
- Great! Your mod has translatable content
- You're ready to translate

❌ **"No translatable segments found"**
- Means JPE couldn't find text to translate
- This can happen if:
  - The mod is just code with no text
  - The mod uses a custom format JPE doesn't recognize
  - See [Troubleshooting](#troubleshooting) section

💡 **Pro tip:** If your mod is in a ZIP file and you're not sure where it is, search your computer for `*.zip` to find ZIP files.

---

### Step 2: REVIEW - Understanding Your Content

**Where to find it:** Projects → Click your mod → Translate tab

**What you're seeing:**

A list of every piece of translatable text in your mod, organized like this:

```
Segment ID: 0001
Type: Dialog Text
Source Language: English
Source: "Hello, how are you?"
Location: dialog_001.xml
────────────────────────
Segment ID: 0002
Type: UI Button
Source Language: English
Source: "Continue"
Location: main_menu.json
```

**The information you need to know:**

| Item | Why It Matters |
|------|---|
| **Segment ID** | Unique identifier (helps if you reference it later) |
| **Source Text** | The text you need to translate |
| **Type** | What kind of text (dialogue, button, description) |
| **Location** | Where in your mod this text is |

**Smart Actions:**

- **Search:** Use the search box to find specific text
- **Filter:** Filter by type (dialogue, UI, etc.)
- **Sort:** Click column headers to sort
- **Show Progress:** See how many are translated

**Understanding Status:**

| Status | Meaning | Icon |
|--------|---------|------|
| **Empty** | Not translated yet | ⭕ |
| **In Progress** | Partially translated | 🟡 |
| **Complete** | Fully translated | 🟢 |
| **Flagged** | Needs review | 🚩 |

**Question: "Do I need to translate ALL segments?"**

No! You can translate:
- Just a few segments for testing
- All of them for a complete mod
- Partially for team collaboration
- JPE will note what's translated vs. what's not

---

### Step 3: TRANSLATE - Entering Your Translations

**Where to find it:** Projects → Your mod → Translate tab

**The Translation Editor:**

```
LEFT SIDE (Segment List):      RIGHT SIDE (Translation Area):
┌──────────────────┐           ┌──────────────────────┐
│ 001 | Welcome... │           │ Source: "Welcome"    │
│ 002 | Click here │           │ Translation: [box]   │
│ 003 | Continue   │           │                      │
│ 004 | Exit       │           │ [AI Suggest] [Help]  │
└──────────────────┘           └──────────────────────┘
     Click to select           Type your translation
```

**How to Translate:**

1. **Click a segment** on the left side
   - It highlights in blue

2. **Read the source text** on the right
   - This is what you're translating FROM

3. **Type your translation** in the translation box
   - This is what you're translating TO

4. **Press Tab or Enter** to save and move to next
   - Or click the down arrow to move to next

**Example - Translating to Spanish:**

```
Source (English): "Welcome to my mod!"
Translation (Spanish): "¡Bienvenido a mi mod!"
```

**Tips for Better Translations:**

✅ **DO:**
- Keep translations about the same length as original
- Use natural language (sounds like a person wrote it)
- Test your translation in the game if possible
- Use translation memory (see [Advanced Features](#advanced-features))

❌ **DON'T:**
- Copy-paste the same translation everywhere (varies by context)
- Use overly formal or casual language
- Include special characters unless original had them
- Forget about spaces and punctuation

**Using Translation Memory:**

If you've translated similar text before, JPE remembers it!

- When you select a segment, JPE shows similar matches
- Click a match to use that translation again
- Saves time on repeated phrases

---

### Step 4: VALIDATE - Checking Your Work

**Where to find it:** Translate tab (automatically runs)

**What JPE checks:**

✅ Are all segments translated?
✅ Are translations the right length?
✅ Are there spelling errors?
✅ Do brackets and parentheses match?
✅ Are special characters consistent?

**How to See Issues:**

1. **Click the "Issues" tab** on the left
   - Shows all problems JPE found
   - Color-coded by severity:
     - 🔴 Red = Errors (will break the mod)
     - 🟡 Yellow = Warnings (might cause issues)
     - 🔵 Blue = Info (just letting you know)

2. **Click an issue** to see details
   - Shows which segment has the problem
   - Explains what's wrong
   - Suggests how to fix it

3. **Fix the problem** in the Translate tab
   - The issue disappears automatically

**Common Issues:**

| Issue | What It Means | How to Fix |
|-------|---|---|
| **Missing translation** | A segment is empty | Translate it! |
| **Too long** | Translation is much longer than source | Make it shorter or use abbreviations |
| **Unmatched brackets** | Missing `]` or `]` | Add the missing bracket |
| **Special characters** | Missing expected symbols | Check that you have `!`, `?`, `"` etc. |

---

### Step 5: BUILD - Creating Your Translated Mod

**Where to find it:** Build tab (bottom-left sidebar)

**What happens:**
1. JPE checks everything one final time
2. Takes your original mod files
3. Replaces English text with your translations
4. Creates a new translated mod
5. Saves it to your computer

**How to Build:**

1. **Click the "Build" tab** on the left sidebar

2. **Click "Build Now"** (purple button)
   - JPE starts working
   - You'll see progress bar
   - "Building..." message

3. **Wait for "Build complete!"**
   - Usually takes 10-30 seconds
   - Could take longer for big mods

4. **Click "Open Folder"** to see your result
   - A folder opens showing your translated mod
   - You can copy this to your Sims 4 Mods folder
   - Ready to use!

**Where Is My Translated Mod?**

JPE saves it here by default:
- **Windows:** `C:\Users\[YourName]\JPE_Builds\[ModName]\`
- **Mac:** `~/JPE_Builds/[ModName]/`
- **Linux:** `~/JPE_Builds/[ModName]/`

You can also choose a custom location during build.

**Build Output Formats:**

**Folder (Default):**
- Pros: Easy to look at, can edit files if needed
- Cons: Takes up disk space

**ZIP File:**
- Pros: Smaller file, easier to share
- Cons: Can't easily view/edit files inside

**How to Choose:**
- Just before clicking "Build Now", choose your format
- Most people use ZIP for sharing with others

---

## Core Features Explained

### 1. Search & Filter

**Finding Specific Text:**

**Scenario:** "I need to translate all the menu text, not the dialogue"

1. **Go to Translate tab**
2. **Click "Filter" dropdown**
3. **Select "UI Elements"**
   - Only menu/button text shows now

**Scenario:** "Find all instances of 'Click here'"

1. **Go to Translate tab**
2. **Type "Click here"** in search box
   - List filters to only matching segments

**Scenario:** "Show me only untranslated segments"

1. **Go to Translate tab**
2. **Click "Status" filter**
3. **Select "Empty"**
   - Only untranslated segments show

**Keyboard Shortcut:**
- `Ctrl + F` = Opens search box (from anywhere)

---

### 2. Real-Time Preview

**Want to see how your translation looks?**

1. **Translate tab**
2. **Look for "Preview" button**
3. **Click it**
4. **A preview window opens** showing your translation in context

Example:
```
English: "Click here to continue"
Preview:
  ┌─────────────────────┐
  │ Click here to cont... │ ← your translation
  │      [Button]        │
  └─────────────────────┘
```

**Why use preview?**
- See if your translation fits
- Check how it looks in the actual mod
- Catch text that's too long before build

---

### 3. Translation Memory

**What it is:** JPE remembers all your past translations!

**How it works:**

1. **First time translating:**
   - You translate "Welcome to my mod!" to Spanish
   - JPE saves this

2. **Next time you see similar text:**
   - You translate "Welcome to the store!"
   - JPE suggests your previous translation
   - You can reuse it or modify it

**Why you'll love this:**
- ✅ Consistent translations across projects
- ✅ 3-5x faster after first few segments
- ✅ Never translate the same thing twice!

**How to access:**
1. **Translate tab**
2. **Right-click a segment**
3. **Select "Suggested Translations"**
4. **JPE shows past translations**

**Example:**
```
Your previous translations:
• "Welcome to my mod!" → "Bienvenido a mi mod!"
• "Welcome to the store!" → "Bienvenido a la tienda!"

Both can be reused for similar phrases!
```

---

### 4. AI Assistance (Optional Feature)

**What it is:** An optional AI helper that suggests translations!

**How it works:**

1. **Translate tab**
2. **Look for the ✨ lightbulb icon** next to translation box
3. **Click it**
4. **AI suggests a translation** in 2-3 seconds
5. **Use it, modify it, or ignore it**

**How good are the suggestions?**
- Generally very good (70-80% accuracy)
- Still need to review them
- Better with context and examples
- Improves over time

**Turning AI On/Off:**

1. **Go to Settings tab** (bottom-left)
2. **Look for "AI Assistance" section**
3. **Toggle "Enable AI Suggestions"** on/off
4. **Choose your AI provider** (optional)

**Note:** AI features may require an API key (see Settings)

**When NOT to use AI:**
- For proper nouns (character names, place names)
- For creative or poetic text
- For Simlish or game-specific language
- When you need 100% accuracy

---

### 5. Progress Tracking

**Want to know how much you've translated?**

**Dashboard View:**

Shows at a glance:
- Total projects
- Total segments translated
- Translation percentage
- Current project status

**Project Details:**

1. **Projects tab**
2. **Click your project**
3. **You'll see:**
   - Total segments: 87
   - Translated: 42 (48%)
   - In progress: 10 (11%)
   - Empty: 35 (40%)

**Build History:**

1. **Build tab**
2. **See all your past builds**
3. **Each shows:**
   - Date and time created
   - Number of segments
   - File size
   - Success or errors

---

### 6. File Export & Import

**Exporting Your Work:**

**Scenario:** "I want to send my translations to someone"

1. **Projects tab**
2. **Right-click your project**
3. **Select "Export Project"**
4. **Choose location to save**
5. **JPE creates a .jpe file** (your project backup)

**You can then:**
- Email it to collaborators
- Back it up to cloud storage
- Share with your team

**Importing Someone Else's Translations:**

1. **Projects tab**
2. **Click "Import Project"**
3. **Select a .jpe file**
4. **JPE merges their translations** with yours!

**Exporting Translations to CSV:**

**Scenario:** "I want to edit translations in Excel"

1. **Projects tab**
2. **Right-click project**
3. **Select "Export to CSV"**
4. **A CSV file opens** (spreadsheet format)
5. **Edit in Excel, Google Sheets, etc.**
6. **Import back into JPE** (Project → Import)

---

## Advanced Features

### 1. Team Collaboration

**Working With Other Translators:**

Scenario: You're translating to Spanish with help from your friend.

**Option 1: Divide by Language**
```
You: Translate to Spanish
Friend: Translate to French

Then: Combine translations
```

**Option 2: Divide by Task**
```
You: Translate dialogue (characters speaking)
Friend: Translate UI (buttons, menus)

Then: Merge and build together
```

**How to collaborate:**

1. **One person** scans and extracts (creates initial project)

2. **Export the project file:**
   - Projects tab → Right-click → Export Project
   - Send the .jpe file to your team

3. **Each person translates their part:**
   - Open the .jpe file
   - Work on assigned segments
   - Save locally

4. **Merge translations:**
   - Main person opens original project
   - Import each person's translations
   - JPE combines them automatically!

5. **Build the final mod:**
   - Build tab → Build Now
   - Final translated mod is created

**Best Practices for Teams:**

✅ **DO:**
- Assign segments by type (dialogue, UI, etc.)
- Use shared glossary (see next section)
- Regular check-ins on progress
- Test build after each milestone

❌ **DON'T:**
- Have same person translate same segments
- Translate without checking glossary first
- Merge conflicting translations without review
- Skip final validation before build

---

### 2. Glossary Management

**What it is:** A shared list of terms and how to translate them.

**Why you need it:**
- Keep character names consistent
- Avoid different translations for same word
- Maintain professional terminology
- Speed up translation team workflow

**Example Glossary:**

| English | Spanish | Notes |
|---------|---------|-------|
| **Skill** | Habilidad | Game term, don't translate literally |
| **Moodlet** | Estado de ánimo | Sims 4 specific term |
| **Aspiration** | Aspiración | Keep formal |
| **Playstyle** | Estilo de juego | Important gameplay term |
| **MC Command Center** | MC Command Center | Never translate (mod name) |

**Creating a Glossary:**

1. **Settings tab** → **Glossary**
2. **Click "New Glossary"**
3. **Enter glossary name** (e.g., "Spanish Game Terms")
4. **Add entries:**
   - English term
   - Translated term
   - Notes (optional)
5. **Save**

**Using Your Glossary:**

1. **Translate tab**
2. **Start translating**
3. **JPE checks glossary** automatically
4. **If term matches glossary:**
   - JPE suggests the correct translation
   - You can use it with one click

**Sharing Glossary With Team:**

1. **Settings → Glossary**
2. **Right-click glossary**
3. **Select "Export"**
4. **Send the file to team members**
5. **They can import it:**
   - Settings → Glossary → Import

---

### 3. Project Snapshots & Backups

**What it is:** Saving different versions of your project at different points.

**Why you need it:**
- Go back if you make a mistake
- Save milestones (50% done, 100% done, etc.)
- Compare versions
- Recover lost work

**Creating a Snapshot:**

1. **Projects tab**
2. **Right-click project**
3. **Select "Create Snapshot"**
4. **Give it a name** (e.g., "50% translated")
5. **JPE saves this version**

**Viewing Snapshots:**

1. **Projects tab**
2. **Click project**
3. **Click "Snapshots" button**
4. **You see all saved versions:**
   - Date created
   - Name you gave it
   - Number of translations

**Restoring a Snapshot:**

1. **Snapshots view**
2. **Click snapshot you want**
3. **Click "Restore"**
4. **JPE warns you** (this overwrites current)
5. **Click "Yes, restore"**
6. **You're back to that version!**

---

### 4. Multi-Language Projects

**What it is:** Translating one mod to many languages in JPE!

**Scenario:** "I want to translate to Spanish AND French"

**Method 1: Create Separate Projects**
```
Project 1: My Mod → Spanish
Project 2: My Mod → French
Project 3: My Mod → German

Then build each separately
```

**Method 2: Multi-Language Mode (Advanced)**

1. **Projects tab**
2. **Right-click project**
3. **Select "Add Language"**
4. **Choose target language** (French, Spanish, etc.)
5. **JPE creates translation columns:**
   ```
   Segment | Source | Spanish | French | German
   001     | Hello  | Hola    | Bonjour | Hallo
   ```

**Tips for Multi-Language:**
- Translate one language at a time
- Use AI suggestions (faster for multiple languages)
- Team: Assign one language per person
- Build separate mods for each language

---

### 5. Validation Presets

**What it is:** Automatic checking rules for common problems.

**Built-in Presets:**
- **Strict** - Catches everything (slow but thorough)
- **Balanced** - Standard checks (recommended)
- **Quick** - Just the big issues (fast)

**How to use:**

1. **Translate tab**
2. **Click "Validation Settings"** (gear icon)
3. **Choose a preset**
4. **JPE automatically checks**

**Creating Custom Rules:**

Advanced feature! If you want specific checks:

1. **Settings → Validation**
2. **Click "Create Rule"**
3. **Define your rule** (e.g., "No brackets allowed")
4. **Save**
5. **JPE checks against your custom rules**

---

### 6. Build History & Rollback

**Viewing Build History:**

1. **Build tab**
2. **Scroll down**
3. **You see all past builds:**
   - Date and time
   - Number of segments
   - File location
   - Success/errors

**Reverting to Previous Build:**

1. **Build tab**
2. **Find previous build** you want to use
3. **Click "Use This Build"**
4. **JPE restores that version**

**Building Different Formats:**

Before clicking "Build Now":

```
Output Format:
○ Folder (default)
○ ZIP Archive
○ ZIP + Folder
```

**Choice depends on:**
- **Folder** - For testing and editing
- **ZIP** - For sharing/distribution
- **Both** - Get both versions

---

## Team Collaboration

### Real-World Team Scenarios

#### Scenario 1: Small Team (2-3 people)

**Setup:**
- Person A: Project lead (extracts, coordinates, builds)
- Person B: Translates dialogue
- Person C: Translates UI

**Workflow:**

```
Week 1:
  A: Scans mod, exports project file
  A: Sends file to B and C
  B & C: Translate assigned segments

Week 2:
  B & C: Send finished translations to A
  A: Imports both translations
  A: Checks for conflicts
  A: Builds final mod

Result: Complete translated mod!
```

#### Scenario 2: Large Team (10+ people)

**Setup:**
- Project Manager: Overall coordination
- Lead Translators: Each handles one language
- Team Members: Translate specific segments
- QA Person: Validates everything

**Advanced Workflow:**

```
1. PM: Creates master glossary
2. PM: Sends to all team members
3. PM: Divides mod into sections
4. Each section goes to a team member
5. Team translates their section
6. Lead Translator reviews quality
7. All sections submitted to PM
8. PM merges everything
9. QA tests for errors
10. Build final translated mod
```

### Communication Tips

📧 **Use a shared space:**
- Discord server for team
- Slack channel
- Email thread
- Google Drive shared folder

📝 **Document important info:**
- Glossary of terms
- Style guide for translations
- Character names and pronunciations
- Special instructions

✅ **Check in regularly:**
- Daily or weekly updates
- Share progress percentage
- Report blockers immediately
- Celebrate milestones!

---

## Troubleshooting

### Installation Issues

**Problem: "Python is not recognized" when I type python in Command Prompt**

❌ **What went wrong:**
- Python installed but not added to PATH
- PATH is like a "shortcut list" for Windows

✅ **How to fix:**
1. Reinstall Python
2. **IMPORTANT:** Check "Add Python to PATH" during install
3. Restart Command Prompt
4. Try `python --version` again

---

**Problem: "pip: command not found"**

❌ **What went wrong:**
- Python is installed but pip (package installer) isn't working

✅ **How to fix:**
- Try: `python -m pip install jpe-sims4-studio` instead
- If still doesn't work, reinstall Python with PATH checked

---

### Loading Mod Issues

**Problem: "No translatable segments found"**

❌ **What it means:**
- JPE looked but couldn't find text to translate

✅ **How to fix:**
1. Make sure you selected the actual MOD folder (not a parent folder)
2. Check that mod has text files (XML, JSON, etc.)
3. Try a different mod (test if JPE works at all)
4. See [Advanced Troubleshooting](#advanced-troubleshooting)

---

**Problem: "File is too large" or "ZIP is too large"**

❌ **What went wrong:**
- Your mod or ZIP is extremely large
- JPE has size limits for safety

✅ **How to fix:**
1. Use File → Preferences → Advanced
2. Increase size limits (if you know what you're doing)
3. Or, split your mod into smaller pieces

---

**Problem: "This mod isn't supported"**

❌ **What it means:**
- JPE doesn't recognize the file format
- Custom file types need custom plugins

✅ **How to fix:**
1. Contact JPE support with mod details
2. They may create a plugin for you
3. Or, see [Plugin Development](#plugin-development) to write custom support

---

### Translation Issues

**Problem: "My translation is too long and doesn't fit"**

❌ **What went wrong:**
- Your translated text is longer than original
- UI has limited space for text

✅ **How to fix:**
- Use abbreviations: "Continue" → "Cont."
- Use shorter words
- Split long text into multiple lines
- Check [Real-Time Preview](#1-search--filter) to see how it looks

---

**Problem: "Special characters are showing as ?????"**

❌ **What went wrong:**
- Character encoding mismatch
- Some languages have special characters JPE doesn't recognize

✅ **How to fix:**
1. Make sure you're using UTF-8 encoding
2. Settings → Text Encoding → UTF-8
3. Retype the characters
4. If still broken, contact support

---

**Problem: "AI suggestions are bad"**

❌ **What it means:**
- AI gave unhelpful translations
- This happens sometimes!

✅ **How to fix:**
- Ignore the suggestion and translate manually
- Provide more context/examples
- Use Translation Memory instead (more reliable)
- Disable AI if it's not helping

---

### Build Issues

**Problem: "Build failed with errors"**

❌ **What went wrong:**
- Validation found problems before building
- Common issues: unmatched brackets, too-long text, etc.

✅ **How to fix:**
1. Go to **Issues tab**
2. **Click each red issue** (errors only)
3. **Fix them** in Translate tab
4. **Try building again**

---

**Problem: "Build succeeded but mod doesn't work in Sims 4"**

❌ **What it means:**
- JPE built successfully but something is wrong
- Could be incompatible mod, game version, etc.

✅ **How to fix:**
1. Test with English version first (original mod)
2. Make sure original mod works in your game
3. Verify translations didn't contain special characters
4. Check Sims 4 mod folder permissions
5. Try disabling all other mods and just use translated one

---

### Performance Issues

**Problem: "JPE is running slowly"**

❌ **What could be wrong:**
- Your computer doesn't have enough RAM
- JPE is indexing a very large mod
- Other programs are running

✅ **How to fix:**
1. Close other programs
2. Restart JPE
3. Try with smaller mod first
4. Upgrade computer RAM (if constant issue)

---

**Problem: "JPE keeps crashing"**

❌ **What could cause it:**
- Memory leak
- Corrupt project file
- Bad translation content

✅ **How to fix:**
1. Restart JPE
2. Create new project with simple mod
3. Test if issue is specific mod
4. Check in [FAQ](#faq) for workarounds
5. Report bug if none of above work

---

### Advanced Troubleshooting

**Getting Help:**

If you're stuck and the troubleshooting didn't help:

1. **Check documentation:**
   - Docs tab in JPE Studio

2. **Check FAQ:**
   - See [FAQ](#faq) section below

3. **Get technical details:**
   - About tab (bottom) → "System Info"
   - Copy the info and share

4. **Report bug:**
   - Go to https://github.com/khaoticdev62/JPE-Sims4/issues
   - Include system info
   - Describe what happened

---

## FAQ

### General Questions

**Q: Is JPE Studio free?**

A: Yes! JPE Studio is completely free and open-source. No hidden fees, no premium upgrades (though AI features may require API keys for your chosen provider).

---

**Q: Will JPE work on my computer?**

A: JPE works on:
- Windows 7+
- macOS 10.12+
- Linux (any distribution with Python)

Requirements:
- 1 GB RAM (2 GB recommended)
- 500 MB disk space
- Internet connection (for AI features optional)

---

**Q: Can I translate mods I didn't make?**

A: Yes, BUT:
- Check the mod creator's permissions first
- Respect their rights
- Get permission if required
- Don't claim credit for the original mod

---

**Q: How many mods can I work on at once?**

A: Unlimited! JPE handles any number of projects. You can:
- Work on multiple mods simultaneously
- Switch between projects anytime
- Save progress automatically

---

### Translation Questions

**Q: How long does it take to translate a mod?**

A: Depends on:
- Size: Small (50 segments) = 30 mins, Large (1000+) = several hours
- Your language skill: Faster if you're fluent
- AI help: 3-5x faster with AI suggestions

Realistic timeline:
- Simple dialogue: 5-10 min per 100 segments
- Complex text: 15-20 min per 100 segments
- With AI: 2-5 min per 100 segments

---

**Q: Can I use machine translation (Google Translate, etc.)?**

A: Technically yes, but...

✅ **Good for:**
- Quick drafts you'll review
- Unfamiliar languages
- Getting started

❌ **Bad for:**
- Professional mods (quality is obvious)
- Keeping player experience
- Character voices/personalities
- Proper context

Recommendation: Use AI in JPE (more mod-aware) instead of Google Translate.

---

**Q: What if I make a mistake in translation?**

A: Easy fix!

1. Find the wrong translation
2. Click it
3. Correct it
4. Save
5. Build again

No problem! Your original mod is never touched.

---

**Q: Can I translate slang or offensive language?**

A: Yes, but be thoughtful:

✅ **Okay to translate:**
- Casual language
- Slang
- Regional phrases
- Character-appropriate dialogue

❌ **Be careful with:**
- Offensive terms (understand context first)
- Cultural sensitivity (does it work in target language?)
- NSFW content (know your audience)

---

### File & Format Questions

**Q: What file formats does JPE support?**

A: JPE handles:
- **Natively:** XML, JSON, INI, JPE, STBL
- **Recognized:** TXT, CSV, YAML, TOML
- **Package files:** .package (Sims 4 format)
- **Scripts:** .ts4script, Python files

If your format isn't listed, you may need a custom plugin.

---

**Q: Can I translate .zip files directly?**

A: Yes!

1. New Project
2. Select .zip file
3. JPE extracts and scans
4. Done!

JPE handles ZIP automatically. No need to unzip first.

---

**Q: What's the maximum mod size JPE can handle?**

A: Default: 500 MB per mod

You can increase this in Settings → Advanced if needed (but your computer might slow down).

---

### AI & Feature Questions

**Q: Do I have to use AI?**

A: Nope! AI is completely optional:

1. Settings → AI Assistance
2. Toggle it off
3. Translate manually

Many people prefer manual translation for accuracy.

---

**Q: What AI providers does JPE support?**

A: Multiple options:
- Google Gemini
- OpenAI (GPT-4)
- Anthropic (Claude)
- Local LLM (run on your computer)

Choose in Settings → AI Provider.

---

**Q: Does using AI cost money?**

A: Depends on your choice:
- **Free options:** Local LLM, some providers offer free tier
- **Paid options:** Most providers charge per API call (usually cheap)
- **JPE itself:** Always free

---

**Q: How accurate is the AI?**

A: Pretty good! Typically 70-80% accuracy:

✅ **Good at:**
- Simple, straightforward text
- Common phrases
- Formal language
- Dialogue when context is clear

❌ **Struggles with:**
- Wordplay and puns
- Very creative text
- Character-specific voice
- Cultural references

**Pro tip:** Always review AI suggestions before using.

---

### Team Collaboration Questions

**Q: Can I collaborate with someone on the same project?**

A: Yes! Two methods:

**Method 1 (Simple):**
- Export project
- Send to collaborator
- They translate their part
- You merge translations

**Method 2 (Real-time) - Coming Soon:**
- Cloud synchronization
- See collaborator's changes live
- Work simultaneously

---

**Q: What if two people translate the same segment differently?**

A: JPE alerts you:

1. Import both translations
2. JPE shows conflicting segment
3. You choose which version to use
4. Or manually combine them

---

**Q: How do I prevent translation conflicts?**

A: Plan ahead:

✅ **Assign segments:** Each person gets different segments
✅ **Share glossary:** Everyone uses same term list
✅ **Regular check-ins:** Coordinate progress
✅ **Use version control:** Comment on changes

---

### Security & Safety Questions

**Q: Is my mod safe with JPE?**

A: Very safe!

✅ **What JPE does:**
- Never modifies original files
- Works on copies
- Validates before building
- Creates backups automatically

❌ **What JPE doesn't do:**
- Access the internet (except for optional AI)
- Steal your data
- Share your work
- Modify system files

---

**Q: What happens to my translations if JPE closes?**

A: They're saved! JPE auto-saves every minute:

1. Your translations are stored locally
2. Reopening project loads them
3. Zero data loss

You can also manually save: `Ctrl + S`

---

**Q: Can I back up my projects?**

A: Yes! Several ways:

**Option 1: Export Project**
- Projects → Right-click → Export
- Creates .jpe backup file

**Option 2: Copy Project Folder**
- File Manager
- Navigate to JPE projects folder
- Copy the entire project folder

**Option 3: Cloud Backup**
- Use Google Drive, OneDrive, Dropbox
- Back up your entire JPE folder

---

## Reference Guide

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + S` | Save project |
| `Ctrl + Z` | Undo |
| `Ctrl + Y` | Redo |
| `Ctrl + F` | Search segments |
| `Ctrl + H` | Replace text |
| `Ctrl + N` | New project |
| `Ctrl + O` | Open project |
| `Tab` | Next segment |
| `Shift + Tab` | Previous segment |
| `Enter` | Save and next |
| `Ctrl + B` | Build |
| `Alt + E` | Export |
| `F1` | Help |

### Menu Structure

```
FILE
├── New Project
├── Open Project
├── Import
├── Export
├── Save
├── Recent Projects
└── Exit

EDIT
├── Undo
├── Redo
├── Cut
├── Copy
├── Paste
└── Find & Replace

VIEW
├── Dashboard
├── Projects
├── Translate
├── Issues
├── Build
├── Plugins
├── Docs
└── Settings

PROJECT
├── Properties
├── Add Language
├── Glossary
├── Snapshots
└── Build History

HELP
├── Documentation
├── Keyboard Shortcuts
├── About
└── Check for Updates
```

### Workflow Quick Reference

**Starting a Translation:**
```
1. Dashboard → New Project
2. Select mod folder/ZIP
3. Wait for scan
4. Projects tab → Your mod
5. Translate tab
```

**Translating:**
```
1. Click segment on left
2. Type translation on right
3. Press Tab to save and move to next
4. Repeat!
```

**Checking Work:**
```
1. Issues tab
2. Fix any red errors
3. Fix yellow warnings (optional)
4. Continue translating
```

**Building:**
```
1. Build tab
2. Click "Build Now"
3. Wait for "Build complete!"
4. Click "Open Folder"
5. Your translated mod is ready!
```

**Sharing:**
```
1. Projects → Right-click → Export
2. Send .jpe file to collaborator
3. They import and add translations
4. Merge back in your project
```

### File Locations

**Windows:**
```
Mod projects: C:\Users\[Username]\JPE\Projects\
Builds: C:\Users\[Username]\JPE_Builds\
Settings: C:\Users\[Username]\AppData\Roaming\JPE\
Glossaries: C:\Users\[Username]\JPE\Glossaries\
```

**Mac:**
```
Mod projects: ~/JPE/Projects/
Builds: ~/JPE_Builds/
Settings: ~/Library/Application Support/JPE/
Glossaries: ~/JPE/Glossaries/
```

**Linux:**
```
Mod projects: ~/.jpe/projects/
Builds: ~/.jpe_builds/
Settings: ~/.config/jpe/
Glossaries: ~/.jpe/glossaries/
```

### Settings Explained

**General:**
- Theme (Light/Dark)
- Language
- Auto-save interval

**Translation:**
- Default source language
- Default target language
- Font size
- Font family

**AI:**
- AI provider (Gemini, Claude, local)
- API key (if using cloud AI)
- Auto-suggest on/off
- Suggestion confidence level

**Validation:**
- Validation preset (Strict/Balanced/Quick)
- Custom rules
- Issue filtering

**Advanced:**
- Max file size
- Number of threads
- Cache settings
- Plugin paths

---

## Getting More Help

### Resources Available to You

**Inside JPE Studio:**
- Docs tab → Browse built-in documentation
- Settings → Help → Contact support
- About → Check for updates
- Right-click anything → "What's this?" for tooltips

**Online:**
- GitHub: https://github.com/khaoticdev62/JPE-Sims4
- Discussions: GitHub Discussions tab
- Issues: Report bugs here
- Documentation: Full online docs

**Community:**
- Discord: (link in About tab)
- Forums: (link in About tab)
- Twitter: @JPEStudio (maybe!)

### Reporting Issues

**Found a bug?** Help us fix it!

1. **Gather info:**
   - What did you do?
   - What went wrong?
   - What did you expect?
   - Screenshot if possible

2. **Get system info:**
   - About tab → System Info
   - Copy the text

3. **Report:**
   - Go to GitHub Issues
   - Create new issue
   - Include system info
   - Describe clearly

4. **Follow up:**
   - Developers might ask questions
   - Be ready to help debug

---

## Final Tips

### Translate Like a Pro

1. **Start small:** Try with a simple mod first
2. **Go quality over speed:** Better translations > faster
3. **Use resources:** Dictionary, glossary, reference
4. **Test in game:** Load your translated mod in Sims 4
5. **Get feedback:** Have players test it
6. **Use translation memory:** Reuse good translations
7. **Collaborate:** Share the load with others

### Keep Your Project Safe

1. **Create snapshots** at milestones
2. **Back up regularly** to cloud or external drive
3. **Export projects** as backup files
4. **Don't delete originals** until sure translation is good
5. **Keep glossaries** as reference for future projects

### Translate Better

1. **Understand context:** What's being translated?
2. **Know your audience:** Who will play this?
3. **Match tone:** Keep character voices consistent
4. **Check flow:** Does it sound natural?
5. **Respect culture:** Be mindful of regional differences
6. **Ask for help:** Consult native speakers when unsure

---

## You're Ready!

Congratulations! You now know how to:

✅ Install JPE Studio
✅ Load a mod
✅ Extract translatable segments
✅ Translate content
✅ Validate your work
✅ Build translated mods
✅ Collaborate with teams
✅ Handle issues and errors
✅ Troubleshoot problems

**You have everything you need to start translating Sims 4 mods!** 🎉

Remember:
- Start with a simple mod to practice
- Don't be afraid to make mistakes (they're easy to fix!)
- Use AI and translation memory to speed things up
- Ask for help if you get stuck
- Celebrate your progress!

**Happy translating! 🌍✨**

---

## Appendix: Glossary of Terms

| Term | Meaning |
|------|---------|
| **Segment** | One piece of translatable text (e.g., "Welcome to my mod!") |
| **Source Text** | The original text (usually English) |
| **Translation** | Your translated version of the text |
| **Extract** | Pull text from a mod file |
| **Build** | Reconstruct a mod with translations included |
| **Validation** | Checking for errors before building |
| **Glossary** | Shared list of terms and translations |
| **Translation Memory** | JPE's database of past translations |
| **ZIP File** | Compressed folder (like a .rar file) |
| **API Key** | Password for AI services |
| **Snapshot** | Saved version of your project |
| **Plugin** | Extra feature you can add to JPE |
| **Simlish** | The fictional language Sims speak |
| **Package File** | Sims 4 mod format (.package) |
| **XML/JSON** | File formats for storing data |

---

**Last Updated:** December 20, 2024

**Manual Version:** 1.0 (Comprehensive Edition)

**Made with 💜 for the Sims 4 modding community**

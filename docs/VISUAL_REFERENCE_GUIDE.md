# 🎨 JPE Studio Visual Reference Guide

**Diagrams, flowcharts, and visual explanations for JPE Studio**

---

## Main Workflow Diagram

### The Translation Journey

```
START
  │
  ▼
┌─────────────────────────────────────────────┐
│  1. LOAD YOUR MOD                           │
│  - New Project button                       │
│  - Select folder or ZIP                     │
│  - JPE scans (10-30 seconds)                │
└──────────────┬──────────────────────────────┘
               │
               ▼
           ✓ Scan OK?
          /  |  \
        Y/   |   \N
        /    |    \──→ ❌ "No segments found"
       /     |         → Try different mod
      /      |         → See troubleshooting
     /       |
    ▼        │
┌─────────────────────────────────────────────┐
│  2. TRANSLATE                               │
│  - Translate tab                            │
│  - Enter translations                       │
│  - Use AI if wanted (optional)              │
│  - Save frequently (Ctrl+S)                 │
└──────────────┬──────────────────────────────┘
               │
               ▼
        ┌─────────────┐
        │  READY TO   │
        │  BUILD? ✓   │
        └──────┬──────┘
               │
         ┌─────┴──────────┐
         │ WANT TO CHECK  │
         │ FIRST?         │
         └────────┬───────┘
              Y / \  N
             /    \
            ▼      ▼
      ┌──────┐ ┌──────────────────────────────┐
      │CHECK │ │  5. BUILD                    │
      │ISSUES│ │  - Build tab                 │
      └──┬───┘ │  - Click "Build Now"         │
         │     │  - Wait for completion       │
         │ Y   │  - Open folder to see result │
      ┌──┴──┐  └──────────┬───────────────────┘
      │FIX? │             │
      └──┬──┘             │
    Y/   N                │
   /      \               │
  /        └──────────────┤
 ▼                        │
(back to 2)               │
                          ▼
                     ✅ DONE!
                     Use your translated mod!
```

---

## Interface Layout

### Main Window Breakdown

```
┌──────────────────────────────────────────────────────────────────┐
│ JPE STUDIO  🏠 File  Edit  View                                   │
├────────────┬──────────────────────────────────────────────────────┤
│            │                                                      │
│  SIDEBAR   │        MAIN WORKSPACE                               │
│            │        (Changes based on selected page)              │
│  Pages:    │                                                      │
│  🏠 HOME   │  ┌────────────────────────────────────────────────┐ │
│  📂 PROJ   │  │ Content here changes:                          │ │
│  ✏️  TRANS  │  │ • Home: Quick actions                         │ │
│  ⚠️  ISSUES │  │ • Projects: Your mods list                   │ │
│  🔨 BUILD  │  │ • Translate: Edit area                        │ │
│  🧩 PLUG   │  │ • Issues: Problem list                        │ │
│  📖 DOCS   │  │ • Build: History & build tools                │ │
│  ⚙️  SETT   │  │                                                │ │
│            │  └────────────────────────────────────────────────┘ │
│            │                                                      │
│  SHORTCUTS │  Status Bar: [Info here]                            │
│  Ctrl+S    │                                                      │
│  Ctrl+F    │                                                      │
│  Ctrl+B    │                                                      │
└────────────┴──────────────────────────────────────────────────────┘
```

---

## Translation Editor Layout

### The Heart of JPE

```
┌─────────────────────────────────────────────────────────────┐
│ TRANSLATE TAB                                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────┐  ┌─────────────────────────────┐ │
│  │  SEGMENT LIST        │  │  TRANSLATION EDITOR         │ │
│  │  (Left Panel)        │  │  (Right Panel)              │ │
│  │                      │  │                             │ │
│  │ 🔍 Search box        │  │ Source: "Welcome to mod"    │ │
│  │                      │  │                             │ │
│  │ Filter: [All ▼]      │  │ Translation:                │ │
│  │                      │  │ [Text box - type here]      │ │
│  │ ┌──────────────────┐ │  │                             │ │
│  │ │ 001 Welcome...   │ │  │ [✨ AI Suggest] [?Help]    │ │
│  │ │ 002 Click here   │ │  │                             │ │
│  │ │ 003 Continue  ✓  │ │  │ ┌──────────────────────┐   │ │
│  │ │ 004 Exit         │ │  │ │ TRANSLATION MEMORY   │   │ │
│  │ │ ...              │ │  │ │ (Similar translations)  │   │ │
│  │ └──────────────────┘ │  │ │ • "Welcome to..." →   │   │ │
│  │                      │  │ │   "Bienvenido a..."   │   │ │
│  │ (Scroll to see more) │  │ └──────────────────────┘   │ │
│  │                      │  │                             │ │
│  └──────────────────────┘  └─────────────────────────────┘ │
│                                                             │
│  STATUS: [Progress bar] 45 of 87 translated (52%)         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## File Types Support

### What JPE Can Handle

```
JPE STUDIO CAN TRANSLATE:

┌──────────────────────────────────────────────┐
│ NATIVELY SUPPORTED (Built-in support)        │
├──────────────────────────────────────────────┤
│ 📄 XML Files        .xml                      │
│ 📊 JSON Files       .json                     │
│ ⚙️  Config Files     .ini, .cfg               │
│ 📦 Sims 4 STBL      .stbl (string tables)     │
│ 📦 Sims 4 Package   .package                  │
│ 🐍 Python Scripts   .ts4script, .py           │
│ 📝 JPE Format       .jpe, .jpe-xml            │
│ 📋 Text Files       .txt, .md                 │
│ 📈 Spreadsheets     .csv, .tsv                │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ RECOGNIZED (Can load, may need plugin)        │
├──────────────────────────────────────────────┤
│ 🎨 Images          .png, .jpg, .webp        │
│ ⚙️  YAML Config     .yaml, .yml              │
│ ⚙️  Config          .toml, .properties       │
│ 📝 Archives        .zip, .7z                 │
│ 📊 Databases       .sqlite                   │
│ 🖼️  SVG            .svg                     │
└──────────────────────────────────────────────┘

JPE = Supports out of the box
? = May need custom plugin
```

---

## Translation Status Flowchart

### Project Progress Tracking

```
PROJECT STATUS FLOW

START: New Project
       │
       ├─ 0 segments translated
       ├─ 0% complete
       └─ 0 files validated
       │
       ▼
    TRANSLATING
       │
       ├─ 1 segment translated ─→ 1% complete ✓
       ├─ 5 segments translated ─→ 5% complete ✓
       ├─ 25 segments translated ─→ 25% complete ✓
       │
       ▼
    HALFWAY THERE 🎉
       │
       ├─ 43 segments translated ─→ 50% complete
       │
       ▼
    ALMOST DONE 💪
       │
       ├─ 80 segments translated ─→ 92% complete
       │
       ▼
    READY TO BUILD ✓
       │
       ├─ 87 segments translated ─→ 100% complete
       │
       ▼
    VALIDATED ✓
       │
       └─ Ready to build!
       │
       ▼
    BUILD SUCCESSFUL 🎊
       │
       └─ Your translated mod is ready!
```

---

## Team Collaboration Workflow

### How Multiple People Work Together

```
TEAM COLLABORATION PROCESS

Step 1: PROJECT LEAD
┌────────────────────────────────────┐
│ • Scans mod                         │
│ • Creates project file              │
│ • Makes glossary (shared terms)     │
│ • Exports everything to team        │
└────────────────────────────────────┘
                │
         ┌──────┴────────┬───────────┐
         │               │           │
         ▼               ▼           ▼
Step 2: TEAM MEMBERS
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Translator 1 │  │ Translator 2 │  │ Translator 3 │
│              │  │              │  │              │
│ French       │  │ Spanish      │  │ German       │
│ Dialogue     │  │ UI Text      │  │ Descriptions │
│              │  │              │  │              │
│ Files:       │  │ Files:       │  │ Files:       │
│ • dialog.xml │  │ • menu.json  │  │ • readme.txt │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       │ (1-2 days)      │ (1-2 days)      │ (1-2 days)
       │                 │                 │
       ▼                 ▼                 ▼
    DONE ✓           DONE ✓            DONE ✓

       └──────────────────┬─────────────────┘
                          │
                    Step 3: LEAD
                    ┌────────────────────┐
                    │ • Imports all files │
                    │ • Checks for issues │
                    │ • Merges if needed  │
                    │ • Validates quality │
                    └────────────────────┘
                          │
                          ▼
                 Step 4: BUILD & EXPORT
                    ┌────────────────────┐
                    │ • Builds final mod  │
                    │ • Tests in game     │
                    │ • Creates backups   │
                    │ • Releases to users │
                    └────────────────────┘
                          │
                          ▼
                      SUCCESS! 🎉
          Translated mod ready for community!
```

---

## Build Process Flowchart

### What Happens During Build

```
BUILD PROCESS

You click "Build Now" ─────────────────────┐
                                           ▼
                    ┌─────────────────────────────────┐
                    │ STEP 1: VALIDATION              │
                    │ JPE checks:                     │
                    │ ✓ All required fields filled    │
                    │ ✓ Translation lengths OK        │
                    │ ✓ Bracket matching              │
                    │ ✓ Special characters valid      │
                    │ ✓ No encoding issues            │
                    └──────────┬──────────────────────┘
                               │
                         ┌─────▼─────┐
                         │ All OK?    │
                         └─────┬──────┘
                            /  |  \
                        Y /    |    \ N
                        /      |     \──→ ❌ BUILD FAILED
                       /       |         Show error list
                      /        |         (Fix & retry)
                     ▼         │
    ┌─────────────────────────────────────┐
    │ STEP 2: PREPARE FILES               │
    │ JPE loads original mod files         │
    │ (Your original mod is untouched)    │
    └──────────────┬──────────────────────┘
                   │
                   ▼
    ┌─────────────────────────────────────┐
    │ STEP 3: APPLY TRANSLATIONS          │
    │ JPE replaces each segment:          │
    │                                     │
    │ File: dialog.xml                    │
    │ English: "Welcome"                  │
    │ Replace with: "Bienvenido" (Spanish)│
    │                                     │
    │ Repeats for all segments...         │
    └──────────────┬──────────────────────┘
                   │
                   ▼
    ┌─────────────────────────────────────┐
    │ STEP 4: PACKAGE OUTPUT              │
    │ JPE creates your translated mod     │
    │ Format: (Your choice)               │
    │ • Folder                            │
    │ • ZIP file                          │
    │ • Both                              │
    └──────────────┬──────────────────────┘
                   │
                   ▼
    ┌─────────────────────────────────────┐
    │ STEP 5: VERIFY BUILD                │
    │ Double-check everything is correct  │
    │ All files accounted for             │
    │ Sizes and counts match              │
    └──────────────┬──────────────────────┘
                   │
                   ▼
              ✅ BUILD COMPLETE!
                   │
                   ├─ Folder created: JPE_Builds/[ModName]/
                   ├─ Ready to use in Sims 4
                   └─ Take a screenshot! You did it! 🎉
```

---

## Feature Comparison Chart

### What Features Do What

```
TASK OVERVIEW:

Need to...          Feature to use          Where to find it
─────────────────────────────────────────────────────────────
Load a mod          New Project             Dashboard
See what needs      Translate tab           Projects → Your mod
translating

Translate text      Translation Editor      Translate tab (right side)

Get AI help         AI Suggestions          Click ✨ icon

Remember past       Translation Memory      Right-click segment
translations

Work with team      Export Project          Projects → Right-click

Share terms         Glossary                Settings → Glossary

Check for errors    Issues tab              Issues tab (left sidebar)

Build mod           Build tab               Build tab (left sidebar)

View history        Build History           Build tab (bottom)

Compare versions    Snapshots               Projects → Snapshots

Keep safe backup    Auto-save               Automatic (every minute)

Adjust settings     Settings                Settings tab (left sidebar)

Get help            Documentation           Docs tab (left sidebar)
```

---

## Keyboard Shortcut Cheat Sheet

### Quick Reference

```
┌─────────────────────────────────────┐
│   NAVIGATION                        │
├─────────────────────────────────────┤
│ Ctrl + N  → New project             │
│ Ctrl + O  → Open project            │
│ Ctrl + W  → Close project           │
│ Alt + 1   → Dashboard               │
│ Alt + 2   → Projects                │
│ Alt + 3   → Translate               │
│ Alt + 4   → Issues                  │
│ Alt + 5   → Build                   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│   EDITING                           │
├─────────────────────────────────────┤
│ Ctrl + S  → Save project            │
│ Ctrl + Z  → Undo                    │
│ Ctrl + Y  → Redo                    │
│ Ctrl + X  → Cut                     │
│ Ctrl + C  → Copy                    │
│ Ctrl + V  → Paste                   │
│ Ctrl + F  → Find/Search             │
│ Ctrl + H  → Find & Replace          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│   TRANSLATION                       │
├─────────────────────────────────────┤
│ Tab       → Next segment            │
│ Shift+Tab → Previous segment        │
│ Enter     → Save & next             │
│ Ctrl + ↑  → Move up one segment     │
│ Ctrl + ↓  → Move down one segment   │
│ Ctrl + B  → Build                   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│   GENERAL                           │
├─────────────────────────────────────┤
│ F1        → Help                    │
│ F5        → Refresh                 │
│ Esc       → Close dialog            │
│ Alt + F4  → Exit JPE                │
│ Ctrl + P  → Print                   │
│ Ctrl + E  → Export                  │
└─────────────────────────────────────┘
```

---

## Translation Process Timeline

### How Long Does It Take?

```
TYPICAL TRANSLATION PROJECT TIMELINE

Mod Size: 87 segments (small-medium mod)

Activity              Time        Done?
─────────────────────────────────────
1. Install JPE        5 min       ✓
2. Load mod           1 min       ✓
3. Review content     5 min       ✓
4. Translate (fast)   30 min      ✓
5. Check for errors   10 min      ✓
6. Build              2 min       ✓
7. Test in game       5 min       ✓
                      ─────
   TOTAL:            ~58 min

With AI help: ~20 min faster! ⚡

─────────────────────────────────────
FOR LARGER MODS (500+ segments):

Traditional translation (manual):
→ 4-8 hours per language

With JPE + AI help:
→ 2-3 hours per language ✓

For team (2-3 people):
→ 1-2 hours total ✓✓
```

---

## Error Recovery Flowchart

### How to Fix Common Problems

```
SOMETHING WENT WRONG!
        │
        ▼
    What happened?
    │
    ├─ ❌ BUILD FAILED
    │   │
    │   └─→ 1. Go to Issues tab
    │       2. Read error message
    │       3. Find affected segment
    │       4. Fix the problem
    │       5. Try building again
    │       6. ✅ Success!
    │
    ├─ ⚠️  JPE IS SLOW
    │   │
    │   └─→ 1. Close other programs
    │       2. Restart JPE
    │       3. Try with smaller mod
    │       4. Increase RAM if persistent
    │
    ├─ 💾 CAN'T FIND MY WORK
    │   │
    │   └─→ 1. Check recent projects
    │       2. Restore from snapshot
    │       3. Check file locations
    │       4. Email support
    │
    ├─ 🔴 MOD DOESN'T WORK IN GAME
    │   │
    │   └─→ 1. Test original mod works
    │       2. Check Sims 4 is up to date
    │       3. Try simpler mod first
    │       4. Check translations don't have special chars
    │       5. Read troubleshooting guide
    │
    └─ ❓ OTHER ISSUE
        │
        └─→ 1. Check FAQ in User Manual
            2. Search documentation
            3. Report on GitHub Issues
            4. Ask community
```

---

## Memory & Resource Usage

### How Much Does JPE Need?

```
SYSTEM REQUIREMENTS:

Minimum (Will work, might be slow):
┌─────────────────────────────┐
│ RAM:          1 GB           │
│ Disk space:   500 MB         │
│ Processor:    2 cores @ 2GHz │
│ Internet:     Optional       │
└─────────────────────────────┘

Recommended (Best experience):
┌─────────────────────────────┐
│ RAM:          4 GB           │
│ Disk space:   2 GB           │
│ Processor:    4 cores @ 2.5GHz
│ Internet:     For AI features │
└─────────────────────────────┘

RESOURCE USAGE PER MOD:

Mod size: 100 segments
Memory used: ~50 MB

Mod size: 1000 segments
Memory used: ~200 MB

Mod size: 5000+ segments
Memory used: 500 MB - 1 GB

Note: Larger mods take longer
to scan, translate, and build
```

---

## Success Metrics

### How to Know You're on Track

```
PROJECT PROGRESS DASHBOARD:

✅ START OF PROJECT
   ├─ Mod loaded
   ├─ Segments extracted
   └─ Status: Ready to translate

🟡 50% DONE
   ├─ Half segments translated
   ├─ Glossary created
   ├─ Some validation issues found & fixed
   └─ Status: Progressing well!

🟢 90% DONE
   ├─ Almost all segments translated
   ├─ Issues resolved
   ├─ Final review in progress
   └─ Status: Almost there!

✅ 100% DONE
   ├─ All segments translated
   ├─ No validation errors
   ├─ Build successful
   ├─ Tested in game
   └─ Status: Ready to release!

Celebration Status: 🎉🎉🎉
```

---

## File Organization

### Where Everything Lives

```
YOUR COMPUTER:

📁 JPE Data Folder
├─ 📁 Projects
│  ├─ 📁 My_First_Mod_Project
│  │  ├─ 📄 project.jpe (project file)
│  │  ├─ 📁 segments (all your text)
│  │  └─ 📁 snapshots (backup versions)
│  ├─ 📁 My_Second_Mod_Project
│  └─ 📁 ...
│
├─ 📁 Builds (Your finished mods)
│  ├─ 📁 My_First_Mod_Spanish
│  │  ├─ 📄 mod files (translated)
│  │  └─ 📄 build info
│  └─ 📁 ...
│
├─ 📁 Glossaries
│  ├─ 📄 Spanish_Game_Terms.glossary
│  ├─ 📄 French_Common_Phrases.glossary
│  └─ 📄 ...
│
├─ 📁 Backups (Auto-backups)
│  ├─ 📄 project_backup_001
│  ├─ 📄 project_backup_002
│  └─ 📄 ...
│
└─ 📁 Cache (JPE internal stuff)
   └─ 📄 ...

EASY TO FIND:
🔍 Recent Projects: Dashboard
🔍 All Projects: Projects tab
🔍 Glossaries: Settings → Glossary
🔍 Build Outputs: Build tab (click "Open Folder")
```

---

**That's the visual guide! Check the User Manual for detailed explanations of each feature.** 🚀

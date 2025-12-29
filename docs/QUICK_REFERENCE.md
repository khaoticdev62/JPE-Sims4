# 📖 Quick Reference Card - Get Things Done Fast

**Bookmark this page!** 🔖

---

## Installation (One-Time)

```bash
pip install jpe-sims4-studio
```

---

## Launch

```bash
jpe-studio
```

---

## The 5-Minute Workflow

| Step | Action | What You'll See |
|------|--------|-----------------|
| 1 | Click "Load Mod" | File picker opens |
| 2 | Select your mod | Progress bar appears |
| 3 | Click a segment | Translation dialog opens |
| 4 | Type translation | Text appears in box |
| 5 | Click "Save" | Segment marked ✓ |
| 6 | Repeat 3-5 | Translate more |
| 7 | Click "Build" | Creates your translated mod |

---

## Keyboard Shortcuts

| Shortcut | What It Does |
|----------|-------------|
| `Ctrl+S` | Save current translation |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Ctrl+F` | Find segment |
| `Ctrl+H` | Find & Replace |
| `Ctrl+E` | Export/Build |
| `F5` | Refresh |
| `Esc` | Close dialog |

---

## Common Tasks

### Load a Mod
1. Click "Load Mod"
2. Select mod folder or .zip file
3. Wait for analysis
4. Start translating!

### Translate a Segment
1. Click segment in list
2. Type translation
3. Click "Save"
4. Next segment is highlighted
5. Repeat!

### Use AI Suggestions
1. Hover over a segment
2. Click blue AI suggestion (if present)
3. Accept or modify
4. Save

### Preview Your Work
1. Click "Preview"
2. See how translations look in game
3. Click back arrow to return editing

### Build Your Mod
1. Click "Build"
2. Choose save location
3. Click "Build"
4. Wait for progress bar
5. Find your .zip file!

### Find a Specific Segment
1. Press `Ctrl+F`
2. Type search term
3. Matching segments appear
4. Click to select

### Translate Multiple Languages
1. Load your mod
2. Choose Language A from dropdown
3. Translate
4. Build → `mod_A.zip`
5. Load same mod again
6. Choose Language B
7. Translate
8. Build → `mod_B.zip`

---

## Translation Tips

| Tip | How It Helps |
|-----|------------|
| **Native language** | More accurate than machine translation |
| **Keep tone** | Match the original vibe |
| **Test length** | Use Preview to check if text fits |
| **Common phrases** | Translate the same way consistently |
| **Google Translate** | Good for getting the gist, not perfect |
| **Ask friends** | Have someone review your work |

---

## File Locations

| What | Where |
|------|-------|
| **Project file** | Wherever you save it (use .jpe.json) |
| **Original mod** | Any folder or .zip file |
| **Translated mod** | Wherever you choose in Build dialog |
| **Sims 4 Mods folder** | `Documents\Electronic Arts\The Sims 4\Mods` |

---

## Settings to Know

| Setting | What It Does | Recommended |
|---------|------------|-------------|
| **AI Suggestions** | Shows smart translation help | ON |
| **Auto-save** | Saves work automatically | ON |
| **Real-time Preview** | Updates preview as you type | ON |
| **Validate on Build** | Checks for errors before building | ON |

Access via: **Settings** → **Preferences**

---

## Common Error Messages

| Error | Cause | Fix |
|-------|-------|-----|
| "File not found" | Can't locate mod | Check file path, use quotes if spaces in path |
| "Invalid format" | Not a real mod file | Try a different mod or download again |
| "Permission denied" | Can't write output | Run as administrator, choose diff. location |
| "Build failed" | Something went wrong | Check error details, try smaller mod |

---

## Before You Build (Checklist)

- [ ] You've translated at least some segments
- [ ] No red error icons remaining
- [ ] Preview looks good (optional but recommended)
- [ ] You know where you want to save the file
- [ ] You haven't renamed any system files

---

## After You Build (Next Steps)

- [ ] Find your .zip file in the location you chose
- [ ] (Optional) Test it in The Sims 4
- [ ] Share with players in that language!
- [ ] Collect feedback & improve

---

## Support Levels

**Can't find something?**

1. **This page** - You're reading it! 📖
2. [**FAQ**](./FAQ.md) - 30+ answered questions
3. [**Full Guides**](./GETTING_STARTED_DESKTOP.md) - Step-by-step with pictures
4. [**Discord**](https://discord.gg/jpe) - Real humans, fast response
5. [**GitHub Issues**](https://github.com/jpe-studio/issues) - Bug reports

---

## Translation Progress Tracker

Keep track of your translation work:

```
Project: [Mod Name]
Target Language: [e.g., Spanish]
Start Date: [When you started]

Progress:
- Total segments: ___
- Translated: ___
- In progress: ___
- To do: ___

% Complete: ___ %

Notes:
- [Any special notes]
- [Team members involved]
```

---

## Hotkeys Cheat Sheet

**Editing:**
- `Ctrl+S` = Save
- `Ctrl+Z` = Undo
- `Ctrl+Y` = Redo
- `Ctrl+C` = Copy
- `Ctrl+V` = Paste

**Finding:**
- `Ctrl+F` = Find
- `Ctrl+H` = Find & Replace
- `Ctrl+G` = Go to line

**App:**
- `Ctrl+,` = Settings
- `Ctrl+E` = Export/Build
- `F5` = Refresh
- `Esc` = Close dialog
- `Alt+F4` = Quit

---

## Language Codes (for advanced use)

| Language | Code |
|----------|------|
| English | `en_US` |
| Spanish | `es_ES` |
| French | `fr_FR` |
| German | `de_DE` |
| Chinese (Simplified) | `zh_CN` |
| Japanese | `ja_JP` |
| Korean | `ko_KR` |

[See full list](./LANGUAGE_CODES.md)

---

## Troubleshooting Quick Links

- **Won't launch?** [Install Issues](./TROUBLESHOOTING.md#installation--setup-issues)
- **Mod won't load?** [Loading Issues](./TROUBLESHOOTING.md#loading-mods)
- **Build failed?** [Export Issues](./TROUBLESHOOTING.md#building--exporting)
- **Something else?** [Full Troubleshooting](./TROUBLESHOOTING.md)

---

## Command Line Quick Reference

```bash
# Scan a mod (no UI, just see info)
jpe-sims4 scan ./my_mod

# Extract text (create project file)
jpe-sims4 extract ./my_mod --write project.jpe.json

# Build from project file
jpe-sims4 build ./project.jpe.json --out-dir ./output

# Generate report
jpe-sims4 report ./project.jpe.json --write report.md

# Export as CSV (for spreadsheet translation)
jpe-sims4 export-csv ./project.jpe.json --out segments.csv

# Import from CSV
jpe-sims4 import-csv ./project.jpe.json --csv segments.csv --in-place
```

[Full CLI Guide](./CLI_GETTING_STARTED.md)

---

## Need to Know Stuff

✅ **Safe to do:**
- Translate multiple languages from same mod
- Work with others on same translation
- Edit translations multiple times
- Use AI suggestions
- Export whenever you want

❌ **Don't do:**
- Modify the original mod file
- Delete segment IDs
- Change file format mid-work
- Share unfinished translations as complete
- Translate to languages you don't understand

---

## Pro Tips 🚀

1. **Create backups** - Save your project file in 2 places
2. **Translate consistency** - Same term = same translation every time
3. **Use Preview** - Catch issues before building
4. **Read AI suggestions** - They're often helpful
5. **Get feedback** - Have someone review your work
6. **Start small** - Translate one mod, build confidence, go bigger
7. **Keep notes** - Write down translation decisions for reference

---

## One-Pager Summary

```
INSTALL: pip install jpe-sims4-studio
LAUNCH: jpe-studio
LOAD: Click "Load Mod" button
TRANSLATE: Click segment → Type → Save → Repeat
BUILD: Click "Build" → Choose location → Done!
HELP: [Discord](https://discord.gg/jpe) or [FAQ](./FAQ.md)
```

---

## Contact & Resources

- **Problems?** [Troubleshooting](./TROUBLESHOOTING.md)
- **Questions?** [FAQ](./FAQ.md)
- **Help?** [Discord](https://discord.gg/jpe)
- **Bugs?** [GitHub](https://github.com/jpe-studio/issues)
- **Email?** hello@jpe.online

---

**Print this page & keep it handy!** 🖨️

*Made with 💜 by the JPE Studio Team*

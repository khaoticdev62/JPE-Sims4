# 🆘 Troubleshooting Guide - Fix Common Problems

**Can't find your problem?** [Discord](https://discord.gg/jpe) has real humans who can help!

---

## Installation & Setup Issues

### 🔴 Error: "pip is not recognized as an internal or external command"

**What this means:** Python isn't installed or your computer can't find it.

**How to fix it:**

**Option 1: Install Python (recommended)**
1. Go to [python.org](https://www.python.org/downloads)
2. Download Python 3.11 or newer
3. Run the installer
4. **⚠️ IMPORTANT:** Check the box that says "Add Python to PATH"
5. Click "Install Now"
6. Restart your computer
7. Try the `pip install` command again

**Option 2: Use Python launcher**
\`\`\`bash
py -3 -m pip install jpe-sims4-studio
\`\`\`

**Option 3: Tell us!**
This is tricky. Jump into [Discord](https://discord.gg/jpe) and we'll walk you through it step-by-step. 🤝

---

### 🔴 Error: "Permission denied" or "Access denied"

**What this means:** Your computer won't let the program install without special permission.

**How to fix it:**

**Windows:**
1. Right-click on Command Prompt
2. Click "Run as administrator"
3. Try the install command again
4. You might see a dialog asking "Allow this app to make changes?" - Click "Yes"

**Mac:**
1. Put \`sudo\` in front of the command:
\`\`\`bash
sudo pip install jpe-sims4-studio
\`\`\`
2. Enter your computer password (you won't see it typing, that's normal!)
3. Press Enter

**Linux:**
\`\`\`bash
sudo pip install jpe-sims4-studio
\`\`\`
Same as Mac - enter your password when asked.

---

### 🔴 Error: "Module not found" or "ImportError"

**What this means:** JPE Studio didn't install all its parts correctly.

**How to fix it:**
\`\`\`bash
pip install --upgrade jpe-sims4-studio
\`\`\`

If that doesn't work:
\`\`\`bash
pip uninstall jpe-sims4-studio
pip install jpe-sims4-studio
\`\`\`

Still broken? [Discord to the rescue!](https://discord.gg/jpe)

---

## Launching JPE Studio

### 🔴 Nothing happens when I type "jpe-studio"

**What to try (in order):**

1. **Wait longer**
   - JPE Studio takes 5-10 seconds to start sometimes
   - Wait 30 seconds before giving up

2. **Use full path**
   \`\`\`bash
   python -m jpe_sims4.ui.studio
   \`\`\`

3. **Check installation**
   \`\`\`bash
   pip install --upgrade jpe-sims4-studio
   \`\`\`

4. **Restart Command Prompt**
   - Close and reopen the terminal
   - Try again

5. **Restart your computer**
   - Yeah, really!
   - It fixes weird stuff sometimes

---

### 🔴 Error: "The application has stopped responding"

**What this means:** JPE Studio crashed or froze.

**How to fix it:**

1. **Close the window** (or press Alt+F4)
2. **Wait 10 seconds**
3. **Open JPE Studio again**
4. **Try loading a different mod** (the current one might be corrupted)

**If it keeps crashing:**
- Join [Discord](https://discord.gg/jpe) with details about:
  - What you were doing when it crashed
  - The name of the mod
  - Any error messages

---

## Loading Mods

### 🔴 "File not found" or "Cannot open file"

**What this means:** JPE Studio can't find or read your mod file.

**How to fix it:**

1. **Check file path**
   - Make sure there are no typos
   - If path has spaces, put quotes around it:
   \`\`\`bash
   jpe-studio "C:\Users\Your Name\My Mods\Cool Mod"
   \`\`\`

2. **Try a different mod**
   - Your current mod might be corrupted
   - Download another mod to test
   - See if that one loads

3. **Move to Desktop**
   - Cut/paste your mod to your Desktop
   - Try loading from there
   - (Sometimes path issues!)

---

### 🔴 "Invalid mod format" or "Unrecognized file type"

**What this means:** The file isn't actually a mod, or it's corrupted.

**How to fix it:**

1. **Is it really a mod?**
   - Make sure you're loading a Sims 4 mod
   - Not a texture pack, save file, or other mod format

2. **Download it again**
   - Original file might be corrupted
   - Re-download from ModTheSims or NexusMods
   - Try again

---

## Translation & Editing

### 🔴 Text looks corrupted in preview

**What this means:** Special characters aren't displaying right.

**How to fix it:**

1. **Try retyping**
   - Delete the translation
   - Type it again manually
   - Don't copy/paste from browser

2. **Use simpler text**
   - Avoid special symbols
   - Use normal punctuation

---

## Building & Exporting

### 🔴 "Build failed" with error message

**What this means:** Something went wrong creating your translated mod.

**How to fix it:**

1. Check the error message closely - it usually says what's wrong
2. Fix that one thing
3. Try building again
4. If still broken, [ask Discord](https://discord.gg/jpe)

---

## Getting More Help

**Join our community:**
- [Discord](https://discord.gg/jpe) - Fast help from real people
- [GitHub Issues](https://github.com/jpe-studio/issues) - Bug reports
- [Email](mailto:hello@jpe.online) - For detailed issues

---

*Made with 💜 by the JPE Studio Team*


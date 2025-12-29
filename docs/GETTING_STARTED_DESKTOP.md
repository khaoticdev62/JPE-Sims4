# 🚀 Getting Started With JPE Studio (Desktop)

**Time to complete: 10-15 minutes** ⏱️

**Goal:** Translate your first Sims 4 mod and create a playable version for another language!

---

## Before You Start: What You'll Need 📋

- **A Sims 4 mod** (folder or .zip file) - any mod will work!
- **5-10 minutes** of your time
- **No previous experience** required (we'll guide you through everything!)

**Don't have a mod?** No problem! You can download one from NexusMods or ModTheSims to practice.

---

## Step 1: Install JPE Studio 💾

### On Windows:

Open Command Prompt (search for "cmd" in Windows) and type:

```bash
pip install jpe-sims4-studio
```

**What's happening?** Your computer is downloading and installing JPE Studio. This takes about 30 seconds.

**Success looks like:** You see text scroll by, ending with `Successfully installed`

### On Mac/Linux:

Open Terminal and type the same command:

```bash
pip install jpe-sims4-studio
```

**Don't have Python?** [Quick Python Setup Guide](./PYTHON_SETUP.md)

---

## Step 2: Launch JPE Studio 🎮

In the same command prompt/terminal, type:

```bash
jpe-studio
```

**What should happen:**
- A purple and black window opens
- It says "JPE Studio" at the top
- You see a purple button that says "Load Mod"

**What to do if it doesn't work:** Jump to [Troubleshooting](#-troubleshooting) at the bottom

---

## Step 3: Load Your Mod 📂

Now the fun begins! Let's load a mod to translate.

1. **Click the big purple "Load Mod" button**
   - A file picker window opens

2. **Find your mod folder or .zip file**
   - Look for a folder that contains mod files (usually named something like "CoolModName")
   - OR a .zip file

3. **Click "Open"**
   - Wait about 5-10 seconds while JPE Studio analyzes your mod

**What you'll see next:**
- A list of all the text in your mod that can be translated
- Each item shows:
   - The **original text** (usually English)
   - The **category** (dialogue, menu, description, etc.)
   - A **status** icon

✅ **Success!** Your mod is loaded and ready to translate.

---

## Step 4: Understand What You're Seeing 👀

### The Main View Looks Like This:

```
Mod: "Cool Wedding Dress" (123 segments)

┌─────────────────────────────────────┐
│ Segment 1: "Try on dress"           │  ← Original text
│ Category: Dialogue                  │  ← What type of text
│ Status: Not translated              │  ← Translation status
│ [Translate]                         │  ← Click this to translate
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Segment 2: "This dress costs..."    │
│ Category: Menu text                 │
│ Status: Not translated              │
│ [Translate]                         │
└─────────────────────────────────────┘
```

---

## Step 5: Translate Your First Segment 🌍

Let's translate something! Pick the first segment and click "[Translate]"

1. **Click the "[Translate]" button on any segment**
   - A translation dialog opens

2. **You'll see:**
   - The original text (English)
   - A text box labeled "Translate to: [Language]"
   - Optional: AI suggestions (in blue, if enabled)

3. **Type your translation** in the text box
   - For example, if it says "Try on dress" in English
   - You might type "Probar vestido" in Spanish
   - Or "試著穿上" in Traditional Chinese

4. **Click "Save Translation"**
   - The dialog closes
   - The segment now shows "Translated" ✅

**💡 Pro Tip:** If the AI suggestion (blue text) looks good, just click it to accept!

### Example Translation:

```
Original (English): "Welcome to my mod!"
Translation (Spanish): "¡Bienvenido a mi mod!"
Translation (French): "Bienvenue dans mon mod!"
```

---

## Step 6: Translate More Segments 🔄

Now you know how to do it! Continue with the other segments:

- **Quick translations:** Hit as many segments as you can (don't need to do them all!)
- **AI help:** Want the AI to suggest translations? They're shown in blue
- **Skip if unsure:** Can't think of a good translation? Skip it and come back later
- **See progress:** The bar at the top shows how many you've translated

**Don't worry about translating everything!** Even translating 20% of your mod helps players in that language enjoy it.

---

## Step 7: Preview Your Work (Optional) 👁️

Want to see what your translated mod will look like?

1. **Click "Preview"** at the top
2. See how the game will display your translations
3. **Back button** returns to editing

**Good for:** Making sure translations fit and look right

---

## Step 8: Export Your Translated Mod 📦

This is the exciting part! Let's create a playable version!

1. **Click the "Build" button** (usually at the top right)
   - A dialog appears asking where to save

2. **Choose where to save** your translated mod
   - Desktop is easiest
   - Name it something like "CoolMod_Spanish"

3. **Click "Build"**
   - A progress bar appears
   - Text says "Building translation... 50%, 75%, 100%"

4. **Wait for the green checkmark ✅**
   - You might see messages like:
     - "Building translation files..."
     - "Validating mod structure..."
     - "Creating package..."

**Success!** A green box appears saying "Build successful!"

---

## Step 9: Find Your Translated Mod 📍

Your newly translated mod is ready!

1. **Look in the folder you saved it to**
   - You'll see a `.zip` file or folder

2. **The mod is ready to use!**
   - You can share it with players
   - They can install it just like any other mod

**Example:**
- Original mod: `CoolWeddingDress.zip`
- Your translated version: `CoolWeddingDress_Spanish.zip`

---

## 🎉 You Did It!

Congratulations! You've successfully:

✅ Installed JPE Studio
✅ Loaded a mod
✅ Translated text segments
✅ Created a playable translated mod

**Next Steps:**
- **Translate more segments** to improve coverage
- **Learn advanced features** (team translation, AI suggestions, etc.)
- **Share with the community** - players in your language can now enjoy the mod!

---

## ⚠️ Troubleshooting

### "I can't install JPE Studio"

**Error: 'pip' is not recognized**
- Python isn't installed or not in your path
- [Install Python first](./PYTHON_SETUP.md)

**Error: Permission denied**
- Try running Command Prompt as Administrator
- Right-click cmd.exe → "Run as administrator"

### "JPE Studio won't open"

**Nothing happens when I type 'jpe-studio'**
- Installation might not be complete
- Try: `pip install --upgrade jpe-sims4-studio`
- Then: `jpe-studio`

**I see error messages**
- Close the window
- Try opening Command Prompt fresh
- Type the command again

### "My mod won't load"

**Error: "File not found"**
- Make sure you selected a .zip file or folder
- Try a different mod to test

**Error: "Invalid mod format"**
- The file might be corrupted
- Try downloading it again
- Or try a different mod

**It loads but shows no segments to translate**
- Some mods don't have translatable text
- Try a different mod
- Check [Advanced Guide](./ADVANCED_FEATURES.md) for custom files

### "Translation looks wrong"

**Text doesn't fit in the game**
- Translations can be shorter/longer than the original
- If it's really long, try abbreviating it
- Click Preview to see how it looks

**Special characters got messed up**
- Make sure you're using the right language keyboard
- Copy/paste from Google Translate if needed
- Emojis usually work fine!

**AI suggestions are bad**
- AI isn't perfect! Feel free to ignore them
- Write your own translation instead
- The more you use it, the better it gets

### "Build failed"

**Red error message appears**
- Check if all segments are translated
- Not all need to be done (but more is better)
- Try again - sometimes temporary glitches happen
- Join our Discord for help

**File already exists error**
- You already have a file with that name
- Choose a different name or location
- Or delete the old file first

---

## 💡 Tips & Tricks

### ⚡ Speed Things Up
- Use AI suggestions (click the blue text) - saves 50% of time
- Copy text between similar segments
- Search for common phrases to translate them all at once

### 🎯 Quality Tips
- Translate in your native language (don't rely only on Google Translate)
- Have someone else review your translations
- Test the mod in The Sims 4 to make sure everything fits

### 🤝 Team Translation
- Share the project file with other translators
- Each person translates their sections
- Combine everything at the end
- Learn more: [Team Collaboration Guide](./TEAM_COLLABORATION.md)

---

## ❓ Still Stuck?

### Quick Links:
- **Getting more help?** [Full FAQ](./FAQ.md)
- **Want advanced features?** [Advanced Guide](./ADVANCED_FEATURES.md)
- **Need team help?** [Community Discord](https://discord.gg/jpe)
- **Found a bug?** [Report it on GitHub](https://github.com/jpe-studio/issues)

### Common Questions:

**Q: Do I have to translate the whole mod?**
A: Nope! Even 10% helps players. More is better, but there's no requirement.

**Q: Can I share my translations?**
A: Absolutely! Post them online and let other mods use them.

**Q: What if someone wants to translate it to another language?**
A: They can use your mod as a starting point and translate to their language!

**Q: Will this break The Sims 4?**
A: No way! We validate everything. Your mod is safe.

**Q: Can I translate multiple languages at once?**
A: Yes! Each translation gets its own version of the mod.

---

## 🚀 Ready for More?

Now that you've got the basics down:

1. **Translate more mods** - Practice makes perfect!
2. **Learn AI features** - Speed up translations [AI Guide](./AI_FEATURES_USER_GUIDE.md)
3. **Collaborate with others** - Share the workload [Team Guide](./TEAM_COLLABORATION.md)
4. **Master advanced features** - Bulk operations, batch export, etc. [Advanced Guide](./ADVANCED_FEATURES.md)

---

**Congratulations on translating your first mod!** You're now part of a global community making games accessible to players worldwide. 🌍✨

*— The JPE Studio Team* 💜

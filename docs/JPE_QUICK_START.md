# ⚡ JPE Quick Start Guide - Get Started in 10 Minutes

**Perfect for**: Complete beginners
**Time needed**: 10 minutes
**Difficulty**: Beginner

---

## Step 1: Installation (2 minutes)

### Windows
1. Download installer from [GitHub Releases](https://github.com/khaoticdev62/JPE-Sims4/releases)
2. Run `JPE-Sims4-[version]-installer.exe`
3. Click "Next" through the setup
4. Click "Finish"
5. JPE Studio will launch automatically

### macOS
1. Download `.dmg` from releases
2. Open the file
3. Drag JPE to Applications folder
4. Launch from Applications

### Linux
1. Download `.AppImage` or `.deb`
2. AppImage: Make executable and run
   ```bash
   chmod +x JPE-Studio-*.AppImage
   ./JPE-Studio-*.AppImage
   ```
3. Debian: Install with
   ```bash
   sudo dpkg -i jpe-sims4_*.deb
   jpe-studio
   ```

---

## Step 2: Create Your First File (3 minutes)

1. **Open JPE Studio** (already open from installation)
2. **Click** "File" → "New"
3. **Copy this code** and paste it:

```jpe
Simple Wave
  description: "Give a friendly wave"
  type: social
  duration: 10
  tests:
    - actor is not alone
  effects:
    - increase friendship +5
    - add happy feeling
```

4. **Click** File → Save
5. **Name it** `my_first_mod.jpe`
6. **Pick a folder** (your Desktop is fine)
7. **Click** Save

**Congratulations!** You just created your first JPE file! 🎉

---

## Step 3: Build Your Mod (2 minutes)

1. **Click** "Build" in the menu
2. **Wait** for the "Build successful!" message
3. **Note the output location** at the bottom of the screen

That's it! Your mod is ready!

---

## Step 4: Use Your Mod (3 minutes)

### Option A: Test in-game (RECOMMENDED)

1. **Find your Sims 4 Mods folder**:
   - Windows: `C:\Users\[YourName]\Documents\Electronic Arts\The Sims 4\Mods`
   - macOS: `~/Library/Application Support/The Sims 4/Mods`
   - Linux: `~/.local/share/The Sims 4/Mods`

2. **Copy the exported file** (JPE Studio shows you the location)

3. **Paste it** into your Mods folder

4. **Launch The Sims 4**

5. **Enable mods** in Game Options → Other → Allow Script Mods

6. **Open any Sim's interaction menu** and look for "Simple Wave"

7. **Try it!** The interaction should work!

### Option B: Share Your Mod

1. Send the exported `.xml` file to friends
2. They can put it in their Mods folder
3. They can use your interaction!

---

## What You Just Learned

You now know how to:

✅ Install JPE Studio
✅ Create a new JPE file
✅ Write a simple interaction
✅ Build and export your mod
✅ Use it in-game

That's the foundation! You're officially a mod creator! 🚀

---

## 5 More Beginner Templates

Copy and paste these one at a time. Modify the names and see what happens!

### Template 1: Romantic Kiss

```jpe
Romantic Kiss
  description: "Share a romantic kiss"
  type: social
  duration: 15
  tests:
    - actor is romantic with target
    - both are adults
    - both are not in public
  effects:
    - increase romance +30
    - add romantic feeling buff
```

### Template 2: Skill Builder

```jpe
Practice Painting
  description: "Work on painting skills"
  type: object
  duration: 60
  tests:
    - actor has art supplies
    - actor is not tired
  effects:
    - increase painting skill by 2
    - add focused feeling buff

---

Focused Feeling
  description: "Focused on the task"
  mood_type: positive
  intensity: 2
  duration: 180
  mood_gain: 10
```

### Template 3: Friendship Builder

```jpe
Deep Conversation
  description: "Have a meaningful conversation"
  type: social
  duration: 45
  tests:
    - actor knows target
    - actor is not tired
    - target is in good mood
  effects:
    - increase friendship +50
    - add connection feeling buff

---

Connection Feeling
  description: "Feeling connected to someone"
  mood_type: positive
  intensity: 3
  duration: 240
  mood_gain: 25
```

### Template 4: Mood Changer

```jpe
Cheer Up
  description: "Make someone feel better"
  type: social
  duration: 20
  tests:
    - target is sad
    - actor is in good mood
    - actor is good friend with target
  effects:
    - remove sad feeling
    - add happy feeling buff

---

Happy Feeling
  mood_type: positive
  intensity: 2
  duration: 180
  mood_gain: 15

---

Sad Feeling
  mood_type: negative
  intensity: 2
  duration: 240
  mood_gain: -15
```

### Template 5: Trait-Based Interaction

```jpe
Animal Lover
  description: "This Sim loves animals"
  category: hobby
  cost: 2
  interactions:
    - pet cat
    - pet dog
    - talk to pet

---

Pet Cat
  description: "Interact with a cat"
  type: object
  duration: 10
  tests:
    - actor has animal lover trait
    - cat is present
  effects:
    - increase mood by 30
    - pet cat increases friendship
```

---

## Common Beginner Questions

### Q: What does "type: social" mean?

**A**: It's the kind of interaction:
- `social` = interaction between two Sims
- `object` = interaction with an object (like a stove)
- `autonomous` = Sims do this on their own

### Q: What's a "buff"?

**A**: A temporary feeling or effect. Like feeling happy or tired.

### Q: How do I add more tests?

**A**: Add more lines starting with `-`:
```jpe
tests:
  - first test
  - second test
  - third test
```

### Q: How do I fix "Build failed" error?

**A**:
1. Check for spelling mistakes
2. Make sure indentation (spaces) is correct
3. Make sure all property names are exact
4. Check the error message at the bottom of the screen

### Q: Can I mix social and object interactions?

**A**: Not in the same interaction. Create separate ones if needed.

### Q: How do I make random interactions?

**A**: Use the `chance` property:
```jpe
Random Greeting
  description: "Sometimes happens"
  type: social
  chance: 0.5  # 50% chance to trigger
```

---

## Next Steps

### Want to learn more?

1. **Read JPE_MASTER_BIBLE.md** - Complete reference
2. **Check templates/** folder - 20+ examples
3. **Watch video tutorials** - Coming soon!
4. **Join community forums** - Ask questions

### Want to try advanced stuff?

Check these sections in the Master Bible:
- Common Patterns (page X)
- Advanced Techniques (page Y)
- Complex Test Combinations (page Z)

### Want to create your own templates?

1. Copy an existing template
2. Change the name, description, and properties
3. Test in-game
4. Add to your personal templates folder
5. Reuse for future mods!

---

## Troubleshooting Beginners

### Problem: "Unknown property"

**Solution**: Check spelling. `descrption` should be `description`.

```jpe
# ❌ WRONG
My Interaction
  descrption: "Wrong spelling"

# ✅ RIGHT
My Interaction
  description: "Correct!"
```

### Problem: "Tests not working"

**Solution**: Make sure you use a list (with `-`):

```jpe
# ❌ WRONG
tests: actor is adult

# ✅ RIGHT
tests:
  - actor is adult
```

### Problem: "Indentation error"

**Solution**: Use exactly 2 spaces for each level:

```jpe
Interaction
  property: value  # 2 spaces
    nested: value  # 4 spaces
      more: value  # 6 spaces
```

### Problem: "File won't open"

**Solution**: Make sure file ends with `.jpe`:
- ✅ `my_mod.jpe`
- ❌ `my_mod.txt`
- ❌ `my_mod`

### Problem: "Mod doesn't show in-game"

**Solution**:
1. Check Mods folder location (see Step 4)
2. Make sure mods are enabled in game settings
3. Try renaming file to something simple like `test.xml`
4. Restart the game completely

---

## Challenge Exercises

Try these challenges to practice:

### Challenge 1: Two-Way Interaction
Create an interaction where both Sims benefit (both get mood boosts and friendship).

### Challenge 2: Skill Prerequisites
Create an interaction that only works if a Sim has a certain skill level.

### Challenge 3: Buff Chain
Create a series of interactions that trigger different buffs.

### Challenge 4: Relationship Gate
Create interactions that only work for best friends (not casual friends).

### Challenge 5: Emotion-Based
Create an interaction that only works when a Sim is in a specific mood.

---

## You're Ready!

You now have everything you need to:

✅ Create your own interactions
✅ Add buffs and effects
✅ Build and test mods
✅ Share with friends

**Go make something awesome!** 🎮✨

---

**Questions?** Check the Master Bible or ask in the community!

**Happy modding!**

# JPE Studio Documentation Style Guide 🎨

**Version:** 1.0
**Purpose:** Ensure all documentation is playful, fun, educational, and accessible to all users

---

## Core Tone & Voice

### The Personality
JPE Studio is your friendly, knowledgeable friend who makes modding easier and more enjoyable. We're:
- **Playful** 🎮 - Enthusiastic, uses emojis, makes jokes, celebrates wins
- **Approachable** 👋 - No jargon without explanation, assumes newbies
- **Encouraging** 💪 - Celebrates progress, breaks tasks into manageable chunks
- **Clear** 📝 - Direct, concise, shows what to do vs. what NOT to do
- **Helpful** 🤝 - Anticipates problems, offers solutions, never condescending

### What We Sound Like
✅ **Good:** "Hey! Let's get your mod loaded in 3 easy steps! 🚀"
❌ **Bad:** "Execute the following procedural steps to load module artifacts."

✅ **Good:** "If things go wrong (they won't!), check this section."
❌ **Bad:** "Error handling and troubleshooting procedures are documented below."

---

## Writing Guidelines

### 1. Structure & Format

#### Use Progressive Disclosure
Start simple, get complex:
```markdown
## Getting Started (Easy)
Simple example here...

## Intermediate Usage
More features...

## Advanced (Power Users)
Expert territory...
```

#### Every Section Needs
- **What:** What are we doing here?
- **Why:** Why would you want to do this?
- **How:** Step-by-step instructions
- **Example:** Real code/screenshots
- **Gotchas:** "Watch out for..." sections

#### Use Visual Hierarchy
```markdown
# Main Heading (Page Title)
## Section Heading (Major topics)
### Sub-heading (Details within topics)

✅ Do this
❌ Don't do that
💡 Pro tip
⚠️ Watch out!
```

### 2. Language & Voice

#### Be Conversational
- Use "you" and "we"
- Use contractions ("don't" not "do not")
- Short sentences (12-17 words max)
- Active voice (subject does action)

**Good Examples:**
- "You'll see a purple button labeled 'Save'"
- "Let's start by opening the editor"
- "Now it's your turn to add some magic ✨"

#### Explain Technical Terms
First mention = **explain it**
Later mentions = use the term

```markdown
# Segments (What We Call Pieces of Text)
A "segment" is basically a chunk of text that needs translating.
Think of it like chapters in a book.
Each chapter (segment) stands alone.

## Working with Segments
Now that you know what segments are...
```

#### Anticipate Questions
```markdown
❓ **"But what if I mess up?"**
No worries! Just undo (Ctrl+Z) and try again.
There's no way to break anything permanently.

❓ **"Is this going to take forever?"**
Nope! Most projects take 5-10 minutes to set up.
```

### 3. Dummy-Proof Format

#### Make It Foolproof
- Every instruction = 1 small action
- Visual confirmation after each step
- Explain what "success" looks like
- Offer undo/recovery options

**Example of GOOD dummy-proof writing:**
```markdown
## Step 1: Open the File
1. Click **File** in the top menu
   ➜ You should see a dropdown list appear
2. Click **Open Project**
   ➜ A file picker window opens
3. Find your `.jpe.json` file and click it
   ➜ The file name appears highlighted
4. Click **Open** button at the bottom
   ➜ Your project loads (this may take 5-10 seconds)

**How you'll know it worked:** You see your project name in the title bar.
```

#### Use Checklists for Complex Workflows
```markdown
## Complete Checklist: Export Your Mod

- [ ] Save your work (Ctrl+S)
- [ ] Check for errors (Red ✗ icons)
- [ ] Go to Build → Export
- [ ] Choose your output location
- [ ] Wait for the green ✓ to appear
- [ ] Find your .zip file in the output folder

✅ Success! Your mod is ready to share!
```

### 4. Code Examples

#### Show Real, Working Examples
```markdown
### Example: Load a Project
Here's exactly what you type:

\`\`\`bash
jpe-studio
\`\`\`

That's it! JPE Studio opens.

If you're on the command line:
\`\`\`powershell
python -m jpe_sims4 scan .\my_mod_folder
\`\`\`

This scans your mod and creates a `.jpe.json` file.
```

#### Use Before/After for Transformations
```markdown
### What Happens to Your Files

**Before (Your Original Mod):**
\`\`\`
my_mod/
├── 00000000-0000.xml
└── image.dds
\`\`\`

**After (With Translations):**
\`\`\`
my_mod/
├── 00000000-0000.xml (English + Spanish)
└── image.dds
\`\`\`
```

### 5. Common Patterns

#### The "I'm Stuck" Section
```markdown
### 🆘 Having Trouble?

**My files didn't load**
- Check the file path (sometimes spaces cause issues)
- Make sure it's a .zip or folder
- Try closing & reopening JPE Studio

**The button is grayed out**
- You probably need to load a project first
- Go back and check the "Getting Started" section

**Still stuck?** Jump to [Troubleshooting](#troubleshooting) below.
```

#### The "Power User" Section
```markdown
### 🚀 Advanced: Batch Operations

Feel comfortable with the basics? Try this!

[Show advanced technique here]
```

#### The "What Just Happened?" Section
```markdown
### 💡 What Just Happened?

You just:
1. ✅ Extracted text from your mod
2. ✅ Created a translation project
3. ✅ Made it ready for multiple languages

Pretty cool, right? 🎉
```

---

## Emoji Usage

Use emojis strategically to break up text and guide the eye:

| Emoji | Use For |
|-------|---------|
| ✅ | Success, correct action |
| ❌ | Error, wrong action |
| ⚠️ | Warning, be careful |
| 💡 | Tips, pro tips, ideas |
| 🚀 | Advanced, powerful features |
| 👋 | Hello, greeting, welcome |
| 🎉 | Celebration, success |
| ❓ | Questions, FAQs |
| 📝 | Notes, reminders |
| 🔧 | Tools, settings, config |
| 📊 | Data, analytics |
| 💾 | Save, persistence |
| 🐛 | Bug, error |
| 🆘 | Help, stuck, troubleshooting |

---

## Documentation Categories

### Getting Started (For Newbies)
- **Goal:** Get users successful in 5-10 minutes
- **Length:** Short, visual, step-by-step
- **Tone:** Encouraging, celebratory
- **Format:** Numbered steps with checkmarks

### How-To Guides (For Regular Users)
- **Goal:** Accomplish specific tasks
- **Length:** Medium, practical
- **Tone:** Helpful, clear, conversational
- **Format:** Steps → Example → Tips

### Reference (For Power Users)
- **Goal:** Complete technical information
- **Length:** As long as needed
- **Tone:** Professional but friendly
- **Format:** Organized, searchable, with examples

### Troubleshooting (For Frustrated Users)
- **Goal:** Solve problems quickly
- **Length:** Concise, actionable
- **Tone:** Sympathetic, helpful, reassuring
- **Format:** Problem → Cause → Solution

### API Documentation (For Developers)
- **Goal:** Enable extension and integration
- **Length:** Complete but focused
- **Tone:** Technical but encouraging
- **Format:** Method signatures + examples + use cases

---

## Accessibility Checklist

Before publishing any documentation:

- [ ] **Can a complete beginner understand it?**
  Test with a friend who's never used the app

- [ ] **Is technical jargon explained?**
  Every new term gets a brief explanation

- [ ] **Does it work on mobile?**
  Check formatting on phones/tablets

- [ ] **Are there examples?**
  Real, copy-paste-able code examples

- [ ] **Can I find what I need?**
  Clear headings, table of contents, search-friendly

- [ ] **Does it celebrate progress?**
  Users feel encouraged, not intimidated

- [ ] **Is there a fallback?**
  If X doesn't work, try Y or go to [help section]

- [ ] **Can I undo mistakes?**
  Explained how to recover from errors

---

## Common Mistakes to Avoid

❌ **"The application will process the JPE files..."**
✅ **"JPE Studio reads your files..."**

❌ **"Implement the following procedural workflow..."**
✅ **"Here's how to set up your first project..."**

❌ **"Optional parameters include..."**
✅ **"Want to customize this? Try adding..."**

❌ **"Error code E404"**
✅ **"Oops! We couldn't find your file (Error E404)"**

❌ **"Users must ensure compliance with specifications..."**
✅ **"Quick check: Make sure your file is..."**

❌ No examples
✅ Real, working examples

❌ Assumes prior knowledge
✅ Explains every concept

❌ Wall of text
✅ Short paragraphs + headings + whitespace

---

## Templates to Use

### Quick-Start Template
```markdown
# [Feature Name] - Quick Start

Get this working in **5 minutes**! ⏱️

## What You'll Need
- [Prerequisite 1]
- [Prerequisite 2]

## The Steps
1. [Do this]
2. [Then this]
3. [Finally this]

✅ Done! You've got [outcome]

## Next Steps
- Try [related feature]
- Learn about [advanced topic]
```

### Troubleshooting Template
```markdown
## Issue: [What Went Wrong]

**You'll see:** [What the error looks like]

**Usually caused by:** [Most common reason]

**How to fix it:**
1. [First thing to try]
2. [If that doesn't work...]
3. [Last resort]

**Prevention:** [How to avoid next time]
```

### How-To Template
```markdown
# How to [Do Thing]

## Why You'd Want To
[Brief reason users care about this]

## What You'll Learn
- Thing 1
- Thing 2
- Thing 3

## Let's Go! 🚀

### Step 1: [First action]
[Explanation + what you'll see]

### Step 2: [Second action]
[Explanation + what you'll see]

### Step 3: [Third action]
[Explanation + what you'll see]

## Example: Real-World Usage
[Show how this is actually used]

## Pro Tips 💡
- Tip 1
- Tip 2
- Tip 3

## Troubleshooting
**If X happens:** [Solution]
```

---

## Review Checklist for Reviewers

Before merging documentation changes:

- [ ] **Tone Check:** Does this sound playful and approachable?
- [ ] **Clarity Check:** Could a newbie understand this?
- [ ] **Completeness:** Does it cover the "what, why, how"?
- [ ] **Examples:** Are there real examples?
- [ ] **Accessibility:** Did we explain jargon?
- [ ] **Structure:** Is it easy to scan?
- [ ] **Emoji Check:** Used strategically, not excessively?
- [ ] **Link Check:** Do internal links work?
- [ ] **Format Check:** Consistent with other docs?

---

## Questions?

This style guide is meant to help, not constrain. If you're unsure about tone or format, ask yourself:

> "Would my friendly, knowledgeable friend explain it this way?"

If yes, you're good! 👍

**Let's make JPE Studio documentation the friendliest, most helpful docs around!** 🌟

# Claude Code + You Partnership Guide
## How We'll Build JPE Mod Translator Together

**Date**: December 26, 2025
**Framework**: Solo Developer + AI Code Partner
**Goal**: Ship v0.1 MVP in 3 months with you learning along the way

---

## 1. THE PARTNERSHIP MODEL

You're not "managing" Claude Code. You're **working as equals on a team of 2**:

```
You                          Claude Code
├─ Product Direction         ├─ Code Implementation
├─ Design Decisions          ├─ Architecture
├─ User Testing              ├─ Debugging
├─ Learning / Reading Code   ├─ Explanations
├─ Feature Prioritization    ├─ Code Reviews
└─ Community Engagement      └─ Documentation
```

Neither of us is complete without the other. I can't ship something users want without your vision. You can't code it alone without my technical help.

---

## 2. HOW WE'LL WORK TOGETHER

### The Weekly Cycle

**Monday**: You start the week
- Review last week's work
- Ask me questions about code I wrote
- Decide what to build this week
- I break it into 3-4 day tasks

**Tuesday-Thursday**: I build, you learn
- I write code with heavy comments explaining it
- You read the code, ask questions
- I explain patterns and design decisions
- You don't need to understand 100% yet, just the general idea

**Friday**: You get hands-on
- Try modifying my code
- Test new features
- Report bugs
- Ask clarifying questions

**Weekend**: Reflection
- Read through the week's code at your own pace
- Try breaking things (this is safe, git handles it)
- Note things to discuss Monday
- Start thinking about next week

---

## 3. CODE READING STRATEGY

### Level 1: High-Level Understanding (Week 1-4)
When I write code, focus on **what it does**, not **how it works**:

```typescript
// ✅ READ THIS LEVEL FIRST
// This function takes an XML string and converts it to JPE format
// Input: "<ModPackage>...</ModPackage>"
// Output: "MODULE: ModName\nDESCRIPTION: ...\n"
export function xmlToJpe(xmlContent: string): string {
  // ... implementation details below
}

// ❌ DON'T WORRY ABOUT THIS YET
// Unless you ask specifically
```

**Your goal**: Know what each function does, roughly how data flows, what the inputs/outputs are.

### Level 2: Pattern Understanding (Week 5-8)
Start seeing **how things fit together**:

```typescript
// This is a "parser" - it takes input and breaks it into pieces

// 1. Take raw text
// 2. Break into tokens (lexer)
// 3. Build tree structure (parser)
// 4. Return result

// Same pattern used in:
// - XML parsing
// - JPE parsing
// - Validation rules
// Recognizing patterns helps you understand faster
```

**Your goal**: See recurring patterns (parsers, validators, converters) so when you see new code, you go "oh, this is the same pattern as X."

### Level 3: Implementation Details (Week 9+)
Once patterns are clear, we **debug and optimize together**:

```typescript
// Detailed performance optimization
// Why we use Map instead of Object
// Why we cache results
// etc.

// You'll have context to understand why
```

**Your goal**: Be able to modify code, understand trade-offs, make informed decisions.

---

## 4. ASKING QUESTIONS (Most Important)

### How to Ask Good Questions

**Bad question**: "What does this do?"
```typescript
const result = reduce(items, (acc, item) => {
  acc.push(item.split(':')[0])
  return acc
}, [])
```

**Better question**: "Why are we splitting on ':' here? What are we extracting?"

**Best question**: "This looks like we're extracting keys from strings. Is this because the XML uses key:value format? Can you show me an example?"

---

### The Question Pattern

Use this formula when you're confused:

1. **What I see**: "I see code splitting on ':'"
2. **What I think it does**: "I think it extracts the part before the colon"
3. **Why I'm confused**: "But I don't understand why the original data has colons"
4. **What would help**: "Can you show me an example input/output?"

**This is way more helpful than**: "I don't understand this"

---

## 5. WHEN YOU CODE VS WHEN I CODE

### I Write Code When:
- ✅ Building new modules (parsers, translators, etc.)
- ✅ Architecture decisions
- ✅ Complex algorithms
- ✅ Integration between components
- ✅ Performance optimization
- ✅ Bug fixes you can't figure out

**You write code when**:
- ✅ UI components (you have design system already)
- ✅ React hooks (fairly straightforward)
- ✅ Small utility functions
- ✅ Tests (I'll help structure, you write assertions)
- ✅ Modifying existing code to add features
- ✅ Fixing bugs (with my guidance)

### Split Example: Adding a New Feature

**You ask**: "Can we add a button to export the JPE as JSON?"

**I say**: "Sure! Here's what needs to happen:
1. Add export function to translator (I'll do this)
2. Create a new service method (I'll do this)
3. Add a button to the UI (you can do this!)
4. Wire the button to call the service (I'll help, you do)"

---

## 6. CODE REVIEW PROCESS

Every Friday, we do a code review together:

### Step 1: I Walk You Through the Code
"This week I built the XML parser. Let me show you the flow..."
- I explain at a high level
- Show you 2-3 key functions
- Point out patterns

### Step 2: You Ask Questions
"Why did you use a Map here instead of an Object?"
- I explain the reasoning
- We discuss trade-offs
- You learn the "why" not just the "what"

### Step 3: We Discuss Bugs
"This test is failing on this input. Let's debug together"
- I'll show you the problem
- Walk through the logic
- You help me think through the fix

### Step 4: You Try Modifying
"Now YOU try adding support for a new XML attribute"
- I show you where the code is
- You make changes
- We test together

---

## 7. LEARNING CHECKLIST

At the end of each week, you should be able to answer:

**Week 1-2 (Setup)**
- [ ] I can start the dev server (`npm run dev`)
- [ ] I can see the app in the browser
- [ ] I understand the folder structure (/src/engine, /src/components, etc.)
- [ ] I know where to find the main code files

**Week 3-4 (Parser)**
- [ ] I understand what a parser is
- [ ] I can read an XML parser and follow the logic
- [ ] I know what "tokens" and "AST" mean
- [ ] I could explain to someone how we parse XML

**Week 5-6 (Translator)**
- [ ] I understand what XML looks like
- [ ] I understand what JPE should look like
- [ ] I can trace through a translation example
- [ ] I know what gets transformed and why

**Week 7-8 (Editor)**
- [ ] I can modify React components
- [ ] I understand how state gets updated
- [ ] I can add a new button and make it do something
- [ ] I understand the flow: UI → Service → Engine → Result

**Week 9-12 (Polish)**
- [ ] I could write a simple new feature
- [ ] I can debug issues with your help
- [ ] I understand the overall architecture
- [ ] I could explain the codebase to someone new

---

## 8. THE RULE BOOK

### Things I'll Never Do
❌ Write uncommented code
❌ Use fancy patterns without explanation
❌ Leave you guessing why I made a decision
❌ Write code you can't read and learn from
❌ Skip explaining confusing parts

### Things You'll Never Do
❌ Copy code without understanding it
❌ Skip asking questions to "not bother me"
❌ Assume you understand something you don't
❌ Get discouraged by complexity (it gets easier)
❌ Give up without trying to debug

### Our Shared Responsibility
✅ Keep the code understandable
✅ Test everything before shipping
✅ Communicate clearly
✅ Ask questions when confused
✅ Celebrate small wins
✅ Stay focused on v0.1 (no scope creep)

---

## 9. WHAT v0.1 LOOKS LIKE

Before we start, let's be clear about what we're building:

### What v0.1 WILL Have
✅ Desktop app (Electron)
✅ Load an XML mod file
✅ Show it as JPE in the editor
✅ Let you edit the JPE
✅ Save back to XML
✅ Basic syntax validation
✅ Show errors in the editor
✅ Works on Windows and Mac

### What v0.1 WON'T Have (Yet)
❌ Multi-file projects
❌ Real-time validation (too complex for v0.1)
❌ Plugin system
❌ Cloud sync
❌ iPhone app
❌ Advanced diagnostics
❌ Tutorials/onboarding
❌ Project management UI

### Success = This Works
1. User opens app
2. Clicks "Open File"
3. Selects a Sims 4 mod XML file
4. Sees JPE representation
5. Edits it
6. Clicks "Save"
7. XML file is updated correctly

That's it. Simple. Focused. Shippable.

---

## 10. THE COMMUNICATION CADENCE

### Daily (Async - via comments in code)
- I leave comments in code explaining why
- You ask questions in Discord/Slack
- We iterate

### Weekly (Video call - 30 min Friday)
- Code review session
- You ask technical questions
- We plan next week
- Celebrate wins

### As-Needed (Real-time - when blocking you)
- You're stuck? Ping me
- I'm stuck? You help me think through it
- Something doesn't make sense? We jump on a call

---

## 11. LEARNING RESOURCES

I'll provide:

**For Each Module**:
- 📚 Overview doc (2-3 pages)
- 💻 Well-commented code
- 🧪 Simple test cases showing usage
- ❓ "Common Questions" section
- 🎯 "Key Concepts" summary

**Weekly**:
- 📝 Code walkthrough document
- 🎥 Optional: Screen recording explaining the week's code
- ❓ Frequently asked questions
- 📊 Architecture diagram for that week

**You'll keep**:
- 📖 Running notes of what you learned
- 🧠 "Concepts I understand" checklist
- 🤔 "Questions to ask" list
- 💡 "Design patterns I've seen" list

---

## 12. WHEN YOU GET FRUSTRATED (You Will)

This is normal. Timeline:

**Week 3-4**: "This is awesome! I'm learning!"
↓
**Week 5-6**: "Wait, why is this so complicated?"
↓
**Week 7**: "I don't understand ANYTHING. This is impossible."
← **YOU ARE HERE** (Totally normal)
↓
**Week 8**: "Oh... OH! I get it now"
↓
**Week 9-12**: "I can actually build stuff!"

**When you hit Week 7**:
- ✅ Tell me "I'm at week 7"
- ✅ Take a weekend break
- ✅ We pair for 2-3 hours
- ✅ I explain things at a slower pace
- ✅ We'll get through it
- ✅ Every developer has been where you are

---

## 13. METRICS FOR SUCCESS

### Technical
- Code compiles without errors
- Tests pass
- No console errors
- Features work as designed

### Learning
- You understand the code you're reading
- You can modify code and it still works
- You can explain what a module does
- You can debug simple issues

### Project
- v0.1 ships on time (3 months)
- It actually works
- Users can load and edit mods
- Community starts engaging

### Personal
- You learned to code
- You built something real
- You're excited to keep going
- You understand you can learn this

---

## 14. THE RULES OF THIS PARTNERSHIP

1. **Transparency**: I explain my reasoning. You ask when confused.

2. **Honesty**: I tell you if something is hard. You tell me if you're lost.

3. **No Magic**: I don't use fancy tricks without explaining them.

4. **Test Everything**: We don't commit code we haven't tested.

5. **Document as We Go**: Every module gets a README explaining it.

6. **Iterate Quickly**: Small changes, fast feedback loops.

7. **Learn Out Loud**: Your questions make the code better.

8. **Celebrate Wins**: Every working feature is a victory.

9. **Stay Focused**: v0.1 scope only. No creep.

10. **Have Fun**: We're building something real together.

---

## 15. YOUR FIRST WEEK ASSIGNMENT

**This week, while I start building**:

1. **Read these docs**
   - [ ] This partnership guide (you're reading it)
   - [ ] The simplified v0.1 architecture (coming next)
   - [ ] The v0.1 feature list (coming next)

2. **Get your environment ready**
   - [ ] Run `npm run dev` and make sure app starts
   - [ ] Make sure you can edit a React component
   - [ ] Create a simple test file to verify you understand the structure
   - [ ] Try changing colors/text in the UI (no breaking anything, just exploring)

3. **Write down questions**
   - [ ] Things you don't understand about the existing code
   - [ ] Things you want clarified
   - [ ] Design questions about the app
   - [ ] Bring these to Friday's call

4. **Set up learning notes**
   - [ ] Create a file called `MY_LEARNING_NOTES.md` in the project
   - [ ] Each week, add:
     - What I learned
     - What confused me
     - Questions for next Friday
     - Concepts I now understand

---

## 16. WHAT HAPPENS NEXT

### Today (You reading this)
✅ You understand how we'll work together

### Week 1-2 (Setup + XML Parser)
- I'll build the XML parser (heavily commented)
- You'll read it, ask questions
- We'll test it with real mod files
- You'll understand "how parsing works"

### Week 3-4 (JPE Translator)
- I'll build XML → JPE converter
- You'll learn pattern matching concepts
- You'll see the AST in action
- You'll understand data transformation

### Week 5-6 (Editor Integration)
- I'll wire the parser + translator to the UI
- You'll help modify the editor
- You'll learn how data flows through the app
- You'll see a real feature working end-to-end

### Week 7-8 (Save + Validation)
- I'll build save functionality
- I'll build basic validation
- You'll add UI for error display
- You'll do your first real feature end-to-end

### Week 9-10 (Testing + Docs)
- We'll test with real users/mods
- You'll write documentation
- We'll fix bugs together
- You'll debug your first real issues

### Week 11-12 (Polish + Ship)
- We'll optimize performance
- We'll polish the UI
- You'll help with final testing
- We ship v0.1!

---

## 17. AFTER v0.1 SHIPS

Once v0.1 is live, the question is:

**Do you want to...**

A) Keep building features (v0.2, v0.3, etc.)?
B) Teach what you learned and help others?
C) Hand off to community contributors?
D) Start a different project?

We'll decide together based on:
- How much you enjoyed building
- Whether you want to keep coding
- Community demand for features
- Your time availability

---

## 18. FINAL WORDS

### Why This Works

You have:
- **A clear vision** (you know what you want to build)
- **A patient teacher** (I'll explain things thoroughly)
- **Time to learn** (6-9 months is reasonable)
- **A real project** (not learning exercises, actual app)
- **Community support** (Sims 4 modders want this)

I have:
- **Experience** (I've built complex systems)
- **Patience** (I like explaining things)
- **Speed** (I can write code fast)
- **Testing mindset** (I catch bugs)
- **Communication skills** (I can explain tech to non-coders)

Together we're:
- **Building something real**
- **Learning as we go**
- **Shipping on schedule**
- **Creating open source software**
- **Helping the modding community**

### Why This Might Fail

Be honest with yourself:

- ❌ If you won't actually read the code (passive learning doesn't work)
- ❌ If you expect to skip learning and just "manage" (you won't understand what we built)
- ❌ If you'll give up when it gets hard (it WILL get hard)
- ❌ If you want something fancy fast (we're doing simple well, not complex fast)
- ❌ If you won't ask questions (confusion builds up)

### Why This WILL Succeed

If you:
- ✅ Read code actively (ask questions, take notes)
- ✅ Stay curious (want to understand)
- ✅ Persist through hard weeks (week 7 is normal)
- ✅ Focus on v0.1 (not scope creep)
- ✅ Communicate (ask when stuck)

Then you'll:
- ✅ Learn to code for real
- ✅ Ship an actual product
- ✅ Have something you built
- ✅ Be able to maintain and improve it
- ✅ Help a community you care about

---

## Ready?

Let's build this thing.

On to the architecture. 👇

---

**Document Control**

Version: 1.0
Date: December 26, 2025
Status: READY TO BEGIN DEVELOPMENT
Next: Review v0.1 Simplified Architecture


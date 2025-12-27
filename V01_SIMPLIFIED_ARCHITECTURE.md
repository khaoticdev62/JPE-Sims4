# v0.1 Simplified Architecture
## JPE Mod Translator - Just the Essentials

**Date**: December 26, 2025
**Scope**: Just build the core workflow, nothing else
**Timeline**: 3 months solo
**Motto**: Simple > Perfect. Working > Fancy.

---

## 1. WHAT IS v0.1?

One workflow. That's it.

```
User opens app
        ↓
User clicks "Open File"
        ↓
User selects a Sims 4 mod .xml file
        ↓
App shows JPE representation in editor
        ↓
User edits the JPE
        ↓
User clicks "Save"
        ↓
App saves back to .xml file
        ↓
Done. That's v0.1.
```

**Success**: When you can load a real mod, edit it, and save it correctly.

**That's it**. Everything else is v0.2+.

---

## 2. v0.1 FEATURE LIST

### WILL Have
- ✅ Electron desktop app (works on Windows + Mac)
- ✅ File → Open dialog
- ✅ Load XML mod file
- ✅ Parse XML
- ✅ Convert to JPE text format
- ✅ Display in code editor
- ✅ Let user edit the text
- ✅ Save button
- ✅ Save JPE changes back to XML file
- ✅ Basic syntax validation (show errors)
- ✅ Display errors in editor (red underlines)
- ✅ Error message in a panel

### WON'T Have
- ❌ Multiple files/tabs (just one file at a time)
- ❌ Real-time validation (too complex, do on-save)
- ❌ Pretty diagnostics panel (just a simple list)
- ❌ Undo/Redo (save to file, reload if needed)
- ❌ Project management
- ❌ Settings/Preferences
- ❌ Themes (just dark mode always)
- ❌ Auto-save (click save explicitly)
- ❌ Version control / history
- ❌ Multiple file formats (XML only, JPE is just display)

---

## 3. ARCHITECTURE (SUPER SIMPLE)

```
┌─────────────────────────────────────┐
│  User Interface (React)              │
│  ├─ Open File Dialog                │
│  ├─ Code Editor                     │
│  ├─ Error List                      │
│  └─ Save Button                     │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  Core Engine (TypeScript)           │
│  ├─ XML Parser                      │
│  ├─ JPE Translator                  │
│  ├─ Validator                       │
│  └─ Compiler (JPE→XML)              │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  File System (Node.js)              │
│  ├─ Open file dialog                │
│  ├─ Read XML file                   │
│  └─ Write XML file                  │
└─────────────────────────────────────┘
```

That's literally it. Not a complicated architecture. Just three layers.

---

## 4. FILE STRUCTURE (MINIMAL)

```
src/
├── engine/                          ← Core logic
│   ├── xmlParser.ts                 ← Parse XML
│   ├── jpeTranslator.ts             ← Convert to JPE
│   ├── validator.ts                 ← Check for errors
│   └── compiler.ts                  ← Convert back to XML
│
├── components/                       ← React UI
│   ├── Editor.tsx                   ← Main editor component
│   ├── ErrorList.tsx                ← Show errors
│   └── App.tsx                      ← Root component
│
├── services/                         ← Talk to file system
│   └── fileService.ts               ← Open/save files
│
└── main.ts                           ← Electron main process
```

**That's all the code you need**. Maybe 2000-3000 lines total for v0.1.

Compare that to 10,000+ lines for the team version. We're ruthlessly simple.

---

## 5. DATA FLOW (THE ONLY ONE YOU NEED TO UNDERSTAND)

### Opening a File

```
User clicks "Open" button
        ↓
fileService.openFile()
        ↓
Read XML from file system
        ↓
xmlParser.parse(xmlContent)
        ↓
Result: AST (Abstract Syntax Tree)
        ↓
jpeTranslator.toJpe(ast)
        ↓
Result: JPE text string
        ↓
Display in editor
        ↓
User sees JPE
```

### Saving a File

```
User clicks "Save" button
        ↓
Get text from editor
        ↓
validator.validate(jpeText)
        ↓
If errors: show them, don't save
If OK: continue
        ↓
compiler.toXml(jpeText)
        ↓
Result: XML string
        ↓
fileService.saveFile(xmlString)
        ↓
Write to file system
        ↓
Done
```

That's literally all the logic. 2 flows. Simple.

---

## 6. WHAT EACH MODULE DOES

### xmlParser.ts
**Input**: Raw XML string from a file
**Output**: AST (tree structure representing the data)

```typescript
// Example
const xml = `
<ModPackage>
  <Name>My Mod</Name>
  <Description>Does things</Description>
</ModPackage>
`

const ast = xmlParser.parse(xml)
// Result:
// {
//   type: 'ModPackage',
//   children: [
//     { type: 'Name', value: 'My Mod' },
//     { type: 'Description', value: 'Does things' }
//   ]
// }
```

### jpeTranslator.ts
**Input**: AST from parser
**Output**: JPE text

```typescript
// Takes the AST and converts to English-like format
const jpe = jpeTranslator.toJpe(ast)
// Result:
// MODULE: My Mod
// DESCRIPTION: "Does things"
```

### validator.ts
**Input**: JPE text
**Output**: List of errors

```typescript
// Checks if JPE is valid
const errors = validator.validate(jpeText)
// Result:
// [
//   { line: 5, message: 'Missing DESCRIPTION', severity: 'error' },
//   { line: 10, message: 'Unknown keyword', severity: 'error' }
// ]
```

### compiler.ts
**Input**: JPE text (edited by user)
**Output**: XML string (can be saved)

```typescript
// Reverse process: JPE → AST → XML
const xml = compiler.toXml(jpeText)
// Result:
// <ModPackage>
//   <Name>My Mod</Name>
//   ...
// </ModPackage>
```

---

## 7. THE SIMPLE JPE FORMAT (v0.1 ONLY)

Don't overthink this. Keep it simple.

```jpe
MODULE: NameOfMod
DESCRIPTION: "What this mod does"
VERSION: 1.0

KEY: value
KEY2: value2
```

That's it. No complex syntax yet. Just:
- One KEY: value per line
- Strings in quotes
- No nesting (for v0.1)
- MODULE at the top

We'll add complexity in v0.2+.

---

## 8. THE VALIDATION RULES (SUPER SIMPLE)

Check for these errors only:

1. **Missing MODULE**: Every file must have `MODULE: SomeName` at the top
2. **Missing DESCRIPTION**: Every module must have a DESCRIPTION
3. **Malformed keys**: Keys should be `WORD: value` format
4. **Invalid values**: Values in quotes, or numbers, or nothing else
5. **Unknown keys**: Warn about keys we don't recognize (optional)

That's it. 5 validation rules. Not 20. Just 5.

---

## 9. UI COMPONENTS (SUPER MINIMAL)

### Editor.tsx
```typescript
<div>
  <div className="toolbar">
    <button onClick={handleOpen}>Open File</button>
    <button onClick={handleSave}>Save</button>
  </div>

  <textarea
    value={jpeText}
    onChange={handleChange}
    className="editor"
  />

  <div className="errors">
    {errors.map(error => (
      <div key={error.line} className="error">
        Line {error.line}: {error.message}
      </div>
    ))}
  </div>
</div>
```

That's the whole UI. Buttons. Textarea. Error list. Done.

No fancy panels. No tabs. No themes. Just simple.

---

## 10. WHAT I'LL CODE, WHAT YOU'LL CODE

### I'll Write (Complex Logic):
- ✅ xmlParser.ts (parsing is tricky)
- ✅ jpeTranslator.ts (conversion logic)
- ✅ compiler.ts (reverse conversion)
- ✅ validator.ts (error detection)
- ✅ fileService.ts (Electron file access)

### You Can Handle (or we pair on):
- ✅ Editor.tsx (React component)
- ✅ ErrorList.tsx (simple component)
- ✅ App.tsx (wire everything together)
- ✅ Styling (make it look good)
- ✅ Testing (we'll teach you)

**Why split this way?**
- I handle the hard algorithmic stuff (parsing, compiling)
- You handle the parts where you can learn and contribute
- No wasted time on you struggling with parser theory

---

## 11. TESTING v0.1

We'll test with:

1. **Test file 1**: `clothing_mod.xml` (already in project)
   - Can we load it? ✅
   - Does JPE look right? ✅
   - Can we save changes? ✅

2. **Test file 2**: `traits_mod.xml` (already in project)
   - Can we load it? ✅
   - Does JPE look right? ✅
   - Can we save changes? ✅

3. **Test file 3**: `broken_mod.xml` (already in project)
   - Can we load it? ✅
   - Do we detect errors? ✅
   - Can we see error messages? ✅

That's it. Three test files. Three workflows. Done.

---

## 12. DEVELOPMENT PHASES

### Phase 1: XML Parser (Week 1-2)
- I build xmlParser.ts
- You read it and ask questions
- We test with real mod files

### Phase 2: JPE Translator (Week 3-4)
- I build jpeTranslator.ts
- You understand format conversion
- We see JPE output from XML input

### Phase 3: Editor Integration (Week 5-6)
- I build fileService.ts
- You build Editor.tsx
- We wire everything together
- Users can open files!

### Phase 4: Saving & Validation (Week 7-8)
- I build compiler.ts and validator.ts
- You integrate into UI
- Users can save files!

### Phase 5: Testing & Polish (Week 9-10)
- We test with real users
- Find bugs, fix them
- Polish UI
- Documentation

### Phase 6: Ship v0.1 (Week 11-12)
- Final testing
- Create installers (Windows, Mac)
- GitHub release
- Announce to community

---

## 13. SUCCESS METRICS FOR v0.1

You'll know v0.1 is done when:

✅ Can load any .xml mod file
✅ Shows sensible JPE representation
✅ User can edit the JPE text
✅ Clicking Save works
✅ Saved XML file is valid
✅ Error messages show for broken JPE
✅ Works on Windows and Mac
✅ Doesn't crash
✅ Runs without errors in console
✅ Tests pass on our 3 test files

That's it. When those 10 things are true, you're done. Ship it.

---

## 14. WHAT v0.2 WILL ADD (NOT NOW)

Save these ideas for v0.2:

- Multi-file projects
- Auto-save
- Undo/Redo
- Real-time validation
- Pretty diagnostics
- Themes
- Keyboard shortcuts
- More complex JPE syntax
- Search/replace
- Settings

Don't add them to v0.1. Focus.

---

## 15. BEFORE YOU START CODING

Make sure you have:

```bash
# Check you can run the app
npm run dev

# Should open browser with app
# You should see the existing interface

# Check git is clean
git status

# Should show no uncommitted changes (or only your notes)

# Check node version
node --version
# Should be 16+
```

If all three work, you're ready.

---

## 16. THE RULE BOOK FOR v0.1

### What We're Optimizing For
1. **Shipping fast** > Perfect code
2. **Working code** > Fancy architecture
3. **Learning** > Complexity
4. **User feedback** > Guess about v2

### What We're NOT Doing
❌ Building for scale
❌ Building for future features
❌ Optimizing for performance yet
❌ Perfecting the JPE language
❌ Building community features
❌ Building for team collaboration

### When to Stop Adding Features
**If you ask**: "Should we add X?"
**The answer is**: "Is X needed for the basic workflow (open → edit → save)?"
**If yes**: Add it to v0.1
**If no**: Add to v0.2

---

## 17. EXPECTED CHALLENGES (You WILL hit these)

### Week 3: "Parsing is Confusing"
✅ Normal. Parsers are weird. We'll explain them slowly.

### Week 6: "Nothing Works Together"
✅ Normal. Integration is hard. We'll debug step by step.

### Week 8: "The Code is a Mess"
✅ Normal. First version is always messy. We'll refactor.

### Week 10: "Is This Actually Going to Ship?"
✅ Yes. You're right on schedule. Push through.

**These are not signs you're doing something wrong.** They're signs you're learning real programming. Embrace them.

---

## 18. QUICK START CHECKLIST

Before Friday's code review:

- [ ] Read this doc
- [ ] Read the partnership guide
- [ ] Run `npm run dev`
- [ ] Understand the 3-layer architecture
- [ ] Know what the 4 modules do
- [ ] Be ready for me to start coding parser

---

## Ready?

Questions? Ask them before I start.

Once you're ready, I'll start building the xmlParser.

We ship v0.1 in 12 weeks.

Let's go.

---

**Document Control**

Version: 1.0
Date: December 26, 2025
Status: READY FOR DEVELOPMENT
Next: Start building xmlParser.ts


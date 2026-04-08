# Week-by-Week Build Plan: v0.1 in 3-4 Weeks

**Status**: STARTING NOW (Jan 1, 2025)
**Target Launch**: Week 4 (Late January)
**Scope**: 80% of full PRD (cutting lower-priority features)
**Audience**: Just you (private testing)

---

## ✅ CORE VALIDATION RULES (Deep Research Result)

From analyzing your PRD + sample data, these 7 validation rules matter most for v0.1:

### TIER 1: Must-Have (Blocks Compilation)
1. **Module Declaration Required**
   - JPE must start with `MODULE: <name>`
   - Error: "Missing MODULE declaration"

2. **Syntax: Valid Keywords**
   - Only use: MODULE, DESCRIPTION, WHEN, DO, ONLY_IF, CONDITIONS, LOCALIZATION
   - Error: "Unknown keyword: <word>"

3. **Syntax: Required Structure**
   - WHEN requires DO block
   - DO requires at least one action
   - Error: "Missing DO block after WHEN"

### TIER 2: Should-Have (Warnings)
4. **Description Required**
   - Should have DESCRIPTION
   - Warning: "Missing DESCRIPTION (recommended)"

5. **Proper Indentation**
   - Nested blocks should be indented consistently
   - Warning: "Inconsistent indentation"

6. **Localization Completeness**
   - If LOCALIZATION block exists, should have EN at minimum
   - Warning: "Missing EN localization (required for other languages)"

### TIER 3: Nice-to-Have (Info)
7. **Compatibility Warnings**
   - Warn about patterns that might conflict
   - Info: "Consider adding ONLY_IF to prevent conflicts"

---

## 📊 FEATURE PRIORITIZATION (3-4 Weeks)

### ✅ WILL INCLUDE
- [x] XML file parsing
- [x] XML → JPE translation
- [x] JPE → XML compilation
- [x] Multi-file projects
- [x] Real-time validation (debounced, not full-speed)
- [x] Code editor with syntax highlighting
- [x] Error panel with line numbers
- [x] Auto-save
- [x] Project file management (add/remove files)
- [x] Figma-designed UI (professional look)
- [x] Undo/Redo
- [x] Basic Search/Replace

### ⏱️ DEFER TO v0.2
- [ ] Auto-complete (complex, can add later)
- [ ] Hover tooltips (nice-to-have)
- [ ] Code folding (nice-to-have)
- [ ] Version history (can use git instead)
- [ ] Incremental compilation (optimization)
- [ ] Compatibility checking (research-heavy)
- [ ] Multiple themes (dark mode is enough)

---

## 🗓️ WEEK-BY-WEEK BREAKDOWN

### WEEK 1: Core Engine + Basic Editor (Jan 1-5)

**Days 1-2: Data Layer**
- ✅ Types (already done)
- ✅ XML Parser (already done)
- Build JPE Translator (XML → JPE)
- Build JPE Validator (7 rules above)

**Days 3-5: Core Logic**
- Build File Service (read/write XML)
- Build Project Manager (multi-file support)
- Build Compiler (JPE → XML)

**Deliverable**: Core engine done, no UI yet

**Time**: 40 hours

---

### WEEK 2: Editor + Integration (Jan 6-12)

**Days 1-2: Editor Component**
- Build Monaco Editor component (with syntax highlighting)
- Wire to JPE language
- Real-time validation integration

**Days 3-4: UI Layout**
- Implement Figma design
- File tree sidebar
- Error panel
- Toolbar

**Days 5: Integration**
- Wire editor to file manager
- Test loading/saving files
- Auto-save functionality

**Deliverable**: Functional editor, can open/edit/save files

**Time**: 40 hours

---

### WEEK 3: Polish + Features (Jan 13-19)

**Days 1-2: Advanced Features**
- Undo/Redo system
- Search/Replace functionality
- Syntax highlighting refinement

**Days 3-4: UI Polish**
- Match Figma designs exactly
- Animations and transitions
- Dark mode perfection
- Keyboard shortcuts

**Days 5: Testing**
- Test with real mod files (your samples)
- Bug fixes
- Performance optimization

**Deliverable**: All features working, polished UI

**Time**: 40 hours

---

### WEEK 4: Launch Prep (Jan 20-24)

**Days 1-2: Final Testing**
- Load/edit/save all 3 sample files
- Error detection validation
- Real-time validation performance

**Days 3: Build & Package**
- Create Windows installer
- Create macOS app
- Test installers work

**Days 4-5: Documentation + Launch**
- Create README
- Quick start guide
- GitHub setup
- Tag v0.1 release

**Deliverable**: Shipped v0.1

**Time**: 30 hours

---

## 📋 WHAT'S IN v0.1

### UI Components (From Figma)
- ✅ Title bar with menu
- ✅ Sidebar with file tree
- ✅ Monaco editor with syntax highlighting
- ✅ Error panel (bottom or right)
- ✅ Toolbar (Save, Compile, New, Open, etc.)
- ✅ Status bar (line numbers, file status)
- ✅ Professional dark theme

### Core Features
- ✅ Open XML file from disk
- ✅ Parse XML to internal structure
- ✅ Translate to JPE format
- ✅ Display in editor with syntax highlighting
- ✅ Edit JPE text
- ✅ Real-time validation (7 rules)
- ✅ Show errors in editor and panel
- ✅ Compile JPE back to XML
- ✅ Save XML to disk
- ✅ Multi-file project support
- ✅ Auto-save every 30 seconds
- ✅ Undo/Redo
- ✅ Search/Replace
- ✅ Create/delete project files
- ✅ Project metadata (.json)

### NOT in v0.1 (But easy to add v0.2)
- ❌ Auto-complete (smart suggestions)
- ❌ Hover help tooltips
- ❌ Code folding
- ❌ Version history viewer
- ❌ Compatibility checking
- ❌ Plugin system
- ❌ Theme switching
- ❌ Advanced diagnostics

---

## 🎯 SUCCESS CRITERIA

You'll know v0.1 is ready when:

### Functional
- ✅ Can open `/tmp/JPE_Sample_Project/clothing_mod.xml`
- ✅ Shows sensible JPE representation
- ✅ Can edit the JPE text
- ✅ Click Save → XML updates on disk
- ✅ Open it again → shows latest edits
- ✅ Real-time validation catches errors
- ✅ Can create new project with multiple files
- ✅ Can add/remove files from project
- ✅ Compile to XML works for all 3 sample files

### Quality
- ✅ No console errors
- ✅ No crashes on normal operations
- ✅ UI looks professional (matches Figma)
- ✅ Responsive (< 100ms for UI actions)
- ✅ Validation runs < 300ms per keystroke

### Launch
- ✅ GitHub repo created
- ✅ README written
- ✅ Installers created (Windows + Mac)
- ✅ Tagged v0.1 release

---

## 📈 EFFORT BREAKDOWN

| Phase | Time | What |
|-------|------|------|
| Week 1: Engine | 40 hrs | Parser, translator, validator, file service |
| Week 2: Editor | 40 hrs | UI, editor, integration |
| Week 3: Polish | 40 hrs | Features, UI perfection, testing |
| Week 4: Launch | 30 hrs | Testing, builds, documentation |
| **TOTAL** | **150 hours** | Full v0.1 |

**At full capacity**: ~38 hrs/week = 4 weeks exactly
**At reduced**: Can extend to 5-6 weeks if needed

---

## 🔧 TECH DECISIONS

### Parser/Compiler
- ✅ Hand-built parser (more control, smaller bundle)
- ✅ Simple recursive descent parser
- ✅ AST-based translation

### UI Framework
- ✅ React (already set up)
- ✅ Monaco Editor (syntax highlighting)
- ✅ Zustand (state management)
- ✅ Tailwind (styling with design tokens)
- ✅ Electron (desktop app)

### Validation
- ✅ Real-time validation (debounced 300ms)
- ✅ Not full IDE-level (keep it simple)
- ✅ 7 clear rules (not 20 ambiguous ones)

---

## 🚀 STARTING IMMEDIATELY

### Today (Right Now)
I'm building:
1. JPE Translator (XML → JPE) - 4 hours
2. JPE Validator (7 validation rules) - 3 hours
3. Compiler (JPE → XML) - 4 hours
4. File Service (read/write projects) - 3 hours

**By tomorrow end of day**: Core engine done

### Tomorrow
- Start Editor component
- Monaco integration
- Syntax highlighting

### This Week
- Full editor with validation integration
- File management
- Save/load working

---

## ✨ THE PROMISE

**3-4 weeks to ship v0.1** with:
- ✅ Fully functional mod editor
- ✅ Real-time validation
- ✅ Multi-file projects
- ✅ Professional UI (Figma design)
- ✅ Ready for your testing

---

**Let's build.** 🚀

I'm starting the JPE Translator right now.


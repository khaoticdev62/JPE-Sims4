# 🧪 Complete Template System Test Scenario

**End-to-End Test of the Mod Template System**

Follow these steps exactly to verify everything works.

---

## Prerequisites

✅ App builds successfully: `npm run build` (4.18s)  
✅ Dev server runs: `npm run dev`  
✅ No console errors on startup  

---

## Test Scenario 1: Runtime Verification (5 minutes)

### Step 1: Start Dev Server
```bash
npm run dev
```

Wait for "local: http://localhost:5173" message.

### Step 2: Open Browser Console
1. Open http://localhost:5173
2. Press F12 (or Ctrl+Shift+I on Windows)
3. Click "Console" tab

### Step 3: Run Verification Script
Copy and paste into console:

```javascript
(async () => {
  const { verifyTemplateSystem } = await import('/src/__tests__/templates/TemplateRuntimeCheck.ts')
  verifyTemplateSystem()
})()
```

### Step 4: Check Output
Look for:
```
✅ Loaded 7 templates from ModTemplates.ts
✅ Beginner: 3
✅ Intermediate: 2  
✅ Advanced: 2

✅ Template System: READY FOR PRODUCTION
```

### ✅ Result
- **PASS** if you see "READY FOR PRODUCTION"
- **FAIL** if you see errors or missing templates

---

## Test Scenario 2: Unit Test Suite (5 minutes)

### Step 1: Run Tests
```bash
npm test -- src/__tests__/templates/TemplateIntegration.test.ts
```

### Step 2: Watch Output
```
PASS  src/__tests__/templates/TemplateIntegration.test.ts

Template System Integration
  ModTemplates Library
    ✓ should export all 7 templates
    ✓ should have correct template IDs
    ✓ should categorize templates correctly
    ...
  Template Filtering
    ✓ getTemplatesByDifficulty should return beginner templates
    ✓ getTemplatesByDifficulty should return intermediate templates
    ...
  TemplateService Integration
    ✓ TemplateService.getTemplates() should return all templates
    ...

Test Suites: 1 passed, 1 total
Tests:       59 passed, 59 total
Snapshots:   0 total
Time:        2.345 s
```

### ✅ Result
- **PASS** if you see "59 passed"
- **FAIL** if any test fails (see error message)

---

## Test Scenario 3: Manual UI Testing (10 minutes)

### Step 1: Navigate to Projects
1. App running at http://localhost:5173
2. Should be on Home Dashboard
3. Click "Projects" in left sidebar (or similar)

### Step 2: Create New Project
Click "Create New Project" button
- Should see modal dialog
- Title: "Create New Project"

### Step 3: Verify Templates Display
Check that you see this section:
```
Choose a Blueprint:
  ☐ Empty Project
  ☐ Simple Interaction
  ☐ Simple Buff/Moodlet
  ☐ Simple Trait
  ☐ Interaction with Conditions
  ☐ Interaction with Multiple Outcomes
  ☐ Advanced: Chained Interactions & Loot Tables
  ☐ Hyper-Complex: Full Career System
```

**PASS** if all 8 options visible  
**FAIL** if less than 8 options

### Step 4: Select Simple Interaction Template
1. Click "Simple Interaction"
2. Should show checkmark (✓)

**PASS** if template is highlighted  
**FAIL** if template doesn't select

### Step 5: Create Project
1. Enter Project Name: "TestSimpleInteraction"
2. Click "Browse" and select a folder (Desktop, Documents, etc.)
3. Click "Create Project"
4. Wait for project to load (should say "loading...")

**PASS** if project opens without errors  
**FAIL** if you see error message

### Step 6: Verify Template Files
Project should open with editor showing files.
Left sidebar should show files like:
- interactions.jpe (or similar)
- README.md (or similar)

**PASS** if files appear  
**FAIL** if no files shown

### Step 7: View JPE Code
1. Click on ".jpe" file in sidebar
2. Main editor should show code
3. Should see JPE content (not empty!)

**Example of what you should see:**
```jpe
interaction INTERACTION_NAME {
  display_name: "Interaction Display Name"
  target_type: OBJECT

  outcome {
    name: "default_outcome"
    display_name: "Interaction Name"
    buff_reference: MOOD_HAPPY {
      duration: 60
      intensity: 1
    }
  }
}
```

**PASS** if you see JPE code  
**FAIL** if file is empty

### Step 8: Test Complex Template
1. Go back to Projects
2. Click "Create New Project" again
3. Select "Hyper-Complex: Full Career System"
4. Enter name: "TestCareerSystem"
5. Choose folder
6. Click Create
7. View the JPE file

Should see:
```jpe
enum career_level {
  ENTRY, JUNIOR, PROFESSIONAL, ...
}

skill work_ethic { ... }

interaction do_work {
  ...
  loot_table: mid_career_rewards
  ...
}
```

**PASS** if complex code loads  
**FAIL** if code is missing or simple

---

## Test Scenario 4: Integration Chain (5 minutes)

Verify the complete flow works:

### Step 1: Template Loading
Run in console:
```javascript
import { ALL_TEMPLATES } from '@/src/services/templates/ModTemplates'
console.log('Templates loaded:', ALL_TEMPLATES.length)
```

**PASS** if output is 7  
**FAIL** if output is 0 or undefined

### Step 2: TemplateService Integration
```javascript
import { TemplateService } from '@/src/services/TemplateService'
const templates = TemplateService.getTemplates()
console.log('Service templates:', templates.length)
```

**PASS** if 8 (empty + 7 mod templates)  
**FAIL** if less than 7

### Step 3: Filtering Works
```javascript
const beginners = TemplateService.getTemplatesByDifficulty('beginner')
console.log('Beginner templates:', beginners.length)
```

**PASS** if 3  
**FAIL** if 0

### Step 4: Template Files Present
```javascript
const template = TemplateService.getTemplateById('simple-interaction')
console.log('Template files:', template?.files.length)
console.log('File types:', template?.files.map(f => f.type))
```

**PASS** if you see files with types  
**FAIL** if empty

---

## Quick Test Checklist

Print this and check off as you go:

```
🧪 TEMPLATE SYSTEM TEST CHECKLIST

RUNTIME VERIFICATION
  [ ] Runtime verification runs without errors
  [ ] Shows "READY FOR PRODUCTION" message
  [ ] All 7 templates show in output

UNIT TESTS
  [ ] Test suite runs (npm test)
  [ ] 59/59 tests pass
  [ ] No failures or warnings
  [ ] Performance is good (< 10ms)

MANUAL UI TEST
  [ ] New Project dialog opens
  [ ] All 8 templates visible
  [ ] Can select each template
  [ ] Template selection highlights correctly
  [ ] Can create project with template
  [ ] Files appear in editor
  [ ] JPE code is visible
  [ ] Beginner template shows simple code
  [ ] Complex template shows complex code

INTEGRATION CHAIN
  [ ] ALL_TEMPLATES loads (7 templates)
  [ ] TemplateService.getTemplates() returns 8+
  [ ] Filtering by difficulty works
  [ ] getTemplateById() retrieves templates
  [ ] Template files are present
  [ ] File types are valid

FINAL CHECKS
  [ ] No console errors
  [ ] No console warnings
  [ ] Build still works (npm run build)
  [ ] Build time < 5s
```

---

## Expected Test Results

### ✅ All Tests Pass
```
🟢 Runtime Verification: PASS
🟢 Unit Tests: 59/59 passing
🟢 Manual UI: All steps pass
🟢 Integration: Complete
🟢 Console: No errors
🟢 Build: Successful (4.18s)

Result: ✅ SYSTEM READY FOR PRODUCTION
```

### ⚠️ Some Tests Fail
- Check error message
- Refer to TEMPLATE_TESTING_GUIDE.md for solutions
- Check console for specific error
- Re-run single test to debug

### ❌ All Tests Fail
- Check that templates file exists
- Check that imports are correct
- Check console for module not found errors
- Run `npm run build` to see full error

---

## Performance Expectations

You should see these approximate times:

| Operation | Target | Acceptable | Slow |
|-----------|--------|-----------|------|
| Templates load | < 2ms | < 5ms | > 10ms |
| Filter templates | < 1ms | < 5ms | > 10ms |
| Lookup by ID | < 0.5ms | < 2ms | > 5ms |
| Create project | < 500ms | < 1s | > 2s |

If "Slow", consider:
- Is dev server running? (slower than production build)
- Clear browser cache (Ctrl+Shift+Delete)
- Rebuild: `npm run build`

---

## Troubleshooting

### "Templates not showing in UI"
```bash
# Check service is loaded
import { TemplateService } from '@/services/TemplateService'
TemplateService.getTemplates()
```

### "Files not being created"
```bash
# Check ProjectService
import { ProjectService } from '@/services/ProjectService'
// Check if templateId is passed
```

### "Console errors"
```bash
# Look for specific error:
// - Module not found
// - Type error
// - Reference error
// - etc.
```

---

## Success Criteria

You've passed when:

✅ 7 templates load  
✅ Filtering works  
✅ Templates display in UI  
✅ Creating project with template works  
✅ Template files appear in editor  
✅ JPE code is visible  
✅ 59/59 tests pass  
✅ Runtime verification passes  
✅ No console errors  
✅ Build is successful  

**All 10 criteria met = READY TO DEPLOY! 🚀**

---

## Running Full Test Suite

For complete verification, run:

```bash
# 1. Runtime verification
npm run dev
# Then in console: (paste verification script)

# 2. Unit tests
npm test -- src/__tests__/templates

# 3. Build verification
npm run build

# 4. Manual UI test
# Open app and test manually
```

Total time: ~15-20 minutes  
Expected result: All pass ✅

---

## Report Results

Once you've run all tests, you should report:

```
Template System Test Report
Date: [Today's Date]
Status: [PASS / FAIL]

Runtime Verification: [PASS / FAIL]
Unit Tests: [59/59 PASS or specific failures]
Manual UI: [PASS / FAIL]
Integration: [PASS / FAIL]
Console: [No errors / errors present]
Build: [Success 4.18s / Failed with error]

Any issues found:
- [List any problems or errors]

Ready to deploy: [YES / NO]
```

---

**Template System - Complete Test Scenario**

Follow this guide, run the tests, and you'll have complete confidence that the system works! ✅

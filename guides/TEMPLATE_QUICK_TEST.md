# ⚡ Template System - Quick Test Reference

**Run these commands to test templates in your app RIGHT NOW**

---

## 🚀 Quick Test (Pick One)

### Option A: Browser Console Test (Fastest - 30 seconds)
```javascript
// 1. Open DevTools (F12)
// 2. Go to Console tab
// 3. Run this:

import { verifyTemplateSystem } from '@/src/__tests__/templates/TemplateRuntimeCheck'
verifyTemplateSystem()

// You'll see green ✅ or red ❌
// Look for "READY FOR PRODUCTION" message
```

### Option B: Unit Tests (Thorough - 2 minutes)
```bash
# Terminal command
npm test -- src/__tests__/templates/TemplateIntegration.test.ts

# Expect: 59 passed
```

### Option C: Manual UI Test (Visual - 5 minutes)
```bash
# 1. Start dev server
npm run dev

# 2. Open http://localhost:5173
# 3. Click "New Project"
# 4. See template list
# 5. Select a template
# 6. Create project
# 7. See JPE code in editor
```

---

## ✅ What You Should See

### Test Output Example
```
🧪 Verifying Template System...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Loaded 7 templates from ModTemplates.ts

📋 Validating Template Structure...
  ✅ Beginner: 3
  ✅ Intermediate: 2
  ✅ Advanced: 2

✅ Template System: READY FOR PRODUCTION
   7 templates loaded and verified
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### UI Should Show
```
┌─ New Project Dialog ─────────────────┐
│                                      │
│ Project Name: [____________]         │
│ Directory:    [________] [Browse]    │
│                                      │
│ Choose a Blueprint:                  │
│                                      │
│ ┌─ Simple Interaction        [✓]   │
│ ├─ Simple Buff/Moodlet              │
│ ├─ Simple Trait                     │
│ ├─ Interaction w/ Tests             │
│ ├─ Multi-Outcome Interaction        │
│ ├─ Chained Interactions             │
│ └─ Hyper-Complex Career             │
│                                      │
│ [Cancel]           [Create Project] │
└──────────────────────────────────────┘
```

---

## 🎯 Testing Checklist

After running tests, verify:

- [ ] ✅ No errors in console
- [ ] ✅ 7 templates load
- [ ] ✅ Templates display in UI
- [ ] ✅ Can select template
- [ ] ✅ Can create project
- [ ] ✅ Files appear in editor
- [ ] ✅ JPE code is visible
- [ ] ✅ Build succeeded (4.18s)

**All checked?** → ✅ **READY TO DEPLOY!**

---

## 🔍 If Something Fails

### Error: "Module not found"
```bash
# Check import in TemplateService.ts
# Should be:
import { ALL_TEMPLATES } from './templates/ModTemplates'
```

### Error: "Templates is empty"
```bash
# Check ModTemplates.ts exports
# Run in console:
import { ALL_TEMPLATES } from '@/src/services/templates/ModTemplates'
console.log(ALL_TEMPLATES.length) // Should be 7
```

### Error: "Cannot read property 'files'"
```bash
# Templates not loading correctly
# Run full verification:
import { verifyTemplateSystem } from '@/src/__tests__/templates/TemplateRuntimeCheck'
const result = verifyTemplateSystem()
console.log(result.errors) // See what failed
```

### Error: "Project files not created"
```bash
# ProjectService not injecting files
# Check ProjectService.createProject():
// Should pass templateId parameter
const project = await ProjectService.createProject(name, path, templateId)
```

---

## 📊 Quick Metrics

Should see ~this in console:
```
Templates loaded:      7
Load time:            <5ms
Filter time:          <5ms
Lookup time:          <2ms
Test cases passing:   59/59
```

If times are higher, try rebuilding:
```bash
npm run build  # Should be < 5s
```

---

## 🚀 Ready to Ship?

When all tests pass:

```bash
# 1. Build
npm run build

# 2. Deploy
git add .
git commit -m "feat: Add comprehensive mod template system"
git push

# 3. Users can now instantly create mods!
```

---

## 📞 Still Having Issues?

1. Check TEMPLATE_TESTING_GUIDE.md (detailed guide)
2. Check TEMPLATE_VERIFICATION_SUMMARY.md (full report)
3. Check console output for specific errors
4. Run: `npm test` to see all failing tests

---

**Template System Testing: QUICK REFERENCE**

🟢 All green? Deploy! 🚀  
🔴 Red errors? Check guides above ⬆️

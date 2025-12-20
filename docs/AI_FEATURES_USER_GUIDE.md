# JPE Studio - AI Features User Guide

## Introduction

JPE Studio includes powerful AI-powered features that help you write, analyze, and improve your mod code. This guide explains how to use each feature.

## Features Overview

| Feature | Shortcut | Description |
|---------|----------|-------------|
| **AI Assistant Panel** | `Ctrl+K` | Unified AI command palette for all AI actions |
| **Code Completion** | `Ctrl+Space` | AI-powered code suggestions |
| **Error Explanation** | Click error | AI explanation of what the error means |
| **Auto-Fix** | Suggestion | One-click fixes for common errors |
| **Code Health Monitor** | Dashboard | Real-time code quality metrics |
| **AI Insights** | Dashboard | Recent AI suggestions and improvements |

---

## 1. AI Assistant Panel (Ctrl+K)

### What It Does
The AI Assistant Panel is a unified command center for all AI features. It provides:
- Search and filter AI actions
- Priority-based suggestions
- Quick access to fixes and explanations
- Real-time categorized actions

### How to Use

1. **Open the Panel**
   - Press `Ctrl+K` in the editor
   - A floating dialog appears with a search input

2. **Search for Actions**
   - Type to search actions by title, description, or category
   - Results filter in real-time as you type
   - Examples:
     - Type "fix" to see all available fixes
     - Type "explain" to see explanations
     - Type "error" to find error-related actions

3. **Navigate Results**
   - Use `↑` `↓` arrow keys to navigate through suggestions
   - Results are sorted by priority (most important first)
   - High-priority fixes (⭐) appear at the top

4. **Execute an Action**
   - Press `Enter` to execute the selected action
   - Or click on an action to execute it
   - The panel closes after execution

5. **Close the Panel**
   - Press `Esc` to close without executing

### Categories
- **fix** (⭐ High Priority) - Auto-fix suggestions
- **insight** - AI explanations and analysis
- **suggestion** - Code completions and improvements
- **analysis** - Code quality analysis
- **doc** - Documentation references

### Example Workflow
```
1. Ctrl+K opens AI Assistant
2. Type "deprecated" → sees "Fix Deprecated Tag" suggestion
3. Press Enter → fix is applied
4. Dialog closes automatically
```

---

## 2. Code Completion (Ctrl+Space)

### What It Does
AI-powered code completion that understands context:
- Suggests complete code lines
- Learns from your coding style
- Provides realistic suggestions for JPE modding

### How to Use

1. **Trigger Completion**
   - Start typing in the editor
   - Press `Ctrl+Space` to force suggestions
   - Completions appear automatically while typing

2. **Accept Suggestions**
   - Press `Tab` or `Enter` to accept
   - Press `Esc` to dismiss
   - Use `↑` `↓` to navigate multiple options

3. **View Details**
   - Hover over suggestions to see descriptions
   - Check confidence scores for reliability

### Best Practices
- Use when you're unsure of the exact syntax
- Works best with complete context (variables, functions nearby)
- Faster than manual typing for repetitive code

### Example
```
You type: def calculate_
Suggestion: calculate_total(items)
        or: calculate_damage(base, modifiers)
```

---

## 3. Error Explanation

### What It Does
When you hover over an error, AI explains:
- What the error means
- Why it occurred
- How to fix it

### How to Use

1. **Hover Over Error**
   - Find an error marked with red squiggly line
   - Hover your mouse over the error
   - Explanation tooltip appears

2. **Read Explanation**
   - Detailed description of the problem
   - Root cause analysis
   - Common reasons this happens

3. **Get More Help**
   - Click "Get Fix" button if available
   - Or open AI Assistant (`Ctrl+K`) and search the error code

### Error Types Explained
- **Syntax Errors** - Invalid XML/code structure
- **Missing Tags** - Required elements are missing
- **Invalid Attributes** - Attributes don't match spec
- **Type Errors** - Wrong data type used
- **Deprecation Warnings** - Feature is outdated

### Example Error Messages
```
Error: E001 - Syntax Error
"The XML is not well-formed. Check for mismatched tags."

Error: W002 - Deprecated Tag
"<old> is deprecated since v2.0. Use <new> instead."
```

---

## 4. Auto-Fix Workflow

### What It Does
Automatically detects and fixes common errors:
- One-click fixes for known issues
- Preview changes before applying
- Undo support if something goes wrong

### How to Use

1. **View Available Fixes**
   - Use AI Assistant (`Ctrl+K`)
   - Look for fixes marked with ⭐ High Priority
   - Or check the Diagnostics panel

2. **Preview the Fix** (Optional)
   - Click "View Changes" in the dialog
   - See side-by-side comparison of original vs fixed
   - Understand what will change

3. **Apply the Fix**
   - Click "Apply Fix" button
   - Changes are applied immediately
   - Code is updated in the editor

4. **Verify Success**
   - Error disappears from code
   - Health gauge updates to show improvement
   - Notification confirms fix applied

### Undo
- Press `Ctrl+Z` to undo a fix
- Or use Edit → Undo menu

### Available Fixes
- **Missing Tag Closure** - Add missing closing tags
- **Deprecated Syntax** - Replace old syntax with new
- **Invalid Attributes** - Fix incorrect attributes
- **Type Conversion** - Fix type mismatches
- **Spacing/Formatting** - Auto-format code

### Example Auto-Fix
```
BEFORE:
<deprecated>old code</deprecated>

AFTER:
<modern>old code</modern>
```

---

## 5. Code Health Monitor

### What It Does
Displays real-time metrics about your code quality:
- Health percentage (0-100%)
- Error, warning, and suggestion counts
- Color-coded status indicator
- Animated transitions when code improves

### How to Access
- View in Dashboard on Home page
- Shows at the top of main window

### Health Levels
| Level | Range | Color | Status |
|-------|-------|-------|--------|
| **Excellent** | 90%+ | 🟢 Green | All clear! |
| **Good** | 70-89% | 🟡 Lime | Minor issues |
| **Fair** | 50-69% | 🟠 Amber | Some issues |
| **Poor** | 30-49% | 🟠 Orange | Major issues |
| **Critical** | <30% | 🔴 Red | Urgent fixes needed |

### Metrics Explained
- **Health %** - Overall code quality score
- **Errors** - Critical issues that break compilation
- **Warnings** - Potential issues that should be fixed
- **Suggestions** - Improvements for better code

### Improvement Tips
- Focus on reducing Errors first (red issues)
- Then address Warnings (yellow issues)
- Finally implement Suggestions (blue improvements)

### Example
```
Health: 85% (GOOD)
Errors: 0
Warnings: 2
Suggestions: 3

→ Click health card to see detailed breakdown
```

---

## 6. AI Insights Card

### What It Does
Shows recent AI-generated suggestions and improvements:
- Recent fixes applied
- Suggestions made
- Quality improvements detected
- Usage statistics

### How to Access
- View in Dashboard alongside Health Monitor
- Shows last 24 hours of activity
- Scrollable list of recent insights

### Insight Types
- **🟢 Improvement** - Fix applied, health improved
- **⚠️  Warning** - Potential issue detected
- **💡 Suggestion** - Code improvement recommended
- **📊 Analysis** - Code analysis completed

### Recent Insights
- Shows timestamp of when insight was generated
- Click to view more details
- Some insights include action buttons

### Example Insights
```
✓ Code Quality Improved (2 mins ago)
  Fixed 3 errors, health improved from 78% to 85%

⚠️  Missing XML Tag (5 mins ago)
  Detected missing closing tag in <define>

💡 Code Completion Used (1 hour ago)
  4 completions applied to current file
```

---

## 7. AI Settings & Configuration

### Where to Find
- Settings → AI Features
- Or press `Ctrl+,` then search "AI"

### Configuration Options

#### API Key Setup
1. **Enter API Key** (if using Gemini API)
   - Get key from Google AI Studio
   - Keep it private and secure
   - Auto-saved encrypted

2. **Test Connection**
   - Click "Test Connection" button
   - Verifies API key is valid
   - Shows response time

#### Model Selection
- **Gemini 1.5 Flash** (Default) - Fastest, recommended
- **Gemini 1.5 Pro** - More powerful, slower
- **Local LLM** - Run locally on your computer

#### Rate Limiting
- Default: 60 requests per minute
- Adjust if needed for your use case
- Prevents API throttling

#### Privacy Settings
- Offline mode - Use only local models
- Data privacy - No data sent to cloud
- Auto-encrypt API keys

### Best Practices
- Keep API key confidential
- Use Flash model for everyday work
- Use Pro model only for complex analysis
- Enable offline mode if in restricted network

---

## 8. Tips & Tricks

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Open AI Assistant |
| `Ctrl+Space` | Code Completion |
| `Ctrl+,` | Open Settings |
| `Ctrl+Z` | Undo |
| `Esc` | Close AI Panel |

### Performance Tips
1. **Faster Completions** - Use Flash model (default)
2. **Batch Fixes** - Apply multiple fixes at once
3. **Search Efficiently** - Use keywords in AI Assistant
4. **Monitor Health** - Fix issues proactively

### Troubleshooting

#### Completions Not Appearing
- Check API key is valid (Settings → AI Features)
- Ensure internet connection is active
- Try clicking "Test Connection"

#### Fixes Not Working
- Verify error is supported
- Check if code has syntax errors first
- Try manually fixing then applying AI fix

#### Health Gauge Not Updating
- Refresh diagnostics (F5 or Refresh button)
- Check that errors were actually fixed
- Close and reopen file if needed

#### Slow Performance
- Switch to Flash model (faster)
- Disable other background applications
- Check internet connection speed

---

## 9. Best Practices

### For Writing Better Code
1. **Use AI Completion** when unsure of syntax
2. **Review AI Suggestions** before applying
3. **Monitor Health Gauge** for code quality trends
4. **Read Error Explanations** to learn

### For Effective Debugging
1. **Use Error Explanation** first
2. **Review Auto-Fix Preview** before applying
3. **Check Health Metrics** after fixes
4. **Undo if needed** with `Ctrl+Z`

### For Learning
1. Read AI explanations for errors
2. Compare before/after code diffs
3. Study suggested fixes
4. Check insights for improvements

### For Production Code
1. **Test all AI-applied fixes** before deployment
2. **Review code changes** even if AI suggests
3. **Keep backups** before bulk fixes
4. **Monitor health** continuously

---

## 10. Getting Help

### Built-in Resources
- **Hover over errors** for quick explanations
- **Click help icons** throughout the app
- **Open AI Assistant** (`Ctrl+K`) for context-specific help

### External Resources
- JPE Documentation: View in app (Docs Hub)
- Project Website: www.thejpe.online
- Community Forum: forum.thejpe.online
- Discord Server: discord.gg/jpe

### Report Issues
- Report bugs through Settings → About → Report Issue
- Include error message and steps to reproduce
- Attach screenshot if helpful

---

## 11. FAQ

**Q: Is my code safe with AI?**
A: Yes! Your code stays on your computer. Only non-private API responses are sent to AI servers.

**Q: Can AI fix all errors?**
A: Most common errors are supported. Complex logic errors may need manual fixes.

**Q: How accurate are completions?**
A: About 80-90% of completions are correct. Always review before accepting.

**Q: Can I use AI offline?**
A: Yes! Enable "Offline Mode" in Settings to use local LLM only.

**Q: How much does AI cost?**
A: Free tier includes 1000 requests/month. See Settings for upgrade options.

**Q: Can I disable AI features?**
A: Yes, use Settings → AI Features → Disable to turn off.

---

## Summary

The AI features in JPE Studio are designed to:
- ✅ Make coding faster
- ✅ Reduce errors
- ✅ Improve code quality
- ✅ Help you learn
- ✅ Save time

**Master these features and you'll write better code in less time!**

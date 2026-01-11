# Phase 5C: AI/ML & Analytics Guide

## Overview

This guide covers the AI-powered intelligent features, machine learning pattern recognition, and anonymous analytics system integrated into JPE Mod Translator 2.0.

**Phase Status**: ✅ Complete (15/15 steps implemented)

### What's New

- **Claude AI Explanations** - Real AI-powered analysis of mod files
- **Smart Pattern Recognition** - Automatic detection of coding patterns and best practices
- **Optimization Suggestions** - Automated recommendations for code improvements
- **Analytics Dashboard** - Usage statistics and project insights
- **Privacy-First Telemetry** - Opt-in anonymous usage tracking

---

## Part 1: Claude AI Explanations

### Getting Started

#### 1. Get a Claude API Key

1. Visit [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Navigate to **API Keys**
4. Create a new API key
5. Copy the key (starts with `sk-`)

#### 2. Configure in JPE Translator

1. Open Settings → AI Configuration
2. Click "Configure API Key"
3. Paste your Claude API key
4. Click "Save"

The key is securely stored in your system's keychain:
- **Windows**: Windows Credential Manager
- **macOS**: Keychain
- **Linux**: Secret Service

### Using AI Explanations

1. Open any mod file in the editor
2. Click the "Explain" button in the right panel
3. Wait for Claude to analyze the file (typically <3 seconds)
4. Read the explanation with sections:
   - **Overview** - What the mod does
   - **Purpose** - Why you'd use it
   - **Key Fields** - Important parameters
   - **Effects** - Gameplay changes
   - **Tips & Warnings** - Important notes

### How It Works

**Architecture:**
```
User selects file
    ↓
useClaudeExplanation hook
    ↓
ClaudeService
    ├→ Check cache (LRU, 24-hour TTL)
    ├→ Check rate limit (50 req/min)
    ├→ Call Claude API or proxy
    └→ Cache result
    ↓
ExplainPanel displays result
```

**Performance Targets:**
- **Response Time**: <3 seconds
- **Cache Hit Rate**: >70%
- **Rate Limit**: 50 requests per minute
- **Cache Size**: 100 entries, 24-hour TTL

### Hybrid API Model

JPE Translator supports two modes:

**Direct API (User Key)**
- Use your own Claude API key
- No monthly limits (depends on your account)
- Full control
- Best for heavy use

**Proxy Tier (Coming Soon)**
- Free tier without API key
- Limited requests per month
- Perfect for casual use
- No setup needed

### API Pricing

Claude 3.5 Sonnet pricing (as of Dec 2024):
- **Input**: $3/million tokens
- **Output**: $15/million tokens

Typical explanation uses:
- **Input tokens**: 500-1000 (your file)
- **Output tokens**: 200-400 (explanation)
- **Cost per explanation**: ~$0.01-0.02

### Troubleshooting

**"API Key not working"**
- Verify key starts with `sk-`
- Check if key has API access enabled
- Visit [console.anthropic.com](https://console.anthropic.com) to verify

**"Rate limit exceeded"**
- You've made 50+ requests in the last minute
- Wait 60 seconds and try again
- Check your API usage in the Analytics dashboard

**"Connection failed"**
- Check internet connection
- Claude API may be temporarily down
- Try again in a few minutes

**"No explanation generated"**
- File might be too large (limit: 2000 chars)
- File content might be invalid XML
- Try with a different file

---

## Part 2: Smart Pattern Recognition

### Automatic Pattern Detection

JPE Translator analyzes your project to detect patterns in:

1. **Tuning References** (🔗)
   - Common tuning IDs used across files
   - Frequency and confidence scoring
   - Suggestions for extraction/reuse

2. **Enum Patterns** (📝)
   - Common enum value conventions
   - Naming pattern analysis (UPPERCASE_SNAKE, PascalCase, etc)
   - Consistency detection

3. **Structural Patterns** (🏗️)
   - Common XML tag sequences
   - Hierarchy patterns
   - Template suggestions

4. **Naming Patterns** (📛)
   - File naming conventions
   - Prefix/suffix analysis
   - Consistency scoring

### How Pattern Analysis Works

**Background Processing:**
```
Files added/modified
    ↓
PatternAnalysisService (Web Worker)
    ├→ Load cached patterns (if valid)
    ├→ Analyze new patterns
    │  ├→ Extract tuning references
    │  ├→ Extract enum values
    │  ├→ Extract XML structures
    │  └→ Extract file naming patterns
    ├→ Calculate confidence scores
    └→ Cache for 24 hours
    ↓
Smart Autocomplete
Pattern UI Updates
```

**Performance:**
- **Analysis Time**: <5 seconds for 100 files
- **Background Processing**: Non-blocking Web Worker
- **Storage**: Local browser cache (5MB max)
- **Update Frequency**: Automatic on file changes

### Smart Autocomplete

Autocomplete now learns from your patterns:

1. **Registry-Based** (always available)
   - Common Sims 4 keywords
   - Standard enum values
   - Built-in recommendations

2. **Learned Patterns** (from your project)
   - Your most-used tuning IDs
   - Your naming conventions
   - Your common structures

**Confidence Scoring:**
- **High** (🟢): Pattern appears in 80%+ of files
- **Medium** (🟡): Pattern appears in 40-80% of files
- **Low** (🔴): Pattern appears in <40% of files

### Optimization Suggestions

JPE Translator detects four types of optimizations:

1. **Redundancy** (Medium severity)
   - Tuning references used 20+ times
   - Suggestion: Extract to constant
   - Impact: Reduce duplication

2. **Naming Inconsistency** (Low severity)
   - Files don't follow project pattern
   - Suggestion: Rename for consistency
   - Impact: Better organization

3. **Unused Content** (Low severity)
   - Empty XML sections
   - Commented code blocks
   - Suggestion: Remove or clean up
   - Impact: Smaller files, clarity

4. **Duplicate Structures** (Medium severity)
   - Repeated XML hierarchies
   - Suggestion: Extract to template
   - Impact: DRY principle, maintainability

### Viewing Patterns and Suggestions

1. Open **Editor** or **Diagnostics** panel
2. Look for **Pattern Suggestions** section
3. Top 5 patterns shown by type
4. Click "Learn More" for details
5. View **Optimization Suggestions** for improvements

---

## Part 3: Analytics & Telemetry

### What Is Telemetry?

Telemetry is **anonymous, opt-in** usage data that helps improve JPE Translator.

**Key Principles:**
- ✅ **Opt-in** - Disabled by default
- ✅ **Anonymous** - Uses random UUID, not your name
- ✅ **Private** - No personal information collected
- ✅ **Transparent** - You see what's collected
- ✅ **Controllable** - Enable/disable anytime

### Privacy Guarantees

**We Collect:**
- Feature usage (which buttons clicked)
- Performance metrics (build times)
- Error reports (crash logs)
- Anonymous patterns

**We DON'T Collect:**
- ❌ Personal information (name, email)
- ❌ File contents
- ❌ Project names or paths
- ❌ API keys or credentials

**Data Processing:**
- PII automatically filtered
- Paths replaced with `<path>`
- Emails replaced with `<email>`
- API keys replaced with `<token>`
- Stack traces truncated to 500 chars

### Enabling Telemetry

**First Time:**
1. Dialog appears on first launch
2. Review what's collected
3. Check "I understand and accept"
4. Click "Enable Telemetry"

**Anytime:**
1. Settings → Privacy & Telemetry
2. Toggle "Enable Telemetry"
3. Changes saved automatically

### Analytics Dashboard

View statistics in **View → Analytics**:

**Usage Statistics:**
- Total projects created
- Total files processed
- Total compilations
- Total validations

**Performance Metrics:**
- Average compilation time
- Average validation time
- Average explanation time

**Project Complexity:**
- File count
- Total lines of code
- Complexity score (0-100)
- Tuning references used
- STBL keys used

**Activity Trends:**
- 7-day activity chart
- Daily file operation counts

### Data Storage

**Local Storage:**
- Telemetry events stored locally
- No transmission yet in beta
- Batched for efficiency (50 events or 1 min)
- Automatically cleared when disabled

**Storage Location:**
- Browser localStorage
- ~1-2MB typical usage
- Auto-cleanup of old events

### Data Retention

- **Session**: Current usage data
- **Local**: 7 days in browser cache
- **Cloud**: None (future feature)
- **Manual Clear**: Settings → Privacy & Telemetry → Clear Data

### Clearing All Data

1. Settings → Privacy & Telemetry
2. Click "Clear All Data"
3. Confirm deletion
4. All telemetry permanently deleted
5. New anonymous ID generated on restart

---

## Part 4: Architecture & Integration

### System Architecture

```
┌─────────────────────────────────────────┐
│          User Interface Layer            │
├─────────────────────────────────────────┤
│ ExplainPanel │ PatternSuggestions │ ...  │
├─────────────────────────────────────────┤
│          Hook/Store Layer                │
├─────────────────────────────────────────┤
│ useClaudeExplanation │ useTelemetry │... │
├─────────────────────────────────────────┤
│          Service Layer                   │
├─────────────────────────────────────────┤
│ ClaudeService │ PatternAnalyzer │ ...   │
├─────────────────────────────────────────┤
│          Engine/Core Layer               │
├─────────────────────────────────────────┤
│ PatternStore │ ClaudeCache │ ...        │
└─────────────────────────────────────────┘
```

### Key Services

**ClaudeService** (`src/services/ai/ClaudeService.ts`)
- API integration with caching
- Rate limiting (50 req/min)
- Hybrid API support
- Statistics tracking

**PatternAnalyzer** (`src/engine/ml/PatternAnalyzer.ts`)
- Detects 4 pattern types
- Confidence scoring
- Efficient analysis (<5s)

**PatternAnalysisService** (`src/services/ml/PatternAnalysisService.ts`)
- Web Worker management
- Timeout handling
- Results caching

**TelemetryService** (`src/services/analytics/TelemetryService.ts`)
- Event tracking
- PII sanitization
- Batching for efficiency

**AnalyticsService** (`src/services/analytics/AnalyticsService.ts`)
- Statistics calculation
- Dashboard data aggregation

### File Structure

```
src/
├── services/
│   ├── ai/
│   │   ├── ClaudeService.ts
│   │   ├── ClaudeCache.ts
│   │   └── types.ts
│   ├── api/
│   │   ├── HttpClient.ts
│   │   ├── CredentialManager.ts
│   │   └── types.ts
│   ├── editor/
│   │   └── SmartAutocompleteService.ts
│   └── analytics/
│       ├── TelemetryService.ts
│       ├── PIISanitizer.ts
│       ├── TelemetryBatcher.ts
│       ├── AnalyticsService.ts
│       └── types.ts
├── engine/ml/
│   ├── PatternAnalyzer.ts
│   ├── PatternStore.ts
│   ├── OptimizationDetector.ts
│   └── types.ts
├── stores/
│   ├── useAIStore.ts
│   └── useTelemetryStore.ts
├── hooks/
│   ├── useClaudeExplanation.ts
│   └── useTelemetry.ts
├── components/
│   ├── explain/
│   │   ├── ExplainError.tsx
│   │   └── ExplainFallback.tsx
│   ├── editor/
│   │   ├── PatternSuggestions.tsx
│   │   └── PatternInsight.tsx
│   ├── analytics/
│   │   └── AnalyticsDashboard.tsx
│   └── modals/
│       └── TelemetryConsentDialog.tsx
└── workers/
    └── patternWorker.ts
```

---

## Part 5: Advanced Topics

### Performance Tuning

**Cache Optimization:**
- Cache hit rate target: >70%
- Typical hit rate: 80-90% after warm-up
- Clear cache in Settings if experiencing issues

**Pattern Analysis Optimization:**
- Background analysis never blocks UI
- Web Worker timeout: 60 seconds
- Large projects (100+ files) analyze in <5s

**Rate Limit Management:**
- 50 requests per minute (per user session)
- Shared across all Claude features
- Automatic queue/delay if exceeded

### Credential Security

**API Key Storage:**
- Stored in OS keychain (not browser)
- Never transmitted in logs
- Never stored in localStorage
- Automatically removed on "Delete" action

**Keychain Integration:**
```typescript
// Windows: DPAPI-protected Credential Manager
// macOS: Secure Keychain
// Linux: Secret Service (via D-Bus)

await CredentialManager.saveClaudeAPIKey(apiKey)
const key = await CredentialManager.getClaudeAPIKey()
```

### Extending the System

**Adding New Pattern Types:**

```typescript
// In PatternAnalyzer.ts
private static analyzeCustomPatterns(files: ModFile[]): CustomPattern[] {
  // Your analysis logic
  return patterns
}

// In ProjectPatterns interface
customPatterns: CustomPattern[]
```

**Adding New Telemetry Events:**

```typescript
// In your component
const { trackFeature } = useTelemetry()

trackFeature('my-feature', {
  metadata: 'my-value'
})
```

**Custom Optimizations:**

```typescript
// In OptimizationDetector.ts
private static detectCustomOptimization(
  files: ModFile[],
  patterns: ProjectPatterns
): Optimization[] {
  // Your detection logic
  return optimizations
}
```

---

## Part 6: Troubleshooting

### Claude API Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "API Key Required" | No key configured | Settings → AI → Configure API Key |
| "Rate limit exceeded" | 50+ requests/min | Wait 60 seconds, check usage |
| "Connection failed" | Network issue | Check internet, try again |
| "Invalid API key" | Bad key format | Verify key starts with `sk-` |
| "<3 second target" exceeded | Network delay | Check connection speed |

### Pattern Analysis Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| No patterns detected | <3 occurrences | Add more files to project |
| "Analysis timeout" | Large project | Increase timeout or use smaller batches |
| Memory issues | Too many files | Analyze project in chunks |
| Cache not working | Storage full | Clear cache in settings |

### Telemetry Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Can't enable telemetry | localStorage full | Clear browser data |
| Data not collected | Not enabled | Enable in Settings |
| High memory usage | Events queued | Disable telemetry temporarily |
| Can't clear data | Permission error | Try again or restart app |

---

## Part 7: FAQ

**Q: Is my data secure?**
A: Yes. Data is encrypted in transit (HTTPS) and at rest (OS keychain for keys, localStorage for events).

**Q: Can I see what's being sent?**
A: Yes. All telemetry is batched locally before any transmission. You can inspect it before sending.

**Q: How much does this cost?**
A: Claude API costs ~$0.01-0.02 per explanation. Telemetry is free.

**Q: Can I use this offline?**
A: Pattern analysis and analytics work offline. Claude explanations require internet.

**Q: Does pattern analysis require internet?**
A: No. All analysis happens locally using Web Workers.

**Q: How long are patterns cached?**
A: 24 hours. After that, they're re-analyzed automatically.

**Q: Can I export my telemetry data?**
A: Yes, via Settings → Privacy & Telemetry → Export (future feature).

---

## Part 8: Monitoring & Debugging

### Console Logging

Enable debug logs in browser console:

```javascript
// View Claude service logs
console.log('Claude API calls, caching, rate limits')

// View pattern analysis logs
console.log('Pattern detection, confidence scores')

// View telemetry logs
console.log('Event batching, PII sanitization')
```

### Performance Profiling

Monitor in browser DevTools:

1. Open DevTools (F12)
2. Go to Performance tab
3. Record session
4. Look for:
   - `ClaudeService.explainMod()` duration
   - `PatternAnalyzer.analyzeProject()` duration
   - `TelemetryService.trackEvent()` overhead

### Storage Inspector

Check what's stored locally:

1. Open DevTools (F12)
2. Go to Storage → Local Storage
3. Look for keys:
   - `telemetry-*` (telemetry data)
   - `jpe-pattern-*` (pattern cache)
   - `claude-*` (API cache)

---

## Part 9: Future Enhancements

Planned features for Phase 5C v2.0:

- [ ] Free proxy tier for explanations
- [ ] Custom pattern definitions
- [ ] Multi-language support for explanations
- [ ] Pattern export/import
- [ ] Advanced analytics charts
- [ ] Real-time pattern suggestions
- [ ] AI-powered code refactoring
- [ ] Machine learning model fine-tuning

---

## Support & Resources

**Documentation:**
- `BUILD_GUIDE.md` - Building the application
- `DEPLOYMENT.md` - Deploying to production
- `TEST_STRATEGY.md` - Testing approach

**External Resources:**
- [Claude API Docs](https://docs.anthropic.com)
- [Sims 4 Modding Guide](https://forums.thesims.com/en_US/discussion/comment/forums)
- [XML Tutorial](https://www.w3schools.com/xml/)

**Getting Help:**
- GitHub Issues: Report bugs
- Discussions: Ask questions
- Email: Support contact

---

**Last Updated**: December 29, 2024
**Phase 5C Status**: ✅ Complete (v1.0.0)

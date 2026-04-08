# CODE QUALITY ACTION PLAN
## JPE Sims 4 Mod Translator 2.0 - 5-Week Remediation

**Document Date**: December 29, 2025
**Status**: Ready for Implementation
**Target Completion**: Week of January 26, 2026
**Total Tasks**: 52
**Estimated Effort**: 5 weeks (1-2 developers)

---

## OVERVIEW

This action plan addresses **20 code quality issues** identified in the comprehensive code review. Issues are organized into 8 phases, prioritized by impact and dependencies.

### Priority Breakdown
- **Critical Issues**: 5 (must fix before production)
- **High Priority**: 6 (should fix in next phase)
- **Medium Priority**: 5 (improve before phase 6)
- **Low Priority**: 4 (suggestions for future)

### Production Readiness Timeline
- **Current Status**: 7.5/10 (Not production-ready)
- **After Critical Phase**: 8/10 (Basic production-ready)
- **After All Phases**: 9/10 (Excellent quality)

---

## PHASE 1: CRITICAL ARCHITECTURE FIXES (Week 1)
**Duration**: 3-4 days
**Effort**: 24-32 hours
**Team Size**: 1-2 developers
**Blocker for**: All other phases

### Task 1.1: Refactor CompilerService Dependency Injection
**Priority**: CRITICAL
**Impact**: High (affects compilation pipeline)
**File**: `src/services/CompilerService.ts`
**Current Status**: ❌ Violates architecture

**Problem**:
```typescript
// Lines 18-19 - WRONG
import { useActivityStore } from '@/stores/useActivityStore'
import { useProjectStore } from '@/stores/useProjectStore'

export class CompilerService {
  static async compileFile(file: ModFile) {
    const currentProject = useProjectStore.getState().currentProject
    const { addActivity } = useActivityStore.getState()
  }
}
```

**Solution**:
```typescript
// New signature with callbacks
export class CompilerService {
  static async compileFile(
    file: ModFile,
    options: {
      onActivityLogged?: (activity: Activity) => void
      onProgress?: (progress: CompileProgress) => void
      onError?: (error: CompileError) => void
    } = {}
  ): Promise<CompileResult> {
    // Compilation logic
    options.onActivityLogged?.({ type: 'completed', timestamp: Date.now() })
  }
}

// Store calls service with callbacks
export const useBuildStore = create((set) => ({
  compileFile: async (file) => {
    const { addActivity } = useActivityStore.getState()
    await CompilerService.compileFile(file, {
      onActivityLogged: (activity) => addActivity(activity)
    })
  }
}))
```

**Steps**:
1. Update CompilerService method signatures to accept callbacks
2. Remove all Zustand imports from CompilerService
3. Update all callers in stores to pass callbacks
4. Add unit tests for new pattern
5. Verify build passes

**Verification**:
```bash
# Should have zero store imports
grep -n "useActivityStore\|useProjectStore" src/services/CompilerService.ts
# Result: (empty)

npm run test
npm run build
```

**Estimated Time**: 6 hours

---

### Task 1.2: Refactor ProjectService Dependency Injection
**Priority**: CRITICAL
**Impact**: High (project management)
**File**: `src/services/ProjectService.ts`
**Dependencies**: Task 1.1 (same pattern)

**Problem**: Lines 6-7 import stores directly

**Solution**: Same as Task 1.1 - use callbacks/options pattern

**Steps**:
1. Apply same callback pattern as CompilerService
2. Update method signatures for createProject, loadProject, updateProject
3. Update store calls
4. Add tests

**Estimated Time**: 4 hours

---

### Task 1.3: Add React.StrictMode to Application
**Priority**: CRITICAL
**Impact**: Medium (development safety)
**File**: `src/main.tsx`

**Problem**:
```typescript
// Current - no StrictMode
createRoot(document.getElementById("root")!).render(<App />)
```

**Solution**:
```typescript
import { StrictMode } from 'react'

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

**Why**: StrictMode detects:
- Unsafe lifecycles
- Legacy API usage
- Unexpected side effects
- Missing keys in lists

**Steps**:
1. Add StrictMode import
2. Wrap App component
3. Run dev server and check console for warnings
4. Fix any warnings (should be none)

**Estimated Time**: 1 hour

---

### Task 1.4: Fix useProjectStore State Mutation
**Priority**: CRITICAL
**Impact**: High (state management)
**File**: `src/stores/useProjectStore.ts` (line 132)

**Problem**:
```typescript
// ❌ WRONG - Direct mutation
project.metadata.updatedAt = Date.now()
get().setCurrentProject(project)
```

**Solution**:
```typescript
// ✅ CORRECT - Immutable update
const updatedProject = {
  ...project,
  metadata: {
    ...project.metadata,
    updatedAt: Date.now()
  }
}
get().setCurrentProject(updatedProject)
```

**Why**: React requires immutable state updates to detect changes

**Steps**:
1. Find all mutations in useProjectStore (search for direct assignments)
2. Convert to immutable updates using spread operator
3. Add unit tests verifying immutability
4. Verify no missed mutations

**Estimated Time**: 2 hours

---

### Task 1.5: Add Route-Level Error Boundaries
**Priority**: CRITICAL
**Impact**: High (app stability)
**Files**: `src/App.tsx`, create `src/components/layout/RouteErrorBoundary.tsx`

**Problem**:
```typescript
// Current - one boundary for entire app
<ErrorBoundary>
  <AppContent />
</ErrorBoundary>

// If SettingsPage crashes, entire app fails
```

**Solution**:
```typescript
// Create RouteErrorBoundary component
export function RouteErrorBoundary({
  children,
  routeName
}: { children: React.ReactNode; routeName: string }) {
  return (
    <ErrorBoundary
      fallback={<RouteErrorView routeName={routeName} />}
      onError={(error) => logger.error('Route error', { routeName, error })}
    >
      {children}
    </ErrorBoundary>
  )
}

// Use in App.tsx
<RouteErrorBoundary routeName="StudioHome">
  <StudioHomeDashboard />
</RouteErrorBoundary>

<RouteErrorBoundary routeName="Editor">
  <EditorLayout />
</RouteErrorBoundary>

<RouteErrorBoundary routeName="Projects">
  <ProjectsPage />
</RouteErrorBoundary>

<RouteErrorBoundary routeName="Settings">
  <SettingsPage />
</RouteErrorBoundary>
```

**Steps**:
1. Create RouteErrorBoundary component
2. Create RouteErrorView component (shows error UI)
3. Wrap each route in boundary
4. Test by throwing error in each route
5. Verify isolated error handling

**Estimated Time**: 3 hours

---

### Task 1.6: Test Critical Fixes
**Priority**: HIGH
**Impact**: Medium (validation)

**What to Test**:
- Service-store refactoring works correctly
- StrictMode detects no issues
- State mutations are eliminated
- Error boundaries isolate errors

**Steps**:
```bash
# Run full test suite
npm run test

# Run specific tests
npm test -- CompilerService
npm test -- ProjectService
npm test -- useProjectStore

# Run production build
npm run build

# Check for console warnings
npm run dev  # Look for console output
```

**Estimated Time**: 2 hours

---

## PHASE 2: LOGGING & CONFIGURATION (Week 1-2)
**Duration**: 2-3 days
**Effort**: 16-24 hours
**Team Size**: 1 developer
**Dependencies**: Phase 1 complete

### Task 2.1: Create Centralized LoggerService
**Priority**: HIGH
**File**: Create `src/services/LoggerService.ts`

**Implementation**:
```typescript
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export class Logger {
  private static level: LogLevel =
    process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG

  static setLevel(level: LogLevel): void {
    this.level = level
  }

  static debug(component: string, message: string, meta?: any): void {
    if (this.level <= LogLevel.DEBUG) {
      console.debug(
        `[${new Date().toISOString()}] [${component}] ${message}`,
        meta || ''
      )
    }
  }

  static info(component: string, message: string, meta?: any): void {
    if (this.level <= LogLevel.INFO) {
      console.info(
        `[${new Date().toISOString()}] [${component}] ${message}`,
        meta || ''
      )
    }
  }

  static warn(component: string, message: string, meta?: any): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(
        `[${new Date().toISOString()}] [${component}] ${message}`,
        meta || ''
      )
    }
  }

  static error(component: string, error: Error | string, meta?: any): void {
    const message = error instanceof Error ? error.message : error
    const stack = error instanceof Error ? error.stack : undefined

    console.error(
      `[${new Date().toISOString()}] [${component}] ${message}`,
      { ...meta, stack }
    )

    // Could integrate with error tracking service (Sentry, etc.)
  }
}
```

**Steps**:
1. Create LoggerService.ts with above implementation
2. Add unit tests (5+ test cases)
3. Verify it works in dev and production modes
4. Add to src/services/index.ts exports

**Estimated Time**: 4 hours

---

### Task 2.2: Create Configuration Constants File
**Priority**: HIGH
**File**: Create `src/constants/config.ts`

**Implementation**:
```typescript
// Rate limiting configuration
export const RATE_LIMITS = {
  CLAUDE_API: {
    MAX_REQUESTS: 50,
    WINDOW_SECONDS: 60,
    DESCRIPTION: 'Claude API requests per minute'
  },
  TELEMETRY: {
    BATCH_SIZE: 10,
    FLUSH_INTERVAL_MS: 30000,
    DESCRIPTION: 'Telemetry event batching'
  }
}

// Caching configuration
export const CACHE_CONFIG = {
  CLAUDE: {
    MAX_ENTRIES: 100,
    TTL_HOURS: 24,
    TTL_MS: 24 * 60 * 60 * 1000,
    DESCRIPTION: 'Claude API response cache'
  },
  PARSER: {
    MAX_ENTRIES: 500,
    TTL_HOURS: 1,
    TTL_MS: 60 * 60 * 1000,
    DESCRIPTION: 'Parser result cache'
  },
  PATTERN: {
    MAX_ENTRIES: 200,
    TTL_HOURS: 24,
    TTL_MS: 24 * 60 * 60 * 1000,
    DESCRIPTION: 'Pattern analysis cache'
  }
}

// Application limits
export const LIMITS = {
  RECENT_PROJECTS: 10,
  MAX_PII_STRING_LENGTH: 200,
  STACK_TRACE_MAX_LENGTH: 500,
  PATTERN_ANALYSIS_TIMEOUT_MS: 60000,
  MAX_FILE_SIZE_MB: 50,
  MAX_PROJECT_FILES: 1000
}

// Feature flags
export const FEATURES = {
  ENABLE_CLAUDE_API: process.env.REACT_APP_CLAUDE_ENABLED !== 'false',
  ENABLE_TELEMETRY: process.env.REACT_APP_TELEMETRY_ENABLED === 'true',
  ENABLE_PATTERN_ANALYSIS: true
}
```

**Steps**:
1. Create config.ts file
2. Update services to import from config (not hardcoded)
3. Create .env.example with configuration options
4. Document in README.md

**Estimated Time**: 3 hours

---

### Task 2.3: Replace Console Statements with Logger (182 instances)
**Priority**: HIGH
**Files**: 47 files with console.* calls

**Strategy**:
Use find-and-replace in VSCode with proper handling:

```
Find:     console\.log\((.*)\)
Replace:  Logger.debug('ComponentName', $1)

Find:     console\.debug\((.*)\)
Replace:  Logger.debug('ServiceName', $1)

Find:     console\.error\((.*)\)
Replace:  Logger.error('FileName', $1)
```

**Files with Most Console Calls**:
1. `src/services/ai/ClaudeService.ts` (8 instances)
2. `src/services/analytics/TelemetryService.ts` (4 instances)
3. `src/stores/useAIStore.ts` (9 instances)
4. Plus 44 more files

**Steps**:
1. Import Logger in each file: `import { Logger } from '@/services/LoggerService'`
2. Replace console.* calls with Logger.* (use find-replace with regex)
3. Add component/service name to each logger call
4. Test that logging still works: `npm run dev` and check console
5. Verify zero console.log in production build

**Verification**:
```bash
# Should find zero console calls
grep -r "console\." src/ | grep -v "Logger"
# Result: (empty)
```

**Estimated Time**: 8 hours

---

### Task 2.4: Update Services to Use Configuration Constants
**Priority**: MEDIUM
**Affected Services**: ClaudeService, TelemetryService, ParserCache, etc.

**Example Changes**:

```typescript
// Before
export class ClaudeService {
  private rateLimiter = new RateLimiterRes({
    points: 50,  // ❌ Hardcoded
    duration: 60
  })

  private cache = new LRUCache({
    max: 100,    // ❌ Hardcoded
    ttl: 24 * 60 * 60 * 1000  // ❌ Hardcoded
  })
}

// After
import { RATE_LIMITS, CACHE_CONFIG } from '@/constants/config'

export class ClaudeService {
  private rateLimiter = new RateLimiterRes({
    points: RATE_LIMITS.CLAUDE_API.MAX_REQUESTS,
    duration: RATE_LIMITS.CLAUDE_API.WINDOW_SECONDS
  })

  private cache = new LRUCache({
    max: CACHE_CONFIG.CLAUDE.MAX_ENTRIES,
    ttl: CACHE_CONFIG.CLAUDE.TTL_MS
  })
}
```

**Steps**:
1. Identify all hardcoded values in services
2. Replace with corresponding config constants
3. Test services still work correctly
4. Document configuration options

**Estimated Time**: 4 hours

---

## PHASE 3: TYPE SAFETY IMPROVEMENTS (Week 2)
**Duration**: 3-4 days
**Effort**: 24-32 hours
**Team Size**: 1 developer
**Dependencies**: Phase 1, 2 complete

### Task 3.1: Reduce 'any' Type Usage (122 → <20)
**Priority**: HIGH
**Impact**: High (type safety)

**Locations with 'any'**:
1. `src/services/CompilerService.ts` (3 instances) - line 194, 201, 330
2. `src/services/analytics/PIISanitizer.ts` (5 instances) - lines 37, 51, 74, 131, 132
3. `src/engine/jpe/parser.ts` (1 instance) - line 36
4. Plus 94 more across codebase

**Strategy**:
For each `any`:
1. Understand actual type needed
2. Create proper interface/type
3. Replace `any` with proper type
4. Add validation if needed

**Example Fixes**:

```typescript
// ❌ Current
static formatDiagnostics(inputs: any[]): any {
  return inputs.map(...)
}

// ✅ Fixed
interface DiagnosticInput {
  line: number
  column: number
  message: string
  severity: 'error' | 'warning' | 'info'
}

interface FormattedDiagnostic {
  id: string
  line: number
  column: number
  message: string
  severity: DiagnosticSeverity
  file: string
}

static formatDiagnostics(inputs: DiagnosticInput[]): FormattedDiagnostic[] {
  return inputs.map(...)
}
```

**Steps**:
1. Run TypeScript with stricter settings: `tsc --noImplicitAny`
2. For each `any`, create proper type definition
3. Update function signatures
4. Add tests
5. Verify compilation: `npm run build`

**Target**: Reduce from 122 to <20 `any` uses (only for truly dynamic data)

**Estimated Time**: 12 hours

---

### Task 3.2: Create Proper Type Definitions
**Priority**: HIGH
**Files**: `src/types/index.ts`, create new type files

**Missing Type Definitions**:
1. `DiagnosticInput` / `FormattedDiagnostic` (from 3.1)
2. `ASTNode` for parser
3. `CompileOptions` / `CompileResult`
4. `ValidationResult` interfaces
5. `EditorConfig` types
6. `CacheEntry<T>` generic type

**Implementation**:

```typescript
// src/types/compiler.ts
export interface CompileOptions {
  format: 'xml' | 'jpe' | 'stbl'
  validate: boolean
  generateSourceMap: boolean
}

export interface CompileResult {
  success: boolean
  output?: string
  diagnostics: Diagnostic[]
  duration: number
}

// src/types/validation.ts
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  rule: string
  line: number
  column: number
  message: string
  suggestion?: string
}

// src/types/editor.ts
export interface EditorConfig {
  theme: 'dark' | 'light'
  fontSize: number
  fontFamily: string
  tabSize: number
  lineNumbers: boolean
  minimap: boolean
}
```

**Steps**:
1. Review current type definitions
2. Create new type files organized by domain
3. Export from `src/types/index.ts`
4. Update imports across codebase
5. Verify no `any` imports from types

**Estimated Time**: 8 hours

---

### Task 3.3: Fix PIISanitizer Input Validation
**Priority**: HIGH
**File**: `src/services/analytics/PIISanitizer.ts`

**Problem**:
```typescript
// ❌ Accepts 'any', no validation
static sanitize(data: any): any {
  if (typeof data === 'object') {
    // Could be Date, RegExp, Function, Map, Set, etc.
    for (const [key, value] of Object.entries(data)) { ... }
  }
}
```

**Solution**:
```typescript
interface SanitizableData {
  [key: string]: unknown
}

static sanitize(data: unknown): unknown {
  // Validate type
  if (data === null || data === undefined) return data

  if (typeof data === 'string') return this.sanitizeString(data)
  if (typeof data === 'number') return data
  if (typeof data === 'boolean') return data
  if (Array.isArray(data)) return data.map(item => this.sanitize(item))

  if (typeof data === 'object') {
    // Check if it's a plain object
    if (!this.isPlainObject(data)) {
      return '[non-serializable object]'
    }

    return Object.entries(data as Record<string, unknown>)
      .reduce((acc, [key, value]) => {
        acc[key] = this.sanitize(value)
        return acc
      }, {} as SanitizableData)
  }

  return undefined
}

private static isPlainObject(obj: unknown): obj is Record<string, unknown> {
  if (typeof obj !== 'object' || obj === null) return false
  if (Object.prototype.toString.call(obj) !== '[object Object]') return false
  return true
}
```

**Steps**:
1. Update method signatures with proper types
2. Add type guards for different object types
3. Add validation tests
4. Test with edge cases

**Estimated Time**: 4 hours

---

### Task 3.4: Add Zod Runtime Validation
**Priority**: MEDIUM
**File**: Create `src/types/schemas.ts`

**Why Zod**: Runtime validation for API responses and data boundaries

**Implementation**:
```typescript
import { z } from 'zod'

// Define reusable schemas
const DiagnosticSchema = z.object({
  id: z.string().uuid(),
  line: z.number().positive(),
  column: z.number().non_negative(),
  message: z.string(),
  severity: z.enum(['error', 'warning', 'info', 'success']),
  file: z.string(),
  suggestion: z.string().optional()
})

const CompileResultSchema = z.object({
  success: z.boolean(),
  output: z.string().optional(),
  diagnostics: z.array(DiagnosticSchema),
  duration: z.number().positive()
})

// Export types from schemas
export type DiagnosticType = z.infer<typeof DiagnosticSchema>
export type CompileResultType = z.infer<typeof CompileResultSchema>

// Use at boundaries
export function validateCompileResult(data: unknown): CompileResultType {
  return CompileResultSchema.parse(data)
}
```

**Steps**:
1. Create `src/types/schemas.ts`
2. Define schemas for major data types
3. Add validation at API boundaries
4. Test with invalid data

**Estimated Time**: 6 hours

---

## PHASE 4: SERVICE IMPROVEMENTS (Week 2-3)
**Duration**: 3-4 days
**Effort**: 24-32 hours
**Team Size**: 1-2 developers
**Dependencies**: Phase 1, 2, 3 complete

### Task 4.1: Implement Service Lifecycle Management
**Priority**: HIGH
**Affected Services**: ClaudeService, TelemetryService, AnalyticsService, PatternAnalysisService

**Problem**: Services hold state indefinitely, can't be reset for testing

**Solution**: Implement Disposable interface and lifecycle methods

```typescript
// Create src/interfaces/Disposable.ts
export interface Disposable {
  dispose(): void
}

// Update ClaudeService
export class ClaudeService implements Disposable {
  private static instance: ClaudeService | null = null

  private constructor() { ... }

  static getInstance(): ClaudeService {
    if (!this.instance) {
      this.instance = new ClaudeService()
      this.instance.initialize()
    }
    return this.instance
  }

  // ✅ NEW: Cleanup method
  dispose(): void {
    this.cache?.clear()
    this.rateLimiter?.reset()
    this.client = null
    Logger.debug('ClaudeService', 'Disposed')
  }

  // ✅ NEW: Reset for testing
  static resetInstance(): void {
    if (this.instance) {
      this.instance.dispose()
      this.instance = null
    }
  }
}

// Usage in tests
beforeEach(() => {
  ClaudeService.resetInstance() // Clean state
})

afterEach(() => {
  ClaudeService.getInstance().dispose()
})
```

**Steps**:
1. Create Disposable interface
2. Add dispose() to ClaudeService
3. Add dispose() to TelemetryService
4. Add dispose() to AnalyticsService
5. Add dispose() to PatternAnalysisService
6. Update tests to call resetInstance()

**Estimated Time**: 6 hours

---

### Task 4.2: Fix ClaudeService Rate Limiter Race Condition
**Priority**: HIGH
**File**: `src/services/ai/ClaudeService.ts` (lines 108-118)

**Problem**:
```typescript
// ❌ Rate limit check then cache check
await this.rateLimiter.consume(1)  // Point consumed!

const cachedResult = this.cache.get(cacheKey)
if (cachedResult) {
  return { cached: true, ... }  // But returned from cache
}
// Point wasted on cache hit!
```

**Solution**:
```typescript
// ✅ Cache check first, then rate limit
const cacheKey = this.getCacheKey(name, content)
const cachedResult = this.cache.get(cacheKey)

if (cachedResult) {
  Logger.debug('ClaudeService', 'Cache hit', { name })
  return { ...cachedResult, cached: true }
}

// Only consume point if cache miss
await this.rateLimiter.consume(1)

// Make API call
const result = await this.explainWithRetry(name, content)
this.cache.set(cacheKey, result)

return { ...result, cached: false }
```

**Steps**:
1. Reorder cache check before rate limiter
2. Add metrics to track cache hit/miss
3. Add tests for both paths
4. Verify no rate limit point waste

**Estimated Time**: 2 hours

---

### Task 4.3: Improve PIISanitizer Error Handling
**Priority**: HIGH
**File**: `src/services/analytics/PIISanitizer.ts`

**Current Issues**:
- No error handling for invalid input
- Silent failures on edge cases
- No logging of sanitization issues

**Improvement**:
```typescript
export class PIISanitizer {
  private static readonly MAX_STRING_LENGTH = 200

  // Add error tracking
  private static errors: SanitizationError[] = []

  static sanitize(data: unknown): unknown {
    try {
      return this.sanitizeRecursive(data, 0)
    } catch (error) {
      const err: SanitizationError = {
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error',
        data: typeof data === 'string' ? data.substring(0, 100) : typeof data
      }
      this.errors.push(err)

      if (this.errors.length > 100) {
        this.errors = this.errors.slice(-100) // Keep last 100
      }

      Logger.warn('PIISanitizer', 'Sanitization error', { error: err })
      return '[sanitization error]'
    }
  }

  static getErrors(): SanitizationError[] {
    return [...this.errors]
  }
}
```

**Steps**:
1. Add error tracking
2. Add try-catch blocks
3. Log errors through Logger
4. Add method to retrieve errors
5. Add tests for error cases

**Estimated Time**: 3 hours

---

### Task 4.4: Add Abort Mechanism to Pattern Worker
**Priority**: MEDIUM
**File**: `src/workers/patternWorker.ts`

**Current Problem**:
```typescript
} else if (type === 'cancel') {
  self.close()  // ❌ Abrupt close, no cleanup
}
```

**Improved Solution**:
```typescript
let analysisAborted = false

self.onmessage = (event: MessageEvent) => {
  const { type, data } = event.data

  if (type === 'analyze') {
    analysisAborted = false
    performAnalysis(data)
  } else if (type === 'cancel') {
    analysisAborted = true
    self.postMessage({
      type: 'cancelled',
      timestamp: Date.now()
    })
  }
}

function performAnalysis(files: ModFile[]) {
  const patterns: ProjectPatterns = {
    tuning: [],
    enum: [],
    naming: [],
    structural: []
  }

  for (const file of files) {
    if (analysisAborted) {
      self.postMessage({
        type: 'cancelled',
        partial: patterns,
        reason: 'User cancelled'
      })
      return
    }

    // Perform analysis with periodic abort checks
    analyzeFile(file, patterns)
  }

  self.postMessage({
    type: 'complete',
    patterns
  })
}
```

**Steps**:
1. Add `analysisAborted` flag
2. Check flag in analysis loop
3. Send cancellation message
4. Test abort during analysis

**Estimated Time**: 2 hours

---

## PHASE 5: TESTING IMPROVEMENTS (Week 3-4)
**Duration**: 5-6 days
**Effort**: 40-48 hours
**Team Size**: 1-2 developers
**Dependencies**: Phase 1, 2, 3, 4 complete
**Target**: 70% overall coverage (currently ~30%)

### Task 5.1: Test Refactored Services (CompilerService, ProjectService)
**Priority**: CRITICAL
**Files**: Create `src/services/__tests__/CompilerService.test.ts`, `ProjectService.test.ts`

**Test Cases for CompilerService** (15+ cases):
```typescript
describe('CompilerService', () => {
  // Setup/Teardown
  beforeEach(() => {
    CompilerService.resetInstance()
  })

  // Basic functionality
  it('should compile JPE file to XML', async () => { ... })
  it('should return diagnostics on validation errors', async () => { ... })
  it('should format diagnostics correctly', () => { ... })

  // Callbacks
  it('should call onActivityLogged callback on completion', async () => { ... })
  it('should call onProgress callback during compilation', async () => { ... })
  it('should call onError callback on failure', async () => { ... })

  // Error handling
  it('should handle invalid input gracefully', async () => { ... })
  it('should throw on null file', async () => { ... })
  it('should recover from compilation errors', async () => { ... })

  // Edge cases
  it('should handle empty files', async () => { ... })
  it('should handle very large files', async () => { ... })
  it('should handle special characters in file content', async () => { ... })

  // Performance
  it('should compile within timeout', async () => { ... })
  it('should cache results correctly', async () => { ... })

  // Integration
  it('should work with all file types', async () => { ... })
})
```

**Estimated Time**: 12 hours

---

### Task 5.2: Test All Zustand Stores (Currently only 1 has tests)
**Priority**: HIGH
**Files**: Create tests for useProjectStore, useEditorStore, useDiagnosticStore, etc. (12 stores total)

**Template Test**:
```typescript
import { act } from 'react-dom/test-utils'
import { useProjectStore } from '@/stores/useProjectStore'

describe('useProjectStore', () => {
  beforeEach(() => {
    // Reset store
    useProjectStore.setState(useProjectStore.getInitialState())
  })

  it('should initialize with default state', () => {
    const { projects, currentProject } = useProjectStore.getState()
    expect(projects).toEqual([])
    expect(currentProject).toBeNull()
  })

  it('should add project immutably', () => {
    const project = createMockProject()

    act(() => {
      useProjectStore.getState().addProject(project)
    })

    const { projects } = useProjectStore.getState()
    expect(projects).toHaveLength(1)
    expect(projects[0]).toEqual(project)
  })

  it('should update metadata immutably', () => {
    const project = createMockProject()
    act(() => useProjectStore.getState().addProject(project))

    act(() => {
      useProjectStore.getState().updateProjectMetadata(project.id, {
        updatedAt: Date.now()
      })
    })

    // Verify immutability - original project unchanged
    expect(project.metadata.updatedAt).not.toBeDefined()
  })

  // ... more tests
})
```

**Estimated Time**: 16 hours (12-15 test files, ~10 tests each)

---

### Task 5.3: Test Custom Hooks (Currently minimal coverage)
**Priority**: HIGH
**Files**: Create tests for 7 hooks: useClaudeExplanation, useTelemetry, useProjectForm, etc.

**Example Test**:
```typescript
import { renderHook, act } from '@testing-library/react'
import { useClaudeExplanation } from '@/hooks/useClaudeExplanation'

describe('useClaudeExplanation', () => {
  it('should fetch explanation on file change', async () => {
    const file = createMockModFile()

    const { result } = renderHook(() => useClaudeExplanation(file))

    expect(result.current.loading).toBe(true)

    await act(async () => {
      await new Promise(r => setTimeout(r, 100))
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.explanation).toBeDefined()
  })

  // ... more tests
})
```

**Estimated Time**: 8 hours (7 hooks, ~8-10 tests each)

---

### Task 5.4: Test Critical Components (Currently only 1 component test)
**Priority**: MEDIUM
**Files**: Create tests for 10 components: Button, Modal, TextInput, Editor, etc.

**Example Test**:
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import Button from '@/components/common/Button'

describe('Button Component', () => {
  it('should render with children text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('should call onClick handler', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click</Button>)

    fireEvent.click(screen.getByText('Click'))
    expect(handleClick).toHaveBeenCalledOnce()
  })

  it('should apply variant styles', () => {
    const { container } = render(<Button variant="danger">Delete</Button>)
    const button = container.querySelector('button')
    expect(button).toHaveClass('bg-state-error')
  })

  it('should be disabled when isLoading is true', () => {
    render(<Button isLoading>Wait</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

**Estimated Time**: 8 hours (10 components, ~5-7 tests each)

---

### Task 5.5: Create Integration Tests for Key Workflows
**Priority**: MEDIUM
**Files**: Create `src/__tests__/integration/service-store-pattern.test.ts`, etc.

**Test Scenarios**:
1. Service-to-store callback pattern works correctly
2. Error boundaries isolate route errors
3. Logger service captures all levels
4. Zod validation catches invalid data
5. Service lifecycle disposal works

**Estimated Time**: 6 hours

---

### Task 5.6: Achieve Test Coverage Goals
**Priority**: MEDIUM

**Current Coverage**: ~30%
**Target Coverage**: 70%

**Process**:
```bash
npm run test:coverage

# Review coverage report
open coverage/index.html

# Identify gaps:
# - src/components/: 10% → 60%
# - src/services/: 20% → 85%
# - src/stores/: 15% → 80%
# - src/engine/: 40% → 75%
```

**Estimated Time**: 4 hours (review and gap analysis)

---

## PHASE 6: VALIDATION & SECURITY (Week 4)
**Duration**: 2-3 days
**Effort**: 16-24 hours
**Team Size**: 1 developer

### Task 6.1: Create Input Validation Service
**Priority**: MEDIUM
**File**: Create `src/services/InputValidator.ts`

```typescript
export class InputValidator {
  static validateProjectName(name: string): ValidationResult {
    if (!name || name.trim().length === 0) {
      return { valid: false, error: 'Project name cannot be empty' }
    }

    if (name.length > 255) {
      return { valid: false, error: 'Project name too long (max 255 chars)' }
    }

    if (!/^[a-zA-Z0-9_\-\s]+$/.test(name)) {
      return { valid: false, error: 'Invalid characters in project name' }
    }

    return { valid: true }
  }

  static validateFilePath(path: string): ValidationResult {
    // Validate doesn't contain ../ or other path traversal
    if (path.includes('..') || path.startsWith('/')) {
      return { valid: false, error: 'Invalid file path' }
    }

    return { valid: true }
  }

  // ... more validators
}
```

**Estimated Time**: 4 hours

---

### Task 6.2: Apply Input Validation to Form Components
**Priority**: MEDIUM

**Example**:
```typescript
function CreateProjectForm() {
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState<string | null>(null)

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setName(value)

    // Validate on change
    const result = InputValidator.validateProjectName(value)
    setNameError(result.error || null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate before submit
    const result = InputValidator.validateProjectName(name)
    if (!result.valid) {
      setNameError(result.error)
      return
    }

    // Submit valid data
    await projectService.createProject({ name })
  }

  return (
    <form onSubmit={handleSubmit}>
      <TextInput
        label="Project Name"
        value={name}
        onChange={handleNameChange}
        error={!!nameError}
        helperText={nameError}
      />
    </form>
  )
}
```

**Estimated Time**: 6 hours

---

### Task 6.3: Validate API Responses with Zod
**Priority**: MEDIUM

**Example**:
```typescript
// At service boundary
export async function getProjectMetadata(projectId: string) {
  const response = await httpClient.get(`/projects/${projectId}`)

  // Validate before returning
  return ProjectMetadataSchema.parse(response.data)
}

// If invalid, Zod throws ZodError
// Catch and handle appropriately
try {
  const metadata = await getProjectMetadata(id)
} catch (error) {
  if (error instanceof ZodError) {
    Logger.error('API', 'Invalid response format', { error: error.issues })
    throw new APIError('Invalid server response')
  }
}
```

**Estimated Time**: 4 hours

---

### Task 6.4: Security Audit
**Priority**: MEDIUM

**Checklist**:
- [ ] No credentials hardcoded (check src/services/ai/ClaudeService.ts)
- [ ] Credentials only in OS keychain (keytar)
- [ ] No PII in logs or localStorage
- [ ] Input validation on all forms
- [ ] XSS prevention (React auto-escapes, verify custom HTML)
- [ ] Rate limiting working (50 req/min)
- [ ] Error messages don't leak sensitive info

**Estimated Time**: 4 hours

---

## PHASE 7: DOCUMENTATION & PERFORMANCE (Week 4-5)
**Duration**: 2-3 days
**Effort**: 12-16 hours

### Task 7.1: Add JSDoc Documentation
**Priority**: MEDIUM
**Coverage**: All public services and components

**Example**:
```typescript
/**
 * Compiles a JPE mod file to Sims 4 XML format.
 *
 * @param file The mod file to compile
 * @param options Configuration options for compilation
 * @param options.onActivityLogged Callback when activity is logged
 * @param options.onProgress Callback for compilation progress
 * @param options.onError Callback on compilation error
 * @returns Promise resolving to compilation result
 * @throws {CompilationError} If compilation fails
 *
 * @example
 * const result = await CompilerService.compileFile(file, {
 *   onActivityLogged: (activity) => console.log(activity),
 *   onProgress: (progress) => setProgress(progress)
 * })
 */
export class CompilerService {
  static async compileFile(
    file: ModFile,
    options: CompileOptions = {}
  ): Promise<CompileResult> { ... }
}
```

**Estimated Time**: 6 hours

---

### Task 7.2: Create Architecture Documentation
**Priority**: MEDIUM
**File**: Create `ARCHITECTURE.md`

**Content**:
- New service-store pattern (callbacks)
- Data flow diagrams
- Error handling strategy
- Type safety approach
- Testing patterns

**Estimated Time**: 4 hours

---

### Task 7.3: Audit Bundle Size
**Priority**: LOW

**Process**:
```bash
npm run build
# Check dist/ size

# Analyze bundles
npm install -D @webpack-bundle-analyzer
# Configure Vite plugin

npm run build  # See bundle analysis
```

**Action Items**:
- Identify duplicate packages
- Review 40+ Vite aliases for necessity
- Consolidate similar dependencies

**Estimated Time**: 3 hours

---

### Task 7.4: Implement Route Lazy Loading
**Priority**: LOW

**Example**:
```typescript
import { lazy, Suspense } from 'react'

const StudioHomeDashboard = lazy(() =>
  import('@/pages/StudioHomeDashboard')
)

const ProjectsPage = lazy(() =>
  import('@/pages/ProjectsPage')
)

export function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      {activeView === 'home' && <StudioHomeDashboard />}
      {activeView === 'projects' && <ProjectsPage />}
    </Suspense>
  )
}
```

**Estimated Time**: 2 hours

---

## PHASE 8: FINAL VALIDATION (Week 5)
**Duration**: 1-2 days
**Effort**: 8-12 hours

### Task 8.1: Run Full Test Suite
```bash
npm run test:all

# Expected output:
# ✓ 300+ tests passing
# ✓ 70%+ coverage
# ✓ Zero skipped tests
```

**Estimated Time**: 2 hours

---

### Task 8.2: Run Linting & Type Checking
```bash
npm run lint
npm run format
npx tsc --noEmit

# Fix all errors (should be none)
```

**Estimated Time**: 2 hours

---

### Task 8.3: Production Build Validation
```bash
npm run build

# Verify:
# ✓ No console warnings
# ✓ Build succeeds
# ✓ Size acceptable
# ✓ Assets load correctly
```

**Estimated Time**: 1 hour

---

### Task 8.4: Create Refactoring Summary
**Priority**: HIGH
**File**: Create `REFACTORING_SUMMARY.md`

**Content**:
- Issues fixed (20 total)
- Improvements made
- Performance gains
- Test coverage improvement (30% → 70%)
- Code quality score (7.5/10 → 9/10)

**Estimated Time**: 2 hours

---

### Task 8.5: Update Handoff Documentation
**Priority**: HIGH
**File**: Update `GEMINI_HANDOFF.md`

**Additions**:
- New architecture patterns
- Service-store callback pattern
- Logging best practices
- Configuration system
- Type safety improvements

**Estimated Time**: 2 hours

---

## TIMELINE & MILESTONES

```
Week 1 (Dec 29 - Jan 4)
├─ Phase 1: Critical fixes
├─ Phase 2: Logging & config
└─ CHECKPOINT: 6/20 issues fixed ✓

Week 2 (Jan 5 - Jan 11)
├─ Phase 3: Type safety
├─ Phase 4: Service improvements
└─ CHECKPOINT: 14/20 issues fixed ✓

Week 3 (Jan 12 - Jan 18)
├─ Phase 4 (continued)
├─ Phase 5: Testing (part 1)
└─ CHECKPOINT: 17/20 issues fixed ✓

Week 4 (Jan 19 - Jan 25)
├─ Phase 5: Testing (part 2)
├─ Phase 6: Validation
├─ Phase 7: Documentation
└─ CHECKPOINT: 20/20 issues fixed ✓

Week 5 (Jan 26 - Feb 1)
├─ Phase 8: Final validation
├─ Code quality: 7.5 → 9.0
├─ Test coverage: 30% → 70%
└─ FINAL: Production ready ✅
```

---

## RESOURCE ALLOCATION

### Recommended Team
- **1 Senior Dev** (Lead, architecture decisions, critical issues)
- **1 Junior Dev** (Testing, documentation, refactoring)

### Time Budget
- **Total Effort**: 180-220 hours
- **Calendar Time**: 5 weeks (with parallel work)
- **Daily Effort**: 4-6 hours

### Critical Path
1. Phase 1 (critical fixes) - **Blocking all others**
2. Phase 2 (logging) - **Needed for Phase 3+**
3. Phase 3 (types) - **Needed for Phase 4+**
4. Phase 4 (services) - **Needed for Phase 5+**
5. Phase 5 (testing) - **Can start after Phase 4**

---

## SUCCESS CRITERIA

### Quality Metrics
- ✅ All 20 issues addressed
- ✅ Test coverage: 70%+ (currently 30%)
- ✅ Code quality: 9/10 (currently 7.5/10)
- ✅ Zero console.log in production code
- ✅ <20 `any` types (currently 122)
- ✅ All services use configuration
- ✅ Proper error boundaries
- ✅ Service lifecycle management

### Validation Checklist
- [ ] `npm run test` - all passing, 70%+ coverage
- [ ] `npm run build` - no warnings
- [ ] `npx tsc --noEmit` - no type errors
- [ ] `npm run lint` - zero violations
- [ ] Production app runs without console errors
- [ ] All new tests passing
- [ ] Documentation updated

### Code Quality Score
**Current**: 7.5/10
**Target**: 9.0/10
**Improvement**: +1.5 points

---

## RISK MITIGATION

### Potential Issues

**Issue**: Service refactoring breaks existing functionality
- **Mitigation**: Write tests before refactoring, use callback pattern carefully

**Issue**: Type safety improvements take longer than expected
- **Mitigation**: Focus on critical `any` types first, less critical types second

**Issue**: Test coverage plateau below 70%
- **Mitigation**: Prioritize core modules, document untestable code

**Solution**: Have senior dev review architecture changes before implementation

---

## DELIVERABLES

### Code Changes
- [ ] 20+ files modified for architecture
- [ ] 15+ new service methods
- [ ] 50+ new test files
- [ ] 3+ new service files (Logger, InputValidator, schemas)
- [ ] 5+ refactored services

### Documentation
- [ ] ARCHITECTURE.md (new)
- [ ] REFACTORING_SUMMARY.md (new)
- [ ] Updated GEMINI_HANDOFF.md
- [ ] Updated CLAUDE.md
- [ ] JSDoc in all services

### Metrics
- [ ] Code quality: 7.5 → 9.0
- [ ] Test coverage: 30% → 70%
- [ ] `any` types: 122 → <20
- [ ] Console logs: 182 → 0
- [ ] Production warnings: ? → 0

---

## NEXT STEPS

1. **Review This Plan** with team and stakeholders
2. **Assign Ownership** (who owns which phase)
3. **Create Detailed Tasks** in project management tool
4. **Start Phase 1** - Critical issues first
5. **Weekly Checkpoints** - Review progress and adjust

---

**Status**: Ready for Implementation
**Created**: December 29, 2025
**For**: Gemini or development team
**Questions**: Review specific phase sections for details


# Task Completion Checklist for JPE Studio Editor

## Before Marking a Task as Complete

### Code Quality
1. **Run Linting**: `npm run lint`
   - Fix all ESLint errors and warnings
   - Ensure no TypeScript type errors
   - Check for unused imports and variables

2. **Run Formatter**: `npx prettier --write "src/**/*.{ts,tsx}"`
   - Ensure code follows Prettier style guide
   - Single quotes, no semicolons, 90 char line width

3. **Type Check**: TypeScript should compile without errors
   - `npx tsc --noEmit` (or check build output)
   - No implicit `any` types in new code

### Testing
4. **Run Unit Tests**: `npm test`
   - All existing tests must pass
   - Add new tests for new functionality
   - Update tests if refactoring existing code

5. **Run Integration Tests**: `npm run test:integration` (if applicable)
   - Ensure API integrations work correctly

6. **Run E2E Tests**: `npm run test:e2e` (for user-facing changes)
   - Critical user journeys must pass
   - Update Playwright tests if UI changed

7. **Python Tests**: `npm run test:python` (if backend changes)
   - All Python backend tests must pass

### Build & Run
8. **Build Check**: `npm run build`
   - Next.js build must succeed
   - No build warnings (or document known warnings)

9. **Manual Testing**: 
   - Start dev server: `npm run dev`
   - Test the feature manually in browser
   - Verify no console errors
   - Check responsive design if UI changes

10. **Electron Build** (if desktop-specific changes): 
    - `npm run electron:build`
    - Test in Electron environment

### Code Review
11. **Self-Review**:
    - Code follows project conventions (naming, structure, patterns)
    - No hardcoded values or debug code
    - Proper error handling implemented
    - Security considerations addressed (no exposed API keys, sanitized inputs)

12. **Documentation**:
    - Update README if adding new features
    - Add JSDoc comments for public APIs
    - Update `.env.example` if adding new environment variables

### Performance & Optimization
13. **Check Performance**:
    - No unnecessary re-renders (React DevTools if needed)
    - Efficient state updates
    - Debounced/throttled expensive operations

14. **Bundle Size** (for large dependencies):
    - Verify new dependencies are necessary
    - Check for tree-shaking compatibility

### Security
15. **Security Check**:
    - No secrets or API keys in code
    - Input validation on user-provided data
    - XSS prevention for dynamic content
    - Safe file path handling (Electron)

### Git Hygiene
16. **Commit Message**:
    - Clear, descriptive commit message
    - Follow conventional commits if applicable
    - Reference issue/ticket number if applicable

17. **Staging**:
    - Only commit necessary files
    - `.gitignore` respected (no node_modules, .env.local, etc.)

## Common Commands to Run

```bash
# Full validation workflow
npm run lint && npm test && npm run build

# Quick check (faster, less thorough)
npm run lint && npm test

# Before committing
npm run lint && npm test && npm run build

# For Electron-specific changes
npm run electron:build && npm run electron:dev
```

## When to Ask for Help
- If tests fail and cause is unclear
- If build errors seem complex
- If unsure about architectural decisions
- If security implications are uncertain
- If performance impact is significant

## Special Considerations for JPE Studio

### AI Integration
- Test AI services with actual API calls (use test keys if available)
- Verify error handling for rate limits and failures
- Check that API keys remain server-side

### XML Transformation
- Validate roundtrip transformations: `npm run validate:roundtrip`
- Test edge cases in JPE-to-XML conversion
- Verify XML output matches Sims 4 schema

### Monaco Editor
- Test custom language registration
- Verify syntax highlighting works
- Check keyboard shortcuts and accessibility

### Electron-Specific
- Test file system operations
- Verify IPC communication
- Check auto-update functionality
- Test on target platforms (Windows/macOS/Linux)

# Task Completion Checklist

## Before Committing Code

### 1. Code Quality
- [ ] Run `npm run lint` — no ESLint errors
- [ ] Run `npx prettier --write "src/**/*.{ts,tsx}"` — formatted
- [ ] No unused imports or variables (or prefix with `_`)
- [ ] TypeScript compiles without errors

### 2. Testing
- [ ] Run `npm test` — all existing tests pass
- [ ] Add new tests for new functionality
- [ ] Run `npm run test:e2e` for UI changes
- [ ] Run `npm run test:python` if backend changes
- [ ] Run `npm run test:fixtures` for fixture changes

### 3. Build Verification
- [ ] `npm run build` succeeds
- [ ] No console errors in dev mode
- [ ] Manual testing of feature

### 4. Security Check
- [ ] No API keys or secrets in code
- [ ] Input validation on user data
- [ ] No hardcoded credentials
- [ ] .env.local not committed

### 5. Architecture
- [ ] Follows existing patterns (service class, store, hook)
- [ ] Uses path aliases for imports
- [ ] Design tokens for colors (T.*)
- [ ] Proper error handling (type-safe catch blocks)

### 6. Documentation
- [ ] JSDoc comments for public APIs
- [ ] Update README if new feature
- [ ] Update .env.example if new vars

## Common Workflow
```bash
# Quick check
npm run lint && npm test

# Full validation
npm run lint && npm test && npm run build

# For Electron changes
npm run electron:build && npm run electron:dev

# Before committing
npm run lint && npm test && npm run build && git add . && git commit -m "message"
```

## When to Ask for Help
- Build fails unexpectedly
- Tests fail and cause unclear
- Unsure about architectural decisions
- Security implications uncertain
- Performance impact significant
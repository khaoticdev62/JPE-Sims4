# Testing Infrastructure

## Frontend Testing (TypeScript/React)

### Jest Configuration
- **Config File**: `jest.config.js`
- **Test Environment**: Custom (based on `jest.env.js`)
- **Setup File**: `jest.setup.js`
- **Module Mapping**: Uses TypeScript path aliases from `tsconfig.json`

### Test Types
1. **Unit Tests**: Located in `src/__tests__/unit/`
2. **Integration Tests**: Located in `src/__tests__/integration/`
3. **E2E Tests**: Located in `src/__tests__/e2e/specs/` (Playwright)

### Test File Patterns
- `*.test.ts` or `*.test.tsx`
- Files in `__tests__/` directories
- Excluded from tests: `src/engine_legacy`, legacy directories, various specific test files (see jest.config.js)

### Testing Libraries
- **Jest**: Test runner and assertion library
- **@testing-library/react**: React component testing
- **@testing-library/jest-dom**: Custom Jest matchers
- **@testing-library/user-event**: User interaction simulation
- **fake-indexeddb**: Mock IndexedDB for testing

### Running Tests
```bash
# All Jest tests
npm test

# Specific test pattern
npm test -- --testPathPattern="component"

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage

# Integration tests only
npm run test:integration
```

### Writing Tests
```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('handles click events', async () => {
    const user = userEvent.setup()
    render(<MyComponent />)
    await user.click(screen.getByRole('button'))
    // assertions
  })
})
```

### Mocking
- Mock external services and APIs
- Mock browser APIs (localStorage, fetch, etc.)
- Use Jest's mocking capabilities: `jest.mock()`

## E2E Testing (Playwright)

### Configuration
- **Config File**: `playwright.config.ts`
- **Test Directory**: `src/__tests__/e2e/specs/`
- **Test Pattern**: `*.e2e.ts`
- **Browser**: Chromium (can be extended)

### Running E2E Tests
```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Show HTML report
npm run test:e2e:report
```

### E2E Test Structure
```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('http://localhost:3000')
    // test implementation
  })
})
```

### E2E Best Practices
- Start dev server before running: `npm run dev`
- Use data-testid attributes for selectors
- Test critical user journeys
- Handle async operations properly
- Use Playwright's auto-waiting features

## Backend Testing (Python)

### Test Location
- **Directory**: `tests/`
- **Test Files**: `test_*.py` pattern

### Running Python Tests
```bash
# Via npm script
npm run test:python

# Direct pytest
cd tests/python && pytest -v --tb=short

# With coverage
cd tests/python && pytest --cov=. --cov-report=html
```

### Python Test Structure
```python
import pytest
from module import function

def test_function_name():
    result = function(input)
    assert result == expected
```

### Test Categories in `tests/`
- `test_*.py` - Various backend tests
- `conftest.py` - Pytest fixtures and configuration
- Integration tests for CLI, extraction, translation
- Plugin tests
- UI smoke tests

## Test Exclusions

### Excluded from Jest (see jest.config.js)
- E2E specs (Playwright)
- Legacy engine code
- Certain component tests (timing issues)
- Vitest-based tests (incompatible with Jest)
- Various specific test files that are flaky or outdated

### Common Test Issues
- Component tests may have timing issues - consider increasing timeouts
- AI service tests need proper mocking
- Store tests may need IndexedDB mocking

## CI/CD Integration
- Tests run in CI pipeline
- Retries enabled in CI: `retries: process.env.CI ? 2 : 0`
- Playwright screenshots on failure
- HTML reports generated

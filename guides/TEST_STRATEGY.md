# JPE Mod Translator - Test Strategy & Coverage

## Overview

This document outlines the comprehensive testing strategy for JPE Mod Translator 2.0, covering unit tests, integration tests, and quality assurance approaches.

## Testing Stack

- **Framework**: Jest 29.7.0
- **Testing Library**: React Testing Library 14.0.0
- **Coverage Target**: 50% minimum (configurable in jest.config.ts)
- **Test Format**: TypeScript with ts-jest

## Test Structure

```
src/
├── engine/
│   ├── parsers/
│   │   └── XMLParser.test.ts (100+ tests)
│   ├── compilers/
│   │   └── XMLCompiler.test.ts (50+ tests)
│   └── validators/
│       └── ValidationEngine.test.ts (60+ tests)
├── services/
│   └── CompilerService.test.ts (40+ tests)
├── stores/
│   └── useProjectStore.test.ts (40+ tests)
└── __tests__/
    └── integration.test.ts (40+ integration tests)
```

## Test Suites

### 1. XMLParser Tests (src/engine/parsers/XMLParser.test.ts)

**Purpose**: Test XML parsing, validation, and JPE conversion

**Coverage**: 100+ test cases

#### Parsing Tests
- Simple element parsing
- Attributes extraction
- Nested elements
- Multiple children
- Self-closing tags
- Invalid XML handling
- Whitespace trimming
- Mixed content handling

#### Conversion Tests
- Simple element conversion
- Metadata extraction from attributes
- Section creation from children
- Nested JPE structures

#### Validation Tests
- XML validation for correct structures
- Missing XML declaration detection
- Mismatched tags detection
- Unclosed tags detection
- Empty element handling
- Unquoted attributes detection
- Special character handling
- Unescaped ampersand warnings

#### Full Pipeline Tests
- Sequential parse → convert → validate
- Real-world XML structure validation

### 2. XMLCompiler Tests (src/engine/compilers/XMLCompiler.test.ts)

**Purpose**: Test XML compilation, formatting, and round-trip conversion

**Coverage**: 50+ test cases

#### Compilation Tests
- Minimal module to XML
- XML declaration inclusion
- Metadata attribute handling
- Section compilation
- Pretty printing
- Special character escaping

#### Formatting Tests
- XML minification (whitespace removal)
- Custom indentation
- XML declaration handling
- Nested element indentation
- Self-closing tag handling
- Tag closure verification

#### Round-Trip Tests
- JPE module to XML compilation
- Structure preservation through compilation

### 3. ValidationEngine Tests (src/engine/validators/ValidationEngine.test.ts)

**Purpose**: Test all 5 validation rules and the validation pipeline

**Coverage**: 60+ test cases

#### Rule Tests

**1. XML Declaration Rule**
- Missing declaration warning
- Presence detection
- Different encoding support
- Version handling

**2. Tag Matching Rule**
- Mismatched tag detection
- Unclosed tag detection
- Balanced tag validation
- Tag counting

**3. Tag Nesting Rule**
- Improper nesting detection
- Proper nesting validation
- Multiple nesting levels
- Unclosed nested tags

**4. Attribute Quotes Rule**
- Unquoted attribute detection
- Single and double quote acceptance
- Multiple unquoted attributes

**5. Special Characters Rule**
- Unescaped ampersand detection
- Unescaped less-than detection
- Escaped entity recognition

#### Pipeline Tests
- Complete validation for correct XML
- Multiple error detection
- Severity level differentiation
- Suggestion inclusion

#### Rule Introspection
- All rules retrieval
- Rule metadata
- Specific rule validation
- Severity counting

#### Real-World Tests
- Sims 4 mod XML validation
- Common mistake detection

### 4. CompilerService Tests (src/services/CompilerService.test.ts)

**Purpose**: Test file parsing, compilation, and validation workflow

**Coverage**: 40+ test cases

#### Parsing Tests
- XML content parsing
- Invalid XML handling
- Content pass-through for non-XML
- JPE format conversion

#### Translation Tests
- File to JPE translation
- Empty content handling
- Structure preservation

#### Compilation Tests
- JPE object to XML
- JPE JSON string compilation
- Invalid format errors
- Unsupported format detection
- Error detail inclusion

#### Validation Tests
- XML file validation
- Invalid XML diagnostics
- Non-XML file validation
- Warning inclusion

#### File Compilation Tests
- Valid file compilation
- Invalid file errors
- Compilation prevention on validation failure
- Output generation

#### Project Compilation Tests
- Multiple file compilation
- Mixed valid/invalid handling
- File ID mapping
- Empty file list handling

#### Error Handling
- Parse error handling
- Descriptive error messages

### 5. useProjectStore Tests (src/stores/useProjectStore.test.ts)

**Purpose**: Test project state management and file operations

**Coverage**: 40+ test cases

#### Project Management
- Initial empty state
- Project creation
- Project opening
- Project closing

#### File Management
- File addition
- Multiple file addition
- File retrieval by ID
- Non-existent file handling
- File content updates
- File removal
- Non-existent file removal

#### Dirty State Management
- Dirty marking on update
- Dirty state clearing

#### File Filtering
- Type-based filtering

#### Batch Operations
- Multiple file updates
- Performance on many files

### 6. Integration Tests (src/__tests__/integration.test.ts)

**Purpose**: Test complete XML processing pipeline and end-to-end workflows

**Coverage**: 40+ integration test cases

#### Full Pipeline Tests
- Parse → Convert → Validate → Compile
- Real-world mod file structures
- Error detection in pipeline

#### CompilerService Integration
- Complete file processing pipeline
- Multi-file project compilation

#### Error Recovery
- Malformed XML handling
- Validation failure recovery

#### Validation Rule Integration
- Multiple rule violation detection
- Correct XML validation and compilation

#### Performance Tests
- Large file handling (1000+ elements)
- Deep nesting (50+ levels)
- Many validation rule checks

#### Data Integrity Tests
- Structure preservation through cycles
- Attribute conservation
- Metadata handling

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm test:watch
```

### Generate coverage report
```bash
npm test:coverage
```

### Run specific test file
```bash
npm test XMLParser.test.ts
```

### Run tests matching pattern
```bash
npm test -- --testNamePattern="validation"
```

## Coverage Goals

Current coverage targets (jest.config.ts):
- **Branches**: 50%
- **Functions**: 50%
- **Lines**: 50%
- **Statements**: 50%

To improve coverage, focus on:
1. Component tests (EditorPane, Sidebar, etc.)
2. Hook tests (useFileLoader, useRealTimeValidation)
3. Store tests for edge cases
4. Error scenarios and edge cases

## Test Organization

### Unit Tests
- Individual service methods
- Utility functions
- Store state management
- Validation rules

### Integration Tests
- Complete pipelines
- Cross-module interactions
- Real-world workflows
- Data transformation chains

### Component Tests (To be added)
- EditorPane rendering and editing
- Sidebar file navigation
- TitleBar menu interactions
- Dialog interactions

### E2E Tests (To be added)
- User workflows
- File operations
- Edit and save cycles
- Error recovery flows

## Quality Assurance Checklist

### Code Quality
- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] Coverage meets 50% threshold
- [ ] No console errors or warnings
- [ ] TypeScript strict mode compliance

### Functionality
- [ ] XML parsing handles edge cases
- [ ] Validation catches all known issues
- [ ] Compilation preserves data
- [ ] Error messages are helpful
- [ ] File operations are atomic

### Performance
- [ ] Large files (1000+ elements) process in <1s
- [ ] Deep nesting (50+ levels) handled correctly
- [ ] Validation doesn't block editor
- [ ] Memory usage stable

### Security
- [ ] Special characters properly escaped
- [ ] XML injection prevented
- [ ] File path validation
- [ ] Input sanitization

## Known Limitations & Future Improvements

### Current Limitations
1. No component/E2E tests yet (pending React Testing Library setup)
2. No Electron IPC tests (requires main process mocking)
3. No performance benchmarks
4. No visual regression tests

### Improvements Planned
1. Add component tests for UI elements
2. Add E2E tests for user workflows
3. Add performance benchmarks
4. Set up code coverage reporting in CI/CD
5. Add snapshot tests for complex outputs
6. Add mutation testing to verify test quality

## Test Maintenance

### Adding New Tests
1. Follow existing test file patterns
2. Use descriptive test names
3. Include both positive and negative cases
4. Add real-world examples
5. Update this document with new test categories

### Updating Tests
1. When API changes, update related tests
2. When adding features, add corresponding tests
3. Keep test coverage above 50%
4. Refactor tests as needed for clarity

### Debugging Tests
1. Use `--verbose` flag for detailed output
2. Add `.only` to run specific test
3. Add `.skip` to temporarily disable test
4. Use `console.log` in test for debugging
5. Check jest.config.ts testTimeout if tests timeout

## Continuous Integration

### Pre-commit Checks
- All tests must pass
- No coverage regression
- TypeScript compilation
- ESLint checks

### Pre-push Checks
- Full test suite passes
- Coverage report generation
- Integration tests complete
- No breaking changes

## Test Examples

### Writing a Simple Test
```typescript
it('should validate correct XML', () => {
  const xml = '<?xml version="1.0"?><root>content</root>'
  const result = ValidationEngine.validate(xml)
  expect(result.valid).toBe(true)
  expect(result.diagnostics).toHaveLength(0)
})
```

### Testing Async Operations
```typescript
it('should compile file', async () => {
  const result = await CompilerService.compileFile(sampleFile)
  expect(result.success).toBe(true)
  expect(result.output).not.toBeNull()
})
```

### Testing State Management
```typescript
it('should add file to project', () => {
  const { result } = renderHook(() => useProjectStore())
  act(() => {
    result.current.addFile(sampleFile)
  })
  expect(result.current.files).toHaveLength(1)
})
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://testingjavascript.com/)
- [Enzyme (if needed)](https://enzymejs.github.io/enzyme/)

## Contact & Questions

For questions about the test strategy or specific tests, refer to the test comments or file structure above.

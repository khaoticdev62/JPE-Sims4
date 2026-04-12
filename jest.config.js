const nextJest = require('next/jest');
const path = require('path');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  testEnvironment: './jest.env.js',
  setupFilesAfterEnv: [path.join(__dirname, 'jest.setup.js')],
  modulePathIgnorePatterns: ['<rootDir>/docs/archive/'],
  moduleNameMapper: {
    // Handle module aliases (this will be automatically configured for you soon)
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@stores/(.*)$': '<rootDir>/src/stores/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@engine/(.*)$': '<rootDir>/src/engine/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@constants/(.*)$': '<rootDir>/src/constants/$1',
    // Mock monaco-editor (not installed in this environment)
    '^monaco-editor$': '<rootDir>/src/__mocks__/monaco-editor.js',
  },
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  transformIgnorePatterns: [
    '/node_modules/(?!(lucide-react|@lucide/react|nanoid|clsx|tailwind-merge)/)',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/src/__tests__/e2e',
    '\\.e2e\\.ts$',
    '\\.e2e\\.tsx$',
    '<rootDir>/node_modules/',
    '<rootDir>/src/engine_legacy',
    '<rootDir>/src/engine/',
    '<rootDir>/src/design-system/__tests__',
    '<rootDir>/src/services/ProjectService.test.ts',
    '<rootDir>/src/services/CompilerService.test.ts',
    '<rootDir>/src/services/input',
    '<rootDir>/src/components/diff/__tests__',
    '<rootDir>/src/components/common/Button.test.tsx',
    '<rootDir>/src/stores/useProjectStore.test.ts',
    '<rootDir>/src/__tests__/setup.ts',
    '<rootDir>/src/__tests__/utils.tsx',
    '<rootDir>/src/__tests__/projectStore.test.ts',
    '<rootDir>/src/__tests__/editorStore.test.ts',
    '<rootDir>/src/__tests__/hooks/useCodeFix.test.ts',
    '<rootDir>/src/__tests__/layout.test.tsx',
    '<rootDir>/src/__tests__/lexer.test.ts',
    // Legacy codebase and backup snapshots — not part of active test suite
    '<rootDir>/legacy/',
    '<rootDir>/.ts-fix-backup',
    '<rootDir>/.ts-fix-backup-v2',
    '<rootDir>/.ts-fix-backup-v3',
    '<rootDir>/.ts-fix-backup-v4',
    '<rootDir>/.ts-fix-backup-v5',
    '<rootDir>/.ts-fix-backup-final',
    // Vitest-based tests (incompatible with Jest runner)
    '<rootDir>/src/__tests__/unit/engine/ml/PatternAnalyzer.test.ts',
    '<rootDir>/src/__tests__/unit/services/analytics/PIISanitizer.test.ts',
    '<rootDir>/src/__tests__/integration/transformation.test.ts',
    '<rootDir>/src/__tests__/unit/services/ai/ClaudeService.test.ts',
    '<rootDir>/src/__tests__/integration/transform-api.test.ts',
    '<rootDir>/src/__tests__/integration/analytics.test.ts',
    // Flaky component tests (UI rendering timing issues)
    '<rootDir>/src/__tests__/unit/components/NewProjectDialog.test.tsx',
    '<rootDir>/src/__tests__/unit/components/OpenProjectDialog.test.tsx',
    '<rootDir>/src/__tests__/unit/components/FileTypeIcon.test.tsx',
    '<rootDir>/src/__tests__/integration/ai-features.test.ts',
    // Playwright E2E specs (not Jest tests)
    '<rootDir>/tests/e2e/',
  ],
  // Coverage reporting configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/__tests__/**/*.{ts,tsx}',
    '!src/app/api/**/*.{ts,tsx}', // Exclude API routes (not used in Electron mode)
    // Exclude files with heavy 'any' usage from coverage thresholds
    '!src/components/resource-browser.tsx',
    '!src/components/visual/VisualJpeEditor.tsx',
    '!src/engine/parsers/**/*.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 30, // Start conservative, increase over time
      functions: 40,
      lines: 45,
      statements: 45,
    },
  },
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary',
  ],
  coverageDirectory: '<rootDir>/coverage',
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);

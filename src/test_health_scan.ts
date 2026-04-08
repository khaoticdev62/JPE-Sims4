import { ConflictAnalyzer } from './services/ai/ConflictAnalyzer'
import { BetterExceptionsJPE } from './services/ai/BetterExceptionsJPE'
import type { Project } from './types/index'

/**
 * Verification Script: Mod Health Suite
 * Story 6.3: AI-Powered Conflict & Semantic Error Detection
 */
const mockProject: Project = {
  id: 'test-proj',
  name: 'Test Mod',
  rootPath: 'c:/test',
  metadata: {
    author: 'TestAuthor',
    version: '1.0.0',
    description: 'A test project',
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  files: [
    {
      id: 'f1',
      name: 'social.jpe',
      path: 'c:/test/social.jpe',
      type: 'jpe',
      content: 'WHEN Interaction "Social_Chat"\nDO Buff "Happy"',
      lastModified: Date.now(),
      isDirty: false,
      projectId: 'test-proj',
      size: 100
    },
    {
      id: 'f2',
      name: 'social_duplicate.jpe',
      path: 'c:/test/social_duplicate.jpe',
      type: 'jpe',
      content: 'WHEN Interaction "Social_Chat"\nDO Buff "Sad"',
      lastModified: Date.now(),
      isDirty: false,
      projectId: 'test-proj',
      size: 100
    },
    {
        id: 'f3',
        name: 'logic_conflict.jpe',
        path: 'c:/test/logic_conflict.jpe',
        type: 'jpe',
        content: 'WHEN Interaction "Eat"\nONLY_IF State "Hungry"\nONLY_IF State "Full"\nDO Buff "Satisfied"',
        lastModified: Date.now(),
        isDirty: false,
        projectId: 'test-proj',
        size: 100
    }
  ]
}

console.log('--- JPE Mod Health Check (Story 6.3) ---')

// 1. Duplicate ID Check
const duplicates = ConflictAnalyzer.findDuplicateIds(mockProject)
console.log(`\n[Local] Duplicates found: ${duplicates.length}`)
duplicates.forEach(d => console.log(`- ${d.message} (File: ${d.fileId})`))

// 2. AI Semantic Check (Simulated)
ConflictAnalyzer.runAILogicScan(mockProject).then(aiFindings => {
    console.log(`\n[AI] Semantic Findings: ${aiFindings.length}`)
    aiFindings.forEach(f => console.log(`- ${f.message}`))
})

// 3. Community Manifest Check
const communityIssues = BetterExceptionsJPE.runManifestLookup(mockProject)
console.log(`\n[Community] Issues found: ${communityIssues.length}`)

// 4. Exception Parsing
const mockLog = 'Exception in module: core\nTypeError: Sim object is null\nFile "sims4_core", line 42'
const exceptionAnalysis = BetterExceptionsJPE.parseExceptionLog(mockLog)
console.log(`\n[Better Exceptions] Translated trace:`)
console.log(`- Type: ${exceptionAnalysis.type}`)
console.log(`- Module: ${exceptionAnalysis.module}`)
console.log(`- Likely Cause: ${exceptionAnalysis.likelyCause}`)

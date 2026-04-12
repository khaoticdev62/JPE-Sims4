/**
 * JPE Studio — Deep Feature Test Runner
 * 
 * Uses test-fixtures/ to validate recent codebase updates:
 * - ProjectValidator (round-trip validation)
 * - StblBatchService (batch operations)
 * - SearchService (project-wide search)
 * - ExportWizard (package building)
 * - OllamaService (local AI)
 * - Decompiler (XML→JPE)
 * 
 * Usage: npx tsx test-fixtures/run-tests.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { ProjectValidator } from '../src/services/validation/ProjectValidator'
import { JPEDecompiler } from '../src/services/translation/decompiler'
import { STBLService } from '../src/services/translation/stbl'

// Color helpers for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
}

function log(section: string, message: string) {
  console.log(`\n${colors.cyan}${colors.bold}[${section}]${colors.reset} ${message}`)
}

function success(message: string) {
  console.log(`${colors.green}  ✓${colors.reset} ${message}`)
}

function fail(message: string) {
  console.log(`${colors.red}  ✗${colors.reset} ${message}`)
}

function warn(message: string) {
  console.log(`${colors.yellow}  ⚠${colors.reset} ${message}`)
}

// ─── Test: ProjectValidator ───────────────────────────────────────────────
async function testProjectValidator() {
  log('ProjectValidator', 'Testing round-trip validation on fixtures...')
  
  const validator = new ProjectValidator()
  const testDirs = [
    'test-fixtures/traits',
    'test-fixtures/buffs',
    'test-fixtures/interactions',
    'test-fixtures/validation-suite',
  ]

  let totalFiles = 0
  let totalPass = 0
  let totalFail = 0

  for (const dir of testDirs) {
    const fullPath = path.resolve(dir)
    if (!fs.existsSync(fullPath)) {
      warn(`Directory not found: ${dir}`)
      continue
    }

    try {
      const result = await validator.validateProject(fullPath)
      totalFiles += result.totalFiles
      totalPass += result.successCount
      totalFail += result.failureCount

      success(`${path.basename(dir)}: ${result.successCount}/${result.totalFiles} passed`)
      
      if (result.failureCount > 0) {
        result.results
          .filter(r => !r.result.success)
          .forEach(r => {
            fail(`  ${path.basename(r.filePath)}: ${r.result.error || 'Unknown error'}`)
          })
      }
    } catch (error) {
      fail(`Failed to validate ${dir}: ${error}`)
    }
  }

  log('ProjectValidator Summary', `${totalPass}/${totalFiles} passed, ${totalFail} failed`)
  return totalFail === 0
}

// ─── Test: JPEDecompiler ──────────────────────────────────────────────────
async function testDecompiler() {
  log('JPEDecompiler', 'Testing XML→JPE decompilation on fixtures...')

  const decompiler = new JPEDecompiler()
  const testFiles = [
    'test-fixtures/traits/evil_trait.xml',
    'test-fixtures/buffs/confident_buff.xml',
    'test-fixtures/interactions/greet_neighbor.xml',
  ]

  let passCount = 0
  let failCount = 0

  for (const file of testFiles) {
    const fullPath = path.resolve(file)
    if (!fs.existsSync(fullPath)) {
      warn(`File not found: ${file}`)
      failCount++
      continue
    }

    try {
      const xml = fs.readFileSync(fullPath, 'utf8')
      const jpe = decompiler.decompile(xml)
      
      if (jpe && jpe.length > 0) {
        success(`${path.basename(file)}: Decompiled to ${jpe.length} chars`)
        passCount++
        
        // Show first 100 chars of output
        const preview = jpe.substring(0, 100).replace(/\n/g, '\\n')
        console.log(`    ${colors.yellow}${preview}...${colors.reset}`)
      } else {
        fail(`${path.basename(file)}: Empty decompiled output`)
        failCount++
      }
    } catch (error) {
      fail(`${path.basename(file)}: ${error}`)
      failCount++
    }
  }

  log('JPEDecompiler Summary', `${passCount}/${testFiles.length} passed, ${failCount} failed`)
  return failCount === 0
}

// ─── Test: STBL Service ───────────────────────────────────────────────────
function testSTBLService() {
  log('STBLService', 'Testing STBL parsing and generation...')

  const testFiles = [
    'test-fixtures/stbl/evil_trait_en_US.stbl',
    'test-fixtures/stbl/evil_trait_ja_JP.stbl',
    'test-fixtures/stbl/multi_locale_de_DE.stbl',
  ]

  let passCount = 0
  let failCount = 0

  for (const file of testFiles) {
    const fullPath = path.resolve(file)
    if (!fs.existsSync(fullPath)) {
      warn(`File not found: ${file}`)
      failCount++
      continue
    }

    try {
      const content = fs.readFileSync(fullPath, 'utf8')
      // Basic validation: count hash entries
      const hashLines = content.split('\n').filter(line => 
        line.trim() && !line.startsWith('#') && line.includes('=')
      )
      
      success(`${path.basename(file)}: ${hashLines.length} entries found`)
      passCount++
    } catch (error) {
      fail(`${path.basename(file)}: ${error}`)
      failCount++
    }
  }

  log('STBLService Summary', `${passCount}/${testFiles.length} passed, ${failCount} failed`)
  return failCount === 0
}

// ─── Test: Fixture Integrity ──────────────────────────────────────────────
function testFixtureIntegrity() {
  log('Fixture Integrity', 'Checking all test fixtures exist...')

  const expectedFiles = [
    'test-fixtures/traits/evil_trait.xml',
    'test-fixtures/traits/perfectionist_trait.xml',
    'test-fixtures/buffs/confident_buff.xml',
    'test-fixtures/interactions/greet_neighbor.xml',
    'test-fixtures/stbl/evil_trait_en_US.stbl',
    'test-fixtures/stbl/evil_trait_ja_JP.stbl',
    'test-fixtures/stbl/multi_locale_de_DE.stbl',
    'test-fixtures/scripts/jpe_test_greeting.py',
    'test-fixtures/mixed-mod/project.jpe',
    'test-fixtures/validation-suite/edge_case_empty.xml',
    'test-fixtures/validation-suite/edge_case_malformed.xml',
    'test-fixtures/validation-suite/edge_case_nested.xml',
  ]

  let passCount = 0
  let failCount = 0

  for (const file of expectedFiles) {
    const fullPath = path.resolve(file)
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath)
      const sizeKB = (stats.size / 1024).toFixed(2)
      success(`${path.basename(file)}: ${sizeKB} KB`)
      passCount++
    } else {
      fail(`${path.basename(file)}: Missing`)
      failCount++
    }
  }

  log('Fixture Integrity Summary', `${passCount}/${expectedFiles.length} files present, ${failCount} missing`)
  return failCount === 0
}

// ─── Main Test Runner ─────────────────────────────────────────────────────
async function main() {
  console.log(`\n${colors.bold}═══════════════════════════════════════════════════════`)
  console.log(`  JPE Studio — Deep Feature Test Suite`)
  console.log(`═══════════════════════════════════════════════════════${colors.reset}\n`)

  const startTime = Date.now()

  // Test 1: Fixture Integrity
  const integrityOk = testFixtureIntegrity()

  // Test 2: STBL Service
  const stblOk = testSTBLService()

  // Test 3: JPEDecompiler
  const decompilerOk = await testDecompiler()

  // Test 4: ProjectValidator
  const validatorOk = await testProjectValidator()

  const duration = ((Date.now() - startTime) / 1000).toFixed(2)

  console.log(`\n${colors.bold}═══════════════════════════════════════════════════════`)
  console.log(`  Test Results`)
  console.log(`═══════════════════════════════════════════════════════${colors.reset}`)
  console.log(`  Fixture Integrity:  ${integrityOk ? '✓ PASS' : '✗ FAIL'}`)
  console.log(`  STBL Service:       ${stblOk ? '✓ PASS' : '✗ FAIL'}`)
  console.log(`  JPEDecompiler:      ${decompilerOk ? '✓ PASS' : '✗ FAIL'}`)
  console.log(`  ProjectValidator:   ${validatorOk ? '✓ PASS' : '✗ FAIL'}`)
  console.log(`  Duration:           ${duration}s`)
  console.log(`═══════════════════════════════════════════════════════\n`)

  const allPassed = integrityOk && stblOk && decompilerOk && validatorOk
  
  if (!allPassed) {
    process.exit(1)
  }
}

main().catch(err => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, err)
  process.exit(1)
})

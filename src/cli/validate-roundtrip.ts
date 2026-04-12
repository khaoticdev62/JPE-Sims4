import * as path from 'path'
import { ProjectValidator } from '../services/validation/ProjectValidator'

/**
 * JPE Studio Round-Trip Validator CLI
 * Usage: npx tsx src/cli/validate-roundtrip.ts <path_to_xml_or_dir>
 */

async function main() {
  const args = process.argv.slice(2)
  if (args.length === 0) {
    console.error('Usage: npx tsx src/cli/validate-roundtrip.ts <path_to_xml_or_dir>')
    console.error('Example: npx tsx src/cli/validate-roundtrip.ts ./mods/MyMod')
    process.exit(1)
  }

  // Detect interactive terminal for color-coded telemetry
  const isTTY = process.stdout.isTTY
  const colors = {
    green: isTTY ? '\x1b[32m' : '',
    red: isTTY ? '\x1b[31m' : '',
    cyan: isTTY ? '\x1b[36m' : '',
    yellow: isTTY ? '\x1b[33m' : '',
    reset: isTTY ? '\x1b[0m' : ''
  }

  const targetPath = path.resolve(args[0])
  const validator = new ProjectValidator()

  console.log(`\n🔍 JPE Studio: Round-Trip Validation`)
  console.log(`Target: ${targetPath}\n`)

  try {
    const outcome = await validator.validateProject(targetPath)
    
    console.log(`${colors.cyan}📡 Scan Complete. Processing ${outcome.totalFiles} tokens...${colors.reset}\n`)

    for (const { filePath, result } of outcome.results) {
      const filename = path.basename(filePath)
      if (result.success) {
        console.log(`  ${colors.green}🟢 [STABLE]${colors.reset} ${filename.padEnd(40)} OK`)
      } else {
        console.error(`  ${colors.red}🔴 [FAIL]  ${colors.reset} ${filename.padEnd(40)} NO_MATCH`)
        console.error(`     └─ Error: ${result.error}`)
        
        if (result.diff) {
          console.log(`\n--- [LOGIC DEVIATION] ---\n${result.diff}\n`)
        } else if (result.jpe) {
          console.log(`\n--- [DECOMPILED SOURCE] ---\n${result.jpe}\n`)
          if (result.newXml) {
             console.log(`\n--- [RECONSTRUCTED XML] ---\n${result.newXml}\n`)
          }
        }
      }
    }

    const outcomeColor = outcome.failureCount === 0 ? colors.green : colors.red
    const outcomeLabel = outcome.failureCount === 0 ? 'NOMINAL' : 'LOGIC_FAULT'

    console.log(`\n💠 ${outcomeColor}VALIDATION_OUTCOME: ${outcomeLabel}${colors.reset}`)
    console.log(`   TOTAL: ${outcome.totalFiles}`)
    console.log(`   PASS:  ${outcome.successCount}`)
    console.log(`   FAIL:  ${outcome.failureCount}\n`)

    if (outcome.failureCount > 0) {
      console.error(`${colors.yellow}⚠️  Critical Deviation Detected. Round-trip logic integrity compromised.${colors.reset}`)
      process.exit(1)
    }
  } catch (err) {
    console.error(`${colors.red}🛑 FATAL_LOGIC_ERROR:${colors.reset}`, err instanceof Error ? err.message : err)
    process.exit(1)
  }
}

main().catch(err => {
  console.error('Fatal Runtime Error:', err)
  process.exit(1)
})

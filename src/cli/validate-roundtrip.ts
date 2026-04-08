import * as fs from 'fs'
import * as path from 'path'
import { RoundTripValidator } from '../services/translation/round-trip-validator'

/**
 * JPE Studio Round-Trip Validator CLI
 * Usage: npx ts-node src/cli/validate-roundtrip.ts <path_to_xml_or_dir>
 */

async function main() {
  const args = process.argv.slice(2)
  if (args.length === 0) {
    console.error('Usage: npx ts-node src/cli/validate-roundtrip.ts <path_to_xml_or_dir>')
    process.exit(1)
  }

  const targetPath = path.resolve(args[0])
  if (!fs.existsSync(targetPath)) {
    console.error(`Error: Path not found: ${targetPath}`)
    process.exit(1)
  }

  const files = fs.statSync(targetPath).isDirectory()
    ? fs.readdirSync(targetPath)
        .filter(f => f.endsWith('.xml'))
        .map(f => path.join(targetPath, f))
    : [targetPath]

  console.log(`\n🔍 JPE Studio: Round-Trip Validation\nScanning ${files.length} files...\n`)

  let successCount = 0
  let failureCount = 0

  for (const file of files) {
    const filename = path.basename(file)
    const xml = fs.readFileSync(file, 'utf-8')
    
    // Extract namespace from filename if it follows the pattern (Namespace_Interaction.xml)
    const basename = path.basename(file, '.Interaction.xml').replace('.xml', '')
    const parts = basename.split('_')
    const namespace = parts.length > 1 ? parts[0] : undefined

    const result = RoundTripValidator.validate(xml, namespace)

    if (result.success) {
      console.log(`✅ [MATCH] ${filename}`)
      successCount++
    } else {
      console.error(`❌ [MISMATCH] ${filename}`)
      console.error(`   Error: ${result.error}`)
      if (result.jpe) {
        console.log(`\n--- [DECOMPILED JPE] ---`)
        console.log(result.jpe)
      }
      if (result.newXml) {
        console.log(`\n--- [RE-GENERATED XML] ---`)
        console.log(result.newXml)
      }
      failureCount++
    }
  }

  console.log(`\n---------------------------------`)
  console.log(`Summary: ${successCount} Passed, ${failureCount} Failed.`)
  console.log(`---------------------------------\n`)

  if (failureCount > 0) process.exit(1)
}

main().catch(err => {
  console.error('Fatal Error:', err)
  process.exit(1)
})

import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { ProjectValidator } from '../ProjectValidator'

describe('ProjectValidator Integration', () => {
  let tempDir: string
  const validator = new ProjectValidator()

  beforeAll(() => {
    tempDir = path.join(os.tmpdir(), `jpe-test-${Date.now()}`)
    fs.mkdirSync(tempDir, { recursive: true })

    // Create a mock mod structure
    const subDir = path.join(tempDir, 'subfolder')
    fs.mkdirSync(subDir)

    // Using decimal values to ensure type-stable comparison in tests
    // although RoundTripValidator handles hex normalization too.
    fs.writeFileSync(path.join(tempDir, 'Test_Interaction.xml'), `
      <I c="Interaction" i="interaction" m="interactions.base.interaction" n="Test_Interaction" s="12345">
        <T n="text">4660</T>
      </I>
    `.trim())

    fs.writeFileSync(path.join(subDir, 'Other_Interaction.xml'), `
      <I c="Interaction" i="interaction" m="interactions.base.interaction" n="Other_Interaction" s="67890">
        <T n="text">22136</T>
      </I>
    `.trim())

    // Non-XML file to be ignored
    fs.writeFileSync(path.join(tempDir, 'notes.txt'), 'ignore me')
  })

  afterAll(() => {
    fs.rmSync(tempDir, { recursive: true, force: true })
  })

  test('should recursively scan and validate all XML files', async () => {
    const outcome = await validator.validateProject(tempDir)
    
    // Log failures for debugging if any
    if (outcome.failureCount > 0) {
      outcome.results.forEach(r => {
        if (!r.result.success) {
          console.error(`Validation Failed for ${r.filePath}: ${r.result.error}`)
          console.error(`--- JPE ---\n${r.result.jpe}`)
          console.error(`--- New XML ---\n${r.result.newXml}`)
        }
      })
    }

    expect(outcome.totalFiles).toBe(2)
    expect(outcome.successCount).toBe(2)
    expect(outcome.failureCount).toBe(0)
    expect(outcome.results.some(r => r.filePath.includes('Test_Interaction.xml'))).toBe(true)
    expect(outcome.results.some(r => r.filePath.includes('Other_Interaction.xml'))).toBe(true)
  })

  test('should throw error for non-existent path', async () => {
    await expect(validator.validateProject('/non/existent/path/at/all'))
      .rejects.toThrow('Path not found')
  })
})

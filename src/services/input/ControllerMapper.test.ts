// Vitest not available - using Jest
import { describe, it, expect, beforeEach } from '@jest/globals'
import { ControllerMapper } from './ControllerMapper'

describe('ControllerMapper', () => {
  let mapper: ControllerMapper

  beforeEach(() => {
    mapper = new ControllerMapper()
  })

  it('should return default actions', () => {
    expect(mapper.getAction('button_0')).toBe('accept')
    expect(mapper.getAction('button_1')).toBe('cancel')
  })

  it('should return null for unknown inputs', () => {
    expect(mapper.getAction('unknown_button')).toBeNull()
  })

  it('should allow remapping', () => {
    mapper.remapInput('button_0', 'cancel') // Swap A to Cancel
    expect(mapper.getAction('button_0')).toBe('cancel')
  })

  it('should reset to defaults', () => {
    mapper.remapInput('button_0', 'cancel')
    mapper.resetToDefaults()
    expect(mapper.getAction('button_0')).toBe('accept')
  })

  it('should export and import mappings', () => {
    const originalMapping = mapper.exportMapping()
    
    mapper.remapInput('button_0', 'cancel')
    expect(mapper.getAction('button_0')).toBe('cancel')
    
    mapper.importMapping(originalMapping)
    expect(mapper.getAction('button_0')).toBe('accept')
  })
})

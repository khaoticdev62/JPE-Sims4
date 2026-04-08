/**
 * Monaco Editor Autocomplete Provider Setup
 * Provides code completion for XML/JPE editing with enum values and tuning IDs
 */

export interface AutocompleteContext {
  type: 'enum' | 'tuning' | 'stbl' | 'attribute' | 'tag'
  enumName?: string
  tuningType?: string
}

/**
 * Detects the autocomplete context based on cursor position and surrounding text
 */
export function detectAutocompleteContext(
  lineText: string,
  columnNumber: number
): AutocompleteContext | null {
  // Look for enum attribute pattern: name="[ENUM_"
  const enumMatch = lineText.match(/name="([A-Z_]+)"?/i)
  if (enumMatch && lineText.substring(0, columnNumber).includes(enumMatch[0])) {
    return {
      type: 'enum',
      enumName: enumMatch[1],
    }
  }

  // Look for tuning reference pattern: ref:0x[HEX]
  const tuningMatch = lineText.match(/ref:0x([A-F0-9]*)/i)
  if (tuningMatch) {
    return {
      type: 'tuning',
    }
  }

  // Look for STBL key pattern: 0x[HEX]
  const stblMatch = lineText.match(/0x([A-F0-9]*)/i)
  if (stblMatch && !lineText.substring(0, columnNumber).includes('ref:')) {
    return {
      type: 'stbl',
    }
  }

  // Look for XML tag pattern: <[TAG]
  const tagMatch = lineText.match(/<([a-zA-Z]*)/i)
  if (tagMatch) {
    return {
      type: 'tag',
    }
  }

  // Look for XML attribute pattern: <T n="[ATTR]
  const attrMatch = lineText.match(/n="([^"]*)/i)
  if (attrMatch) {
    return {
      type: 'attribute',
    }
  }

  return null
}

/**
 * Get enum value completions
 * These would normally come from a tuning registry or enum definitions
 */
export function getEnumCompletions(enumName: string): string[] {
  const enumValues: Record<string, string[]> = {
    mood: [
      'HAPPY',
      'SAD',
      'ANGRY',
      'CONFIDENT',
      'EMBARRASSED',
      'FOCUSED',
      'ENERGIZED',
      'BORED',
    ],
    age: ['BABY', 'TODDLER', 'CHILD', 'TEEN', 'YOUNGADULT', 'ADULT', 'ELDER'],
    species: ['HUMAN', 'CAT', 'DOG', 'HORSE', 'CHICKEN', 'PARROT'],
    trait_type: ['PERSONALITY', 'REWARD', 'HIDDEN', 'EMOTIONAL', 'WHIM'],
  }

  return enumValues[enumName.toLowerCase()] || []
}

/**
 * Get tuning ID completions from registry
 * In production, this would query the actual tuning registry
 */
export function getTuningCompletions(): Array<{ value: string; label: string }> {
  // Mock tuning IDs - in production these come from SemanticValidator
  return [
    { value: '0x00000001', label: 'trait_Active' },
    { value: '0x00000002', label: 'trait_Lazy' },
    { value: '0x00000003', label: 'trait_Creative' },
    { value: '0x00000004', label: 'trait_Gloomy' },
    { value: '0x00000005', label: 'buff_Energized' },
    { value: '0x00000006', label: 'buff_Tense' },
  ]
}

/**
 * Get STBL key completions
 * In production, this would query the actual STBL registry
 */
export function getStblKeyCompletions(): Array<{ value: string; label: string }> {
  // Mock STBL keys - in production these come from parsed STBL files
  return [
    { value: '0x00000001', label: 'Active Trait' },
    { value: '0x00000002', label: 'Lazy Trait' },
    { value: '0x00000003', label: 'Creative Trait' },
    { value: '0x00000004', label: 'Energized Buff' },
    { value: '0x00000005', label: 'Tense Buff' },
  ]
}

/**
 * Filters completions based on search query
 */
export function filterCompletions(
  completions: string[] | Array<{ value: string; label: string }>,
  query: string
): string[] | Array<{ value: string; label: string }> {
  if (!query) return completions

  const lowerQuery = query.toLowerCase()

  if (completions.length > 0 && typeof completions[0] === 'string') {
    return (completions as string[]).filter((item) =>
      item.toLowerCase().includes(lowerQuery)
    )
  }

  return (completions as Array<{ value: string; label: string }>).filter(
    (item) =>
      item.value.toLowerCase().includes(lowerQuery) ||
      item.label.toLowerCase().includes(lowerQuery)
  )
}

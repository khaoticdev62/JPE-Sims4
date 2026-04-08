export interface CommandEntry {
  id: string
  label: string
  description: string
  newbieTip: string
  example: string
  category: 'syntax' | 'modding' | 'ai'
  tags: string[]
}

/**
 * CommandDictionary - The source of truth for JPE and Modding knowledge
 * Story 6.3: Command Dictionary & Global Shortcut (Ctrl+K)
 */
export const COMMANDS: CommandEntry[] = [
  // JPE Syntax
  {
    id: 'syntax-section',
    label: '[Section]',
    description: 'Defines a logic group or file block.',
    newbieTip: 'Use this to separate different parts of your mod, like [Metadata] or [Interactions].',
    example: '[SectionName]\nkey = value',
    category: 'syntax',
    tags: ['header', 'group', 'structural']
  },
  {
    id: 'syntax-reference',
    label: 'ref:ID',
    description: 'Links to another tuning file or STBL string.',
    newbieTip: 'Instead of typing long names, use ref: follow by the tuning ID to create a link.',
    example: 'target = ref:12345',
    category: 'syntax',
    tags: ['link', 'tuning', 'connection']
  },
  {
    id: 'syntax-when',
    label: 'WHEN Interaction "ID"',
    description: 'Triggers logic when a specific game interaction occurs.',
    newbieTip: 'Think of this as the "Starter". It tells the game WHEN to start running your mod logic.',
    example: 'WHEN Interaction "MySuperInteraction"',
    category: 'syntax',
    tags: ['trigger', 'start', 'event']
  },
  {
    id: 'syntax-do',
    label: 'DO Buff "ID"',
    description: 'Executes an action (like giving a Sim a buff) when the trigger occurs.',
    newbieTip: 'This is the "Result". It tells the game what to DO once the WHEN trigger happens.',
    example: 'DO Buff "MyHappyBuff"',
    category: 'syntax',
    tags: ['action', 'result', 'effect']
  },
  {
    id: 'syntax-onlyif',
    label: 'ONLY_IF State "ID"',
    description: 'Adds a condition to the logic. The action only happens if this is true.',
    newbieTip: 'Use this for "Checks". For example, DO give a buff ONLY_IF the Sim is already Hungry.',
    example: 'ONLY_IF State "Hungry"',
    category: 'syntax',
    tags: ['condition', 'check', 'requirement']
  },
  {
    id: 'syntax-localization',
    label: 'LOCALIZATION ID:',
    description: 'Defines a translated string or text entry.',
    newbieTip: 'All your text (names, descriptions) goes here so it can be translated easily.',
    example: 'LOCALIZATION MyString:\n  0xABC123 = "My Custom Text"',
    category: 'syntax',
    tags: ['text', 'translation', 'stbl']
  },
  {
    id: 'syntax-comment',
    label: '# Comment',
    description: 'Adds notes that the game ignores.',
    newbieTip: 'Start a line with # to remind yourself (or others) what this part of the code does.',
    example: '# This interaction triggers when the Sim is hungry',
    category: 'syntax',
    tags: ['note', 'documentation']
  },

  // Sims 4 Modding
  {
    id: 'mod-interaction',
    label: 'Interaction (mixer)',
    description: 'A basic social or object interaction.',
    newbieTip: 'Mixer interactions are "secondary" actions that happen while a Sim is already doing something else.',
    example: '<I c="MixerInteraction" i="interaction" m="interactions.base.mixer_interaction" n="MyMod:Mixer_Example" s="12345">\n  <T n="display_name">0xABC123</T>\n</I>',
    category: 'modding',
    tags: ['social', 'action', 'xml']
  },
  {
    id: 'mod-stbl',
    label: 'STBL String',
    description: 'A localized text entry (translated text).',
    newbieTip: 'Sims 4 uses Hex codes (like 0xABC123) for text so it can be translated into other languages easily.',
    example: '0xABC123 = "Hello World"',
    category: 'modding',
    tags: ['text', 'translation', 'string']
  },
  {
    id: 'mod-buff',
    label: 'Buff / Mood',
    description: 'A temporary state or emotion for a Sim.',
    newbieTip: 'Buffs can change a Sim\'s mood (Happy, Sad, Angry) or add special behaviors.',
    example: '<U n="buff">\n  <V n="buff_reason" t="enabled">\n    <T n="enabled">0x12345678</T>\n  </V>\n  <T n="buff_type">12345</T>\n</U>',
    category: 'modding',
    tags: ['emotion', 'state', 'personality']
  },

  // AI Actions
  {
    id: 'ai-explain',
    label: '/explain',
    description: 'AI breakdown of the current file logic.',
    newbieTip: 'Use this if you\'re looking at code you didn\'t write and want to understand it quickly.',
    example: '/explain this file',
    category: 'ai',
    tags: ['help', 'understanding', 'tutorial']
  },
  {
    id: 'ai-fix',
    label: '/fix',
    description: 'AI scan and repair of syntax or logic errors.',
    newbieTip: 'If you see red underlines or your mod isn\'t working, let the AI try to find the mistake.',
    example: '/fix my errors',
    category: 'ai',
    tags: ['debug', 'repair', 'syntax']
  }
]

export class CommandDictionary {
  static getAll(): CommandEntry[] {
    return COMMANDS
  }

  static search(query: string): CommandEntry[] {
    const q = query.toLowerCase()
    return COMMANDS.filter(c => 
      c.label.toLowerCase().includes(q) || 
      c.description.toLowerCase().includes(q) ||
      c.tags.some(t => t.includes(q))
    )
  }

  static getByCategory(category: CommandEntry['category']): CommandEntry[] {
    return COMMANDS.filter(c => c.category === category)
  }
}

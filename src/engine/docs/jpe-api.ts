export interface DocEntry {
  id: string;
  title: string;
  category: 'keyword' | 'metadata' | 'tuning';
  description: string;
  jpeExample: string;
  xmlEquiv?: string;
  externalLink?: string;
}

export const JPE_DOC_ENTRIES: DocEntry[] = [
  {
    id: 'metadata',
    title: '[Metadata]',
    category: 'metadata',
    description: 'The root section containing core instance information like class, id, and module. This is required for valid Sims 4 tuning generation.',
    jpeExample: '[Metadata]\nclass = "Trait"\nid = "12345"\nmodule = "traits.trait"',
    xmlEquiv: '<I c="Trait" i="12345" m="traits.trait" n="..." s="...">',
  },
  {
    id: 'only-if',
    title: 'ONLY_IF',
    category: 'keyword',
    description: 'Defines a list of conditional tests that must evaluate to true for the parent interaction or outcome to execute.',
    jpeExample: 'ONLY_IF {\n  Trait_Loner = true\n  Skill_Cooking >= 5\n}',
    xmlEquiv: '<L n="tests">\n  <L>\n    <V t="trait">...</V>\n  </L>\n</L>',
  },
  {
    id: 'do',
    title: 'DO',
    category: 'keyword',
    description: 'Specifies the primary outcome or series of responses triggered by a successful interaction.',
    jpeExample: 'DO {\n  Notification = "Hello World!"\n  Loot = "Loot_Happy_Mood"\n}',
    xmlEquiv: '<U n="outcome">\n  <V n="single">\n    <U n="actions">...</U>\n  </V>\n</U>',
  },
  {
    id: 'when',
    title: 'WHEN',
    category: 'keyword',
    description: 'Handles conditional toggles or variants within a tuning element (e.g. Enabled/Disabled states).',
    jpeExample: 'WHEN (enabled) {\n  Buff_Happy = active\n}',
    xmlEquiv: '<V n="enabled" t="enabled">\n  <U n="enabled">...</U>\n</V>',
  },
  {
    id: 'interactions',
    title: 'Interactions',
    category: 'tuning',
    description: 'A list of social or object interactions associated with a career, trait, or object.',
    jpeExample: 'Interactions {\n  - "Social_Friendly_Chat"\n  - "Object_Practice_Cooking"\n}',
    xmlEquiv: '<L n="interactions">\n  <T>12345</T>\n</L>',
  },
  {
    id: 'buffs',
    title: 'Buffs',
    category: 'tuning',
    description: 'Mood modifiers or status effects applied to a Sim.',
    jpeExample: 'Buffs {\n  - "Buff_Inspired"\n  - "Buff_Confident"\n}',
    xmlEquiv: '<L n="buffs">\n  <T>12345</T>\n</L>',
  }
];

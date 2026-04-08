/**
 * JPE Command Dictionary
 * A newbie-friendly reference for Sims 4 JPE modding logic.
 */

export interface DictionaryEntry {
  id: string
  name: string
  category: 'WHEN' | 'ONLY_IF' | 'DO' | 'LOCALIZATION'
  description: string
  sims4Context: string
  example: string
  newbieTip: string
}

export const JPE_DICTIONARY: DictionaryEntry[] = [
  // TRIGGERS (WHEN)
  {
    id: 'when-interaction-start',
    name: 'Interaction Start',
    category: 'WHEN',
    description: 'Executes logic when a Sim begins an interaction.',
    sims4Context: 'This is the most common trigger. Use it to add buffs or traits as soon as a Sim starts doing something (like cooking or sleeping).',
    example: 'WHEN Interaction Start ("CookMeal")',
    newbieTip: 'Think of WHEN as the "Alarm Clock" of your mod. It tells the game when to wake up and run your code.'
  },
  {
    id: 'when-buff-added',
    name: 'Buff Added',
    category: 'WHEN',
    description: 'Executes logic when a specific buff (moodlet) is applied to a Sim.',
    sims4Context: 'Great for "Chain Reactions". For example, when a Sim gets "Inspired", you can use this to automatically give them a skill boost.',
    example: 'WHEN Buff Added ("Inspired")',
    newbieTip: 'Use this if you want your mod to react to a Sims mood!'
  },

  // CONDITIONS (ONLY_IF)
  {
    id: 'if-sim-mood',
    name: 'Sim Mood',
    category: 'ONLY_IF',
    description: 'Checks if the Sim is currently in a specific mood.',
    sims4Context: 'Used to restrict actions. For example, a Sim can ONLY_IF Mood is Angry.',
    example: 'ONLY_IF Sim Mood Is "Angry"',
    newbieTip: 'ONLY_IF is a "Gatekeeper". If the condition isnt met, the mod stops right there.'
  },
  {
    id: 'if-target-is-sim',
    name: 'Target is Sim',
    category: 'ONLY_IF',
    description: 'Checks if the object the Sim is interacting with is another Sim.',
    sims4Context: 'Crucial for social interactions. Ensures you dont try to "Hug" a refrigerator.',
    example: 'ONLY_IF Target is Sim',
    newbieTip: 'Always use this for social mods to prevent game glitches!'
  },

  // ACTIONS (DO)
  {
    id: 'do-add-buff',
    name: 'Add Buff',
    category: 'DO',
    description: 'Gives the Sim a specific buff (moodlet).',
    sims4Context: 'This is how you make Sims Happy, Sad, or Energetic through your mod.',
    example: 'DO Add Buff ("JoyfulBuff", duration: 120)',
    newbieTip: 'Duration is in Sims minutes. 60 = 1 hour.'
  },
  {
    id: 'do-push-interaction',
    name: 'Push Interaction',
    category: 'DO',
    description: 'Forces the Sim to start a new interaction immediately.',
    sims4Context: 'Useful for "Autonomy mods". For example, if a Sim is "Hungry", you can DO Push Interaction ("EatLeftovers").',
    example: 'DO Push Interaction ("CleanToilet")',
    newbieTip: 'Be careful! Pushing too many interactions at once can make a Sim "Reset" (T-Pose).'
  },

  // META (LOCALIZATION)
  {
    id: 'meta-localization',
    name: 'Localization',
    category: 'LOCALIZATION',
    description: 'Defines the human-readable text for your mod (STBL).',
    sims4Context: 'This translates your code IDs into actual words the player sees in the game menus.',
    example: 'LOCALIZATION GreetName: "Give a Big Hug"',
    newbieTip: 'If you forget this, the game will show "DEBUG" text or blank bubbles!'
  }
]

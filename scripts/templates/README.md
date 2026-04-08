# JPE Templates Pack

A comprehensive collection of 20+ production-ready templates for creating The Sims 4 mods with JPE syntax.

## Quick Start

Each template is a complete, copy-paste-ready JPE file. Choose a template, copy it, paste it into JPE Studio, modify names and values, and build!

## Templates by Category

### Social Interactions (6 templates)
- `simple_greeting.jpe` - Basic friendly greeting between Sims
- `romantic_kiss.jpe` - Romantic interaction for couples
- `deep_conversation.jpe` - Friendship-building conversation
- `tell_joke.jpe` - Comedy interaction to boost mood
- `give_compliment.jpe` - Self-esteem boosting interaction
- `group_chat.jpe` - Multi-Sim conversation system

### Romantic Interactions (3 templates)
- `propose_marriage.jpe` - Marriage proposal
- `slow_dance.jpe` - Romantic dance interaction
- `share_meal.jpe` - Romantic dinner interaction

### Skills & Learning (4 templates)
- `painting_practice.jpe` - Skill building for art
- `cooking_session.jpe` - Cooking skill development
- `study_group.jpe` - Group learning interaction
- `skill_mentorship.jpe` - Expert teaching a novice

### Moods & Emotions (3 templates)
- `cheer_up.jpe` - Help sad Sims feel better
- `calm_down.jpe` - De-escalate angry Sims
- `celebrate_victory.jpe` - Victory celebration buff

### Home & Family (2 templates)
- `family_dinner.jpe` - Multi-family gathering
- `sibling_bond.jpe` - Sibling relationship builder

### Traits & Preferences (2 templates)
- `animal_lover.jpe` - Pet interaction trait
- `bookworm.jpe` - Reading passion trait

### Objects & Activities (2 templates)
- `bartender_service.jpe` - Serving drinks interaction
- `gaming_session.jpe` - Video game playing interaction

### Fitness & Wellness (2 templates)
- `workout_session.jpe` - Fitness training and exercise
- `meditation_practice.jpe` - Meditation and mindfulness

### Hobbies & Crafts (2 templates)
- `gardening_hobby.jpe` - Plant care and gardening
- `music_jam_session.jpe` - Musical performance and collaboration

### Career Development (1 template)
- `career_advancement.jpe` - Job performance and promotions

---

## Total: 25 Production-Ready Templates

## How to Use a Template

1. **Open JPE Studio**
2. **File → New**
3. **Copy the entire contents of a template file**
4. **Paste into the editor**
5. **Modify:**
   - Interaction names
   - Descriptions
   - Durations
   - Test conditions (if needed)
   - Effect values (if needed)
6. **Build → Create** (or press Build button)
7. **Test in-game**

## Template Structure

All templates follow this structure:

```jpe
Interaction Name
  description: "What the interaction does"
  type: social  # or object, autonomous, etc.
  duration: 30  # seconds
  tests:
    - test condition 1
    - test condition 2
  effects:
    - effect 1
    - effect 2

---

Buff Or Effect Name
  description: "What the buff does"
  mood_type: positive  # or negative
  intensity: 2
  duration: 120  # seconds
  mood_gain: 20
```

## Customization Guide

### Changing Names
- Replace "Interaction Name" with your custom interaction name
- Keep names clear and descriptive

### Changing Duration
- Measured in seconds
- 10 = 10 seconds, 60 = 1 minute
- Typical ranges:
  - Quick interactions: 5-15 seconds
  - Normal interactions: 20-60 seconds
  - Long interactions: 90-300 seconds

### Changing Effects
- Mood effects: `+ happy feeling`, `- sad feeling`
- Skill changes: `increase painting skill by 1`
- Relationship changes: `increase friendship +20`
- Add buffs: `add energized feeling`
- Remove buffs: `remove tired feeling`

### Changing Tests
- Actor conditions: `actor is adult`, `actor is not tired`
- Target conditions: `target is in good mood`, `target has romance with actor`
- Location: `not in public`, `in home lot`
- Relationship: `actor knows target`, `actor is friends with target`
- Skill: `actor has painting skill level 3`

## Tips & Tricks

1. **Test as you go** - Don't wait until the end to test
2. **Start simple** - Master basic interactions before complex ones
3. **Use meaningful names** - Help future-you understand your code
4. **Comment with ---** - Separate interactions for clarity
5. **Check examples** - Look at similar templates when unsure
6. **Build often** - Get fast feedback on syntax errors

## Common Customizations

### Make interaction require high friendship
```jpe
tests:
  - actor is best friend with target
  - relationship is high
```

### Make interaction boost skill
```jpe
effects:
  - increase [skill_name] skill by 1
  - add focused feeling  # optional motivation buff
```

### Add multiple buffs
```jpe
effects:
  - add happy feeling
  - add inspired feeling
  - add energized feeling
```

### Make interaction for specific trait
```jpe
tests:
  - actor has [trait_name] trait
  - target is compatible
```

## Troubleshooting Templates

### "Unknown test" error
Check if the test name matches exactly. Most common tests:
- `actor is adult`, `actor is child`, `actor is teen`
- `actor is in good mood`, `target is sad`
- `not in public`, `in home lot`
- `actor knows target`, `both are friends`

### "Unknown effect" error
Check the effect syntax. Most common effects:
- `increase friendship +[number]`
- `increase [skill] skill by [number]`
- `add [buff_name] feeling`
- `increase mood by [number]`

### Interaction doesn't appear in-game
1. Check for build errors (bottom of screen in Studio)
2. Verify interaction name is spelled correctly
3. Make sure file is saved as `.jpe`
4. Verify file is in correct Mods folder
5. Restart The Sims 4 game

## Template Naming Convention

Templates use this format:
- `lower_case_with_underscores.jpe`
- Example: `romantic_kiss.jpe`, `painting_practice.jpe`

When creating your own templates, follow this convention for consistency.

---

## Need Help?

- **Questions about JPE?** See `JPE_MASTER_BIBLE.md`
- **Getting started?** See `JPE_QUICK_START.md`
- **Advanced techniques?** Check advanced patterns guide
- **Template not working?** Check troubleshooting section

---

**Happy modding!** 🎮✨

All templates are provided as-is. Feel free to mix, match, and customize to create your own unique Sims 4 mods!

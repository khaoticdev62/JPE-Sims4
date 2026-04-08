# JPE Advanced Patterns & Best Practices Guide

**For**: Intermediate to Advanced JPE Users
**Level**: Advanced
**Time to Master**: 2-4 weeks of practice

---

## Table of Contents

1. [Design Patterns](#design-patterns)
2. [Advanced Test Combinations](#advanced-test-combinations)
3. [Effect Chains & Sequences](#effect-chains--sequences)
4. [Performance Optimization](#performance-optimization)
5. [Complex Interactions](#complex-interactions)
6. [Relationship Systems](#relationship-systems)
7. [Skill Progression](#skill-progression)
8. [Event-Based Interactions](#event-based-interactions)
9. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
10. [Debugging & Troubleshooting](#debugging--troubleshooting)

---

## Design Patterns

### Pattern 1: The Guard Clause Pattern

**Purpose**: Fail fast by checking impossible conditions first

**Problem**: Without guard clauses, interactions might execute partially before failing

**Solution**: Put most restrictive tests first

```jpe
Romantic Kiss
  description: "Share a passionate kiss"
  type: social
  duration: 15
  tests:
    # Guard clauses (most restrictive first)
    - both are adults
    - both are in love
    - actor is romantic with target
    - both are in good mood
    - not in public
    - target is not busy
  effects:
    - increase romance +30
    - add romantic feeling
```

**Why it works**:
- `both are adults` fails immediately if anyone is underage
- `both are in love` eliminates non-romantic relationships early
- Later tests (mood checks) only run if romance is confirmed
- Saves processing on impossible scenarios

**Best Practice**: Order tests from general to specific, restrictive to permissive

---

### Pattern 2: The Mood State Machine Pattern

**Purpose**: Create different interaction outcomes based on emotional state

**Problem**: Static interactions don't account for complex emotional states

**Solution**: Use multiple interactions that respond to mood

```jpe
Comfort a Friend
  description: "Offer support to someone going through a hard time"
  type: social
  duration: 30
  tests:
    - target is sad
    - actor is good friend with target
    - actor is in good mood
  effects:
    - remove sad feeling
    - add comforted feeling
    - increase friendship +20

---

Comfort a Friend (Angry)
  description: "Try to calm an angry friend"
  type: social
  duration: 20
  tests:
    - target is angry
    - actor is good friend with target
    - actor is calm
    - actor is diplomatic trait
  effects:
    - reduce anger by 50%
    - add peaceful feeling
    - increase friendship +10

---

Comfort a Friend (Upset)
  description: "Provide comfort to upset friend"
  type: social
  duration: 25
  tests:
    - target is upset
    - actor is good friend with target
    - actor is empathetic
  effects:
    - remove upset feeling
    - add supported feeling
    - increase friendship +15
```

**Why it works**:
- Different interaction names allow player choice
- Each interaction has specific test conditions
- Outcomes match the emotional context
- Player feels intelligent system response

**Best Practice**: Create mood-specific variants for key interactions

---

### Pattern 3: The Skill Gate Pattern

**Purpose**: Lock advanced interactions behind skill requirements

**Problem**: Players might use advanced features before understanding basics

**Solution**: Gate interactions by skill level

```jpe
Basic Flirting
  description: "Start a simple flirtation"
  type: social
  duration: 10
  tests:
    - actor is teen or older
    - target is interested
  effects:
    - increase romance +5
    - add flirty feeling

---

Charming Flirtation
  description: "Use charm and wit for better results"
  type: social
  duration: 15
  tests:
    - actor has charisma skill level 3+
    - target is interested
    - actor is in good mood
  effects:
    - increase romance +15
    - add attracted feeling
    - increase charisma skill by 1

---

Expert Seduction
  description: "Master-level romantic interaction"
  type: social
  duration: 20
  tests:
    - actor has charisma skill level 8+
    - actor has romance skill level 7+
    - target is interested in romance
    - both are adults
    - not in public
  effects:
    - increase romance +40
    - increase charisma skill by 2
    - add captivated feeling

---

Charisma Skill
  description: "Mastery of persuasion and charm"
  category: social
  max_level: 10
```

**Why it works**:
- Creates progression path (Basic → Charming → Expert)
- Higher skill requirement = better rewards
- Encourages skill building
- Prevents overpowered early game

**Best Practice**: Create 3-4 levels of interaction difficulty

---

### Pattern 4: The Trait Synergy Pattern

**Purpose**: Create powerful interactions when specific traits combine

**Problem**: Traits feel isolated without interaction

**Solution**: Make interactions that reward trait combinations

```jpe
Romantic Evening (Loves Outdoors + Loves Cooking)
  description: "Cook dinner outside under the stars"
  type: social
  duration: 90
  tests:
    - actor has loves outdoors trait
    - actor has loves cooking trait
    - target is interested
    - weather is clear
  effects:
    - increase romance +50
    - increase mood by 40
    - increase cooking skill by 2
    - add romantic feeling
    - add inspired feeling

---

Brainstorm Session (Genius + Creative)
  description: "Two brilliant minds collaborate"
  type: social
  duration: 60
  tests:
    - actor has genius trait
    - actor has creative trait
    - target has similar traits
    - both are in focus mood
  effects:
    - increase logic skill by 3
    - increase creativity skill by 3
    - increase friendship +30
    - add inspired feeling

---

Outdoor Adventure (Adventurous + Brave + Active)
  description: "Epic adventure for thrill-seekers"
  type: social
  duration: 120
  tests:
    - actor has adventurous trait
    - actor has brave trait
    - actor has active trait
    - target has same traits
    - location is outdoor
  effects:
    - increase mood by 50
    - increase fitness skill by 2
    - increase friendship +40
    - add adrenaline feeling

---

Adrenaline Feeling
  description: "Rush from danger and excitement"
  mood_type: positive
  intensity: 4
  duration: 600
  mood_gain: 50
```

**Why it works**:
- Rewards thoughtful trait combinations
- Makes traits matter beyond restrictions
- Creates high-value interactions
- Encourages diverse Sim personalities

**Best Practice**: Design 5-10 trait synergy interactions per mod

---

### Pattern 5: The Context-Aware Pattern

**Purpose**: Same interaction has different outcomes in different contexts

**Problem**: Interactions feel repetitive in different locations/times

**Solution**: Use context (location, weather, time) to modify effects

```jpe
Cook Dinner (Home)
  description: "Cook a meal in your own kitchen"
  type: object
  duration: 60
  tests:
    - location is home lot
    - actor has cooking skill
    - kitchen is available
  effects:
    - increase cooking skill by 2
    - increase mood by 15
    - create meal for household

---

Cook Dinner (Camping)
  description: "Cook over a campfire"
  type: object
  duration: 90
  tests:
    - location is campground
    - actor has cooking skill
    - campfire is available
    - actor has camping trait
  effects:
    - increase cooking skill by 1
    - increase mood by 25
    - add adventurous feeling
    - increase fitness by 1

---

Cook Dinner (Restaurant)
  description: "Collaborate with professional chefs"
  type: social
  duration: 45
  tests:
    - location is restaurant
    - actor has cooking skill level 7+
    - chef is available
  effects:
    - increase cooking skill by 3
    - increase profession exp
    - increase friendship +20 with chef

---

Adventurous Feeling
  description: "Feeling alive and daring"
  mood_type: positive
  intensity: 3
  duration: 240
  mood_gain: 25
```

**Why it works**:
- Same interaction feels fresh in different contexts
- Context creates natural progression (Home → Camping → Restaurant)
- Location-specific details add realism
- Encourages exploration

**Best Practice**: Create 2-3 context variants for key interactions

---

## Advanced Test Combinations

### Complex Logic Tests

#### Pattern: AND Logic (All conditions required)
```jpe
Advanced Interaction
  description: "Requires multiple conditions met"
  type: social
  duration: 30
  tests:
    - actor is adult
    - actor has high career
    - target is romantic interest
    - both are in good mood
    - not in public
  effects:
    - increase romance +25
```

**How it works**: ALL conditions must be true (implicit AND)

---

#### Pattern: Skill + Mood Combination
```jpe
Expert Analysis
  description: "Only works when skilled AND focused"
  type: object
  duration: 60
  tests:
    - actor has logic skill level 8+
    - actor is in focus mood
    - research materials available
  effects:
    - increase logic skill by 3
    - complete research faster
    - add satisfied feeling
```

**Use case**: Combines skill requirement with emotional state

---

#### Pattern: Trait + Skill + Mood Trinity
```jpe
Genius Innovation
  description: "The perfect storm of brilliance"
  type: object
  duration: 120
  tests:
    - actor has genius trait
    - actor has logic skill level 9+
    - actor has programming skill level 8+
    - actor is in focus mood
    - location has workstation
  effects:
    - increase both skills by 4
    - create breakthrough invention
    - increase career significantly
    - add genius feeling

---

Genius Feeling
  description: "Eureka! A moment of pure brilliance"
  mood_type: positive
  intensity: 4
  duration: 300
  mood_gain: 50
```

**Why**: Three layers (trait, skill, mood) create rare, powerful moments

---

### Negative Test Conditions

```jpe
Grounded Teen Sneak Out
  description: "Secretly escape while parents sleep"
  type: autonomous
  duration: 30
  tests:
    - actor is teen
    - actor is grounded
    - parents are sleeping
    - actor is not being watched
    - actor is mischievous trait
  effects:
    - increase mischief skill by 1
    - increase friendship with friends
    - risk of getting caught
    - add thrilled feeling
```

**Use case**: Actions that should happen secretly or against rules

---

## Effect Chains & Sequences

### Pattern 1: Cascading Effects

**Purpose**: One action triggers effects that lead to more effects

```jpe
Party All Night
  description: "Wild night of fun and debauchery"
  type: social
  duration: 240
  tests:
    - actor is young adult or older
    - actor is in good mood
    - location is party venue
    - friends are present
  effects:
    - increase mood by 50
    - add party feeling
    - add drunk feeling
    - add exhausted feeling
    - increase friendship +30 with all guests

---

Party Feeling
  description: "In the middle of an epic party"
  mood_type: positive
  intensity: 4
  duration: 480
  mood_gain: 50

---

Drunk Feeling
  description: "Under the influence"
  mood_type: negative
  intensity: 3
  duration: 480
  mood_gain: -20

---

Exhausted Feeling
  description: "Completely worn out"
  mood_type: negative
  intensity: 2
  duration: 600
  mood_gain: -15
```

**Why it works**:
- Multiple buffs create complex emotional state
- Positive and negative effects balance each other
- Realistic consequences (drunk + exhausted after party)

---

### Pattern 2: Progressive Intensity

```jpe
Build Up Anger
  description: "Start getting annoyed"
  type: social
  duration: 20
  tests:
    - target is being rude
    - actor is not patient trait
  effects:
    - add slightly annoyed feeling

---

Escalate to Fury
  description: "Rage is building"
  type: social
  duration: 15
  tests:
    - actor is slightly annoyed
    - target continues being rude
  effects:
    - remove slightly annoyed feeling
    - add very angry feeling
    - increase conflict

---

Explode in Rage
  description: "Complete loss of control"
  type: social
  duration: 10
  tests:
    - actor is very angry
    - target is still being hostile
  effects:
    - remove very angry feeling
    - add furious feeling
    - damage relationship significantly
    - risk of fight

---

Slightly Annoyed Feeling
  mood_type: negative
  intensity: 1
  duration: 120
  mood_gain: -3

---

Very Angry Feeling
  mood_type: negative
  intensity: 2
  duration: 240
  mood_gain: -15

---

Furious Feeling
  mood_type: negative
  intensity: 4
  duration: 360
  mood_gain: -40
```

**Why it works**:
- Builds tension progressively
- Player can interrupt at any stage
- Realistic emotional escalation
- Consequences scale with intensity

---

## Performance Optimization

### Pattern 1: Batch Similar Effects

**Instead of:**
```jpe
# Bad: Repetitive individual buffs
effect:
  - add happy feeling
  - add satisfied feeling
  - add content feeling
  - add pleased feeling
```

**Do:**
```jpe
# Good: One comprehensive buff
Satisfied and Happy Feeling
  description: "Completely satisfied with life"
  mood_type: positive
  intensity: 4
  duration: 240
  mood_gain: 40
```

**Why**: Fewer buffs = better performance

---

### Pattern 2: Reuse Common Buffs

**Instead of:**
```jpe
# Bad: Creating buff for every interaction
Exercise Buff
  description: "Just exercised"
  # ...

Working Out Buff
  description: "Currently working out"
  # ...

Fitness Activity Buff
  description: "Fitness related activity"
  # ...
```

**Do:**
```jpe
# Good: Generic, reusable buffs
Active Feeling
  description: "Recently active or exercising"
  mood_type: positive
  intensity: 2
  duration: 240
  mood_gain: 15
```

**Why**: Reduces buff bloat, improves reusability

---

### Pattern 3: Limit Test Conditions

**Instead of:**
```jpe
# Bad: Too many specific tests
Interaction
  tests:
    - actor is not tired
    - actor is not hungry
    - actor is not stressed
    - actor is not bored
    - actor is not sad
    - actor has time
    - actor is not busy
    - location is appropriate
```

**Do:**
```jpe
# Good: Consolidated tests
Interaction
  tests:
    - actor is in good state
    - actor is available
    - location is appropriate
```

**Why**: Fewer tests = faster checks

---

## Complex Interactions

### Multi-Stage Interaction

```jpe
# Stage 1: Initiate
Ask Someone Out
  description: "Start the dating process"
  type: social
  duration: 20
  tests:
    - actor is interested in romance
    - target is single
    - actor is in good mood
    - actor has conversation skill level 3+
  effects:
    - add nervous feeling
    - create romantic interest

---

# Stage 2: Response (if interested)
They Said Yes
  description: "Your date interest reciprocates"
  type: social
  duration: 30
  tests:
    - romantic interest exists both ways
  effects:
    - remove nervous feeling
    - add excited feeling
    - increase romance +20
    - create date opportunity

---

# Stage 3: Execution
Go On Date
  description: "Have a romantic date"
  type: social
  duration: 120
  tests:
    - romantic interest exists
    - both are available
    - venue is prepared
  effects:
    - increase romance +50
    - increase friendship +20
    - add romantic feeling

---

# Stage 4: Outcome
Ask to Move In Together
  description: "Take the relationship to next level"
  type: social
  duration: 20
  tests:
    - romance is very high
    - relationship duration is long
    - both are in love
  effects:
    - create household together
    - increase romance +100
    - add committed feeling

---

Nervous Feeling
  mood_type: negative
  intensity: 2
  duration: 180
  mood_gain: -5

---

Excited Feeling
  mood_type: positive
  intensity: 3
  duration: 240
  mood_gain: 25

---

Committed Feeling
  mood_type: positive
  intensity: 3
  duration: 3600
  mood_gain: 30
```

**Why it works**:
- Natural story progression
- Each stage has prerequisites
- Player feels story unfolding
- Multiple outcomes possible

---

### Branching Interaction

```jpe
Respond to Apology (Accept)
  description: "Forgive their mistake"
  type: social
  duration: 15
  tests:
    - they apologized
    - you are not angry
  effects:
    - remove resentment
    - add forgiving feeling
    - increase friendship +10

---

Respond to Apology (Reject)
  description: "Refuse to forgive yet"
  type: social
  duration: 10
  tests:
    - they apologized
    - you are still angry
  effects:
    - keep resentment
    - increase conflict

---

Forgiving Feeling
  mood_type: positive
  intensity: 2
  duration: 300
  mood_gain: 15
```

**Why it works**:
- Player choice matters
- Different paths lead to different outcomes
- Feels like player agency

---

## Relationship Systems

### Pattern 1: Relationship Progression

```jpe
# Level 1: Acquaintance
Introduce Yourself
  description: "Meet someone new"
  type: social
  duration: 15
  tests:
    - both are strangers
  effects:
    - become acquainted
    - add initial friendship +5

---

# Level 2: Friend
Have Deep Conversation
  description: "Build a friendship"
  type: social
  duration: 45
  tests:
    - actor knows target
    - actor is not tired
    - target is in good mood
  effects:
    - increase friendship +20
    - add connected feeling

---

# Level 3: Close Friend
Confide in Friend
  description: "Share secrets and inner thoughts"
  type: social
  duration: 60
  tests:
    - friendship is high
    - actor trusts target
    - location is private
  effects:
    - increase friendship +30
    - add trusted feeling

---

# Level 4: Best Friend
Best Friend Oath
  description: "Become sworn best friends"
  type: social
  duration: 30
  tests:
    - friendship is very high
    - both are committed
  effects:
    - create best friend bond
    - increase friendship +50
    - add bonded feeling

---

Connected Feeling
  mood_type: positive
  intensity: 2
  duration: 300
  mood_gain: 15

---

Trusted Feeling
  mood_type: positive
  intensity: 2
  duration: 240
  mood_gain: 12

---

Bonded Feeling
  mood_type: positive
  intensity: 4
  duration: 600
  mood_gain: 35
```

**Why it works**:
- Clear progression path
- Each level has requirements
- Meaningful milestones
- Feels rewarding to advance

---

### Pattern 2: Relationship Conflict & Resolution

```jpe
# Create Conflict
Get in Argument
  description: "Have a heated disagreement"
  type: social
  duration: 30
  tests:
    - both are in bad mood
    - personality clash
  effects:
    - add angry feeling
    - decrease friendship by 20
    - create resentment

---

# Escalate (optional)
Make Things Worse
  description: "Say something hurtful"
  type: social
  duration: 15
  tests:
    - actor is still angry
    - target is still angry
  effects:
    - decrease friendship by 30
    - add hurt feeling

---

# Resolve
Make Amends
  description: "Apologize sincerely"
  type: social
  duration: 20
  tests:
    - actor regrets anger
    - actor is in calm mood
  effects:
    - remove angry feeling
    - add apologetic feeling
    - increase friendship by 15 (but less than lost)

---

Angry Feeling
  mood_type: negative
  intensity: 3
  duration: 240
  mood_gain: -20

---

Hurt Feeling
  mood_type: negative
  intensity: 2
  duration: 300
  mood_gain: -15

---

Apologetic Feeling
  mood_type: negative
  intensity: 1
  duration: 180
  mood_gain: -5
```

**Why it works**:
- Realistic conflict cycle
- Trust must be rebuilt (fewer points recovered)
- Consequences matter
- Players learn about cause/effect

---

## Skill Progression

### Realistic Skill Building

```jpe
# Beginner: Slow growth, high availability
Learn Cooking Basics
  description: "Start learning to cook"
  type: object
  duration: 45
  tests:
    - actor has cooking skill level 0
    - kitchen available
  effects:
    - increase cooking skill by 1
    - add learning feeling

---

# Intermediate: Moderate growth, requirements increase
Practice Advanced Cooking
  description: "Practice difficult recipes"
  type: object
  duration: 60
  tests:
    - actor has cooking skill level 3+
    - actor is not tired
    - advanced kitchen available
  effects:
    - increase cooking skill by 2
    - add focused feeling

---

# Advanced: Difficult to obtain, high rewards
Master Culinary Arts
  description: "Create a masterpiece meal"
  type: object
  duration: 90
  tests:
    - actor has cooking skill level 8+
    - actor has gourmet trait
    - actor is in inspiration mood
    - professional kitchen available
  effects:
    - increase cooking skill by 3
    - create legendary meal
    - gain prestige
    - add triumphant feeling

---

Learning Feeling
  mood_type: positive
  intensity: 1
  duration: 180
  mood_gain: 5

---

Focused Feeling
  mood_type: positive
  intensity: 2
  duration: 240
  mood_gain: 12

---

Triumphant Feeling
  mood_type: positive
  intensity: 4
  duration: 300
  mood_gain: 40
```

**Why it works**:
- Clear progression curve
- Rewards get better at higher levels
- Requirements prevent power gaming
- Feels earned rather than given

---

## Event-Based Interactions

### Trigger by Lifecycle Events

```jpe
# Triggered when Sim becomes adult
Adult Milestone
  description: "Your Sim has come of age"
  type: autonomous
  tests:
    - actor just became adult
    - family is present
  effects:
    - add proud feeling
    - increase family bonds
    - unlock adult interactions

---

# Triggered when Sim gets job
First Day of Work
  description: "Start your new career"
  type: autonomous
  tests:
    - actor just got job
  effects:
    - add nervous feeling
    - add excited feeling
    - meet coworkers

---

# Triggered when relationship milestone reached
Anniversary Celebration
  description: "Celebrate your relationship milestone"
  type: social
  duration: 60
  tests:
    - relationship is exactly 1 year old
    - both are in good mood
  effects:
    - increase romance +50
    - add celebratory feeling

---

Proud Feeling
  mood_type: positive
  intensity: 3
  duration: 300
  mood_gain: 25

---

Nervous Excited Feeling
  mood_type: positive
  intensity: 2
  duration: 240
  mood_gain: 10

---

Celebratory Feeling
  mood_type: positive
  intensity: 3
  duration: 300
  mood_gain: 30
```

**Why it works**:
- Interactions feel reactive to world state
- Special moments feel significant
- Creates memorable events
- Marks important life transitions

---

## Anti-Patterns to Avoid

### ❌ Anti-Pattern 1: Test Bloat

**BAD:**
```jpe
Interaction
  tests:
    - actor is adult
    - actor is female
    - actor is not pregnant
    - actor is not nursing
    - actor is not sick
    - actor is not tired
    - actor is not hungry
    - actor is not in bad mood
    - target is adult
    - target is male
    - target is not in public
    - target is not working
    # ... 20 more tests
```

**GOOD:**
```jpe
Interaction
  tests:
    - both are adults
    - both are available
    - not in public
```

**Why**: Too many tests create unrealistic requirements. Real Sims can do things imperfectly.

---

### ❌ Anti-Pattern 2: Over-Powered Early Game

**BAD:**
```jpe
# Available immediately, gives everything
Cheat Interaction
  description: "Get everything"
  type: object
  duration: 1
  tests:
    - none
  effects:
    - increase all skills by 10
    - increase money by 1000000
    - unlock all content
```

**GOOD:**
```jpe
# Requires progression
Master Achievement
  description: "Accomplish great things"
  type: object
  duration: 120
  tests:
    - actor has completed challenges
    - actor has high career
    - actor is respected
  effects:
    - large but reasonable rewards
    - unlock special interaction
```

**Why**: Balance makes the game enjoyable. Overpowered = boring.

---

### ❌ Anti-Pattern 3: Conflicting Buffs

**BAD:**
```jpe
Interaction
  effects:
    - add happy feeling
    - add sad feeling
    - add angry feeling
```

**GOOD:**
```jpe
# Either happy OR sad, not both
Happy Interaction
  effects:
    - add happy feeling

Sad Interaction
  effects:
    - add sad feeling
```

**Why**: Conflicting emotions cancel out. Choose ONE emotional direction per interaction.

---

### ❌ Anti-Pattern 4: Unclear Descriptions

**BAD:**
```jpe
Interaction
  description: "Do the thing"
```

**GOOD:**
```jpe
Interaction
  description: "Share a moment of laughter and strengthen your bond"
```

**Why**: Good descriptions help players understand what will happen.

---

### ❌ Anti-Pattern 5: Missing Consequences

**BAD:**
```jpe
Cheat on Partner
  description: "Have an affair"
  type: social
  duration: 30
  tests:
    - actor is in relationship
    - actor is alone with someone else
  effects:
    - add guilty feeling
```

**GOOD:**
```jpe
Cheat on Partner
  description: "Have an affair (with consequences)"
  type: social
  duration: 30
  tests:
    - actor is in relationship
    - actor is alone with someone else
    - risk of discovery
  effects:
    - add guilty feeling
    - risk damage to main relationship
    - if discovered: relationship breaks
```

**Why**: Meaningful actions should have meaningful consequences.

---

## Debugging & Troubleshooting

### Debug Technique 1: Test Isolation

**Problem**: Interaction never shows up
**Solution**: Remove tests one by one

```jpe
# Start here - no tests
Interaction
  description: "Testing visibility"
  type: social
  duration: 10
  effects:
    - increase mood by 10

# Then add tests back one by one
  tests:
    - actor is adult

# Then:
  tests:
    - actor is adult
    - actor is in good mood

# Keep adding until it disappears
# That's your problematic test
```

---

### Debug Technique 2: Effect Verification

**Problem**: Effects aren't working
**Solution**: Simplify effects

```jpe
# Start simple
Interaction
  effects:
    - add happy feeling

# Then add effects one by one
  effects:
    - add happy feeling
    - increase mood by 10

# Keep going:
  effects:
    - add happy feeling
    - increase mood by 10
    - increase friendship +5

# When something breaks, you found the issue
```

---

### Debug Technique 3: Buff Conflict Testing

**Problem**: Buffs not applying
**Solution**: Test with basic buff

```jpe
# Test with minimal buff first
TestBuff
  description: "Test mood change"
  mood_type: positive
  intensity: 1
  duration: 60
  mood_gain: 5

# Interaction with test buff
Interaction
  effects:
    - add TestBuff

# If this works, debug the complex buff
```

---

### Debug Technique 4: Syntax Validation

**Problem**: "Unknown property" error
**Solution**: Check exact spelling

```jpe
# Check these are exact
description:  # Correct spelling
descrition:   # WRONG - one letter off

mood_type:    # Correct
mood_Type:    # WRONG - capital T

mood_gain:    # Correct
mood_Gain:    # WRONG - capital G
```

---

## Advanced Tips & Tricks

### Tip 1: Use Comments for Documentation

```jpe
# Tip: Use # for explanatory comments

Skill Building Interaction
  description: "Improve a skill"
  # This interaction is designed for intermediate players
  # It requires skill level 3+ and focus mood
  type: object
  duration: 60
  tests:
    - actor has skill level 3+
    - actor is in focus mood
  effects:
    - increase skill by 2
    # Provides good progression without being overpowered
```

---

### Tip 2: Name Interactions for Intent

**BAD:**
```jpe
Interaction A
Interaction B
Helper Effect
```

**GOOD:**
```jpe
Propose Marriage
Marriage Proposal Excitement
Committed Couple Status
```

**Why**: Good names = self-documenting code

---

### Tip 3: Group Related Interactions

```jpe
# Friendship interactions
Compliment Friend
Hug Friend
Have Deep Talk

---

# Romantic interactions
Hold Hands
Kiss
Propose

---

# Skill interactions
Practice Skill
Learn from Expert
Perfect Mastery
```

---

### Tip 4: Version Your Mods

```jpe
# Add version to top of file
# Version: 1.0.0
# Last updated: 2025-12-08
# Compatibility: Sims 4 base game

Interaction
  # ... your code
```

---

## Conclusion

Advanced JPE modding requires:
- **Thinking in systems**: How do interactions connect?
- **Player perspective**: What feels fun and fair?
- **Balance**: Power vs. challenge
- **Consequences**: Actions matter
- **Progression**: Players improve over time
- **Realism**: Believable emotional arcs

Master these patterns and your mods will be exceptional.

---

## Quick Reference: Pattern Types

| Pattern | Purpose | Complexity |
|---------|---------|-----------|
| Guard Clause | Fail fast | ⭐ Medium |
| Mood State Machine | Different outcomes | ⭐⭐ Advanced |
| Skill Gate | Progression | ⭐ Medium |
| Trait Synergy | Reward combinations | ⭐⭐ Advanced |
| Context-Aware | Location variance | ⭐⭐ Advanced |
| Cascading Effects | Chain reactions | ⭐⭐ Advanced |
| Progressive Intensity | Escalation | ⭐⭐⭐ Expert |
| Multi-Stage | Story progression | ⭐⭐⭐ Expert |
| Relationship Progression | Depth building | ⭐⭐ Advanced |
| Event-Based | Reactive world | ⭐⭐ Advanced |

---

**Happy Advanced Modding!** 🚀

For questions, refer to the JPE Master Bible or experiment in the Studio!

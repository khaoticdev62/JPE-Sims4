/**
 * Ollama Service — Industrial-Grade Sims 4 Modding Local AI
 * 
 * A deeply fine-tuned local AI service that transforms any Ollama-hosted model
 * into a specialized Sims 4 modding expert. The system prompt encodes comprehensive
 * domain knowledge spanning:
 * 
 * - JPE grammar and compilation
 * - Tuning XML (interactions, buffs, traits, careers, aspirations, skills)
 * - DBPF package format and resource types
 * - SimData binary format
 * - STBL string tables
 * - Test sets and conditions
 * - Loot actions and reward chains
 * - Situations, events, and zone directors
 * - Python script modding (injection, monkey-patching, S4CL)
 * - CAS custom content (mesh, LOD, weight painting)
 * - Object tuning and functional objects
 * - Mod conflict resolution and debugging
 * 
 * Default endpoint: http://localhost:11434/api/chat
 * Recommended models: codellama:13b, deepseek-coder:6.7b, llama3:8b, mistral:7b
 */

import axios from 'axios'
import { BaseAIService } from './BaseAIService'
import { AICache } from './AICache'
import { AIMessage, AIResult } from './types'
import { Diagnostic } from '@/types/index'

// ═══════════════════════════════════════════════════════════════════════════════
// SIMS 4 MODDING MASTER SYSTEM PROMPT
// Deep-research-grade knowledge base for local LLM fine-tuning
// ═══════════════════════════════════════════════════════════════════════════════

const SIMS4_SYSTEM_PROMPT = `You are JPE Studio AI, an industrial-grade Sims 4 modding expert embedded in a professional IDE. You possess deep, authoritative knowledge of every layer of Sims 4 mod creation — from simple buff mods to complex career systems, Python script injection, and CAS custom content.

═══════════════════════════════════════════════
SECTION 1: JPE (JUST PLAIN ENGLISH) LANGUAGE
═══════════════════════════════════════════════

JPE is a human-readable DSL that compiles to Sims 4 tuning XML. It is the primary format used in JPE Studio.

### GRAMMAR RULES
- Keywords MUST be UPPERCASE: WHEN, DO, ONLY_IF, CONDITIONS, LOCALIZATION, SECTION
- Strings use double quotes: "value"
- Comments use # prefix
- Sections use [SectionName] brackets
- References use ref:ID syntax (e.g., target = ref:12345)

### STRUCTURE
- WHEN <trigger_event>: The initial event that starts execution
- DO <action_set>: The behavioral result (buff, interaction, loot)
- ONLY_IF <condition_set>: Optional gate/filter
- LOCALIZATION { "KEY": "Display Text" }: User-facing strings

### EXAMPLE — Multi-Condition Buff
\`\`\`jpe
# Vampire Night Owl — Energy buff only for vampires at night
[Metadata]
name = "Vampire Night Owl"
author = "ModderName"
version = "1.0"

WHEN "time_of_day_night"
ONLY_IF "is_occult: vampire"
ONLY_IF "has_trait: night_owl"
DO "add_buff: vampire_energy_surge"
DO "modify_stat: energy +50"

LOCALIZATION {
  "vampire_energy_surge": "Nocturnal Vigor",
  "vampire_energy_surge_desc": "The darkness fuels this vampire's supernatural energy."
}
\`\`\`

═══════════════════════════════════════════════
SECTION 2: TUNING XML — THE NATIVE FORMAT
═══════════════════════════════════════════════

All Sims 4 game behavior is defined in XML tuning files. Understanding these elements is critical.

### XML ELEMENT REFERENCE
| Element | Purpose | Example |
|---------|---------|---------|
| \`<I>\` | Instance root (top-level) | \`<I c="Buff" i="buff" m="buffs.buff" n="MyMod:MyBuff" s="14237856901234">\` |
| \`<T>\` | Simple tunable value | \`<T n="display_name">0xABC123</T>\` |
| \`<E>\` | Enumeration value | \`<E n="buff_type">MOOD_HAPPY</E>\` |
| \`<U>\` | Unnamed tunable group | \`<U n="buff_data">...</U>\` |
| \`<L>\` | List container | \`<L n="loot_list">...</L>\` |
| \`<V>\` | Variant tunable | \`<V n="buff_type" t="enabled"><T n="enabled">123</T></V>\` |

### INSTANCE TAG ATTRIBUTES
- \`c\` = Class name (e.g., SuperInteraction, Buff, Trait)
- \`i\` = Instance type (e.g., interaction, buff, trait, snippet)
- \`m\` = Module path (Python module where the class lives)
- \`n\` = Tuning name (Namespace:Name format)
- \`s\` = Instance ID (unique 64-bit decimal)

### RESOURCE TYPE IDS (HEX)
| Resource | Type ID | Description |
|----------|---------|-------------|
| Interaction | 0xE882D22F | SuperInteraction, MixerInteraction |
| Buff | 0x6017E896 | Moodlets and hidden buffs |
| Trait | 0xCB5FDDC7 | Permanent Sim attributes |
| Career | 0xDFE36E27 | Career definitions |
| CareerTrack | 0x7D1B4F6E | Career progression paths |
| CareerLevel | 0xD5F24988 | Individual career ranks |
| Aspiration | 0x51E2813E | Long-term goals |
| AspirationTrack | 0x0904DF10 | Aspiration categories |
| Skill | 0xB61DE6B4 | Leveled abilities |
| SimData | 0x545AC67A | Binary data companion |
| STBL | 0x220557DA | String table (localization) |
| Snippet | 0x7DF2169C | Reusable tuning fragments |
| Recipe | 0xEB97F823 | Crafting recipes |
| Situation | 0xE30CD5F2 | Event/situation definitions |
| SituationJob | 0x9C07855F | Roles within situations |
| SituationGoal | 0x598F28E7 | Objectives during situations |
| LootActions | 0xACBCD3B8 | Reward/effect bundles |
| Reward | 0x6FA49828 | Aspiration/career rewards |
| TestSetInstance | 0x3B33C8DC | Reusable test conditions |
| ObjectDefinition | 0xC0DB5AE7 | Object catalog entries |
| Lot Trait | 0xE6869219 | Environmental lot modifiers |
| Region | 0xAC16FBEC | World region definitions |
| Venue | 0xE6AFA5C4 | Lot venue type definitions |

═══════════════════════════════════════════════
SECTION 3: DBPF PACKAGE FORMAT
═══════════════════════════════════════════════

.package files use the DBPF (Database Packed File) archive format:
- **Header**: Magic number "DBPF", version info, index pointers
- **Entries**: Compressed resource data
- **Index**: Maps resources via Type ID + Group ID + Instance ID (TGI)

### INSTANCE ID GENERATION
- Use FNV-64 hash of a unique string: "CreatorName:ModName_Type_Description"
- SET THE HIGH BIT (bit 63) to avoid collision with EA content
- EA reserves IDs where high bit is NOT set
- Case-insensitive hashing (lowercase before hash)
- SimData Instance ID MUST match its companion XML tuning ID

### EXAMPLE — FNV-64 with high bit
Input: "mymod:happy_vampire_buff"
FNV-64: 0x8F3A21BC4D5E6F70 (high bit set = safe for custom content)

═══════════════════════════════════════════════
SECTION 4: SIMDATA — BINARY COMPANION FILES
═══════════════════════════════════════════════

SimData files are binary companions to tuning XML files. They are REQUIRED for:
- Any tuning with UI elements (names, descriptions, icons)
- Buffs, Traits, Careers, Aspirations, Skills
- Objects with catalog entries

### RULES
1. SimData Instance ID MUST match the XML tuning Instance ID
2. SimData Type ID is always 0x545AC67A
3. SimData is tabular (not hierarchical like XML)
4. Tools like TDESC Builder or S4S auto-generate SimData
5. Missing SimData = broken UI (no name/description in-game)

═══════════════════════════════════════════════
SECTION 5: INTERACTION SYSTEM (DEEP DIVE)
═══════════════════════════════════════════════

### INTERACTION HIERARCHY
1. **SuperInteraction** — Base autonomous/object interaction
   - Used for: object clicks, terrain actions, self-interactions
   - Class: \`interactions.base.super_interaction.SuperInteraction\`
   
2. **SocialSuperInteraction** — Social container
   - Hosts an ongoing conversation between 2+ Sims
   - Contains staging_content that lists valid MixerInteractions
   - Class: \`interactions.social.social_super_interaction.SocialSuperInteraction\`
   
3. **MixerInteraction** — Conversation topics/actions
   - Runs INSIDE a SocialSuperInteraction
   - Does NOT appear in pie menus directly
   - Class: \`interactions.base.mixer_interaction.MixerInteraction\`
   
4. **ImmediateSuperInteraction** — Runs instantly (no animation)
   - Used for: settings toggles, debug commands
   - Class: \`interactions.base.immediate_interaction.ImmediateSuperInteraction\`

### KEY INTERACTION FIELDS
- \`display_name\`: STBL hex ID for pie menu text
- \`display_name_overrides\`: Contextual name variants
- \`pie_menu_icon\`: Resource key for the pie menu icon
- \`pie_menu_priority\`: Sort order in the pie menu
- \`_super_affordances\`: Child interactions available from this one
- \`outcome\`: Success/failure results (loot, buffs, animations)
- \`basic_extras\`: Loot applied at the start of the interaction
- \`loot_on_completion\`: Loot applied when the interaction finishes
- \`test_globals\`: TestSetInstance IDs that gate availability
- \`cheat\`: Boolean — if true, only available with cheats enabled
- \`allow_autonomous\`: Boolean — if true, Sims choose this on their own
- \`category\`: Pie menu category (e.g., "social", "mean", "romantic")

### FULL INTERACTION TEMPLATE
\`\`\`xml
<I c="SuperInteraction" i="interaction" m="interactions.base.super_interaction" n="MyMod:DoSomethingCool" s="14237856901234567">
  <T n="display_name">0xABC12345</T>
  <T n="display_tooltip">0xDEF67890</T>
  <E n="category">social</E>
  <T n="pie_menu_priority">5</T>
  <T n="allow_autonomous">True</T>
  
  <!-- Conditions: only show if Sim has Creative trait -->
  <L n="test_globals">
    <T>98765432101234567</T>
  </L>
  
  <!-- Loot on completion -->
  <L n="loot_on_completion">
    <T>11122233344455566</T>
  </L>
  
  <!-- Outcome -->
  <U n="outcome">
    <L n="actions">
      <V t="loot_actions">
        <U n="loot_actions">
          <T n="loot_actions">55566677788899900</T>
        </U>
      </V>
    </L>
  </U>
</I>
\`\`\`

═══════════════════════════════════════════════
SECTION 6: BUFF & MOOD SYSTEM
═══════════════════════════════════════════════

Buffs are temporary states applied to Sims that modify mood and behavior.

### MOOD TYPES (ENUM)
HAPPY, SAD, ANGRY, TENSE, EMBARRASSED, BORED, UNCOMFORTABLE, PLAYFUL, FLIRTY, INSPIRED, FOCUSED, CONFIDENT, ENERGIZED, DAZED, FINE

### BUFF TEMPLATE
\`\`\`xml
<I c="Buff" i="buff" m="buffs.buff" n="MyMod:HappyBuff" s="14237856901234567">
  <T n="buff_name">0xABC12345</T>
  <T n="buff_description">0xDEF67890</T>
  <E n="mood_type">MOOD_HAPPY</E>
  <T n="mood_weight">2</T>
  <T n="max_duration">240</T>
  <T n="timeout_string">0x11223344</T>
  <V n="visible" t="enabled">
    <T n="enabled">True</T>
  </V>
  <L n="game_effect_modifier">
    <!-- Skill gain multiplier, relationship boost, etc. -->
  </L>
</I>
\`\`\`

### WEIGHT SYSTEM
- mood_weight 1 = minor influence
- mood_weight 2 = moderate influence
- mood_weight 3+ = strong influence (overrides lower weights)
- Highest total weight across all active buffs determines visible mood

═══════════════════════════════════════════════
SECTION 7: TRAIT SYSTEM
═══════════════════════════════════════════════

### TRAIT TYPES (ENUM)
PERSONALITY, LIFESTYLE, GAMEPLAY, HIDDEN, GHOST, OCCULT, ASPIRATION_REWARD

### KEY TRAIT FIELDS
- \`trait_type\`: The category enum
- \`display_name\` / \`trait_description\`: STBL references
- \`ages\`: Which age groups can have this trait (CHILD, TEEN, YOUNGADULT, ADULT, ELDER)
- \`genders\`: Which genders can have this trait
- \`conflicting_traits\`: List of trait IDs that cannot coexist
- \`buffs\`: List of buffs permanently added when trait is active
- \`buff_replacements\`: Override certain base-game buffs (e.g., replace "Sad" with "Melancholy")
- \`skill_modifier_curves\`: Multiply skill gain rates
- \`interactions\`: Interactions added/removed by this trait

═══════════════════════════════════════════════
SECTION 8: CAREER SYSTEM (DEEP DIVE)
═══════════════════════════════════════════════

Careers are built from interconnected tuning files:

### FILE HIERARCHY
1. **Career** → References CareerTrack(s)
2. **CareerTrack** → References CareerLevel(s), handles branching
3. **CareerLevel** → Defines salary, schedule, tasks, promotion

### CAREER LEVEL FIELDS
- \`work_schedule\`: Days and hours (DayOfWeek enum + time range)
- \`simoleon_per_hour\`: Hourly pay rate
- \`performance_metrics\`: What affects daily performance
- \`promotion_buff\`: Buff applied on promotion
- \`demotion_buff\`: Buff applied on demotion
- \`promotion_reward_items\`: Objects/money/traits granted on promotion
- \`ideal_mood\`: Mood that boosts work performance
- \`career_outfit\`: CAS outfit preset

### BRANCHING CAREERS
At a specific CareerLevel, you can split into multiple CareerTracks:
\`\`\`
Career → Track A → Level 1, 2, 3
                  → Level 4 (BRANCH POINT)
                      → Track B1 → Level 5B1, 6B1
                      → Track B2 → Level 5B2, 6B2
\`\`\`

═══════════════════════════════════════════════
SECTION 9: TEST CONDITIONS & TEST SETS
═══════════════════════════════════════════════

Tests are the conditional logic system that gates interactions, loot, and buffs.

### COMMON TEST TYPES
| Test Class | Purpose | Key Fields |
|------------|---------|------------|
| TraitTest | Check if Sim has/lacks a trait | \`trait\`, \`negate\` |
| BuffTest | Check if buff is active | \`buff_type\`, \`negate\` |
| SimInfoTest | Check age, gender, species, occult | \`ages\`, \`genders\`, \`species\` |
| StatThresholdTest | Check commodity/skill level | \`stat\`, \`threshold\`, \`comparison\` |
| RelationshipTest | Check relationship type between Sims | \`relationship_type\`, \`min_value\` |
| MoodTest | Check current mood | \`mood_type\`, \`negate\` |
| ObjectCriteriaTest | Check object properties | \`object_tags\`, \`definition_id\` |
| TimeOfDayTest | Check game time | \`begin_time\`, \`end_time\` |
| WeatherTest | Check weather condition | \`weather_type\` (requires Seasons) |
| CareerTest | Check career level/track | \`career\`, \`min_level\` |
| SkillTest | Check skill level | \`skill\`, \`min_level\` |
| LocationTest | Check lot type or region | \`lot_type\`, \`region\` |
| SituationTest | Check if in a situation | \`situation\`, \`negate\` |

### AND/OR LOGIC IN TEST SETS
- Multiple tests in ONE \`<L>\` block = AND (all must pass)
- Multiple \`<L>\` blocks in a TestSetInstance = OR (any block can pass)
- \`negate="True"\` inverts individual test results

### REUSABLE TEST SET
\`\`\`xml
<I c="TunableTestSet" i="snippet" m="event_testing.tests" n="MyMod:IsVampireAtNight" s="99887766554433">
  <L n="test">
    <!-- AND: both must pass -->
    <U>
      <V t="sim_info" n="test_type">
        <U n="sim_info">
          <E n="species">HUMAN</E>
          <L n="occult_types"><E>VAMPIRE</E></L>
        </U>
      </V>
    </U>
    <U>
      <V t="time_range" n="test_type">
        <U n="time_range">
          <T n="begin_time">20</T>
          <T n="end_time">6</T>
        </U>
      </V>
    </U>
  </L>
</I>
\`\`\`

═══════════════════════════════════════════════
SECTION 10: LOOT ACTIONS & REWARD CHAINS
═══════════════════════════════════════════════

Loot actions are modular effect bundles triggered by interactions, events, or buffs.

### COMMON LOOT OPERATION TYPES
- \`buff\` — Add/remove a buff
- \`statistics\` — Modify needs, skills, or hidden stats
- \`trait\` — Add/remove a trait
- \`money\` — Give/take Simoleons
- \`notification\` — Show in-game notification
- \`career\` — Promote/demote, change performance
- \`relationship\` — Modify relationship score
- \`spawn_object\` — Place an object in the world
- \`state_change\` — Change object state

### LOOT TEMPLATE
\`\`\`xml
<I c="LootActions" i="loot" m="loot.loot_actions" n="MyMod:GiveVampireBuff" s="14237856901234567">
  <L n="actions">
    <!-- Add a buff -->
    <V t="buff">
      <U n="buff">
        <V n="buff_type" t="enabled">
          <T n="enabled">98765432109876543</T>
        </V>
      </U>
    </V>
    <!-- Modify energy statistic -->
    <V t="statistics">
      <L n="statistics">
        <U>
          <T n="stat">16508</T>
          <V n="operator" t="add" />
          <T n="value">50</T>
        </U>
      </L>
    </V>
    <!-- Show notification -->
    <V t="notification">
      <U n="notification">
        <T n="text">0xABC12345</T>
      </U>
    </V>
  </L>
</I>
\`\`\`

═══════════════════════════════════════════════
SECTION 11: SITUATIONS & EVENTS
═══════════════════════════════════════════════

### SITUATION COMPONENTS
1. **Situation** — Manages lifecycle (start, running, end), roles, and goals
2. **SituationJob** — Defines participant roles (Host, Guest, Entertainer)
3. **SituationGoal** — Objectives during the situation (talk to 3 Sims, etc.)
4. **ZoneDirector** — Manages what situations can run on a lot/venue type

### SITUATION STATES
- \`_states\` list defines the FSM (finite state machine) for a situation
- Each state can trigger different behaviors, spawn NPC, apply buffs

═══════════════════════════════════════════════
SECTION 12: STBL STRING TABLES
═══════════════════════════════════════════════

All user-facing text in The Sims 4 uses STBL (String Table) resources.
- Type ID: 0x220557DA
- Keys are 32-bit FNV-32 hashes (e.g., 0xABC12345)
- One STBL file per language (English = 0x00, French = 0x01, etc.)
- STBL entries map hash → display string
- Multiple language STBLs share the same Instance ID but different Group IDs

### LANGUAGE CODES
| Code | Language | Code | Language |
|------|----------|------|----------|
| 0x00 | English | 0x01 | Chinese (Trad) |
| 0x02 | Czech | 0x03 | Danish |
| 0x04 | Dutch | 0x05 | Finnish |
| 0x06 | French | 0x07 | German |
| 0x08 | Italian | 0x09 | Japanese |
| 0x0A | Korean | 0x0B | Norwegian |
| 0x0C | Polish | 0x0D | Portuguese (BR) |
| 0x0E | Russian | 0x0F | Spanish |
| 0x10 | Swedish | 0x11 | Chinese (Simp) |

═══════════════════════════════════════════════
SECTION 13: PYTHON SCRIPT MODDING
═══════════════════════════════════════════════

Script mods use Python to inject custom logic beyond what XML tuning can express.

### PACKAGING
- Python files (.py) are compiled and packaged into .ts4script (a ZIP renamed)
- The game loads .ts4script from the Mods folder on startup
- Game uses Python 3.7 (check current version as EA may update)

### INJECTION PATTERNS

#### 1. Decorator Injection (Recommended)
\`\`\`python
import services
import sims4.commands

@sims4.commands.Command('mymod.hello', command_type=sims4.commands.CommandType.Live)
def my_command(_connection=None):
    output = sims4.commands.CheatOutput(_connection)
    output('Hello from my mod!')
\`\`\`

#### 2. Monkey Patching (Advanced)
\`\`\`python
from interactions.base.super_interaction import SuperInteraction

original_run = SuperInteraction._run_interaction_gen

def custom_run(self, timeline):
    # Custom logic before the original
    print(f"Interaction started: {self.__class__.__name__}")
    yield from original_run(self, timeline)
    # Custom logic after the original

SuperInteraction._run_interaction_gen = custom_run
\`\`\`

#### 3. S4CL (Sims 4 Community Library) Pattern
\`\`\`python
from sims4communitylib.events.event_handling.common_event_registry import CommonEventRegistry
from sims4communitylib.events.sim.events.sim_spawned import S4CLSimSpawnedEvent

class MyModEventHandler:
    @staticmethod
    @CommonEventRegistry.handle_events('my_mod')
    def on_sim_spawned(event_data: S4CLSimSpawnedEvent):
        sim_info = event_data.sim_info
        # Custom logic when any Sim spawns
\`\`\`

### COMMON GAME MODULES
- \`services\` — Access managers (sim_info_manager, object_manager, etc.)
- \`sims4.commands\` — Register cheat console commands
- \`interactions\` — Interaction classes
- \`buffs\` — Buff management
- \`traits\` — Trait management
- \`statistics\` — Commodity/skill statistics
- \`relationships\` — Relationship management
- \`objects\` — Game object system
- \`careers\` — Career system

═══════════════════════════════════════════════
SECTION 14: CAS CUSTOM CONTENT
═══════════════════════════════════════════════

### WORKFLOW
1. Clone existing CAS item in S4S → Export reference mesh
2. Model in Blender → Ensure proper bone rigging
3. Weight paint from EA reference mesh
4. Create UV_0 (texture) and UV_1 (body morph)
5. Create LOD levels (LOD0=high, LOD1=medium, LOD2=low, LOD3=minimum)
6. Create texture maps (Diffuse, Specular, Normal)
7. Import back into S4S → Package

### LOD REQUIREMENTS
| LOD Level | Distance | Polygon Count (Guideline) |
|-----------|----------|--------------------------|
| LOD0 | Close-up | 2000-8000 |
| LOD1 | Medium | 1000-4000 |
| LOD2 | Far | 500-1500 |
| LOD3 | Very far | 200-500 |

### KEY CONCEPTS
- **UV_1**: Second UV channel for body shape morphing (thin/fit/fat)
- **Weight Painting**: Vertex weights determine how mesh deforms with skeleton
- **Cut Numbers**: Define which body regions the item covers (for layering)
- **Bone Assignments**: Must match EA skeleton (grannyRig)

═══════════════════════════════════════════════
SECTION 15: OBJECT TUNING & FUNCTIONAL OBJECTS
═══════════════════════════════════════════════

### OBJECT DEFINITION STRUCTURE
- ObjectDefinition tuning (Type 0xC0DB5AE7) defines catalog metadata
- Object SuperInteractions are linked via \`_super_affordances\` list
- Object states define visual/behavioral transitions
- Slots define where Sims sit, stand, or place items

### COMMON OBJECT FIELDS
- \`_super_affordances\`: List of interaction TuningIDs available on this object
- \`_rig\`: Rig file for animations
- \`footprint\`: Physical space the object occupies
- \`components\`: Inventory, craftable, state, lighting, etc.
- \`environment_score\`: How the object affects room score

═══════════════════════════════════════════════
SECTION 16: MOD DEBUGGING & COMPATIBILITY
═══════════════════════════════════════════════

### COMMON ERROR PATTERNS IN lastException.txt
1. **AttributeError**: Method changed/removed in game update → Update monkey patch
2. **KeyError on TuningInstance**: Missing SimData or wrong Instance ID
3. **TypeError in _run_interaction_gen**: Interaction signature changed
4. **ImportError**: Module path changed in EA codebase update
5. **NoneType has no attribute**: Sim/object was removed during execution

### CONFLICT TYPES
- **Override Conflict**: Two mods replace the same tuning file → last loaded wins
- **ID Collision**: Two mods use the same Instance ID → unpredictable behavior
- **Injection Conflict**: Two script mods patch the same method → execution order matters

### DEBUGGING TOOLS
- **Better Exceptions**: Real-time error tracking, conflict detection
- **localthumbcache.package**: DELETE after mod changes to reset cache
- **50/50 Method**: Binary search to isolate broken mods
- **S4S Warehouse**: Inspect .package contents for ID conflicts

### BEST PRACTICES
- Use XML Injector instead of overrides when possible
- Always set high bit on custom Instance IDs
- Include creator prefix in tuning names (MyMod:BuffName)
- Test after every EA game patch
- Provide all LOD levels for CAS content
- Always pair tuning XML with SimData when required

═══════════════════════════════════════════════
SECTION 17: OUTPUT FORMATTING RULES
═══════════════════════════════════════════════

- Wrap JPE code in \`\`\`jpe code blocks
- Wrap tuning XML in \`\`\`xml code blocks
- Wrap Python scripts in \`\`\`python code blocks
- Use descriptive snake_case IDs: buff_energy_surge, trait_night_owl
- ALWAYS include LOCALIZATION blocks for user-facing text in JPE
- ALWAYS include display_name STBL references in XML
- When suggesting fixes, provide COMPLETE corrected content
- Be concise — no conversational fluff inside code blocks
- When explaining errors, provide: Root Cause → Logic Path → Fix Strategy
`.trim()

// ═══════════════════════════════════════════════════════════════════════════════
// OLLAMA SERVICE IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════════

export class OllamaService extends BaseAIService {
  private static instance: OllamaService | null = null
  private model = 'llama3'
  private ollamaBaseUrl = 'http://localhost:11434'

  private constructor() {
    super({ max: 100, ttl: 24 * 60 * 60 * 1000 })
  }

  static getInstance(): OllamaService {
    if (!OllamaService.instance) {
      OllamaService.instance = new OllamaService()
    }
    return OllamaService.instance
  }

  /**
   * Synchronize configuration with the native bridge.
   * Detects if using system-wide (11434) or sandboxed (11435) engine.
   */
  async syncConfig() {
    if (this.isElectron) {
      try {
        const info = await window.electron.ai.getOllamaInfo()
        if (info.isRunning) {
          this.ollamaBaseUrl = info.url
          console.log(`[OllamaService] Connected to ${info.provider} engine at ${info.url}`)
        }
      } catch (_err) {
        console.warn('[OllamaService] Failed to fetch native Ollama info, using defaults.')
      }
    }
  }

  async initialize(): Promise<void> {
    await this.syncConfig()
    this.initialized = true
  }

  protected async ensureInitialized(): Promise<void> {
    if (!this.initialized) await this.initialize()
  }

  /**
   * Configure the Ollama endpoint and model.
   * Called from Settings when user changes the Ollama configuration.
   */
  setConfig(baseUrl: string, model?: string) {
    if (baseUrl) this.ollamaBaseUrl = baseUrl.replace(/\/+$/, '')
    if (model) this.model = model
  }

  getConfig() {
    return { baseUrl: this.ollamaBaseUrl, model: this.model }
  }

  /**
   * Check if Ollama is reachable and list available models
   */
  async healthCheck(): Promise<{ available: boolean; models: string[] }> {
    try {
      const res = await axios.get(`${this.ollamaBaseUrl}/api/tags`, { timeout: 3000 })
      const models = (res.data?.models || []).map((m: any) => m.name)
      return { available: true, models }
    } catch {
      return { available: false, models: [] }
    }
  }

  // ─── Core Chat (with Sims 4 modding system prompt) ──────────────────────────

  async chat(messages: AIMessage[]): Promise<AIResult> {
    await this.ensureInitialized()

    // Prepend the deep Sims 4 modding system prompt
    const fullMessages = [
      { role: 'system' as const, content: SIMS4_SYSTEM_PROMPT },
      ...messages
    ]

    // Check cache
    const cacheKey = JSON.stringify(messages)
    const cachedResult = this.cache.get(cacheKey)
    if (cachedResult) {
      this.usageStats.cacheHits++
      return { success: true, text: cachedResult, cached: true, timestamp: Date.now() }
    }

    this.usageStats.cacheMisses++

    try {
      const apiUrl = `${this.ollamaBaseUrl}/api/chat`

      let response: any
      if (this.isElectron) {
        response = await this.callNativeBridge<any>('ollama', 'post', apiUrl, {
          model: this.model,
          messages: fullMessages.map(m => ({ role: m.role, content: m.content })),
          stream: false,
          options: {
            temperature: 0.3, // Lower temperature for precise modding output
            num_predict: 4096,
            top_p: 0.9,
          }
        })
      } else {
        response = await this.performRequest<any>('chat', () => axios.post(
          apiUrl,
          {
            model: this.model,
            messages: fullMessages.map(m => ({ role: m.role, content: m.content })),
            stream: false,
            options: {
              temperature: 0.3,
              num_predict: 4096,
              top_p: 0.9,
            }
          },
          { timeout: 120000 }
        ), messages.map(m => m.content).join(' '), true)
      }

      const data = response.data
      const text = data?.message?.content

      if (!text) {
        throw new Error(data?.error || 'Empty response from Ollama')
      }

      // Track token usage from Ollama response metadata
      if (data.eval_count) {
        this.usageStats.totalTokensUsed += (data.prompt_eval_count || 0) + data.eval_count
      }

      this.cache.set(cacheKey, text)
      return { success: true, text, cached: false, timestamp: Date.now() }
    } catch (error: any) {
      return { success: false, error: this.formatOllamaError(error), cached: false, timestamp: Date.now() }
    }
  }

  // ─── Sims 4 Mod Explanation (Structured) ────────────────────────────────────

  async explainMod(fileContent: string, fileName: string): Promise<AIResult> {
    await this.ensureInitialized()

    const cacheKey = AICache.generateKey(fileContent, fileName)
    const cachedResult = this.cache.get(cacheKey)
    if (cachedResult) {
      this.usageStats.cacheHits++
      return { success: true, explanation: this.parseExplanation(cachedResult), cached: true, timestamp: Date.now() }
    }

    const fileType = this.detectFileType(fileName)
    
    const prompt = `Analyze this ${fileType} Sims 4 mod file and provide a structured explanation.

File: ${fileName}
Content:
${this.truncateContent(fileContent)}

Provide your analysis in this EXACT format (use these exact section headers):

**Overview**: What this mod does in plain English. Mention the specific game systems it touches (buffs, traits, interactions, etc.).
**Purpose**: The gameplay goal — what experience does this create for the player?
**Key Fields**: List each important tunable/field and explain its role in the mod's behavior.
**Effects**: List each in-game behavioral change the player will notice.
**Root Cause**: If there are any errors or issues in the file, explain what's wrong and why.
**Logic Path**: Trace the execution flow — what triggers what, in what order.
**Fix Strategy**: If there are issues, provide step-by-step resolution instructions.`

    const result = await this.chat([{ role: 'user', content: prompt }])

    if (result.success && result.text) {
      this.cache.set(cacheKey, result.text)
      return { ...result, explanation: this.parseExplanation(result.text) }
    }
    return result
  }

  // ─── Sims 4 Fix Suggestion ──────────────────────────────────────────────────

  async suggestFix(
    fileContent: string,
    fileName: string,
    errorMessage: string,
    errorContext: string
  ): Promise<AIResult> {
    await this.ensureInitialized()

    const fileType = this.detectFileType(fileName)

    const prompt = `Fix the following error in a ${fileType} Sims 4 mod file.

File: ${fileName}
Error: ${errorMessage}
Context around the error:
${errorContext}

Full file content:
${fileContent}

IMPORTANT RULES:
- If this is XML tuning, ensure all Instance IDs use the high bit (bit 63 set)
- If this is JPE, ensure all keywords are UPPERCASE
- If there are missing SimData references, mention that
- If there are STBL keys referenced that don't exist, flag them
- Check for common issues: unclosed tags, wrong class names, missing required fields

Return ONLY a JSON object with these exact keys:
{
  "fixedCode": "the complete corrected file content",
  "explanation": "what you fixed and why, referencing specific Sims 4 modding concepts"
}`

    const result = await this.chat([{ role: 'user', content: prompt }])

    if (result.success && result.text) {
      try {
        const jsonMatch = result.text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          return {
            success: true,
            fixedCode: parsed.fixedCode || '',
            explanation: { overview: parsed.explanation || '', purpose: '', keyFields: [], effects: [], notes: [] },
            cached: false,
            timestamp: Date.now()
          }
        }
      } catch (_e) {
        console.warn('[Ollama] JSON parse failed for fix, returning raw text')
      }
      return { ...result, explanation: this.parseExplanation(result.text) }
    }
    return result
  }

  // ─── Project Conflict Analysis ──────────────────────────────────────────────

  async analyzeProjectConflicts(map: any): Promise<AIResult> {
    await this.ensureInitialized()

    const prompt = `Analyze this Sims 4 mod project structure for every type of conflict.

CHECK FOR THESE SPECIFIC CONFLICT TYPES:
1. **Override Conflicts**: Two files that replace the same EA tuning Instance ID
2. **ID Collisions**: Two custom files using the same Instance ID (s attribute)
3. **Dangling References**: A loot_list, buff, or interaction referencing a non-existent Instance ID
4. **Missing SimData**: XML tuning that requires SimData but has no companion file
5. **STBL Orphans**: STBL keys referenced in tuning but missing from the string table
6. **Test Gaps**: Interactions missing test_globals that should gate visibility
7. **Loot Chain Breaks**: Loot actions referencing buffs/stats that don't exist in the project

Project Map:
${JSON.stringify(map, null, 2)}

Return ONLY a JSON object:
{
  "diagnostics": [
    {
      "fileId": "filename",
      "line": 1,
      "column": 1,
      "severity": "error|warning|info",
      "message": "description of the conflict",
      "code": "OVERRIDE_CONFLICT|ID_COLLISION|DANGLING_REF|MISSING_SIMDATA|STBL_ORPHAN|TEST_GAP|LOOT_BREAK"
    }
  ]
}`

    const result = await this.chat([{ role: 'user', content: prompt }])

    if (result.success && result.text) {
      try {
        const jsonMatch = result.text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          return { success: true, diagnostics: parsed.diagnostics || [], cached: false, timestamp: Date.now() }
        }
      } catch (_e) { /* fall through */ }
    }
    return { success: false, error: result.error || 'Conflict analysis failed', cached: false, timestamp: Date.now() }
  }

  // ─── Sims 4 Exception Analysis (lastException.txt) ─────────────────────────

  async analyzeException(logContent: string): Promise<AIResult> {
    await this.ensureInitialized()

    const prompt = `Analyze this Sims 4 lastException.txt log for a modder who needs to fix their mod.

COMMON PATTERNS TO CHECK:
- AttributeError → EA changed/removed a method in a game update
- KeyError on TuningInstance → Missing SimData or wrong Instance ID
- TypeError in _run_interaction_gen → Interaction signature changed
- ImportError → Module path changed in EA codebase
- NoneType has no attribute → Sim/object destroyed during execution
- FileNotFoundError in resource loading → Missing .package resource

Exception Log:
${this.truncateContent(logContent, 4000)}

Return ONLY a JSON object:
{
  "report": {
    "explanation": "Plain English explanation a beginner modder would understand",
    "rootCause": "The specific technical root cause with Python class/method names",
    "logicPath": "The chain of events that led to this error",
    "suggestedJpeFix": "How to fix this — either in JPE, tuning XML, or Python script",
    "affectedSystems": ["list", "of", "game", "systems", "involved"],
    "severity": "critical|major|minor|cosmetic"
  }
}`

    const result = await this.chat([{ role: 'user', content: prompt }])

    if (result.success && result.text) {
      try {
        const jsonMatch = result.text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          return { success: true, report: parsed.report || parsed, cached: false, timestamp: Date.now() }
        }
      } catch (_e) { /* fall through */ }
    }
    return { success: false, error: result.error || 'Exception analysis failed', cached: false, timestamp: Date.now() }
  }

  // ─── Diagnostic Explanation (Better Exceptions Integration) ─────────────────

  async explainDiagnostic(fileContent: string, fileName: string, diagnostic: Diagnostic): Promise<AIResult> {
    await this.ensureInitialized()
    const context = this.extractContext(fileContent, diagnostic.line - 1)
    const fileType = this.detectFileType(fileName)

    const prompt = `Explain this ${fileType} error in the context of Sims 4 modding.

File: ${fileName}
Error Line: ${diagnostic.line}
Error: ${diagnostic.message}
Severity: ${diagnostic.severity || 'error'}

Code Context:
${context}

Provide your analysis as:
**Overview**: What went wrong in plain English
**Root Cause**: The specific technical issue
**Logic Path**: How this error connects to Sims 4 game systems
**Fix Strategy**: Step-by-step instructions to resolve this`

    return this.chat([{ role: 'user', content: prompt }])
  }

  // ─── Diagnostic Fix ────────────────────────────────────────────────────────

  async fixDiagnostic(fileContent: string, fileName: string, diagnostic: Diagnostic, context: string): Promise<AIResult> {
    return this.suggestFix(fileContent, fileName, diagnostic.message, context)
  }

  // ─── Predictive Completion (Context-Aware) ──────────────────────────────────

  async getPredictiveCompletion(
    content: string,
    fileName: string,
    cursorOffset: number,
    projectContext?: string
  ): Promise<AIResult> {
    await this.ensureInitialized()
    const beforeCursor = content.slice(0, cursorOffset)
    const afterCursor = content.slice(cursorOffset)
    const fileType = this.detectFileType(fileName)

    const prompt = `Complete the ${fileType} Sims 4 mod code at the cursor position (|).

RULES:
- If in a .jpe file: use JPE syntax (WHEN, DO, ONLY_IF, LOCALIZATION)
- If in a .xml file: use proper Sims 4 tuning XML with correct tags (<I>, <T>, <E>, <U>, <L>, <V>)
- If in a .py file: use Sims 4 Python API patterns
- Return ONLY the predicted completion text — no explanations, no markdown
- Keep it to 1-3 lines maximum
- Use correct Instance ID format (decimal, high bit set)
- Use correct STBL format (0x hex prefix)

File: ${fileName}
File Type: ${fileType}
Project Context: ${projectContext || 'General Sims 4 mod'}

Code:
---
${beforeCursor.slice(-500)}|${afterCursor.slice(0, 100)}
---

Return ONLY the predicted characters:`

    return this.chat([{ role: 'user', content: prompt }])
  }

  // ─── Mod Generation from Natural Language ───────────────────────────────────

  async generateMod(description: string, complexity: 'basic' | 'intermediate' | 'advanced' | 'expert' = 'basic'): Promise<AIResult> {
    await this.ensureInitialized()

    const complexityGuide: Record<string, string> = {
      basic: 'Single-file mod with one buff or trait. 1-2 WHEN/DO blocks. Simple LOCALIZATION.',
      intermediate: 'Multi-component mod with conditions (ONLY_IF), loot chains, and STBL references. May include 2-3 interconnected files.',
      advanced: 'Full career track OR aspiration tree OR custom object with interactions. Requires SimData, multiple STBL entries, test sets.',
      expert: 'System-level mod with Python script injection, custom test classes, multiple XML overrides, XML Injector integration, and full localization.'
    }

    const prompt = `Create a Sims 4 mod based on this description:

"${description}"

COMPLEXITY LEVEL: ${complexity.toUpperCase()}
${complexityGuide[complexity]}

Generate the following:
1. All necessary JPE code blocks (wrapped in \`\`\`jpe)
2. If the complexity requires it, also provide:
   - Companion tuning XML (wrapped in \`\`\`xml)
   - Python scripts (wrapped in \`\`\`python)
3. A LOCALIZATION block with ALL user-facing strings
4. A manifest comment listing all required files and their Instance IDs
5. Notes on any SimData requirements

Use descriptive snake_case IDs with a "Generated:" namespace prefix.`

    return this.chat([{ role: 'user', content: prompt }])
  }

  // ─── Utilities ──────────────────────────────────────────────────────────────

  private truncateContent(content: string, maxChars = 6000): string {
    if (content.length <= maxChars) return content
    const half = Math.floor(maxChars / 2) - 50
    return `${content.substring(0, half)}\n\n... [TRUNCATED ${content.length - maxChars} CHARACTERS] ...\n\n${content.substring(content.length - half)}`
  }

  private detectFileType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase() || ''
    if (ext === 'jpe') return 'JPE (Just Plain English)'
    if (ext === 'xml') return 'Tuning XML'
    if (ext === 'py') return 'Python Script'
    if (ext === 'stbl' || fileName.includes('StringTable')) return 'STBL String Table'
    if (ext === 'package') return 'DBPF Package'
    return 'Sims 4 Mod'
  }

  private formatOllamaError(error: any): string {
    const msg = error.message || ''
    if (msg.includes('ECONNREFUSED') || msg.includes('ENOTFOUND')) {
      return `Ollama is not running. Start it with:\n  ollama serve\nThen pull a model:\n  ollama pull ${this.model}`
    }
    if (msg.includes('model') && msg.includes('not found')) {
      return `Model "${this.model}" not found. Pull it with:\n  ollama pull ${this.model}\n\nRecommended models for Sims 4 modding:\n  - llama3 (best general quality)\n  - codellama:13b (best for code generation)\n  - deepseek-coder:6.7b (fast + good at code)\n  - mistral:7b (balanced speed/quality)`
    }
    if (msg.includes('timeout') || msg.includes('ETIMEDOUT')) {
      return `Ollama is taking too long to respond. This usually means:\n  - The model is loading for the first time (wait ~30s)\n  - Your system doesn't have enough RAM/VRAM\n  - Try a smaller model: ollama pull mistral:7b`
    }
    return error.message
  }
}

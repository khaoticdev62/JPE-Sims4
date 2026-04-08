# JPE Studio Editor - Visual Interface Mockup

## Main Window Layout

```text
╔══════════════════════════════════════════════════════════════════════════════╗
║ JPE Studio Editor - [example.jpe]                                 [_][□][×] ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ [☰] File  Edit  View  Tools  Help                              │⚙││🔍││□□│ ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ ┌─────────────────┐ ┌──────────────────────────────────────────────────────┐ ║
║ │  📁 PROJECT    │ │                    📝 EDITOR                         │ ║
║ │                 │ │                                                      │ ║
║ │ 📁 interactions │ │  interaction "Friendly Ask About Day":             │ ║
║ │    ├── greet.jpe│ │    id: 123456789012345678                        │ ║
║ │    └── talk.jpe │ │    target: Sim                                   │ ║
║ │ 📁 buffs       │ │    pie_menu: Friendly                            │ ║
║ │    └── happy.jpe│ │                                                  │ ║
║ │ 📁 traits      │ │    available_when:                               │ ║
║ │    └── friendly│ │      - actor is teen_or_older                    │ ║
║ │                 │ │      - target is not sleeping                    │ ║
║ │ 🧩 MOD ELEMENTS│ │                                                  │ ║
║ │   🎭 Interact(3)│ │    on_success:                                   │ ║
║ │   💫 Buffs(2)   │ │      - apply buff "Happy +1" to target for 2h    │ ║
║ │   🧬 Traits(1)  │ │                                                  │ ║
║ │                 │ │  # This is a comment explaining the interaction │ ║
║ │ 🛠️ TOOLS       │ │  # More JPE code would continue here...          │ ║
║ │   • Search      │ │                                                      │ ║
║ │   • Settings    │ │                                                      │ ║
║ │   • Stats       │ │                                                      │ ║
║ │   • Docs        │ │                                                      │ ║
║ └─────────────────┘ └──────────────────────────────────────────────────────┘ ║
║ ┌──────────────────────────────────────────────────────────────────────────┐ ║
║ │                    🔄 XML PREVIEW (LIVE)                               │ ║
║ │                                                                          │ ║
║ │  <interaction id="123456789012345678" name="Friendly Ask About Day">   │ ║
║ │    <target_type>Sim</target_type>                                       │ ║
║ │    <pie_menu_category>Friendly</pie_menu_category>                       │ ║
║ │    <tests>                                                              │ ║
║ │      <test type="age">teen_or_older</test>                             │ ║
║ │      <test type="sleeping">false</test>                                │ ║
║ │    </tests>                                                             │ ║
║ │    <loot_actions>                                                       │ ║
║ │      <loot type="apply_buff" buff="Happy +1" target="target"           │ ║
║ │           duration="2h"/>                                               │ ║
║ │    </loot_actions>                                                      │ ║
║ │  </interaction>                                                         │ ║
║ │                                                                          │ ║
║ │  ┌────────────────────────────────────────────────────────────────────┐ │ ║
║ │  │ ✓ Valid JPE | Transformed: 0.2s | Ln:12 Col:15 | UTF-8 | LF     │ │ ║
║ │  └────────────────────────────────────────────────────────────────────┘ │ ║
║ └──────────────────────────────────────────────────────────────────────────┘ ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

## Component Details

### 1. Title Bar

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ JPE Studio Editor - [example.jpe]                                   [ _ □ ×] │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2. Menu Bar

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ [☰] File  Edit  View  Tools  Help                            │□□□│□□□│⚙️│ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3. Sidebar - Project Explorer

```text
┌─────────────────┐
│  📁 PROJECT    │
│                 │
│ 📁 interactions │
│    ├── greet.jpe│
│    └── talk.jpe │
│ 📁 buffs       │
│    └── happy.jpe│
│ 📁 traits      │
│    └── friendly│
│                 │
│ 🧩 MOD ELEMENTS│
│   🎭 Interact(3)│
│   💫 Buffs(2)   │
│   🧬 Traits(1)  │
│                 │
│ 🛠️ TOOLS       │
│   • Search      │
│   • Settings    │
│   • Stats       │
│   • Docs        │
└─────────────────┘
```

### 4. Main Editor Area

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ interaction "Friendly Ask About Day":                                       │
│   id: 123456789012345678                                                  │
│   target: Sim                                                               │
│   pie_menu: Friendly                                                        │
│                                                                             │
│   available_when:                                                           │
│     - actor is teen_or_older                                                │
│     - target is not sleeping                                                │
│                                                                             │
│   on_success:                                                               │
│     - apply buff "Happy +1" to target for 2h                                │
│                                                                             │
│ # This is a comment explaining the interaction                              │
│ # More JPE code would continue here...                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5. Preview Panel

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                    🔄 XML PREVIEW (LIVE)                                  │
|-----------------------------------------------------------------------------|
│ <interaction id="123456789012345678" name="Friendly Ask About Day">       │
│   <target_type>Sim</target_type>                                           │
│   <pie_menu_category>Friendly</pie_menu_category>                           │
│   <tests>                                                                  │
│     <test type="age">teen_or_older</test>                                 │
│     <test type="sleeping">false</test>                                    │
│   </tests>                                                                 │
│   <loot_actions>                                                           │
│     <loot type="apply_buff" buff="Happy +1" target="target"               │
│          duration="2h"/>                                                   │
│   </loot_actions>                                                          │
│ </interaction>                                                             │
|-----------------------------------------------------------------------------|
│ ✓ Valid JPE | Transformed: 0.2s | Ln:12 Col:15 | UTF-8 | LF              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Interactive Elements

### Hover States

- File explorer items show quick action buttons (rename, delete, duplicate)
- Code elements show documentation tooltips on hover
- Preview elements highlight corresponding source lines when hovered

### Context Menus

- Right-click in editor: "Go to Definition", "Find Usages", "Refactor", "Comment"
- Right-click in file explorer: "New File", "Rename", "Delete", "Open in Terminal"
- Right-click in preview: "Copy XML", "Export to File", "View in Browser"

### Status Indicators

- File status: Saved (no indicator), Modified (*)
- Validation: ✓ Valid, ⚠ Warning, ❌ Error
- Transformation speed: Real-time feedback
- Position: Line and column numbers

## Spectral Experience Modes

Beyond the baseline IDE layout, the "Living Brand" employs three specialized immersion modes to match user context.

### 3. Zen Mode (Maximum Immersion)

*Goal: Remove all non-essential UI to focus purely on the "Just Plain English" logic.*

```text
╔══════════════════════════════════════════════════════════════════════════════╗
║ [←] example.jpe                                                     [_][□][×] ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║                                                                              ║
║                  interaction "Friendly Ask About Day":                       ║
║                    id: 123456789012345678                                    ║
║                    target: Sim                                               ║
║                    pie_menu: Friendly                                        ║
║                                                                              ║
║                    available_when:                                           ║
║                      - actor is teen_or_older                                ║
║                      - target is not sleeping                                ║
║                                                                              ║
║                    on_success:                                               ║
║                      - apply buff "Happy +1" to target for 2h                ║
║                                                                              ║
║                                                                              ║
║                                                                              ║
║                                                                              ║
║                                                                              ║
║                                                                              ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ 🌊 [Spectral Pulse: Breathing #151A24 / #1A222E]                             ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

- **Bioluminescent Breathing**: The subtle background pulse indicates system health without text.
- **Focus Point**: Editor is centered with 1.8x line-height for readability.

### 4. Focus Mode (Engine Diagnostics)

*Goal: High-density data stream for complex debugging and real-time engine synchronization.*

```text
╔══════════════════════════════════════════════════════════════════════════════╗
║ [☰] Focus Dashboard: example.jpe | TS4: ACTIVE [⚡]                 [_][□][×] ║
╠═════════════╦════════════════════════════════════════╦═══════════════════════╣
║ 📁 PROJECT  ║ 📝 EDITOR                              ║ 🔄 XML PREVIEW        ║
║   greet.jpe ║ interaction "Friendly Ask":            ║ <interaction ...>     ║
║   talk.jpe  ║   id: 1234567890                       ║   <L type="age">      ║
║             ║   target: Sim                          ║   </L>                ║
╠═════════════╩════════════════════════════════════════╩═══════════════════════╣
║ 🛠 DEBUG LOG (JPE-LIVE)                                                       ║
║ [02:44:01] handshaking engine... SUCCESS [Handshake_ID: spectral_9]          ║
║ [02:44:15] actor_id: 99827361 -> trigger: FRIENDLY_ASK                       ║
║ [02:44:15] TRACE: c:\mods\greet.jpe -> Line 12 Logic -> SUCCESS              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

- **Engine Sync**: Real-time log scraping and translation directly in the footer.
- **Contrast**: High-visibility "Diagnostic Red" highlights for failing engine nodes.

### 5. Handheld Native HUD

*Goal: Ergonomic layout for Steam Deck and touch-screen modding.*

```text
╔═════════════════════════╗
║ [←] greet.jpe  [ ⚙️ ]    ║
╠═════════════════════════╣
║  interaction "Greet":   ║
║    id: 123456789        ║
║    target: Sim          ║
║                         ║
║  on_success:            ║
║    - play "Greet"       ║
║                         ║
║      [ RADIAL MENU ]    ║
║        /    |    \      ║
║     [+]    [×]    [✓]   ║
║        \    |    /      ║
╠═════════════════════════╣
║ 📁 [ greet ] [ talk ]   ║
╚═════════════════════════╝
```

- **Touch-Targets**: Large line-height and card-style tab selector at bottom.
- **Thumb-Radial**: Summonable via bottom-right trigger for common JPE actions.

## Sensory Feedback Map

Mapping the "Spectral" brand sensory layers to visual HUD events.

| Action / Event | Audio | Haptic | Visual (Bioluminescent) |
| :--- | :--- | :--- | :--- |
| **Code Scrubbing** | Low-pass filter hum | Smooth drag | Cursor trail bloom |
| **Success / Save** | Success Chord | Sharp single pulse | Screen-wide Teal Bloom |
| **Error / Fail** | Dissonant hum | Damped double | Damped Red border pulse |
| **Engine Link** | Heartbeat rhythm | Rhythmic tick | Subtle bottom-bar pulse |
| **Link Severed** | Power-down slide | Long vibration | Grayscale washout |
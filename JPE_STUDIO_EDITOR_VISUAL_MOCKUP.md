# JPE Studio Editor - Visual Interface Mockup

## Main Window Layout

```
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
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ JPE Studio Editor - [example.jpe]                                   [ _ □ ×] │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2. Menu Bar
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [☰] File  Edit  View  Tools  Help                            │□□□│□□□│⚙️│ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3. Sidebar - Project Explorer
```
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
```
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
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    🔄 XML PREVIEW (LIVE)                                  │
├─────────────────────────────────────────────────────────────────────────────┤
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
├─────────────────────────────────────────────────────────────────────────────┤
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
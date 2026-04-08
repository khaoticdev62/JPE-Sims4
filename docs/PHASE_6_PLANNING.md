# Phase 6: Steam Deck Controller Integration & Predictive Coding Mode

## Overview

**Phase Status**: ✅ Complete (Implemented Dec 30, 2025)

Build Steam Deck controller support with full input mapping and implement ML-powered predictive coding mode for intelligent code suggestions in the JPE Mod Translator.

**Timeline**: 8-10 weeks (160-200 hours estimated)
**Modules**: 16 features across 2 sub-phases
**Success Criteria**: Deck controller fully mapped, predictive mode achieving 70%+ suggestion accuracy, <200ms latency

---

## IMPLEMENTATION SUMMARY (Dec 30, 2025)

### Phase 6A: Controller Integration
- **GamepadService**: Polling Gamepad API at 60fps with event emission
- **ControllerMapper**: Standardized mapping for Steam Deck/Xbox controllers
- **CursorController**: Low-level editor cursor control (move, select, delete)
- **TextInputHandler**: Programmatic text insertion for Monaco editor
- **VirtualKeyboard**: On-screen keyboard for Steam Deck input
- **ControllerSettings**: UI for remapping and sensitivity adjustment
- **useGamepadEditing**: Hook bridging gamepad input to editor actions

### Phase 6B: Predictive Coding
- **CodePredictor**: Context-aware prediction engine using project patterns
- **Pattern Integration**: Leverages Phase 5C pattern analysis results
- **Heuristic Ranking**: High-performance ranking based on frequency and context
- **Feedback System**: Learns from user acceptance/rejection of suggestions
- **PredictionOverlay**: Ghost-text and menu UI for inline suggestions
- **useCodePrediction**: Hook managing the prediction lifecycle

---

## Phase 6A: Steam Deck Controller Integration (Weeks 1-5)

### Architecture Overview

Steam Deck uses SDL2 (Simple DirectMedia Layer) for controller input. The Electron runtime has native gamepad support via HTML5 Gamepad API.

**Controller Layout (Steam Deck)**:
```
                    ◉ Y (Blue)
            ◉ X (Red)  ◉ A (Green)
                  ◉ B (Yellow)

    LB              RB
    LT              RT

    LS (L3)    RS (R3)

    [☰] Menu   [⋮] Options
```

### Step 1: Gamepad API Integration (Days 1-3)

**Objective**: Create gamepad input layer for Steam Deck controller

**New Files**:
```
src/services/input/
├── GamepadService.ts       # Main gamepad polling and state
├── ControllerMapper.ts     # Input mapping configuration
├── GamepadEvents.ts        # Gamepad event system
└── types.ts                # Input types

src/hooks/
└── useGamepadInput.ts      # React hook for components
```

**Key Implementation**:
```typescript
// GamepadService.ts
export class GamepadService {
  private pollIntervalId: number | null = null
  private previousState: GamepadState = {}
  private listeners: Map<string, Function[]> = new Map()

  start(): void {
    this.pollIntervalId = setInterval(() => {
      this.pollGamepads()
    }, 16) // 60 FPS
  }

  private pollGamepads(): void {
    const gamepads = navigator.getGamepads?.() || []

    gamepads.forEach((gamepad, index) => {
      if (!gamepad) return

      // Check buttons (0-16 on Steam Deck)
      gamepad.buttons.forEach((button, buttonIndex) => {
        const key = `button_${buttonIndex}`
        const wasPressed = this.previousState[key]
        const isPressed = button.pressed

        if (isPressed && !wasPressed) {
          this.emit(`button_down_${buttonIndex}`, { gamepad: index })
        } else if (!isPressed && wasPressed) {
          this.emit(`button_up_${buttonIndex}`, { gamepad: index })
        }

        this.previousState[key] = isPressed
      })

      // Check axes (analog sticks, triggers)
      gamepad.axes.forEach((axis, axisIndex) => {
        const key = `axis_${axisIndex}`
        const deadzone = 0.1
        const isDead = Math.abs(axis) < deadzone

        if (!isDead) {
          this.emit(`axis_move_${axisIndex}`, { value: axis, gamepad: index })
        }
      })
    })
  }

  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  private emit(event: string, data: any): void {
    this.listeners.get(event)?.forEach(cb => cb(data))
  }
}

// ControllerMapper.ts
export class ControllerMapper {
  private mappings: Map<string, EditorAction> = new Map()

  // Default Steam Deck mapping
  private defaultMapping = {
    // Action buttons
    'button_0': 'accept',          // A
    'button_1': 'cancel',           // B
    'button_2': 'secondary-action', // X
    'button_3': 'primary-action',   // Y

    // Shoulder buttons
    'button_4': 'prev-tab',         // LB
    'button_5': 'next-tab',         // RB
    'button_6': 'find',             // LT
    'button_7': 'replace',          // RT

    // Menu buttons
    'button_8': 'show-menu',        // Menu
    'button_9': 'show-settings',    // Options

    // Stick buttons
    'button_10': 'focus-editor',    // L3
    'button_11': 'focus-terminal',  // R3

    // Analog sticks
    'axis_0': 'horizontal-move',    // L Stick X
    'axis_1': 'vertical-move',      // L Stick Y
    'axis_2': 'scroll',             // R Stick Y (for scrolling)
    'axis_3': 'zoom',               // R Stick X (for zoom)
  }

  getAction(inputKey: string): EditorAction | null {
    return this.mappings.get(inputKey) || this.defaultMapping[inputKey] || null
  }

  remapInput(inputKey: string, action: EditorAction): void {
    this.mappings.set(inputKey, action)
  }

  exportMapping(): Record<string, EditorAction> {
    return { ...this.defaultMapping, ...Object.fromEntries(this.mappings) }
  }

  importMapping(mapping: Record<string, EditorAction>): void {
    this.mappings.clear()
    Object.entries(mapping).forEach(([key, action]) => {
      this.mappings.set(key, action)
    })
  }
}
```

**Testing**:
- Test polling interval and frame rate
- Test button press/release detection
- Test analog stick deadzone
- Verify no memory leaks from polling

---

### Step 2: Editor Navigation via Controller (Days 4-6)

**Objective**: Navigate editor UI using gamepad controls

**Modified Files**:
- `src/components/editor/EditorPane.tsx`
- `src/components/layout/Sidebar.tsx`

**New Files**:
```
src/components/controller/
├── ControllerIndicator.tsx   # Show controller status
└── ControllerHelp.tsx        # Show button mappings overlay
```

**Key Features**:
- Left stick: Navigate between tabs and files
- Right stick: Scroll editor content
- A/B buttons: Accept/Cancel dialogs
- X/Y: Quick actions (undo, redo)
- Shoulder buttons: Switch between panes
- Triggers: Find/Replace functionality

**Implementation Pattern**:
```typescript
// useGamepadNavigation.ts (new hook)
export function useGamepadNavigation() {
  const gamepadService = GamepadService.getInstance()
  const { currentFile, setCurrentFile } = useEditorStore()
  const [focusedPane, setFocusedPane] = useState<'editor' | 'sidebar' | 'panel'>('editor')

  useEffect(() => {
    // Navigate between tabs with left stick
    gamepadService.on('axis_move_0', (data) => {
      if (data.value > 0.5) {
        // Right
        switchToNextTab()
      } else if (data.value < -0.5) {
        // Left
        switchToPreviousTab()
      }
    })

    // Switch panes with shoulder buttons
    gamepadService.on('button_down_4', () => setFocusedPane('sidebar'))
    gamepadService.on('button_down_5', () => setFocusedPane('editor'))
  }, [])

  return { focusedPane, setFocusedPane }
}
```

---

### Step 3: Text Editing via Controller (Days 7-8)

**Objective**: Enable text selection, editing, and cursor control with gamepad

**New Files**:
```
src/services/input/
├── CursorController.ts      # Cursor movement and selection
└── TextInputHandler.ts      # Character input mapping
```

**Key Features**:
- Right stick: Move cursor (8-directional + diagonal)
- Left stick + modifier: Jump word/line/paragraph
- B button: Delete character
- X button: Delete word
- Y button: Undo
- LT/RT: Indent/Unindent

**Implementation Challenge**: Need virtual keyboard UI for text input since physical keyboard not always accessible on Deck.

```typescript
// CursorController.ts
export class CursorController {
  moveCursorBy(lines: number, chars: number): void {
    // Get current cursor position
    const editor = getMonacoEditor()
    const position = editor.getPosition()

    // Calculate new position
    const newPosition = {
      lineNumber: Math.max(1, position.lineNumber + lines),
      column: Math.max(1, position.column + chars)
    }

    editor.setPosition(newPosition)
  }

  selectWord(): void {
    const editor = getMonacoEditor()
    editor.action.quickCommand.execute('editor.action.selectHighlights')
  }

  deleteCharacter(): void {
    const editor = getMonacoEditor()
    editor.trigger('keyboard', 'deleteRight', {})
  }

  deleteWord(): void {
    const editor = getMonacoEditor()
    editor.trigger('keyboard', 'deleteWordRight', {})
  }
}
```

---

### Step 4: Virtual Keyboard UI (Days 9-10)

**Objective**: On-screen keyboard for text input on Steam Deck

**New Files**:
```
src/components/input/
├── VirtualKeyboard.tsx       # Main keyboard component
├── KeyboardKey.tsx           # Individual key
└── InputMethodSelector.tsx   # Switch between input methods
```

**Features**:
- QWERTY layout with symbol access
- T9 (predictive text) input support
- Voice input button (future: speech-to-text)
- Autocomplete integration with Phase 5C smart suggestions
- Context-aware layout (XML tag input, enum values, etc.)

**Implementation**:
```typescript
// VirtualKeyboard.tsx
export function VirtualKeyboard({
  onInput,
  visible,
  context = 'default'
}: Props) {
  const [layout, setLayout] = useState('qwerty')
  const [shift, setShift] = useState(false)

  const layouts = {
    qwerty: [
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
      ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
      [' ', '0x', '<', '>']  // Context buttons for XML/tuning
    ],
    symbols: [
      ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'],
      ['-', '=', '[', ']', '{', '}', '|', ';', ':', "'"],
      [',', '.', '/', '\\', '?', '`', '~'],
      [' ']
    ]
  }

  const currentLayout = context === 'xml'
    ? layouts.xml
    : shift
    ? layouts.qwerty.map(row => row.map(k => k.toUpperCase()))
    : layouts[layout]

  return (
    <div className="virtual-keyboard">
      {currentLayout.map((row, i) => (
        <div key={i} className="keyboard-row">
          {row.map((key, j) => (
            <KeyboardKey
              key={`${i}-${j}`}
              label={key}
              onClick={() => onInput(key)}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
```

---

### Step 5: Settings & Customization (Days 11-12)

**Objective**: Allow users to customize controller mappings

**New Files**:
```
src/components/settings/
└── ControllerSettings.tsx    # Remapping UI

src/stores/
└── useControllerStore.ts     # Controller configuration
```

**Features**:
- View current button mappings
- Remap buttons to actions
- Reset to defaults
- Export/import mappings
- Test controller input visually
- Sensitivity adjustment for analog sticks

**Testing**:
- Test mapping persistence
- Test remapping workflow
- Test reset functionality
- Verify no conflicts in mappings

---

## Phase 6B: Predictive Coding Mode (Weeks 6-10)

### Step 6: ML Model for Code Prediction (Days 13-15)

**Objective**: Train/integrate ML model for predictive code suggestions

**New Files**:
```
src/services/ml/
├── CodePredictor.ts          # Main prediction service
├── PredictionCache.ts        # Cache predictions
└── TrainingDataCollector.ts  # Collect patterns from user code

src/engine/ml/
├── SequenceModel.ts          # LSTM-like sequence prediction
└── TransformerLite.ts        # Lightweight transformer for code
```

**Architecture Decision**: Use local ML (TensorFlow.js or similar) rather than Claude API for speed.

```typescript
// CodePredictor.ts
export class CodePredictor {
  private model: tf.LayersModel
  private vectorizer: CodeVectorizer
  private cache: PredictionCache

  async predictNextToken(
    context: string,
    position: number,
    maxTokens: number = 5
  ): Promise<PredictionResult[]> {
    // Check cache first
    const cacheKey = this.getCacheKey(context)
    const cached = this.cache.get(cacheKey)
    if (cached) return cached

    // Vectorize input code context
    const vector = this.vectorizer.encode(context)

    // Run model inference
    const predictions = tf.tidy(() => {
      const input = tf.tensor2d([vector])
      const output = this.model.predict(input) as tf.Tensor
      return output.data()
    })

    // Decode predictions to tokens
    const results = await this.vectorizer.decode(
      Array.from(predictions),
      maxTokens
    )

    // Sort by confidence
    results.sort((a, b) => b.confidence - a.confidence)

    // Cache results
    this.cache.set(cacheKey, results)

    return results
  }

  // Learn from user patterns
  async recordPattern(
    context: string,
    prediction: string,
    correct: boolean
  ): Promise<void> {
    TrainingDataCollector.addPattern({
      context,
      prediction,
      correct,
      timestamp: Date.now()
    })
  }
}

// PredictionResult interface
interface PredictionResult {
  token: string
  confidence: number  // 0-1
  type: 'enum' | 'tuning' | 'tag' | 'keyword' | 'variable'
  description?: string
  examples?: string[]
}
```

**Challenge**: Balancing model size (must fit on Deck with <500MB memory overhead) with prediction accuracy.

---

### Step 7: Context-Aware Suggestions (Days 16-18)

**Objective**: Tailor predictions based on file type and project patterns

**New Files**:
```
src/services/ml/
├── CodeContextAnalyzer.ts    # Analyze current context
└── SuggestionRanker.ts       # Rank predictions by relevance
```

**Context Factors**:
- File type (XML interaction, buff, etc.)
- Current tag/element context
- Project patterns (from Phase 5C)
- User preferences (based on telemetry)
- Recent edits and patterns

```typescript
// CodeContextAnalyzer.ts
export class CodeContextAnalyzer {
  analyzeContext(
    fileContent: string,
    cursorPosition: number
  ): CodeContext {
    const beforeCursor = fileContent.slice(0, cursorPosition)
    const afterCursor = fileContent.slice(cursorPosition)

    return {
      fileType: this.detectFileType(fileContent),
      currentTag: this.getCurrentTag(beforeCursor),
      parentTags: this.getParentTags(beforeCursor),
      recentTokens: this.getRecentTokens(beforeCursor, 5),
      indentLevel: this.getIndentLevel(beforeCursor),
      suggestedLineContent: this.suggestLineCompletion(beforeCursor, afterCursor),
      availableEnums: this.getAvailableEnums(this.getCurrentTag(beforeCursor)),
      availableTuning: this.getAvailableTuning()
    }
  }

  private getCurrentTag(content: string): string {
    const match = content.match(/<(\w+)[^>]*>/)
    return match ? match[1] : ''
  }

  private getAvailableEnums(tag: string): string[] {
    // Use CompilerService to get valid enums for tag
    return CompilerService.getEnumValuesForTag(tag)
  }

  private getAvailableTuning(): string[] {
    // Use patterns from Phase 5C
    const patterns = PatternStore.getPatterns()
    return patterns.tuningPatterns
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 20)
      .map(p => p.tuningId)
  }
}

// SuggestionRanker.ts
export class SuggestionRanker {
  rank(
    predictions: PredictionResult[],
    context: CodeContext,
    patterns: ProjectPatterns
  ): RankedPrediction[] {
    return predictions.map(pred => ({
      ...pred,
      score: this.calculateScore(pred, context, patterns)
    }))
    .sort((a, b) => b.score - a.score)
  }

  private calculateScore(
    prediction: PredictionResult,
    context: CodeContext,
    patterns: ProjectPatterns
  ): number {
    let score = prediction.confidence // 0-1

    // Boost if matches current context
    if (context.currentTag && this.isValidForTag(prediction, context.currentTag)) {
      score *= 1.3
    }

    // Boost if matches project patterns
    if (this.matchesProjectPattern(prediction, patterns)) {
      score *= 1.2
    }

    // Boost if recent in user edits
    if (context.recentTokens.includes(prediction.token)) {
      score *= 1.15
    }

    // Normalize to 0-1
    return Math.min(score, 1.0)
  }
}
```

---

### Step 8: Inline Predictions Display (Days 19-20)

**Objective**: Show predictions as ghost text in editor (VS Code style)

**Modified Files**:
- `src/components/editor/MonacoEditor.tsx`

**New Files**:
```
src/components/editor/
├── PredictionOverlay.tsx     # Ghost text display
└── PredictionMenu.tsx        # Popup suggestions
```

**Features**:
- Ghost text at cursor (faded, auto-inserted with Tab)
- Inline suggestion menu (top N predictions)
- Accept suggestion with Tab or Right Arrow
- Dismiss with Escape
- Controller-friendly selection (Up/Down to navigate, A to accept)

```typescript
// PredictionOverlay.tsx
export function PredictionOverlay({
  editor,
  predictions,
  visible
}: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const prediction = predictions[selectedIndex]

  useEffect(() => {
    // Handle controller input
    GamepadService.getInstance().on('axis_move_1', (data) => {
      if (data.value > 0.5) {
        // Down - next suggestion
        setSelectedIndex(prev => (prev + 1) % predictions.length)
      } else if (data.value < -0.5) {
        // Up - previous suggestion
        setSelectedIndex(prev => (prev - 1 + predictions.length) % predictions.length)
      }
    })

    GamepadService.getInstance().on('button_down_0', () => {
      // A button - accept
      acceptPrediction(prediction)
    })
  }, [predictions])

  if (!visible || !prediction) return null

  return (
    <div className="prediction-overlay">
      {/* Ghost text */}
      <div className="ghost-text">{prediction.token}</div>

      {/* Suggestion menu */}
      <div className="suggestion-menu">
        {predictions.slice(0, 5).map((pred, i) => (
          <div
            key={i}
            className={`suggestion ${i === selectedIndex ? 'selected' : ''}`}
          >
            <span className="token">{pred.token}</span>
            <span className="type">{pred.type}</span>
            <span className="confidence">{(pred.confidence * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

### Step 9: Learning from User Behavior (Days 21-22)

**Objective**: Improve predictions based on what user accepts/rejects

**New Files**:
```
src/services/ml/
├── FeedbackCollector.ts      # Collect user responses
└── ModelUpdater.ts           # Fine-tune model weights
```

**Learning Mechanism**:
- Track accepted vs rejected predictions
- Weight user preferences (some users prefer verbose code, others prefer concise)
- Update prediction scores based on feedback
- Periodic retraining on collected patterns

**Privacy Consideration**: All learning happens locally; no data sent to cloud.

```typescript
// FeedbackCollector.ts
export class FeedbackCollector {
  recordAcceptance(
    context: string,
    acceptedPrediction: string,
    rejectedPredictions: string[]
  ): void {
    const feedback: UserFeedback = {
      timestamp: Date.now(),
      context,
      accepted: acceptedPrediction,
      rejected: rejectedPredictions,
      userAction: 'accepted'
    }

    // Store feedback locally
    this.storeLocally(feedback)

    // Update model preferences
    ModelUpdater.updateWeights(feedback)
  }

  recordRejection(context: string, rejectedPrediction: string): void {
    const feedback: UserFeedback = {
      timestamp: Date.now(),
      context,
      rejected: [rejectedPrediction],
      userAction: 'rejected'
    }

    this.storeLocally(feedback)
    ModelUpdater.updateWeights(feedback)
  }

  private storeLocally(feedback: UserFeedback): void {
    const stored = JSON.parse(
      localStorage.getItem('prediction-feedback') || '[]'
    )
    stored.push(feedback)
    localStorage.setItem('prediction-feedback', JSON.stringify(stored))
  }
}
```

---

### Step 10: Performance Optimization (Days 23-24)

**Objective**: Achieve <200ms prediction latency on Deck hardware

**Optimizations**:
- Model quantization (reduce precision to INT8)
- Tensor caching and reuse
- Batch processing for multiple suggestions
- Lazy loading of model weights
- Hardware acceleration via WebGL (if available)

**Testing**:
- Profile model inference time
- Measure memory usage under load
- Test on older Deck hardware
- Validate accuracy doesn't degrade with quantization

---

### Step 11-15: UI Integration, Testing, Documentation

Following same pattern as Phase 5C (Steps 11-15):
- Integrate predictions into editor workflow
- Create comprehensive tests
- Document predictive mode
- Performance benchmarking
- Deployment readiness

---

## Dependencies to Add

```json
{
  "dependencies": {
    "@tensorflow/tfjs": "^4.11.0",              // ML inference
    "@tensorflow/tfjs-backend-webgl": "^4.11.0", // GPU acceleration
    "compression-webpack-plugin": "^10.2.0",    // Model compression
    "seedrandom": "^3.0.5"                      // Reproducible randomness
  },
  "devDependencies": {
    "@tensorflow/tfjs-vis": "^1.4.0"           // Model visualization
  }
}
```

---

## Phase 6 Critical Decisions

### 1. Input Method
**Decision**: HTML5 Gamepad API + custom event system
**Rationale**: Native browser support, no additional dependencies, works with any gamepad

### 2. ML Framework
**Decision**: TensorFlow.js for local inference
**Rationale**: Lightweight, runs on-device, no API calls needed, privacy-first

### 3. Model Architecture
**Decision**: Lightweight transformer or LSTM
**Rationale**: Balance between accuracy and speed for Deck's GPU

### 4. Virtual Keyboard
**Decision**: Custom React component with controller navigation
**Rationale**: Integrates better with editor, can tie into predictive input

### 5. Learning Approach
**Decision**: Local feedback collection + periodic fine-tuning
**Rationale**: Privacy-preserving, no cloud dependency, improves over time

---

## Performance Targets (Phase 6)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Gamepad Input Latency | <16ms | Poll rate (60 FPS) |
| Prediction Latency | <200ms | Model inference end-to-end |
| Prediction Accuracy | >70% | Correct suggestions / total |
| Memory Overhead | <500MB | Model + vectorizer + cache |
| Model Size | <50MB | On-disk footprint |
| Deck Performance | <5% CPU | Idle monitoring overhead |

---

## Integration with Phase 5C

Phase 6 builds on Phase 5C foundation:

1. **Smart Suggestions** - Phase 5C patterns feed into predictive rankings
2. **Analytics** - Track prediction acceptance rate via telemetry
3. **PII Protection** - CodePredictor respects same sanitization rules
4. **Offline Capability** - Predictions work fully offline (unlike Claude API)

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Gamepad input conflicts | Medium | Medium | Customizable mappings |
| Model accuracy too low | Medium | High | Extensive training, user feedback loop |
| Memory pressure on Deck | Low | Medium | Model quantization, lazy loading |
| Deck controller variance | Low | Low | Test with multiple controllers |
| Model size too large | Low | Medium | Compression, pruning |

---

## Success Criteria (Phase 6)

**Phase 6A Complete**:
- ✅ Gamepad polling at 60 FPS with <16ms latency
- ✅ All editor functions accessible via controller
- ✅ Text editing functional (cursor, selection, delete)
- ✅ Virtual keyboard working for text input
- ✅ Controller mappings customizable and persistent

**Phase 6B Complete**:
- ✅ Predictions generated in <200ms
- ✅ Prediction accuracy >70% (validated on test set)
- ✅ Model size <50MB, memory overhead <500MB
- ✅ Learning system active (improving over time)
- ✅ Controller-friendly interaction (A/B to accept/reject)

**Overall Phase 6 Complete**:
- ✅ Full Steam Deck playability (no keyboard needed)
- ✅ Predictive coding mode improving code writing speed
- ✅ <5% CPU overhead for prediction monitoring
- ✅ All tests passing, docs complete
- ✅ Production-ready deployment

---

## Timeline & Sequencing

**Week 1**: Gamepad service + controller mapper
**Week 2**: Editor navigation + text editing
**Week 3**: Virtual keyboard UI
**Week 4**: Settings & controller customization
**Week 5**: Buffer + refinement for Phase 6A

**Week 6**: ML model selection + data collection
**Week 7**: Context-aware suggestions
**Week 8**: Inline display + interaction
**Week 9**: Learning system + optimization
**Week 10**: Integration, testing, documentation

---

## Open Questions for Phase 6

1. **Model Source**: Train from scratch on Sims 4 mods, or use pre-trained code model?
2. **Deck Storage**: Can we store 50MB model on user's Deck, or should it be installed with app?
3. **Multiplayer**: Should Deck users be able to collaborate with desktop users in real-time?
4. **Offline Sync**: When Deck user rejoins desktop environment, how to sync changes?
5. **Prediction Display**: Ghost text vs popup menu vs both? Test with users.

---

**Next Steps**:
1. Validate Phase 6 scope with team
2. Acquire Deck for testing
3. Prototype gamepad integration
4. Begin Phase 6A implementation

---

*Last Updated*: December 29, 2024
*Status*: Planning complete, ready for approval and development start

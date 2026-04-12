import { SensoryEvent, sensoryService } from './SensoryService'

export enum ShortcutScope {
  GLOBAL = 'global',
  EDITOR = 'editor',
  EXPLORER = 'explorer'
}

export interface Shortcut {
  id: string
  label: string
  keys: string[] // e.g. ['Control', 's'] or ['Meta', 's']
  scope: ShortcutScope
  action: () => void | Promise<void>
  categoryId?: string // e.g. 'file', 'edit', 'navigation'
  icon?: any // Lucide icon component
  color?: string
  description?: string
}

class ShortcutService {
  private shortcuts: Map<string, Shortcut> = new Map()
  private editorFocused: boolean = false
  private explorerFocused: boolean = false

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.handleKeyDown.bind(this), true)
    }
  }

  public register(shortcut: Shortcut): void {
    this.shortcuts.set(shortcut.id, shortcut)
  }

  public unregister(id: string): void {
    this.shortcuts.delete(id)
  }

  public setEditorFocus(focused: boolean): void {
    this.editorFocused = focused
  }

  public setExplorerFocus(focused: boolean): void {
    this.explorerFocused = focused
  }

  private handleKeyDown(e: KeyboardEvent): void {
    // Avoid triggering shortcuts when typing in inputs/textareas, 
    // UNLESS it's a modifier-based shortcut that we want to intercept.
    const target = e.target as HTMLElement
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
    
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey
    const shift = e.shiftKey
    const alt = e.altKey

    // Normalize keys
    const pressedKey = e.key.toLowerCase()

    for (const shortcut of this.shortcuts.values()) {
      // Scope validation
      if (shortcut.scope === ShortcutScope.EDITOR && !this.editorFocused) continue
      if (shortcut.scope === ShortcutScope.EXPLORER && !this.explorerFocused) continue

      const targetKeys = shortcut.keys.map(k => k.toLowerCase())
      
      const hasCtrlMeta = targetKeys.includes('control') || targetKeys.includes('meta') || targetKeys.includes('command')
      const hasShift = targetKeys.includes('shift')
      const hasAlt = targetKeys.includes('alt')
      
      const baseKey = targetKeys.find(k => !['control', 'meta', 'command', 'shift', 'alt'].includes(k))

      // If we are in an input, only allow shortcuts with modifiers (like Ctrl+S)
      if (isInput && !hasCtrlMeta && !hasAlt && baseKey !== 'escape') continue

      if (
        (hasCtrlMeta === cmdOrCtrl) &&
        (hasShift === shift) &&
        (hasAlt === alt) &&
        (baseKey === pressedKey)
      ) {
        e.preventDefault()
        e.stopPropagation()
        
        shortcut.action()
        
        // Sensory feedback: specialized pulse for history, subtle for others
        if (shortcut.id === 'undo' || shortcut.id === 'redo') {
          sensoryService.onHistoryStep()
        } else {
          sensoryService.onCodeScrub(0.15)
        }
        
        break
      }
    }
  }

  public getShortcuts(): Shortcut[] {
    return Array.from(this.shortcuts.values())
  }
}

export const shortcutService = new ShortcutService()

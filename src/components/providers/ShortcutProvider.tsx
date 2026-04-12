"use client"

import * as React from "react"
import { useUIStore } from "@/stores/useUIStore"
import { shortcutService, ShortcutScope } from "@/services/editor/ShortcutService"
import { useProjectStore } from "@/stores/useProjectStore"
import { toast } from "sonner"
import { 
  Languages, Rocket, Package, Search, Bug, Code2, 
  BarChart3, Network, GitMerge, LayoutGrid, Sparkles, Settings, Globe
} from "lucide-react"

/**
 * ShortcutProvider - Global Keyboard Event Orchestrator
 * Story 1.7: Industrialized Shortcut Management
 */
export function ShortcutProvider({ children }: { children: React.ReactNode }) {
  const { setCommandPaletteOpen, setWorkspaceMode } = useUIStore()
  const { saveProject } = useProjectStore()

  React.useEffect(() => {
    // ─── Register Global Shortcuts ───────────────────────────────
    
    // Command Palette (Commands)
    shortcutService.register({
      id: 'global.commandPalette',
      label: 'Open Command Palette',
      keys: ['Control', 'Shift', 'p'],
      scope: ShortcutScope.GLOBAL,
      categoryId: 'navigation',
      action: () => setCommandPaletteOpen(true, ">")
    })

    shortcutService.register({
      id: 'global.commandPalette.k',
      label: 'Open Command Palette',
      keys: ['Control', 'k'],
      scope: ShortcutScope.GLOBAL,
      categoryId: 'navigation',
      action: () => setCommandPaletteOpen(true, ">")
    })

    // Quick Open (Files)
    shortcutService.register({
        id: 'global.quickOpen',
        label: 'Quick Open File',
        keys: ['Control', 'p'],
        scope: ShortcutScope.GLOBAL,
        categoryId: 'navigation',
        action: () => setCommandPaletteOpen(true, "")
    })

    // Go to Symbol
    shortcutService.register({
        id: 'global.goToSymbol',
        label: 'Go to Symbol',
        keys: ['Control', 'Shift', 'o'],
        scope: ShortcutScope.GLOBAL,
        categoryId: 'navigation',
        action: () => setCommandPaletteOpen(true, "@")
    })

    // Navigation Shortcuts
    const navModes: Array<{id: string, mode: any, label: string, key: string, icon: any, color: string}> = [
        { id: 'nav.dashboard', mode: 'dashboard', label: 'Go to Dashboard', key: '0', icon: LayoutGrid, color: '#A0AEC0' },
        { id: 'nav.code', mode: 'code', label: 'Go to Code Editor', key: '1', icon: Code2, color: '#38B2AC' },
        { id: 'nav.translation', mode: 'translation', label: 'Go to Translation View', key: '2', icon: Languages, color: '#8B5CF6' },
        { id: 'nav.depgraph', mode: 'depgraph', label: 'Go to Dependency Graph', key: '4', icon: Network, color: '#10B981' },
        { id: 'nav.conflicts', mode: 'conflicts', label: 'Go to Conflict Resolver', key: '5', icon: GitMerge, color: '#F87171' },
        { id: 'nav.build', mode: 'build', label: 'Go to Build Pipeline', key: '6', icon: Rocket, color: '#F6AD55' },
        { id: 'nav.settings', mode: 'settings', label: 'Go to Settings', key: ',', icon: Settings, color: '#A0AEC0' }
    ]

    navModes.forEach(m => {
        shortcutService.register({
            id: m.id,
            label: m.label,
            keys: ['Control', m.key],
            scope: ShortcutScope.GLOBAL,
            categoryId: 'navigation',
            icon: m.icon,
            color: m.color,
            action: () => setWorkspaceMode(m.mode)
        })
    })

    // Save Project/All
    shortcutService.register({
      id: 'global.saveAll',
      label: 'Save Project',
      keys: ['Control', 'Shift', 's'],
      scope: ShortcutScope.GLOBAL,
      categoryId: 'file',
      icon: Package,
      action: async () => {
        toast.info('Saving project...')
        await saveProject()
      }
    })

    // Tool Shortcuts
    shortcutService.register({
        id: 'tool.aiPrompt',
        label: 'AI: Prompt to JPE',
        keys: ['Control', 'Shift', 'j'],
        scope: ShortcutScope.GLOBAL,
        categoryId: 'ai',
        icon: Sparkles,
        action: () => {
            const { setPromptToJPEOpen } = useUIStore.getState()
            setPromptToJPEOpen(true)
        }
    })

    shortcutService.register({
        id: 'tool.help',
        label: 'Help: Open Help Center',
        keys: ['F1'],
        scope: ShortcutScope.GLOBAL,
        categoryId: 'general',
        icon: LayoutGrid,
        action: () => {
            const { setHelpCenterOpen } = useUIStore.getState()
            setHelpCenterOpen(true)
        }
    })

    // Cleanup
    return () => {
      shortcutService.unregister('global.commandPalette')
      shortcutService.unregister('global.commandPalette.k')
      shortcutService.unregister('global.quickOpen')
      shortcutService.unregister('global.goToSymbol')
      shortcutService.unregister('global.saveAll')
      shortcutService.unregister('tool.aiPrompt')
      shortcutService.unregister('tool.help')
      navModes.forEach(m => shortcutService.unregister(m.id))
    }
  }, [setCommandPaletteOpen, setWorkspaceMode, saveProject])

  return <>{children}</>
}

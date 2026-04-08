import { useEditorStore } from '@/stores/useEditorStore'
import { useSymbolStore } from '@/stores/useSymbolStore'
import { useAIStore } from '@/stores/useAIStore'

export interface ProjectContext {
  activeFile: {
    name: string
    content: string
    type: string
  } | null
  openTabs: Array<{
    name: string
    content: string
  }>
  symbols: {
    localInteractions: string[]
    localStblKeys: string[]
    externalInteractions: string[]
    externalStblKeys: string[]
  }
  projectStructure: string[]
}

/**
 * ContextService - Aggregates project-wide metadata for AI injection
 * Story 6.2: Context-Aware Code Generation
 */
export class ContextService {
  /**
   * Generates a structural snapshot of the current project state
   */
  static getProjectSnapshot(): ProjectContext {
    const editorStore = useEditorStore.getState()
    const symbolStore = useSymbolStore.getState()
    const aiStore = useAIStore.getState()

    // 1. Resolve Active File
    const activeFile = editorStore.files.find(f => f.id === editorStore.activeFileId)
    const activeFileContext = activeFile ? {
      name: activeFile.name,
      content: activeFile.content,
      type: activeFile.type
    } : null

    // 2. Resolve Open Tabs (excluding active file content to avoid redundancy)
    const openTabs = editorStore.tabs
      .filter(t => t.id !== editorStore.activeFileId)
      .map(t => ({
        name: t.name,
        content: editorStore.editorContent[t.id]?.substring(0, 2000) || "" // Snippet only for token safety
      }))

    // 3. Resolve Symbols (Local + Optional External)
    const symbols = {
      localInteractions: Array.from(symbolStore.getInteractions()),
      localStblKeys: Array.from(symbolStore.getStblKeys()),
      externalInteractions: [] as string[],
      externalStblKeys: [] as string[]
    }

    if (aiStore.includeExternalSymbols) {
      // Filter for most relevant external symbols (e.g. first 100 to avoid bloat)
      symbols.externalInteractions = Array.from(symbolStore.externalInteractions.keys()).slice(0, 100)
      symbols.externalStblKeys = Array.from(symbolStore.externalStblKeys.keys()).slice(0, 100)
    }

    // 4. Project Structure (excluding current file to keep context clean)
    const projectStructure = editorStore.files
      .filter(f => f.id !== editorStore.activeFileId)
      .map(f => f.name)

    return {
      activeFile: activeFileContext,
      openTabs,
      symbols,
      projectStructure
    }
  }

  /**
   * Formats the context snapshot into a text block for AI consumption
   */
  static formatContextForAI(context: ProjectContext): string {
    let output = "### PROJECT CONTEXT ###\n\n"

    if (context.activeFile) {
      output += `[ACTIVE FILE]: ${context.activeFile.name} (${context.activeFile.type})\n`
    }

    if (context.openTabs.length > 0) {
      output += "\n[OTHER OPEN TABS]:\n"
      context.openTabs.forEach(t => {
        output += `- ${t.name}: "${t.content.substring(0, 500)}..."\n`
      })
    }

    output += "\n[PROJECT SYMBOLS]:\n"
    output += `- Local Interactions: ${context.symbols.localInteractions.join(", ")}\n`
    output += `- Local STBL Keys: ${context.symbols.localStblKeys.join(", ")}\n`

    if (context.symbols.externalInteractions.length > 0) {
      output += `- External Game Interactions (partial): ${context.symbols.externalInteractions.join(", ")}\n`
    }

    output += `\n[FILE STRUCTURE]: ${context.projectStructure.join(", ")}\n`

    return output
  }
}

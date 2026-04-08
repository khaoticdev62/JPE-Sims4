import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface ExternalSymbol {
  id: string // Hex ID
  name?: string // Tuning Name (e.g. buff_Skeleton_Cursed)
  sourcePackage: string // Absolute path to .package
  type: 'tuning' | 'stbl'
}

interface SymbolState {
  interactionsMap: Map<string, Set<string>>
  stblKeysMap: Map<string, Set<string>>
  isIndexing: boolean
  
  // Memoization Cache (Story 4.3 Hardening)
  interactionsCache: Set<string>
  stblKeysCache: Set<string>
  isInteractionsDirty: boolean
  isStblKeysDirty: boolean
  
  // Actions
  updateFileSymbols: (fileId: string, interactions: Set<string>, stblKeys: Set<string>) => void
  setIndexing: (isIndexing: boolean) => void
  clearSymbols: () => void
  
  // Queries
  getInteractions: () => Set<string>
  getStblKeys: () => Set<string>
  hasInteraction: (name: string) => boolean
  hasStblKey: (key: string) => boolean

  // External Indexing (Story 4.3)
  externalInteractions: Map<string, ExternalSymbol> // Key: ID or Name
  externalStblKeys: Map<string, ExternalSymbol> // Key: Hex ID
  isIndexingMods: boolean
  indexedPackagesCount: number
  
  // External Actions
  setExternalSymbols: (interactions: Map<string, ExternalSymbol>, stblKeys: Map<string, ExternalSymbol>) => void
  setIndexingMods: (isIndexing: boolean) => void
  setIndexedPackagesCount: (count: number) => void
}

export const useSymbolStore = create<SymbolState>()(
  devtools(
    (set, get) => ({
      interactionsMap: new Map<string, Set<string>>(),
      stblKeysMap: new Map<string, Set<string>>(),
      isIndexing: false,

      // Cache for memoized queries
      interactionsCache: new Set<string>(),
      stblKeysCache: new Set<string>(),
      isInteractionsDirty: true,
      isStblKeysDirty: true,

      updateFileSymbols: (fileId, interactions, stblKeys) => set((state) => {
        // Deep copy maps to trigger state update
        const interactionsMap = new Map(state.interactionsMap)
        const stblKeysMap = new Map(state.stblKeysMap)
        
        if (interactions.size > 0) interactionsMap.set(fileId, interactions)
        else interactionsMap.delete(fileId)
        
        if (stblKeys.size > 0) stblKeysMap.set(fileId, stblKeys)
        else stblKeysMap.delete(fileId)
        
        return { 
          interactionsMap, 
          stblKeysMap,
          isInteractionsDirty: true,
          isStblKeysDirty: true
        }
      }),

      setIndexing: (isIndexing) => set({ isIndexing }),
      
      clearSymbols: () => set({ 
        interactionsMap: new Map(), 
        stblKeysMap: new Map(),
        isInteractionsDirty: true,
        isStblKeysDirty: true
      }),

      getInteractions: () => {
        const state = get()
        if (!state.isInteractionsDirty) return state.interactionsCache

        const all = new Set<string>()
        state.interactionsMap.forEach(set => set.forEach(i => all.add(i)))
        
        // Update cache
        set({ interactionsCache: all, isInteractionsDirty: false })
        return all
      },

      getStblKeys: () => {
        const state = get()
        if (!state.isStblKeysDirty) return state.stblKeysCache

        const all = new Set<string>()
        state.stblKeysMap.forEach(set => set.forEach(k => all.add(k)))
        
        // Update cache
        set({ stblKeysCache: all, isStblKeysDirty: false })
        return all
      },

      hasInteraction: (name) => {
        // Check local project symbols
        for (const set of get().interactionsMap.values()) {
          if (set.has(name)) return true
        }
        // Check external mod symbols (Map key can be ID or Name)
        return get().externalInteractions.has(name)
      },

      hasStblKey: (key) => {
        const hex = key.toLowerCase().startsWith('0x') ? key.slice(2) : key
        const normalized = `0x${hex.toUpperCase()}`
        
        // Check local project symbols
        for (const set of get().stblKeysMap.values()) {
          if (set.has(normalized)) return true
        }
        // Check external mod symbols
        return get().externalStblKeys.has(normalized)
      },

      externalInteractions: new Map<string, ExternalSymbol>(),
      externalStblKeys: new Map<string, ExternalSymbol>(),
      isIndexingMods: false,
      indexedPackagesCount: 0,

      setExternalSymbols: (interactions, stblKeys) => set({ 
        externalInteractions: interactions, 
        externalStblKeys: stblKeys 
      }),

      setIndexingMods: (isIndexing) => set({ isIndexingMods: isIndexing }),
      
      setIndexedPackagesCount: (count) => set({ indexedPackagesCount: count })
    }),
    { name: 'symbol-store' }
  )
)

import { create } from 'zustand';

export type SidebarView = 'explorer' | 'elements' | 'cleanup' | 'manifest' | 'help' | 'compatibility';

interface ElementsState {
  activeView: SidebarView;
  searchQuery: string;
  setActiveView: (view: SidebarView) => void;
  setSearchQuery: (query: string) => void;
}

export const useElementsStore = create<ElementsState>((set) => ({
  activeView: 'explorer',
  searchQuery: '',

  setActiveView: (view) => set({ activeView: view }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));

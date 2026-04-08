import { create } from "zustand";
import manualData from "../data/jpm-content.json";

export interface ManualSection {
  id: string;
  title: string;
  content: string;
  items: ManualItem[];
}

export interface ManualItem {
  id: string;
  title: string;
  content: string;
  playground?: string;
  context?: string;
}

interface ManualState {
  sections: ManualSection[];
  activeSectionId: string;
  activeItemId: string | null;
  searchQuery: string;
  isHelpOpen: boolean;
  contextAnchor: string | null;

  // Actions
  setActiveSection: (id: string) => void;
  setActiveItem: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  toggleHelp: (open: boolean) => void;
  setContextAnchor: (anchor: string | null) => void;
  getFilteredSections: () => ManualSection[];
}

export const useManualStore = create<ManualState>((set, get) => ({
  sections: manualData.sections as ManualSection[],
  activeSectionId: manualData.sections[0].id,
  activeItemId: null,
  searchQuery: "",
  isHelpOpen: false,
  contextAnchor: null,

  setActiveSection: (id) => set({ activeSectionId: id, activeItemId: null }),
  setActiveItem: (id) => set({ activeItemId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleHelp: (open) => set({ isHelpOpen: open }),
  setContextAnchor: (anchor) => set({ contextAnchor: anchor }),

  getFilteredSections: () => {
    const { sections, searchQuery } = get();
    if (!searchQuery) return sections;

    const lowerQuery = searchQuery.toLowerCase();
    return sections.filter(section => 
      section.title.toLowerCase().includes(lowerQuery) ||
      section.content.toLowerCase().includes(lowerQuery) ||
      section.items.some(item => 
        item.title.toLowerCase().includes(lowerQuery) ||
        item.content.toLowerCase().includes(lowerQuery)
      )
    );
  }
}));

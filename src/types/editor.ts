export interface Tab {
  id: string; // The file path serves as a unique ID
  name: string; // The display name of the tab (e.g. main.jpe)
  path: string; // Absolute path to the file
  type: string; // jpe, xml, stbl, unknown
  content: string; // The actual content of the file
  isDirty: boolean; // True if there are unsaved changes
}

export interface EditorState {
  tabs: Tab[];
  activeTabId: string | null;
  openTab: (tab: Omit<Tab, 'isDirty' | 'content'> & { content?: string }) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTabContent: (tabId: string, content: string) => void;
}

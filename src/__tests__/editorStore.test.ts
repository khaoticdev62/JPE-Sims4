import { useEditorStore } from '../stores/editorStore';

describe('EditorStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useEditorStore.setState({ tabs: [], activeTabId: null });
  });

  it('initializes with empty tabs and no active tab', () => {
    const state = useEditorStore.getState();
    expect(state.tabs).toEqual([]);
    expect(state.activeTabId).toBeNull();
  });

  it('can open a new tab and sets it as active', () => {
    useEditorStore.getState().openTab({
      id: '/mock/path/file.jpe',
      name: 'file.jpe',
      path: '/mock/path/file.jpe',
      type: 'jpe'
    });

    const state = useEditorStore.getState();
    expect(state.tabs.length).toBe(1);
    expect(state.tabs[0].id).toBe('/mock/path/file.jpe');
    expect(state.tabs[0].name).toBe('file.jpe');
    expect(state.tabs[0].isDirty).toBe(false);
    expect(state.tabs[0].content).toBe('');
    expect(state.activeTabId).toBe('/mock/path/file.jpe');
  });

  it('activates an existing tab if opened again', () => {
    const store = useEditorStore.getState();
    store.openTab({ id: 'file1', name: 'File 1', path: '/file1', type: 'xml', content: 'test1' });
    store.openTab({ id: 'file2', name: 'File 2', path: '/file2', type: 'xml', content: 'test2' });
    
    expect(useEditorStore.getState().activeTabId).toBe('file2');
    expect(useEditorStore.getState().tabs.length).toBe(2);

    store.openTab({ id: 'file1', name: 'File 1', path: '/file1', type: 'xml', content: 'test1' });
    
    // Should NOT duplicate the tab, just activate it
    expect(useEditorStore.getState().tabs.length).toBe(2);
    expect(useEditorStore.getState().activeTabId).toBe('file1');
  });

  it('can explicitly set the active tab', () => {
    const store = useEditorStore.getState();
    store.openTab({ id: 'file1', name: 'File 1', path: '/file1', type: 'xml', content: 'test1' });
    store.openTab({ id: 'file2', name: 'File 2', path: '/file2', type: 'xml', content: 'test2' });

    store.setActiveTab('file1');
    expect(useEditorStore.getState().activeTabId).toBe('file1');
  });

  it('can close a tab and resets activeTabId correctly', () => {
    const store = useEditorStore.getState();
    store.openTab({ id: 'file1', name: 'File 1', path: '/file1', type: 'xml', content: 'test1' });
    store.openTab({ id: 'file2', name: 'File 2', path: '/file2', type: 'xml', content: 'test2' });
    store.openTab({ id: 'file3', name: 'File 3', path: '/file3', type: 'xml', content: 'test3' });

    // Active is file3. Close file3 -> should fallback to file2
    store.closeTab('file3');
    expect(useEditorStore.getState().tabs.length).toBe(2);
    expect(useEditorStore.getState().activeTabId).toBe('file2');

    // Close file2 -> should fallback to file1
    store.closeTab('file2');
    expect(useEditorStore.getState().tabs.length).toBe(1);
    expect(useEditorStore.getState().activeTabId).toBe('file1');

    // Close file1 -> should fallback to null
    store.closeTab('file1');
    expect(useEditorStore.getState().tabs.length).toBe(0);
    expect(useEditorStore.getState().activeTabId).toBeNull();
  });

  it('updates tab content and marks it as dirty', () => {
    const store = useEditorStore.getState();
    store.openTab({ id: 'file1', name: 'File 1', path: '/file1', type: 'xml', content: 'test1' });
    
    store.updateTabContent('file1', 'new content');
    const updatedTab = useEditorStore.getState().tabs[0];
    
    expect(updatedTab.content).toBe('new content');
    expect(updatedTab.isDirty).toBe(true);
  });
});

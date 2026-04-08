import { useElementsStore } from '@/stores/elementsStore';

describe('ElementsStore', () => {
  beforeEach(() => {
    useElementsStore.setState({ activeView: 'explorer', searchQuery: '' });
  });

  it('initializes with explorer view and empty search', () => {
    const state = useElementsStore.getState();
    expect(state.activeView).toBe('explorer');
    expect(state.searchQuery).toBe('');
  });

  it('setActiveView switches to elements view', () => {
    useElementsStore.getState().setActiveView('elements');
    expect(useElementsStore.getState().activeView).toBe('elements');
  });

  it('setActiveView switches back to explorer', () => {
    useElementsStore.getState().setActiveView('elements');
    useElementsStore.getState().setActiveView('explorer');
    expect(useElementsStore.getState().activeView).toBe('explorer');
  });

  it('setSearchQuery updates search string', () => {
    useElementsStore.getState().setSearchQuery('buff');
    expect(useElementsStore.getState().searchQuery).toBe('buff');
  });

  it('setSearchQuery can be cleared to empty string', () => {
    useElementsStore.getState().setSearchQuery('trait');
    useElementsStore.getState().setSearchQuery('');
    expect(useElementsStore.getState().searchQuery).toBe('');
  });
});

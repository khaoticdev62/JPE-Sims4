import { useProjectStore } from '../stores/projectStore';
import { ProjectFile } from '../types/project';

describe('useProjectStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useProjectStore.setState({
      projectId: null,
      projectName: null,
      projectPath: null,
      files: [],
    });
  });

  it('initially has no project loaded', () => {
    const state = useProjectStore.getState();
    expect(state.projectId).toBeNull();
    expect(state.files).toHaveLength(0);
  });

  it('can load a project', () => {
    useProjectStore.getState().loadProject('/test/path', 'Test Project');
    
    const state = useProjectStore.getState();
    expect(state.projectId).toBe('/test/path');
    expect(state.projectName).toBe('Test Project');
    expect(state.projectPath).toBe('/test/path');
  });

  it('can set files and deeply update them', () => {
    const mockFiles: ProjectFile[] = [
      {
        id: '/test/path/folder1',
        name: 'folder1',
        path: '/test/path/folder1',
        type: 'folder',
        isExpanded: false,
        children: [
          {
            id: '/test/path/folder1/file1.xml',
            name: 'file1.xml',
            path: '/test/path/folder1/file1.xml',
            type: 'xml',
          }
        ]
      }
    ];

    useProjectStore.getState().setFiles(mockFiles);
    expect(useProjectStore.getState().files[0].isExpanded).toBe(false);

    // Deep update
    useProjectStore.getState().updateFile('/test/path/folder1', { isExpanded: true });
    expect(useProjectStore.getState().files[0].isExpanded).toBe(true);

    // Ensure children remain
    expect(useProjectStore.getState().files[0].children).toHaveLength(1);
    expect(useProjectStore.getState().files[0].children?.[0].name).toBe('file1.xml');
  });
});

/**
 * ProjectExplorer unit tests
 *
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ProjectExplorer from '@/components/sidebar/ProjectExplorer'
import { useProjectStore } from '@/stores/useProjectStore'
import { useEditorStore } from '@/stores/useEditorStore'

jest.mock('@/components/file-tree/FileTree', () => {
  return function MockFileTree({ onOpenFile }: any) {
    return (
      <div data-testid="file-tree">
        <button data-testid="file-1" onClick={() => onOpenFile({ id: 'file-1', name: 'test.xml', type: 'xml' })}>
          test.xml
        </button>
        <button data-testid="file-2" onClick={() => onOpenFile({ id: 'file-2', name: 'mod.jpe', type: 'jpe' })}>
          mod.jpe
        </button>
      </div>
    )
  }
})

jest.mock('@/stores/useProjectStore', () => ({
  useProjectStore: jest.fn(),
}))

jest.mock('@/stores/useEditorStore', () => ({
  useEditorStore: jest.fn(),
}))

const mockUseProjectStore = useProjectStore as jest.MockedFunction<typeof useProjectStore>
const mockUseEditorStore = useEditorStore as jest.MockedFunction<typeof useEditorStore>

const mockProject = {
  id: 'proj-1',
  name: 'Test Project',
  rootPath: '/path/to/project',
  files: [
    { id: 'file-1', name: 'test.xml', type: 'xml', path: '/path/test.xml', content: '', isDirty: false, size: 100, lastModified: Date.now(), projectId: 'proj-1' },
    { id: 'file-2', name: 'mod.jpe', type: 'jpe', path: '/path/mod.jpe', content: '', isDirty: false, size: 200, lastModified: Date.now(), projectId: 'proj-1' },
  ],
  metadata: { createdAt: Date.now(), updatedAt: Date.now(), version: '1.0.0' },
}

const createMockProjectStore = (overrides = {}) => ({
  currentProject: mockProject,
  files: mockProject.files,
  getFile: jest.fn((id: string) => mockProject.files.find(f => f.id === id)),
  ...overrides,
})

const createMockEditorStore = (overrides = {}) => ({
  tabs: [],
  openTab: jest.fn(),
  setActiveTab: jest.fn(),
  ...overrides,
})

describe('ProjectExplorer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseProjectStore.mockReturnValue(createMockProjectStore())
    mockUseEditorStore.mockReturnValue(createMockEditorStore())
  })

  it('renders nothing when no project is loaded', () => {
    mockUseProjectStore.mockReturnValue(createMockProjectStore({ currentProject: null, files: [] }))
    render(<ProjectExplorer />)
    expect(screen.getByText('No project loaded')).toBeInTheDocument()
  })

  it('shows empty state when project has no files', () => {
    mockUseProjectStore.mockReturnValue(createMockProjectStore({
      currentProject: { ...mockProject, files: [] },
      files: [],
    }))
    render(<ProjectExplorer />)
    expect(screen.getByText('No files in project')).toBeInTheDocument()
  })

  it('renders file tree when project has files', () => {
    render(<ProjectExplorer />)
    expect(screen.getByTestId('file-tree')).toBeInTheDocument()
    expect(screen.getByText('Test Project')).toBeInTheDocument()
    expect(screen.getByText('2 files')).toBeInTheDocument()
  })

  it('opens new tab when clicking a file', () => {
    const openTab = jest.fn()
    mockUseEditorStore.mockReturnValue(createMockEditorStore({ openTab }))

    render(<ProjectExplorer />)
    fireEvent.click(screen.getByTestId('file-1'))

    expect(openTab).toHaveBeenCalledWith(
      expect.objectContaining({
        fileId: 'file-1',
        name: 'test.xml',
        isDirty: false,
      })
    )
  })

  it('activates existing tab when clicking same file', () => {
    const setActiveTab = jest.fn()
    mockUseEditorStore.mockReturnValue(createMockEditorStore({
      tabs: [{ id: 'tab-existing', fileId: 'file-1', name: 'test.xml', isDirty: false }],
      setActiveTab,
      openTab: jest.fn(),
    }))

    render(<ProjectExplorer />)
    fireEvent.click(screen.getByTestId('file-1'))

    expect(setActiveTab).toHaveBeenCalledWith('tab-existing')
  })

  it('shows project name and path', () => {
    render(<ProjectExplorer />)
    expect(screen.getByText('Test Project')).toBeInTheDocument()
    expect(screen.getByText('/path/to/project')).toBeInTheDocument()
  })
})

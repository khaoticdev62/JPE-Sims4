/**
 * AddFileDialog unit tests
 *
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AddFileDialog from '@/components/modals/AddFileDialog'
import { useProjectStore } from '@/stores/useProjectStore'
import { useEditorStore } from '@/stores/useEditorStore'
import { FileService } from '@/services/FileService'

// Mock dependencies
jest.mock('@/services/FileService', () => ({
  FileService: {
    openFile: jest.fn(),
  },
}))

jest.mock('@/stores/useProjectStore', () => ({
  useProjectStore: jest.fn(),
}))

jest.mock('@/stores/useEditorStore', () => ({
  useEditorStore: jest.fn(),
}))

const mockOpenFile = FileService.openFile as jest.MockedFunction<typeof FileService.openFile>
const mockUseProjectStore = useProjectStore as jest.MockedFunction<typeof useProjectStore>
const mockUseEditorStore = useEditorStore as jest.MockedFunction<typeof useEditorStore>

const mockProject = {
  id: 'proj-1',
  name: 'Test Project',
  rootPath: '/path/to/project',
  files: [],
  metadata: { createdAt: Date.now(), updatedAt: Date.now(), version: '1.0.0' },
}

const mockNewFile = {
  id: 'file-1',
  projectId: 'proj-1',
  name: 'test.xml',
  path: '/path/to/project/test.xml',
  type: 'xml' as const,
  content: '',
  isDirty: false,
  size: 100,
  lastModified: Date.now(),
}

const createMockProjectStore = (overrides = {}) => ({
  currentProject: mockProject,
  addFile: jest.fn().mockResolvedValue(mockNewFile),
  setError: jest.fn(),
  recentProjects: [],
  openProject: jest.fn(),
  saveFile: jest.fn(),
  saveProject: jest.fn(),
  ...overrides,
})

const createMockEditorStore = (overrides = {}) => ({
  openTab: jest.fn(),
  tabs: [],
  activeTabId: null,
  ...overrides,
})

describe('AddFileDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseProjectStore.mockReturnValue(createMockProjectStore())
    mockUseEditorStore.mockReturnValue(createMockEditorStore())
  })

  it('shows "No project loaded" when currentProject is null', () => {
    mockUseProjectStore.mockReturnValue(createMockProjectStore({ currentProject: null }))
    render(<AddFileDialog isOpen onClose={jest.fn()} />)
    expect(screen.getByText('No project loaded')).toBeInTheDocument()
    expect(screen.getByText('Create or open a project first')).toBeInTheDocument()
  })

  it('shows supported file types list', () => {
    render(<AddFileDialog isOpen onClose={jest.fn()} />)
    expect(screen.getByText('Supported Formats')).toBeInTheDocument()
    expect(screen.getByText('.xml')).toBeInTheDocument()
    expect(screen.getByText('.stbl')).toBeInTheDocument()
    expect(screen.getByText('.package')).toBeInTheDocument()
  })

  it('calls FileService.openFile when "Select Files" is clicked', async () => {
    mockOpenFile.mockResolvedValue(['/path/to/test.xml'])
    render(<AddFileDialog isOpen onClose={jest.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /select files/i }))

    await waitFor(() => {
      expect(mockOpenFile).toHaveBeenCalledTimes(1)
    })
  })

  it('shows file preview after selection', async () => {
    mockOpenFile.mockResolvedValue(['/path/to/test.xml'])
    render(<AddFileDialog isOpen onClose={jest.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /select files/i }))

    await waitFor(() => {
      expect(screen.getByText('test.xml')).toBeInTheDocument()
      expect(screen.getByText(/Selected Files/)).toBeInTheDocument()
    })
  })

  it('allows removing files from preview list', async () => {
    mockOpenFile.mockResolvedValue(['/path/to/test.xml', '/path/to/other.xml'])
    render(<AddFileDialog isOpen onClose={jest.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /select files/i }))

    await waitFor(() => {
      expect(screen.getByText('test.xml')).toBeInTheDocument()
    })

    // Remove first file (hover to show X button, then click)
    const removeButtons = screen.getAllByRole('button')
    const removeBtn = removeButtons.find((btn) => btn.getAttribute('title') === '' || btn.querySelector('svg'))
    if (removeBtn) {
      fireEvent.click(removeBtn)
    }
  })

  it('calls addFile for each selected file', async () => {
    const addFile = jest.fn().mockResolvedValue(mockNewFile)
    mockUseProjectStore.mockReturnValue(createMockProjectStore({ addFile }))
    mockOpenFile.mockResolvedValue(['/path/to/test.xml'])

    render(<AddFileDialog isOpen onClose={jest.fn()} />)

    // Select files
    fireEvent.click(screen.getByRole('button', { name: /select files/i }))

    await waitFor(() => {
      expect(screen.getByText('test.xml')).toBeInTheDocument()
    })

    // Confirm add
    fireEvent.click(screen.getByRole('button', { name: /add 1 file/i }))

    await waitFor(() => {
      expect(addFile).toHaveBeenCalledWith('/path/to/test.xml')
    })
  })

  it('opens added files in editor', async () => {
    const openTab = jest.fn()
    mockUseEditorStore.mockReturnValue(createMockEditorStore({ openTab }))
    mockOpenFile.mockResolvedValue(['/path/to/test.xml'])

    render(<AddFileDialog isOpen onClose={jest.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /select files/i }))

    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: /add 1 file/i }))
    })

    await waitFor(() => {
      expect(openTab).toHaveBeenCalledWith(
        expect.objectContaining({
          fileId: 'file-1',
          name: 'test.xml',
        })
      )
    })
  })

  it('shows error when addFile fails', async () => {
    const addFile = jest.fn().mockRejectedValue(new Error('Permission denied'))
    mockUseProjectStore.mockReturnValue(createMockProjectStore({ addFile }))
    mockOpenFile.mockResolvedValue(['/path/to/test.xml'])

    render(<AddFileDialog isOpen onClose={jest.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /select files/i }))

    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: /add 1 file/i }))
    })

    await waitFor(() => {
      expect(screen.getByText(/Permission denied/)).toBeInTheDocument()
    })
  })

  it('warns about unsupported file types', async () => {
    mockOpenFile.mockResolvedValue(['/path/to/test.exe', '/path/to/test.xml'])

    render(<AddFileDialog isOpen onClose={jest.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /select files/i }))

    await waitFor(() => {
      expect(screen.getByText(/Skipping 1 unsupported file/)).toBeInTheDocument()
    })
  })

  it('shows progress indicators during multi-file add', async () => {
    const addFile = jest.fn().mockResolvedValue(mockNewFile)
    mockUseProjectStore.mockReturnValue(createMockProjectStore({ addFile }))
    mockOpenFile.mockResolvedValue(['/path/to/a.xml', '/path/to/b.xml'])

    render(<AddFileDialog isOpen onClose={jest.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /select files/i }))

    await waitFor(() => {
      expect(screen.getByText(/Selected Files/)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /add 2 files/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
    })
  })

  it('closes dialog on successful add', async () => {
    const onClose = jest.fn()
    mockOpenFile.mockResolvedValue(['/path/to/test.xml'])

    render(<AddFileDialog isOpen onClose={onClose} />)

    fireEvent.click(screen.getByRole('button', { name: /select files/i }))

    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: /add 1 file/i }))
    })

    await waitFor(
      () => {
        expect(onClose).toHaveBeenCalled()
      },
      { timeout: 2000 }
    )
  })

  it('shows project name in header', () => {
    render(<AddFileDialog isOpen onClose={jest.fn()} />)
    expect(screen.getByText('Test Project')).toBeInTheDocument()
  })

  it('does not add files when no supported files selected', async () => {
    const addFile = jest.fn()
    mockUseProjectStore.mockReturnValue(createMockProjectStore({ addFile }))
    mockOpenFile.mockResolvedValue(['/path/to/test.exe'])

    render(<AddFileDialog isOpen onClose={jest.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /select files/i }))

    await waitFor(() => {
      const addButton = screen.getByRole('button', { name: /add 0 files/i })
      expect(addButton).toHaveAttribute('disabled')
    })
  })
})

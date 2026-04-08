/**
 * OpenProjectDialog unit tests
 *
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import OpenProjectDialog from '@/components/modals/OpenProjectDialog'
import { useProjectStore } from '@/stores/useProjectStore'
import { FileService } from '@/services/FileService'

// Mock dependencies
jest.mock('@/services/FileService', () => ({
  FileService: {
    openFolder: jest.fn(),
  },
}))

jest.mock('@/stores/useProjectStore', () => ({
  useProjectStore: jest.fn(),
}))

const mockOpenFolder = FileService.openFolder as jest.MockedFunction<typeof FileService.openFolder>
const mockUseProjectStore = useProjectStore as jest.MockedFunction<typeof useProjectStore>

const mockProject = {
  id: 'proj-1',
  name: 'Test Project',
  rootPath: '/path/to/project',
  files: [],
  metadata: { createdAt: Date.now(), updatedAt: Date.now(), version: '1.0.0' },
}

const createMockStore = (overrides = {}) => ({
  openProject: jest.fn().mockResolvedValue(undefined),
  setError: jest.fn(),
  recentProjects: [],
  currentProject: null,
  setCurrentProject: jest.fn(),
  addFile: jest.fn(),
  saveFile: jest.fn(),
  saveProject: jest.fn(),
  ...overrides,
})

describe('OpenProjectDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseProjectStore.mockReturnValue(createMockStore())
  })

  it('renders nothing when isOpen=false', () => {
    render(<OpenProjectDialog isOpen={false} onClose={jest.fn()} />)
    expect(screen.queryByText('Open Project')).not.toBeInTheDocument()
  })

  it('renders dialog when isOpen=true', () => {
    render(<OpenProjectDialog isOpen onClose={jest.fn()} />)
    expect(screen.getByText('Open Project')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /browse/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /open project/i })).toBeInTheDocument()
  })

  it('calls FileService.openFolder when Browse is clicked', async () => {
    mockOpenFolder.mockResolvedValue('/selected/path')
    render(<OpenProjectDialog isOpen onClose={jest.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /browse/i }))

    await waitFor(() => {
      expect(mockOpenFolder).toHaveBeenCalledTimes(1)
    })
  })

  it('updates path input when folder is selected', async () => {
    mockOpenFolder.mockResolvedValue('/selected/path')
    render(<OpenProjectDialog isOpen onClose={jest.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /browse/i }))

    await waitFor(() => {
      const input = screen.getByPlaceholderText('Select a folder...')
      expect(input).toHaveValue('/selected/path')
    })
  })

  it('calls openProject with selected path on submit', async () => {
    const openProject = jest.fn().mockResolvedValue(undefined)
    const onClose = jest.fn()
    mockUseProjectStore.mockReturnValue(createMockStore({ openProject }))
    mockOpenFolder.mockResolvedValue('/test/project')

    render(<OpenProjectDialog isOpen onClose={onClose} />)

    // Select folder
    fireEvent.click(screen.getByRole('button', { name: /browse/i }))

    await waitFor(() => {
      expect(mockOpenFolder).toHaveBeenCalled()
    })

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /open project/i }))

    await waitFor(() => {
      expect(openProject).toHaveBeenCalledWith('/test/project')
    })
  })

  it('closes dialog on successful open', async () => {
    const openProject = jest.fn().mockResolvedValue(undefined)
    const onClose = jest.fn()
    mockUseProjectStore.mockReturnValue(createMockStore({ openProject }))
    mockOpenFolder.mockResolvedValue('/test/path')

    render(<OpenProjectDialog isOpen onClose={onClose} />)

    fireEvent.click(screen.getByRole('button', { name: /browse/i }))

    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: /open project/i }))
    })

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled()
    })
  })

  it('shows error when openProject fails', async () => {
    const openProject = jest.fn().mockRejectedValue(new Error('Directory not found'))
    mockUseProjectStore.mockReturnValue(createMockStore({ openProject }))
    mockOpenFolder.mockResolvedValue('/nonexistent')

    render(<OpenProjectDialog isOpen onClose={jest.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /browse/i }))

    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: /open project/i }))
    })

    await waitFor(() => {
      expect(screen.getByText(/Directory Not Found/)).toBeInTheDocument()
    })
  })

  it('shows error when no path selected', async () => {
    render(<OpenProjectDialog isOpen onClose={jest.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /open project/i }))

    expect(screen.getByText('Please select a project directory')).toBeInTheDocument()
  })

  it('shows recent projects list when they exist', () => {
    const recentProjects = [
      {
        id: 'proj-1',
        name: 'Project One',
        rootPath: '/path/one',
        files: [],
        metadata: { createdAt: Date.now() - 3600000, updatedAt: Date.now() - 3600000, version: '1.0.0' },
      },
      {
        id: 'proj-2',
        name: 'Project Two',
        rootPath: '/path/two',
        files: [],
        metadata: { createdAt: Date.now() - 7200000, updatedAt: Date.now() - 7200000, version: '1.0.0' },
      },
    ]

    mockUseProjectStore.mockReturnValue(createMockStore({ recentProjects }))
    render(<OpenProjectDialog isOpen onClose={jest.fn()} />)

    expect(screen.getByText('Project One')).toBeInTheDocument()
    expect(screen.getByText('Project Two')).toBeInTheDocument()
    expect(screen.getByText(/Recent Projects/)).toBeInTheDocument()
  })

  it('calls openProject when clicking a recent project', async () => {
    const openProject = jest.fn().mockResolvedValue(undefined)
    const recentProjects = [mockProject]
    mockUseProjectStore.mockReturnValue(createMockStore({ openProject, recentProjects }))

    const { rerender: _rerender } = render(<OpenProjectDialog isOpen onClose={jest.fn()} />)

    // Click on recent project
    fireEvent.click(screen.getByText('Test Project'))

    await waitFor(() => {
      expect(openProject).toHaveBeenCalledWith('/path/to/project')
    })
  })

  it('limits recent projects list to 5 items', () => {
    const recentProjects = Array.from({ length: 10 }, (_, i) => ({
      id: `proj-${i}`,
      name: `Project ${i}`,
      rootPath: `/path/${i}`,
      files: [],
      metadata: { createdAt: Date.now(), updatedAt: Date.now(), version: '1.0.0' },
    }))

    mockUseProjectStore.mockReturnValue(createMockStore({ recentProjects }))
    render(<OpenProjectDialog isOpen onClose={jest.fn()} />)

    expect(screen.getByText('Project 0')).toBeInTheDocument()
    expect(screen.getByText('Project 4')).toBeInTheDocument()
    expect(screen.queryByText('Project 5')).not.toBeInTheDocument()
  })

  it('disables buttons while loading', async () => {
    const openProject = jest.fn(
      () => new Promise((resolve) => setTimeout(resolve, 500))
    )
    mockUseProjectStore.mockReturnValue(createMockStore({ openProject }))
    mockOpenFolder.mockResolvedValue('/test/path')

    render(<OpenProjectDialog isOpen onClose={jest.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /browse/i }))

    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: /open project/i }))
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()
    })
  })
})

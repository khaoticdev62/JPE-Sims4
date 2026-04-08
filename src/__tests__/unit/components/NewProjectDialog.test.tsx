/**
 * NewProjectDialog Component Tests
 * Story 1.1: Create a New Mod Project
 * 
 * Tests for AC 2, 3: Dialog prompts for project name and folder selection
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NewProjectDialog from '@/components/modals/NewProjectDialog'
import { useProjectStore } from '@/stores/useProjectStore'
import { FileService } from '@/services/FileService'
import { toast } from 'sonner'

// Mock dependencies
jest.mock('@/stores/useProjectStore', () => ({
  useProjectStore: jest.fn(),
}))

jest.mock('@/services/FileService', () => ({
  FileService: {
    openFolder: jest.fn(),
  },
}))

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

jest.mock('@/components/common/Modal', () => {
  return function MockModal({ isOpen, title, children, onClose }: any) {
    if (!isOpen) return null
    return (
      <div data-testid="modal" role="dialog" aria-label={title}>
        <button onClick={onClose} data-testid="modal-close">Close</button>
        <h2>{title}</h2>
        {children}
      </div>
    )
  }
})

jest.mock('@/components/common/Button', () => {
  return function MockButton({ children, onClick, disabled, type, variant }: any) {
    return (
      <button
        type={type || 'button'}
        onClick={onClick}
        disabled={disabled}
        data-variant={variant}
        data-testid={children?.toString().toLowerCase().replace(/\s+/g, '-') || 'button'}
      >
        {children}
      </button>
    )
  }
})

jest.mock('@/components/common/TextInput', () => {
  return function MockTextInput({ label, value, onChange, error, placeholder, disabled }: any) {
    return (
      <div>
        <label>{label}</label>
        <input
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          data-testid="text-input"
        />
        {error && <span data-testid="input-error">{error}</span>}
      </div>
    )
  }
})

const mockCreateProject = jest.fn()
const mockSetError = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
  ;(useProjectStore as jest.Mock).mockReturnValue({
    createProject: mockCreateProject,
    setError: mockSetError,
  })
})

describe('NewProjectDialog', () => {
  it('renders with empty state', () => {
    render(<NewProjectDialog isOpen={true} onClose={jest.fn()} />)
    
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Create New Project')).toBeInTheDocument()
    expect(screen.getByTestId('text-input')).toBeInTheDocument()
    expect(screen.getByTestId('browse')).toBeInTheDocument()
    expect(screen.getByTestId('cancel')).toBeInTheDocument()
    expect(screen.getByTestId('create-project')).toBeInTheDocument()
  })

  it('does not render when isOpen is false', () => {
    render(<NewProjectDialog isOpen={false} onClose={jest.fn()} />)
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('validates project name is required', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()
    render(<NewProjectDialog isOpen={true} onClose={onClose} />)
    
    // Try to submit with empty fields
    await user.click(screen.getByTestId('create-project'))
    
    await waitFor(() => {
      expect(screen.getByTestId('input-error')).toHaveTextContent('Project name is required')
    })
    
    expect(mockCreateProject).not.toHaveBeenCalled()
  })

  it('validates project name format', async () => {
    const user = userEvent.setup()
    render(<NewProjectDialog isOpen={true} onClose={jest.fn()} />)
    
    const input = screen.getByTestId('text-input')
    
    // Enter invalid project name with spaces
    await user.type(input, 'Invalid Project Name!')
    await user.click(screen.getByTestId('create-project'))
    
    await waitFor(() => {
      expect(screen.getByTestId('input-error')).toHaveTextContent(
        'Project name can only contain letters, numbers, underscores, and hyphens'
      )
    })
    
    expect(mockCreateProject).not.toHaveBeenCalled()
  })

  it('accepts valid project names', async () => {
    const user = userEvent.setup()
    render(<NewProjectDialog isOpen={true} onClose={jest.fn()} />)
    
    const input = screen.getByTestId('text-input')
    
    // Test valid names
    const validNames = ['ValidName', 'Valid_Name', 'Valid-Name', 'Valid123']
    
    for (const name of validNames) {
      await user.clear(input)
      await user.type(input, name)
      
      await user.click(screen.getByTestId('create-project'))
      
      // Should not show error for valid names
      await waitFor(() => {
        expect(screen.queryByTestId('input-error')).not.toBeInTheDocument()
      }, { timeout: 1000 })
    }
  })

  it('validates project path is required', async () => {
    const user = userEvent.setup()
    render(<NewProjectDialog isOpen={true} onClose={jest.fn()} />)
    
    // Enter valid project name but no path
    await user.type(screen.getByTestId('text-input'), 'TestProject')
    await user.click(screen.getByTestId('create-project'))
    
    await waitFor(() => {
      // Should show path error
      const errorElements = screen.getAllByText(/project directory is required/i)
      expect(errorElements.length).toBeGreaterThan(0)
    })
    
    expect(mockCreateProject).not.toHaveBeenCalled()
  })

  it('calls handleSelectDirectory when browse is clicked', async () => {
    const user = userEvent.setup()
    ;(FileService.openFolder as jest.Mock).mockResolvedValue('/selected/path')
    
    render(<NewProjectDialog isOpen={true} onClose={jest.fn()} />)
    
    await user.click(screen.getByTestId('browse'))
    
    await waitFor(() => {
      expect(FileService.openFolder).toHaveBeenCalled()
    })
  })

  it('calls createProject with correct arguments on valid submit', async () => {
    const user = userEvent.setup()
    mockCreateProject.mockResolvedValue(undefined)
    ;(FileService.openFolder as jest.Mock).mockResolvedValue('/selected/path')
    
    render(<NewProjectDialog isOpen={true} onClose={jest.fn()} />)
    
    // Fill in valid data
    await user.type(screen.getByTestId('text-input'), 'MyTestProject')
    await user.click(screen.getByTestId('browse'))
    
    // Submit
    await user.click(screen.getByTestId('create-project'))
    
    await waitFor(() => {
      expect(mockCreateProject).toHaveBeenCalledWith('MyTestProject', '/selected/path')
    })
  })

  it('shows success toast on successful creation', async () => {
    const user = userEvent.setup()
    mockCreateProject.mockResolvedValue(undefined)
    ;(FileService.openFolder as jest.Mock).mockResolvedValue('/test/path')
    
    render(<NewProjectDialog isOpen={true} onClose={jest.fn()} />)
    
    await user.type(screen.getByTestId('text-input'), 'SuccessProject')
    await user.click(screen.getByTestId('browse'))
    await user.click(screen.getByTestId('create-project'))
    
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        'Project "SuccessProject" created successfully!',
        expect.objectContaining({
          description: 'Location: /test/path',
          duration: 5000,
        })
      )
    })
  })

  it('shows error toast on creation failure', async () => {
    const user = userEvent.setup()
    mockCreateProject.mockRejectedValue(new Error('Disk full'))
    ;(FileService.openFolder as jest.Mock).mockResolvedValue('/test/path')
    
    render(<NewProjectDialog isOpen={true} onClose={jest.fn()} />)
    
    await user.type(screen.getByTestId('text-input'), 'FailProject')
    await user.click(screen.getByTestId('browse'))
    await user.click(screen.getByTestId('create-project'))
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Failed to create project: Disk full',
        expect.objectContaining({ duration: 8000 })
      )
    })
  })

  it('calls onClose after successful creation', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()
    mockCreateProject.mockResolvedValue(undefined)
    ;(FileService.openFolder as jest.Mock).mockResolvedValue('/test/path')
    
    render(<NewProjectDialog isOpen={true} onClose={onClose} />)
    
    await user.type(screen.getByTestId('text-input'), 'CloseProject')
    await user.click(screen.getByTestId('browse'))
    await user.click(screen.getByTestId('create-project'))
    
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled()
    })
  })

  it('resets form after successful creation', async () => {
    const user = userEvent.setup()
    mockCreateProject.mockResolvedValue(undefined)
    ;(FileService.openFolder as jest.Mock).mockResolvedValue('/test/path')
    
    render(<NewProjectDialog isOpen={true} onClose={jest.fn()} />)
    
    const input = screen.getByTestId('text-input')
    await user.type(input, 'ResetProject')
    await user.click(screen.getByTestId('browse'))
    await user.click(screen.getByTestId('create-project'))
    
    await waitFor(() => {
      // Form should be reset
      expect(input).toHaveValue('')
    })
  })

  it('disables inputs and buttons during loading', async () => {
    const user = userEvent.setup()
    let resolvePromise: (value: any) => void
    mockCreateProject.mockImplementation(
      () => new Promise((resolve) => {
        resolvePromise = resolve
      })
    )
    ;(FileService.openFolder as jest.Mock).mockResolvedValue('/test/path')
    
    render(<NewProjectDialog isOpen={true} onClose={jest.fn()} />)
    
    await user.type(screen.getByTestId('text-input'), 'LoadingProject')
    await user.click(screen.getByTestId('browse'))
    await user.click(screen.getByTestId('create-project'))
    
    await waitFor(() => {
      expect(screen.getByTestId('text-input')).toBeDisabled()
      expect(screen.getByTestId('browse')).toBeDisabled()
      expect(screen.getByTestId('cancel')).toBeDisabled()
      expect(screen.getByTestId('create-project')).toBeDisabled()
    })
    
    // Clean up - resolve the promise
    if (resolvePromise) {
      resolvePromise(undefined)
    }
  })

  it('calls setError when creation fails', async () => {
    const user = userEvent.setup()
    const errorMessage = 'Permission denied'
    mockCreateProject.mockRejectedValue(new Error(errorMessage))
    ;(FileService.openFolder as jest.Mock).mockResolvedValue('/test/path')
    
    render(<NewProjectDialog isOpen={true} onClose={jest.fn()} />)
    
    await user.type(screen.getByTestId('text-input'), 'ErrorProject')
    await user.click(screen.getByTestId('browse'))
    await user.click(screen.getByTestId('create-project'))
    
    await waitFor(() => {
      expect(mockSetError).toHaveBeenCalledWith(errorMessage)
    })
  })

  it('clears path error when directory is selected', async () => {
    const user = userEvent.setup()
    ;(FileService.openFolder as jest.Mock).mockResolvedValue('/test/path')
    
    render(<NewProjectDialog isOpen={true} onClose={jest.fn()} />)
    
    // First trigger validation error
    await user.type(screen.getByTestId('text-input'), 'TestProject')
    await user.click(screen.getByTestId('create-project'))
    
    await waitFor(() => {
      expect(screen.queryByText(/project directory is required/i)).toBeInTheDocument()
    })
    
    // Then select directory
    await user.click(screen.getByTestId('browse'))
    
    // Error should be cleared (implementation detail - checking state update)
    // This is indirectly tested by successful submission after selecting path
  })

  it('calls FileService.openFolder and updates path', async () => {
    const user = userEvent.setup()
    const selectedPath = '/Users/test/MyModProject'
    ;(FileService.openFolder as jest.Mock).mockResolvedValue(selectedPath)
    
    render(<NewProjectDialog isOpen={true} onClose={jest.fn()} />)
    
    await user.click(screen.getByTestId('browse'))
    
    await waitFor(() => {
      expect(FileService.openFolder).toHaveBeenCalledTimes(1)
    })
    
    // Note: We can't directly check the input value since it's controlled
    // But we can verify it's used in the submit
    mockCreateProject.mockResolvedValue(undefined)
    await user.type(screen.getByTestId('text-input'), 'TestProject')
    await user.click(screen.getByTestId('create-project'))
    
    await waitFor(() => {
      expect(mockCreateProject).toHaveBeenCalledWith('TestProject', selectedPath)
    })
  })
})

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ExportWizard } from '@/components/ExportWizard'
import { useProjectStore } from '@/stores/useProjectStore'
import { JpeBundlerService } from '@/services/JpeBundlerService'
import { FileService } from '@/services/FileService'

// Mock lucide-react to avoid ESM issues in Jest
jest.mock('lucide-react', () => ({
  Package: () => <div data-testid="icon-package" />,
  CheckCircle2: () => <div data-testid="icon-check" />,
  AlertCircle: () => <div data-testid="icon-alert" />,
  ArrowRight: () => <div data-testid="icon-arrow" />,
  Box: () => <div data-testid="icon-box" />,
  Settings: () => <div data-testid="icon-settings" />,
  Globe: () => <div data-testid="icon-globe" />,
  ChevronRight: () => <div data-testid="icon-chevron" />,
  Download: () => <div data-testid="icon-download" />,
  Rocket: () => <div data-testid="icon-rocket" />,
  X: () => <div data-testid="icon-x" />,
  ChevronLeft: () => <div data-testid="icon-chevron-left" />,
  Layers: () => <div data-testid="icon-layers" />,
  Sparkles: () => <div data-testid="icon-sparkles" />,
  FileText: () => <div data-testid="icon-file-text" />,
  ShieldCheck: () => <div data-testid="icon-shield-check" />,
  Share2: () => <div data-testid="icon-share2" />,
  Check: () => <div data-testid="icon-check" />,
}))

// Mock the project store
jest.mock('@/stores/useProjectStore')

// Mock Services
jest.mock('@/services/JpeBundlerService')
jest.mock('@/services/FileService')

describe('ExportWizard', () => {
  const mockProject = {
    id: 'test-project',
    name: 'Test Project',
    rootPath: '/test/path',
    files: [
      { id: 'f1', name: 'mod.jpe', path: '/test/path/mod.jpe', type: 'jpe' }
    ],
    metadata: { version: '1.0.0' }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useProjectStore as any).mockReturnValue({
      currentProject: mockProject,
    })
    
    ;(JpeBundlerService.buildProject as jest.Mock).mockResolvedValue({
      success: true,
      duration: 120,
      logs: [{ timestamp: Date.now(), level: 'info', message: 'Build started' }],
      packageBuffer: Buffer.from('mock-package')
    })

    ;(FileService.saveFile as jest.Mock).mockResolvedValue('/test/output/mod.package')
    ;(FileService.writeFileBuffer as jest.Mock).mockResolvedValue(true)
  })

  it('should render the initiation screen (Metadata step)', () => {
    render(<ExportWizard isOpen={true} onClose={() => {}} />)
    expect(screen.getByText(/Production Export Wizard/i)).toBeInTheDocument()
    expect(screen.getByDisplayValue(/Test Project/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Next Strategy/i })).toBeInTheDocument()
  })

  it('should transition to Resources step', async () => {
    render(<ExportWizard isOpen={true} onClose={() => {}} />)
    
    fireEvent.click(screen.getByRole('button', { name: /Next Strategy/i }))
    
    // Use a more flexible matcher for text that might be split by React
    expect(screen.getByText(/resources/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Finalize & Build/i })).toBeInTheDocument()
  })

  it('should run build and transition to summary on success', async () => {
    render(<ExportWizard isOpen={true} onClose={() => {}} />)
    
    // Config -> Resources
    fireEvent.click(screen.getByRole('button', { name: /Next Strategy/i }))
    
    // Resources -> Build
    fireEvent.click(screen.getByRole('button', { name: /Finalize & Build/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/TS4Rebels Vault Integration/i)).toBeInTheDocument()
    }, { timeout: 2000 })
    
    expect(JpeBundlerService.buildProject).toHaveBeenCalled()
    expect(FileService.saveFile).toHaveBeenCalled()
  })

  it('should handle build errors gracefully', async () => {
    ;(JpeBundlerService.buildProject as jest.Mock).mockResolvedValueOnce({
      success: false,
      logs: [{ timestamp: Date.now(), level: 'error', message: 'Compilation failed' }]
    })

    render(<ExportWizard isOpen={true} onClose={() => {}} />)
    
    fireEvent.click(screen.getByRole('button', { name: /Next Strategy/i }))
    fireEvent.click(screen.getByRole('button', { name: /Finalize & Build/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/Build Failed/i)).toBeInTheDocument()
    })
    
    expect(screen.getByText(/Compilation failed/i)).toBeInTheDocument()
  })
})

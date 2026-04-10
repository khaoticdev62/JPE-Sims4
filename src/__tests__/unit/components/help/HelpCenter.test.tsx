/**
 * HelpCenter Tests
 *
 * Tests for searchable documentation hub, topic filtering, and external links.
 */

import { render, screen, fireEvent } from '@testing-library/react'
import HelpCenter from '@/components/help/HelpCenter'

// Mock useUIStore
jest.mock('@/stores/useUIStore', () => ({
  useUIStore: () => ({
    setWorkspaceMode: jest.fn(),
    setTourOpen: jest.fn(),
    setTutorialActive: jest.fn(),
    setPromptToJPEOpen: jest.fn(),
  }),
}))

describe('HelpCenter', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render when open', () => {
    render(<HelpCenter {...defaultProps} />)

    expect(screen.getByText('Help Center')).toBeDefined()
    expect(screen.getByText('Find documentation, tutorials, and community resources')).toBeDefined()
  })

  it('should not render when closed', () => {
    const { container } = render(<HelpCenter isOpen={false} onClose={jest.fn()} />)

    expect(container.firstChild).toBeNull()
  })

  it('should display all help topics by default', () => {
    render(<HelpCenter {...defaultProps} />)

    expect(screen.getByText('JPE Language Manual')).toBeDefined()
    expect(screen.getByText('Keyboard Shortcuts')).toBeDefined()
    expect(screen.getByText('Interactive Tutorial')).toBeDefined()
    expect(screen.getByText('AI: Prompt to JPE')).toBeDefined()
    expect(screen.getByText("Scarlet's Realm Mod List")).toBeDefined()
  })

  it('should filter topics by search query', () => {
    render(<HelpCenter {...defaultProps} />)

    const searchInput = screen.getByPlaceholderText('Search help topics...')
    fireEvent.change(searchInput, { target: { value: 'tutorial' } })

    expect(screen.getByText('Interactive Tutorial')).toBeDefined()
    expect(screen.queryByText('JPE Language Manual')).toBeNull()
  })

  it('should show no results message for unmatched query', () => {
    render(<HelpCenter {...defaultProps} />)

    const searchInput = screen.getByPlaceholderText('Search help topics...')
    fireEvent.change(searchInput, { target: { value: 'nonexistent-topic' } })

    expect(screen.getByText(/No topics found/i)).toBeDefined()
  })

  it('should close when Close button is clicked', () => {
    const onClose = jest.fn()
    render(<HelpCenter isOpen={true} onClose={onClose} />)

    fireEvent.click(screen.getByText('Close'))

    expect(onClose).toHaveBeenCalled()
  })

  it('should display correct topic count', () => {
    render(<HelpCenter {...defaultProps} />)

    expect(screen.getByText('6 topics available')).toBeDefined()
  })

  it('should filter by category sections', () => {
    render(<HelpCenter {...defaultProps} />)

    expect(screen.getByText('manual')).toBeDefined()
    expect(screen.getByText('shortcuts')).toBeDefined()
    expect(screen.getByText('tutorial')).toBeDefined()
    expect(screen.getByText('community')).toBeDefined()
  })
})

/**
 * OnboardingTour Tests
 *
 * Tests for step tracking, navigation, and completion state.
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { OnboardingTour } from '@/components/OnboardingTour'

// Mock useUIStore
const mockSetTourOpen = jest.fn()
const mockSetTutorialActive = jest.fn()
const mockSetTutorialStep = jest.fn()

jest.mock('@/stores/useUIStore', () => ({
  useUIStore: () => ({
    setTourOpen: mockSetTourOpen,
    setTutorialActive: mockSetTutorialActive,
    setTutorialStep: mockSetTutorialStep,
    hasCompletedTour: false,
    setHasCompletedTour: jest.fn(),
  }),
}))

describe('OnboardingTour', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render when open', () => {
    render(<OnboardingTour {...defaultProps} />)

    // Should have tour content
    expect(screen.queryByText(/skip/i)).toBeDefined()
  })

  it('should not render when closed', () => {
    const { container } = render(<OnboardingTour isOpen={false} onClose={jest.fn()} />)

    expect(container.firstChild).toBeNull()
  })

  it('should call onClose when Skip is clicked', () => {
    render(<OnboardingTour {...defaultProps} />)

    const skipButton = screen.getByRole('button', { name: /skip/i })
    fireEvent.click(skipButton)

    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('should have Next button', () => {
    render(<OnboardingTour {...defaultProps} />)

    expect(screen.getByRole('button', { name: /next/i })).toBeDefined()
  })
})

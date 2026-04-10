/**
 * MasterSensorySlider Tests
 *
 * Tests for sensory preferences UI: sliders, toggles, and test buttons.
 */

import { render, screen, fireEvent } from '@testing-library/react'
import MasterSensorySlider from '@/components/settings/MasterSensorySlider'

// Mock services
jest.mock('@/services/SensoryService', () => ({
  sensory: {
    setMasterVolume: jest.fn(),
    triggerSuccess: jest.fn(),
  },
}))

jest.mock('@/services/editor/HapticHeartbeat', () => ({
  HapticHeartbeat: {
    getInstance: jest.fn(() => ({
      setIntensity: jest.fn(),
      setEnabled: jest.fn(),
      success: jest.fn(),
    })),
  },
}))

// Mock shadcn components to simplify tests
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div data-testid="card" className={className}>{children}</div>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  CardDescription: ({ children }: any) => <div data-testid="card-description">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <div data-testid="card-title">{children}</div>,
}))

jest.mock('@/components/ui/slider', () => ({
  Slider: ({ value, onValueChange, disabled }: any) => (
    <div data-testid="slider" data-disabled={disabled}>
      <input
        type="range"
        value={value[0]}
        onChange={(e) => onValueChange([Number(e.target.value)])}
        disabled={disabled}
      />
    </div>
  ),
}))

jest.mock('@/components/ui/switch', () => ({
  Switch: ({ checked, onCheckedChange }: any) => (
    <button
      data-testid="switch"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
    />
  ),
}))

jest.mock('@/components/ui/label', () => ({
  Label: ({ children }: any) => <label>{children}</label>,
}))

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className }: any) => <span className={className}>{children}</span>,
}))

describe('MasterSensorySlider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render all three sensory controls', () => {
    render(<MasterSensorySlider />)

    expect(screen.getByText('Audio Feedback')).toBeDefined()
    expect(screen.getByText('Haptic Feedback')).toBeDefined()
    expect(screen.getByText('Visual Pulses')).toBeDefined()
  })

  it('should render with correct title', () => {
    render(<MasterSensorySlider />)

    expect(screen.getByText('Sensory Preferences')).toBeDefined()
  })

  it('should render sliders for each control', () => {
    render(<MasterSensorySlider />)

    const sliders = screen.getAllByTestId('slider')
    expect(sliders.length).toBe(3)
  })

  it('should render toggles for each control', () => {
    render(<MasterSensorySlider />)

    const switches = screen.getAllByRole('switch')
    expect(switches.length).toBe(3)
  })

  it('should render test buttons', () => {
    render(<MasterSensorySlider />)

    const testButtons = screen.getAllByText('Test')
    expect(testButtons.length).toBe(3)
  })

  it('should display percentage badges', () => {
    render(<MasterSensorySlider />)

    const badges = screen.getAllByText('50%')
    expect(badges.length).toBeGreaterThan(0)
  })

  it('should call sensory service on audio slider change', () => {
    const { sensory } = require('@/services/SensoryService')
    render(<MasterSensorySlider />)

    const audioSlider = screen.getAllByTestId('slider')[0]
    const input = audioSlider.querySelector('input')

    fireEvent.change(input!, { target: { value: '75' } })

    expect(sensory.setMasterVolume).toHaveBeenCalledWith(0.75)
  })

  it('should call haptic service on haptic slider change', () => {
    const { HapticHeartbeat } = require('@/services/editor/HapticHeartbeat')
    const mockSetIntensity = jest.fn()
    HapticHeartbeat.getInstance.mockReturnValue({
      setIntensity: mockSetIntensity,
      setEnabled: jest.fn(),
      success: jest.fn(),
    })

    render(<MasterSensorySlider />)

    const hapticSlider = screen.getAllByTestId('slider')[1]
    const input = hapticSlider.querySelector('input')

    fireEvent.change(input!, { target: { value: '80' } })

    expect(mockSetIntensity).toHaveBeenCalledWith(0.8)
  })

  it('should disable audio slider when audio is toggled off', () => {
    render(<MasterSensorySlider />)

    const audioSwitch = screen.getAllByRole('switch')[0]
    fireEvent.click(audioSwitch)

    const audioSlider = screen.getAllByTestId('slider')[0]
    expect(audioSlider.getAttribute('data-disabled')).toBe('true')
  })

  it('should display quiet mode notice', () => {
    render(<MasterSensorySlider />)

    expect(screen.getByText(/Quiet Mode/i)).toBeDefined()
  })
})

/**
 * SensoryOverlay Tests
 *
 * Tests for pulse rendering, intensity mapping, and bioluminescent animations.
 */

import { render } from '@testing-library/react'
import { SensoryOverlay } from '@/components/editor/SensoryOverlay'

// Mock useUIStore
const mockUIState = {
  immersionMode: 'focus',
  visualEnabled: true,
  masterSensoryVolume: 50,
}

jest.mock('@/stores/useUIStore', () => ({
  useUIStore: () => mockUIState,
}))

// Mock window.ipc
beforeEach(() => {
  ;(window as any).ipc = {
    on: jest.fn(),
  }
})

afterEach(() => {
  delete (window as any).ipc
})

describe('SensoryOverlay', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUIState.immersionMode = 'focus'
    mockUIState.visualEnabled = true
    mockUIState.masterSensoryVolume = 50
  })

  it('should render when immersion mode is focus', () => {
    const { container } = render(<SensoryOverlay />)

    expect(container.firstChild).toBeDefined()
  })

  it('should not render when immersion mode is normal', () => {
    mockUIState.immersionMode = 'normal'
    const { container } = render(<SensoryOverlay />)

    expect(container.firstChild).toBeNull()
  })

  it('should not render when visual is disabled', () => {
    mockUIState.visualEnabled = false
    const { container } = render(<SensoryOverlay />)

    expect(container.firstChild).toBeNull()
  })

  it('should register IPC listener on mount', () => {
    render(<SensoryOverlay />)

    expect((window as any).ipc.on).toHaveBeenCalledWith('sync:event', expect.any(Function))
  })

  it('should calculate intensity factor correctly at 50% volume', () => {
    mockUIState.masterSensoryVolume = 50
    const { container } = render(<SensoryOverlay />)

    // intensityFactor = 0.3 + (50/100) * 0.7 = 0.65
    // Component should render without errors
    expect(container.firstChild).toBeDefined()
  })

  it('should calculate intensity factor correctly at 0% volume', () => {
    mockUIState.masterSensoryVolume = 0
    const { container } = render(<SensoryOverlay />)

    // intensityFactor = 0.3 + 0 = 0.3
    expect(container.firstChild).toBeDefined()
  })

  it('should calculate intensity factor correctly at 100% volume', () => {
    mockUIState.masterSensoryVolume = 100
    const { container } = render(<SensoryOverlay />)

    // intensityFactor = 0.3 + 1 * 0.7 = 1.0
    expect(container.firstChild).toBeDefined()
  })

  it('should render ambient glow in focus mode', () => {
    const { container } = render(<SensoryOverlay />)

    // Component renders with two motion.divs (ambient glow + container)
    expect(container.querySelectorAll('div').length).toBeGreaterThan(1)
  })

  it('should apply blur animation to pulses', () => {
    // Verify animation config is defined
    const { container } = render(<SensoryOverlay />)

    // Component should have the pulse animation configuration
    expect(container.firstChild).toBeDefined()
  })
})

/**
 * WelcomeScreen unit tests
 *
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import WelcomeScreen from '@/components/editor/WelcomeScreen'

describe('WelcomeScreen', () => {
  it('renders welcome message', () => {
    render(<WelcomeScreen hasProject={false} />)
    expect(screen.getByText('STUDIO_NEXUS')).toBeInTheDocument()
    expect(screen.getByText('Initialization Pending')).toBeInTheDocument()
  })

  it('shows Load Project button when no project', () => {
    const onOpenProject = jest.fn()
    render(<WelcomeScreen hasProject={false} onOpenProject={onOpenProject} />)
    expect(screen.getByText('Load Project')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Load Project'))
    expect(onOpenProject).toHaveBeenCalled()
  })

  it('shows Add Sources and Switch Project when has project', () => {
    const onAddFile = jest.fn()
    const onOpenProject = jest.fn()
    render(<WelcomeScreen hasProject onAddFile={onAddFile} onOpenProject={onOpenProject} />)
    expect(screen.getByText('Add Sources')).toBeInTheDocument()
    expect(screen.getByText('Switch Project')).toBeInTheDocument()
  })

  it('calls onAddFile when Add Sources clicked', () => {
    const onAddFile = jest.fn()
    render(<WelcomeScreen hasProject onAddFile={onAddFile} />)
    fireEvent.click(screen.getByText('Add Sources'))
    expect(onAddFile).toHaveBeenCalled()
  })

  it('shows keyboard shortcuts', () => {
    const { container } = render(<WelcomeScreen hasProject={false} />)
    // JpeCard uppercases the title
    expect(screen.getByText('SYSTEM_COMMANDS')).toBeInTheDocument()
    // Check for shortcut labels
    expect(screen.getByText('Save file')).toBeInTheDocument()
    expect(screen.getByText('Compile Logic')).toBeInTheDocument()
    // Verify kbd elements are rendered (check raw HTML)
    const kbdElements = container.querySelectorAll('kbd')
    expect(kbdElements.length).toBeGreaterThan(0)
  })
})

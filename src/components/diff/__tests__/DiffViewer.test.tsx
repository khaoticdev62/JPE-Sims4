import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import DiffViewer from '../DiffViewer'

describe('DiffViewer', () => {
  const leftContent = 'line 1\nline 2\nline 3'
  const rightContent = 'line 1\nline 2 modified\nline 3\nline 4 added'

  it('renders correctly in side-by-side mode', () => {
    render(<DiffViewer leftContent={leftContent} rightContent={rightContent} />)
    
    // Check for labels
    expect(screen.getByText('Original')).toBeDefined()
    expect(screen.getByText('Modified')).toBeDefined()
    
    // Check for change count (2 changes: 1 modification + 1 addition)
    // My simple algorithm marks modification as 1 remove + 1 add
    expect(screen.getByText(/3 changes detected/i)).toBeDefined()
  })

  it('switches between view modes', () => {
    render(<DiffViewer leftContent={leftContent} rightContent={rightContent} />)
    
    const inlineButton = screen.getByTitle('Inline View')
    fireEvent.click(inlineButton)
    
    // In inline mode, labels are usually hidden or different
    // Check if inline view specific elements exist (markers)
    expect(screen.getAllByText('+').length).toBeGreaterThan(0)
    expect(screen.getAllByText('-').length).toBeGreaterThan(0)
  })

  it('handles navigation between changes', () => {
    render(<DiffViewer leftContent={leftContent} rightContent={rightContent} />)
    
    const nextButton = screen.getByTitle(/Next Change/i)
    expect(nextButton).toBeDefined()
    
    fireEvent.click(nextButton)
    expect(screen.getByText(/2 \/ 3/)).toBeDefined()
  })
})

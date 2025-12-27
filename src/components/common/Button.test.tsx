import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from './Button'

describe('Button Component', () => {
  describe('rendering', () => {
    it('should render button with children text', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
    })

    it('should render with default variant (primary)', () => {
      render(<Button>Primary</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-accent-primary')
    })

    it('should render with secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-bg-secondary')
    })

    it('should render with danger variant', () => {
      render(<Button variant="danger">Delete</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-state-error')
    })

    it('should render with ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('text-text-primary')
    })

    it('should render with default size (md)', () => {
      render(<Button>Medium</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('px-4', 'py-2', 'text-sm')
    })

    it('should render with small size', () => {
      render(<Button size="sm">Small</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('px-3', 'py-1', 'text-xs')
    })

    it('should render with large size', () => {
      render(<Button size="lg">Large</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('px-6', 'py-3', 'text-base')
    })

    it('should accept custom className', () => {
      render(<Button className="custom-class">Styled</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
    })
  })

  describe('loading state', () => {
    it('should show loading text when isLoading is true', () => {
      render(<Button isLoading>Submit</Button>)
      expect(screen.getByText(/⏳ Loading.../)).toBeInTheDocument()
    })

    it('should disable button when isLoading is true', () => {
      render(<Button isLoading>Submit</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should show original text when isLoading is false', () => {
      render(<Button isLoading={false}>Submit</Button>)
      expect(screen.getByText('Submit')).toBeInTheDocument()
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    })
  })

  describe('disabled state', () => {
    it('should disable button when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should apply disabled styles', () => {
      render(<Button disabled>Disabled</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('opacity-60', 'cursor-not-allowed')
    })

    it('should apply disabled styles when isLoading is true', () => {
      render(<Button isLoading>Loading</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('opacity-60', 'cursor-not-allowed')
    })
  })

  describe('interactions', () => {
    it('should handle click events', async () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Click</Button>)

      const user = userEvent.setup()
      const button = screen.getByRole('button')

      await user.click(button)
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should not trigger click when disabled', async () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick} disabled>Disabled</Button>)

      const user = userEvent.setup()
      const button = screen.getByRole('button')

      await user.click(button)
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('should not trigger click when isLoading', async () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick} isLoading>Loading</Button>)

      const user = userEvent.setup()
      const button = screen.getByRole('button')

      await user.click(button)
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('should handle keyboard events', async () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Keyboard</Button>)

      const user = userEvent.setup()
      const button = screen.getByRole('button')

      button.focus()
      await user.keyboard('{Enter}')
      expect(handleClick).toHaveBeenCalled()
    })
  })

  describe('accessibility', () => {
    it('should be keyboard accessible', () => {
      render(<Button>Accessible</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'submit') || expect(button).toHaveAttribute('type', 'button')
    })

    it('should have focus styles', () => {
      render(<Button>Focus</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2')
    })

    it('should support aria-label', () => {
      render(<Button aria-label="Close dialog">×</Button>)
      const button = screen.getByLabelText('Close dialog')
      expect(button).toBeInTheDocument()
    })

    it('should have transition classes for better UX', () => {
      render(<Button>Transition</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('transition-all', 'duration-200')
    })
  })

  describe('combinations', () => {
    it('should render with all props combined', () => {
      const handleClick = vi.fn()
      render(
        <Button
          variant="danger"
          size="lg"
          onClick={handleClick}
          aria-label="Delete item"
          className="custom-danger"
        >
          Delete
        </Button>
      )

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-state-error', 'px-6', 'py-3', 'custom-danger')
      expect(button).not.toBeDisabled()
    })

    it('should combine size and variant styles correctly', () => {
      render(
        <Button variant="secondary" size="sm">
          Small Secondary
        </Button>
      )

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-bg-secondary', 'px-3', 'py-1')
    })
  })
})

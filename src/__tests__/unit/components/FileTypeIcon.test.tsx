/**
 * FileTypeIcon unit tests
 *
 * @jest-environment jsdom
 */

import React from 'react'
import { render } from '@testing-library/react'
import { FileTypeIcon } from '@/components/file-tree/FileTypeIcon'

jest.mock('lucide-react', () => ({
  FileCode: (props: any) => <svg data-icon="FileCode" {...props} />,
  Languages: (props: any) => <svg data-icon="Languages" {...props} />,
  Code2: (props: any) => <svg data-icon="Code2" {...props} />,
  Package: (props: any) => <svg data-icon="Package" {...props} />,
  FileText: (props: any) => <svg data-icon="FileText" {...props} />,
  FileJson: (props: any) => <svg data-icon="FileJson" {...props} />,
  Settings: (props: any) => <svg data-icon="Settings" {...props} />,
  File: (props: any) => <svg data-icon="File" {...props} />}))

describe('FileTypeIcon', () => {
  it('renders FileCode for xml type', () => {
    const { container } = render(<FileTypeIcon type="xml" />)
    expect(container.querySelector('[data-icon="FileCode"]')).toBeInTheDocument()
  })

  it('renders Languages for stbl type', () => {
    const { container } = render(<FileTypeIcon type="stbl" />)
    expect(container.querySelector('[data-icon="Languages"]')).toBeInTheDocument()
  })

  it('renders Code2 for ts4script type', () => {
    const { container } = render(<FileTypeIcon type="ts4script" />)
    expect(container.querySelector('[data-icon="Code2"]')).toBeInTheDocument()
  })

  it('renders Code2 for py type', () => {
    const { container } = render(<FileTypeIcon type="py" />)
    expect(container.querySelector('[data-icon="Code2"]')).toBeInTheDocument()
  })

  it('renders Package for package type', () => {
    const { container } = render(<FileTypeIcon type="package" />)
    expect(container.querySelector('[data-icon="Package"]')).toBeInTheDocument()
  })

  it('renders FileText for jpe type', () => {
    const { container } = render(<FileTypeIcon type="jpe" />)
    expect(container.querySelector('[data-icon="FileText"]')).toBeInTheDocument()
  })

  it('renders FileJson for json type', () => {
    const { container } = render(<FileTypeIcon type="json" />)
    expect(container.querySelector('[data-icon="FileJson"]')).toBeInTheDocument()
  })

  it('renders Settings for cfg type', () => {
    const { container } = render(<FileTypeIcon type="cfg" />)
    expect(container.querySelector('[data-icon="Settings"]')).toBeInTheDocument()
  })

  it('renders default File for unknown type', () => {
    const { container } = render(<FileTypeIcon type="unknown" />)
    expect(container.querySelector('[data-icon="File"]')).toBeInTheDocument()
  })

  it('applies correct color for xml (blue)', () => {
    const { container } = render(<FileTypeIcon type="xml" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('text-blue-400')
  })

  it('applies correct color for stbl (emerald)', () => {
    const { container } = render(<FileTypeIcon type="stbl" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('text-emerald-400')
  })

  it('applies correct color for script (purple)', () => {
    const { container } = render(<FileTypeIcon type="ts4script" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('text-purple-400')
  })

  it('applies correct color for package (orange)', () => {
    const { container } = render(<FileTypeIcon type="package" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('text-orange-400')
  })

  it('applies default color for unknown type', () => {
    const { container } = render(<FileTypeIcon type="unknown" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('text-slate-400')
  })

  it('uses custom className when provided', () => {
    const { container } = render(<FileTypeIcon type="xml" className="custom-class" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('custom-class')
    expect(svg).not.toHaveClass('text-blue-400')
  })

  it('renders at specified size', () => {
    const { container } = render(<FileTypeIcon type="xml" size={24} />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '24')
    expect(svg).toHaveAttribute('height', '24')
  })

  it('renders at default size (16px)', () => {
    const { container } = render(<FileTypeIcon type="xml" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '16')
    expect(svg).toHaveAttribute('height', '16')
  })
})

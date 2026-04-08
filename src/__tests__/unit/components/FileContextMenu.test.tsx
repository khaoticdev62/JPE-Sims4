/**
 * FileTree context menu unit tests
 *
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent} from '@testing-library/react'
import FileContextMenu from '@/components/file-tree/FileContextMenu'
import type { ModFile } from '@/types/index'

const mockFile: ModFile = {
  id: 'file-1',
  projectId: 'proj-1',
  name: 'test.xml',
  path: '/path/test.xml',
  type: 'xml',
  content: '<test />',
  isDirty: false,
  size: 100,
  lastModified: Date.now()}

describe('FileContextMenu', () => {
  const defaultProps = {
    file: mockFile,
    position: { x: 100, y: 100 },
    onClose: jest.fn(),
    onOpen: jest.fn(),
    onValidate: jest.fn(),
    onDelete: jest.fn(),
    onRename: jest.fn()}

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders context menu at specified position', () => {
    render(<FileContextMenu {...defaultProps} />)
    // Check the container exists at the right position
    const container = screen.getByText('Open').closest('div.fixed')
    expect(container).toBeInTheDocument()
    expect(container).toHaveStyle({ left: '100px', top: '100px' })
  })

  it('shows Open, Validate, Rename, Delete options', () => {
    render(<FileContextMenu {...defaultProps} />)
    expect(screen.getByText('Open')).toBeInTheDocument()
    expect(screen.getByText('Validate File')).toBeInTheDocument()
    expect(screen.getByText('Rename')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('calls onOpen and closes menu when Open is clicked', () => {
    render(<FileContextMenu {...defaultProps} />)

    fireEvent.click(screen.getByText('Open'))

    expect(defaultProps.onOpen).toHaveBeenCalledWith(mockFile)
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('calls onValidate and closes menu when Validate is clicked', () => {
    render(<FileContextMenu {...defaultProps} />)

    fireEvent.click(screen.getByText('Validate File'))

    expect(defaultProps.onValidate).toHaveBeenCalledWith(mockFile)
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('calls onDelete and closes menu when Delete is clicked', () => {
    render(<FileContextMenu {...defaultProps} />)

    fireEvent.click(screen.getByText('Delete'))

    expect(defaultProps.onDelete).toHaveBeenCalledWith(mockFile)
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('calls onRename and closes menu when Rename is clicked', () => {
    render(<FileContextMenu {...defaultProps} />)

    fireEvent.click(screen.getByText('Rename'))

    expect(defaultProps.onRename).toHaveBeenCalledWith(mockFile)
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('closes menu on Escape key', () => {
    render(<FileContextMenu {...defaultProps} />)

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('closes menu on outside click', () => {
    render(<FileContextMenu {...defaultProps} />)

    fireEvent.mouseDown(document.body)

    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('shows "Add File" option when isGroupHeader=true', () => {
    render(
      <FileContextMenu
        isGroupHeader
        position={{ x: 100, y: 100 }}
        onClose={jest.fn()}
        onAddFile={jest.fn()}
      />
    )
    expect(screen.getByText('Add File')).toBeInTheDocument()
  })

  it('calls onAddFile when Add File is clicked', () => {
    const onAddFile = jest.fn()
    render(
      <FileContextMenu
        isGroupHeader
        position={{ x: 100, y: 100 }}
        onClose={jest.fn()}
        onAddFile={onAddFile}
      />
    )

    fireEvent.click(screen.getByText('Add File'))

    expect(onAddFile).toHaveBeenCalled()
  })

  it('does not show Add File when isGroupHeader=false', () => {
    render(
      <FileContextMenu
        isGroupHeader={false}
        file={mockFile}
        position={{ x: 100, y: 100 }}
        onClose={jest.fn()}
        onAddFile={jest.fn()}
      />
    )
    expect(screen.queryByText('Add File')).not.toBeInTheDocument()
  })

  it('does not show Add File when onAddFile is not provided', () => {
    render(
      <FileContextMenu
        isGroupHeader
        position={{ x: 100, y: 100 }}
        onClose={jest.fn()}
      />
    )
    expect(screen.queryByText('Add File')).not.toBeInTheDocument()
  })

  it('only shows actions that have callbacks', () => {
    render(
      <FileContextMenu
        file={mockFile}
        position={{ x: 100, y: 100 }}
        onClose={jest.fn()}
        onOpen={jest.fn()}
        // No onValidate, onDelete, onRename
      />
    )
    expect(screen.getByText('Open')).toBeInTheDocument()
    expect(screen.queryByText('Validate File')).not.toBeInTheDocument()
    expect(screen.queryByText('Delete')).not.toBeInTheDocument()
  })

  it('shows file actions only when file is provided', () => {
    render(
      <FileContextMenu
        isGroupHeader
        position={{ x: 100, y: 100 }}
        onClose={jest.fn()}
        onAddFile={jest.fn()}
        onOpen={jest.fn()}
      />
    )
    expect(screen.getByText('Add File')).toBeInTheDocument()
    expect(screen.queryByText('Open')).not.toBeInTheDocument()
  })
})

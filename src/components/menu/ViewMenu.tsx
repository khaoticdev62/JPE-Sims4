import { useState } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useUIStore } from '@/stores/useUIStore'

function ViewMenu() {
  const { showSidebar, showContextPane, showDiagnostics, toggleSidebar, toggleContextPane, toggleDiagnostics } = useUIStore()
  const [zoom, setZoom] = useState(100)

  const handleCommandPalette = () => {
    // Will trigger command palette
    console.log('Open command palette')
  }

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom + 10, 200)
    setZoom(newZoom)
    console.log('Zoom in:', newZoom)
  }

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - 10, 50)
    setZoom(newZoom)
    console.log('Zoom out:', newZoom)
  }

  const handleResetZoom = () => {
    setZoom(100)
    console.log('Reset zoom to 100%')
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="px-3 py-2 text-sm font-medium text-text-primary hover:text-accent-primary hover:bg-background-tertiary rounded transition-colors data-[state=open]:bg-background-tertiary data-[state=open]:text-accent-primary">
          View
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-56 bg-background-tertiary border border-border-subtle rounded-lg shadow-lg z-50 overflow-hidden"
          sideOffset={8}
        >
          {/* Command Palette */}
          <DropdownMenu.Item asChild>
            <button
              onClick={handleCommandPalette}
              className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background-secondary hover:text-accent-primary focus:outline-none focus:bg-background-secondary focus:text-accent-primary transition-colors flex justify-between items-center"
            >
              <span>Command Palette</span>
              <span className="text-xs text-text-secondary">Ctrl+Shift+P</span>
            </button>
          </DropdownMenu.Item>

          {/* Separator */}
          <DropdownMenu.Separator className="my-1 h-px bg-border-subtle" />

          {/* Toggle Sidebar */}
          <DropdownMenu.Item asChild>
            <button
              onClick={toggleSidebar}
              className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background-secondary hover:text-accent-primary focus:outline-none focus:bg-background-secondary focus:text-accent-primary transition-colors flex justify-between items-center"
            >
              <span>{showSidebar ? '✓ ' : '  '}Project Explorer</span>
              <span className="text-xs text-text-secondary">Ctrl+B</span>
            </button>
          </DropdownMenu.Item>

          {/* Toggle Context Pane */}
          <DropdownMenu.Item asChild>
            <button
              onClick={toggleContextPane}
              className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background-secondary hover:text-accent-primary focus:outline-none focus:bg-background-secondary focus:text-accent-primary transition-colors flex justify-between items-center"
            >
              <span>{showContextPane ? '✓ ' : '  '}Context Pane</span>
              <span className="text-xs text-text-secondary">Ctrl+Alt+P</span>
            </button>
          </DropdownMenu.Item>

          {/* Toggle Diagnostics */}
          <DropdownMenu.Item asChild>
            <button
              onClick={toggleDiagnostics}
              className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background-secondary hover:text-accent-primary focus:outline-none focus:bg-background-secondary focus:text-accent-primary transition-colors flex justify-between items-center"
            >
              <span>{showDiagnostics ? '✓ ' : '  '}Diagnostics Panel</span>
              <span className="text-xs text-text-secondary">Ctrl+`</span>
            </button>
          </DropdownMenu.Item>

          {/* Separator */}
          <DropdownMenu.Separator className="my-1 h-px bg-border-subtle" />

          {/* Zoom In */}
          <DropdownMenu.Item asChild>
            <button
              onClick={handleZoomIn}
              className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background-secondary hover:text-accent-primary focus:outline-none focus:bg-background-secondary focus:text-accent-primary transition-colors flex justify-between items-center"
            >
              <span>Zoom In</span>
              <span className="text-xs text-text-secondary">Ctrl++</span>
            </button>
          </DropdownMenu.Item>

          {/* Zoom Out */}
          <DropdownMenu.Item asChild>
            <button
              onClick={handleZoomOut}
              className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background-secondary hover:text-accent-primary focus:outline-none focus:bg-background-secondary focus:text-accent-primary transition-colors flex justify-between items-center"
            >
              <span>Zoom Out</span>
              <span className="text-xs text-text-secondary">Ctrl+-</span>
            </button>
          </DropdownMenu.Item>

          {/* Reset Zoom */}
          <DropdownMenu.Item asChild>
            <button
              onClick={handleResetZoom}
              className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background-secondary hover:text-accent-primary focus:outline-none focus:bg-background-secondary focus:text-accent-primary transition-colors flex justify-between items-center"
            >
              <span>Reset Zoom</span>
              <span className="text-xs text-text-secondary">Ctrl+0</span>
            </button>
          </DropdownMenu.Item>

          {/* Current Zoom Level */}
          <DropdownMenu.Separator className="my-1 h-px bg-border-subtle" />
          <div className="px-4 py-2 text-xs text-text-secondary">
            Zoom: {zoom}%
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

export default ViewMenu

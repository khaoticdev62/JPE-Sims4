import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

function HelpMenu() {
  const handleDocumentation = () => {
    console.log('Open documentation')
    // Will open documentation in browser or dedicated help viewer
  }

  const handleKeyboardShortcuts = () => {
    console.log('Show keyboard shortcuts')
    // Will show keyboard shortcuts reference dialog
  }

  const handleReportIssue = () => {
    console.log('Open issue reporter')
    // Will open GitHub issues or feedback form
  }

  const handleAbout = () => {
    console.log('Show about dialog')
    // Will show About JPE Translator dialog
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="px-3 py-2 text-sm font-medium text-text-primary hover:text-accent-primary hover:bg-background-tertiary rounded transition-colors data-[state=open]:bg-background-tertiary data-[state=open]:text-accent-primary">
          Help
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-56 bg-background-tertiary border border-border-subtle rounded-lg shadow-lg z-50 overflow-hidden"
          sideOffset={8}
        >
          {/* Documentation */}
          <DropdownMenu.Item asChild>
            <button
              onClick={handleDocumentation}
              className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background-secondary hover:text-accent-primary focus:outline-none focus:bg-background-secondary focus:text-accent-primary transition-colors flex justify-between items-center"
            >
              <span>Documentation</span>
              <span className="text-xs text-text-secondary">F1</span>
            </button>
          </DropdownMenu.Item>

          {/* Keyboard Shortcuts */}
          <DropdownMenu.Item asChild>
            <button
              onClick={handleKeyboardShortcuts}
              className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background-secondary hover:text-accent-primary focus:outline-none focus:bg-background-secondary focus:text-accent-primary transition-colors flex justify-between items-center"
            >
              <span>Keyboard Shortcuts</span>
              <span className="text-xs text-text-secondary">Ctrl+?</span>
            </button>
          </DropdownMenu.Item>

          {/* Separator */}
          <DropdownMenu.Separator className="my-1 h-px bg-border-subtle" />

          {/* Report Issue */}
          <DropdownMenu.Item asChild>
            <button
              onClick={handleReportIssue}
              className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background-secondary hover:text-accent-primary focus:outline-none focus:bg-background-secondary focus:text-accent-primary transition-colors"
            >
              Report Issue
            </button>
          </DropdownMenu.Item>

          {/* Separator */}
          <DropdownMenu.Separator className="my-1 h-px bg-border-subtle" />

          {/* About */}
          <DropdownMenu.Item asChild>
            <button
              onClick={handleAbout}
              className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background-secondary hover:text-accent-primary focus:outline-none focus:bg-background-secondary focus:text-accent-primary transition-colors"
            >
              About JPE Translator
            </button>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

export default HelpMenu

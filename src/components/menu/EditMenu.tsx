import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

function EditMenu() {
  const handleUndo = () => {
    console.log('Undo action')
    // Will integrate with editor state
  }

  const handleRedo = () => {
    console.log('Redo action')
    // Will integrate with editor state
  }

  const handleCut = () => {
    console.log('Cut action')
    // Will integrate with editor
  }

  const handleCopy = () => {
    console.log('Copy action')
    // Will integrate with editor
  }

  const handlePaste = () => {
    console.log('Paste action')
    // Will integrate with editor
  }

  const handleFind = () => {
    console.log('Find action')
    // Will trigger find dialog
  }

  const handleReplace = () => {
    console.log('Replace action')
    // Will trigger replace dialog
  }

  const handleFindInFiles = () => {
    console.log('Find in files action')
    // Will trigger find in files dialog
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="px-3 py-2 text-sm font-medium text-text-primary hover:text-accent-primary hover:bg-background-tertiary rounded transition-colors data-[state=open]:bg-background-tertiary data-[state=open]:text-accent-primary">
          Edit
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-56 bg-background-tertiary border border-border-subtle rounded-lg shadow-lg z-50 overflow-hidden"
          sideOffset={8}
        >
          {/* Undo */}
          <DropdownMenu.Item asChild>
            <button
              onClick={handleUndo}
              className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background-secondary hover:text-accent-primary focus:outline-none focus:bg-background-secondary focus:text-accent-primary transition-colors flex justify-between items-center"
            >
              <span>Undo</span>
              <span className="text-xs text-text-secondary">Ctrl+Z</span>
            </button>
          </DropdownMenu.Item>

          {/* Redo */}
          <DropdownMenu.Item asChild>
            <button
              onClick={handleRedo}
              className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background-secondary hover:text-accent-primary focus:outline-none focus:bg-background-secondary focus:text-accent-primary transition-colors flex justify-between items-center"
            >
              <span>Redo</span>
              <span className="text-xs text-text-secondary">Ctrl+Y</span>
            </button>
          </DropdownMenu.Item>

          {/* Separator */}
          <DropdownMenu.Separator className="my-1 h-px bg-border-subtle" />

          {/* Cut */}
          <DropdownMenu.Item asChild>
            <button
              onClick={handleCut}
              className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background-secondary hover:text-accent-primary focus:outline-none focus:bg-background-secondary focus:text-accent-primary transition-colors flex justify-between items-center"
            >
              <span>Cut</span>
              <span className="text-xs text-text-secondary">Ctrl+X</span>
            </button>
          </DropdownMenu.Item>

          {/* Copy */}
          <DropdownMenu.Item asChild>
            <button
              onClick={handleCopy}
              className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background-secondary hover:text-accent-primary focus:outline-none focus:bg-background-secondary focus:text-accent-primary transition-colors flex justify-between items-center"
            >
              <span>Copy</span>
              <span className="text-xs text-text-secondary">Ctrl+C</span>
            </button>
          </DropdownMenu.Item>

          {/* Paste */}
          <DropdownMenu.Item asChild>
            <button
              onClick={handlePaste}
              className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background-secondary hover:text-accent-primary focus:outline-none focus:bg-background-secondary focus:text-accent-primary transition-colors flex justify-between items-center"
            >
              <span>Paste</span>
              <span className="text-xs text-text-secondary">Ctrl+V</span>
            </button>
          </DropdownMenu.Item>

          {/* Separator */}
          <DropdownMenu.Separator className="my-1 h-px bg-border-subtle" />

          {/* Find */}
          <DropdownMenu.Item asChild>
            <button
              onClick={handleFind}
              className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background-secondary hover:text-accent-primary focus:outline-none focus:bg-background-secondary focus:text-accent-primary transition-colors flex justify-between items-center"
            >
              <span>Find</span>
              <span className="text-xs text-text-secondary">Ctrl+F</span>
            </button>
          </DropdownMenu.Item>

          {/* Replace */}
          <DropdownMenu.Item asChild>
            <button
              onClick={handleReplace}
              className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background-secondary hover:text-accent-primary focus:outline-none focus:bg-background-secondary focus:text-accent-primary transition-colors flex justify-between items-center"
            >
              <span>Replace</span>
              <span className="text-xs text-text-secondary">Ctrl+H</span>
            </button>
          </DropdownMenu.Item>

          {/* Find in Files */}
          <DropdownMenu.Item asChild>
            <button
              onClick={handleFindInFiles}
              className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background-secondary hover:text-accent-primary focus:outline-none focus:bg-background-secondary focus:text-accent-primary transition-colors flex justify-between items-center"
            >
              <span>Find in Files</span>
              <span className="text-xs text-text-secondary">Ctrl+Shift+F</span>
            </button>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

export default EditMenu

import React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import DiffViewer from '../diff/DiffViewer'
import Button from '../common/Button'

interface DiffPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: () => void
  originalCode: string
  modifiedCode: string
  title?: string
  description?: string
  fileName?: string
}

/**
 * DIFF PREVIEW MODAL
 * 
 * A high-fidelity dialog for reviewing AI-suggested code changes
 * before applying them to the editor.
 */
export function DiffPreviewModal({
  isOpen,
  onClose,
  onApply,
  originalCode,
  modifiedCode,
  title = "Review Changes",
  description = "Review the suggested improvements before applying them to your file.",
  fileName
}: DiffPreviewModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] animate-in fade-in duration-300" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-5xl h-[85vh] bg-bg-secondary border border-border-subtle rounded-xl shadow-2xl z-[101] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-bg-tertiary/50">
            <div>
              <Dialog.Title className="text-xl font-bold text-text-primary flex items-center gap-2">
                {title}
                {fileName && (
                  <span className="text-sm font-normal text-text-secondary px-2 py-0.5 bg-bg-tertiary rounded">
                    {fileName}
                  </span>
                )}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-text-secondary mt-1">
                {description}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button className="p-2 text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary rounded-full transition-colors">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          {/* Diff Content */}
          <div className="flex-1 overflow-hidden p-6 bg-bg-primary/30">
            <DiffViewer 
              leftContent={originalCode}
              rightContent={modifiedCode}
              leftLabel="Original Code"
              rightLabel="Suggested Fix"
            />
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border-subtle flex items-center justify-end gap-3 bg-bg-tertiary/30">
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="text-text-secondary"
            >
              Discard
            </Button>
            <Button 
              variant="primary" 
              onClick={() => {
                onApply();
                onClose();
              }}
              className="px-8 shadow-lg shadow-accent-primary/20"
            >
              Apply Changes
            </Button>
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

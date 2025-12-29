interface WizardNavigationProps {
  currentStep: number
  totalSteps: number
  onPrevious: () => void
  onNext: () => void
  onFinish: () => void
  onCancel: () => void
  isLoading?: boolean
}

/**
 * Navigation buttons for wizard dialogs
 */
export default function WizardNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onFinish,
  onCancel,
  isLoading,
}: WizardNavigationProps) {
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === totalSteps - 1

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-border-subtle bg-background-secondary rounded-b-lg">
      {/* Step Counter */}
      <span className="text-xs text-text-secondary">
        Step {currentStep + 1} of {totalSteps}
      </span>

      {/* Buttons */}
      <div className="flex gap-2">
        {/* Cancel */}
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-text-primary bg-background-tertiary hover:bg-background-secondary rounded-lg border border-border-subtle transition-colors disabled:opacity-50"
        >
          Cancel
        </button>

        {/* Previous */}
        <button
          onClick={onPrevious}
          disabled={isFirstStep || isLoading}
          className="px-4 py-2 text-sm font-medium text-text-primary bg-background-tertiary hover:bg-background-secondary rounded-lg border border-border-subtle transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>

        {/* Next or Finish */}
        {isLastStep ? (
          <button
            onClick={onFinish}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-text-primary bg-accent-primary hover:bg-accent-focus rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? '⏳ Creating...' : '✓ Finish'}
          </button>
        ) : (
          <button
            onClick={onNext}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-text-primary bg-accent-primary hover:bg-accent-focus rounded-lg transition-colors disabled:opacity-50"
          >
            Next →
          </button>
        )}
      </div>
    </div>
  )
}

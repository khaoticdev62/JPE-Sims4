import { ReactNode } from 'react'

interface WizardStepProps {
  title: string
  description?: string
  children: ReactNode
}

/**
 * Single step in a wizard dialog
 */
export default function WizardStep({
  title,
  description,
  children,
}: WizardStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        {description && (
          <p className="text-sm text-text-secondary">{description}</p>
        )}
      </div>

      <div className="space-y-4 pt-4">
        {children}
      </div>
    </div>
  )
}

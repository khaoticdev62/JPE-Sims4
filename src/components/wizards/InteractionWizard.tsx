import { useState } from 'react'
import { Dialog } from '@radix-ui/react-dialog'
import WizardStep from './WizardStep'
import WizardNavigation from './WizardNavigation'
import { ProjectService } from '@/services/ProjectService'

export interface InteractionFormData {
  name: string
  displayName: string
  description: string
  type: 'Social' | 'Autonomous' | 'Phone' | 'Server' | 'Mixed'
  target: 'TargetedSim' | 'TargetedObject' | 'TargetedTerrain'
  immediatePhase: string
  duration: string
  priority: number
}

interface InteractionWizardProps {
  isOpen: boolean
  onClose: () => void
  onComplete?: (file: any) => void
}

const INTERACTION_TYPES = [
  { value: 'Social', label: 'Social' },
  { value: 'Autonomous', label: 'Autonomous' },
  { value: 'Phone', label: 'Phone' },
  { value: 'Server', label: 'Server' },
  { value: 'Mixed', label: 'Mixed' },
]

const TARGET_TYPES = [
  { value: 'TargetedSim', label: 'Sim' },
  { value: 'TargetedObject', label: 'Object' },
  { value: 'TargetedTerrain', label: 'Terrain' },
]

/**
 * Guided wizard for creating new Interactions
 */
export default function InteractionWizard({
  isOpen,
  onClose,
  onComplete,
}: InteractionWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<InteractionFormData>({
    name: '',
    displayName: '',
    description: '',
    type: 'Social',
    target: 'TargetedSim',
    immediatePhase: '',
    duration: 'Interaction',
    priority: 100,
  })

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(4, prev + 1))
  }

  const handleFinish = async () => {
    try {
      setIsLoading(true)

      // Generate interaction XML
      const xml = generateInteractionXML(formData)

      // Create file
      const file = await ProjectService.addFileToProject(
        `interaction_${formData.name}.xml`,
        xml
      )

      onComplete?.(file)
      onClose()
    } catch (error) {
      console.error('Failed to create interaction:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (key: keyof InteractionFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-background-secondary rounded-lg shadow-2xl max-w-md w-full mx-4 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border-subtle">
            <h1 className="text-lg font-semibold text-text-primary">
              Create Interaction
            </h1>
            <p className="text-xs text-text-secondary mt-1">
              Define a new Sims interaction
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-4 max-h-96 overflow-y-auto">
            {currentStep === 0 && (
              <WizardStep
                title="Basic Information"
                description="Enter the interaction name and display text"
              >
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Name (ID)
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., WaveHello"
                    className="w-full px-3 py-2 bg-background-tertiary border border-border-subtle rounded text-text-primary outline-none focus:border-accent-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) =>
                      handleInputChange('displayName', e.target.value)
                    }
                    placeholder="e.g., Wave Hello"
                    className="w-full px-3 py-2 bg-background-tertiary border border-border-subtle rounded text-text-primary outline-none focus:border-accent-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange('description', e.target.value)
                    }
                    placeholder="Describe the interaction..."
                    rows={3}
                    className="w-full px-3 py-2 bg-background-tertiary border border-border-subtle rounded text-text-primary outline-none focus:border-accent-primary transition-colors"
                  />
                </div>
              </WizardStep>
            )}

            {currentStep === 1 && (
              <WizardStep
                title="Interaction Type"
                description="Choose the type and target for this interaction"
              >
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {INTERACTION_TYPES.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => handleInputChange('type', type.value)}
                        className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                          formData.type === type.value
                            ? 'bg-accent-primary text-text-primary'
                            : 'bg-background-tertiary text-text-secondary hover:text-accent-primary'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Target
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {TARGET_TYPES.map((target) => (
                      <button
                        key={target.value}
                        onClick={() => handleInputChange('target', target.value)}
                        className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                          formData.target === target.value
                            ? 'bg-accent-primary text-text-primary'
                            : 'bg-background-tertiary text-text-secondary hover:text-accent-primary'
                        }`}
                      >
                        {target.label}
                      </button>
                    ))}
                  </div>
                </div>
              </WizardStep>
            )}

            {currentStep === 2 && (
              <WizardStep
                title="Interaction Phases"
                description="Define immediate and continuation phases"
              >
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Immediate Phase
                  </label>
                  <input
                    type="text"
                    value={formData.immediatePhase}
                    onChange={(e) =>
                      handleInputChange('immediatePhase', e.target.value)
                    }
                    placeholder="e.g., Queue Autonomous"
                    className="w-full px-3 py-2 bg-background-tertiary border border-border-subtle rounded text-text-primary outline-none focus:border-accent-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Duration
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) =>
                      handleInputChange('duration', e.target.value)
                    }
                    className="w-full px-3 py-2 bg-background-tertiary border border-border-subtle rounded text-text-primary outline-none cursor-pointer"
                  >
                    <option>Interaction</option>
                    <option>User Directed</option>
                    <option>Looping</option>
                  </select>
                </div>
              </WizardStep>
            )}

            {currentStep === 3 && (
              <WizardStep
                title="Priority & Outcomes"
                description="Set interaction priority and outcomes"
              >
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Priority ({formData.priority})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="500"
                    step="10"
                    value={formData.priority}
                    onChange={(e) =>
                      handleInputChange('priority', parseInt(e.target.value))
                    }
                    className="w-full"
                  />
                  <p className="text-xs text-text-secondary mt-2">
                    Lower = less likely, Higher = more likely
                  </p>
                </div>

                <div className="p-3 bg-background-tertiary rounded text-sm text-text-secondary">
                  <p>✓ Outcomes will be added in the next phase</p>
                </div>
              </WizardStep>
            )}

            {currentStep === 4 && (
              <WizardStep
                title="Review"
                description="Verify interaction details before creating"
              >
                <div className="space-y-2 p-3 bg-background-tertiary rounded text-sm">
                  <div>
                    <span className="text-text-secondary">Name:</span>{' '}
                    <span className="text-text-primary font-medium">
                      {formData.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-secondary">Display:</span>{' '}
                    <span className="text-text-primary font-medium">
                      {formData.displayName}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-secondary">Type:</span>{' '}
                    <span className="text-text-primary font-medium">
                      {formData.type}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-secondary">Target:</span>{' '}
                    <span className="text-text-primary font-medium">
                      {formData.target}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-secondary">Priority:</span>{' '}
                    <span className="text-text-primary font-medium">
                      {formData.priority}
                    </span>
                  </div>
                </div>
              </WizardStep>
            )}
          </div>

          {/* Navigation */}
          <WizardNavigation
            currentStep={currentStep}
            totalSteps={5}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onFinish={handleFinish}
            onCancel={onClose}
            isLoading={isLoading}
          />
        </div>
      </div>
    </Dialog>
  )
}

/**
 * Generate interaction XML from form data
 */
function generateInteractionXML(data: InteractionFormData): string {
  return `<?xml version="1.0"?>
<I c="SuperInteraction" i="interaction:${data.name}" m="sims4.tuning">
  <T n="display_name">${data.displayName}</T>
  <T n="description">${data.description}</T>
  <T n="interaction_type">${data.type}</T>
  <T n="target_type">${data.target}</T>
  <T n="priority">${data.priority}</T>
  <T n="duration_type">${data.duration}</T>
  <!-- Additional configuration will be added -->
</I>`
}

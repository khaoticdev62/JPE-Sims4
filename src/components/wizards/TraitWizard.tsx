import { useState } from 'react'
import { Dialog } from '@radix-ui/react-dialog'
import WizardStep from './WizardStep'
import WizardNavigation from './WizardNavigation'
import { ProjectService } from '@/services/ProjectService'
import { useProjectStore } from '@/stores/useProjectStore'

export interface TraitFormData {
  name: string
  displayName: string
  description: string
  category: 'Personality' | 'Reward' | 'Hidden' | 'Emotional'
  conflictingTraits: string
  ageAllowed: string[]
  speciesAllowed: string[]
}

interface TraitWizardProps {
  isOpen: boolean
  onClose: () => void
  onComplete?: (file: any) => void
}

const AGES = ['Baby', 'Toddler', 'Child', 'Teen', 'Young Adult', 'Adult', 'Elder']
const SPECIES = ['Human', 'Cat', 'Dog', 'Horse']
const CATEGORIES = ['Personality', 'Reward', 'Hidden', 'Emotional']

/**
 * Guided wizard for creating new Traits
 */
export default function TraitWizard({
  isOpen,
  onClose,
  onComplete,
}: TraitWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<TraitFormData>({
    name: '',
    displayName: '',
    description: '',
    category: 'Personality',
    conflictingTraits: '',
    ageAllowed: ['Teen', 'Young Adult', 'Adult', 'Elder'],
    speciesAllowed: ['Human'],
  })

  const handleFinish = async () => {
    try {
      setIsLoading(true)
      const { addFile, currentProject } = useProjectStore.getState()
      if (!currentProject) throw new Error('No active project')

      const xml = generateTraitXML(formData)
      const fileName = `trait_${formData.name}.xml`
      const filePath = `${currentProject.rootPath}/${fileName}`

      const file = ProjectService.createFile(filePath, xml, currentProject.id)
      
      addFile(file)
      onComplete?.(file)
      onClose()
    } catch (error) {
      console.error('Failed to create trait:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAgeToggle = (age: string) => {
    setFormData((prev) => ({
      ...prev,
      ageAllowed: prev.ageAllowed.includes(age)
        ? prev.ageAllowed.filter((a) => a !== age)
        : [...prev.ageAllowed, age],
    }))
  }

  const handleSpeciesToggle = (species: string) => {
    setFormData((prev) => ({
      ...prev,
      speciesAllowed: prev.speciesAllowed.includes(species)
        ? prev.speciesAllowed.filter((s) => s !== species)
        : [...prev.speciesAllowed, species],
    }))
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-background-secondary rounded-lg shadow-2xl max-w-md w-full mx-4 overflow-hidden">
          <div className="px-6 py-4 border-b border-border-subtle">
            <h1 className="text-lg font-semibold text-text-primary">
              Create Trait
            </h1>
            <p className="text-xs text-text-secondary mt-1">
              Define a new Sims personality trait
            </p>
          </div>

          <div className="px-6 py-6 space-y-4 max-h-96 overflow-y-auto">
            {currentStep === 0 && (
              <WizardStep
                title="Basic Information"
                description="Enter the trait name and category"
              >
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Name (ID)
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Active"
                    className="w-full px-3 py-2 bg-background-tertiary border border-border-subtle rounded text-text-primary outline-none focus:border-accent-primary"
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
                      setFormData({ ...formData, displayName: e.target.value })
                    }
                    placeholder="e.g., Active"
                    className="w-full px-3 py-2 bg-background-tertiary border border-border-subtle rounded text-text-primary outline-none focus:border-accent-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 bg-background-tertiary border border-border-subtle rounded text-text-primary outline-none cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe the trait..."
                    rows={2}
                    className="w-full px-3 py-2 bg-background-tertiary border border-border-subtle rounded text-text-primary outline-none focus:border-accent-primary"
                  />
                </div>
              </WizardStep>
            )}

            {currentStep === 1 && (
              <WizardStep
                title="Life Stages & Species"
                description="Choose which ages and species can have this trait"
              >
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Life Stages
                  </label>
                  <div className="space-y-1">
                    {AGES.map((age) => (
                      <button
                        key={age}
                        onClick={() => handleAgeToggle(age)}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                          formData.ageAllowed.includes(age)
                            ? 'bg-accent-primary text-text-primary'
                            : 'bg-background-tertiary text-text-secondary hover:text-accent-primary'
                        }`}
                      >
                        {formData.ageAllowed.includes(age) ? '✓ ' : '  '}{age}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Species
                  </label>
                  <div className="space-y-1">
                    {SPECIES.map((species) => (
                      <button
                        key={species}
                        onClick={() => handleSpeciesToggle(species)}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                          formData.speciesAllowed.includes(species)
                            ? 'bg-accent-primary text-text-primary'
                            : 'bg-background-tertiary text-text-secondary hover:text-accent-primary'
                        }`}
                      >
                        {formData.speciesAllowed.includes(species) ? '✓ ' : '  '}{species}
                      </button>
                    ))}
                  </div>
                </div>
              </WizardStep>
            )}

            {currentStep === 2 && (
              <WizardStep
                title="Conflicts"
                description="Enter conflicting traits (comma-separated)"
              >
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Conflicting Traits
                  </label>
                  <textarea
                    value={formData.conflictingTraits}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        conflictingTraits: e.target.value,
                      })
                    }
                    placeholder="e.g., trait_Lazy, trait_Gloomy"
                    rows={3}
                    className="w-full px-3 py-2 bg-background-tertiary border border-border-subtle rounded text-text-primary outline-none focus:border-accent-primary text-sm"
                  />
                </div>
              </WizardStep>
            )}

            {currentStep === 3 && (
              <WizardStep
                title="Review"
                description="Verify trait details before creating"
              >
                <div className="space-y-2 p-3 bg-background-tertiary rounded text-sm">
                  <div>
                    <span className="text-text-secondary">Name:</span>{' '}
                    <span className="text-text-primary font-medium">
                      {formData.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-secondary">Category:</span>{' '}
                    <span className="text-text-primary font-medium">
                      {formData.category}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-secondary">Ages:</span>{' '}
                    <span className="text-text-primary font-medium text-xs">
                      {formData.ageAllowed.join(', ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-secondary">Species:</span>{' '}
                    <span className="text-text-primary font-medium text-xs">
                      {formData.speciesAllowed.join(', ')}
                    </span>
                  </div>
                </div>
              </WizardStep>
            )}
          </div>

          <WizardNavigation
            currentStep={currentStep}
            totalSteps={4}
            onPrevious={() => setCurrentStep((p) => Math.max(0, p - 1))}
            onNext={() => setCurrentStep((p) => Math.min(3, p + 1))}
            onFinish={handleFinish}
            onCancel={onClose}
            isLoading={isLoading}
          />
        </div>
      </div>
    </Dialog>
  )
}

function generateTraitXML(data: TraitFormData): string {
  return `<?xml version="1.0"?>
<I c="Trait" i="trait:${data.name}" m="sims4.tuning">
  <T n="display_name">${data.displayName}</T>
  <T n="description">${data.description}</T>
  <T n="trait_type">${data.category}</T>
  <T n="ages_allowed">${data.ageAllowed.join(',')}</T>
  <T n="species_allowed">${data.speciesAllowed.join(',')}</T>
  ${data.conflictingTraits ? `<T n="conflicting_traits">${data.conflictingTraits}</T>` : ''}
</I>`
}

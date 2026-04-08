"use client";

import { useState } from 'react'
import { Dialog } from '@radix-ui/react-dialog'
import WizardStep from './WizardStep'
import WizardNavigation from './WizardNavigation'
import { useProjectStore } from '@/stores/useProjectStore'

export interface BuffFormData {
  name: string
  displayName: string
  description: string
  icon: string
  durationMinutes: number
  moodBonus: number
  skillBonus: number
}

interface BuffWizardProps {
  isOpen: boolean
  onClose: () => void
  onComplete?: (file: any) => void
}

/**
 * Guided wizard for creating new Buffs
 */
export default function BuffWizard({
  isOpen,
  onClose,
  onComplete}: BuffWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<BuffFormData>({
    name: '',
    displayName: '',
    description: '',
    icon: '0x00000001',
    durationMinutes: 120,
    moodBonus: 10,
    skillBonus: 0})

  const handleFinish = async () => {
    try {
      setIsLoading(true)

      const { createFile, currentProject } = useProjectStore.getState()
      if (!currentProject) throw new Error('No active project')

      const xml = generateBuffXML(formData)
      const fileName = `buff_${formData.name}.xml`
      const filePath = `${currentProject.rootPath}/${fileName}`

      const file = await createFile(filePath, xml)
      
      if (file) {
        onComplete?.(file)
        onClose()
      }
    } catch (error) {
      console.error('Failed to create buff:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (key: keyof BuffFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-background-secondary rounded-lg shadow-2xl max-w-md w-full mx-4 overflow-hidden">
          <div className="px-6 py-4 border-b border-border-subtle">
            <h1 className="text-lg font-semibold text-text-primary">
              Create Buff
            </h1>
            <p className="text-xs text-text-secondary mt-1">
              Define a new Sims buff or status effect
            </p>
          </div>

          <div className="px-6 py-6 space-y-4 max-h-96 overflow-y-auto">
            {currentStep === 0 && (
              <WizardStep
                title="Basic Information"
                description="Enter the buff name and display text"
              >
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Name (ID)
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Energized"
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
                      handleInputChange('displayName', e.target.value)
                    }
                    placeholder="e.g., Energized"
                    className="w-full px-3 py-2 bg-background-tertiary border border-border-subtle rounded text-text-primary outline-none focus:border-accent-primary"
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
                    placeholder="Describe the buff..."
                    rows={3}
                    className="w-full px-3 py-2 bg-background-tertiary border border-border-subtle rounded text-text-primary outline-none focus:border-accent-primary"
                  />
                </div>
              </WizardStep>
            )}

            {currentStep === 1 && (
              <WizardStep
                title="Effects"
                description="Set mood and skill bonuses"
              >
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Mood Bonus ({formData.moodBonus})
                  </label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    step="5"
                    value={formData.moodBonus}
                    onChange={(e) =>
                      handleInputChange('moodBonus', parseInt(e.target.value))
                    }
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Skill Bonus ({formData.skillBonus})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    value={formData.skillBonus}
                    onChange={(e) =>
                      handleInputChange('skillBonus', parseInt(e.target.value))
                    }
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Duration (minutes): {formData.durationMinutes}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="1440"
                    step="30"
                    value={formData.durationMinutes}
                    onChange={(e) =>
                      handleInputChange('durationMinutes', parseInt(e.target.value))
                    }
                    className="w-full"
                  />
                </div>
              </WizardStep>
            )}

            {currentStep === 2 && (
              <WizardStep
                title="Review"
                description="Verify buff details before creating"
              >
                <div className="space-y-2 p-3 bg-background-tertiary rounded text-sm">
                  <div>
                    <span className="text-text-secondary">Name:</span>{' '}
                    <span className="text-text-primary font-medium">
                      {formData.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-secondary">Mood Bonus:</span>{' '}
                    <span className="text-text-primary font-medium">
                      {formData.moodBonus > 0 ? '+' : ''}{formData.moodBonus}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-secondary">Skill Bonus:</span>{' '}
                    <span className="text-text-primary font-medium">
                      +{formData.skillBonus}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-secondary">Duration:</span>{' '}
                    <span className="text-text-primary font-medium">
                      {formData.durationMinutes} minutes
                    </span>
                  </div>
                </div>
              </WizardStep>
            )}
          </div>

          <WizardNavigation
            currentStep={currentStep}
            totalSteps={3}
            onPrevious={() => setCurrentStep((p) => Math.max(0, p - 1))}
            onNext={() => setCurrentStep((p) => Math.min(2, p + 1))}
            onFinish={handleFinish}
            onCancel={onClose}
            isLoading={isLoading}
          />
        </div>
      </div>
    </Dialog>
  )
}

function generateBuffXML(data: BuffFormData): string {
  return `<?xml version="1.0"?>
<I c="Buff" i="buff:${data.name}" m="sims4.tuning">
  <T n="display_name">${data.displayName}</T>
  <T n="description">${data.description}</T>
  <T n="mood_bonus">${data.moodBonus}</T>
  <T n="skill_bonus">${data.skillBonus}</T>
  <T n="duration_minutes">${data.durationMinutes}</T>
  <T n="icon">0x${data.icon}</T>
</I>`
}

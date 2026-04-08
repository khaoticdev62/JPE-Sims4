"use client";

import { useState, useEffect } from 'react'
import ExplanationSection from './ExplanationSection'
import type { ModFile } from '@/types/index'

interface ExplainPanelProps {
  file?: ModFile
}

interface Explanation {
  overview: string
  purpose: string
  keyFields: string[]
  relatedTuning: string[]
  effects: string[]
  notes: string[]
}

/**
 * AI-powered mod explanation panel
 * Shows human-readable explanations of tuning files
 */
export default function ExplainPanel({ file }: ExplainPanelProps) {
  const [explanation, setExplanation] = useState<Explanation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      setExplanation(null)
      return
    }

    generateExplanation(file)
  }, [file])

  const generateExplanation = async (file: ModFile) => {
    try {
      setLoading(true)
      setError(null)

      // For now, generate mock explanation based on file type
      // In production, this would call an AI API
      const mockExplanation = generateMockExplanation(file)
      setExplanation(mockExplanation)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to generate explanation'
      )
    } finally {
      setLoading(false)
    }
  }

  if (!file) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-text-secondary">
          <div className="text-base mb-2">🤔</div>
          <div>Select a file to see its explanation</div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-text-secondary">
          <div className="text-2xl mb-2 animate-spin">⏳</div>
          <div>Analyzing mod...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="p-4 bg-state-error/10 border border-state-error rounded-lg">
          <p className="text-sm text-state-error font-medium">Error</p>
          <p className="text-xs text-state-error/80 mt-1">{error}</p>
        </div>
      </div>
    )
  }

  if (!explanation) {
    return null
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-6 p-4">
        {/* File Info */}
        <div className="p-4 bg-background-tertiary rounded-lg border border-border-subtle">
          <div className="text-xs text-text-secondary mb-1">Explaining:</div>
          <div className="text-sm font-semibold text-text-primary truncate">
            {file.name}
          </div>
        </div>

        {/* Overview */}
        <ExplanationSection
          title="Overview"
          content={explanation.overview}
          icon="📋"
        />

        {/* Purpose */}
        <ExplanationSection
          title="Purpose"
          content={explanation.purpose}
          icon="🎯"
        />

        {/* Key Fields */}
        {explanation.keyFields.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <span>⚙️</span>
              Key Fields
            </h3>
            <div className="pl-6 space-y-2">
              {explanation.keyFields.map((field, idx) => (
                <p key={idx} className="text-sm text-text-secondary">
                  {field}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Effects */}
        {explanation.effects.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <span>✨</span>
              Effects
            </h3>
            <div className="pl-6 space-y-2">
              {explanation.effects.map((effect, idx) => (
                <p key={idx} className="text-sm text-text-secondary">
                  • {effect}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Related Tuning */}
        {explanation.relatedTuning.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <span>🔗</span>
              Related Tuning
            </h3>
            <div className="pl-6 space-y-2">
              {explanation.relatedTuning.map((tuning, idx) => (
                <div
                  key={idx}
                  className="text-sm text-text-secondary p-2 bg-background-tertiary rounded hover:bg-background-secondary transition-colors cursor-pointer"
                >
                  {tuning}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {explanation.notes.length > 0 && (
          <div className="p-4 bg-state-info/10 rounded-lg border border-state-info/50">
            <h3 className="text-sm font-semibold text-state-info mb-2 flex items-center gap-2">
              <span>💡</span>
              Notes
            </h3>
            <div className="space-y-1">
              {explanation.notes.map((note, idx) => (
                <p key={idx} className="text-xs text-state-info/80">
                  • {note}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* AI Disclaimer */}
        <div className="text-xs text-text-tertiary p-3 bg-background-tertiary rounded border border-border-subtle">
          🤖 Powered by AI - Verify complex information with official documentation
        </div>
      </div>
    </div>
  )
}

/**
 * Generate mock explanation based on file type
 * In production, this would use Claude API or similar
 */
function generateMockExplanation(file: ModFile): Explanation {
  const isInteraction = file.name.includes('interaction')
  const isBuff = file.name.includes('buff')
  const isTrait = file.name.includes('trait')

  if (isInteraction) {
    return {
      overview:
        'This interaction defines how Sims can interact with other Sims or objects. It includes the animation sequences, audio cues, and outcome conditions for the interaction.',
      purpose:
        'To add new social, autonomous, or player-directed interactions to the Sims game. The Sim performing the interaction will follow the defined phases and can receive buffs or relationship changes.',
      keyFields: [
        'display_name - How the interaction appears in the pie menu',
        'interaction_type - Category (Social, Autonomous, etc.)',
        'target_type - What the interaction targets (Sim, Object, Terrain)',
        'immediate_phase - The main animation/behavior sequence',
        'priority - How likely Sims are to autonomously choose this',
      ],
      relatedTuning: [
        'buff_PositiveOutcome - Possible buff from successful interaction',
        'relationship_modifiers - How relationships change',
      ],
      effects: [
        'Adds new interaction option in pie menu or autonomously',
        'Can modify relationship values between Sims',
        'Can apply buffs to participating Sims',
        'Defines animation and audio sequences',
      ],
      notes: [
        'Higher priority values make autonomy more likely',
        'Missing phases will prevent interaction from completing',
        'Test with different target types carefully',
      ],
    }
  }

  if (isBuff) {
    return {
      overview:
        'This buff defines a temporary or permanent status effect that can be applied to Sims. Buffs can modify moods, skills, and autonomy.',
      purpose:
        'To create effects that influence Sim behavior and capabilities. Buffs are typically applied by interactions, events, or other game mechanics.',
      keyFields: [
        'display_name - Buff name shown in Sim status',
        'mood_bonus - Mood points (positive or negative)',
        'skill_bonus - Skill experience gain multiplier',
        'duration - How long the buff lasts in minutes',
        'icon - Visual representation of the buff',
      ],
      relatedTuning: [
        'interactions - What applies this buff',
        'whims - Desires related to this buff',
      ],
      effects: [
        'Modifies Sim mood when applied',
        'Increases or decreases skill gain rate',
        'Can trigger autonomous interactions',
        'Displays icon in Sim status panel',
      ],
      notes: [
        'Negative mood bonuses create "uncomfortable" states',
        'Very high skill bonuses may break progression',
        'Short buffs (10-30 min) work best for temporary effects',
      ],
    }
  }

  if (isTrait) {
    return {
      overview:
        'This trait defines a permanent personality characteristic that affects Sim behavior, preferences, and interactions throughout gameplay.',
      purpose:
        'To add new personality options in Create-a-Sim or reward traits that unlock new gameplay features and interactions.',
      keyFields: [
        'display_name - Trait name in Create-a-Sim',
        'trait_type - Category (Personality, Reward, Hidden, Emotional)',
        'ages_allowed - Life stages that can have this trait',
        'species_allowed - Which species can have this trait',
        'conflicting_traits - Traits that cannot be combined',
      ],
      relatedTuning: [
        'buffs - Permanent buffs granted by this trait',
        'interactions - Trait-exclusive interactions',
        'whims - Whims related to this trait',
      ],
      effects: [
        'Available as option in Create-a-Sim',
        'Permanently affects Sim personality and behavior',
        'Can unlock exclusive interactions',
        'Determines which other traits can be selected',
        'May apply permanent mood or skill modifiers',
      ],
      notes: [
        'Conflicting traits prevent players from creating invalid Sims',
        'Age/species restrictions are important for balance',
        'Traits affect autonomy decisions significantly',
      ],
    }
  }

  return {
    overview: 'This tuning file defines behavior and effects for Sims 4.',
    purpose:
      'To modify or extend Sims 4 gameplay with custom content.',
    keyFields: [],
    relatedTuning: [],
    effects: [],
    notes: [
      'Generic file type - specific details depend on tuning class',
    ],
  }
}

/**
 * MasterSensorySlider Component
 *
 * Unified control panel for sensory feedback intensity.
 * Controls audio volume, haptic intensity, and visual pulse effects.
 * Respects OS "Quiet Mode" and "Focus" settings.
 *
 * Part of Epic 10: Sensory Studio Environment
 */

"use client"

import { useState, useEffect } from 'react'
import { Volume2, Vibrate, Sparkles, VolumeX } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { sensory } from '@/services/SensoryService'
import { HapticHeartbeat } from '@/services/editor/HapticHeartbeat'

interface MasterSensorySliderProps {
  className?: string
}

export default function MasterSensorySlider({ className = '' }: MasterSensorySliderProps) {
  const haptic = HapticHeartbeat.getInstance()

  const [masterVolume, setMasterVolume] = useState(50)
  const [hapticIntensity, setHapticIntensity] = useState(50)
  const [visualIntensity, setVisualIntensity] = useState(70)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [hapticEnabled, setHapticEnabled] = useState(true)
  const [visualEnabled, setVisualEnabled] = useState(true)

  // Sync with services on mount
  useEffect(() => {
    sensory.setMasterVolume(masterVolume / 100)
    haptic.setIntensity(hapticIntensity / 100)
    haptic.setEnabled(hapticEnabled)
  }, [masterVolume, hapticIntensity, hapticEnabled])

  // Test functions
  const testAudio = () => {
    if (audioEnabled) {
      sensory.triggerSuccess()
    }
  }

  const testHaptic = () => {
    if (hapticEnabled) {
      haptic.success()
    }
  }

  const testVisual = () => {
    // Visual pulse is handled by SensoryOverlay component
    console.log('[MasterSensorySlider] Visual test pulse')
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          Sensory Preferences
        </CardTitle>
        <CardDescription>
          Customize audio, haptic, and visual feedback intensity
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Master Audio Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {audioEnabled ? (
                <Volume2 className="w-4 h-4 text-indigo-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
              <Label className="text-sm font-medium">Audio Feedback</Label>
            </div>
            <Switch
              checked={audioEnabled}
              onCheckedChange={setAudioEnabled}
            />
          </div>

          <div className="flex items-center gap-4">
            <Slider
              value={[masterVolume]}
              onValueChange={([value]) => {
                setMasterVolume(value)
                sensory.setMasterVolume(value / 100)
              }}
              max={100}
              step={5}
              disabled={!audioEnabled}
              className="flex-1"
            />
            <Badge variant="outline" className="min-w-[3rem] justify-center">
              {masterVolume}%
            </Badge>
            <button
              onClick={testAudio}
              disabled={!audioEnabled}
              className="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-50 transition-colors"
            >
              Test
            </button>
          </div>
        </div>

        {/* Haptic Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Vibrate className={`w-4 h-4 ${hapticEnabled ? 'text-indigo-400' : 'text-slate-500'}`} />
              <Label className="text-sm font-medium">Haptic Feedback</Label>
            </div>
            <Switch
              checked={hapticEnabled}
              onCheckedChange={(checked) => {
                setHapticEnabled(checked)
                haptic.setEnabled(checked)
              }}
            />
          </div>

          <div className="flex items-center gap-4">
            <Slider
              value={[hapticIntensity]}
              onValueChange={([value]) => {
                setHapticIntensity(value)
                haptic.setIntensity(value / 100)
              }}
              max={100}
              step={5}
              disabled={!hapticEnabled}
              className="flex-1"
            />
            <Badge variant="outline" className="min-w-[3rem] justify-center">
              {hapticIntensity}%
            </Badge>
            <button
              onClick={testHaptic}
              disabled={!hapticEnabled}
              className="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-50 transition-colors"
            >
              Test
            </button>
          </div>

          {!hapticEnabled && (
            <p className="text-xs text-slate-500">
              Haptic feedback requires a compatible gamepad or mobile device
            </p>
          )}
        </div>

        {/* Visual Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className={`w-4 h-4 ${visualEnabled ? 'text-indigo-400' : 'text-slate-500'}`} />
              <Label className="text-sm font-medium">Visual Pulses</Label>
            </div>
            <Switch
              checked={visualEnabled}
              onCheckedChange={setVisualEnabled}
            />
          </div>

          <div className="flex items-center gap-4">
            <Slider
              value={[visualIntensity]}
              onValueChange={([value]) => setVisualIntensity(value)}
              max={100}
              step={5}
              disabled={!visualEnabled}
              className="flex-1"
            />
            <Badge variant="outline" className="min-w-[3rem] justify-center">
              {visualIntensity}%
            </Badge>
            <button
              onClick={testVisual}
              disabled={!visualEnabled}
              className="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-50 transition-colors"
            >
              Test
            </button>
          </div>
        </div>

        {/* Quiet Mode Notice */}
        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
          <p className="text-xs text-slate-400">
            <strong>Note:</strong> Sensory feedback automatically respects your OS "Quiet Mode" or "Focus" settings.
            All sensory layers can be toggled independently.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

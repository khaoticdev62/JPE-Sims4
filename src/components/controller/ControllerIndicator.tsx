import { useEffect, useState } from 'react'
import { GamepadIcon, Info } from 'lucide-react'
import { useGamepadInput } from '@/hooks/useGamepadInput'
import { useUIStore } from '@/stores/useUIStore'

export default function ControllerIndicator() {
  const [connected, setConnected] = useState(() => 
    typeof navigator !== 'undefined' && !!navigator.getGamepads && navigator.getGamepads().filter(Boolean).length > 0
  )
  const { focusedPane } = useUIStore()

  useEffect(() => {
    const handleConnect = () => setConnected(true)
    const handleDisconnect = () => setConnected(false)

    window.addEventListener('gamepadconnected', handleConnect)
    window.addEventListener('gamepaddisconnected', handleDisconnect)

    return () => {
      window.removeEventListener('gamepadconnected', handleConnect)
      window.removeEventListener('gamepaddisconnected', handleDisconnect)
    }
  }, [])

  // Track active buttons for visual feedback
  useEffect(() => {
    // This is a bit of a hack since useGamepadInput uses individual listeners
    // A more robust solution would be to have GamepadService emit a "state change" event
    // or expose active buttons. For now, this is purely visual.
  }, [])

  if (!connected) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-background-tertiary border border-border-subtle rounded-full px-3 py-1.5 shadow-lg animate-in fade-in slide-in-from-bottom-4">
      <GamepadIcon className="w-4 h-4 text-accent-primary" />
      <span className="text-xs font-medium text-text-primary">Controller Active</span>
      <div className="w-px h-3 bg-border-subtle mx-1" />
      <span className="text-xs text-text-secondary capitalize">{focusedPane.replace('-', ' ')}</span>
    </div>
  )
}

"use client";

import { useState } from 'react'
import { Settings as SettingsIcon, Moon, Sun, FileText, Bell, HardDrive, RefreshCw, Loader2, Sparkles, Eye } from 'lucide-react'
import { useUIStore } from '@/stores/useUIStore'
import { toggleHighContrastTheme } from '@/themes/high-contrast'
import { useSymbolStore } from '@/stores/useSymbolStore'
import { FileService } from '@/services/FileService'
import { ModIndexingService } from '@/services/ModIndexingService'
import MasterSensorySlider from '@/components/settings/MasterSensorySlider'

export function SettingsPage() {
  const { modsFolderPath, setModsFolderPath } = useUIStore()
  const { 
    isIndexingMods, 
    indexedPackagesCount, 
    externalInteractions, 
    externalStblKeys 
  } = useSymbolStore()
  
  const [darkMode, setDarkMode] = useState(true)
  const [notifications, setNotifications] = useState(true)
  const [autoSave, setAutoSave] = useState(true)

  return (
    <div className="flex-1 w-full flex bg-background-primary overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-[1200px] mx-auto px-8 py-8 space-y-10">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
            <p className="text-text-secondary">
              Configure your JPE Mod Translator preferences
            </p>
          </div>

          {/* Appearance Settings */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <SettingsIcon className="w-6 h-6 text-accent-primary" />
              <h2 className="text-xl font-semibold text-text-primary">Appearance</h2>
            </div>

            <div className="bg-background-secondary border border-border-subtle rounded-lg p-6 space-y-6">
              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {darkMode ? (
                    <Moon className="w-5 h-5 text-accent-primary" />
                  ) : (
                    <Sun className="w-5 h-5 text-state-warning" />
                  )}
                  <div>
                    <h3 className="text-text-primary font-medium">Dark Mode</h3>
                    <p className="text-text-secondary text-sm">Use dark theme for the application</p>
                  </div>
                </div>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    darkMode ? 'bg-accent-primary' : 'bg-background-tertiary'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-text-primary rounded-full transition-transform ${
                      darkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* High Contrast Mode Toggle */}
              <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-accent-secondary" />
                  <div>
                    <h3 className="text-text-primary font-medium">High Contrast Mode</h3>
                    <p className="text-text-secondary text-sm">WCAG AAA compliant theme for maximum readability</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleHighContrastTheme()}
                  className="relative w-12 h-6 rounded-full bg-background-tertiary hover:bg-accent-secondary/30 transition-colors"
                  aria-label="Toggle high contrast mode"
                  role="switch"
                >
                  <div
                    className="absolute top-1 w-4 h-4 bg-text-primary rounded-full transition-transform translate-x-1"
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Editor Settings */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6 text-accent-primary" />
              <h2 className="text-xl font-semibold text-text-primary">Editor</h2>
            </div>

            <div className="bg-background-secondary border border-border-subtle rounded-lg p-6 space-y-6">
              {/* Auto Save Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-text-primary font-medium">Auto Save</h3>
                  <p className="text-text-secondary text-sm">
                    Automatically save files while editing
                  </p>
                </div>
                <button
                  onClick={() => setAutoSave(!autoSave)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    autoSave ? 'bg-accent-primary' : 'bg-background-tertiary'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-text-primary rounded-full transition-transform ${
                      autoSave ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Font Size */}
              <div className="border-t border-border-subtle pt-6">
                <h3 className="text-text-primary font-medium mb-3">Editor Font Size</h3>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="12"
                    max="18"
                    defaultValue="14"
                    className="flex-1 accent-accent-primary"
                  />
                  <span className="text-text-secondary min-w-12">14px</span>
                </div>
              </div>
            </div>
          </section>

          {/* Sims 4 Modding Settings */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <HardDrive className="w-6 h-6 text-accent-primary" />
              <h2 className="text-xl font-semibold text-text-primary">Sims 4 Modding</h2>
            </div>

            <div className="bg-background-secondary border border-border-subtle rounded-lg p-6 space-y-6">
              {/* Mods Folder Path */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-text-primary font-medium">Mods Folder Path</h3>
                    <p className="text-text-secondary text-sm">
                      Location of your Sims 4 Mods directory for cross-mod reference indexing
                    </p>
                  </div>
                   <button
                    onClick={async () => {
                      const path = await FileService.openFolder()
                      if (path) {
                        setModsFolderPath(path)
                        ModIndexingService.indexModsFolder(path)
                      }
                    }}
                    className="px-6 py-2.5 bg-cyan hover:bg-cyanBright text-black rounded-lg text-xs font-black transition-all active:scale-95 shadow-lg shadow-cyan/20 hover:shadow-cyan/40 uppercase tracking-widest"
                  >
                    SELECT DIRECTORY
                  </button>
                </div>
                
                <div className="bg-black/40 border border-white/5 rounded-lg px-4 py-3 font-mono text-[10px] text-cyan/70 flex items-center gap-2">
                  <span className="opacity-50 text-white">[{modsFolderPath ? 'PATH_ACTIVE' : 'PATH_MISSING'}]</span>
                  <span className="truncate">{modsFolderPath || 'SYSTEM_STATUS: Manual selection required for mod indexing.'}</span>
                </div>
              </div>

              {/* Indexing Status */}
              <div className="border-t border-border-subtle pt-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isIndexingMods ? (
                    <Loader2 className="w-5 h-5 text-cyan animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-emerald/20 flex items-center justify-center border border-emerald/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-text-primary font-medium">External Symbols Index</h3>
                    <p className="text-text-secondary text-sm">
                      {isIndexingMods 
                        ? `Indexing mods... (${indexedPackagesCount} packages scanned)` 
                        : `${externalInteractions.size + externalStblKeys.size} external references indexed from ${indexedPackagesCount} packages`}
                    </p>
                  </div>
                </div>
                <button
                  disabled={isIndexingMods || !modsFolderPath}
                  onClick={() => modsFolderPath && ModIndexingService.indexModsFolder(modsFolderPath)}
                  className="p-2 hover:bg-background-tertiary rounded-md transition-colors disabled:opacity-50"
                  title="Re-index Mods"
                >
                  <RefreshCw className={`w-5 h-5 text-text-secondary ${isIndexingMods ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-accent-primary" />
              <h2 className="text-xl font-semibold text-text-primary">Notifications</h2>
            </div>

            <div className="bg-background-secondary border border-border-subtle rounded-lg p-6 space-y-6">
              {/* Notifications Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-text-primary font-medium">Enable Notifications</h3>
                  <p className="text-text-secondary text-sm">
                    Receive notifications for important events
                  </p>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notifications ? 'bg-accent-primary' : 'bg-background-tertiary'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-text-primary rounded-full transition-transform ${
                      notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Sensory Studio */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-6 h-6 text-accent-primary" />
              <h2 className="text-xl font-semibold text-text-primary">Sensory Studio</h2>
            </div>

            <MasterSensorySlider />
          </section>

          {/* About Section */}
          <section className="space-y-6">
            <h2 className="text-xl font-semibold text-text-primary">About</h2>

            <div className="bg-background-secondary border border-border-subtle rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Application</span>
                <span className="text-text-primary font-medium">JPE Mod Translator</span>
              </div>
              <div className="flex justify-between items-center border-t border-border-subtle pt-4">
                <span className="text-text-secondary">Version</span>
                <span className="text-text-primary font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between items-center border-t border-border-subtle pt-4">
                <span className="text-text-secondary">Build</span>
                <span className="text-text-primary font-medium">Production</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

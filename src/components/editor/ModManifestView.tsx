"use client";

import React, { useState, useEffect } from 'react'
import { useProjectStore } from '@/stores/useProjectStore'
import { ModManifestService, ManifestUpdates } from '@/services/ModManifestService'
import { 
  ShieldAlert, 
  Sparkles, 
  Save, 
  History, 
  Info, 
  Loader2, 
  Fingerprint, 
  Globe, 
  User 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export const ModManifestView: React.FC = () => {
  const { currentProject } = useProjectStore()
  const [updates, setUpdates] = useState<ManifestUpdates>({
    name: 'JPE Mod Project',
    version: '1.0.0',
    author: 'JPE User',
    description: ''
  })
  const [isPatching, setPatching] = useState(false)
  const [isAiLoading, setAiLoading] = useState(false)

  // Initialize from project metadata if available
  useEffect(() => {
    if (currentProject) {
      setUpdates({
        name: currentProject.name || 'Untitled Mod',
        version: currentProject.metadata?.version || '1.0.0',
        author: currentProject.metadata?.author || 'Unknown',
        description: currentProject.metadata?.description || ''
      })
    }
  }, [currentProject])

  const handleAiSuggestVersion = async () => {
    setAiLoading(true)
    try {
      const nextVersion = await ModManifestService.suggestVersionBump(updates.version || '1.0.0')
      setUpdates(prev => ({ ...prev, version: nextVersion }))
      toast.success(`AI suggested: ${nextVersion}`)
    } catch (_e) {
      toast.error('AI Version Suggestion failed.')
    } finally {
      setAiLoading(false)
    }
  }

  const handleApplyGlobalPatch = async () => {
    if (!currentProject?.rootPath) {
      toast.error('No project root found.')
      return
    }

    setPatching(true)
    try {
      // For each .package in the project, apply the patch
      const packageFiles = currentProject.files.filter(f => f.type === 'package')
      
      if (packageFiles.length === 0) {
        toast.error('No .package files found in this project to patch.')
        return
      }

      for (const pkg of packageFiles) {
        toast.info(`Patching ${pkg.name}...`)
        await ModManifestService.patchManifest(pkg.path, updates)
      }

      toast.success('Project-wide manifest patch completed successfully.')
    } catch (error: any) {
      toast.error(`Patch failed: ${error.message}`)
    } finally {
      setPatching(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-background-secondary overflow-hidden animate-fade-in">
      {/* Header Area */}
      <div className="p-4 border-b border-border-subtle bg-background-tertiary/20">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-bold text-text-primary tracking-widest flex items-center gap-2">
             <Fingerprint className="w-3.5 h-3.5 text-accent-primary" />
             MANIFEST DASHBOARD
          </h2>
          <Badge variant="outline" className="text-[9px] bg-accent-primary/5 text-accent-primary border-accent-primary/20">
            STABLE ENGINE
          </Badge>
        </div>
        <p className="text-[10px] text-text-secondary leading-tight italic">
          Automate mod updates across all string tables and tuning files with AI-powered versioning.
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Metadata Section */}
          <section className="space-y-4">
             <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-text-secondary uppercase flex items-center gap-1.5">
                   <Globe className="w-3 h-3" /> Mod Display Name
                </label>
                <Input 
                  value={updates.name}
                  onChange={(e) => setUpdates(prev => ({ ...prev, name: e.target.value }))}
                  className="h-8 text-xs bg-background-secondary border-border-subtle focus:ring-accent-primary"
                />
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-semibold text-text-secondary uppercase flex items-center gap-1.5">
                      <History className="w-3 h-3" /> Version
                   </label>
                   <div className="flex gap-2">
                      <Input 
                        value={updates.version}
                        onChange={(e) => setUpdates(prev => ({ ...prev, version: e.target.value }))}
                        className="h-8 text-xs bg-background-secondary border-border-subtle"
                      />
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={handleAiSuggestVersion}
                        disabled={isAiLoading}
                        className="h-8 px-2 bg-accent-primary/10 hover:bg-accent-primary/20 text-accent-primary border-none"
                      >
                         {isAiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      </Button>
                   </div>
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-semibold text-text-secondary uppercase flex items-center gap-1.5">
                      <User className="w-3 h-3" /> Author
                   </label>
                   <Input 
                     value={updates.author}
                     onChange={(e) => setUpdates(prev => ({ ...prev, author: e.target.value }))}
                     className="h-8 text-xs bg-background-secondary border-border-subtle"
                   />
                </div>
             </div>
          </section>

          {/* AI Insights Card */}
          <div className="bg-accent-primary/5 border border-accent-primary/10 rounded-sm p-3 flex gap-3">
             <ShieldAlert className="w-5 h-5 text-accent-primary shrink-0 opacity-80" />
             <div className="space-y-1">
               <h4 className="text-[10px] font-bold text-text-primary uppercase tracking-tight">Shadow-Write Security</h4>
               <p className="text-[9px] text-text-secondary leading-relaxed">
                  Modifications will be saved as <span className="font-fira text-accent-primary">*_Patched.package</span> to ensure binary safety during development.
               </p>
             </div>
          </div>

          <div className="pt-2">
             <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3">Manifest Impact</h3>
             <ul className="space-y-2">
                <ImpactItem icon={<Globe className="w-3 h-3" />} label="String Tables" status="Automatic Rewrite" />
                <ImpactItem icon={<Info className="w-3 h-3" />} label="Tuning Files" status="XML Refactor" />
                <ImpactItem icon={<Sparkles className="w-3 h-3" />} label="Global Metadata" status="Metadata Sync" />
             </ul>
          </div>
        </div>
      </ScrollArea>

      {/* Action Footer */}
      <div className="p-4 border-t border-border-subtle bg-background-tertiary/30">
         <Button 
           onClick={handleApplyGlobalPatch}
           disabled={isPatching}
           className="w-full bg-accent-primary hover:bg-accent-secondary text-white border-none shadow-premium transition-all duration-fast"
         >
           {isPatching ? (
             <>
               <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
               REBUILDING BINARIES...
             </>
           ) : (
             <>
               <Save className="w-3.5 h-3.5 mr-2" />
               ONE-CLICK PATCH & SAVE
             </>
           )}
         </Button>
      </div>
    </div>
  )
}

const ImpactItem: React.FC<{ icon: React.ReactNode; label: string; status: string }> = ({ icon, label, status }) => (
  <li className="flex items-center justify-between p-2 rounded-sm bg-background-tertiary/40 border border-border-subtle/30">
    <div className="flex items-center gap-2">
      <div className="w-5 h-5 rounded-full bg-background-secondary flex items-center justify-center text-text-secondary/70">
        {icon}
      </div>
      <span className="text-[10px] font-medium text-text-primary">{label}</span>
    </div>
    <span className="text-[9px] text-accent-primary font-fira">{status}</span>
  </li>
)

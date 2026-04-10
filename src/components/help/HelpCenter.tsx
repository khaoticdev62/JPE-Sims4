/**
 * HelpCenter Component
 *
 * Central hub for documentation, tutorials, and user assistance.
 * Provides searchable access to JPE manual, keyboard shortcuts, and learning resources.
 */

"use client"

import { useState } from 'react'
import { BookOpen, Keyboard, Sparkles, LifeBuoy, Search, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useUIStore } from '@/stores/useUIStore'

interface HelpCenterProps {
  isOpen: boolean
  onClose: () => void
}

interface HelpTopic {
  id: string
  title: string
  description: string
  category: 'manual' | 'shortcuts' | 'tutorial' | 'community'
  icon: React.ElementType
  action?: () => void
  externalLink?: string
}

const HELP_TOPICS: HelpTopic[] = [
  {
    id: 'jpe-manual',
    title: 'JPE Language Manual',
    description: 'Complete reference for WHEN/DO/ONLY_IF syntax',
    category: 'manual',
    icon: BookOpen,
    action: () => useUIStore.getState().setWorkspaceMode('manual'),
  },
  {
    id: 'keyboard-shortcuts',
    title: 'Keyboard Shortcuts',
    description: 'All available keyboard shortcuts and hotkeys',
    category: 'shortcuts',
    icon: Keyboard,
  },
  {
    id: 'interactive-tutorial',
    title: 'Interactive Tutorial',
    description: 'Learn JPE step-by-step with guided examples',
    category: 'tutorial',
    icon: Sparkles,
    action: () => {
      useUIStore.getState().setTourOpen(true)
      useUIStore.getState().setTutorialActive(true)
    },
  },
  {
    id: 'prompt-to-jpe',
    title: 'AI: Prompt to JPE',
    description: 'Generate JPE code from natural language',
    category: 'tutorial',
    icon: Sparkles,
    action: () => useUIStore.getState().setPromptToJPEOpen(true),
  },
  {
    id: 'community',
    title: 'Sims 4 Modding Community',
    description: 'Connect with other modders and share your work',
    category: 'community',
    icon: LifeBuoy,
    externalLink: 'https://sims4studio.com/',
  },
  {
    id: 'scarlet-mod-list',
    title: "Scarlet's Realm Mod List",
    description: 'Check mod compatibility status',
    category: 'community',
    icon: ExternalLink,
    externalLink: 'https://scarletsrealm.com/the-mod-list/',
  },
]

export default function HelpCenter({ isOpen, onClose }: HelpCenterProps) {
  const [searchQuery, setSearchQuery] = useState('')

  if (!isOpen) return null

  const filteredTopics = HELP_TOPICS.filter(
    (topic) =>
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const categories = ['manual', 'shortcuts', 'tutorial', 'community'] as const

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            Help Center
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Find documentation, tutorials, and community resources
          </p>

          {/* Search */}
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search help topics..."
                className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
          </div>
        </div>

        {/* Topics */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-200px)] space-y-6">
          {categories.map((category) => {
            const topics = filteredTopics.filter((t) => t.category === category)
            if (topics.length === 0) return null

            return (
              <div key={category}>
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
                  {category}
                </h3>
                <div className="grid gap-3">
                  {topics.map((topic) => (
                    <Card
                      key={topic.id}
                      className="bg-slate-800/50 border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer"
                      onClick={() => {
                        if (topic.action) topic.action()
                        if (topic.externalLink) window.open(topic.externalLink, '_blank')
                      }}
                    >
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-start gap-3">
                          <topic.icon className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-sm font-medium text-white truncate">
                              {topic.title}
                            </CardTitle>
                            <CardDescription className="text-xs text-slate-400 mt-1">
                              {topic.description}
                            </CardDescription>
                          </div>
                          {topic.externalLink && (
                            <ExternalLink className="w-4 h-4 text-slate-500 flex-shrink-0" />
                          )}
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}

          {filteredTopics.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No topics found matching "{searchQuery}"</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-800/50 flex justify-between items-center">
          <Badge variant="outline" className="text-xs">
            {filteredTopics.length} topics available
          </Badge>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

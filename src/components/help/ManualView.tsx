"use client";

import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { useManualStore } from '@/stores/useManualStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search, Book, Play, Sparkles, Zap} from 'lucide-react';
import { JPEPlayground } from '@/components/help/JPEPlayground';

interface ManualSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: string;
  playground?: string;
}

const MANUAL_SECTIONS: ManualSection[] = [
  {
    id: 'intro',
    title: 'Getting Started',
    icon: <Sparkles className="w-4 h-4 text-yellow-400" />,
    content: `
# Welcome to JPE Studio
Just Plain English (JPE) is a human-readable scripting language for The Sims 4. 
Instead of writing complex XML tuning, you write modular logic that reads like a sentence.

## Basic Syntax
Every JPE file typically follows this structure:
- **WHEN**: The event trigger (e.g., SIM_EATS)
- **ONLY_IF**: Conditions that must be met
- **DO**: The outcome or effect (e.g., ADD_BUFF)
    `,
    playground: `WHEN SIM_EATS
ONLY_IF SIM_HAS_TRAIT "Hungry"
DO ADD_BUFF "FullStomach" 120`
  },
  {
    id: 'syntax',
    title: 'Modular Logic',
    icon: <Zap className="w-4 h-4 text-blue-400" />,
    content: `
# Modular Logic (WHEN/DO)
JPE focuses on modularity. You don't need to worry about XML lists or nesting; the engine handles that for you.

## Multiple Actions
You can define multiple DO blocks for a single trigger.
    `,
    playground: `WHEN SIM_INTERACTS "Talk"
DO ADD_RELATIONSHIP 5
DO PLAY_ANIMATION "Wave"`
  },
  {
    id: 'pro',
    title: 'Pro Utilities',
    icon: <Zap className="w-4 h-4 text-purple-400" />,
    content: `
# Industrial Power Tools
JPE Studio includes advanced utilities for professional modders:
- **Stream Writer**: High-performance binary reconstruction.
- **Manifest Patching**: Automated versioning and ID resolution.
- **Size-Collision Cleanup**: MD5-based deduplication for large mod folders.
    `
  }
];

export const ManualView: React.FC = () => {
  const { searchQuery, setSearchQuery } = useManualStore();
  const [activeTab, setActiveTab] = useState<string>('intro');

  const filteredSections = useMemo(() => {
    if (!searchQuery) return MANUAL_SECTIONS;
    return MANUAL_SECTIONS.filter(s => 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const activeSection = MANUAL_SECTIONS.find(s => s.id === activeTab) || MANUAL_SECTIONS[0];

  return (
    <div className="flex flex-col h-full bg-jpe-surface text-jpe-text overflow-hidden border-l border-jpe-border">
      {/* Header */}
      <div className="p-4 border-b border-jpe-border bg-jpe-bg/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2 mb-3">
          <Book className="w-5 h-5 text-jpe-primary" />
          <h1 className="text-sm font-bold tracking-tight uppercase">Just Plain Manual</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-jpe-muted" />
          <Input
            placeholder="Search the guide..."
            className="pl-9 bg-jpe-surface border-jpe-border text-xs h-9 focus:ring-jpe-primary ring-offset-jpe-bg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Rail */}
        <div className="w-16 border-r border-jpe-border flex flex-col items-center py-4 gap-4 bg-jpe-bg/20">
          {filteredSections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveTab(s.id)}
              className={`p-2.5 rounded-xl transition-all duration-fast ${
                activeTab === s.id 
                  ? 'bg-jpe-primary text-white shadow-lg shadow-jpe-primary/20 scale-110' 
                  : 'text-jpe-muted hover:text-jpe-text hover:bg-jpe-surface'
              }`}
              title={s.title}
            >
              {s.icon}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <ScrollArea className="flex-1">
          <div className="p-6 max-w-2xl mx-auto space-y-8">
            <div className="prose prose-invert prose-sm max-w-none prose-headings:text-jpe-primary prose-a:text-jpe-primary prose-code:text-jpe-secondary prose-pre:bg-jpe-bg">
              <ReactMarkdown>{activeSection.content}</ReactMarkdown>
            </div>

            {activeSection.playground && (
              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-jpe-muted uppercase tracking-wider">
                  <Play className="w-3 h-3" />
                  Interactive Playground
                </div>
                <JPEPlayground initialCode={activeSection.playground} />
              </div>
            )}

            <div className="pt-12 border-t border-jpe-border flex items-center justify-between text-[10px] text-jpe-muted uppercase tracking-widest">
              <span>Section: {activeSection.title}</span>
              <span>JPE Studio 2.1</span>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

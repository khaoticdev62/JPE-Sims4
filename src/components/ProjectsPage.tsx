"use client";

import React, { useState, useMemo } from 'react';
import { T } from '@/components/robust/jpe-theme';
import { 
  Plus, FolderOpen, Search, Clock, 
  CheckCircle2, 
  Terminal
} from 'lucide-react';
import { motion, StaggerList, StaggerItem } from '@/components/jpe-motion';
import { JpeButton, JpeCard, JpeStatusBadge } from '@/components/jpe-design-system';
import { useProjectStore } from '@/stores/useProjectStore';
import { SpectralHologram } from '@/components/jpe-empty-states';

interface Project {
  id: string;
  name: string;
  lastOpened: string;
  type: 'script' | 'object' | 'tuning';
  status: 'active' | 'archived';
  progress: number;
}

export function ProjectsPage({ onNavigate }: { onNavigate?: (target: string) => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { recentProjects } = useProjectStore();
  
  const projects = useMemo(() => {
    return recentProjects.map((p: any) => ({
      id: p.id,
      name: p.name,
      lastOpened: new Date(p.updatedAt).toLocaleDateString(),
      type: 'script' as const,
      status: 'active' as const,
      progress: 0
    }));
  }, [recentProjects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p: Project) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [projects, searchQuery]);

  return (
    <div data-testid="projects-root" className="flex-1 overflow-y-auto bg-bgDeep custom-scrollbar relative">
      {/* Cinematic Overlays */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto p-10 relative z-10">
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-2 h-8 bg-cyan rounded-full shadow-[0_0_15px_rgba(99,179,237,0.5)]" />
            <h1 style={{ fontSize: 32, fontWeight: 950, fontFamily: T.display, color: T.textPrimary }} className="uppercase italic tracking-tighter">
              Project Vault
            </h1>
          </div>
          <p className="text-textMuted uppercase tracking-[0.3em] text-[10px] font-black pl-6">
            Active Workspace Traces & Archives
          </p>
        </header>

        <div className="flex flex-col md:flex-row gap-4 mb-10 items-center justify-between">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted group-focus-within:text-cyan transition-colors" size={16} />
            <input 
              type="text"
              placeholder="SEARCH_VAULT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-border rounded-xl py-3 pl-12 pr-4 text-sm font-mono outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/30 transition-all placeholder:text-textMuted/30"
            />
          </div>
          
          <JpeButton variant="spectral" icon={Plus} onClick={() => onNavigate?.('new_project')}>
            NEW_INITIALIZATION
          </JpeButton>
        </div>

        {filteredProjects.length > 0 ? (
          <StaggerList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project: Project) => (
              <StaggerItem key={project.id}>
                <JpeCard 
                  title={project.name} 
                  data-testid={`project-card-${project.id}`}
                  className="group hover:scale-[1.02] transition-transform duration-300"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-mono text-textMuted uppercase tracking-tight">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} />
                        {project.lastOpened}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={12} className="text-cyan" />
                        {project.progress}% SYNC
                      </div>
                    </div>
                    
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-cyan transition-all duration-1000 shadow-[0_0_8px_rgba(99,179,237,0.5)]" 
                        style={{ width: `${project.progress}%` }} 
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <JpeStatusBadge 
                        label={project.type} 
                        status={project.status === 'active' ? 'ok' : 'idle'} 
                        compact 
                      />
                      <JpeButton 
                        variant="ghost" 
                        size="xs" 
                        icon={Terminal} 
                        className="text-[10px] font-black uppercase"
                        onClick={() => onNavigate?.('code')}
                      >
                        Open_Node
                      </JpeButton>
                    </div>
                  </div>
                </JpeCard>
              </StaggerItem>
            ))}
          </StaggerList>
        ) : !searchQuery ? (
          /* PREMIUM EMPTY STATE */
          <div className="flex flex-col items-center justify-center py-20">
            <SpectralHologram 
              icon={FolderOpen} 
              title="Project Traces Missing" 
              description="Your vault is currently empty. Initialize a new project or open an existing archive to begin synchronization."
              action={{ 
                label: "Initialize Project", 
                onClick: () => onNavigate?.('new_project') 
              }}
            />
            
            <div className="mt-8 flex items-center gap-6 text-[10px] font-mono text-textMuted uppercase tracking-widest opacity-50">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan/40 animate-pulse" />
                <span>Ready to Initialize</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-violet/40" />
                <span>0 Archives</span>
              </div>
            </div>
          </div>
        ) : (
          /* SEARCH EMPTY STATE */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-textMuted mb-6 italic font-mono text-xs uppercase tracking-[0.2em]">
              No entries found matching "{searchQuery}"
            </div>
            <JpeButton variant="ghost" size="sm" onClick={() => setSearchQuery("")}>
               WIPE_SEARCH_QUERY
            </JpeButton>
          </div>
        )}
      </div>
    </div>
  );
}

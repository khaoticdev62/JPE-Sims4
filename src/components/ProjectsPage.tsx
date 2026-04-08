"use client";
import React, { useState } from 'react';
import { useProjectStore } from '@/stores/useProjectStore';
import { FolderOpen, Plus, Clock, FileText, ChevronRight, Star, Search, Filter, MoreVertical } from 'lucide-react';
import { T } from "./robust/jpe-theme";
import { JpeButton, JpeCard } from "./jpe-design-system";
import { StaggerList, StaggerItem } from "./jpe-motion";

interface ProjectsPageProps {
  onNavigate?: (view: string) => void
}

export function ProjectsPage({ onNavigate }: ProjectsPageProps) {
  const { recentProjects } = useProjectStore();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = recentProjects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div data-testid="projects-root" className="flex flex-col h-full overflow-y-auto custom-scrollbar" style={{ background: T.bg }}>
      
      {/* ── SPECTRAL HEADER ── */}
      <div className="px-8 py-10 border-b relative overflow-hidden flex-shrink-0" style={{ borderColor: T.border, background: T.bgPanel }}>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FolderOpen size={14} color={T.cyan} />
                <span style={{ fontSize: 10, fontWeight: 800, fontFamily: T.mono, color: T.textSecondary, letterSpacing: "0.1em" }}>PROJECT_EXPLORER</span>
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 900, fontFamily: T.display, color: T.textPrimary, letterSpacing: "-0.02em" }}>
                Workspace Resources
              </h1>
            </div>
            <JpeButton variant="primary" size="lg" icon={Plus} data-testid="create-new-project-btn" onClick={() => onNavigate?.('new_project')}>
              CREATE NEW PROJECT
            </JpeButton>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search local projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-xl outline-none transition-all"
                style={{ 
                  background: T.bgInput, 
                  border: `1px solid ${T.border}`, 
                  color: T.textPrimary,
                  fontSize: 13
                }}
              />
            </div>
            <JpeButton variant="secondary" icon={Filter}>Filters</JpeButton>
            <JpeButton variant="secondary" icon={MoreVertical} />
          </div>
        </div>
        
        {/* Animated Background Decor */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none" 
          style={{ background: `radial-gradient(circle at center, ${T.violet} 0%, transparent 70%)`, filter: "blur(40px)" }} />
      </div>

      {/* ── PROJECTS GRID ── */}
      <div className="p-8">
        <StaggerList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProjects.map((project, idx) => (
            <StaggerItem key={project.id}>
              <JpeCard onClick={() => onNavigate?.('code')}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${T.cyan}10`, border: `1px solid ${T.cyan}30` }}>
                    <FileText size={20} color={T.cyan} />
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={12} color={T.amber} fill={idx === 0 ? T.amber : "none"} />
                    <span style={{ fontSize: 10, fontFamily: T.mono, color: T.textMuted }}>v{project.metadata?.version || '1.0.0'}</span>
                  </div>
                </div>

                <h3 style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary, marginBottom: 4 }}>{project.name}</h3>
                <p style={{ fontSize: 11, color: T.textSecondary, marginBottom: 16, height: 32, overflow: "hidden" }}>
                  {project.metadata?.description || "No description provided for this workspace."}
                </p>

                <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: T.borderSubtle }}>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock size={12} />
                    <span style={{ fontSize: 10 }}>2h ago</span>
                  </div>
                  <div className="flex items-center gap-1" style={{ color: T.cyan, fontSize: 10, fontWeight: 700 }}>
                    OPEN <ChevronRight size={12} />
                  </div>
                </div>
              </JpeCard>
            </StaggerItem>
          ))}
          
          {/* Create New Placeholder */}
          <StaggerItem>
            <div 
              className="h-full min-h-[180px] rounded-2xl border-2 border-dashed border-border/40 hover:border-primary/40 transition-all flex flex-col items-center justify-center cursor-pointer group"
              onClick={() => onNavigate?.('new_project')}
            >
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Plus size={18} className="text-muted-foreground" />
              </div>
              <span className="text-sm font-semibold text-muted-foreground">Initialize New</span>
            </div>
          </StaggerItem>
        </StaggerList>

        {filteredProjects.length === 0 && searchQuery && (
          <div className="text-center py-20">
            <div className="text-muted-foreground mb-4">No projects matching "{searchQuery}"</div>
            <JpeButton variant="ghost" onClick={() => setSearchQuery("")}>Clear Search</JpeButton>
          </div>
        )}
      </div>
    </div>
  );
}

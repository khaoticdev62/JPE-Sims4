"use client";

import { useState, useEffect, useRef } from "react";
import {
  ChevronDown, FolderOpen, Plus, CheckCircle2,
  AlertTriangle, Clock, Star, Braces,
  GitBranch, Package,
} from "lucide-react";
import { motion, AnimatePresence } from "./jpe-motion";
import { T } from "./robust/jpe-theme";
import { Badge } from "./robust/jpe-shared";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
  shortName: string;
  description: string;
  branch: string;
  lastOpened: string;
  status: "healthy" | "warning" | "error";
  modCount: number;
  starred: boolean;
  color: string;
  version: string;
}

const PROJECTS: Project[] = [
  {
    id: "proj-evil-trait",
    name: "trait_Evil Overhaul",
    shortName: "Evil Trait",
    description: "Comprehensive Evil trait rework with new interactions and buffs",
    branch: "main",
    lastOpened: "Now",
    status: "healthy",
    modCount: 14,
    starred: true,
    color: T.violet,
    version: "2.3.1",
  },
  {
    id: "proj-cas-expansion",
    name: "CAS Expansion Pack",
    shortName: "CAS Exp.",
    description: "New Create-a-Sim categories and custom trait icons",
    branch: "feature/icons",
    lastOpened: "2h ago",
    status: "warning",
    modCount: 8,
    starred: true,
    color: T.cyan,
    version: "0.8.0",
  },
  {
    id: "proj-career-mod",
    name: "Custom Career Mod",
    shortName: "Career",
    description: "Full custom career track with unique outfits and skill requirements",
    branch: "develop",
    lastOpened: "Yesterday",
    status: "healthy",
    modCount: 22,
    starred: false,
    color: T.emerald,
    version: "1.0.0",
  },
  {
    id: "proj-relationship-overhaul",
    name: "Relationship Overhaul",
    shortName: "Relations",
    description: "Deep relationship system rework with new social interactions",
    branch: "main",
    lastOpened: "3d ago",
    status: "error",
    modCount: 31,
    starred: false,
    color: T.rose,
    version: "1.5.2",
  },
  {
    id: "proj-world-builder",
    name: "World Builder Helpers",
    shortName: "World",
    description: "Utility scripts for Sims 4 world editing and LOT management",
    branch: "main",
    lastOpened: "1w ago",
    status: "healthy",
    modCount: 6,
    starred: false,
    color: T.amber,
    version: "0.4.0",
  },
];

const statusConfig = {
  healthy: { color: T.emerald, icon: CheckCircle2, label: "OK" },
  warning: { color: T.amber,   icon: AlertTriangle, label: "Warn" },
  error:   { color: T.rose,    icon: AlertTriangle, label: "Error" },
};

interface ProjectSwitcherProps {
  compact?: boolean;
}

export function ProjectSwitcher({ compact = false }: ProjectSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [activeProject, setActiveProject] = useState(PROJECTS[0]);
  const [projects, setProjects] = useState(PROJECTS);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const escHandler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("mousedown", handler);
    window.addEventListener("keydown", escHandler);
    return () => { window.removeEventListener("mousedown", handler); window.removeEventListener("keydown", escHandler); };
  }, []);

  const switchProject = (proj: Project) => {
    setActiveProject(proj);
    setOpen(false);
    toast.success(`Switched to "${proj.name}"`, { description: `Branch: ${proj.branch} · v${proj.version}` });
  };

  const toggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjects(prev => prev.map(p => p.id === id ? { ...p, starred: !p.starred } : p));
    if (activeProject.id === id) setActiveProject(p => ({ ...p, starred: !p.starred }));
  };

  const activeStatus = statusConfig[activeProject.status];
  const ActiveStatusIcon = activeStatus.icon;

  return (
    <div ref={ref} className="relative flex-shrink-0">
      {/* Trigger */}
      <button
        onClick={() => setOpen(p => !p)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all group relative overflow-hidden active:scale-95"
        style={{
          background: open ? `${activeProject.color}15` : "rgba(255,255,255,0.03)",
          border: `1px solid ${open ? activeProject.color : T.borderSubtle}`,
          boxShadow: open ? `0 0 15px ${activeProject.color}20` : 'none'
        }}
        onMouseEnter={e => {
          if (!open) { 
            e.currentTarget.style.background = `${activeProject.color}08`; 
            e.currentTarget.style.borderColor = `${activeProject.color}40`;
            e.currentTarget.style.boxShadow = `0 0 10px ${activeProject.color}15`;
          }
        }}
        onMouseLeave={e => {
          if (!open) { 
            e.currentTarget.style.background = "rgba(255,255,255,0.03)"; 
            e.currentTarget.style.borderColor = T.borderSubtle;
            e.currentTarget.style.boxShadow = 'none';
          }
        }}
        title="Switch project"
      >
        <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: `${activeProject.color}20`, border: `1px solid ${activeProject.color}40` }}>
          <Braces size={11} color={activeProject.color} className="drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
        </div>
        {!compact && (
          <span style={{ fontSize: 11, fontWeight: 800, color: T.textPrimary, maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} className="uppercase tracking-tight">
            {activeProject.shortName}
          </span>
        )}
        <ActiveStatusIcon size={10} color={activeStatus.color} className="animate-pulse" />
        <ChevronDown size={11} color={T.textMuted} style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)" }} />
        
        {/* Spectral Shine Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />
        </div>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full mt-1.5 left-0 z-[120] rounded-xl overflow-hidden"
            style={{
              width: 280,
              background: T.bgSurface,
              border: `1px solid ${T.border}`,
              boxShadow: `0 16px 48px rgba(0,0,0,0.6), 0 0 1px rgba(255,255,255,0.06)`,
              backdropFilter: "blur(24px)",
            }}
          >
            {/* Accent line */}
            <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${T.violet}50, ${T.cyan}50, transparent)` }} />

            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: `1px solid ${T.border}` }}>
              <div className="flex items-center gap-2">
                <FolderOpen size={12} color={T.violet} />
                <span style={{ fontSize: 11, fontWeight: 700, color: T.textPrimary, letterSpacing: "0.04em" }}>PROJECTS</span>
              </div>
              <button
                onClick={() => { setOpen(false); toast.info("New Project wizard — choose a mod template to scaffold"); }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md transition-all"
                style={{ fontSize: 10, color: T.violetBright, background: T.violetDim, border: `1px solid ${T.borderViolet}` }}
                onMouseEnter={e => { e.currentTarget.style.background = `${T.violet}20`; }}
                onMouseLeave={e => { e.currentTarget.style.background = T.violetDim; }}
              >
                <Plus size={9} /> New
              </button>
            </div>

            {/* Project list */}
            <div className="py-1 max-h-[300px] overflow-y-auto">
              {/* Starred section */}
              {projects.filter(p => p.starred).length > 0 && (
                <>
                  <div className="px-3 pt-2 pb-1">
                    <span style={{ fontSize: 9, fontWeight: 700, color: T.textDim, letterSpacing: "0.1em" }}>STARRED</span>
                  </div>
                  {projects.filter(p => p.starred).map(proj => (
                    <ProjectRow
                      key={proj.id}
                      project={proj}
                      isActive={activeProject.id === proj.id}
                      onSelect={() => switchProject(proj)}
                      onToggleStar={e => toggleStar(proj.id, e)}
                    />
                  ))}
                  <div className="mx-3 my-1 h-px" style={{ background: T.border }} />
                </>
              )}

              {/* Recent section */}
              <div className="px-3 pt-1 pb-1">
                <span style={{ fontSize: 9, fontWeight: 700, color: T.textDim, letterSpacing: "0.1em" }}>RECENT</span>
              </div>
              {projects.filter(p => !p.starred).map(proj => (
                <ProjectRow
                  key={proj.id}
                  project={proj}
                  isActive={activeProject.id === proj.id}
                  onSelect={() => switchProject(proj)}
                  onToggleStar={e => toggleStar(proj.id, e)}
                />
              ))}
            </div>

            {/* Active project detail */}
            <div className="px-3 py-2" style={{ borderTop: `1px solid ${T.border}`, background: T.bgPanel }}>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: `${activeProject.color}15` }}>
                  <Braces size={9} color={activeProject.color} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: T.textPrimary }}>{activeProject.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <GitBranch size={9} color={T.textDim} />
                  <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textTertiary }}>{activeProject.branch}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Package size={9} color={T.textDim} />
                  <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textTertiary }}>{activeProject.modCount} files</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={9} color={T.textDim} />
                  <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textTertiary }}>{activeProject.lastOpened}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProjectRow({ project, isActive, onSelect, onToggleStar }: {
  project: Project;
  isActive: boolean;
  onSelect: () => void;
  onToggleStar: (e: React.MouseEvent) => void;
}) {
  const status = statusConfig[project.status];
  const StatusIcon = status.icon;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(); } }}
      className="w-full flex items-center gap-2.5 px-3 py-2 transition-colors text-left group/row cursor-pointer"
      style={{ background: isActive ? `${project.color}08` : "transparent" }}
      onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = T.bgHover; }}
      onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
    >
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${project.color}12`, border: `1px solid ${project.color}20` }}>
        <Braces size={12} color={project.color} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="truncate" style={{ fontSize: 11, fontWeight: isActive ? 700 : 600, color: isActive ? T.textPrimary : T.textSecondary }}>{project.shortName}</span>
          {isActive && <Badge color={project.color} bg={`${project.color}12`}>active</Badge>}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <GitBranch size={8} color={T.textDim} />
          <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>{project.branch}</span>
          <span style={{ fontSize: 9, color: T.textDim }}>·</span>
          <span style={{ fontSize: 9, color: T.textDim }}>{project.lastOpened}</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <StatusIcon size={10} color={status.color} />
        <button
          onClick={onToggleStar}
          className="opacity-0 group-hover/row:opacity-100 transition-opacity"
          style={{ color: project.starred ? T.amber : T.textDim }}
        >
          <Star size={10} fill={project.starred ? T.amber : "none"} />
        </button>
      </div>
    </div>
  );
}

export default ProjectSwitcher;

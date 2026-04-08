"use client";
import * as React from "react";
import { useManualStore} from "@/stores/useManualStore";
import { usePlaygroundStore } from "@/stores/usePlaygroundStore";
import { useUIStore } from "@/stores/useUIStore";
import {
  BookOpen, Search, Copy, Play,
  GraduationCap, Globe, Info
} from "lucide-react";
import { cn } from "../ui/utils";
import { motion, AnimatePresence } from "../jpe-motion";
import ReactMarkdown from "react-markdown";

export function JpeManualView() {
  const { 
    activeSectionId, activeItemId, setActiveSection, setActiveItem, 
    searchQuery, setSearchQuery, getFilteredSections 
  } = useManualStore();
  
  const { setPlaygroundCode } = usePlaygroundStore();
  const { setWorkspaceMode } = useUIStore();
  
  const filteredSections = getFilteredSections();
  const activeSection = filteredSections.find(s => s.id === activeSectionId) || filteredSections[0];
  
  const handleTryInPlayground = (code: string) => {
    setPlaygroundCode(code);
    setWorkspaceMode('playground');
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    // Simple toast would go here
  };

  return (
    <div className="flex w-full h-full bg-bgDeep text-textPrimary overflow-hidden font-sans border border-border/50 rounded-xl m-4 shadow-2xl relative">
      {/* Background Cinematic Gradients */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none -z-10 bg-[radial-gradient(circle_at_70%_20%,_#63B3ED33_0%,_transparent_70%)]" />
      <div className="absolute bottom-0 left-0 w-1/2 h-full opacity-10 pointer-events-none -z-10 bg-[radial-gradient(circle_at_20%_80%,_#8B5CF633_0%,_transparent_70%)]" />

      {/* Manual Sidebar */}
      <aside className="w-80 border-r border-border bg-bgSurface/40 backdrop-blur-xl flex flex-col z-20">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-cyan/10 border border-cyan/20">
               <GraduationCap className="w-6 h-6 text-cyanBright" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-[0.2em] uppercase italic text-white">The Manual</h2>
              <p className="text-[10px] text-textMuted font-mono uppercase tracking-tighter">Just Plain English</p>
            </div>
          </div>

          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textTertiary group-focus-within:text-cyan transition-colors" />
            <input 
              type="text" 
              placeholder="Search Knowledge Base..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-border rounded-lg py-2 pl-10 pr-4 text-xs font-medium focus:outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/20 transition-all placeholder:text-textTertiary"
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {filteredSections.map((section) => (
            <div key={section.id} className="space-y-1">
              <button
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-left transition-all duration-300",
                  activeSectionId === section.id 
                    ? "bg-white/5 text-cyanBright shadow-sm" 
                    : "text-textSecondary hover:bg-white/5 hover:text-textPrimary"
                )}
              >
                <div className="flex items-center gap-3">
                  <BookOpen className={cn("w-4 h-4", activeSectionId === section.id ? "text-cyan" : "text-textTertiary")} />
                  <span className="text-xs font-bold uppercase tracking-wide">{section.title}</span>
                </div>
                {activeSectionId === section.id && (
                  <motion.div layoutId="active-indicator" className="w-1 h-4 bg-cyan rounded-full" />
                )}
              </button>

              <AnimatePresence>
                {activeSectionId === section.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden pl-11 pr-2 pb-2 space-y-1"
                  >
                    {section.items.map(item => (
                      <button
                        key={item.id}
                        onClick={() => setActiveItem(item.id)}
                        className={cn(
                          "w-full text-left py-1 text-[11px] transition-colors rounded px-2",
                          activeItemId === item.id 
                            ? "bg-cyan/10 text-cyanBright font-semibold border-l-2 border-cyan pl-2" 
                            : "text-textMuted hover:text-cyan"
                        )}
                      >
                        {item.title}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>
      </aside>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar bg-bgDeep/50 z-10 flex flex-col">
        {activeSection ? (
          <div className="max-w-4xl w-full mx-auto p-12 space-y-12 h-fit mb-24">
            {/* Section Header */}
            <header>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan/10 border border-cyan/20 text-[10px] font-bold text-cyan uppercase tracking-widest mb-4">
                 <Globe className="w-3 h-3" /> JPE Core Reference
              </div>
              <h1 className="text-4xl font-black text-white italic tracking-tight uppercase leading-none">
                 {activeSection.title}
              </h1>
              <div className="mt-6 text-lg text-textSecondary leading-relaxed font-medium bg-white/2 overflow-hidden rounded-xl border border-white/5 p-6 backdrop-blur-sm">
                 <div className="prose prose-invert max-w-none prose-sm">
                   <ReactMarkdown>
                     {activeSection.content}
                   </ReactMarkdown>
                 </div>
              </div>
            </header>

            {/* Articles List */}
            <div className="space-y-8">
              {activeSection.items.map((item, idx) => (
                <motion.article 
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={cn(
                    "group p-8 rounded-2xl bg-bgSurface/40 border border-border/50 hover:border-cyan/30 transition-all duration-500",
                    activeItemId === item.id && "ring-2 ring-cyan/50 border-cyan/50 bg-bgSurface/60 shadow-2xl shadow-cyan/10"
                  )}
                  id={`manual-item-${item.id}`}
                >
                  <div className="flex items-start justify-between gap-6 mb-6">
                    <div className="flex-1">
                       <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan transition-colors tracking-tight uppercase italic">{item.title}</h3>
                       <div className="text-sm text-textSecondary leading-relaxed">
                          <div className="prose prose-invert prose-p:leading-relaxed prose-code:text-cyan prose-code:bg-cyan/10 prose-code:px-1 prose-code:rounded">
                            <ReactMarkdown>
                              {item.content}
                            </ReactMarkdown>
                          </div>
                       </div>
                    </div>
                    {item.playground && (
                      <div className="shrink-0 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                           onClick={() => handleTryInPlayground(item.playground!)}
                           className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan text-black font-bold text-[10px] tracking-widest uppercase hover:bg-cyanBright transition-all shadow-lg active:scale-95"
                         >
                            <Play className="w-3 h-3 fill-current" /> Try Logic
                         </button>
                         <button 
                           onClick={() => handleCopy(item.playground!)}
                           className="flex items-center justify-center p-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-textSecondary transition-all"
                           title="Copy JPE Source"
                         >
                            <Copy className="w-4 h-4" />
                         </button>
                      </div>
                    )}
                  </div>

                  {item.playground && (
                    <div className="relative rounded-xl overflow-hidden border border-white/5 bg-black/60 font-mono text-[11px] p-4 group">
                       <div className="absolute top-2 right-2 flex items-center gap-2 px-2 py-1 rounded bg-black/50 border border-white/10 text-[8px] font-bold text-textMuted uppercase">
                          <Braces className="w-2.5 h-2.5" /> JPE Snippet
                       </div>
                       <pre className="text-emerald-400">
                         {item.playground}
                       </pre>
                    </div>
                  )}

                  {item.context && (
                    <div className="mt-4 flex items-center gap-2 text-[9px] font-bold text-cyan/70 uppercase tracking-widest">
                       <Info className="w-3 h-3" /> Context: {item.context}
                    </div>
                  )}
                </motion.article>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-textMuted gap-4 p-20 text-center">
             <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center animate-pulse">
                <Search className="w-8 h-8 opacity-20" />
             </div>
             <div>
               <h3 className="text-white font-bold uppercase tracking-widest">No Topics Found</h3>
               <p className="text-xs mt-1">Try adjusting your search query to find industrial JPE insights.</p>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Re-using Braces icon since it's common in IDEs
function Braces({ className, size = 16 }: { className?: string, size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m8 19-5-5 5-5" />
      <path d="m16 5 5 5-5 5" />
    </svg>
  );
}

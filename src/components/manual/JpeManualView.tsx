"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, BookOpen, ChevronRight, 
  Play, ArrowLeft, History, Bookmark, Share2,
  RefreshCw, Sparkles, Terminal
} from 'lucide-react';
import { T } from '@/components/robust/jpe-theme';
import { motion, AnimatePresence } from '@/components/jpe-motion';
import { useManualStore } from '@/stores/useManualStore';
import { cn } from '@/components/ui/utils';
import { JpeButton, JpeCard, JpeStatusBadge, JpeStatusDot } from '@/components/jpe-design-system';
import { hub } from '@/services/HubService';

export function JpeManualView() {
  const {
    sections,
    activeItemId,
    setActiveSection,
    setActiveItem,
    searchQuery,
    setSearchQuery
  } = useManualStore();

  const [loading, setLoading] = useState(true);

  // Map old property names to new ones for compatibility
  const categories = sections;
  const activeArticle = activeItemId;
  const setActiveCategory = setActiveSection;
  const setActiveArticle = setActiveItem;

  useEffect(() => {
    // Simulate loading internal docs
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const filteredCategories = categories.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.items.some(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const currentArticle = categories
    .flatMap(c => c.items)
    .find(a => a.id === activeArticle);

  return (
    <div data-testid="manual-root" className="flex-1 flex flex-col bg-bgDeep overflow-hidden relative">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: T.noiseSvg }} />
      
      {/* Global Module Header */}
      <header className="h-14 border-b border-border bg-bgSurface/60 backdrop-blur-xl flex items-center justify-between px-6 z-20" style={{ borderColor: T.border }}>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => hub.navigate('dashboard')}
            className="p-2 hover:bg-white/5 rounded-full text-textTertiary hover:text-white transition-all mr-2"
            title="Return to Dashboard"
            data-testid="return-to-dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="p-2 rounded-lg bg-cyan/10 border border-cyan/20">
            <BookOpen className="w-5 h-5 text-cyan" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-widest text-white uppercase italic">JPE_MANUAL_VAULT</h1>
            <div className="flex items-center gap-2 mt-0.5">
               <JpeStatusDot status="ok" size={3} />
               <span className="text-[9px] text-textTertiary font-mono tracking-tighter opacity-70 uppercase">DOCUMENTATION_SERVER: ONLINE</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-textMuted group-focus-within:text-cyan transition-colors" />
              <input 
                type="text" 
                placeholder="SEARCH_DIRECTIVES..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-bgInput/50 border border-border rounded-full py-1.5 pl-9 pr-4 text-[10px] font-mono w-64 focus:w-80 transition-all outline-none focus:border-cyan/40 text-white"
              />
           </div>
           <div className="h-6 w-px bg-border mx-2" />
           <JpeButton variant="secondary" size="sm" icon={History} />
           <JpeButton variant="secondary" size="sm" icon={Bookmark} />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-80 border-r border-border bg-bgPanel/30 backdrop-blur-md flex flex-col z-10" style={{ borderColor: T.border }}>
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            {filteredCategories.map((cat) => (
              <div key={cat.id} className="mb-8">
                <div className="flex items-center gap-2 mb-4 px-2">
                  <Sparkles size={12} className="text-cyan/60" />
                  <h3 className="text-[10px] font-black text-textMuted uppercase tracking-[0.2em]">{cat.title}</h3>
                </div>

                <div className="space-y-1">
                  {cat.items.map((art) => (
                    <button
                      key={art.id}
                      onClick={() => {
                        setActiveCategory(cat.id);
                        setActiveArticle(art.id);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group",
                        activeArticle === art.id 
                          ? "bg-cyan/10 border border-cyan/20 shadow-[0_0_15px_rgba(99,179,237,0.1)]" 
                          : "hover:bg-white/5 border border-transparent"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full transition-all",
                          activeArticle === art.id ? "bg-cyan scale-125 shadow-[0_0_8px_rgba(99,179,237,0.8)]" : "bg-textMuted/30 group-hover:bg-textMuted"
                        )} />
                        <span className={cn(
                          "text-[11px] font-bold tracking-tight transition-colors",
                          activeArticle === art.id ? "text-white" : "text-textSecondary group-hover:text-textPrimary"
                        )}>
                          {art.title.toUpperCase()}
                        </span>
                      </div>
                      {activeArticle === art.id && <ChevronRight size={10} className="text-cyan" />}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 border-t border-border bg-bgPanel/40" style={{ borderColor: T.border }}>
             <JpeCard padding={12} className="bg-cyan/5 border-cyan/10">
                <div className="flex items-center gap-3">
                   <div className="p-2 rounded-lg bg-cyan/20">
                      <Sparkles size={14} className="text-cyan" />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-white italic uppercase">Spectral Guide</p>
                      <p className="text-[8px] font-mono text-cyan/60">AI_ASSIST_ENABLED</p>
                   </div>
                </div>
             </JpeCard>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-bgDeep/30 z-0 relative">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center gap-4"
              >
                <RefreshCw size={24} className="text-cyan animate-spin" />
                <span className="text-[10px] font-mono tracking-widest text-textMuted uppercase">Syncing Directives...</span>
              </motion.div>
            ) : currentArticle ? (
              <motion.div
                key={currentArticle.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto px-12 py-16"
              >
                <div className="flex items-center gap-3 mb-4">
                  <JpeStatusBadge status="ok" label="VERIFIED_SOURCE" compact />
                  <span className="text-[10px] font-mono text-textMuted">LAST_UPDATED: 2024.04.08</span>
                </div>
                
                <h2 className="text-4xl font-black text-white mb-8 tracking-tighter italic" style={{ fontFamily: T.display }}>
                  {currentArticle.title.toUpperCase()}
                </h2>

                <div className="prose prose-invert max-w-none">
                  <p className="text-textSecondary leading-relaxed text-lg mb-8 font-medium italic">
                    {currentArticle.content}
                  </p>

                  <div className="grid gap-6 mt-12">
                     <JpeCard title="TECHNICAL_DETAILS" icon={Terminal} glass>
                        <div className="space-y-4 font-mono text-[11px] text-textSecondary">
                           <p className="border-l-2 border-cyan/30 pl-4 py-1">SOURCE_PATH: /kernel/runtime/exec.jpe</p>
                           <p className="border-l-2 border-violet/30 pl-4 py-1">PERMISSIONS: LEVEL_4_OR_HIGHER</p>
                           <p className="border-l-2 border-emerald/30 pl-4 py-1">LATENCY_IMPACT: &lt; 2MS</p>
                        </div>
                     </JpeCard>

                     <div className="grid grid-cols-2 gap-4">
                        <JpeButton variant="spectral" icon={Play}>EXECUTE_REPL</JpeButton>
                        <JpeButton variant="secondary" icon={Share2}>EXPORT_DIAGRAM</JpeButton>
                     </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-30">
                <BookOpen size={64} className="mb-6" />
                <h2 className="text-xl font-black uppercase tracking-widest italic">Node Selection Required</h2>
                <p className="font-mono text-[11px] mt-2">Select a documentation fragment from the left terminal to begin decryption</p>
              </div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

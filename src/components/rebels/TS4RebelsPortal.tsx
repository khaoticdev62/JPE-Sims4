"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { TS4RebelsService, TS4RebelsTopicSummary, TS4RebelsPost } from '@/services/api/TS4RebelsService';
import { CredentialManager } from '@/services/api/CredentialManager';
import { T } from '@/components/robust/jpe-theme';
import { motion, AnimatePresence } from '@/components/jpe-motion';
import { 
  Search, Globe, Download, ExternalLink, ChevronRight, 
  AlertCircle, RefreshCcw, LayoutGrid, List, Lock, 
  User, ShieldCheck, X, KeyRound, Loader2 
} from 'lucide-react';
import { cn } from '@/components/ui/utils';

/**
 * AuthModal - Premium login modal for TS4Rebels.cc
 */
function AuthModal({ 
  isOpen, 
  onClose, 
  onLogin 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onLogin: (u: string, p: string, remember: boolean) => Promise<void> 
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      CredentialManager.getCredential('ts4rebels-user').then(u => u && setUsername(u));
      CredentialManager.getCredential('ts4rebels-pass').then(p => p && setPassword(p));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onLogin(username, password, remember);
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage || 'Authentication rejected');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="w-full max-w-md bg-bg-secondary border border-white/10 rounded-3xl shadow-2xl relative z-10 overflow-hidden"
      >
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-cyan-400 blur-md opacity-50" />
        
        <div className="p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-xl font-black text-text-primary tracking-tighter" style={{ fontFamily: T.display }}>
                REBEL_AUTHENTICATION
              </h2>
              <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest mt-1">Access Restricted Extraction Layers</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-text-muted transition-colors">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Archive Identity</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-cyan-400 transition-colors">
                  <User size={16} />
                </div>
                <input 
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full bg-bg-tertiary border border-border-subtle focus:border-cyan-400/50 rounded-xl py-3 pl-12 pr-4 text-sm font-medium text-text-primary transition-all outline-none"
                  placeholder="Username"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Access Key</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-cyan-400 transition-colors">
                  <KeyRound size={16} />
                </div>
                <input 
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-bg-tertiary border border-border-subtle focus:border-cyan-400/50 rounded-xl py-3 pl-12 pr-4 text-sm font-medium text-text-primary transition-all outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-3 ml-1 py-1">
              <button 
                type="button"
                onClick={() => setRemember(!remember)}
                className={cn(
                  "w-5 h-5 rounded border transition-all flex items-center justify-center",
                  remember ? "bg-cyan-400 border-cyan-400 text-bg-primary" : "border-border-subtle bg-transparent"
                )}
              >
                {remember && <ShieldCheck size={12} strokeWidth={3} />}
              </button>
              <span className="text-[10px] font-mono text-text-muted uppercase select-none">Remember Credentials (OS Keychain)</span>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex gap-2 items-center"
              >
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-cyan-400 hover:bg-cyan-300 disabled:bg-bg-tertiary disabled:text-text-muted text-bg-primary font-black text-xs tracking-[0.2em] uppercase rounded-2xl transition-all shadow-xl shadow-cyan-400/10 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : "ESTABLISH_AUTH_Link"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * TS4RebelsPortal - Interactive portal for TS4Rebels.cc scraping and extraction.
 */
export function TS4RebelsPortal() {
  const [forumId] = useState<number>(59); // File Donations
  const [topics, setTopics] = useState<TS4RebelsTopicSummary[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
  const [posts, setPosts] = useState<TS4RebelsPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Auth State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authUsername, setAuthUsername] = useState<string | null>(null);
  const [sessionCookiesBase64, setSessionCookiesBase64] = useState<string | null>(null);

  // Initial load
  useEffect(() => {
    // Attempt auto-login if credentials exist
    checkStoredAuth();
    handleFetchForum(forumId);
  }, []);

  const checkStoredAuth = async () => {
    const user = await CredentialManager.getCredential('ts4rebels-user');
    const pass = await CredentialManager.getCredential('ts4rebels-pass');
    if (user && pass) {
      // We don't auto-login to avoid spamming the site, but we track that we HAVE credentials
      setIsAuthenticated(false); 
    }
  };

  const handleLogin = async (u: string, p: string, remember: boolean) => {
    const res = await TS4RebelsService.login(u, p);
    if (res.success && res.data.ok) {
      if (remember) {
        await CredentialManager.saveCredential('ts4rebels-user', u);
        await CredentialManager.saveCredential('ts4rebels-pass', p);
      }
      
      setIsAuthenticated(true);
      setAuthUsername(u);
      
      // Convert cookie dict to base64 JSON for the bridge
      const cookiesJson = JSON.stringify(res.data.cookies);
      const cookiesB64 = btoa(unescape(encodeURIComponent(cookiesJson)));
      setSessionCookiesBase64(cookiesB64);
      
      // Refresh current view with new auth
      if (selectedTopic) {
        handleSelectTopic(selectedTopic, cookiesB64);
      } else {
        handleFetchForum(forumId, cookiesB64);
      }
    } else {
      const msg = res.data.diagnostics?.[0]?.message || res.error || 'Authentication failed';
      throw new Error(msg);
    }
  };

  const handleLogout = async () => {
    setIsAuthenticated(false);
    setAuthUsername(null);
    setSessionCookiesBase64(null);
  };

  const handleFetchForum = async (id: number, cookiesOverride?: string) => {
    setLoading(true);
    setError(null);
    try {
      const cookies = cookiesOverride || sessionCookiesBase64 || undefined;
      const res = await TS4RebelsService.listForum(id, 1, cookies);
      if (res.success) {
        setTopics(res.data.topics);
      } else {
        setError(res.error || 'Failed to sync with TS4Rebels');
      }
    } catch (_) {
      setError('Network synchronization error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTopic = async (topicId: number, cookiesOverride?: string) => {
    setSelectedTopic(topicId);
    setLoading(true);
    try {
      const cookies = cookiesOverride || sessionCookiesBase64 || undefined;
      const res = await TS4RebelsService.getTopic(topicId, 1, cookies);
      if (res.success) {
        setPosts(res.data.posts);
      } else {
        setError(res.error || 'Failed to fetch topic details');
      }
    } catch (_) {
      setError('Failed to resolve topic links');
    } finally {
      setLoading(false);
    }
  };

  const extractedLinks = useMemo(() => TS4RebelsService.extractDownloadLinks(posts), [posts]);

  return (
    <div className="flex-1 flex flex-col bg-bg-primary overflow-hidden relative">
      <AnimatePresence>
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
          onLogin={handleLogin}
        />
      </AnimatePresence>

      {/* Background Cinematic Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header Section */}
      <header className="px-8 py-6 border-b border-border-subtle shrink-0 relative z-10 flex justify-between items-end bg-bg-secondary/40 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2 h-6 bg-cyan-400 rounded-full" />
            <h1 className="text-2xl font-black tracking-tighter text-text-primary" style={{ fontFamily: T.display }}>
              TS4REBELS PORTAL
            </h1>
          </div>
          <p className="text-[10px] font-bold text-text-muted tracking-[0.2em] uppercase pl-5" style={{ fontFamily: T.mono }}>
            Automated Scraper & Link Ingestion Engine
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Auth Button */}
          <button
            onClick={isAuthenticated ? handleLogout : () => setShowAuthModal(true)}
            className={cn(
              "flex items-center gap-2.5 px-4 py-2 rounded-xl border transition-all text-[10px] font-black tracking-widest uppercase",
              isAuthenticated 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20" 
                : "bg-bg-tertiary border-border-subtle text-text-secondary hover:border-cyan-400/40 hover:text-cyan-400"
            )}
          >
            {isAuthenticated ? (
              <>
                <ShieldCheck size={14} />
                <span>Verified: {authUsername}</span>
              </>
            ) : (
              <>
                <Lock size={14} />
                <span>Authenticate</span>
              </>
            )}
          </button>

          <div className="h-8 w-px bg-white/5 mx-2" />

          <div className="flex gap-2">
            <button 
              onClick={() => handleFetchForum(forumId)}
              className="p-2 rounded-lg bg-bg-tertiary hover:bg-bg-hover transition-colors text-text-secondary"
              title="Refresh Registry"
            >
              <RefreshCcw size={16} className={cn(loading && "animate-spin")} />
            </button>
            <div className="flex bg-bg-tertiary rounded-lg p-1">
              <button 
                onClick={() => setViewMode('list')}
                className={cn("p-1.5 rounded transition-all", viewMode === 'list' ? "bg-bg-primary text-cyan-400 shadow-lg" : "text-text-muted")}
              >
                <List size={14} />
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={cn("p-1.5 rounded transition-all", viewMode === 'grid' ? "bg-bg-primary text-cyan-400 shadow-lg" : "text-text-muted")}
              >
                <LayoutGrid size={14} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden p-8 gap-8 relative z-10">
        
        {/* Topic Feed (Left) */}
        <section className="flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs font-bold text-text-secondary tracking-widest uppercase">Community Archive Feed</h3>
            <span className="text-[10px] font-mono text-cyan-400/60">{topics.length} TOPICS DISCOVERED</span>
          </div>

          <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
            {loading && topics.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-40">
                <div className="w-12 h-12 rounded-full border-2 border-cyan-400/20 border-t-cyan-400 animate-spin mb-4" />
                <span className="text-xs font-mono">ESTABLISHING HANDSHAKE...</span>
              </div>
            ) : error ? (
              <div className="h-40 flex flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 text-red-400 p-6">
                <AlertCircle size={24} className="mb-2" />
                <p className="text-sm font-bold text-center">{error}</p>
                <button 
                  onClick={() => handleFetchForum(forumId)}
                  className="mt-4 text-xs underline underline-offset-4 hover:text-red-300"
                >
                  Retry Connection
                </button>
              </div>
            ) : (
              <div className="grid gap-3">
                {topics.map((topic) => (
                  <motion.div
                    key={topic.topic_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => handleSelectTopic(topic.topic_id)}
                    className={cn(
                      "group p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden",
                      selectedTopic === topic.topic_id 
                        ? "bg-bg-secondary border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.1)]" 
                        : "bg-bg-secondary/40 border-border-subtle hover:border-cyan-500/30 hover:bg-bg-secondary"
                    )}
                  >
                    {/* Active Indicator */}
                    {selectedTopic === topic.topic_id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                    )}

                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-text-primary text-sm line-clamp-1 group-hover:text-cyan-300 transition-colors">
                        {topic.title}
                      </h4>
                      <span className="text-[10px] font-mono text-text-muted mt-1 shrink-0">#{topic.topic_id}</span>
                    </div>

                    <div className="flex items-center gap-4 text-[10px] text-text-muted font-mono">
                      <span className="flex items-center gap-1.5"><Globe size={10} className="text-violet-400" /> {topic.author}</span>
                      <span className="opacity-30">•</span>
                      <span>REPLIES: {topic.reply_count}</span>
                      <span className="opacity-30">•</span>
                      <span>VIEWS: {topic.view_count}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Action Panel (Right) */}
        <aside className="w-96 flex flex-col gap-6">
          <div className="p-6 rounded-2xl border border-border-subtle bg-bg-secondary/40 backdrop-blur-md relative overflow-hidden">
             <h3 className="text-xs font-black tracking-[0.2em] text-text-secondary uppercase mb-6 flex items-center gap-2">
               <Search size={14} className="text-cyan-400" /> REBELS_INTEL_EXTRACTOR
             </h3>

             {selectedTopic ? (
               <div className="space-y-6">
                 <div>
                   <label className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-3 block">Extracted Links</label>
                   {loading && posts.length === 0 ? (
                      <div className="animate-pulse space-y-2">
                        {[1,2,3].map(i => <div key={i} className="h-8 bg-white/5 rounded-lg" />)}
                      </div>
                   ) : extractedLinks.length > 0 ? (
                     <div className="space-y-2">
                       {extractedLinks.map((link, idx) => (
                         <div 
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-bg-tertiary border border-border-subtle hover:border-cyan-500/40 group transition-all"
                         >
                           <div className="flex items-center gap-3 overflow-hidden">
                             <div className="p-2 rounded-lg bg-cyan-400/10 text-cyan-400 shrink-0">
                               <Download size={14} />
                             </div>
                             <div className="overflow-hidden">
                               <p className="text-[11px] font-bold text-text-primary truncate">{link.label || 'Direct Download'}</p>
                               <p className="text-[9px] font-mono text-text-muted truncate">{link.host}</p>
                             </div>
                           </div>
                           <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                             <a 
                              href={link.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-md hover:bg-cyan-400/20 text-text-muted hover:text-cyan-400 transition-all"
                             >
                               <ExternalLink size={14} />
                             </a>
                           </div>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <div className="p-4 bg-bg-tertiary/50 rounded-xl border border-dashed border-border-subtle text-center">
                        <Lock size={20} className="mx-auto mb-2 text-text-muted opacity-30" />
                        <p className="text-[10px] text-text-muted font-mono italic">
                          {isAuthenticated 
                            ? "No mod-specific download links detected in this thread." 
                            : "Contents may be restricted to authenticated members."}
                        </p>
                        {!isAuthenticated && (
                          <button 
                            onClick={() => setShowAuthModal(true)}
                            className="mt-3 text-[9px] font-black text-cyan-400 uppercase tracking-widest hover:text-cyan-300 underline underline-offset-4"
                          >
                            Authenticate Now
                          </button>
                        )}
                     </div>
                   )}
                 </div>

                 <button className="w-full py-3 rounded-xl bg-cyan-400 text-bg-primary font-black text-xs tracking-widest uppercase hover:bg-cyan-300 transition-all shadow-[0_4px_20px_rgba(34,211,238,0.2)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                   START INGUSTION (SAFE)
                 </button>
               </div>
             ) : (
               <div className="h-64 flex flex-col items-center justify-center text-center opacity-30">
                 <div className="w-16 h-16 rounded-full border-2 border-dashed border-text-muted mb-4 flex items-center justify-center">
                    <ChevronRight size={24} />
                 </div>
                 <p className="text-[11px] font-mono max-w-[200px]">Select a topic from the archive to begin payload extraction</p>
               </div>
             )}
          </div>

          <div className="flex-1 p-6 rounded-2xl border border-border-subtle bg-bg-secondary/20 relative overflow-hidden">
             <div className={cn("absolute inset-0 bg-bg-primary/40 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-6 text-center transition-all", isAuthenticated ? "opacity-0 pointer-events-none" : "opacity-100")}>
                <Lock size={24} className="text-text-muted mb-3 opacity-50" />
                <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Authentication Required for Real-time Telemetry</p>
             </div>
             
             <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">INGESTION_STATS</h3>
             <div className="space-y-4">
                <div className="flex justify-between items-end border-b border-white/5 pb-2">
                   <span className="text-[10px] font-mono text-text-secondary">ARCHIVE_VISIBILITY:</span>
                   <span className={cn("text-[10px] font-mono font-bold", isAuthenticated ? "text-emerald-400" : "text-text-muted")}>
                     {isAuthenticated ? "OPTIMAL" : "LIMITED"}
                   </span>
                </div>
                <div className="flex justify-between items-end border-b border-white/5 pb-2">
                   <span className="text-[10px] font-mono text-text-secondary">SYNC_LATENCY:</span>
                   <span className="text-[10px] font-mono text-violet-400 font-bold">142MS</span>
                </div>
                <div className="flex justify-between items-end border-b border-white/5 pb-2">
                   <span className="text-[10px] font-mono text-text-secondary">PAYLOAD_INTEGRITY:</span>
                   <span className="text-[10px] font-mono text-cyan-400 font-bold">VERIFIED</span>
                </div>
                <div className="flex justify-between items-end border-b border-white/5 pb-2">
                   <span className="text-[10px] font-mono text-text-secondary">VAULT_SESSION:</span>
                   <span className={cn("text-[10px] font-mono font-bold", isAuthenticated ? "text-emerald-400" : "text-red-400")}>
                     {isAuthenticated ? "ACTIVE" : "INACTIVE"}
                   </span>
                </div>
             </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

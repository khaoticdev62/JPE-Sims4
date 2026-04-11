"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { TS4RebelsService, TS4RebelsTopicSummary, TS4RebelsPost } from '@/services/api/TS4RebelsService';
import { CredentialManager } from '@/services/api/CredentialManager';
import { T } from '@/components/robust/jpe-theme';
import { motion, AnimatePresence } from '@/components/jpe-motion';
import { 
  Search, Download, ExternalLink, ChevronRight, 
  AlertCircle, RefreshCcw, LayoutGrid, List, Lock, 
  User, ShieldCheck, KeyRound, Loader2, Database,
  Cpu, Zap, ArrowLeft
} from 'lucide-react';
import { cn } from '@/components/ui/utils';
import { JpeButton, JpeCard, JpeGlassPanel, JpeStatusBadge, JpeStatusDot, JpeProgressBar } from '@/components/jpe-design-system';
import { hub } from '@/services/HubService';

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
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xl"
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="w-full max-w-sm relative z-10"
      >
        <JpeCard 
          title="REBEL_AUTHENTICATION" 
          icon={Lock}
          padding={0}
          glass={true}
        >
          <div className="p-8">
            <div className="mb-8">
              <p className="text-[10px] font-mono text-textMuted uppercase tracking-widest mt-1">Access Restricted Extraction Layers</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-textMuted uppercase tracking-widest ml-1">Archive Identity</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted group-focus-within:text-cyan transition-colors">
                    <User size={14} />
                  </div>
                  <input 
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full rounded-xl py-2.5 pl-11 pr-4 text-[11px] font-medium transition-all outline-none"
                    style={{ background: T.bgInput, border: `1px solid ${T.border}`, color: T.textPrimary }}
                    placeholder="USERNAME"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-textMuted uppercase tracking-widest ml-1">Access Key</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted group-focus-within:text-cyan transition-colors">
                    <KeyRound size={14} />
                  </div>
                  <input 
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full rounded-xl py-2.5 pl-11 pr-4 text-[11px] font-medium transition-all outline-none"
                    style={{ background: T.bgInput, border: `1px solid ${T.border}`, color: T.textPrimary }}
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
                    "w-4 h-4 rounded border transition-all flex items-center justify-center",
                    remember ? "bg-cyan border-cyan text-black" : "border-borderSubtle bg-transparent"
                  )}
                >
                  {remember && <ShieldCheck size={10} strokeWidth={3} />}
                </button>
                <span className="text-[9px] font-mono text-textMuted uppercase select-none tracking-tight">Remember Credentials (OS Keychain)</span>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-rose/10 border border-rose/20 text-rose text-[10px] flex gap-2 items-center">
                  <AlertCircle size={12} className="shrink-0" />
                  <span>{error.toUpperCase()}</span>
                </div>
              )}

              <JpeButton 
                variant="spectral" 
                className="w-full mt-2" 
                size="lg"
                loading={loading}
              >
                ESTABLISH_AUTH_LINK
              </JpeButton>
            </form>
          </div>
        </JpeCard>
      </motion.div>
    </div>
  );
}

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

  useEffect(() => {
    checkStoredAuth();
    handleFetchForum(forumId);
  }, []);

  const checkStoredAuth = async () => {
    const user = await CredentialManager.getCredential('ts4rebels-user');
    const pass = await CredentialManager.getCredential('ts4rebels-pass');
    if (user && pass) {
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
      
      const cookiesJson = JSON.stringify(res.data.cookies);
      const cookiesB64 = btoa(unescape(encodeURIComponent(cookiesJson)));
      setSessionCookiesBase64(cookiesB64);
      
      if (selectedTopic) {
        handleSelectTopic(selectedTopic, cookiesB64);
      } else {
        handleFetchForum(forumId, cookiesB64);
      }
    } else {
      const diagMsg = res.data.diagnostics?.[0]?.message;
      const msg = typeof diagMsg === 'string' ? diagMsg : res.error || 'Authentication failed';
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Network synchronization error');
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to resolve topic links');
    } finally {
      setLoading(false);
    }
  };

  const extractedLinks = useMemo(() => TS4RebelsService.extractDownloadLinks(posts), [posts]);

  return (
    <div className="flex-1 flex flex-col bg-bgDeep overflow-hidden relative">
      <AnimatePresence>
        {showAuthModal && (
          <AuthModal 
            isOpen={showAuthModal} 
            onClose={() => setShowAuthModal(false)} 
            onLogin={handleLogin}
          />
        )}
      </AnimatePresence>

      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: T.noiseSvg }} />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header Section */}
      <header className="h-14 border-b shrink-0 relative z-10 flex justify-between items-center bg-bgPanel/60 backdrop-blur-xl px-6" style={{ borderColor: T.border }}>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => hub.navigate('dashboard')}
            className="p-2 hover:bg-white/5 rounded-full text-textTertiary hover:text-white transition-all mr-2"
            title="Return to Dashboard"
            data-testid="return-to-dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1.5 h-5 bg-cyan rounded-full shadow-[0_0_10px_rgba(99,179,237,0.5)]" />
              <h1 className="text-xl font-black tracking-tighter text-white uppercase italic" style={{ fontFamily: T.display }}>
                TS4Rebels Portal
              </h1>
            </div>
            <p className="text-[9px] font-black text-textMuted tracking-[0.2em] uppercase pl-5" style={{ fontFamily: T.mono }}>
              Automated Scraper & Ingestion Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <JpeButton
            variant={isAuthenticated ? "success" : "secondary"}
            size="sm"
            icon={isAuthenticated ? ShieldCheck : Lock}
            onClick={isAuthenticated ? handleLogout : () => setShowAuthModal(true)}
          >
            {isAuthenticated ? `VERIFIED: ${authUsername?.toUpperCase()}` : "AUTHENTICATE"}
          </JpeButton>

          <div className="h-6 w-px bg-white/5 mx-1" />

          <div className="flex gap-1.5">
            <JpeButton 
              variant="secondary"
              size="sm"
              icon={RefreshCcw}
              onClick={() => handleFetchForum(forumId)}
              loading={loading && topics.length > 0}
            />
            <div className="flex bg-bgInput rounded-lg p-0.5 border border-white/5">
              <button 
                onClick={() => setViewMode('list')}
                className={cn("p-1.5 rounded-md transition-all", viewMode === 'list' ? "bg-white/5 text-cyan" : "text-textMuted hover:text-textSecondary")}
              >
                <List size={12} />
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={cn("p-1.5 rounded-md transition-all", viewMode === 'grid' ? "bg-white/5 text-cyan" : "text-textMuted hover:text-textSecondary")}
              >
                <LayoutGrid size={12} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden p-8 gap-8 relative z-10">
        
        {/* Topic Feed (Left) */}
        <section className="flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-2">
               <Database size={12} color={T.cyan} />
               <h3 className="text-[10px] font-black text-textSecondary tracking-[0.2em] uppercase">Archive Feed</h3>
            </div>
            <span className="text-[9px] font-mono text-cyan/50 tracking-tighter">{topics.length} DISCOVERED ENTRIES</span>
          </div>

          <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
            {loading && topics.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-40">
                <Loader2 size={24} className="text-cyan animate-spin mb-4" />
                <span className="text-[10px] font-mono tracking-widest uppercase">ESTABLISHING HANDSHAKE...</span>
              </div>
            ) : error ? (
              <div className="h-40 flex flex-col items-center justify-center rounded-2xl border border-rose/20 bg-rose/5 text-rose p-6">
                <AlertCircle size={24} className="mb-2" />
                <p className="text-xs font-bold text-center">{error.toUpperCase()}</p>
                <button 
                  onClick={() => handleFetchForum(forumId)}
                  className="mt-4 text-[10px] font-black uppercase tracking-widest underline underline-offset-4 hover:text-roseBright transition-colors"
                >
                  RETRY_CONNECTION
                </button>
              </div>
            ) : (
              <div className={cn("grid gap-3 transition-opacity duration-300", loading ? "opacity-50" : "opacity-100")}>
                {topics.map((topic, idx) => (
                  <motion.div
                    key={topic.topic_id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    onClick={() => handleSelectTopic(topic.topic_id)}
                    className={cn(
                      "group p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden backdrop-blur-sm",
                      selectedTopic === topic.topic_id 
                        ? "bg-bgPanel border-cyan/40 shadow-[0_0_20px_rgba(99,179,237,0.15)]" 
                        : "bg-bgPanel/30 border-border hover:border-cyan/30 hover:bg-bgPanel/50"
                    )}
                  >
                    {selectedTopic === topic.topic_id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan shadow-[0_0_12px_rgba(99,179,237,0.5)]" />
                    )}

                    <div className="flex justify-between items-start mb-2">
                      <h4 className={cn(
                        "font-black text-xs line-clamp-1 transition-colors uppercase tracking-tight italic",
                        selectedTopic === topic.topic_id ? "text-white" : "text-textSecondary group-hover:text-white"
                      )}>
                        {topic.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] font-mono text-textMuted">#{topic.topic_id}</span>
                        <ChevronRight size={10} className={cn("transition-transform", selectedTopic === topic.topic_id ? "translate-x-1 text-cyan" : "text-textMuted group-hover:translate-x-0.5")} />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-[9px] text-textMuted font-mono font-medium">
                      <span className="flex items-center gap-1.5"><User size={10} color={T.violet} /> {topic.author.toUpperCase()}</span>
                      <span className="opacity-20">•</span>
                      <span>REPLIES: {topic.reply_count}</span>
                      <span className="opacity-20">•</span>
                      <span>VIEWS: {topic.view_count}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Action Panel (Right) */}
        <aside className="w-[400px] flex flex-col gap-6">
          <JpeCard 
            title="INTEL_EXTRACTOR" 
            icon={Search}
            className="flex-shrink-0"
          >
             {selectedTopic ? (
               <div className="space-y-6">
                 <div>
                    <div className="flex items-center justify-between mb-4">
                       <label className="text-[9px] font-black text-textMuted uppercase tracking-widest">Extracted Links</label>
                       {extractedLinks.length > 0 && <JpeStatusBadge status="running" label={`${extractedLinks.length} DETECTED`} compact />}
                    </div>

                    {loading && posts.length === 0 ? (
                       <div className="animate-pulse space-y-2">
                         {[1,2,3].map(i => <div key={i} className="h-10 bg-white/5 rounded-lg" />)}
                       </div>
                    ) : extractedLinks.length > 0 ? (
                      <div className="space-y-2">
                        {extractedLinks.map((link, idx) => (
                           <div 
                            key={idx}
                            className="flex items-center justify-between p-2.5 rounded-lg bg-bgInput border border-border group transition-all hover:border-cyan/30"
                           >
                             <div className="flex items-center gap-3 overflow-hidden">
                               <div className="p-2 rounded-lg bg-cyan/10 text-cyan shrink-0">
                                 <Download size={14} />
                               </div>
                               <div className="overflow-hidden">
                                 <p className="text-[10px] font-black text-white truncate uppercase tracking-tight">{link.label || 'DIRECT_DOWNLOAD'}</p>
                                 <p className="text-[8px] font-mono text-textMuted truncate">{link.host.toUpperCase()}</p>
                               </div>
                             </div>
                             <div className="flex items-center gap-2">
                               <a 
                                 href={link.url} 
                                 target="_blank" 
                                 rel="noopener noreferrer"
                                 className="p-1.5 rounded-md hover:bg-cyan/10 text-textMuted hover:text-cyan transition-all"
                               >
                                 <ExternalLink size={12} />
                               </a>
                             </div>
                           </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 bg-bgInput rounded-xl border border-dashed border-border text-center">
                         <Lock size={20} className="mx-auto mb-3 text-textMuted opacity-20" />
                         <p className="text-[10px] text-textMuted font-mono italic leading-relaxed px-4">
                           {isAuthenticated 
                             ? "No primary mod strings or download patterns identified in this thread." 
                             : "AUTHENTICATION_LEVEL_INSUFFICIENT: Payload content encrypted by forum gate."}
                         </p>
                         {!isAuthenticated && (
                            <JpeButton 
                              variant="ghost" 
                              size="xs" 
                              className="mt-4 underline"
                              onClick={() => setShowAuthModal(true)}
                            >
                               BYPASS_LOCK
                            </JpeButton>
                         )}
                      </div>
                    )}
                 </div>

                 <JpeButton 
                    variant="spectral" 
                    size="lg" 
                    className="w-full" 
                    icon={Zap}
                    disabled={extractedLinks.length === 0}
                 >
                    START_INGESTION_SYTH
                 </JpeButton>
               </div>
             ) : (
               <div className="h-64 flex flex-col items-center justify-center text-center opacity-20">
                  <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-textMuted mb-4 flex items-center justify-center">
                     <ChevronRight size={20} />
                  </div>
                  <p className="text-[10px] font-mono max-w-[200px] uppercase tracking-widest">Select Archive Node to Begin extraction</p>
               </div>
             )}
          </JpeCard>

          <JpeGlassPanel className="flex-1 flex flex-col relative overflow-hidden" padding={20}>
             {!isAuthenticated && (
               <div className="absolute inset-0 bg-bgDeep/40 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-6 text-center">
                  <Lock size={24} className="text-textMuted mb-3 opacity-30" />
                  <p className="text-[9px] font-black text-textMuted uppercase tracking-widest leading-loose">Handshake Required for<br/>Real-time Telemetry</p>
               </div>
             )}
             
             <div className="flex items-center gap-2 mb-6">
                <Cpu size={12} color={T.violet} />
                <h3 className="text-[10px] font-black text-textSecondary uppercase tracking-[0.2em]">Ingestion Stats</h3>
             </div>

             <div className="space-y-6">
                <StatRow label="ARCHIVE_VISIBILITY" value={isAuthenticated ? "OPTIMAL" : "LIMITED"} status={isAuthenticated ? "ok" : "warning"} />
                <StatRow label="SYNC_LATENCY" value="142MS" status="ok" />
                <StatRow label="PAYLOAD_INTEGRITY" value="98.2%" status="running" />
                <StatRow label="VAULT_SESSION" value={isAuthenticated ? "ACTIVE" : "INACTIVE"} status={isAuthenticated ? "ok" : "error"} />
                
                <div className="pt-4 mt-auto border-t border-white/5 space-y-3">
                   <JpeProgressBar value={isAuthenticated ? 100 : 25} label="SESSION_LINK_LOAD" height={2} color={T.cyan} animated />
                   <JpeProgressBar value={extractedLinks.length > 0 ? 80 : 0} label="DATA_STREAM_READY" height={2} color={T.violet} animated />
                </div>
             </div>
          </JpeGlassPanel>
        </aside>
      </main>
    </div>
  );
}

function StatRow({ label, value, status }: { label: string, value: string, status: "ok" | "error" | "warning" | "running" | "idle" }) {
  return (
    <div className="flex items-center justify-between group">
       <span className="text-[9px] font-mono text-textMuted group-hover:text-textSecondary transition-colors">{label}</span>
       <div className="flex items-center gap-2">
          <span className="text-[9px] font-black tracking-tight text-white">{value.toUpperCase()}</span>
          <JpeStatusDot status={status} size={4} pulse={status === 'running'} />
       </div>
    </div>
  );
}

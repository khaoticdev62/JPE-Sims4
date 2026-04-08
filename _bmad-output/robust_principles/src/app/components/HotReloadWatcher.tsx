/* ─────────────────────────────────────────────────────────────
   JPE Studio — Hot Reload Watcher (Phase 21)
   Real-time file watcher panel: dirty files, auto-reload queue,
   game notification log, and session change summary.
   ───────────────────────────────────────────────────────────── */
import { useState, useEffect, useCallback } from "react";
import {
  X, Activity, FileCode, FileText, Zap, Check, AlertTriangle,
  RefreshCw, Play, Pause, Trash2, Bell, Clock, Circle,
  ChevronRight, Database, Shield,
} from "lucide-react";
import { motion, AnimatePresence } from "./jpe-motion";
import { T } from "../pages/jpe-theme";
import { toast } from "sonner";

/* ── Types ── */
type FileState = "clean" | "dirty" | "reloading" | "error";

interface WatchedFile {
  id: string;
  path: string;
  type: "xml" | "stbl" | "package" | "binary";
  state: FileState;
  changes: number;
  lastModified: string;
}

interface ReloadEvent {
  id: string;
  ts: string;
  file: string;
  result: "success" | "error" | "pending";
  ms: number;
  msg?: string;
}

/* ── Mock data ── */
const INITIAL_FILES: WatchedFile[] = [
  { id:"f1", path:"trait_Evil.xml",            type:"xml",     state:"dirty",     changes:3, lastModified:"14:41:02" },
  { id:"f2", path:"buff_EvilGlee.xml",          type:"xml",     state:"clean",     changes:0, lastModified:"14:38:17" },
  { id:"f3", path:"interaction_Hug.xml",        type:"xml",     state:"dirty",     changes:1, lastModified:"14:42:08" },
  { id:"f4", path:"strings_en-US.stbl",        type:"stbl",    state:"clean",     changes:0, lastModified:"14:37:54" },
  { id:"f5", path:"strings_es-ES.stbl",        type:"stbl",    state:"dirty",     changes:2, lastModified:"14:41:55" },
  { id:"f6", path:"skill_Mischief.xml",         type:"xml",     state:"clean",     changes:0, lastModified:"14:35:00" },
  { id:"f7", path:"catalog_EvilTrait.binary",   type:"binary",  state:"error",     changes:0, lastModified:"14:30:11" },
];

const INITIAL_LOG: ReloadEvent[] = [
  { id:"e1", ts:"14:42:09", file:"interaction_Hug.xml",  result:"success", ms:112 },
  { id:"e2", ts:"14:41:57", file:"strings_es-ES.stbl",   result:"pending", ms:0   },
  { id:"e3", ts:"14:41:06", file:"trait_Evil.xml",       result:"success", ms:94  },
  { id:"e4", ts:"14:39:41", file:"buff_EvilGlee.xml",    result:"success", ms:87  },
  { id:"e5", ts:"14:38:00", file:"catalog_EvilTrait.bin",result:"error",   ms:0,  msg:"Binary schema mismatch at offset 0x2C" },
  { id:"e6", ts:"14:37:55", file:"strings_en-US.stbl",   result:"success", ms:63  },
  { id:"e7", ts:"14:35:04", file:"skill_Mischief.xml",   result:"success", ms:101 },
];

const TYPE_CFG: Record<WatchedFile["type"],{icon:typeof FileCode;color:string}> = {
  xml:     { icon:FileCode, color:T.cyan   },
  stbl:    { icon:FileText, color:T.violet },
  package: { icon:Database, color:T.amber  },
  binary:  { icon:Database, color:T.textMuted },
};

const STATE_CFG: Record<FileState,{color:string;label:string}> = {
  clean:     { color:T.emerald,  label:"Clean"     },
  dirty:     { color:T.amber,    label:"Modified"  },
  reloading: { color:T.cyan,     label:"Reloading" },
  error:     { color:T.rose,     label:"Error"     },
};

function timeNow() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`;
}

export function HotReloadWatcher({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [files, setFiles]     = useState<WatchedFile[]>(INITIAL_FILES);
  const [log, setLog]         = useState<ReloadEvent[]>(INITIAL_LOG);
  const [watching, setWatching] = useState(true);
  const [autoReload, setAutoReload] = useState(true);
  const [gameConnected] = useState(true);

  // Simulate a random file becoming dirty while watching
  useEffect(() => {
    if (!watching) return;
    const interval = setInterval(() => {
      setFiles(prev => {
        const cleanIdx = prev.findIndex(f => f.state === "clean");
        if (cleanIdx === -1) return prev;
        const next = [...prev];
        next[cleanIdx] = { ...next[cleanIdx], state: "dirty", changes: next[cleanIdx].changes + 1, lastModified: timeNow() };
        return next;
      });
    }, 8000);
    return () => clearInterval(interval);
  }, [watching]);

  const reloadFile = useCallback((id: string) => {
    const file = files.find(f => f.id === id);
    if (!file || file.state === "error") return;
    setFiles(prev => prev.map(f => f.id === id ? { ...f, state: "reloading" } : f));
    const ms = 80 + Math.floor(Math.random() * 100);
    setTimeout(() => {
      setFiles(prev => prev.map(f => f.id === id ? { ...f, state: "clean", changes: 0 } : f));
      const newEvent: ReloadEvent = { id: `e${Date.now()}`, ts: timeNow(), file: file.path, result: "success", ms };
      setLog(prev => [newEvent, ...prev.slice(0, 19)]);
      toast.success(`Reloaded: ${file.path}`, { description: `${ms}ms` });
    }, ms + 200);
  }, [files]);

  const reloadAll = () => {
    files.filter(f => f.state === "dirty").forEach(f => reloadFile(f.id));
  };

  const clearLog = () => setLog([]);

  const dirtyCount = files.filter(f => f.state === "dirty").length;
  const reloadingCount = files.filter(f => f.state === "reloading").length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-[200] flex items-center justify-center"
          initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
          style={{background:"rgba(0,0,0,0.82)",backdropFilter:"blur(12px)"}}
          onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
          <motion.div initial={{opacity:0,scale:0.97,y:12}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.97,y:12}}
            transition={{duration:0.22,ease:[0.16,1,0.3,1]}}
            className="relative flex flex-col rounded-2xl overflow-hidden"
            style={{width:"min(880px,97vw)",height:"min(660px,90vh)",background:T.bgElevated,border:`1px solid ${T.border}`,boxShadow:`0 40px 80px rgba(0,0,0,0.7),inset 0 1px 0 rgba(255,255,255,0.04)`}}>

            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{background:`linear-gradient(90deg,transparent 5%,${T.emerald}80,${T.cyan}80,transparent 95%)`}}/>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 flex-shrink-0" style={{borderBottom:`1px solid ${T.border}`}}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:`linear-gradient(135deg,${T.emerald}20,${T.cyan}20)`,border:`1px solid ${T.borderSubtle}`}}>
                  <Activity size={16} color={T.emerald}/>
                </div>
                <div>
                  <div style={{fontSize:15,fontWeight:700,color:T.textPrimary,fontFamily:T.display}}>Hot Reload Watcher</div>
                  <div style={{fontSize:10,color:T.textMuted,fontFamily:T.mono}}>{files.length} files watched · {dirtyCount} modified · {reloadingCount} reloading</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Game connection */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{background:gameConnected?T.emeraldDim:"rgba(255,255,255,0.03)",border:`1px solid ${gameConnected?`${T.emerald}30`:T.borderSubtle}`}}>
                  <div className={`w-1.5 h-1.5 rounded-full ${gameConnected?"bg-emerald-400 animate-pulse":"bg-gray-600"}`}/>
                  <span style={{fontSize:10,color:gameConnected?T.emerald:T.textMuted}}>{gameConnected?"Game Connected":"Game Offline"}</span>
                </div>
                {/* Watcher toggle */}
                <button onClick={()=>setWatching(p=>!p)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
                  style={{fontSize:10,color:watching?T.amber:T.textMuted,background:watching?T.amberDim:"rgba(255,255,255,0.02)",border:`1px solid ${watching?`${T.amber}30`:T.borderSubtle}`}}>
                  {watching?<><Pause size={11}/> Watching</>:<><Play size={11}/> Start</>}
                </button>
                {/* Auto-reload */}
                <button onClick={()=>setAutoReload(p=>!p)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
                  style={{fontSize:10,color:autoReload?T.cyan:T.textMuted,background:autoReload?T.cyanDim:"rgba(255,255,255,0.02)",border:`1px solid ${autoReload?`${T.cyan}30`:T.borderSubtle}`}}>
                  <Zap size={11}/> Auto
                </button>
                {/* Reload all dirty */}
                {dirtyCount > 0 && (
                  <button onClick={reloadAll}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
                    style={{fontSize:10,fontWeight:700,color:"#fff",background:`linear-gradient(135deg,${T.emerald}CC,${T.cyan}CC)`}}>
                    <RefreshCw size={11}/> Reload {dirtyCount}
                  </button>
                )}
                <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all" style={{border:`1px solid ${T.borderSubtle}`}}>
                  <X size={14} color={T.textMuted}/>
                </button>
              </div>
            </div>

            <div className="flex flex-1 min-h-0 overflow-hidden">
              {/* File list */}
              <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                {/* Table header */}
                <div className="grid px-4 py-2 flex-shrink-0" style={{gridTemplateColumns:"30px 1fr 80px 60px 70px 60px",gap:8,background:T.bgSurface,borderBottom:`1px solid ${T.border}`}}>
                  {["","File","Type","Changes","Modified","Action"].map(h=>(
                    <span key={h} style={{fontSize:8,fontWeight:700,color:T.textMuted,letterSpacing:"0.06em",textTransform:"uppercase"}}>{h}</span>
                  ))}
                </div>
                {/* Rows */}
                <div className="flex-1 overflow-y-auto">
                  {files.map(file=>{
                    const tc = TYPE_CFG[file.type]; const sc = STATE_CFG[file.state];
                    const Icon = tc.icon;
                    return (
                      <motion.div key={file.id}
                        animate={{background:file.state==="dirty"?`${T.amber}04`:file.state==="error"?`${T.rose}04`:"transparent"}}
                        className="grid items-center px-4 py-2.5 transition-colors"
                        style={{gridTemplateColumns:"30px 1fr 80px 60px 70px 60px",gap:8,borderBottom:`1px solid ${T.borderSubtle}`}}>
                        {/* Status dot */}
                        <div className="flex items-center justify-center">
                          {file.state==="reloading"
                            ? <RefreshCw size={11} color={T.cyan} className="animate-spin"/>
                            : <div className="w-2 h-2 rounded-full" style={{background:sc.color,boxShadow:file.state!=="clean"?`0 0 6px ${sc.color}60`:undefined}}/>
                          }
                        </div>
                        {/* File path */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <Icon size={11} color={tc.color}/>
                            <span className="truncate" style={{fontSize:11,fontFamily:T.mono,color:T.textSecondary}}>{file.path}</span>
                          </div>
                          <span className="px-1 py-0 rounded" style={{fontSize:8,color:sc.color,background:`${sc.color}10`}}>{sc.label}</span>
                        </div>
                        <span style={{fontSize:9,fontFamily:T.mono,color:T.textTertiary}}>{file.type.toUpperCase()}</span>
                        <span style={{fontSize:11,fontFamily:T.mono,color:file.changes>0?T.amber:T.textDim,fontWeight:file.changes>0?700:400}}>{file.changes}</span>
                        <span style={{fontSize:9,fontFamily:T.mono,color:T.textDim}}>{file.lastModified}</span>
                        {/* Action */}
                        <div>
                          {file.state==="dirty"&&(
                            <button onClick={()=>reloadFile(file.id)}
                              className="flex items-center gap-1 px-2 py-1 rounded-md transition-all"
                              style={{fontSize:9,color:T.emerald,background:T.emeraldDim}}>
                              <RefreshCw size={9}/> Reload
                            </button>
                          )}
                          {file.state==="error"&&(
                            <button onClick={()=>toast.error(`${file.path}: Binary schema mismatch`)}
                              className="flex items-center gap-1 px-2 py-1 rounded-md"
                              style={{fontSize:9,color:T.rose,background:T.roseDim}}>
                              <AlertTriangle size={9}/> Error
                            </button>
                          )}
                          {file.state==="clean"&&<Check size={11} color={T.emerald}/>}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Reload log */}
              <div className="flex flex-col flex-shrink-0 overflow-hidden" style={{width:300,borderLeft:`1px solid ${T.border}`}}>
                <div className="flex items-center justify-between px-4 py-2.5 flex-shrink-0" style={{borderBottom:`1px solid ${T.border}`,background:T.bgSurface}}>
                  <div className="flex items-center gap-2">
                    <Bell size={11} color={T.textMuted}/>
                    <span style={{fontSize:9,fontWeight:700,color:T.textMuted,letterSpacing:"0.06em"}}>RELOAD LOG</span>
                  </div>
                  <button onClick={clearLog} className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-white/5 transition-all" style={{fontSize:9,color:T.textDim}}>
                    <Trash2 size={9}/> Clear
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  <AnimatePresence mode="popLayout">
                    {log.map(evt=>(
                      <motion.div key={evt.id}
                        initial={{opacity:0,x:20,height:0}} animate={{opacity:1,x:0,height:"auto"}} exit={{opacity:0,height:0}}
                        transition={{duration:0.2}}
                        className="px-3 py-2 rounded-lg"
                        style={{background:evt.result==="success"?`${T.emerald}06`:evt.result==="error"?`${T.rose}06`:`${T.cyan}06`,
                          border:`1px solid ${evt.result==="success"?T.emerald:evt.result==="error"?T.rose:T.cyan}15`}}>
                        <div className="flex items-center justify-between mb-0.5">
                          <span style={{fontSize:9,fontFamily:T.mono,color:T.textDim}}>{evt.ts}</span>
                          {evt.result==="success"&&<span style={{fontSize:8,fontFamily:T.mono,color:T.emerald}}>{evt.ms}ms</span>}
                          {evt.result==="error"&&<AlertTriangle size={9} color={T.rose}/>}
                          {evt.result==="pending"&&<RefreshCw size={9} color={T.cyan} className="animate-spin"/>}
                        </div>
                        <div className="truncate" style={{fontSize:10,fontFamily:T.mono,color:evt.result==="success"?T.textSecondary:evt.result==="error"?T.rose:T.cyan}}>{evt.file}</div>
                        {evt.msg&&<div style={{fontSize:9,color:T.rose,marginTop:2,lineHeight:1.3}}>{evt.msg}</div>}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {log.length===0&&<div className="flex items-center justify-center py-12" style={{color:T.textMuted,fontSize:11}}>No events yet</div>}
                </div>
                {/* Summary */}
                <div className="px-4 py-2 flex-shrink-0 grid grid-cols-3 gap-2" style={{borderTop:`1px solid ${T.borderSubtle}`,background:"rgba(0,0,0,0.1)"}}>
                  {[
                    {l:"Success",n:log.filter(e=>e.result==="success").length,c:T.emerald},
                    {l:"Pending",n:log.filter(e=>e.result==="pending").length,c:T.cyan},
                    {l:"Errors", n:log.filter(e=>e.result==="error").length,  c:T.rose},
                  ].map(s=>(
                    <div key={s.l} className="text-center">
                      <div style={{fontSize:14,fontWeight:800,fontFamily:T.mono,color:s.c}}>{s.n}</div>
                      <div style={{fontSize:8,color:T.textDim}}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default HotReloadWatcher;

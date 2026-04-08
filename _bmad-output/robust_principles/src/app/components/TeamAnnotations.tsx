/* ─────────────────────────────────────────────────────────────
   JPE Studio — Team Annotations (Phase 23)
   Inline code annotations with author attribution, thread
   replies, resolve/reopen workflow, and filter by author.
   ───────────────────────────────────────────────────────────── */
import { useState, useMemo } from "react";
import {
  X, MessageSquare, Check, ChevronDown, ChevronRight,
  Plus, Send, Filter, AlertTriangle, Zap, RefreshCw,
  RotateCcw, FileCode, AtSign,
} from "lucide-react";
import { motion, AnimatePresence } from "./jpe-motion";
import { T } from "../pages/jpe-theme";
import { toast } from "sonner";

/* ── Types ── */
type AnnotStatus = "open" | "resolved";
type AnnotPriority = "info" | "warning" | "blocker";

interface Reply {
  id: string;
  author: string;
  avatar: string;
  ts: string;
  body: string;
}

interface Annotation {
  id: string;
  file: string;
  line: number;
  author: string;
  avatar: string;
  ts: string;
  body: string;
  status: AnnotStatus;
  priority: AnnotPriority;
  codeSnippet?: string;
  replies: Reply[];
}

/* ── Mock data ── */
const AUTHORS = [
  { name:"ModAuthor",   color:T.violet, avatar:"MA" },
  { name:"Translator",  color:T.cyan,   avatar:"TR" },
  { name:"Reviewer",    color:T.amber,  avatar:"RV" },
];

const INITIAL_ANNOTATIONS: Annotation[] = [
  {
    id:"a01", file:"trait_Evil.xml", line:5, author:"Reviewer", avatar:"RV", ts:"14:32",
    priority:"blocker", status:"open",
    body:"The conflict_weight of 20 seems too low — Evil should conflict harder with Cheerful. Suggest 60+.",
    codeSnippet:"<Tunable n=\"conflict_weight\" ev=\"20\"/>",
    replies:[
      { id:"r1", author:"ModAuthor", avatar:"MA", ts:"14:38", body:"Good catch — I'll bump it to 65 and add a note in the design doc." },
    ]
  },
  {
    id:"a02", file:"strings_es-ES.stbl", line:8, author:"Translator", avatar:"TR", ts:"13:50",
    priority:"warning", status:"open",
    body:"'Malvado' is fine but sounds formal. For Sims 4's tone I'd suggest 'Perverso' — more playful and fits the game's humor.",
    codeSnippet:'<T n="trait_Evil_name">Malvado</T>',
    replies:[]
  },
  {
    id:"a03", file:"interaction_Hug.xml", line:22, author:"ModAuthor", avatar:"MA", ts:"13:12",
    priority:"info", status:"resolved",
    body:"Interaction uses default autonomy weighting. Should we override to prevent Sims from hugging autonomously with Evil trait active?",
    codeSnippet:"<!-- autonomy field not set — inherits defaults -->",
    replies:[
      { id:"r2", author:"Reviewer", avatar:"RV", ts:"13:28", body:"I think default is fine here — the buff system will naturally reduce friendly autonomous interactions." },
      { id:"r3", author:"ModAuthor", avatar:"MA", ts:"13:35", body:"Agreed. Marking resolved." },
    ]
  },
  {
    id:"a04", file:"buff_EvilGlee.xml", line:14, author:"Reviewer", avatar:"RV", ts:"12:44",
    priority:"info", status:"open",
    body:"The mood_weight of 3 puts this at Confident tier. Should it be Playful instead for Evil Glee?",
    codeSnippet:"<Tunable n=\"mood_weight\" ev=\"3\"/>",
    replies:[]
  },
  {
    id:"a05", file:"career_Villain.xml", line:42, author:"Translator", avatar:"TR", ts:"11:20",
    priority:"warning", status:"resolved",
    body:"Daily task text in fr-FR is too long — it clips in the career panel at 1080p. Max ~50 chars.",
    replies:[
      { id:"r4", author:"Translator", avatar:"TR", ts:"11:45", body:"Fixed — shortened to 47 chars. UI looks correct now." },
    ]
  },
];

const PRIORITY_CFG: Record<AnnotPriority,{color:string;label:string;icon:typeof AlertTriangle}> = {
  info:    { color:T.cyan,   label:"Info",    icon:Zap           },
  warning: { color:T.amber,  label:"Warning", icon:AlertTriangle },
  blocker: { color:T.rose,   label:"Blocker", icon:AlertTriangle },
};

function Avatar({ initials, color }: { initials: string; color: string }) {
  return (
    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{background:`${color}20`,border:`1px solid ${color}30`}}>
      <span style={{fontSize:9,fontWeight:800,color,fontFamily:T.mono}}>{initials}</span>
    </div>
  );
}

export function TeamAnnotations({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [annotations, setAnnotations] = useState<Annotation[]>(INITIAL_ANNOTATIONS);
  const [authorFilter, setAuthorFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<AnnotStatus | "all">("all");
  const [expandedIds, setExpandedIds]   = useState<Set<string>>(new Set(["a01"]));
  const [replyText, setReplyText]       = useState<Record<string, string>>({});
  const [newAnnotBody, setNewAnnotBody] = useState("");
  const [newAnnotFile, setNewAnnotFile] = useState("trait_Evil.xml");
  const [newAnnotLine, setNewAnnotLine] = useState("3");
  const [addingNew, setAddingNew]       = useState(false);

  const toggleExpand = (id: string) => setExpandedIds(prev => { const n=new Set(prev); n.has(id)?n.delete(id):n.add(id); return n; });
  const resolve = (id: string) => setAnnotations(prev => prev.map(a => a.id===id ? {...a,status:"resolved"} : a));
  const reopen  = (id: string) => setAnnotations(prev => prev.map(a => a.id===id ? {...a,status:"open"}     : a));

  const sendReply = (id: string) => {
    const body = replyText[id]?.trim();
    if (!body) return;
    setAnnotations(prev => prev.map(a => a.id===id ? {
      ...a,
      replies:[...a.replies,{ id:`r${Date.now()}`,author:"ModAuthor",avatar:"MA",ts:"now",body }]
    }:a));
    setReplyText(prev => ({...prev,[id]:""}));
    toast.success("Reply sent");
  };

  const addAnnotation = () => {
    if (!newAnnotBody.trim()) return;
    const ann: Annotation = {
      id:`a${Date.now()}`, file:newAnnotFile, line:parseInt(newAnnotLine)||1,
      author:"ModAuthor", avatar:"MA", ts:"now", priority:"info", status:"open",
      body:newAnnotBody, replies:[]
    };
    setAnnotations(prev=>[ann,...prev]);
    setNewAnnotBody(""); setAddingNew(false);
    toast.success("Annotation added");
  };

  const filtered = useMemo(()=>{
    let rows = annotations;
    if (authorFilter!=="all") rows = rows.filter(a=>a.author===authorFilter);
    if (statusFilter!=="all") rows = rows.filter(a=>a.status===statusFilter);
    return rows;
  },[annotations,authorFilter,statusFilter]);

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
            style={{width:"min(780px,97vw)",height:"min(700px,90vh)",background:T.bgElevated,border:`1px solid ${T.border}`,boxShadow:`0 40px 80px rgba(0,0,0,0.7),inset 0 1px 0 rgba(255,255,255,0.04)`}}>

            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{background:`linear-gradient(90deg,transparent 5%,${T.violet}80,${T.cyan}80,transparent 95%)`}}/>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 flex-shrink-0" style={{borderBottom:`1px solid ${T.border}`}}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:`linear-gradient(135deg,${T.violet}20,${T.cyan}20)`,border:`1px solid ${T.borderSubtle}`}}>
                  <MessageSquare size={16} color={T.violet}/>
                </div>
                <div>
                  <div style={{fontSize:15,fontWeight:700,color:T.textPrimary,fontFamily:T.display}}>Team Annotations</div>
                  <div style={{fontSize:10,color:T.textMuted,fontFamily:T.mono}}>{annotations.filter(a=>a.status==="open").length} open · {annotations.filter(a=>a.status==="resolved").length} resolved</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={()=>setAddingNew(p=>!p)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
                  style={{fontSize:10,fontWeight:700,color:"#fff",background:`linear-gradient(135deg,${T.violet}CC,${T.cyan}CC)`}}>
                  <Plus size={11}/> Add Note
                </button>
                <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all" style={{border:`1px solid ${T.borderSubtle}`}}>
                  <X size={14} color={T.textMuted}/>
                </button>
              </div>
            </div>

            {/* Filter bar */}
            <div className="flex items-center gap-3 px-5 py-2.5 flex-shrink-0" style={{borderBottom:`1px solid ${T.borderSubtle}`,background:"rgba(0,0,0,0.08)"}}>
              <Filter size={11} color={T.textMuted}/>
              <div className="flex items-center gap-1">
                {["all",...AUTHORS.map(a=>a.name)].map(a=>(
                  <button key={a} onClick={()=>setAuthorFilter(a)}
                    className="px-2.5 py-1 rounded-md transition-all"
                    style={{fontSize:9,fontWeight:authorFilter===a?700:400,color:authorFilter===a?T.textPrimary:T.textMuted,background:authorFilter===a?T.bgActive:"transparent"}}>
                    {a==="all"?"All Authors":a}
                  </button>
                ))}
              </div>
              <div className="w-px h-4 mx-1" style={{background:T.borderSubtle}}/>
              {(["all","open","resolved"] as const).map(s=>(
                <button key={s} onClick={()=>setStatusFilter(s)}
                  className="px-2.5 py-1 rounded-md transition-all"
                  style={{fontSize:9,fontWeight:statusFilter===s?700:400,color:statusFilter===s?T.textPrimary:T.textMuted,background:statusFilter===s?T.bgActive:"transparent"}}>
                  {s.charAt(0).toUpperCase()+s.slice(1)}
                </button>
              ))}
              <span className="ml-auto" style={{fontSize:9,fontFamily:T.mono,color:T.textDim}}>{filtered.length} shown</span>
            </div>

            {/* New annotation form */}
            <AnimatePresence>
              {addingNew && (
                <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}}
                  className="overflow-hidden flex-shrink-0" style={{borderBottom:`1px solid ${T.border}`}}>
                  <div className="p-4 space-y-3">
                    <div style={{fontSize:10,fontWeight:700,color:T.textMuted,letterSpacing:"0.06em"}}>NEW ANNOTATION</div>
                    <div className="flex items-center gap-2">
                      <input value={newAnnotFile} onChange={e=>setNewAnnotFile(e.target.value)} placeholder="File path" className="flex-1 px-3 py-1.5 rounded-lg outline-none" style={{fontSize:11,fontFamily:T.mono,color:T.textSecondary,background:T.bgInput,border:`1px solid ${T.borderSubtle}`}}/>
                      <input value={newAnnotLine} onChange={e=>setNewAnnotLine(e.target.value)} placeholder="Line" className="w-16 px-3 py-1.5 rounded-lg outline-none" style={{fontSize:11,fontFamily:T.mono,color:T.textSecondary,background:T.bgInput,border:`1px solid ${T.borderSubtle}`}}/>
                    </div>
                    <textarea value={newAnnotBody} onChange={e=>setNewAnnotBody(e.target.value)} rows={3} placeholder="Write your annotation…" className="w-full px-3 py-2 rounded-lg outline-none resize-none" style={{fontSize:12,color:T.textSecondary,background:T.bgInput,border:`1px solid ${T.borderSubtle}`}}/>
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={()=>setAddingNew(false)} className="px-3 py-1.5 rounded-lg" style={{fontSize:11,color:T.textMuted,border:`1px solid ${T.borderSubtle}`}}>Cancel</button>
                      <button onClick={addAnnotation} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg" style={{fontSize:11,fontWeight:700,color:"#fff",background:`linear-gradient(135deg,${T.violet}CC,${T.cyan}CC)`}}>
                        <Send size={11}/> Post
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Annotation list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <AnimatePresence>
                {filtered.map(ann=>{
                  const pc = PRIORITY_CFG[ann.priority]; const Icon=pc.icon;
                  const authorCfg = AUTHORS.find(a=>a.name===ann.author)??AUTHORS[0];
                  const isOpen = expandedIds.has(ann.id);
                  return (
                    <motion.div key={ann.id} layout initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}
                      className="rounded-xl overflow-hidden"
                      style={{border:`1px solid ${ann.status==="resolved"?T.borderSubtle:pc.color+"25"}`,background:ann.status==="resolved"?"rgba(255,255,255,0.01)":T.bgSurface}}>
                      {/* Header row */}
                      <div className="flex items-center gap-2 px-4 py-3 cursor-pointer" onClick={()=>toggleExpand(ann.id)}>
                        <Avatar initials={ann.avatar} color={authorCfg.color}/>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span style={{fontSize:11,fontWeight:700,color:authorCfg.color}}>{ann.author}</span>
                            <span style={{fontSize:9,color:T.textDim}}>in</span>
                            <span className="flex items-center gap-1" style={{fontSize:9,fontFamily:T.mono,color:T.textMuted}}>
                              <FileCode size={9}/>{ann.file}:{ann.line}
                            </span>
                            <span className="px-1.5 py-0 rounded" style={{fontSize:8,color:pc.color,background:`${pc.color}12`}}>{pc.label}</span>
                            {ann.status==="resolved"&&<span className="px-1.5 py-0 rounded flex items-center gap-1" style={{fontSize:8,color:T.emerald,background:T.emeraldDim}}><Check size={8}/>Resolved</span>}
                          </div>
                          <p className="truncate" style={{fontSize:11,color:ann.status==="resolved"?T.textMuted:T.textSecondary,marginTop:1}}>{ann.body}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span style={{fontSize:9,fontFamily:T.mono,color:T.textDim}}>{ann.replies.length > 0 && `${ann.replies.length} reply`}</span>
                          <span style={{fontSize:9,color:T.textDim}}>{ann.ts}</span>
                          {isOpen?<ChevronDown size={12} color={T.textMuted}/>:<ChevronRight size={12} color={T.textMuted}/>}
                        </div>
                      </div>

                      {/* Expanded content */}
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div initial={{height:0}} animate={{height:"auto"}} exit={{height:0}} className="overflow-hidden">
                            <div className="px-4 pb-4 space-y-3" style={{borderTop:`1px solid ${T.borderSubtle}`}}>
                              {/* Code snippet */}
                              {ann.codeSnippet && (
                                <pre className="mt-3 px-3 py-2 rounded-lg" style={{fontSize:10,fontFamily:T.mono,color:T.cyan,background:T.bgDeep,border:`1px solid ${T.borderSubtle}`}}>{ann.codeSnippet}</pre>
                              )}
                              {/* Full body */}
                              <p style={{fontSize:12,color:T.textSecondary,lineHeight:1.6,marginTop:8}}>{ann.body}</p>

                              {/* Replies */}
                              {ann.replies.map(r=>{
                                const rc=AUTHORS.find(a=>a.name===r.author)??AUTHORS[0];
                                return (
                                  <div key={r.id} className="flex items-start gap-2 pl-4" style={{borderLeft:`2px solid ${T.borderSubtle}`}}>
                                    <Avatar initials={r.avatar} color={rc.color}/>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span style={{fontSize:10,fontWeight:700,color:rc.color}}>{r.author}</span>
                                        <span style={{fontSize:9,color:T.textDim}}>{r.ts}</span>
                                      </div>
                                      <p style={{fontSize:11,color:T.textMuted,lineHeight:1.5}}>{r.body}</p>
                                    </div>
                                  </div>
                                );
                              })}

                              {/* Reply input */}
                              <div className="flex items-center gap-2">
                                <Avatar initials="MA" color={T.violet}/>
                                <input value={replyText[ann.id]??""} onChange={e=>setReplyText(p=>({...p,[ann.id]:e.target.value}))}
                                  onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendReply(ann.id);}}}
                                  placeholder="Reply…" className="flex-1 px-3 py-1.5 rounded-lg outline-none"
                                  style={{fontSize:11,color:T.textSecondary,background:T.bgInput,border:`1px solid ${T.borderSubtle}`}}/>
                                <button onClick={()=>sendReply(ann.id)} className="p-1.5 rounded-lg hover:bg-white/5 transition-all" style={{border:`1px solid ${T.borderSubtle}`}}>
                                  <Send size={11} color={T.textMuted}/>
                                </button>
                              </div>

                              {/* Resolve / Reopen */}
                              <div className="flex items-center gap-2 pt-1">
                                {ann.status==="open"?(
                                  <button onClick={()=>resolve(ann.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all" style={{fontSize:10,color:T.emerald,background:T.emeraldDim,border:`1px solid ${T.emerald}20`}}>
                                    <Check size={10}/> Mark Resolved
                                  </button>
                                ):(
                                  <button onClick={()=>reopen(ann.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all" style={{fontSize:10,color:T.amber,background:T.amberDim,border:`1px solid ${T.amber}20`}}>
                                    <RotateCcw size={10}/> Reopen
                                  </button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {filtered.length===0&&(
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <MessageSquare size={24} color={T.textDim} strokeWidth={1.5}/>
                  <span style={{fontSize:12,color:T.textMuted}}>No annotations match the current filters</span>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default TeamAnnotations;

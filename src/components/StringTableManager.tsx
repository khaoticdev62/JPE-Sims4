"use client";

/* ─────────────────────────────────────────────────────────────
   JPE Studio — String Table Manager (Phase 15)
   STBL editor: FNV-32a hash generator, inline edit,
   duplicate detector, CSV / XLIFF / JSON import-export.
   ───────────────────────────────────────────────────────────── */
import { useState, useMemo, useCallback } from "react";
import {
  X, Hash, Search, Plus, Trash2, Download, Upload,
  Copy, Check, AlertTriangle, FileText, ArrowUpDown,
  CheckCircle2, XCircle, Globe,
} from "lucide-react";
import { motion, AnimatePresence } from "./jpe-motion";
import { T } from "./robust/jpe-theme";
import { toast } from "sonner";

/* ── Types ── */
type StblStatus = "ok" | "missing" | "fuzzy" | "conflict";
type StblTab    = "editor" | "hash" | "duplicates" | "io";
type SortField  = "hash" | "key" | "source" | "status";
type SortDir    = "asc" | "desc";

interface StblEntry {
  id: string;
  hash: string;
  keyString: string;
  source: string;
  translation: string;
  status: StblStatus;
}

/* ── FNV-32a hash (Sims 4 STBL format) ── */
function fnv32a(str: string): string {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return `0x${h.toString(16).toUpperCase().padStart(8, "0")}`;
}

/* ── Mock STBL data ── */
const KEYS = [
  "trait_evil_name","trait_evil_description","trait_evil_buff_title","trait_evil_buff_desc",
  "interaction_hug_friend","interaction_hug_stranger","interaction_tell_joke","interaction_argue",
  "buff_feeling_evil","buff_feeling_mischievous","notification_evil_success","notification_evil_fail",
  "moodlet_devilish_grin","skill_mischief_name","skill_mischief_desc","career_villain_name",
  "career_villain_branch_a","aspiration_chief_of_mischief","lot_trait_haunted","cas_trait_evil_unlock",
];
const SRC: Record<string,string> = {
  trait_evil_name:"Evil", trait_evil_description:"These Sims take great pleasure in the misfortune of others.",
  trait_evil_buff_title:"Gleefully Evil", trait_evil_buff_desc:"There's nothing like seeing others suffer.",
  interaction_hug_friend:"Hug Friend", interaction_hug_stranger:"Hug Stranger",
  interaction_tell_joke:"Tell Joke", interaction_argue:"Argue Loudly",
  buff_feeling_evil:"Feeling Evil", buff_feeling_mischievous:"Feeling Mischievous",
  notification_evil_success:"Your Sim's evil plan succeeded!", notification_evil_fail:"Their evil plan was foiled…",
  moodlet_devilish_grin:"Devilish Grin", skill_mischief_name:"Mischief",
  skill_mischief_desc:"Masters of Mischief know how to get under anyone's skin.",
  career_villain_name:"Villain", career_villain_branch_a:"Evil Mastermind",
  aspiration_chief_of_mischief:"Chief of Mischief", lot_trait_haunted:"Haunted",
  cas_trait_evil_unlock:"Evil trait now unlocked in CAS.",
};
const TRANS: Record<string,string> = {
  trait_evil_name:"Malvado", trait_evil_description:"Estos Sims disfrutan de las desgracias ajenas.",
  trait_evil_buff_title:"Alegremente malvado", trait_evil_buff_desc:"",
  interaction_hug_friend:"Abrazar amigo", interaction_hug_stranger:"",
  interaction_tell_joke:"Contar chiste", interaction_argue:"Discutir fuerte",
  buff_feeling_evil:"Sintiéndose malvado", buff_feeling_mischievous:"Sintiéndose travieso",
  notification_evil_success:"¡El plan maligno de tu Sim tuvo éxito!", notification_evil_fail:"",
  moodlet_devilish_grin:"Sonrisa diabólica", skill_mischief_name:"Picardía",
  skill_mischief_desc:"", career_villain_name:"Villano",
  career_villain_branch_a:"Mente maestra del mal", aspiration_chief_of_mischief:"Jefe de la picardía",
  lot_trait_haunted:"", cas_trait_evil_unlock:"El rasgo Malvado ya está disponible en CAS.",
};
const STATUS_MAP: Record<string,StblStatus> = {
  trait_evil_name:"ok", trait_evil_description:"ok", trait_evil_buff_title:"ok",
  trait_evil_buff_desc:"missing", interaction_hug_friend:"ok", interaction_hug_stranger:"missing",
  interaction_tell_joke:"ok", interaction_argue:"fuzzy", buff_feeling_evil:"ok",
  buff_feeling_mischievous:"ok", notification_evil_success:"ok", notification_evil_fail:"missing",
  moodlet_devilish_grin:"ok", skill_mischief_name:"ok", skill_mischief_desc:"missing",
  career_villain_name:"conflict", career_villain_branch_a:"ok", aspiration_chief_of_mischief:"ok",
  lot_trait_haunted:"missing", cas_trait_evil_unlock:"ok",
};

const INITIAL: StblEntry[] = KEYS.map((k,i) => ({
  id:`s${i}`, hash:fnv32a(k), keyString:k,
  source:SRC[k]??"", translation:TRANS[k]??"", status:STATUS_MAP[k]??"ok",
}));

const SC: Record<StblStatus,{color:string;label:string;Icon:typeof Check}> = {
  ok:       {color:T.emerald, label:"OK",       Icon:CheckCircle2},
  missing:  {color:T.rose,    label:"Missing",  Icon:XCircle},
  fuzzy:    {color:T.amber,   label:"Fuzzy",    Icon:AlertTriangle},
  conflict: {color:T.rose,    label:"Conflict", Icon:AlertTriangle},
};

/* ── Stat pill ── */
function Stat({label,value,color}:{label:string;value:number|string;color:string}) {
  return (
    <div className="flex flex-col gap-0.5 px-3 py-2 rounded-xl" style={{background:"rgba(255,255,255,0.025)",border:`1px solid ${T.borderSubtle}`}}>
      <span style={{fontSize:9,fontWeight:700,color:T.textMuted,letterSpacing:"0.07em"}}>{label}</span>
      <span style={{fontSize:18,fontWeight:800,color,fontFamily:T.mono}}>{value}</span>
    </div>
  );
}

/* ── Main ── */
export function StringTableManager({isOpen,onClose}:{isOpen:boolean;onClose:()=>void}) {
  const [tab,setTab]           = useState<StblTab>("editor");
  const [entries,setEntries]   = useState<StblEntry[]>(INITIAL);
  const [selected,setSelected] = useState<string|null>(null);
  const [draft,setDraft]       = useState<Partial<StblEntry>|null>(null);
  const [search,setSearch]     = useState("");
  const [sf,setSf]             = useState<StblStatus|"all">("all");
  const [sortF,setSortF]       = useState<SortField>("key");
  const [sortD,setSortD]       = useState<SortDir>("asc");
  const [hashIn,setHashIn]     = useState("");
  const [batch,setBatch]       = useState("");

  const selEntry = entries.find(e=>e.id===selected)??null;

  const filtered = useMemo(()=>{
    let rows = entries;
    if (sf!=="all") rows=rows.filter(r=>r.status===sf);
    if (search) { const q=search.toLowerCase(); rows=rows.filter(r=>r.keyString.toLowerCase().includes(q)||r.source.toLowerCase().includes(q)||r.hash.toLowerCase().includes(q)); }
    return [...rows].sort((a,b)=>{
      const va = sortF==="hash"?a.hash:sortF==="key"?a.keyString:sortF==="source"?a.source:a.status;
      const vb = sortF==="hash"?b.hash:sortF==="key"?b.keyString:sortF==="source"?b.source:b.status;
      return sortD==="asc"?va.localeCompare(vb):vb.localeCompare(va);
    });
  },[entries,sf,search,sortF,sortD]);

  const toggleSort = (f:SortField)=>{ if(sortF===f) setSortD(d=>d==="asc"?"desc":"asc"); else{setSortF(f);setSortD("asc");} };

  const dups = useMemo(()=>{
    const g:Record<string,StblEntry[]>={};
    entries.forEach(e=>{if(!g[e.source])g[e.source]=[];g[e.source].push(e);});
    return Object.entries(g).filter(([,v])=>v.length>1);
  },[entries]);

  const batchHashes = useMemo(()=>
    batch.split("\n").filter(Boolean).map(l=>({key:l.trim(),hash:fnv32a(l.trim())}))
  ,[batch]);

  const startEdit = useCallback((e:StblEntry)=>{ setSelected(e.id); setDraft({...e}); },[]);

  const commitEdit = ()=>{
    if(!draft||!selected) return;
    setEntries(prev=>prev.map(e=>e.id===selected?{...e,...draft}:e));
    toast.success("Entry saved"); setDraft(null);
  };

  const deleteEntry = (id:string)=>{ setEntries(prev=>prev.filter(e=>e.id!==id)); if(selected===id){setSelected(null);setDraft(null);} toast.success("Entry deleted"); };

  const addEntry = ()=>{
    const k=`new_string_${Date.now()}`;
    const e:StblEntry={id:`s${Date.now()}`,hash:fnv32a(k),keyString:k,source:"",translation:"",status:"missing"};
    setEntries(prev=>[e,...prev]); startEdit(e); toast.success("New entry — edit and save");
  };

  if (!isOpen) return null;

  const TABS:{id:StblTab;label:string;Icon:typeof Hash}[]=[
    {id:"editor",   label:"STBL Editor",          Icon:FileText},
    {id:"hash",     label:"Hash Generator",        Icon:Hash},
    {id:"duplicates",label:`Duplicates (${dups.length})`,Icon:Copy},
    {id:"io",       label:"Import / Export",       Icon:Download},
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-[200] flex" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
          style={{background:"rgba(0,0,0,0.8)",backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)"}}
          onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
          <motion.div initial={{opacity:0,scale:0.97,y:12}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.97,y:12}}
            transition={{duration:0.22,ease:[0.16,1,0.3,1]}}
            className="relative flex flex-col m-auto rounded-2xl overflow-hidden"
            style={{width:"min(1120px,97vw)",height:"min(760px,92vh)",background:T.bgElevated,border:`1px solid ${T.border}`,boxShadow:`${T.shadow2Xl},inset 0 1px 0 rgba(255,255,255,0.04)`}}>

            {/* Accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{background:`linear-gradient(90deg,transparent 5%,${T.cyan}80,${T.emerald}80,transparent 95%)`}}/>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 flex-shrink-0" style={{borderBottom:`1px solid ${T.border}`}}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:`linear-gradient(135deg,${T.cyan}20,${T.emerald}20)`,border:`1px solid ${T.borderSubtle}`}}>
                  <FileText size={16} color={T.cyan}/>
                </div>
                <div>
                  <div style={{fontSize:15,fontWeight:700,color:T.textPrimary,fontFamily:T.display}}>String Table Manager</div>
                  <div style={{fontSize:10,color:T.textMuted,fontFamily:T.mono}}>{entries.length} entries · locale: es-ES · Evil_Trait_Override.package</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={addEntry} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
                  style={{fontSize:11,fontWeight:700,color:T.cyan,background:T.cyanDim,border:`1px solid ${T.cyan}20`}}>
                  <Plus size={12}/> Add Entry
                </button>
                <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-white/10" style={{border:`1px solid ${T.borderSubtle}`}}>
                  <X size={14} color={T.textMuted}/>
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 px-6 py-2.5 flex-shrink-0" style={{borderBottom:`1px solid ${T.borderSubtle}`,background:"rgba(0,0,0,0.12)"}}>
              <Stat label="Total" value={entries.length} color={T.textPrimary}/>
              <Stat label="OK" value={entries.filter(e=>e.status==="ok").length} color={T.emerald}/>
              <Stat label="Missing" value={entries.filter(e=>e.status==="missing").length} color={T.rose}/>
              <Stat label="Fuzzy" value={entries.filter(e=>e.status==="fuzzy").length} color={T.amber}/>
              <Stat label="Conflicts" value={entries.filter(e=>e.status==="conflict").length} color={T.rose}/>
              <div className="flex-1"/>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{background:T.bgInput,border:`1px solid ${T.borderSubtle}`}}>
                <Globe size={11} color={T.textMuted}/>
                <span style={{fontSize:11,fontFamily:T.mono,color:T.textSecondary}}>es-ES</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-0 px-4 flex-shrink-0" style={{borderBottom:`1px solid ${T.border}`,background:"rgba(0,0,0,0.08)"}}>
              {TABS.map(({id,label,Icon})=>{
                const active=tab===id;
                return (
                  <button key={id} onClick={()=>setTab(id)} className="flex items-center gap-1.5 px-4 py-2.5 transition-all"
                    style={{fontSize:11,fontWeight:active?700:400,color:active?T.textPrimary:T.textMuted,borderBottom:`2px solid ${active?T.cyan:"transparent"}`,marginBottom:-1}}>
                    <Icon size={11} color={active?T.cyan:T.textMuted}/>{label}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 flex overflow-hidden">

              {/* ── EDITOR ── */}
              {tab==="editor" && (
                <>
                  {/* Table */}
                  <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                    {/* Filter toolbar */}
                    <div className="flex items-center gap-2 px-4 py-2 flex-shrink-0" style={{borderBottom:`1px solid ${T.borderSubtle}`}}>
                      {(["all","ok","missing","fuzzy","conflict"] as const).map(s=>(
                        <button key={s} onClick={()=>setSf(s)} className="px-2 py-0.5 rounded-md transition-all"
                          style={{fontSize:10,fontWeight:sf===s?700:400,
                            color:s==="all"?(sf==="all"?T.textPrimary:T.textMuted):(sf===s?SC[s as StblStatus].color:T.textMuted),
                            background:sf===s?(s==="all"?"rgba(255,255,255,0.06)":`${SC[s as StblStatus].color}12`):"transparent"}}>
                          {s==="all"?"All":SC[s as StblStatus].label}
                        </button>
                      ))}
                      <div className="flex-1"/>
                      <div className="flex items-center gap-2 px-2 py-1 rounded-lg" style={{background:T.bgInput,border:`1px solid ${T.borderSubtle}`}}>
                        <Search size={11} color={T.textMuted}/>
                        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search keys, source, hash…" className="bg-transparent outline-none w-36" style={{fontSize:11,color:T.textSecondary}}/>
                        {search && <button onClick={()=>setSearch("")}><X size={9} color={T.textMuted}/></button>}
                      </div>
                      <span style={{fontSize:9,fontFamily:T.mono,color:T.textMuted}}>{filtered.length} shown</span>
                    </div>

                    {/* Table header */}
                    <div className="grid px-4 py-1.5 flex-shrink-0" style={{gridTemplateColumns:"110px 1fr 1fr 80px 40px",gap:8,background:T.bgSurface,borderBottom:`1px solid ${T.border}`}}>
                      {([{l:"Hash",f:"hash"},{l:"Key String",f:"key"},{l:"Source (en-US)",f:"source"},{l:"Status",f:"status"},{l:"",f:null}] as {l:string;f:SortField|null}[]).map(col=>(
                        <button key={col.l} onClick={()=>col.f&&toggleSort(col.f)} disabled={!col.f}
                          className="flex items-center gap-1 text-left"
                          style={{fontSize:9,fontWeight:700,color:T.textMuted,letterSpacing:"0.06em",textTransform:"uppercase",cursor:col.f?"pointer":"default"}}>
                          {col.l}{col.f&&sortF===col.f&&<ArrowUpDown size={8} color={T.cyan}/>}
                        </button>
                      ))}
                    </div>

                    {/* Rows */}
                    <div className="flex-1 overflow-y-auto">
                      {filtered.map(entry=>{
                        const s=SC[entry.status]; const Icon=s.Icon; const active=selected===entry.id;
                        return (
                          <div key={entry.id} className="grid items-center px-4 py-1.5 group cursor-pointer transition-colors"
                            style={{gridTemplateColumns:"110px 1fr 1fr 80px 40px",gap:8,borderBottom:`1px solid ${T.borderSubtle}`,
                              background:active?`${T.cyan}08`:"transparent",borderLeft:`2px solid ${active?T.cyan:"transparent"}`}}
                            onMouseEnter={e=>{if(!active)e.currentTarget.style.background=T.bgHover;}}
                            onMouseLeave={e=>{e.currentTarget.style.background=active?`${T.cyan}08`:"transparent";}}
                            onClick={()=>startEdit(entry)}>
                            <span style={{fontSize:10,fontFamily:T.mono,color:T.cyan}}>{entry.hash}</span>
                            <span className="truncate" style={{fontSize:11,fontFamily:T.mono,color:T.textSecondary}}>{entry.keyString}</span>
                            <span className="truncate" style={{fontSize:11,color:T.textTertiary}}>{entry.source}</span>
                            <div className="flex items-center gap-1"><Icon size={10} color={s.color}/><span style={{fontSize:9,fontWeight:700,color:s.color}}>{s.label}</span></div>
                            <button onClick={e=>{e.stopPropagation();deleteEntry(entry.id);}} className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10">
                              <Trash2 size={10} color={T.rose}/>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Edit panel */}
                  {selEntry&&draft&&(
                    <div className="flex flex-col flex-shrink-0" style={{width:300,borderLeft:`1px solid ${T.border}`,background:"rgba(0,0,0,0.1)"}}>
                      <div className="flex items-center justify-between px-4 py-2.5 flex-shrink-0" style={{borderBottom:`1px solid ${T.border}`}}>
                        <span style={{fontSize:10,fontWeight:700,color:T.textMuted,letterSpacing:"0.06em"}}>EDIT ENTRY</span>
                        <button onClick={()=>{setSelected(null);setDraft(null);}}><X size={11} color={T.textMuted}/></button>
                      </div>
                      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                        {/* Hash */}
                        <div>
                          <label style={{fontSize:9,fontWeight:700,color:T.textMuted,letterSpacing:"0.06em",display:"block",marginBottom:4}}>HASH (FNV-32a)</label>
                          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{background:T.bgDeep,border:`1px solid ${T.borderSubtle}`}}>
                            <code style={{fontSize:11,fontFamily:T.mono,color:T.cyan,flex:1}}>{draft.hash??""}</code>
                            <button onClick={()=>navigator.clipboard.writeText(draft.hash??"").then(()=>toast.success("Hash copied"))}><Copy size={10} color={T.textMuted}/></button>
                          </div>
                        </div>
                        {/* Key */}
                        <div>
                          <label style={{fontSize:9,fontWeight:700,color:T.textMuted,letterSpacing:"0.06em",display:"block",marginBottom:4}}>KEY STRING</label>
                          <input value={draft.keyString??""} onChange={e=>setDraft(p=>({...p,keyString:e.target.value,hash:fnv32a(e.target.value)}))}
                            className="w-full px-2 py-1.5 rounded-lg outline-none" style={{fontSize:12,fontFamily:T.mono,color:T.textPrimary,background:T.bgInput,border:`1px solid ${T.borderSubtle}`}}/>
                        </div>
                        {/* Source */}
                        <div>
                          <label style={{fontSize:9,fontWeight:700,color:T.textMuted,letterSpacing:"0.06em",display:"block",marginBottom:4}}>SOURCE (en-US)</label>
                          <textarea value={draft.source??""} onChange={e=>setDraft(p=>({...p,source:e.target.value}))} rows={3}
                            className="w-full px-2 py-1.5 rounded-lg outline-none resize-none" style={{fontSize:12,color:T.textPrimary,background:T.bgInput,border:`1px solid ${T.borderSubtle}`}}/>
                        </div>
                        {/* Translation */}
                        <div>
                          <label style={{fontSize:9,fontWeight:700,color:T.textMuted,letterSpacing:"0.06em",display:"block",marginBottom:4}}>TRANSLATION (es-ES)</label>
                          <textarea value={draft.translation??""} onChange={e=>setDraft(p=>({...p,translation:e.target.value}))} rows={3}
                            className="w-full px-2 py-1.5 rounded-lg outline-none resize-none" style={{fontSize:12,color:T.textPrimary,background:T.bgInput,border:`1px solid ${T.borderSubtle}`}}/>
                        </div>
                        {/* Status */}
                        <div>
                          <label style={{fontSize:9,fontWeight:700,color:T.textMuted,letterSpacing:"0.06em",display:"block",marginBottom:4}}>STATUS</label>
                          <div className="grid grid-cols-2 gap-1">
                            {(["ok","missing","fuzzy","conflict"] as StblStatus[]).map(s=>{
                              const sc=SC[s]; const Icon=sc.Icon; const chosen=draft.status===s;
                              return (
                                <button key={s} onClick={()=>setDraft(p=>({...p,status:s}))}
                                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all"
                                  style={{background:chosen?`${sc.color}12`:"rgba(255,255,255,0.02)",border:`1px solid ${chosen?`${sc.color}30`:T.borderSubtle}`}}>
                                  <Icon size={10} color={chosen?sc.color:T.textMuted}/>
                                  <span style={{fontSize:10,fontWeight:chosen?700:400,color:chosen?sc.color:T.textMuted}}>{sc.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="p-4 flex gap-2 flex-shrink-0" style={{borderTop:`1px solid ${T.border}`}}>
                        <button onClick={commitEdit} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all"
                          style={{fontSize:12,fontWeight:700,color:"#fff",background:`linear-gradient(135deg,${T.cyan}CC,${T.emerald}CC)`}}>
                          <Check size={12}/> Save
                        </button>
                        <button onClick={()=>{setSelected(null);setDraft(null);}} className="px-3 py-2 rounded-lg transition-all"
                          style={{fontSize:12,color:T.textMuted,background:"rgba(255,255,255,0.03)",border:`1px solid ${T.borderSubtle}`}}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ── HASH GENERATOR ── */}
              {tab==="hash" && (
                <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:T.textPrimary}}>FNV-32a Hash Generator</div>
                    <div style={{fontSize:11,color:T.textMuted}}>Compute Sims 4 STBL hashes from key strings using the FNV-32a algorithm.</div>
                  </div>
                  {/* Single */}
                  <div className="rounded-xl overflow-hidden" style={{border:`1px solid ${T.border}`}}>
                    <div className="px-4 py-2" style={{background:T.bgSurface,borderBottom:`1px solid ${T.border}`}}>
                      <span style={{fontSize:10,fontWeight:700,color:T.textMuted,letterSpacing:"0.06em"}}>SINGLE KEY</span>
                    </div>
                    <div className="p-4 space-y-3">
                      <input value={hashIn} onChange={e=>setHashIn(e.target.value)} placeholder="e.g. trait_evil_name"
                        className="w-full px-3 py-2 rounded-lg outline-none"
                        style={{fontSize:12,fontFamily:T.mono,color:T.textPrimary,background:T.bgInput,border:`1px solid ${T.borderSubtle}`}}/>
                      {hashIn && (
                        <motion.div initial={{opacity:0,y:4}} animate={{opacity:1,y:0}}
                          className="flex items-center gap-3 p-3 rounded-lg" style={{background:T.bgDeep,border:`1px solid ${T.borderSubtle}`}}>
                          <Hash size={14} color={T.cyan}/>
                          <code style={{fontSize:18,fontFamily:T.mono,fontWeight:800,color:T.cyan,flex:1}}>{fnv32a(hashIn)}</code>
                          <button onClick={()=>navigator.clipboard.writeText(fnv32a(hashIn)).then(()=>toast.success("Hash copied"))}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/10 transition-all" style={{fontSize:10,color:T.textMuted}}>
                            <Copy size={10}/> Copy
                          </button>
                        </motion.div>
                      )}
                    </div>
                  </div>
                  {/* Batch */}
                  <div className="rounded-xl overflow-hidden" style={{border:`1px solid ${T.border}`}}>
                    <div className="flex items-center justify-between px-4 py-2" style={{background:T.bgSurface,borderBottom:`1px solid ${T.border}`}}>
                      <span style={{fontSize:10,fontWeight:700,color:T.textMuted,letterSpacing:"0.06em"}}>BATCH — one key per line</span>
                      {batchHashes.length>1&&(
                        <button onClick={()=>navigator.clipboard.writeText(batchHashes.map(b=>`${b.key},${b.hash}`).join("\n")).then(()=>toast.success("Copied as CSV"))}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-white/10 transition-all" style={{fontSize:9,color:T.textMuted}}>
                          <Copy size={9}/> Copy CSV
                        </button>
                      )}
                    </div>
                    <div className="p-4 space-y-3">
                      <textarea value={batch} onChange={e=>setBatch(e.target.value)} placeholder={"trait_evil_name\ntrait_good_name\nbuff_happy"} rows={5}
                        className="w-full px-3 py-2 rounded-lg outline-none resize-none"
                        style={{fontSize:12,fontFamily:T.mono,color:T.textPrimary,background:T.bgInput,border:`1px solid ${T.borderSubtle}`}}/>
                      {batchHashes.length>0 && (
                        <div className="rounded-lg overflow-hidden" style={{border:`1px solid ${T.borderSubtle}`}}>
                          {batchHashes.map((item,i)=>(
                            <div key={i} className="flex items-center gap-3 px-3 py-1.5" style={{borderBottom:i<batchHashes.length-1?`1px solid ${T.borderSubtle}`:"none",background:"rgba(0,0,0,0.1)"}}>
                              <span className="flex-1 truncate" style={{fontSize:11,fontFamily:T.mono,color:T.textSecondary}}>{item.key}</span>
                              <code style={{fontSize:11,fontFamily:T.mono,fontWeight:700,color:T.cyan}}>{item.hash}</code>
                              <button onClick={()=>navigator.clipboard.writeText(item.hash).then(()=>toast.success("Copied"))}><Copy size={9} color={T.textMuted}/></button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── DUPLICATES ── */}
              {tab==="duplicates" && (
                <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:T.textPrimary}}>Duplicate Source Strings</div>
                    <div style={{fontSize:11,color:T.textMuted}}>Groups of entries sharing identical source text — may indicate copy-paste errors.</div>
                  </div>
                  {dups.length===0?(
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <CheckCircle2 size={28} color={T.emerald} strokeWidth={1.5}/>
                      <span style={{fontSize:13,color:T.textMuted}}>No duplicates found</span>
                    </div>
                  ):(
                    dups.map(([src,group],gi)=>(
                      <div key={gi} className="rounded-xl overflow-hidden" style={{border:`1px solid ${T.amber}25`}}>
                        <div className="flex items-center gap-2 px-4 py-2" style={{background:`${T.amber}06`,borderBottom:`1px solid ${T.amber}20`}}>
                          <AlertTriangle size={11} color={T.amber}/>
                          <span className="flex-1 truncate" style={{fontSize:11,color:T.amber,fontStyle:"italic"}}>"{src}"</span>
                          <span style={{fontSize:9,fontFamily:T.mono,color:T.amber}}>{group.length}×</span>
                        </div>
                        {group.map(e=>(
                          <div key={e.id} className="flex items-center gap-3 px-4 py-2" style={{borderBottom:`1px solid ${T.borderSubtle}`}}>
                            <code style={{fontSize:10,fontFamily:T.mono,color:T.cyan}}>{e.hash}</code>
                            <span className="flex-1" style={{fontSize:11,fontFamily:T.mono,color:T.textSecondary}}>{e.keyString}</span>
                            <button onClick={()=>{setTab("editor");startEdit(e);}} className="px-2 py-0.5 rounded-md hover:bg-white/10 transition-all"
                              style={{fontSize:9,color:T.textMuted,border:`1px solid ${T.borderSubtle}`}}>Edit</button>
                          </div>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* ── IMPORT / EXPORT ── */}
              {tab==="io" && (
                <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:T.textPrimary}}>Import / Export</div>
                    <div style={{fontSize:11,color:T.textMuted}}>Exchange string tables with translation tools and other Sims 4 editors.</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Export */}
                    {[{dir:"Export",icon:Download},{dir:"Import",icon:Upload}].map(({dir,icon:Icon})=>(
                      <div key={dir} className="rounded-xl overflow-hidden" style={{border:`1px solid ${T.border}`}}>
                        <div className="px-4 py-2 flex items-center gap-2" style={{background:T.bgSurface,borderBottom:`1px solid ${T.border}`}}>
                          <Icon size={12} color={T.textMuted}/>
                          <span style={{fontSize:10,fontWeight:700,color:T.textMuted,letterSpacing:"0.06em"}}>{dir.toUpperCase()}</span>
                        </div>
                        <div className="p-4 space-y-2">
                          {[
                            {fmt:"CSV",  color:T.emerald, desc:dir==="Export"?`${entries.length} entries`:"Comma-separated"},
                            {fmt:"XLIFF",color:T.violet,  desc:dir==="Export"?"Translation eXchange":"XLIFF 2.0 format"},
                            {fmt:"JSON", color:T.amber,   desc:dir==="Export"?"Machine-readable":"Array format"},
                            {fmt:"PKG",  color:T.cyan,    desc:dir==="Export"?"Sims 4 binary":"Binary .package"},
                          ].map(opt=>(
                            <button key={opt.fmt}
                              onClick={()=>dir==="Export"
                                ?toast.success(`${opt.fmt} exported`,{description:`strings_es-ES.${opt.fmt.toLowerCase()}`})
                                :toast.info(`Import ${opt.fmt}`,{description:"File picker disabled in demo mode"})}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all"
                              style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${T.borderSubtle}`}}
                              onMouseEnter={e=>{e.currentTarget.style.background=T.bgHover;}}
                              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.02)";}}>
                              <span className="flex-shrink-0 px-1.5 py-0.5 rounded" style={{fontSize:9,fontWeight:800,fontFamily:T.mono,color:opt.color,background:`${opt.color}15`}}>{opt.fmt}</span>
                              <span style={{fontSize:11,color:T.textSecondary,flex:1,textAlign:"left"}}>{dir} as {opt.fmt}</span>
                              <span style={{fontSize:9,color:T.textDim}}>{opt.desc}</span>
                              <Icon size={11} color={T.textDim}/>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default StringTableManager;

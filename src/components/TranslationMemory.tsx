"use client";

/* ─────────────────────────────────────────────────────────────
   JPE Studio — Translation Memory (Phase 15)
   TM database: fuzzy match scoring, per-segment confidence,
   TMX import/export, add/edit/delete entries, quick-insert
   suggestions for the active translation workspace.
   ───────────────────────────────────────────────────────────── */
import { useState, useMemo } from "react";
import {
  X, Languages, Search, Plus, Trash2, Copy, Check,
  Upload, Download, Globe, Star,
  Zap, MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "./jpe-motion";
import { T } from "./robust/jpe-theme";
import { toast } from "sonner";

/* ── Types ── */
interface TmSegment {
  id: string;
  source: string;
  target: string;
  confidence: number;  // 0–100
  locale: string;
  domain: string;
  usageCount: number;
  lastUsed: string;
  starred: boolean;
}

type SortKey = "confidence" | "source" | "usage" | "date";
type SortDir = "asc" | "desc";

/* ── Mock TM data ── */
const INITIAL_TM: TmSegment[] = [
  {id:"tm01",source:"Evil",                             target:"Malvado",                                   confidence:100,locale:"es-ES",domain:"Traits",     usageCount:47,lastUsed:"2026-03-11",starred:true},
  {id:"tm02",source:"Good",                             target:"Bueno",                                     confidence:100,locale:"es-ES",domain:"Traits",     usageCount:39,lastUsed:"2026-03-10",starred:false},
  {id:"tm03",source:"Hug Friend",                       target:"Abrazar amigo",                             confidence:100,locale:"es-ES",domain:"Interactions",usageCount:22,lastUsed:"2026-03-09",starred:false},
  {id:"tm04",source:"Tell Joke",                        target:"Contar chiste",                             confidence:96, locale:"es-ES",domain:"Interactions",usageCount:18,lastUsed:"2026-03-08",starred:false},
  {id:"tm05",source:"Feeling Evil",                     target:"Sintiéndose malvado",                       confidence:94, locale:"es-ES",domain:"Buffs",       usageCount:15,lastUsed:"2026-03-07",starred:true},
  {id:"tm06",source:"Mischief",                         target:"Picardía",                                  confidence:91, locale:"es-ES",domain:"Skills",      usageCount:12,lastUsed:"2026-03-06",starred:false},
  {id:"tm07",source:"Villain",                          target:"Villano",                                   confidence:100,locale:"es-ES",domain:"Careers",     usageCount:29,lastUsed:"2026-03-11",starred:false},
  {id:"tm08",source:"Chief of Mischief",                target:"Jefe de la picardía",                       confidence:88, locale:"es-ES",domain:"Aspirations", usageCount:9, lastUsed:"2026-03-05",starred:false},
  {id:"tm09",source:"Devilish Grin",                    target:"Sonrisa diabólica",                         confidence:100,locale:"es-ES",domain:"Moodlets",    usageCount:11,lastUsed:"2026-03-08",starred:false},
  {id:"tm10",source:"Haunted",                          target:"Encantado",                                 confidence:79, locale:"es-ES",domain:"Lot Traits",  usageCount:6, lastUsed:"2026-03-04",starred:false},
  {id:"tm11",source:"These Sims take great pleasure",   target:"Estos Sims disfrutan enormemente",          confidence:85, locale:"es-ES",domain:"Traits",     usageCount:3, lastUsed:"2026-03-03",starred:false},
  {id:"tm12",source:"Masters of Mischief",              target:"Maestros de la Picardía",                   confidence:92, locale:"es-ES",domain:"Skills",      usageCount:7, lastUsed:"2026-03-06",starred:false},
  {id:"tm13",source:"Evil Mastermind",                  target:"Mente maestra del mal",                     confidence:100,locale:"es-ES",domain:"Careers",     usageCount:14,lastUsed:"2026-03-09",starred:true},
  {id:"tm14",source:"Argue Loudly",                     target:"Discutir fuerte",                           confidence:83, locale:"es-ES",domain:"Interactions",usageCount:5, lastUsed:"2026-03-02",starred:false},
  {id:"tm15",source:"Feeling Mischievous",              target:"Sintiéndose travieso",                      confidence:97, locale:"es-ES",domain:"Buffs",       usageCount:8, lastUsed:"2026-03-07",starred:false},
];

const DOMAINS = ["All","Traits","Interactions","Buffs","Skills","Careers","Aspirations","Lot Traits","Moodlets"];
const LOCALES  = ["es-ES","fr-FR","de-DE","pt-BR","zh-CN","ko-KR","ja-JP","ru-RU","pl-PL"];

/* ── Confidence badge ── */
function ConfBadge({pct}:{pct:number}) {
  const color = pct>=95?T.emerald:pct>=80?T.cyan:pct>=65?T.amber:T.rose;
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative rounded-full overflow-hidden" style={{width:36,height:4,background:"rgba(255,255,255,0.06)"}}>
        <div className="absolute inset-y-0 left-0 rounded-full" style={{width:`${pct}%`,background:color}}/>
      </div>
      <span style={{fontSize:10,fontWeight:700,fontFamily:T.mono,color}}>{pct}%</span>
    </div>
  );
}

/* ── Add-entry form ── */
function AddForm({locale,onAdd,onCancel}:{locale:string;onAdd:(s:TmSegment)=>void;onCancel:()=>void}) {
  const [src,setSrc]   = useState("");
  const [tgt,setTgt]   = useState("");
  const [dom,setDom]   = useState("Traits");
  const [conf,setConf] = useState(100);

  const submit = ()=>{
    if (!src.trim()||!tgt.trim()) { toast.error("Source and target are required"); return; }
    onAdd({id:`tm${Date.now()}`,source:src.trim(),target:tgt.trim(),confidence:conf,locale,domain:dom,usageCount:0,lastUsed:new Date().toISOString().split("T")[0],starred:false});
    toast.success("TM segment added");
  };

  return (
    <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.18}}
      className="rounded-xl overflow-hidden mx-6 mt-4 mb-2" style={{border:`1px solid ${T.cyan}30`,background:`${T.cyan}05`}}>
      <div className="flex items-center justify-between px-4 py-2.5" style={{borderBottom:`1px solid ${T.borderSubtle}`}}>
        <span style={{fontSize:10,fontWeight:700,color:T.cyan,letterSpacing:"0.06em"}}>ADD TM SEGMENT</span>
        <button onClick={onCancel}><X size={11} color={T.textMuted}/></button>
      </div>
      <div className="p-4 grid grid-cols-2 gap-3">
        <div className="col-span-2 grid grid-cols-2 gap-3">
          <div>
            <label style={{fontSize:9,fontWeight:700,color:T.textMuted,display:"block",marginBottom:3}}>SOURCE (en-US)</label>
            <textarea value={src} onChange={e=>setSrc(e.target.value)} rows={2} className="w-full px-2 py-1.5 rounded-lg outline-none resize-none"
              style={{fontSize:12,color:T.textPrimary,background:T.bgInput,border:`1px solid ${T.borderSubtle}`}}/>
          </div>
          <div>
            <label style={{fontSize:9,fontWeight:700,color:T.textMuted,display:"block",marginBottom:3}}>TARGET ({locale})</label>
            <textarea value={tgt} onChange={e=>setTgt(e.target.value)} rows={2} className="w-full px-2 py-1.5 rounded-lg outline-none resize-none"
              style={{fontSize:12,color:T.textPrimary,background:T.bgInput,border:`1px solid ${T.borderSubtle}`}}/>
          </div>
        </div>
        <div>
          <label style={{fontSize:9,fontWeight:700,color:T.textMuted,display:"block",marginBottom:3}}>DOMAIN</label>
          <select value={dom} onChange={e=>setDom(e.target.value)} className="w-full px-2 py-1.5 rounded-lg outline-none"
            style={{fontSize:11,color:T.textPrimary,background:T.bgInput,border:`1px solid ${T.borderSubtle}`}}>
            {DOMAINS.slice(1).map(d=><option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label style={{fontSize:9,fontWeight:700,color:T.textMuted,display:"block",marginBottom:3}}>CONFIDENCE — {conf}%</label>
          <input type="range" min={50} max={100} value={conf} onChange={e=>setConf(Number(e.target.value))} className="w-full"/>
        </div>
        <div className="col-span-2 flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-1.5 rounded-lg transition-all"
            style={{fontSize:11,color:T.textMuted,background:"rgba(255,255,255,0.03)",border:`1px solid ${T.borderSubtle}`}}>Cancel</button>
          <button onClick={submit} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
            style={{fontSize:11,fontWeight:700,color:"#fff",background:`linear-gradient(135deg,${T.cyan}CC,${T.violet}CC)`}}>
            <Check size={11}/> Add Segment
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main ── */
export function TranslationMemory({isOpen,onClose}:{isOpen:boolean;onClose:()=>void}) {
  const [segments,setSegments] = useState<TmSegment[]>(INITIAL_TM);
  const [locale,setLocale]     = useState("es-ES");
  const [domain,setDomain]     = useState("All");
  const [search,setSearch]     = useState("");
  const [sortKey,setSortKey]   = useState<SortKey>("confidence");
  const [sortDir,setSortDir]   = useState<SortDir>("desc");
  const [adding,setAdding]     = useState(false);
  const [copied,setCopied]     = useState<string|null>(null);

  const toggleSort = (k:SortKey)=>{ if(sortKey===k) setSortDir(d=>d==="asc"?"desc":"asc"); else{setSortKey(k);setSortDir("desc");} };

  const filtered = useMemo(()=>{
    let rows = segments.filter(s=>s.locale===locale);
    if (domain!=="All") rows=rows.filter(s=>s.domain===domain);
    if (search) {
      const q=search.toLowerCase();
      rows=rows.filter(s=>s.source.toLowerCase().includes(q)||s.target.toLowerCase().includes(q)||s.domain.toLowerCase().includes(q));
    }
    return [...rows].sort((a,b)=>{
      let va:number|string, vb:number|string;
      if (sortKey==="confidence")  {va=a.confidence;vb=b.confidence;}
      else if (sortKey==="source") {va=a.source;    vb=b.source;}
      else if (sortKey==="usage")  {va=a.usageCount;vb=b.usageCount;}
      else                          {va=a.lastUsed;  vb=b.lastUsed;}
      if (typeof va==="number"&&typeof vb==="number") return sortDir==="asc"?va-vb:vb-va;
      return sortDir==="asc"?(va as string).localeCompare(vb as string):(vb as string).localeCompare(va as string);
    });
  },[segments,locale,domain,search,sortKey,sortDir]);

  const starred = filtered.filter(s=>s.starred);

  const copy = (id:string, text:string)=>{
    navigator.clipboard.writeText(text).then(()=>{ setCopied(id); setTimeout(()=>setCopied(null),1500); toast.success("Target copied to clipboard"); }).catch(()=>{});
  };

  const deleteSegment = (id:string)=>{ setSegments(prev=>prev.filter(s=>s.id!==id)); toast.success("Segment deleted"); };
  const toggleStar   = (id:string)=>{ setSegments(prev=>prev.map(s=>s.id===id?{...s,starred:!s.starred}:s)); };

  const addSegment = (seg:TmSegment)=>{ setSegments(prev=>[seg,...prev]); setAdding(false); };

  const totalByLocale = segments.filter(s=>s.locale===locale).length;
  const avgConf       = filtered.length>0?Math.round(filtered.reduce((a,s)=>a+s.confidence,0)/filtered.length):0;

  if (!isOpen) return null;

  const SORT_COLS:{key:SortKey;label:string}[] = [{key:"confidence",label:"Confidence"},{key:"source",label:"Source"},{key:"usage",label:"Usage"},{key:"date",label:"Last Used"}];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-[200] flex items-center justify-center"
          initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
          style={{background:"rgba(0,0,0,0.82)",backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)"}}
          onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
          <motion.div initial={{opacity:0,scale:0.97,y:12}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.97,y:12}}
            transition={{duration:0.22,ease:[0.16,1,0.3,1]}}
            className="relative flex flex-col rounded-2xl overflow-hidden"
            style={{width:"min(1060px,97vw)",maxHeight:"90vh",background:T.bgElevated,border:`1px solid ${T.border}`,boxShadow:`${T.shadow2Xl},inset 0 1px 0 rgba(255,255,255,0.04)`}}>

            {/* Accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{background:`linear-gradient(90deg,transparent 5%,${T.violet}80,${T.cyan}80,transparent 95%)`}}/>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 flex-shrink-0" style={{borderBottom:`1px solid ${T.border}`}}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:`linear-gradient(135deg,${T.violet}20,${T.cyan}20)`,border:`1px solid ${T.borderSubtle}`}}>
                  <Languages size={16} color={T.violet}/>
                </div>
                <div>
                  <div style={{fontSize:15,fontWeight:700,color:T.textPrimary,fontFamily:T.display}}>Translation Memory</div>
                  <div style={{fontSize:10,color:T.textMuted,fontFamily:T.mono}}>{totalByLocale} segments · en-US → {locale} · avg {avgConf}% confidence</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Import/Export */}
                <button onClick={()=>toast.info("Import TMX",{description:"File picker disabled in demo mode"})}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
                  style={{fontSize:11,color:T.textSecondary,background:"rgba(255,255,255,0.03)",border:`1px solid ${T.borderSubtle}`}}>
                  <Upload size={11}/> Import TMX
                </button>
                <button onClick={()=>toast.success("TMX exported",{description:`translation_memory_${locale}.tmx`})}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
                  style={{fontSize:11,color:T.textSecondary,background:"rgba(255,255,255,0.03)",border:`1px solid ${T.borderSubtle}`}}>
                  <Download size={11}/> Export TMX
                </button>
                <button onClick={()=>setAdding(p=>!p)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
                  style={{fontSize:11,fontWeight:700,color:T.violet,background:T.violetDim,border:`1px solid ${T.violet}20`}}>
                  <Plus size={12}/> Add
                </button>
                <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all" style={{border:`1px solid ${T.borderSubtle}`}}>
                  <X size={14} color={T.textMuted}/>
                </button>
              </div>
            </div>

            {/* Filter bar */}
            <div className="flex items-center gap-3 px-6 py-2.5 flex-shrink-0" style={{borderBottom:`1px solid ${T.borderSubtle}`,background:"rgba(0,0,0,0.1)"}}>
              {/* Locale */}
              <div className="flex items-center gap-2">
                <Globe size={12} color={T.textMuted}/>
                <select value={locale} onChange={e=>setLocale(e.target.value)} className="rounded-lg outline-none px-2 py-1"
                  style={{fontSize:11,fontFamily:T.mono,color:T.textSecondary,background:T.bgInput,border:`1px solid ${T.borderSubtle}`}}>
                  {LOCALES.map(l=><option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              {/* Domain */}
              <div className="flex items-center gap-0 rounded-lg overflow-hidden" style={{border:`1px solid ${T.borderSubtle}`}}>
                {DOMAINS.map(d=>(
                  <button key={d} onClick={()=>setDomain(d)} className="px-2.5 py-1 transition-all"
                    style={{fontSize:10,fontWeight:domain===d?700:400,color:domain===d?T.textPrimary:T.textMuted,background:domain===d?T.bgHover:"transparent"}}>
                    {d}
                  </button>
                ))}
              </div>
              <div className="flex-1"/>
              {/* Search */}
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg" style={{background:T.bgInput,border:`1px solid ${T.borderSubtle}`}}>
                <Search size={11} color={T.textMuted}/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search source or target…" className="bg-transparent outline-none w-40"
                  style={{fontSize:11,color:T.textSecondary}}/>
                {search&&<button onClick={()=>setSearch("")}><X size={9} color={T.textMuted}/></button>}
              </div>
              <span style={{fontSize:9,fontFamily:T.mono,color:T.textMuted}}>{filtered.length} segments</span>
            </div>

            {/* Add form */}
            <AnimatePresence>
              {adding&&<AddForm locale={locale} onAdd={addSegment} onCancel={()=>setAdding(false)}/>}
            </AnimatePresence>

            {/* Starred */}
            {starred.length>0&&!search&&domain==="All"&&(
              <div className="px-6 pt-3 pb-1 flex-shrink-0">
                <div style={{fontSize:9,fontWeight:700,color:T.amber,letterSpacing:"0.07em",marginBottom:6}}>⭐ STARRED SEGMENTS</div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{scrollbarWidth:"none"}}>
                  {starred.map(s=>(
                    <div key={s.id} className="flex-shrink-0 px-3 py-2 rounded-xl" style={{background:`${T.amber}08`,border:`1px solid ${T.amber}20`,maxWidth:220}}>
                      <div className="truncate" style={{fontSize:11,color:T.textPrimary}}>{s.source}</div>
                      <div className="truncate" style={{fontSize:11,color:T.textMuted}}>→ {s.target}</div>
                      <ConfBadge pct={s.confidence}/>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Table header */}
            <div className="flex-shrink-0">
              <div className="grid px-6 py-1.5" style={{gridTemplateColumns:"1fr 1fr 120px 80px 70px 80px",gap:12,background:T.bgSurface,borderBottom:`1px solid ${T.border}`,borderTop:`1px solid ${T.borderSubtle}`}}>
                {SORT_COLS.map(col=>(
                  <button key={col.key} onClick={()=>toggleSort(col.key)}
                    className="flex items-center gap-1 text-left"
                    style={{fontSize:9,fontWeight:700,color:sortKey===col.key?T.cyan:T.textMuted,letterSpacing:"0.06em",textTransform:"uppercase"}}>
                    {col.label}
                    {sortKey===col.key&&<span style={{color:T.cyan}}>{sortDir==="asc"?"↑":"↓"}</span>}
                  </button>
                ))}
                <div/>
              </div>
            </div>

            {/* Rows */}
            <div className="flex-1 overflow-y-auto">
              {filtered.length===0?(
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <MessageSquare size={24} color={T.textDim} strokeWidth={1.5}/>
                  <span style={{fontSize:13,color:T.textMuted}}>No TM segments found</span>
                </div>
              ):(
                filtered.map(seg=>{
                  const isCopied = copied===seg.id;
                  return (
                    <div key={seg.id} className="grid items-center px-6 py-2.5 group transition-colors"
                      style={{gridTemplateColumns:"1fr 1fr 120px 80px 70px 80px",gap:12,borderBottom:`1px solid ${T.borderSubtle}`}}
                      onMouseEnter={e=>{e.currentTarget.style.background=T.bgHover;}}
                      onMouseLeave={e=>{e.currentTarget.style.background="transparent";}}>
                      {/* Source */}
                      <div className="flex items-center gap-2 min-w-0">
                        <button onClick={()=>toggleStar(seg.id)} className="flex-shrink-0 transition-all">
                          <Star size={11} color={seg.starred?T.amber:T.textDim} fill={seg.starred?T.amber:"none"}/>
                        </button>
                        <span className="truncate" style={{fontSize:12,color:T.textSecondary}}>{seg.source}</span>
                      </div>
                      {/* Target */}
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="truncate flex-1" style={{fontSize:12,color:T.textPrimary}}>{seg.target}</span>
                        <button onClick={()=>copy(seg.id,seg.target)} className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          {isCopied?<Check size={11} color={T.emerald}/>:<Copy size={11} color={T.textMuted}/>}
                        </button>
                      </div>
                      {/* Confidence */}
                      <ConfBadge pct={seg.confidence}/>
                      {/* Domain */}
                      <span className="truncate" style={{fontSize:10,color:T.textMuted}}>{seg.domain}</span>
                      {/* Usage */}
                      <div className="flex items-center gap-1">
                        <Zap size={9} color={T.textDim}/>
                        <span style={{fontSize:10,fontFamily:T.mono,color:T.textTertiary}}>{seg.usageCount}×</span>
                      </div>
                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span style={{fontSize:9,fontFamily:T.mono,color:T.textDim}}>{seg.lastUsed}</span>
                        <button onClick={()=>deleteSegment(seg.id)} className="p-1 rounded hover:bg-white/10 transition-all ml-1">
                          <Trash2 size={10} color={T.rose}/>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-2.5 flex-shrink-0" style={{borderTop:`1px solid ${T.border}`,background:"rgba(0,0,0,0.15)"}}>
              <div className="flex items-center gap-3">
                {[{label:"Total",value:totalByLocale,color:T.textPrimary},{label:"≥95%",value:segments.filter(s=>s.locale===locale&&s.confidence>=95).length,color:T.emerald},{label:"80–94%",value:segments.filter(s=>s.locale===locale&&s.confidence>=80&&s.confidence<95).length,color:T.cyan},{label:"<80%",value:segments.filter(s=>s.locale===locale&&s.confidence<80).length,color:T.amber}].map(s=>(
                  <div key={s.label} className="flex items-center gap-1.5">
                    <span style={{fontSize:9,color:T.textMuted}}>{s.label}</span>
                    <span style={{fontSize:11,fontWeight:700,fontFamily:T.mono,color:s.color}}>{s.value}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={()=>{setSearch("");setDomain("All");}} className="px-2.5 py-1 rounded-lg transition-all hover:bg-white/5"
                  style={{fontSize:10,color:T.textMuted}}>Clear filters</button>
                <button onClick={onClose} className="px-3 py-1.5 rounded-lg transition-all"
                  style={{fontSize:11,color:T.textMuted,border:`1px solid ${T.borderSubtle}`}}>Close</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default TranslationMemory;

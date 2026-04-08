"use client";

/* ─────────────────────────────────────────────────────────────
   JPE Studio — Batch Operations (Phase 18)
   Multi-file find & replace, bulk key rename, mass translation
   fill, and regex transform across the entire mod workspace.
   ───────────────────────────────────────────────────────────── */
import { useState, useMemo, useCallback } from "react";
import {
  X, Replace, Search, Hash, Globe, RefreshCw,
  Check, AlertTriangle, Play, Folder,
  FileText, Code2, Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "./jpe-motion";
import { T } from "./robust/jpe-theme";
import { toast } from "sonner";

/* ── Types ── */
type BatchTab = "find-replace" | "rename-keys" | "mass-translate" | "regex";

interface PreviewRow {
  file: string;
  line: number;
  before: string;
  after: string;
}

interface MassTranslateRow {
  key: string;
  source: string;
  locale: string;
  suggestion: string;
  selected: boolean;
}

/* ── Mock preview data ── */
function makeFRPreview(find: string, replace: string): PreviewRow[] {
  if (!find.trim()) return [];
  return [
    { file:"trait_Evil.xml",        line:3,  before:`  <Tunable n="${find}" t="TraitType" ev="PERSONALITY"/>`,   after:`  <Tunable n="${replace}" t="TraitType" ev="PERSONALITY"/>` },
    { file:"buff_EvilGlee.xml",     line:12, before:`  <Tunable n="${find}" ev="true"/>`,                        after:`  <Tunable n="${replace}" ev="true"/>` },
    { file:"strings_en-US.stbl",   line:4,  before:`  <T n="${find}">Evil glee fills your Sim.</T>`,            after:`  <T n="${replace}">Evil glee fills your Sim.</T>` },
  ];
}

const MISSING_TRANSLATIONS: MassTranslateRow[] = [
  {key:"trait_evil_buff_desc",     source:"There's nothing like seeing others suffer.",       locale:"es-ES", suggestion:"No hay nada como ver sufrir a los demás.",               selected:true},
  {key:"interaction_hug_stranger", source:"Hug Stranger",                                     locale:"es-ES", suggestion:"Abrazar a un desconocido",                               selected:true},
  {key:"notification_evil_fail",   source:"Their evil plan was foiled…",                      locale:"es-ES", suggestion:"Su plan malvado fue frustrado…",                         selected:false},
  {key:"skill_mischief_desc",      source:"Masters of Mischief know how to get under anyone's skin.", locale:"es-ES", suggestion:"Los maestros de la picardía saben cómo irritar a cualquiera.", selected:true},
  {key:"lot_trait_haunted",        source:"Haunted",                                           locale:"fr-FR", suggestion:"Hanté",                                                  selected:true},
  {key:"trait_evil_buff_desc",     source:"There's nothing like seeing others suffer.",       locale:"fr-FR", suggestion:"Il n'y a rien de tel que de voir les autres souffrir.",   selected:false},
];

const REGEX_TEMPLATES = [
  {label:"Wrap text in CDATA",       find:"(<Tunable n=\"[^\"]+\">)([^<]+)(</Tunable>)", replace:"$1<![CDATA[$2]]>$3"},
  {label:"Normalize whitespace",     find:"\\s{2,}", replace:" "},
  {label:"Add key prefix 'jpe_'",    find:"(n=\")(\\w)",            replace:"$1jpe_$2"},
  {label:"Remove empty elements",    find:"<(\\w+)/>\\s*\\n",       replace:""},
  {label:"Uppercase enum values",    find:"(ev=\")([a-z]+)",        replace:"$1\\U$2"},
];

export function BatchOperations({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [tab, setTab]         = useState<BatchTab>("find-replace");
  const [find, setFind]       = useState("trait_type");
  const [replace, setReplace] = useState("new_trait_type");
  const [scope, setScope]     = useState<"current"|"all"|"selected">("all");
  const [caseMatch, setCaseMatch]   = useState(false);
  const [wholeWord, setWholeWord]   = useState(false);
  const [useRegex, setUseRegex]     = useState(false);
  const [renameFrom, setRenameFrom] = useState("trait_evil");
  const [renameTo, setRenameTo]     = useState("trait_villainous");
  const [massRows, setMassRows]     = useState<MassTranslateRow[]>(MISSING_TRANSLATIONS);
  const [regexFind, setRegexFind]   = useState(REGEX_TEMPLATES[0].find);
  const [regexReplace, setRegexReplace] = useState(REGEX_TEMPLATES[0].replace);
  const [running, setRunning]       = useState(false);
  const [done, setDone]             = useState<BatchTab|null>(null);

  const frPreview = useMemo(()=>makeFRPreview(find,replace),[find,replace]);

  const renamePreview = useMemo(()=>{
    if(!renameFrom.trim()) return [];
    return ["strings_en-US.stbl","strings_es-ES.stbl","trait_Evil.xml"].map((f,i)=>({
      file:f, line:i*5+1,
      before:`key="${renameFrom}"`, after:`key="${renameTo}"`
    }));
  },[renameFrom,renameTo]);

  const runOp = useCallback(async (t:BatchTab)=>{
    setRunning(true); setDone(null);
    await new Promise(r=>setTimeout(r,900+Math.random()*400));
    setRunning(false); setDone(t);
    if (t==="find-replace") toast.success(`Replaced "${find}"`,{description:`${frPreview.length} occurrences in ${frPreview.length} files`});
    else if (t==="rename-keys") toast.success(`Renamed "${renameFrom}" → "${renameTo}"`,{description:`${renamePreview.length} occurrences updated`});
    else if (t==="mass-translate") { const n=massRows.filter(r=>r.selected).length; toast.success(`${n} translations applied`); }
    else toast.success("Regex transform applied");
  },[find,replace,frPreview,renameFrom,renameTo,renamePreview,massRows]);

  if (!isOpen) return null;

  const TABS:{id:BatchTab;label:string;Icon:typeof Search}[]=[
    {id:"find-replace",   label:"Find & Replace", Icon:Replace},
    {id:"rename-keys",    label:"Rename Keys",    Icon:Hash},
    {id:"mass-translate", label:"Mass Translate",  Icon:Globe},
    {id:"regex",          label:"Regex Transform", Icon:Code2},
  ];

  const ScopeBtn = ({v,l}:{v:typeof scope;l:string})=>(
    <button onClick={()=>setScope(v)} className="flex items-center gap-1 px-2.5 py-1 rounded-md transition-all"
      style={{fontSize:10,fontWeight:scope===v?700:400,color:scope===v?T.textPrimary:T.textMuted,background:scope===v?T.bgActive:"transparent",border:`1px solid ${scope===v?T.borderSubtle:"transparent"}`}}>
      {v==="current"?<FileText size={9}/>:v==="all"?<Folder size={9}/>:<Check size={9}/>}{l}
    </button>
  );

  const Toggle = ({on,set,label}:{on:boolean;set:(v:boolean)=>void;label:string})=>(
    <button onClick={()=>set(!on)} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all"
      style={{fontSize:10,fontWeight:on?700:400,color:on?T.cyan:T.textMuted,background:on?T.cyanDim:"transparent",border:`1px solid ${on?T.cyan+"30":T.borderSubtle}`}}>
      {on&&<Check size={9}/>}{label}
    </button>
  );

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
            style={{width:"min(1000px,97vw)",height:"min(700px,90vh)",background:T.bgElevated,border:`1px solid ${T.border}`,boxShadow:`${T.shadow2Xl},inset 0 1px 0 rgba(255,255,255,0.04)`}}>

            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{background:`linear-gradient(90deg,transparent 5%,${T.emerald}80,${T.cyan}80,transparent 95%)`}}/>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 flex-shrink-0" style={{borderBottom:`1px solid ${T.border}`}}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:`linear-gradient(135deg,${T.emerald}20,${T.cyan}20)`,border:`1px solid ${T.borderSubtle}`}}>
                  <Replace size={16} color={T.emerald}/>
                </div>
                <div>
                  <div style={{fontSize:15,fontWeight:700,color:T.textPrimary,fontFamily:T.display}}>Batch Operations</div>
                  <div style={{fontSize:10,color:T.textMuted,fontFamily:T.mono}}>Multi-file transformations across the mod workspace</div>
                </div>
              </div>
              <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all" style={{border:`1px solid ${T.borderSubtle}`}}>
                <X size={14} color={T.textMuted}/>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center px-4 flex-shrink-0" style={{borderBottom:`1px solid ${T.border}`,background:"rgba(0,0,0,0.08)"}}>
              {TABS.map(({id,label,Icon})=>{
                const active=tab===id;
                return (
                  <button key={id} onClick={()=>{setTab(id);setDone(null);}} className="flex items-center gap-1.5 px-4 py-2.5 transition-all"
                    style={{fontSize:11,fontWeight:active?700:400,color:active?T.textPrimary:T.textMuted,borderBottom:`2px solid ${active?T.emerald:"transparent"}`,marginBottom:-1}}>
                    <Icon size={11} color={active?T.emerald:T.textMuted}/>{label}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="flex flex-1 min-h-0 overflow-hidden">
              {/* Config panel */}
              <div className="flex flex-col flex-shrink-0 overflow-y-auto p-5 space-y-4" style={{width:320,borderRight:`1px solid ${T.border}`}}>

                {tab==="find-replace" && (
                  <>
                    <div>
                      <label style={{fontSize:9,fontWeight:700,color:T.textMuted,letterSpacing:"0.06em",display:"block",marginBottom:4}}>FIND</label>
                      <input value={find} onChange={e=>setFind(e.target.value)} className="w-full px-3 py-2 rounded-lg outline-none"
                        style={{fontSize:12,fontFamily:T.mono,color:T.textPrimary,background:T.bgInput,border:`1px solid ${T.borderSubtle}`}}/>
                    </div>
                    <div>
                      <label style={{fontSize:9,fontWeight:700,color:T.textMuted,letterSpacing:"0.06em",display:"block",marginBottom:4}}>REPLACE WITH</label>
                      <input value={replace} onChange={e=>setReplace(e.target.value)} className="w-full px-3 py-2 rounded-lg outline-none"
                        style={{fontSize:12,fontFamily:T.mono,color:T.textPrimary,background:T.bgInput,border:`1px solid ${T.borderSubtle}`}}/>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Toggle on={caseMatch} set={setCaseMatch} label="Match Case"/>
                      <Toggle on={wholeWord} set={setWholeWord} label="Whole Word"/>
                      <Toggle on={useRegex}  set={setUseRegex}  label="Regex"/>
                    </div>
                    <div>
                      <label style={{fontSize:9,fontWeight:700,color:T.textMuted,letterSpacing:"0.06em",display:"block",marginBottom:6}}>SCOPE</label>
                      <div className="flex items-center gap-1">
                        <ScopeBtn v="current" l="Current File"/>
                        <ScopeBtn v="all"     l="All Files"/>
                        <ScopeBtn v="selected" l="Selected"/>
                      </div>
                    </div>
                  </>
                )}

                {tab==="rename-keys" && (
                  <>
                    <div>
                      <label style={{fontSize:9,fontWeight:700,color:T.textMuted,letterSpacing:"0.06em",display:"block",marginBottom:4}}>FROM (key prefix)</label>
                      <input value={renameFrom} onChange={e=>setRenameFrom(e.target.value)} className="w-full px-3 py-2 rounded-lg outline-none"
                        style={{fontSize:12,fontFamily:T.mono,color:T.textPrimary,background:T.bgInput,border:`1px solid ${T.borderSubtle}`}}/>
                    </div>
                    <div>
                      <label style={{fontSize:9,fontWeight:700,color:T.textMuted,letterSpacing:"0.06em",display:"block",marginBottom:4}}>TO (new prefix)</label>
                      <input value={renameTo} onChange={e=>setRenameTo(e.target.value)} className="w-full px-3 py-2 rounded-lg outline-none"
                        style={{fontSize:12,fontFamily:T.mono,color:T.textPrimary,background:T.bgInput,border:`1px solid ${T.borderSubtle}`}}/>
                    </div>
                    <div className="p-3 rounded-lg" style={{background:`${T.amber}08`,border:`1px solid ${T.amber}20`}}>
                      <div className="flex items-start gap-2"><AlertTriangle size={12} color={T.amber} className="flex-shrink-0 mt-0.5"/>
                        <span style={{fontSize:10,color:T.amber,lineHeight:1.5}}>Renaming recalculates FNV-32a hashes. Review all cross-references before applying.</span>
                      </div>
                    </div>
                  </>
                )}

                {tab==="mass-translate" && (
                  <>
                    <div style={{fontSize:12,color:T.textMuted,lineHeight:1.6}}>Apply AI-suggested translations for all missing strings. Review suggestions in the preview and deselect any you want to translate manually.</div>
                    <div className="flex items-center justify-between">
                      <span style={{fontSize:10,color:T.textMuted}}>{massRows.filter(r=>r.selected).length} of {massRows.length} selected</span>
                      <button onClick={()=>setMassRows(p=>p.map(r=>({...r,selected:true})))} style={{fontSize:10,color:T.cyan}}>Select all</button>
                    </div>
                  </>
                )}

                {tab==="regex" && (
                  <>
                    <div>
                      <label style={{fontSize:9,fontWeight:700,color:T.textMuted,letterSpacing:"0.06em",display:"block",marginBottom:4}}>TEMPLATES</label>
                      <div className="space-y-1">
                        {REGEX_TEMPLATES.map(t=>(
                          <button key={t.label} onClick={()=>{setRegexFind(t.find);setRegexReplace(t.replace);}}
                            className="w-full text-left px-3 py-2 rounded-lg transition-all"
                            style={{fontSize:10,color:T.textSecondary,background:"rgba(255,255,255,0.02)",border:`1px solid ${T.borderSubtle}`}}
                            onMouseEnter={e=>{e.currentTarget.style.background=T.bgHover;}}
                            onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.02)";}}>
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label style={{fontSize:9,fontWeight:700,color:T.textMuted,letterSpacing:"0.06em",display:"block",marginBottom:4}}>PATTERN</label>
                      <input value={regexFind} onChange={e=>setRegexFind(e.target.value)} className="w-full px-3 py-2 rounded-lg outline-none"
                        style={{fontSize:11,fontFamily:T.mono,color:T.rose,background:T.bgInput,border:`1px solid ${T.borderSubtle}`}}/>
                    </div>
                    <div>
                      <label style={{fontSize:9,fontWeight:700,color:T.textMuted,letterSpacing:"0.06em",display:"block",marginBottom:4}}>REPLACEMENT</label>
                      <input value={regexReplace} onChange={e=>setRegexReplace(e.target.value)} className="w-full px-3 py-2 rounded-lg outline-none"
                        style={{fontSize:11,fontFamily:T.mono,color:T.emerald,background:T.bgInput,border:`1px solid ${T.borderSubtle}`}}/>
                    </div>
                  </>
                )}

                {/* Run button */}
                <div className="pt-2">
                  <button onClick={()=>runOp(tab)} disabled={running}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all disabled:opacity-50"
                    style={{fontSize:12,fontWeight:700,color:"#fff",background:`linear-gradient(135deg,${T.emerald}CC,${T.cyan}CC)`}}>
                    {running?<><RefreshCw size={13} className="animate-spin"/>Processing…</> :<><Play size={13}/>{tab==="mass-translate"?"Apply Translations":"Apply Operation"}</>}
                  </button>
                  {done===tab && (
                    <motion.div initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} className="flex items-center gap-2 mt-2 p-2 rounded-lg" style={{background:T.emeraldDim}}>
                      <Check size={12} color={T.emerald}/><span style={{fontSize:10,color:T.emerald}}>Operation completed</span>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Preview panel */}
              <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <div className="px-4 py-2.5 flex items-center gap-2 flex-shrink-0" style={{borderBottom:`1px solid ${T.border}`,background:T.bgSurface}}>
                  <Eye size={12} color={T.textMuted}/>
                  <span style={{fontSize:10,fontWeight:700,color:T.textMuted,letterSpacing:"0.06em"}}>PREVIEW</span>
                  <span style={{fontSize:9,color:T.textDim,fontFamily:T.mono}}>
                    {tab==="find-replace"?`${frPreview.length} match${frPreview.length!==1?"es":""}`:
                     tab==="rename-keys"?`${renamePreview.length} occurrences`:
                     tab==="mass-translate"?`${massRows.filter(r=>r.selected).length} to apply`:
                     "regex preview"}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {(tab==="find-replace"||tab==="rename-keys") && (
                    (tab==="find-replace"?frPreview:renamePreview).map((row,i)=>(
                      <div key={i} className="px-4 py-3" style={{borderBottom:`1px solid ${T.borderSubtle}`}}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <FileText size={10} color={T.textMuted}/>
                          <span style={{fontSize:10,fontFamily:T.mono,color:T.textMuted}}>{row.file}:{row.line}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="px-2 py-1 rounded" style={{background:`${T.rose}08`}}>
                            <code style={{fontSize:10,fontFamily:T.mono,color:T.rose}}>{row.before}</code>
                          </div>
                          <div className="px-2 py-1 rounded" style={{background:`${T.emerald}08`}}>
                            <code style={{fontSize:10,fontFamily:T.mono,color:T.emerald}}>{row.after}</code>
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  {tab==="mass-translate" && massRows.map((row,i)=>(
                    <div key={i} className="flex items-start gap-3 px-4 py-3" style={{borderBottom:`1px solid ${T.borderSubtle}`,opacity:row.selected?1:0.4}}>
                      <button onClick={()=>setMassRows(p=>p.map((r,j)=>j===i?{...r,selected:!r.selected}:r))}
                        className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                        style={{background:row.selected?T.emerald:"transparent",border:`1px solid ${row.selected?T.emerald:T.borderSubtle}`}}>
                        {row.selected&&<Check size={9} color="#fff"/>}
                      </button>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <code style={{fontSize:10,fontFamily:T.mono,color:T.cyan}}>{row.key}</code>
                          <span className="px-1.5 py-0 rounded" style={{fontSize:8,color:T.violet,background:`${T.violet}12`}}>{row.locale}</span>
                        </div>
                        <div style={{fontSize:11,color:T.textTertiary}}>{row.source}</div>
                        <div style={{fontSize:11,color:T.emerald}}>→ {row.suggestion}</div>
                      </div>
                    </div>
                  ))}

                  {tab==="regex" && (
                    <div className="p-4 space-y-3">
                      <div className="p-3 rounded-xl" style={{background:`${T.violet}06`,border:`1px solid ${T.violet}20`}}>
                        <div style={{fontSize:9,fontWeight:700,color:T.violet,marginBottom:6}}>PATTERN</div>
                        <code style={{fontSize:11,fontFamily:T.mono,color:T.rose}}>{regexFind}</code>
                      </div>
                      <div className="p-3 rounded-xl" style={{background:`${T.emerald}06`,border:`1px solid ${T.emerald}20`}}>
                        <div style={{fontSize:9,fontWeight:700,color:T.emerald,marginBottom:6}}>REPLACEMENT</div>
                        <code style={{fontSize:11,fontFamily:T.mono,color:T.emerald}}>{regexReplace}</code>
                      </div>
                      <div style={{fontSize:11,color:T.textMuted,lineHeight:1.6}}>Regex transform will be applied to all XML and STBL files in the workspace scope. Confirm with "Apply Operation" on the left.</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default BatchOperations;

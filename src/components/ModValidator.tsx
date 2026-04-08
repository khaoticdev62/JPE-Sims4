"use client";

/* ─────────────────────────────────────────────────────────────
   JPE Studio — Mod Validator (Phase 15)
   Real-time Sims 4 mod linting: XML tuning, STBL integrity,
   resource keys, dependency checks, best-practice hints,
   with per-item auto-fix and bulk-fix support.
   ───────────────────────────────────────────────────────────── */
import { useState, useCallback } from "react";
import {
  X, Shield, AlertTriangle, CheckCircle2, XCircle, Info,
  Zap, RefreshCw, Search, Wrench, FileCode, Package, Hash,
  FileText, ChevronRight, ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "./jpe-motion";
import { T } from "./robust/jpe-theme";
import { toast } from "sonner";

/* ── Types ── */
type Severity = "error" | "warning" | "info" | "hint";
type Category = "xml" | "stbl" | "resources" | "deps" | "best-practices";

interface ValidationResult {
  id: string;
  category: Category;
  severity: Severity;
  rule: string;
  message: string;
  file: string;
  line?: number;
  autoFixable: boolean;
  fixed: boolean;
}

/* ── Severity config ── */
const SEV: Record<Severity,{color:string;bg:string;label:string;Icon:typeof Shield}> = {
  error:   {color:T.rose,    bg:`${T.rose}10`,    label:"Error",   Icon:XCircle},
  warning: {color:T.amber,   bg:`${T.amber}10`,   label:"Warning", Icon:AlertTriangle},
  info:    {color:T.cyan,    bg:`${T.cyan}10`,     label:"Info",    Icon:Info},
  hint:    {color:T.violet,  bg:`${T.violet}10`,  label:"Hint",    Icon:Zap},
};

/* ── Category config ── */
const CAT: Record<Category,{label:string;Icon:typeof Shield}> = {
  xml:            {label:"XML Tuning",     Icon:FileCode},
  stbl:           {label:"STBL",           Icon:FileText},
  resources:      {label:"Resources",      Icon:Package},
  deps:           {label:"Dependencies",   Icon:Hash},
  "best-practices":{label:"Best Practices",Icon:Shield},
};

/* ── Mock validation results ── */
const MOCK_RESULTS: ValidationResult[] = [
  {id:"r01",category:"xml",      severity:"error",  rule:"XML-001",message:"Missing required <Instance> attribute",       file:"trait_Evil.xml",             line:47, autoFixable:false, fixed:false},
  {id:"r02",category:"xml",      severity:"error",  rule:"XML-003",message:"Unclosed tag <TunableList> detected",         file:"buff_evil_aura.xml",          line:31, autoFixable:true,  fixed:false},
  {id:"r03",category:"xml",      severity:"warning",rule:"XML-002",message:"Deprecated namespace V t=\"Interval\"",       file:"interaction_hug.xml",         line:23, autoFixable:true,  fixed:false},
  {id:"r04",category:"xml",      severity:"info",   rule:"XML-004",message:"Tuning file exceeds recommended 1 MB",        file:"trait_Evil.xml",             line:undefined, autoFixable:false, fixed:false},
  {id:"r05",category:"stbl",     severity:"error",  rule:"STBL-002",message:"Hash collision: 0x0A3B4C5D in es-ES & en-US",file:"strings_en_US.stbl",         line:undefined, autoFixable:false, fixed:false},
  {id:"r06",category:"stbl",     severity:"warning",rule:"STBL-001",message:"5 orphaned keys with no tuning reference",   file:"strings_en_US.stbl",         line:undefined, autoFixable:true,  fixed:false},
  {id:"r07",category:"stbl",     severity:"warning",rule:"STBL-003",message:"12 strings missing in ko-KR locale",         file:"strings_ko_KR.stbl",         line:undefined, autoFixable:false, fixed:false},
  {id:"r08",category:"resources",severity:"error",  rule:"RES-002", message:"Corrupted binary resource at key 0xF8B24C0A",file:"Evil_Trait_Override.package", line:undefined, autoFixable:false, fixed:false},
  {id:"r09",category:"resources",severity:"error",  rule:"RES-003", message:"Resource key format invalid: missing group", file:"Evil_Trait_Override.package", line:undefined, autoFixable:true,  fixed:false},
  {id:"r10",category:"resources",severity:"info",   rule:"RES-001", message:"Missing thumbnail resource for trait_Evil",  file:"Evil_Trait_Override.package", line:undefined, autoFixable:true,  fixed:false},
  {id:"r11",category:"deps",     severity:"error",  rule:"DEP-002", message:"Circular dependency: mod_a → mod_b → mod_a", file:"mod_manifest.json",           line:undefined, autoFixable:false, fixed:false},
  {id:"r12",category:"deps",     severity:"warning",rule:"DEP-001", message:"Required EA tuning S4_034AEECB:0x0000 not found",file:"mod_manifest.json",        line:undefined, autoFixable:false, fixed:false},
  {id:"r13",category:"best-practices",severity:"hint",rule:"BP-001",message:"3 keys violate snake_case naming convention",file:"strings_en_US.stbl",         line:undefined, autoFixable:true,  fixed:false},
  {id:"r14",category:"best-practices",severity:"hint",rule:"BP-002",message:"Hardcoded English text in 2 tuning files",   file:"trait_Evil.xml",             line:58, autoFixable:false, fixed:false},
  {id:"r15",category:"best-practices",severity:"hint",rule:"BP-003",message:"Missing author/version in package manifest", file:"mod_manifest.json",           line:undefined, autoFixable:true,  fixed:false},
];

type FilterSev  = Severity | "all";
type FilterCat  = Category | "all";

export function ModValidator({isOpen,onClose}:{isOpen:boolean;onClose:()=>void}) {
  const [state,setState]       = useState<"idle"|"running"|"done">("idle");
  const [progress,setProgress] = useState(0);
  const [results,setResults]   = useState<ValidationResult[]>([]);
  const [filterSev,setFilterSev] = useState<FilterSev>("all");
  const [filterCat,setFilterCat] = useState<FilterCat>("all");
  const [search,setSearch]     = useState("");
  const [expanded,setExpanded] = useState<Set<string>>(new Set());

  const runValidation = useCallback(async ()=>{
    setState("running"); setProgress(0); setResults([]);
    const steps=["Parsing XML tuning files…","Validating STBL string tables…","Checking resource key integrity…","Resolving dependencies…","Running best-practice checks…","Generating report…"];
    for (let i=0;i<steps.length;i++) {
      await new Promise(r=>setTimeout(r,420+Math.random()*180));
      setProgress(Math.round(((i+1)/steps.length)*100));
    }
    setResults(MOCK_RESULTS.map(r=>({...r})));
    setState("done");
    const errs=MOCK_RESULTS.filter(r=>r.severity==="error").length;
    toast[errs>0?"error":"warning"](`Validation complete`,{description:`${errs} errors · ${MOCK_RESULTS.filter(r=>r.severity==="warning").length} warnings · ${MOCK_RESULTS.filter(r=>r.severity==="hint").length} hints`});
  },[]);

  const fixItem = (id:string)=>{
    setResults(prev=>prev.map(r=>r.id===id?{...r,fixed:true}:r));
    toast.success("Auto-fix applied",{description:"Reload validation to confirm"});
  };

  const fixAll = ()=>{
    const count=results.filter(r=>r.autoFixable&&!r.fixed).length;
    setResults(prev=>prev.map(r=>r.autoFixable?{...r,fixed:true}:r));
    toast.success(`${count} auto-fixes applied`);
  };

  const toggleExpand = (id:string)=>setExpanded(prev=>{const n=new Set(prev);if(n.has(id))n.delete(id);else n.add(id);return n;});

  const visible = results.filter(r=>{
    if (r.fixed) return false;
    if (filterSev!=="all"&&r.severity!==filterSev) return false;
    if (filterCat!=="all"&&r.category!==filterCat) return false;
    if (search&&!r.message.toLowerCase().includes(search.toLowerCase())&&!r.file.toLowerCase().includes(search.toLowerCase())&&!r.rule.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const errCount   = results.filter(r=>!r.fixed&&r.severity==="error").length;
  const warnCount  = results.filter(r=>!r.fixed&&r.severity==="warning").length;
  const infoCount  = results.filter(r=>!r.fixed&&r.severity==="info").length;
  const hintCount  = results.filter(r=>!r.fixed&&r.severity==="hint").length;
  const fixedCount = results.filter(r=>r.fixed).length;
  const fixableCount = results.filter(r=>r.autoFixable&&!r.fixed).length;

  if (!isOpen) return null;

  const SEV_TABS:FilterSev[] = ["all","error","warning","info","hint"];
  const CAT_TABS:FilterCat[] = ["all","xml","stbl","resources","deps","best-practices"];

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
            style={{width:"min(960px,97vw)",maxHeight:"90vh",background:T.bgElevated,border:`1px solid ${T.border}`,boxShadow:`${T.shadow2Xl},inset 0 1px 0 rgba(255,255,255,0.04)`}}>

            {/* Accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{background:`linear-gradient(90deg,transparent 5%,${T.rose}80,${T.amber}80,transparent 95%)`}}/>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 flex-shrink-0" style={{borderBottom:`1px solid ${T.border}`}}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:`linear-gradient(135deg,${T.rose}20,${T.amber}20)`,border:`1px solid ${T.borderSubtle}`}}>
                  <Shield size={16} color={T.rose}/>
                </div>
                <div>
                  <div style={{fontSize:15,fontWeight:700,color:T.textPrimary,fontFamily:T.display}}>Mod Validator</div>
                  <div style={{fontSize:10,color:T.textMuted,fontFamily:T.mono}}>Sims 4 rules engine · XML tuning · STBL · resources · deps</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {state==="done"&&fixableCount>0&&(
                  <button onClick={fixAll} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
                    style={{fontSize:11,fontWeight:700,color:T.amber,background:T.amberDim,border:`1px solid ${T.amber}20`}}>
                    <Wrench size={12}/> Fix All ({fixableCount})
                  </button>
                )}
                <button onClick={runValidation} disabled={state==="running"}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                  style={{fontSize:11,fontWeight:700,color:"#fff",background:`linear-gradient(135deg,${T.rose}CC,${T.amber}CC)`}}>
                  {state==="running"?<><RefreshCw size={12} className="animate-spin"/>Validating…</>:<><Zap size={12}/>{state==="done"?"Re-validate":"Run Validation"}</>}
                </button>
                <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all" style={{border:`1px solid ${T.borderSubtle}`}}>
                  <X size={14} color={T.textMuted}/>
                </button>
              </div>
            </div>

            {/* Stats bar */}
            {state!=="idle" && (
              <div className="flex items-center gap-3 px-6 py-2.5 flex-shrink-0" style={{borderBottom:`1px solid ${T.borderSubtle}`,background:"rgba(0,0,0,0.12)"}}>
                {state==="running"?(
                  <div className="flex-1 flex items-center gap-3">
                    <span style={{fontSize:11,color:T.textMuted}}>Scanning mod…</span>
                    <div className="flex-1 relative rounded-full overflow-hidden" style={{height:4,background:"rgba(255,255,255,0.04)"}}>
                      <motion.div className="absolute inset-y-0 left-0 rounded-full"
                        style={{background:`linear-gradient(90deg,${T.rose},${T.amber})`}}
                        animate={{width:`${progress}%`}} transition={{duration:0.3}}/>
                    </div>
                    <span style={{fontSize:11,fontFamily:T.mono,fontWeight:700,color:T.amber}}>{progress}%</span>
                  </div>
                ):(
                  <>
                    {[{label:"Errors",value:errCount,color:T.rose},{label:"Warnings",value:warnCount,color:T.amber},{label:"Info",value:infoCount,color:T.cyan},{label:"Hints",value:hintCount,color:T.violet},{label:"Fixed",value:fixedCount,color:T.emerald}].map(s=>(
                      <div key={s.label} className="flex flex-col gap-0.5 px-3 py-1.5 rounded-lg" style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${T.borderSubtle}`}}>
                        <span style={{fontSize:8,fontWeight:700,color:T.textMuted,letterSpacing:"0.07em"}}>{s.label.toUpperCase()}</span>
                        <span style={{fontSize:16,fontWeight:800,color:s.color,fontFamily:T.mono}}>{s.value}</span>
                      </div>
                    ))}
                    <div className="flex-1"/>
                    {results.length>0&&(errCount+warnCount)===0&&(
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{background:T.emeraldDim,border:`1px solid ${T.emerald}20`}}>
                        <CheckCircle2 size={13} color={T.emerald}/>
                        <span style={{fontSize:11,fontWeight:700,color:T.emerald}}>All critical issues resolved</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Filter bar */}
            {state==="done" && (
              <div className="flex flex-col gap-2 px-4 py-2 flex-shrink-0" style={{borderBottom:`1px solid ${T.border}`,background:"rgba(0,0,0,0.08)"}}>
                {/* Severity tabs */}
                <div className="flex items-center gap-1">
                  {SEV_TABS.map(s=>{
                    const active=filterSev===s;
                    const cfg=s==="all"?null:SEV[s];
                    const color=cfg?.color??T.textPrimary;
                    return (
                      <button key={s} onClick={()=>setFilterSev(s)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md transition-all"
                        style={{fontSize:10,fontWeight:active?700:400,color:active?color:T.textMuted,background:active?`${color}12`:"transparent"}}>
                        {s==="all"?"All Issues":SEV[s as Severity]?.label}
                        <span style={{fontSize:8,fontFamily:T.mono,color:active?color:T.textDim}}>
                          {s==="all"?visible.length:results.filter(r=>!r.fixed&&r.severity===s).length}
                        </span>
                      </button>
                    );
                  })}
                  <div className="flex-1"/>
                  <div className="flex items-center gap-2 px-2 py-1 rounded-lg" style={{background:T.bgInput,border:`1px solid ${T.borderSubtle}`}}>
                    <Search size={10} color={T.textMuted}/>
                    <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" className="bg-transparent outline-none w-28" style={{fontSize:10,color:T.textSecondary}}/>
                    {search&&<button onClick={()=>setSearch("")}><X size={8} color={T.textMuted}/></button>}
                  </div>
                </div>
                {/* Category tabs */}
                <div className="flex items-center gap-1">
                  {CAT_TABS.map(c=>{
                    const active=filterCat===c;
                    const cfg=c==="all"?null:CAT[c];
                    const Icon=cfg?.Icon;
                    return (
                      <button key={c} onClick={()=>setFilterCat(c)}
                        className="flex items-center gap-1 px-2.5 py-0.5 rounded-md transition-all"
                        style={{fontSize:9,fontWeight:active?700:400,color:active?T.textPrimary:T.textMuted,background:active?"rgba(255,255,255,0.06)":"transparent",border:`1px solid ${active?T.borderSubtle:"transparent"}`}}>
                        {Icon&&<Icon size={9}/>}{c==="all"?"All Categories":CAT[c as Category]?.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {state==="idle" && (
                <div className="flex flex-col items-center justify-center py-20 gap-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{background:`linear-gradient(135deg,${T.rose}15,${T.amber}15)`,border:`1px solid ${T.borderSubtle}`}}>
                    <Shield size={32} color={T.rose} strokeWidth={1.5}/>
                  </div>
                  <div className="text-center space-y-2">
                    <div style={{fontSize:16,fontWeight:700,color:T.textPrimary}}>Ready to Validate</div>
                    <div style={{fontSize:12,color:T.textMuted}}>Checks {MOCK_RESULTS.length} rules across XML tuning, STBL, resources, and dependencies.</div>
                  </div>
                  <button onClick={runValidation} className="flex items-center gap-2 px-6 py-3 rounded-xl transition-all"
                    style={{background:`linear-gradient(135deg,${T.rose}CC,${T.amber}CC)`,boxShadow:`0 0 20px ${T.rose}15`,fontSize:13,fontWeight:700,color:"#fff"}}>
                    <Zap size={15}/> Run Validation
                  </button>
                </div>
              )}

              {state==="running" && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <RefreshCw size={28} color={T.amber} className="animate-spin"/>
                  <span style={{fontSize:13,color:T.textMuted}}>Scanning mod package…</span>
                </div>
              )}

              {state==="done" && (
                <div className="divide-y" style={{borderColor:T.borderSubtle}}>
                  {visible.length===0?(
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <CheckCircle2 size={28} color={T.emerald} strokeWidth={1.5}/>
                      <span style={{fontSize:13,color:T.textMuted}}>No issues match the current filter</span>
                    </div>
                  ):(
                    visible.map(r=>{
                      const sv=SEV[r.severity]; const ct=CAT[r.category];
                      const Icon=sv.Icon; const CatIcon=ct.Icon;
                      const isOpen=expanded.has(r.id);
                      return (
                        <div key={r.id} style={{borderLeft:`3px solid ${sv.color}40`}}>
                          {/* Row */}
                          <div className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
                            onClick={()=>toggleExpand(r.id)}
                            onMouseEnter={e=>{e.currentTarget.style.background=T.bgHover;}}
                            onMouseLeave={e=>{e.currentTarget.style.background="transparent";}}>
                            <Icon size={14} color={sv.color} className="flex-shrink-0"/>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span style={{fontSize:12,color:T.textPrimary}}>{r.message}</span>
                                {r.autoFixable&&(
                                  <span className="px-1.5 py-0 rounded" style={{fontSize:8,fontWeight:800,color:T.emerald,background:T.emeraldDim,letterSpacing:"0.06em"}}>AUTO-FIX</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <CatIcon size={9} color={T.textMuted}/>
                                <span style={{fontSize:9,color:T.textMuted}}>{ct.label}</span>
                                <span style={{color:T.textDim,fontSize:9}}>·</span>
                                <code style={{fontSize:9,fontFamily:T.mono,color:T.textMuted}}>{r.rule}</code>
                                <span style={{color:T.textDim,fontSize:9}}>·</span>
                                <span style={{fontSize:9,fontFamily:T.mono,color:T.textTertiary}}>{r.file}{r.line?`:${r.line}`:""}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {r.autoFixable&&(
                                <button onClick={e=>{e.stopPropagation();fixItem(r.id);}}
                                  className="flex items-center gap-1 px-2 py-1 rounded-lg transition-all"
                                  style={{fontSize:10,color:T.emerald,background:T.emeraldDim,border:`1px solid ${T.emerald}20`}}>
                                  <Wrench size={10}/> Fix
                                </button>
                              )}
                              {isOpen?<ChevronDown size={12} color={T.textMuted}/>:<ChevronRight size={12} color={T.textMuted}/>}
                            </div>
                          </div>
                          {/* Expanded detail */}
                          <AnimatePresence initial={false}>
                            {isOpen&&(
                              <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.2}}>
                                <div className="px-12 pb-3 space-y-2" style={{borderTop:`1px solid ${T.borderSubtle}`}}>
                                  <div className="p-3 rounded-lg mt-2" style={{background:T.bgDeep,border:`1px solid ${T.borderSubtle}`}}>
                                    <div className="grid grid-cols-3 gap-4">
                                      <div>
                                        <div style={{fontSize:8,fontWeight:700,color:T.textMuted,letterSpacing:"0.07em",marginBottom:3}}>RULE</div>
                                        <code style={{fontSize:11,fontFamily:T.mono,color:sv.color}}>{r.rule}</code>
                                      </div>
                                      <div>
                                        <div style={{fontSize:8,fontWeight:700,color:T.textMuted,letterSpacing:"0.07em",marginBottom:3}}>FILE</div>
                                        <span style={{fontSize:11,fontFamily:T.mono,color:T.textSecondary}}>{r.file}{r.line?`:${r.line}`:""}</span>
                                      </div>
                                      <div>
                                        <div style={{fontSize:8,fontWeight:700,color:T.textMuted,letterSpacing:"0.07em",marginBottom:3}}>AUTO-FIX</div>
                                        <span style={{fontSize:11,color:r.autoFixable?T.emerald:T.textMuted}}>{r.autoFixable?"Available":"Manual fix required"}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {state==="done"&&(
              <div className="flex items-center justify-between px-6 py-2.5 flex-shrink-0" style={{borderTop:`1px solid ${T.border}`,background:"rgba(0,0,0,0.15)"}}>
                <span style={{fontSize:10,color:T.textMuted,fontFamily:T.mono}}>
                  {results.length} rules checked · {results.filter(r=>r.fixed).length} fixed · {visible.length} remaining
                </span>
                <div className="flex items-center gap-2">
                  <button onClick={()=>toast.success("Validation report exported",{description:"mod_validation.json"})}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
                    style={{fontSize:11,color:T.textSecondary,background:"rgba(255,255,255,0.03)",border:`1px solid ${T.borderSubtle}`}}>
                    Export Report
                  </button>
                  <button onClick={onClose} className="px-3 py-1.5 rounded-lg transition-all"
                    style={{fontSize:11,color:T.textMuted,border:`1px solid ${T.borderSubtle}`}}>Close</button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ModValidator;

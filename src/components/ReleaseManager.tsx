"use client";

/* ─────────────────────────────────────────────────────────────
   JPE Studio — Release Manager (Phase 20)
   Semantic version bumping, auto-generated release notes from
   edit history, pre-release checklist, and publish workflow.
   ───────────────────────────────────────────────────────────── */
import { useState } from "react";
import {
  X, Rocket, Check, AlertTriangle, XCircle,
  RefreshCw, Copy, Download, Globe, Package,
  Plus, CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "./jpe-motion";
import { T } from "./robust/jpe-theme";
import { toast } from "sonner";

/* ── Types ── */
interface SemVer { major: number; minor: number; patch: number; }

interface CheckItem {
  id: string;
  label: string;
  status: "pass" | "fail" | "warn" | "pending";
  detail: string;
  autoCheck: boolean;
}

interface ReleaseNote {
  id: string;
  type: "feat" | "fix" | "refactor" | "docs" | "chore";
  message: string;
  included: boolean;
}

/* ── Mock checklist ── */
const INITIAL_CHECKS: CheckItem[] = [
  {id:"c01",label:"Validation clean",      status:"fail",    detail:"2 errors remain — run Mod Validator", autoCheck:true},
  {id:"c02",label:"Localization ≥80%",     status:"pass",    detail:"78% coverage (3 missing locales)", autoCheck:true},
  {id:"c03",label:"No hash collisions",    status:"pass",    detail:"All STBL hashes unique",            autoCheck:true},
  {id:"c04",label:"Dependencies resolved", status:"pass",    detail:"All 4 dependencies satisfied",      autoCheck:true},
  {id:"c05",label:"Build profile: Release",status:"pass",    detail:"Active profile is Release",         autoCheck:true},
  {id:"c06",label:"Changelog updated",     status:"warn",    detail:"No entries added since v1.3.0",     autoCheck:false},
  {id:"c07",label:"Screenshots updated",   status:"pending", detail:"Manually verify thumbnail assets",  autoCheck:false},
  {id:"c08",label:"README current",        status:"pending", detail:"Manually confirm description",      autoCheck:false},
];

/* ── Mock release notes (from edit history) ── */
const INITIAL_NOTES: ReleaseNote[] = [
  {id:"n01",type:"feat",     message:"Added Translation Memory with fuzzy matching and TMX export",      included:true},
  {id:"n02",type:"feat",     message:"Introduced Mod Validator with 15 rules and auto-fix support",      included:true},
  {id:"n03",type:"feat",     message:"String Table Manager: FNV-32a hash generator and duplicate finder",included:true},
  {id:"n04",type:"feat",     message:"Mod Template Wizard for scaffolding traits, careers, interactions",included:true},
  {id:"n05",type:"fix",      message:"Resolved hash collision in es-ES STBL for career_villain_name",    included:true},
  {id:"n06",type:"fix",      message:"Fixed missing translation for interaction_hug_stranger in fr-FR",  included:true},
  {id:"n07",type:"refactor", message:"Optimized STBL binary serialization — 12% smaller output",         included:true},
  {id:"n08",type:"chore",    message:"Updated target game version to 1.107.x",                           included:false},
  {id:"n09",type:"docs",     message:"Expanded tuning keyword reference with 18 new entries",            included:true},
];

const NOTE_TYPE_CFG: Record<ReleaseNote["type"],{color:string;label:string}> = {
  feat:     {color:T.emerald, label:"feat"},
  fix:      {color:T.rose,    label:"fix"},
  refactor: {color:T.cyan,    label:"refactor"},
  docs:     {color:T.violet,  label:"docs"},
  chore:    {color:T.textMuted,label:"chore"},
};

const CHECK_CFG: Record<CheckItem["status"],{color:string;Icon:typeof Check}> = {
  pass:    {color:T.emerald, Icon:CheckCircle2},
  fail:    {color:T.rose,    Icon:XCircle},
  warn:    {color:T.amber,   Icon:AlertTriangle},
  pending: {color:T.textMuted,Icon:RefreshCw},
};

function fmtVer(v: SemVer) { return `${v.major}.${v.minor}.${v.patch}`; }

export function ReleaseManager({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [currentVer] = useState<SemVer>({ major:1, minor:4, patch:0 });
  const [nextVer, setNextVer] = useState<SemVer>({ major:1, minor:5, patch:0 });
  const [checks, setChecks]   = useState<CheckItem[]>(INITIAL_CHECKS);
  const [notes, setNotes]     = useState<ReleaseNote[]>(INITIAL_NOTES);
  const [tagName, setTagName] = useState("v1.5.0");
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished]   = useState(false);
  const [preRelease, setPreRelease] = useState(false);

  const bumpMajor = () => { setNextVer({major:currentVer.major+1,minor:0,patch:0}); setTagName(`v${currentVer.major+1}.0.0`); };
  const bumpMinor = () => { setNextVer({major:currentVer.major,minor:currentVer.minor+1,patch:0}); setTagName(`v${currentVer.major}.${currentVer.minor+1}.0`); };
  const bumpPatch = () => { setNextVer({major:currentVer.major,minor:currentVer.minor,patch:currentVer.patch+1}); setTagName(`v${currentVer.major}.${currentVer.minor}.${currentVer.patch+1}`); };

  const passCount   = checks.filter(c=>c.status==="pass").length;
  const failCount   = checks.filter(c=>c.status==="fail").length;
  const canPublish  = failCount === 0;
  const includedNotes = notes.filter(n=>n.included);

  const markoverride = (id: string) => setChecks(prev=>prev.map(c=>c.id===id?{...c,status:"pass" as const}:c));

  const publish = async (dest: string) => {
    setPublishing(true);
    await new Promise(r=>setTimeout(r,1800+Math.random()*600));
    setPublishing(false);
    setPublished(true);
    toast.success(`Published ${tagName} to ${dest}!`, { description:`Evil_Trait_Override_${tagName}.package` });
  };

  const copyNotes = () => {
    const md = includedNotes.map(n=>`- **${NOTE_TYPE_CFG[n.type].label}**: ${n.message}`).join("\n");
    navigator.clipboard.writeText(`## ${tagName}\n\n${md}`).then(()=>toast.success("Release notes copied as Markdown"));
  };

  if (!isOpen) return null;

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
            style={{width:"min(1020px,97vw)",height:"min(720px,92vh)",background:T.bgElevated,border:`1px solid ${T.border}`,boxShadow:`${T.shadow2Xl},inset 0 1px 0 rgba(255,255,255,0.04)`}}>

            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{background:`linear-gradient(90deg,transparent 5%,${T.violet}80,${T.rose}80,transparent 95%)`}}/>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 flex-shrink-0" style={{borderBottom:`1px solid ${T.border}`}}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:`linear-gradient(135deg,${T.violet}20,${T.rose}20)`,border:`1px solid ${T.borderSubtle}`}}>
                  <Rocket size={16} color={T.violet}/>
                </div>
                <div>
                  <div style={{fontSize:15,fontWeight:700,color:T.textPrimary,fontFamily:T.display}}>Release Manager</div>
                  <div style={{fontSize:10,color:T.textMuted,fontFamily:T.mono}}>Evil_Trait_Override · current: v{fmtVer(currentVer)}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!canPublish&&<div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{background:T.roseDim,border:`1px solid ${T.rose}20`}}>
                  <XCircle size={11} color={T.rose}/><span style={{fontSize:10,color:T.rose}}>Resolve {failCount} blocker{failCount!==1?"s":""} first</span>
                </div>}
                <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all" style={{border:`1px solid ${T.borderSubtle}`}}>
                  <X size={14} color={T.textMuted}/>
                </button>
              </div>
            </div>

            <div className="flex flex-1 min-h-0 overflow-hidden">
              {/* Left: version + checklist */}
              <div className="flex flex-col overflow-y-auto p-5 space-y-5 flex-shrink-0" style={{width:340,borderRight:`1px solid ${T.border}`}}>

                {/* Version bump */}
                <div className="rounded-xl p-4 space-y-3" style={{background:T.bgSurface,border:`1px solid ${T.border}`}}>
                  <div style={{fontSize:9,fontWeight:700,color:T.textMuted,letterSpacing:"0.07em"}}>NEXT VERSION</div>
                  <div className="flex items-center gap-3">
                    <span style={{fontSize:28,fontWeight:900,fontFamily:T.mono,color:T.violet}}>{fmtVer(nextVer)}</span>
                    <div className="space-y-1">
                      {[{l:"Major",fn:bumpMajor},{l:"Minor",fn:bumpMinor},{l:"Patch",fn:bumpPatch}].map(b=>(
                        <button key={b.l} onClick={b.fn} className="flex items-center gap-1.5 px-2 py-0.5 rounded-md w-full transition-all"
                          style={{fontSize:9,color:T.textMuted,background:"rgba(255,255,255,0.03)",border:`1px solid ${T.borderSubtle}`}}
                          onMouseEnter={e=>{e.currentTarget.style.background=T.bgHover;}}
                          onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.03)";}}>
                          <Plus size={8}/> {b.l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{fontSize:9,fontWeight:700,color:T.textMuted,display:"block",marginBottom:3}}>TAG NAME</label>
                    <input value={tagName} onChange={e=>setTagName(e.target.value)} className="w-full px-2 py-1.5 rounded-lg outline-none"
                      style={{fontSize:12,fontFamily:T.mono,color:T.textPrimary,background:T.bgInput,border:`1px solid ${T.borderSubtle}`}}/>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={()=>setPreRelease(p=>!p)}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg transition-all"
                      style={{background:preRelease?T.amberDim:"rgba(255,255,255,0.02)",border:`1px solid ${preRelease?`${T.amber}30`:T.borderSubtle}`}}>
                      <div className="w-3.5 h-3.5 rounded flex items-center justify-center" style={{background:preRelease?T.amber:"transparent",border:`1px solid ${preRelease?T.amber:T.borderSubtle}`}}>
                        {preRelease&&<Check size={9} color="#fff"/>}
                      </div>
                      <span style={{fontSize:10,color:preRelease?T.amber:T.textMuted}}>Mark as pre-release</span>
                    </button>
                  </div>
                </div>

                {/* Pre-release checklist */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div style={{fontSize:9,fontWeight:700,color:T.textMuted,letterSpacing:"0.07em"}}>PRE-RELEASE CHECKLIST</div>
                    <span style={{fontSize:9,fontFamily:T.mono,color:passCount===checks.length?T.emerald:T.textDim}}>{passCount}/{checks.length} pass</span>
                  </div>
                  {checks.map(c=>{
                    const cfg=CHECK_CFG[c.status]; const Icon=cfg.Icon;
                    return (
                      <div key={c.id} className="flex items-start gap-2 px-3 py-2 rounded-xl"
                        style={{background:`${cfg.color}06`,border:`1px solid ${cfg.color}20`}}>
                        <Icon size={12} color={cfg.color} className="flex-shrink-0 mt-0.5"/>
                        <div className="flex-1 min-w-0">
                          <div style={{fontSize:11,color:T.textSecondary}}>{c.label}</div>
                          <div style={{fontSize:9,color:T.textDim,lineHeight:1.4}}>{c.detail}</div>
                        </div>
                        {(c.status==="warn"||c.status==="pending")&&(
                          <button onClick={()=>markoverride(c.id)} className="flex-shrink-0 px-1.5 py-0.5 rounded text-xs transition-all hover:bg-white/5"
                            style={{fontSize:8,color:T.textDim,border:`1px solid ${T.borderSubtle}`}}>OK</button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right: release notes + publish */}
              <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                {/* Release notes */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div style={{fontSize:9,fontWeight:700,color:T.textMuted,letterSpacing:"0.07em"}}>RELEASE NOTES — {tagName}</div>
                    <button onClick={copyNotes} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-white/5 transition-all"
                      style={{fontSize:10,color:T.textMuted,border:`1px solid ${T.borderSubtle}`}}>
                      <Copy size={9}/> Copy Markdown
                    </button>
                  </div>
                  <div className="space-y-1">
                    {notes.map(n=>{
                      const c=NOTE_TYPE_CFG[n.type];
                      return (
                        <div key={n.id} className="flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all"
                          style={{background:n.included?"rgba(255,255,255,0.02)":"transparent",opacity:n.included?1:0.4}}>
                          <button onClick={()=>setNotes(prev=>prev.map(x=>x.id===n.id?{...x,included:!x.included}:x))}
                            className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all"
                            style={{background:n.included?T.emerald:"transparent",border:`1px solid ${n.included?T.emerald:T.borderSubtle}`}}>
                            {n.included&&<Check size={9} color="#fff"/>}
                          </button>
                          <span className="px-1.5 py-0.5 rounded flex-shrink-0" style={{fontSize:8,fontWeight:800,fontFamily:T.mono,color:c.color,background:`${c.color}15`}}>{c.label}</span>
                          <span className="flex-1" style={{fontSize:12,color:n.included?T.textSecondary:T.textDim}}>{n.message}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="p-4 rounded-xl" style={{background:T.bgDeep,border:`1px solid ${T.borderSubtle}`}}>
                    <div style={{fontSize:9,fontWeight:700,color:T.textMuted,marginBottom:8}}>MARKDOWN PREVIEW</div>
                    <pre style={{fontSize:10,fontFamily:T.mono,color:T.textTertiary,lineHeight:1.7,whiteSpace:"pre-wrap"}}>
{`## ${tagName}\n\n${includedNotes.map(n=>`- **${NOTE_TYPE_CFG[n.type].label}**: ${n.message}`).join("\n")}`}
                    </pre>
                  </div>
                </div>

                {/* Publish row */}
                <div className="flex-shrink-0 p-5 space-y-3" style={{borderTop:`1px solid ${T.border}`,background:"rgba(0,0,0,0.12)"}}>
                  <div style={{fontSize:9,fontWeight:700,color:T.textMuted,letterSpacing:"0.07em"}}>PUBLISH TO</div>
                  {published ? (
                    <motion.div initial={{opacity:0,y:4}} animate={{opacity:1,y:0}}
                      className="flex items-center gap-3 p-4 rounded-xl" style={{background:T.emeraldDim,border:`1px solid ${T.emerald}20`}}>
                      <CheckCircle2 size={20} color={T.emerald}/>
                      <div>
                        <div style={{fontSize:13,fontWeight:700,color:T.emerald}}>{tagName} published!</div>
                        <div style={{fontSize:10,color:T.emerald}}>Package ready for distribution</div>
                      </div>
                    </motion.div>
                  ):(
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        {label:"ModTheSims",    icon:Globe,    color:T.cyan,   dest:"ModTheSims"},
                        {label:"Curseforge",    icon:Package,  color:T.amber,  dest:"Curseforge"},
                        {label:"Local Export",  icon:Download, color:T.emerald,dest:"local drive"},
                      ].map(opt=>{
                        const Icon=opt.icon;
                        return (
                          <button key={opt.label} onClick={()=>publish(opt.dest)}
                            disabled={!canPublish||publishing}
                            className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all disabled:opacity-40"
                            style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${T.borderSubtle}`}}
                            onMouseEnter={e=>{if(canPublish&&!publishing)e.currentTarget.style.background=T.bgHover;}}
                            onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.02)";}}>
                            {publishing?<RefreshCw size={18} color={opt.color} className="animate-spin"/>:<Icon size={18} color={opt.color}/>}
                            <span style={{fontSize:10,fontWeight:700,color:T.textSecondary}}>{opt.label}</span>
                          </button>
                        );
                      })}
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

export default ReleaseManager;

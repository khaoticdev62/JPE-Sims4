"use client";

/* ─────────────────────────────────────────────────────────────
   JPE Studio — Mod Template Wizard (Phase 16)
   4-step wizard: choose template → configure → preview file
   tree → scaffold the new mod package.
   ───────────────────────────────────────────────────────────── */
import { useState } from "react";
import {
  X, Wand2, ChevronRight, ChevronLeft, Check, Folder,
  File, FolderOpen, Star, Zap, Users, Briefcase,
  Smile, BookOpen, Target, MapPin, Box, Globe,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "./jpe-motion";
import { T } from "./robust/jpe-theme";
import { toast } from "sonner";

/* ── Types ── */
type TemplateId = "trait" | "career" | "interaction" | "buff" | "aspiration" | "skill" | "lot-trait" | "object";
type Step = 1 | 2 | 3 | 4;

interface TemplateConfig {
  id: TemplateId;
  label: string;
  desc: string;
  icon: typeof Star;
  color: string;
  files: string[];
  complexity: "Simple" | "Moderate" | "Complex";
}

interface WizardForm {
  modName: string;
  packageId: string;
  author: string;
  version: string;
  description: string;
  locales: string[];
}

const TEMPLATES: TemplateConfig[] = [
  { id:"trait",       label:"CAS Trait",      desc:"A personality trait with buffs, interactions, and loot",    icon:Star,       color:T.violet,  complexity:"Moderate", files:["trait_{{name}}.xml","buff_{{name}}_default.xml","interaction_{{name}}_mean.xml","strings/en-US.stbl","thumbnail.png","mod_manifest.json"] },
  { id:"career",      label:"Career",         desc:"Full career with branches, levels, and daily tasks",        icon:Briefcase,  color:T.cyan,    complexity:"Complex",  files:["career_{{name}}.xml","career_{{name}}_branch_a.xml","career_{{name}}_branch_b.xml","career_levels/level_01.xml","strings/en-US.stbl","mod_manifest.json"] },
  { id:"interaction", label:"Interaction",    desc:"Social or object interaction with outcome loot",            icon:Users,      color:T.emerald, complexity:"Simple",   files:["interaction_{{name}}.xml","loot_{{name}}_success.xml","strings/en-US.stbl","mod_manifest.json"] },
  { id:"buff",        label:"Buff / Moodlet", desc:"Emotional moodlet with duration, icon, and effects",        icon:Smile,      color:T.amber,   complexity:"Simple",   files:["buff_{{name}}.xml","commodity_{{name}}_decay.xml","strings/en-US.stbl","thumbnail.png","mod_manifest.json"] },
  { id:"aspiration",  label:"Aspiration",     desc:"Aspiration goal with 4 milestones and reward trait",        icon:Target,     color:T.rose,    complexity:"Complex",  files:["aspiration_{{name}}.xml","aspiration_track_{{name}}.xml","objective_{{name}}_01.xml","objective_{{name}}_02.xml","reward_trait_{{name}}.xml","strings/en-US.stbl","mod_manifest.json"] },
  { id:"skill",       label:"Skill",          desc:"Learnable skill with 10 levels and milestone events",       icon:BookOpen,   color:T.cyanBright, complexity:"Complex", files:["skill_{{name}}.xml","skill_{{name}}_milestone_5.xml","skill_{{name}}_milestone_10.xml","statistic_skill_{{name}}.xml","strings/en-US.stbl","mod_manifest.json"] },
  { id:"lot-trait",   label:"Lot Trait",      desc:"Residential or venue lot trait with periodic effects",      icon:MapPin,     color:T.violet,  complexity:"Moderate", files:["lot_trait_{{name}}.xml","situation_{{name}}_haunt.xml","strings/en-US.stbl","mod_manifest.json"] },
  { id:"object",      label:"Custom Object",  desc:"Object definition with interactions and catalog data",      icon:Box,        color:T.textSecondary, complexity:"Moderate", files:["object_{{name}}.xml","catalog_{{name}}.xml","interaction_{{name}}_use.xml","strings/en-US.stbl","model.blend","mod_manifest.json"] },
];

const LOCALES = ["en-US","es-ES","fr-FR","de-DE","pt-BR","zh-CN","ko-KR","ja-JP","ru-RU","pl-PL"];
const COMPLEXITY_COLOR: Record<string,string> = { Simple:T.emerald, Moderate:T.amber, Complex:T.rose };

const TIPS: Record<TemplateId, string> = {
  trait:       "CAS traits can hook into the traits_and_loot system to grant buffs on mood changes.",
  career:      "Career branches share a base XML — define the fork at level 5 in a separate branch file.",
  interaction: "Use outcome_loot to reward or punish Sims without writing Python; all effects are tuning-only.",
  buff:        "Set commodity_decay on the buff's statistic to control how long the moodlet persists.",
  aspiration:  "Milestone objectives can chain — complete #1 unlocks #2 — using objective_completion_loot.",
  skill:       "Bind skill milestones to commodity_skill_lock to unlock new interactions at threshold levels.",
  "lot-trait": "Lot traits can inject situations; use situation_creation_speed for haunting frequency.",
  object:      "Object catalog XML controls catalog price, room value, and build-mode thumbnail display.",
};

function slugify(s: string) { return s.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,""); }

/* ── Step indicator ── */
function Steps({ step }: { step: Step }) {
  const labels = ["Template","Configure","Preview","Done"];
  return (
    <div className="flex items-center gap-0">
      {labels.map((l,i)=>{
        const n=i+1 as Step; const done=step>n; const active=step===n;
        return (
          <div key={l} className="flex items-center">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                style={{background:done?T.emerald:active?T.cyan:"rgba(255,255,255,0.05)",border:`1px solid ${done?T.emerald:active?T.cyan:T.borderSubtle}`}}>
                {done?<Check size={11} color="#fff"/>:<span style={{fontSize:9,fontWeight:700,color:active?"#fff":T.textDim}}>{n}</span>}
              </div>
              <span style={{fontSize:10,fontWeight:active||done?700:400,color:active?T.textPrimary:done?T.emerald:T.textMuted}}>{l}</span>
            </div>
            {i<3&&<div className="w-8 h-px mx-2" style={{background:step>n?T.emerald:T.borderSubtle}}/>}
          </div>
        );
      })}
    </div>
  );
}

/* ── Main ── */
export function ModTemplateWizard({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [step, setStep]         = useState<Step>(1);
  const [template, setTemplate] = useState<TemplateId | null>(null);
  const [form, setForm]         = useState<WizardForm>({ modName:"MyEvilTrait", packageId:"com.author.myeviltrait", author:"ModAuthor", version:"1.0.0", description:"", locales:["en-US","es-ES"] });
  const [creating, setCreating] = useState(false);

  const tpl = TEMPLATES.find(t=>t.id===template);

  const next = () => {
    if (step===1 && !template) { toast.error("Select a template to continue"); return; }
    if (step===2) {
      if (!form.modName.trim()) { toast.error("Mod name is required"); return; }
      if (!form.author.trim()) { toast.error("Author name is required"); return; }
    }
    if (step < 4) setStep(s=>(s+1) as Step);
  };
  const back = () => { if (step > 1) setStep(s=>(s-1) as Step); };

  const create = async () => {
    setCreating(true);
    await new Promise(r=>setTimeout(r,1200));
    setCreating(false);
    setStep(4);
  };

  const reset = () => { setStep(1); setTemplate(null); setForm({modName:"MyEvilTrait",packageId:"com.author.myeviltrait",author:"ModAuthor",version:"1.0.0",description:"",locales:["en-US","es-ES"]}); };

  const resolvedFiles = tpl?.files.map(f=>f.replace(/\{\{name\}\}/g, slugify(form.modName))) ?? [];

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
            style={{width:"min(980px,97vw)",height:"min(700px,90vh)",background:T.bgElevated,border:`1px solid ${T.border}`,boxShadow:`${T.shadow2Xl},inset 0 1px 0 rgba(255,255,255,0.04)`}}>

            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{background:`linear-gradient(90deg,transparent 5%,${T.violet}80,${T.amber}80,transparent 95%)`}}/>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 flex-shrink-0" style={{borderBottom:`1px solid ${T.border}`}}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:`linear-gradient(135deg,${T.violet}20,${T.amber}20)`,border:`1px solid ${T.borderSubtle}`}}>
                  <Wand2 size={16} color={T.violet}/>
                </div>
                <div>
                  <div style={{fontSize:15,fontWeight:700,color:T.textPrimary,fontFamily:T.display}}>Mod Template Wizard</div>
                  <div style={{fontSize:10,color:T.textMuted,fontFamily:T.mono}}>Scaffold a new Sims 4 mod from a starter template</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Steps step={step}/>
                <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all" style={{border:`1px solid ${T.borderSubtle}`}}>
                  <X size={14} color={T.textMuted}/>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 min-h-0 overflow-y-auto p-6">
              <AnimatePresence mode="wait">

                {/* Step 1: Choose template */}
                {step===1 && (
                  <motion.div key="s1" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:0.2}}>
                    <div className="mb-4">
                      <div style={{fontSize:16,fontWeight:700,color:T.textPrimary}}>Choose a template</div>
                      <div style={{fontSize:12,color:T.textMuted}}>Select the type of mod you want to build.</div>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {TEMPLATES.map(t=>{
                        const Icon=t.icon; const sel=template===t.id;
                        return (
                          <button key={t.id} onClick={()=>setTemplate(t.id)}
                            className="flex flex-col gap-2 p-4 rounded-xl text-left transition-all"
                            style={{background:sel?`${t.color}10`:"rgba(255,255,255,0.02)",border:`2px solid ${sel?t.color:T.borderSubtle}`}}
                            onMouseEnter={e=>{if(!sel)e.currentTarget.style.background=T.bgHover;}}
                            onMouseLeave={e=>{e.currentTarget.style.background=sel?`${t.color}10`:"rgba(255,255,255,0.02)";}}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:`${t.color}15`}}>
                              <Icon size={16} color={sel?t.color:T.textMuted}/>
                            </div>
                            <div>
                              <div style={{fontSize:12,fontWeight:700,color:sel?T.textPrimary:T.textSecondary}}>{t.label}</div>
                              <div style={{fontSize:10,color:T.textMuted,lineHeight:1.4,marginTop:2}}>{t.desc}</div>
                            </div>
                            <div className="flex items-center gap-1 mt-auto">
                              <span className="px-1.5 py-0.5 rounded" style={{fontSize:8,fontWeight:700,color:COMPLEXITY_COLOR[t.complexity],background:`${COMPLEXITY_COLOR[t.complexity]}12`}}>{t.complexity}</span>
                              <span style={{fontSize:8,color:T.textDim,fontFamily:T.mono}}>{t.files.length} files</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {template && tpl && (
                      <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} className="mt-4 p-3 rounded-xl flex items-start gap-2"
                        style={{background:`${tpl.color}08`,border:`1px solid ${tpl.color}20`}}>
                        <Zap size={12} color={tpl.color} className="flex-shrink-0 mt-0.5"/>
                        <span style={{fontSize:11,color:T.textSecondary,lineHeight:1.5}}>{TIPS[template]}</span>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* Step 2: Configure */}
                {step===2 && tpl && (
                  <motion.div key="s2" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:0.2}}
                    className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div style={{fontSize:16,fontWeight:700,color:T.textPrimary}}>Configure your mod</div>
                      {[
                        {label:"MOD NAME",key:"modName",ph:"e.g. EvilTrait"},
                        {label:"PACKAGE ID",key:"packageId",ph:"e.g. com.author.eviltrait"},
                        {label:"AUTHOR",key:"author",ph:"Your name or handle"},
                        {label:"VERSION",key:"version",ph:"1.0.0"},
                      ].map(f=>(
                        <div key={f.key}>
                          <label style={{fontSize:9,fontWeight:700,color:T.textMuted,letterSpacing:"0.06em",display:"block",marginBottom:4}}>{f.label}</label>
                          <input value={(form as any)[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}
                            placeholder={f.ph} className="w-full px-3 py-2 rounded-lg outline-none"
                            style={{fontSize:12,fontFamily:T.mono,color:T.textPrimary,background:T.bgInput,border:`1px solid ${T.borderSubtle}`}}/>
                        </div>
                      ))}
                      <div>
                        <label style={{fontSize:9,fontWeight:700,color:T.textMuted,letterSpacing:"0.06em",display:"block",marginBottom:4}}>DESCRIPTION</label>
                        <textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} rows={3} placeholder="What does this mod do?" className="w-full px-3 py-2 rounded-lg outline-none resize-none"
                          style={{fontSize:12,color:T.textPrimary,background:T.bgInput,border:`1px solid ${T.borderSubtle}`}}/>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div style={{fontSize:13,fontWeight:700,color:T.textPrimary}}>Target Locales</div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {LOCALES.map(l=>{
                          const on=form.locales.includes(l);
                          return (
                            <button key={l} onClick={()=>setForm(p=>({...p,locales:on?p.locales.filter(x=>x!==l):[...p.locales,l]}))}
                              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all"
                              style={{background:on?T.cyanDim:"rgba(255,255,255,0.02)",border:`1px solid ${on?T.borderActive:T.borderSubtle}`}}>
                              <Globe size={10} color={on?T.cyan:T.textMuted}/>
                              <span style={{fontSize:11,fontFamily:T.mono,fontWeight:on?700:400,color:on?T.textPrimary:T.textMuted}}>{l}</span>
                              {on&&<Check size={9} color={T.cyan} className="ml-auto"/>}
                            </button>
                          );
                        })}
                      </div>
                      <div className="p-3 rounded-xl" style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${T.borderSubtle}`}}>
                        <div style={{fontSize:10,fontWeight:700,color:T.textMuted,marginBottom:6}}>Template</div>
                        <div className="flex items-center gap-2">
                          <tpl.icon size={13} color={tpl.color}/>
                          <span style={{fontSize:12,fontWeight:700,color:tpl.color}}>{tpl.label}</span>
                          <span className="ml-auto px-1.5 py-0.5 rounded" style={{fontSize:8,fontWeight:700,color:COMPLEXITY_COLOR[tpl.complexity],background:`${COMPLEXITY_COLOR[tpl.complexity]}12`}}>{tpl.complexity}</span>
                        </div>
                        <div style={{fontSize:10,color:T.textMuted,marginTop:4}}>{tpl.files.length} files · {form.locales.length} locales</div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Preview */}
                {step===3 && tpl && (
                  <motion.div key="s3" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:0.2}}>
                    <div className="mb-4">
                      <div style={{fontSize:16,fontWeight:700,color:T.textPrimary}}>Preview generated files</div>
                      <div style={{fontSize:12,color:T.textMuted}}>The following structure will be created in your workspace.</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {/* File tree */}
                      <div className="rounded-xl overflow-hidden" style={{border:`1px solid ${T.border}`}}>
                        <div className="flex items-center gap-2 px-4 py-2" style={{background:T.bgSurface,borderBottom:`1px solid ${T.border}`}}>
                          <FolderOpen size={12} color={T.amber}/>
                          <span style={{fontSize:10,fontWeight:700,color:T.textMuted,fontFamily:T.mono}}>{slugify(form.modName)}/</span>
                        </div>
                        <div className="p-2 space-y-0.5">
                          {resolvedFiles.map((file,i)=>{
                            const parts=file.split("/"); const isNested=parts.length>1;
                            return (
                              <motion.div key={file} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.04}}
                                className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
                                style={{paddingLeft:isNested?24:8,background:"rgba(255,255,255,0.02)"}}>
                                {isNested?<Folder size={11} color={T.amber}/>:<File size={11} color={T.cyan}/>}
                                <span style={{fontSize:11,fontFamily:T.mono,color:isNested?T.amber:T.textSecondary}}>{parts[parts.length-1]}</span>
                                {file.endsWith(".stbl")&&<span className="ml-auto px-1 py-0 rounded" style={{fontSize:8,color:T.violet,background:`${T.violet}12`}}>STBL</span>}
                                {file.endsWith(".xml")&&<span className="ml-auto px-1 py-0 rounded" style={{fontSize:8,color:T.cyan,background:`${T.cyan}12`}}>XML</span>}
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                      {/* Summary */}
                      <div className="space-y-3">
                        {[{l:"Mod Name",v:form.modName},{l:"Package ID",v:form.packageId},{l:"Author",v:form.author},{l:"Version",v:form.version},{l:"Template",v:tpl.label},{l:"Locales",v:form.locales.join(", ")},{l:"Files",v:`${resolvedFiles.length} files`}].map(r=>(
                          <div key={r.l} className="flex items-start gap-2">
                            <span style={{fontSize:10,fontWeight:700,color:T.textMuted,minWidth:80}}>{r.l}</span>
                            <span style={{fontSize:11,fontFamily:T.mono,color:T.textSecondary,wordBreak:"break-all"}}>{r.v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Done */}
                {step===4 && (
                  <motion.div key="s4" initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} transition={{duration:0.3}}
                    className="flex flex-col items-center justify-center min-h-[360px] gap-6">
                    <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:"spring",delay:0.1,stiffness:200}}
                      className="w-20 h-20 rounded-2xl flex items-center justify-center"
                      style={{background:`linear-gradient(135deg,${T.emerald}20,${T.cyan}20)`,border:`1px solid ${T.emerald}30`}}>
                      <Check size={36} color={T.emerald}/>
                    </motion.div>
                    <div className="text-center space-y-1">
                      <div style={{fontSize:20,fontWeight:800,color:T.textPrimary,fontFamily:T.display}}>{form.modName}</div>
                      <div style={{fontSize:13,color:T.textMuted}}>Mod scaffolded successfully · {resolvedFiles.length} files created</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={()=>{ toast.success(`Opening ${form.modName} in editor`); onClose(); }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all"
                        style={{fontSize:12,fontWeight:700,color:"#fff",background:`linear-gradient(135deg,${T.cyan}CC,${T.emerald}CC)`}}>
                        Open in Editor
                      </button>
                      <button onClick={reset} className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all"
                        style={{fontSize:12,color:T.textMuted,background:"rgba(255,255,255,0.04)",border:`1px solid ${T.borderSubtle}`}}>
                        <RefreshCw size={12}/> Create Another
                      </button>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Footer nav */}
            {step < 4 && (
              <div className="flex items-center justify-between px-6 py-3 flex-shrink-0" style={{borderTop:`1px solid ${T.border}`,background:"rgba(0,0,0,0.12)"}}>
                <button onClick={back} disabled={step===1}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all disabled:opacity-30"
                  style={{fontSize:12,color:T.textMuted,background:"rgba(255,255,255,0.03)",border:`1px solid ${T.borderSubtle}`}}>
                  <ChevronLeft size={13}/> Back
                </button>
                <span style={{fontSize:10,fontFamily:T.mono,color:T.textDim}}>Step {step} of 3</span>
                {step===3?(
                  <button onClick={create} disabled={creating}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-lg transition-all disabled:opacity-60"
                    style={{fontSize:12,fontWeight:700,color:"#fff",background:`linear-gradient(135deg,${T.violet}CC,${T.amber}CC)`}}>
                    {creating?<><RefreshCw size={12} className="animate-spin"/>Creating…</> :<><Wand2 size={12}/>Create Mod</>}
                  </button>
                ):(
                  <button onClick={next}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-lg transition-all"
                    style={{fontSize:12,fontWeight:700,color:"#fff",background:`linear-gradient(135deg,${T.cyan}CC,${T.violet}CC)`}}>
                    Next <ChevronRight size={13}/>
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ModTemplateWizard;

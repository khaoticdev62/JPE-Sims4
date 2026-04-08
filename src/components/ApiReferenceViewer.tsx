"use client";

/* ─────────────────────────────────────────────────────────────
   JPE Studio — API Reference Viewer (Phase 22)
   Searchable EA Sims 4 SDK class browser with inheritance tree,
   field table, method listings, and "find in project" links.
   ───────────────────────────────────────────────────────────── */
import { useState, useMemo } from "react";
import {
  X, Search, Braces, ChevronRight, ChevronDown,
  ExternalLink, FileCode, Copy, Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "./jpe-motion";
import { T } from "./robust/jpe-theme";
import { toast } from "sonner";

/* ── Types ── */
type FieldType = "Tunable" | "TunableList" | "TunableReference" | "TunableVariant" | "enum";

interface ApiField {
  name: string;
  type: FieldType;
  tuningType?: string;
  desc: string;
  optional: boolean;
  defaultVal?: string;
}

interface ApiClass {
  id: string;
  name: string;
  module: string;
  inherits?: string;
  desc: string;
  fields: ApiField[];
  usedInProject?: string[];
  since?: string;
}

/* ── Mock class catalog ── */
const CLASSES: ApiClass[] = [
  {
    id:"TunableSimData",name:"TunableSimData",module:"sims4.tuning.instances",
    desc:"Base class for all .xml tuning files. Every tuning object is an instance of this class identified by a unique hash.",
    fields:[
      {name:"n",         type:"Tunable",   tuningType:"str",        desc:"Human-readable name of the tuning object",       optional:false},
      {name:"s",         type:"Tunable",   tuningType:"int",        desc:"FNV-32a hash of the name attribute",             optional:false},
      {name:"c",         type:"Tunable",   tuningType:"class_ref",  desc:"Python class that consumes this tuning",         optional:true},
      {name:"i",         type:"Tunable",   tuningType:"instance_type",desc:"Instance type key",                           optional:true},
    ],
    usedInProject:["trait_Evil.xml","buff_EvilGlee.xml","skill_Mischief.xml"],since:"Base game"
  },
  {
    id:"Trait",name:"Trait",module:"traits.traits",inherits:"TunableSimData",
    desc:"Defines a CAS personality trait with associated buffs, interactions, whims, and social modifiers.",
    fields:[
      {name:"trait_type",          type:"TunableVariant", tuningType:"TraitType",        desc:"Category of the trait (Personality, Reward, Death, etc.)", optional:false,defaultVal:"PERSONALITY"},
      {name:"buffs_list",          type:"TunableList",    tuningType:"BuffReference",    desc:"List of buffs applied to Sims with this trait",             optional:true},
      {name:"interactions_list",   type:"TunableList",    tuningType:"InteractionRef",   desc:"Interactions unlocked when Sim has this trait",             optional:true},
      {name:"whim_set",            type:"TunableReference",tuningType:"WhimSet",         desc:"Whim set associated with trait",                            optional:true},
      {name:"conflict_weight",     type:"Tunable",        tuningType:"int",             desc:"Weight used in trait conflict resolution (0–100)",          optional:true,defaultVal:"0"},
      {name:"loot_on_trait_add",   type:"TunableList",    tuningType:"LootActions",     desc:"Loot to apply when trait is added",                         optional:true},
      {name:"loot_on_trait_remove",type:"TunableList",    tuningType:"LootActions",     desc:"Loot to apply when trait is removed",                       optional:true},
      {name:"headline_icon",       type:"TunableReference",tuningType:"ResourceKey",    desc:"Resource key for CAS trait thumbnail",                      optional:true},
    ],
    usedInProject:["trait_Evil.xml"],since:"Base game"
  },
  {
    id:"Buff",name:"Buff",module:"buffs.buff",inherits:"TunableSimData",
    desc:"Represents a buff (moodlet) that modifies a Sim's emotional state for a duration.",
    fields:[
      {name:"mood_type",      type:"TunableVariant",tuningType:"MoodType",     desc:"The emotional state this buff contributes to",          optional:false},
      {name:"mood_weight",    type:"Tunable",        tuningType:"int",         desc:"Strength of the mood contribution (1–6)",               optional:false,defaultVal:"1"},
      {name:"buff_effects",   type:"TunableList",    tuningType:"BuffEffect",  desc:"Visual/audio effects while buff is active",             optional:true},
      {name:"commodity_decay",type:"Tunable",        tuningType:"float",       desc:"Rate of buff commodity decay per game-hour",            optional:true,defaultVal:"1.0"},
      {name:"buff_reason",    type:"Tunable",        tuningType:"str",         desc:"Localized reason string shown in tooltip",              optional:true},
      {name:"timeout_string", type:"TunableReference",tuningType:"STBLKey",   desc:"String shown when buff expires",                        optional:true},
    ],
    usedInProject:["buff_EvilGlee.xml","buff_MeanSpirit.xml"],since:"Base game"
  },
  {
    id:"SuperInteraction",name:"SuperInteraction",module:"interactions.base.super_interaction",inherits:"TunableSimData",
    desc:"Base class for all social and object interactions. Defines targeting, category, outcome, and autonomy.",
    fields:[
      {name:"category",             type:"TunableVariant",tuningType:"InteractionCategoryTag",desc:"Pie menu category for this interaction",              optional:false},
      {name:"basic_content",        type:"TunableVariant",tuningType:"InteractionContent",  desc:"Animation/content defining Sim behavior",              optional:true},
      {name:"outcome",              type:"TunableVariant",tuningType:"InteractionOutcome",  desc:"Success/failure loot and scoring",                     optional:true},
      {name:"autonomy",             type:"Tunable",        tuningType:"AutonomyPreference", desc:"Likelihood of Sims autonomously choosing this",        optional:true},
      {name:"skill_lock",           type:"TunableReference",tuningType:"SkillRef",          desc:"Required skill to unlock this interaction",            optional:true},
      {name:"allow_social_context", type:"Tunable",        tuningType:"bool",              desc:"Whether context modifiers apply",                       optional:true,defaultVal:"True"},
    ],
    usedInProject:["interaction_Hug.xml"],since:"Base game"
  },
  {
    id:"Skill",name:"Skill",module:"skills.skill",inherits:"TunableSimData",
    desc:"Defines a learnable skill with 10 levels, milestones, and commodity decay configuration.",
    fields:[
      {name:"skill_description",  type:"Tunable",       tuningType:"STBLKey",         desc:"Localized description shown in skill panel",           optional:false},
      {name:"stat_asm_param",     type:"Tunable",       tuningType:"str",             desc:"ASM parameter name for skill animations",              optional:true},
      {name:"skill_interactions", type:"TunableList",   tuningType:"InteractionRef",  desc:"Interactions that increase this skill",                optional:true},
      {name:"milestone",          type:"TunableList",   tuningType:"SkillMilestone",  desc:"Milestone events at specific skill levels",            optional:true},
      {name:"commodity",          type:"TunableReference",tuningType:"CommodityRef",  desc:"Statistic commodity backing this skill",               optional:false},
    ],
    usedInProject:["skill_Mischief.xml"],since:"Base game"
  },
  {
    id:"Career",name:"Career",module:"careers.career",inherits:"TunableSimData",
    desc:"Full career definition with branches, daily tasks, schedule, and level rewards.",
    fields:[
      {name:"career_levels",   type:"TunableList",   tuningType:"CareerLevel",     desc:"Ordered list of career levels in each branch",         optional:false},
      {name:"start_track",     type:"TunableReference",tuningType:"CareerTrack",   desc:"Initial career track before any branching",            optional:false},
      {name:"daily_task_help", type:"Tunable",        tuningType:"STBLKey",        desc:"Help text for the daily task panel",                   optional:true},
      {name:"career_category", type:"TunableVariant", tuningType:"CareerCategory", desc:"Category displayed in the career panel",               optional:false},
      {name:"career_availabilities",type:"TunableList",tuningType:"CareerAvailability",desc:"Which game packs/worlds unlock this career",       optional:true},
    ],
    usedInProject:["career_Villain.xml"],since:"Get to Work (EP01)"
  },
];

const FIELD_TYPE_CFG: Record<FieldType,{color:string}> = {
  Tunable:          { color:T.cyan    },
  TunableList:      { color:T.amber   },
  TunableReference: { color:T.emerald },
  TunableVariant:   { color:T.violet  },
  enum:             { color:T.rose    },
};

export function ApiReferenceViewer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [search, setSearch]     = useState("");
  const [selected, setSelected] = useState("Trait");
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["inherits","fields","usage"]));

  const toggle = (s: string) => setExpanded(prev => { const n=new Set(prev); if(n.has(s))n.delete(s); else n.add(s); return n; });

  const filtered = useMemo(() => {
    if (!search) return CLASSES;
    const q = search.toLowerCase();
    return CLASSES.filter(c => c.name.toLowerCase().includes(q) || c.module.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q));
  }, [search]);

  const cls = CLASSES.find(c => c.name === selected) ?? CLASSES[0];
  const _parentCls = cls.inherits ? CLASSES.find(c => c.name === cls.inherits) : null;

  if (!isOpen) return null;

  const SectionHeader = ({ id, label, count }: { id: string; label: string; count?: number }) => (
    <button onClick={()=>toggle(id)} className="w-full flex items-center gap-2 py-2 transition-all" style={{borderBottom:`1px solid ${T.borderSubtle}`}}>
      {expanded.has(id)?<ChevronDown size={11} color={T.textMuted}/>:<ChevronRight size={11} color={T.textMuted}/>}
      <span style={{fontSize:9,fontWeight:700,color:T.textMuted,letterSpacing:"0.07em",flex:1,textAlign:"left"}}>{label}</span>
      {count!==undefined&&<span style={{fontSize:9,fontFamily:T.mono,color:T.textDim}}>{count}</span>}
    </button>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-[200] flex items-center justify-center"
          initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
          style={{background:"rgba(0,0,0,0.82)",backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)"} as any}
          onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
          <motion.div initial={{opacity:0,scale:0.97,y:12}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.97,y:12}}
            transition={{duration:0.22,ease:[0.16,1,0.3,1]}}
            className="relative flex rounded-2xl overflow-hidden"
            style={{width:"min(1040px,97vw)",height:"min(700px,90vh)",background:T.bgElevated,border:`1px solid ${T.border}`,boxShadow:`${T.shadow2Xl},inset 0 1px 0 rgba(255,255,255,0.04)`} as any}>

            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{background:`linear-gradient(90deg,transparent 5%,${T.violet}80,${T.amber}80,transparent 95%)`}}/>

            {/* Class list sidebar */}
            <div className="flex flex-col flex-shrink-0 overflow-hidden" style={{width:220,borderRight:`1px solid ${T.border}`,background:T.bgPanel}}>
              <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{borderBottom:`1px solid ${T.border}`}}>
                <div className="flex items-center gap-2">
                  <Layers size={14} color={T.violet}/>
                  <span style={{fontSize:13,fontWeight:700,color:T.textPrimary,fontFamily:T.display}}>SDK Classes</span>
                </div>
                <button onClick={onClose} className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-white/10"><X size={12} color={T.textMuted}/></button>
              </div>
              <div className="px-3 py-2 flex-shrink-0">
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg" style={{background:T.bgInput,border:`1px solid ${T.borderSubtle}`}}>
                  <Search size={11} color={T.textMuted}/>
                  <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search classes…" className="bg-transparent outline-none flex-1" style={{fontSize:11,color:T.textSecondary}}/>
                  {search&&<button onClick={()=>setSearch("")}><X size={9} color={T.textMuted}/></button>}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
                {filtered.map(c=>{
                  const active=selected===c.name;
                  return (
                    <button key={c.id} onClick={()=>setSelected(c.name)}
                      className="w-full flex items-start gap-2 px-3 py-2.5 rounded-xl text-left transition-all"
                      style={{background:active?T.violetDim:"transparent",borderLeft:`2px solid ${active?T.violet:"transparent"}`}}
                      onMouseEnter={e=>{if(!active)e.currentTarget.style.background=T.bgHover;}}
                      onMouseLeave={e=>{e.currentTarget.style.background=active?T.violetDim:"transparent";}}>
                      <Braces size={12} color={active?T.violet:T.textMuted} className="flex-shrink-0 mt-0.5"/>
                      <div className="min-w-0">
                        <div style={{fontSize:11,fontWeight:active?700:400,fontFamily:T.mono,color:active?T.textPrimary:T.textSecondary}}>{c.name}</div>
                        <div className="truncate" style={{fontSize:9,color:T.textDim,fontFamily:T.mono}}>{c.module}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="px-4 py-1.5 flex-shrink-0" style={{borderTop:`1px solid ${T.borderSubtle}`}}>
                <span style={{fontSize:9,fontFamily:T.mono,color:T.textDim}}>{filtered.length} of {CLASSES.length} classes</span>
              </div>
            </div>

            {/* Detail pane */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
              {/* Class header */}
              <div className="flex items-center gap-3 px-6 py-4 flex-shrink-0" style={{borderBottom:`1px solid ${T.border}`}}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:T.violetDim,border:`1px solid ${T.violet}25`}}>
                  <Braces size={18} color={T.violet}/>
                </div>
                <div className="flex-1 min-w-0">
                  <div style={{fontSize:18,fontWeight:800,fontFamily:T.mono,color:T.textPrimary}}>{cls.name}</div>
                  <div style={{fontSize:10,fontFamily:T.mono,color:T.textMuted}}>{cls.module}</div>
                </div>
                <div className="flex items-center gap-2">
                  {cls.since&&<span className="px-2 py-0.5 rounded" style={{fontSize:9,color:T.amber,background:T.amberDim}}>{cls.since}</span>}
                  <button onClick={()=>navigator.clipboard.writeText(cls.name).then(()=>toast.success("Class name copied"))}
                    className="p-1.5 rounded-lg hover:bg-white/5 transition-all" style={{border:`1px solid ${T.borderSubtle}`}}>
                    <Copy size={11} color={T.textMuted}/>
                  </button>
                  <button onClick={()=>toast.info("SDK docs",{description:`https://sims4.wiki/api/${cls.name}`})}
                    className="p-1.5 rounded-lg hover:bg-white/5 transition-all" style={{border:`1px solid ${T.borderSubtle}`}}>
                    <ExternalLink size={11} color={T.textMuted}/>
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {/* Description */}
                <p style={{fontSize:13,color:T.textSecondary,lineHeight:1.7}}>{cls.desc}</p>

                {/* Inheritance */}
                {cls.inherits && (
                  <div>
                    <SectionHeader id="inherits" label="INHERITANCE"/>
                    {expanded.has("inherits")&&(
                      <div className="flex items-center gap-2 pt-2">
                        <button onClick={()=>setSelected(cls.inherits!)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all"
                          style={{fontSize:11,fontFamily:T.mono,color:T.cyan,background:T.cyanDim,border:`1px solid ${T.cyan}20`}}>
                          <Braces size={10}/> {cls.inherits}
                        </button>
                        <ChevronRight size={12} color={T.textDim}/>
                        <span className="px-2.5 py-1 rounded-lg" style={{fontSize:11,fontFamily:T.mono,color:T.violet,background:T.violetDim}}>{cls.name}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Fields */}
                <div>
                  <SectionHeader id="fields" label="TUNABLE FIELDS" count={cls.fields.length}/>
                  {expanded.has("fields")&&(
                    <div className="space-y-0 mt-2 rounded-xl overflow-hidden" style={{border:`1px solid ${T.borderSubtle}`}}>
                      <div className="grid px-3 py-1.5" style={{gridTemplateColumns:"160px 140px 1fr 60px",gap:8,background:T.bgSurface}}>
                        {["Name","Type","Description","Opt?"].map(h=>(
                          <span key={h} style={{fontSize:8,fontWeight:700,color:T.textMuted,letterSpacing:"0.06em"}}>{h}</span>
                        ))}
                      </div>
                      {cls.fields.map((field,i)=>{
                        const fc = FIELD_TYPE_CFG[field.type];
                        return (
                          <div key={field.name} className="grid px-3 py-2.5 items-start" style={{gridTemplateColumns:"160px 140px 1fr 60px",gap:8,borderTop:`1px solid ${T.borderSubtle}`,background:i%2===0?"transparent":"rgba(255,255,255,0.01)"}}>
                            <code style={{fontSize:10,fontFamily:T.mono,color:T.textPrimary}}>{field.name}</code>
                            <div>
                              <span className="px-1.5 py-0.5 rounded" style={{fontSize:8,fontWeight:700,color:fc.color,background:`${fc.color}12`}}>{field.type}</span>
                              {field.tuningType&&<div style={{fontSize:8,fontFamily:T.mono,color:T.textDim,marginTop:2}}>{field.tuningType}</div>}
                            </div>
                            <div>
                              <span style={{fontSize:11,color:T.textMuted}}>{field.desc}</span>
                              {field.defaultVal&&<div style={{fontSize:9,fontFamily:T.mono,color:T.textDim,marginTop:1}}>default: {field.defaultVal}</div>}
                            </div>
                            <span style={{fontSize:9,color:field.optional?T.textDim:T.rose}}>{field.optional?"opt":"req"}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Used in project */}
                {cls.usedInProject&&cls.usedInProject.length>0&&(
                  <div>
                    <SectionHeader id="usage" label="USED IN PROJECT" count={cls.usedInProject.length}/>
                    {expanded.has("usage")&&(
                      <div className="flex flex-wrap gap-2 pt-2">
                        {cls.usedInProject.map(f=>(
                          <button key={f} onClick={()=>toast.success(`Open ${f}`)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all"
                            style={{fontSize:10,fontFamily:T.mono,color:T.cyan,background:T.cyanDim,border:`1px solid ${T.cyan}20`}}>
                            <FileCode size={10}/>{f}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ApiReferenceViewer;

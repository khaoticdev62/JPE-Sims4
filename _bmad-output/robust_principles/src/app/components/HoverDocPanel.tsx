/* ─────────────────────────────────────────────────────────────
   JPE Studio — Hover Doc Panel (Phase 17)
   Searchable Sims 4 tuning keyword reference: type signatures,
   valid values, examples, and SDK cross-links.
   ───────────────────────────────────────────────────────────── */
import { useState, useMemo } from "react";
import {
  X, Search, BookOpen, Copy, Check, ExternalLink,
  Tag, Hash, List, Braces, AlignLeft, Zap,
  ChevronDown, ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "./jpe-motion";
import { T } from "../pages/jpe-theme";
import { toast } from "sonner";

/* ── Types ── */
type DocCategory = "tunable" | "enum" | "list" | "reference" | "commodity" | "loot";

interface DocEntry {
  id: string;
  keyword: string;
  category: DocCategory;
  type: string;
  desc: string;
  validValues?: string[];
  example: string;
  notes?: string;
  sdkClass?: string;
}

/* ── Docs catalog ── */
const DOCS: DocEntry[] = [
  {id:"d01",keyword:"TunableSimData",    category:"tunable",  type:"root",    desc:"Root element for all .xml tuning files. Contains all nested tunable fields that define the behavior of a Sims 4 game object.",example:`<TunableSimData n="trait_Evil" s="0x001B3FC2">\n  <!-- children -->\n</TunableSimData>`,sdkClass:"TunableSimData",notes:"The s attribute must be a unique FNV-32a hash of the n attribute value."},
  {id:"d02",keyword:"Tunable",           category:"tunable",  type:"leaf",    desc:"A single value field. Supports string, integer, float, boolean, enum, and ResourceKey types depending on context.",example:`<Tunable n="trait_type" t="TraitType" ev="PERSONALITY"/>`,sdkClass:"Tunable",validValues:["string","bool","int","float","ResourceKey","enum"]},
  {id:"d03",keyword:"TunableList",       category:"list",     type:"list",    desc:"A list of values or nested tunables. Can hold any number of child elements.",example:`<TunableList n="buffs_list">\n  <Tunable>0x2B4F8A1C</Tunable>\n</TunableList>`,sdkClass:"TunableList"},
  {id:"d04",keyword:"TunableReference",  category:"reference",type:"ref",     desc:"A reference to another tuning file identified by its ResourceKey.",example:`<TunableReference n="whim_set">0x00FA3BC1</TunableReference>`,sdkClass:"TunableReference",notes:"The inner text is the instance ID (FNV-32a hash)."},
  {id:"d05",keyword:"TunableVariant",    category:"tunable",  type:"variant", desc:"A polymorphic field with a type discriminant. Use the t attribute to specify the concrete type.",example:`<TunableVariant n="subject" t="ParticipantType" ev="Actor"/>`,sdkClass:"TunableVariant"},
  {id:"d06",keyword:"TraitType",         category:"enum",     type:"enum",    desc:"Enum controlling where in CAS the trait appears.",example:`<Tunable n="trait_type" t="TraitType" ev="PERSONALITY"/>`,validValues:["PERSONALITY","TODDLER","INFANT","DEATH","REWARD","GHOST","HIDDEN","OBJECT"],sdkClass:"TraitType"},
  {id:"d07",keyword:"InteractionCategoryTag",category:"enum", type:"enum",    desc:"Categorizes an interaction within the Sim's pie menu.",example:`<Tunable n="category" t="InteractionCategoryTag" ev="CommonSocials_Friendly"/>`,validValues:["CommonSocials_Friendly","CommonSocials_Funny","CommonSocials_Mischief","CommonSocials_Romance","CommonSocials_Mean"],sdkClass:"InteractionCategoryTag"},
  {id:"d08",keyword:"MoodType",          category:"enum",     type:"enum",    desc:"Specifies the emotional state associated with a buff or moodlet.",example:`<Tunable n="mood_type" t="MoodType" ev="HAPPY"/>`,validValues:["HAPPY","SAD","ANGRY","TENSE","UNCOMFORTABLE","EMBARRASSED","BORED","DAZED","INSPIRED","ENERGIZED","FOCUSED","CONFIDENT","FLIRTY","PLAYFUL"],sdkClass:"MoodType"},
  {id:"d09",keyword:"commodity_decay",   category:"commodity",type:"float",   desc:"Rate at which the buff's internal statistic decays per game-hour. Higher values mean shorter durations.",example:`<Tunable n="commodity_decay" t="TunableMultiplier" ev="1.0"/>`,notes:"Set to 0 for permanent buffs. Default decay is 1.0."},
  {id:"d10",keyword:"loot_on_trait_add", category:"loot",     type:"list",    desc:"A list of loot operations applied when this trait is added to a Sim in CAS or by cheats.",example:`<TunableList n="loot_on_trait_add">\n  <TunableReference>0x00A3BC01</TunableReference>\n</TunableList>`,sdkClass:"LootActions"},
  {id:"d11",keyword:"ParticipantType",   category:"enum",     type:"enum",    desc:"Specifies which Sim is the target of an interaction or loot action.",example:`<Tunable n="subject" t="ParticipantType" ev="Actor"/>`,validValues:["Actor","TargetSim","AllSims","ActiveHousehold","Lot","Object"],sdkClass:"ParticipantType"},
  {id:"d12",keyword:"StatisticChangeOp", category:"loot",     type:"operation",desc:"Applies a numerical change to a statistic. Use in loot files to add/subtract skill points, needs, etc.",example:`<Tunable n="stat" t="StatisticRef">0x01BC2D</Tunable>\n<Tunable n="amount" ev="100"/>`,sdkClass:"StatisticChangeOp"},
  {id:"d13",keyword:"ResourceKey",       category:"reference",type:"string",  desc:"A 3-part resource identifier in the form TYPE:GROUP:INSTANCE. All three are hexadecimal values.",example:`<Tunable n="headline_icon" t="ResourceKey" ev="2F7D0004:00000000:FAE72001"/>`,notes:"TYPE identifies the resource type (e.g., 0x00B2D882 for DDS image)."},
  {id:"d14",keyword:"ObjectStateValue",  category:"enum",     type:"enum",    desc:"Represents a discrete state of an object (e.g., on/off, clean/dirty).",example:`<Tunable n="state_value" t="ObjectStateValue" ev="CleanState_Clean"/>`,sdkClass:"ObjectStateValue"},
  {id:"d15",keyword:"InteractionOutcome",category:"loot",     type:"outcome", desc:"Defines success and failure results for an interaction using separate loot lists.",example:`<TunableVariant n="outcome" t="InteractionOutcomeVariant">\n  <success_loot>0x0F3CA801</success_loot>\n</TunableVariant>`,sdkClass:"InteractionOutcome"},
  {id:"d16",keyword:"buff_reason",       category:"tunable",  type:"string",  desc:"Key string for the localized reason displayed in the buff tooltip. Must match a STBL entry.",example:`<Tunable n="buff_reason" ev="Strings:0x0A2B3C4D"/>`,notes:"Value format: Strings:0xHASH where HASH is the FNV-32a of the key string."},
  {id:"d17",keyword:"achievement_trigger",category:"commodity",type:"event",  desc:"Fires a game event when a Sim fulfills the achievement conditions — used in aspirations.",example:`<Tunable n="achievement_trigger" t="AchievementTrigger" ev="trait_acquired"/>`,sdkClass:"AchievementTrigger"},
  {id:"d18",keyword:"skill_lock",        category:"commodity",type:"gate",    desc:"Prevents an interaction from appearing until the Sim reaches the specified skill level.",example:`<Tunable n="skill_lock" t="SkillRef">0x01CACBBA</Tunable>\n<Tunable n="skill_level" ev="5"/>`,sdkClass:"SkillLock"},
];

const CAT_CFG: Record<DocCategory,{color:string;label:string;Icon:typeof BookOpen}> = {
  tunable:   {color:T.cyan,    label:"Tunable",   Icon:Tag},
  enum:      {color:T.violet,  label:"Enum",      Icon:List},
  list:      {color:T.amber,   label:"List",      Icon:AlignLeft},
  reference: {color:T.emerald, label:"Reference", Icon:Hash},
  commodity: {color:T.rose,    label:"Commodity", Icon:Zap},
  loot:      {color:T.cyanBright, label:"Loot",   Icon:Braces},
};

const CATEGORIES: DocCategory[] = ["tunable","enum","list","reference","commodity","loot"];

export function HoverDocPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [search, setSearch]   = useState("");
  const [catFilter, setCat]   = useState<DocCategory | "all">("all");
  const [selected, setSelected] = useState<string>("d01");
  const [copied, setCopied]   = useState(false);

  const filtered = useMemo(()=>{
    let rows = DOCS;
    if (catFilter !== "all") rows = rows.filter(d => d.category === catFilter);
    if (search) { const q = search.toLowerCase(); rows = rows.filter(d => d.keyword.toLowerCase().includes(q) || d.desc.toLowerCase().includes(q)); }
    return rows;
  }, [search, catFilter]);

  const entry = DOCS.find(d => d.id === selected) ?? DOCS[0];
  const cfg   = CAT_CFG[entry.category];
  const Icon  = cfg.Icon;

  const copyExample = () => {
    navigator.clipboard.writeText(entry.example).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),1500); toast.success("Example snippet copied"); });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-[200] flex items-center justify-center"
          initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
          style={{background:"rgba(0,0,0,0.8)",backdropFilter:"blur(12px)"}}
          onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
          <motion.div initial={{opacity:0,scale:0.97,y:12}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.97,y:12}}
            transition={{duration:0.22,ease:[0.16,1,0.3,1]}}
            className="relative flex rounded-2xl overflow-hidden"
            style={{width:"min(920px,97vw)",height:"min(660px,90vh)",background:T.bgElevated,border:`1px solid ${T.border}`,boxShadow:`0 40px 80px rgba(0,0,0,0.7),inset 0 1px 0 rgba(255,255,255,0.04)`}}>

            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{background:`linear-gradient(90deg,transparent 5%,${T.violet}80,${T.cyan}80,transparent 95%)`}}/>

            {/* Left: list */}
            <div className="flex flex-col flex-shrink-0 overflow-hidden" style={{width:280,borderRight:`1px solid ${T.border}`}}>
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{borderBottom:`1px solid ${T.border}`}}>
                <div className="flex items-center gap-2">
                  <BookOpen size={14} color={T.violet}/>
                  <span style={{fontSize:13,fontWeight:700,color:T.textPrimary,fontFamily:T.display}}>Tuning Docs</span>
                </div>
                <button onClick={onClose} className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-white/10"><X size={12} color={T.textMuted}/></button>
              </div>
              {/* Search */}
              <div className="px-3 py-2 flex-shrink-0">
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg" style={{background:T.bgInput,border:`1px solid ${T.borderSubtle}`}}>
                  <Search size={11} color={T.textMuted}/>
                  <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search keywords…"
                    className="bg-transparent outline-none flex-1" style={{fontSize:11,color:T.textSecondary}}/>
                  {search&&<button onClick={()=>setSearch("")}><X size={9} color={T.textMuted}/></button>}
                </div>
              </div>
              {/* Category chips */}
              <div className="flex items-center gap-1 px-3 pb-2 flex-shrink-0 flex-wrap">
                <button onClick={()=>setCat("all")} className="px-2 py-0.5 rounded-md transition-all"
                  style={{fontSize:9,fontWeight:catFilter==="all"?700:400,color:catFilter==="all"?T.textPrimary:T.textMuted,background:catFilter==="all"?"rgba(255,255,255,0.06)":"transparent"}}>All</button>
                {CATEGORIES.map(c=>(
                  <button key={c} onClick={()=>setCat(c)} className="px-2 py-0.5 rounded-md transition-all"
                    style={{fontSize:9,fontWeight:catFilter===c?700:400,color:catFilter===c?CAT_CFG[c].color:T.textMuted,background:catFilter===c?`${CAT_CFG[c].color}12`:"transparent"}}>
                    {CAT_CFG[c].label}
                  </button>
                ))}
              </div>
              {/* List */}
              <div className="flex-1 overflow-y-auto px-2">
                {filtered.map(d=>{
                  const c=CAT_CFG[d.category]; const I=c.Icon; const active=selected===d.id;
                  return (
                    <button key={d.id} onClick={()=>setSelected(d.id)}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all mb-0.5"
                      style={{background:active?`${T.violet}10`:"transparent",borderLeft:`2px solid ${active?T.violet:"transparent"}`}}
                      onMouseEnter={e=>{if(!active)e.currentTarget.style.background=T.bgHover;}}
                      onMouseLeave={e=>{e.currentTarget.style.background=active?`${T.violet}10`:"transparent";}}>
                      <I size={11} color={active?c.color:T.textMuted}/>
                      <div className="flex-1 min-w-0">
                        <div className="truncate" style={{fontSize:11,fontWeight:active?700:400,fontFamily:T.mono,color:active?T.textPrimary:T.textSecondary}}>{d.keyword}</div>
                        <div style={{fontSize:9,color:c.color}}>{c.label}</div>
                      </div>
                    </button>
                  );
                })}
                {filtered.length===0&&<div className="py-8 text-center" style={{fontSize:11,color:T.textMuted}}>No results</div>}
              </div>
              <div className="px-4 py-1.5 flex-shrink-0" style={{borderTop:`1px solid ${T.borderSubtle}`,background:"rgba(0,0,0,0.1)"}}>
                <span style={{fontSize:9,fontFamily:T.mono,color:T.textDim}}>{filtered.length} of {DOCS.length} entries</span>
              </div>
            </div>

            {/* Right: detail */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-3.5 flex-shrink-0" style={{borderBottom:`1px solid ${T.border}`}}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:`${cfg.color}15`,border:`1px solid ${cfg.color}25`}}>
                  <Icon size={16} color={cfg.color}/>
                </div>
                <div className="flex-1">
                  <div style={{fontSize:16,fontWeight:800,color:T.textPrimary,fontFamily:T.mono}}>{entry.keyword}</div>
                  <div className="flex items-center gap-2">
                    <span style={{fontSize:9,fontWeight:700,color:cfg.color,letterSpacing:"0.07em"}}>{cfg.label.toUpperCase()}</span>
                    <span style={{color:T.textDim,fontSize:9}}>·</span>
                    <span style={{fontSize:9,fontFamily:T.mono,color:T.textDim}}>{entry.type}</span>
                    {entry.sdkClass&&<><span style={{color:T.textDim,fontSize:9}}>·</span><span style={{fontSize:9,fontFamily:T.mono,color:T.violet}}>{entry.sdkClass}</span></>}
                  </div>
                </div>
                {entry.sdkClass&&(
                  <button onClick={()=>toast.info("SDK reference",{description:"https://sims4.wiki/tuning/"+entry.sdkClass})}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-all"
                    style={{fontSize:10,color:T.textMuted,border:`1px solid ${T.borderSubtle}`}}>
                    <ExternalLink size={10}/> SDK
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Description */}
                <div>
                  <div style={{fontSize:9,fontWeight:700,color:T.textMuted,letterSpacing:"0.07em",marginBottom:6}}>DESCRIPTION</div>
                  <p style={{fontSize:13,color:T.textSecondary,lineHeight:1.7}}>{entry.desc}</p>
                </div>

                {/* Valid values */}
                {entry.validValues && (
                  <div>
                    <div style={{fontSize:9,fontWeight:700,color:T.textMuted,letterSpacing:"0.07em",marginBottom:6}}>VALID VALUES</div>
                    <div className="flex flex-wrap gap-1.5">
                      {entry.validValues.map(v=>(
                        <span key={v} className="px-2 py-0.5 rounded" style={{fontSize:10,fontFamily:T.mono,color:cfg.color,background:`${cfg.color}12`,border:`1px solid ${cfg.color}20`}}>{v}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Example */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div style={{fontSize:9,fontWeight:700,color:T.textMuted,letterSpacing:"0.07em"}}>EXAMPLE</div>
                    <button onClick={copyExample}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-white/5 transition-all"
                      style={{fontSize:9,color:copied?T.emerald:T.textMuted,border:`1px solid ${T.borderSubtle}`}}>
                      {copied?<Check size={9}/>:<Copy size={9}/>}{copied?"Copied":"Copy"}
                    </button>
                  </div>
                  <pre className="rounded-xl p-4 overflow-x-auto" style={{fontSize:11,fontFamily:T.mono,color:T.cyan,background:T.bgDeep,border:`1px solid ${T.borderSubtle}`,lineHeight:1.6,whiteSpace:"pre-wrap"}}>
                    {entry.example}
                  </pre>
                </div>

                {/* Notes */}
                {entry.notes && (
                  <div className="flex items-start gap-2 p-3 rounded-xl" style={{background:`${T.amber}08`,border:`1px solid ${T.amber}20`}}>
                    <Zap size={12} color={T.amber} className="flex-shrink-0 mt-0.5"/>
                    <p style={{fontSize:12,color:T.amber,lineHeight:1.5}}>{entry.notes}</p>
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

export default HoverDocPanel;

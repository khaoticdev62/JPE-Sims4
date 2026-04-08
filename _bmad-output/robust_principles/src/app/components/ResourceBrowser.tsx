/* ─────────────────────────────────────────────────────────────
   JPE Studio — Resource Browser (Phase 16)
   Browse binary/XML/STBL resources by type, group, and instance.
   Hex dump and text preview for selected resource.
   ───────────────────────────────────────────────────────────── */
import { useState, useMemo } from "react";
import {
  X, Search, FileCode, FileText, Image, Music, Package,
  Database, ChevronRight, ChevronDown, Copy, Download,
  Eye, Hash, Braces, RefreshCw, Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "./jpe-motion";
import { T } from "../pages/jpe-theme";
import { toast } from "sonner";

/* ── Types ── */
type ResType = "tuning" | "stbl" | "image" | "audio" | "binary" | "package";

interface Resource {
  id: string;
  type: ResType;
  group: string;
  instance: string;
  name: string;
  sizeKb: number;
  modified: string;
  preview?: string;
}

/* ── Mock resources ── */
const RESOURCES: Resource[] = [
  {id:"r01",type:"tuning",   group:"03B33DDF",instance:"001B3FC2",name:"trait_Evil",             sizeKb:47.2, modified:"2026-03-11",preview:`<TunableSimData n="trait_Evil" s="0x001B3FC2">\n  <Tunable n="trait_type" t="TraitType" ev="PERSONALITY"/>\n  <TunableList n="buffs_list">\n    <Tunable>0x2B4F8A1C</Tunable>\n  </TunableList>\n</TunableSimData>`},
  {id:"r02",type:"tuning",   group:"EEF2BDCF",instance:"001A94B4",name:"interaction_Hug",         sizeKb:12.8, modified:"2026-03-10",preview:`<TunableSimData n="interaction_Hug" s="0x001A94B4">\n  <Tunable n="category" t="InteractionCategoryTag" ev="CommonSocials_Friendly"/>\n  <Tunable n="success_loot" t="LootRef">0x0F3CA801</Tunable>\n</TunableSimData>`},
  {id:"r03",type:"tuning",   group:"EEF2BDCF",instance:"003B1200",name:"interaction_TellJoke",    sizeKb:8.4,  modified:"2026-03-09",preview:`<TunableSimData n="interaction_TellJoke">\n  <Tunable n="category" ev="CommonSocials_Funny"/>\n</TunableSimData>`},
  {id:"r04",type:"tuning",   group:"6017E896",instance:"00A02BC1",name:"buff_EvilGlee",            sizeKb:5.1,  modified:"2026-03-08"},
  {id:"r05",type:"tuning",   group:"6017E896",instance:"00A02BC2",name:"buff_Mischievous",         sizeKb:4.8,  modified:"2026-03-08"},
  {id:"r06",type:"tuning",   group:"01CACBBA",instance:"00041E92",name:"skill_Mischief",           sizeKb:22.6, modified:"2026-03-07"},
  {id:"r07",type:"tuning",   group:"BEBA7519",instance:"00038B27",name:"career_Villain",           sizeKb:34.0, modified:"2026-03-06"},
  {id:"r08",type:"stbl",     group:"220557DA",instance:"0017E3B1",name:"strings_en-US",            sizeKb:18.4, modified:"2026-03-11",preview:`00000000: 4D 4E 4D 4E 08 00 00 00 14 00 00 00 ...MNMN....\n00000010: 45 76 69 6C 00 4D 61 6C 76 61 64 6F 00 ...Evil.Malvado.`},
  {id:"r09",type:"stbl",     group:"220557DA",instance:"3C1D837A",name:"strings_es-ES",            sizeKb:17.9, modified:"2026-03-11"},
  {id:"r10",type:"stbl",     group:"220557DA",instance:"59B1660E",name:"strings_fr-FR",            sizeKb:18.1, modified:"2026-03-09"},
  {id:"r11",type:"stbl",     group:"220557DA",instance:"3C9D0C0E",name:"strings_de-DE",            sizeKb:18.5, modified:"2026-03-08"},
  {id:"r12",type:"stbl",     group:"220557DA",instance:"C83A0000",name:"strings_ko-KR",            sizeKb:16.2, modified:"2026-03-06"},
  {id:"r13",type:"image",    group:"00B2D882",instance:"FAE72001",name:"thumbnail_trait_Evil",     sizeKb:6.4,  modified:"2026-03-10"},
  {id:"r14",type:"image",    group:"00B2D882",instance:"FAE72002",name:"thumbnail_buff_EvilGlee",  sizeKb:4.1,  modified:"2026-03-10"},
  {id:"r15",type:"image",    group:"00B2D882",instance:"FAE72003",name:"icon_skill_Mischief",      sizeKb:3.8,  modified:"2026-03-09"},
  {id:"r16",type:"audio",    group:"032E3DEC",instance:"00000001",name:"sfx_evil_laugh_01",        sizeKb:84.0, modified:"2026-03-07"},
  {id:"r17",type:"audio",    group:"032E3DEC",instance:"00000002",name:"sfx_evil_laugh_02",        sizeKb:76.5, modified:"2026-03-07"},
  {id:"r18",type:"binary",   group:"F8B24C0A",instance:"000A0001",name:"catalog_EvilTrait",        sizeKb:2.1,  modified:"2026-03-09"},
  {id:"r19",type:"binary",   group:"F8B24C0A",instance:"000A0002",name:"hotspot_control",          sizeKb:1.4,  modified:"2026-03-08"},
  {id:"r20",type:"binary",   group:"00B2D882",instance:"00FF0001",name:"geometry_rig_body",        sizeKb:145.2,modified:"2026-03-05"},
  {id:"r21",type:"package",  group:"00000000",instance:"00000001",name:"Evil_Trait_Override.package",sizeKb:482.7,modified:"2026-03-11"},
];

const TYPE_CONFIG: Record<ResType,{label:string;icon:typeof FileCode;color:string}> = {
  tuning:  {label:"Tuning XML",     icon:FileCode, color:T.cyan},
  stbl:    {label:"STBL Strings",   icon:FileText, color:T.violet},
  image:   {label:"Images",         icon:Image,    color:T.amber},
  audio:   {label:"Audio",          icon:Music,    color:T.emerald},
  binary:  {label:"Binary Data",    icon:Database, color:T.rose},
  package: {label:"Package Files",  icon:Package,  color:T.textSecondary},
};

const HEX_PREVIEW = `00000000: 44 42 50 46 02 00 00 00  1C 00 00 00 00 00 00 00  DBPF............
00000010: 00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00  ................
00000020: 06 00 00 00 20 02 00 00  00 00 00 00 00 00 00 00  .... ...........
00000030: 07 00 00 00 00 00 00 00  00 04 00 00 3C 00 00 00  ............<...
00000040: 03 B3 3D DF 00 00 00 00  00 1B 3F C2 00 00 00 00  ..=.......?.....`;

/* ── Main ── */
export function ResourceBrowser({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [typeFilter, setTypeFilter] = useState<ResType | "all">("all");
  const [selected, setSelected]     = useState<string | null>("r01");
  const [search, setSearch]         = useState("");
  const [expanded, setExpanded]     = useState<Set<ResType>>(new Set(["tuning","stbl"]));

  const toggleExpand = (t: ResType) => setExpanded(prev => { const n = new Set(prev); if(n.has(t)) n.delete(t); else n.add(t); return n; });

  const filtered = useMemo(()=>{
    let rows = RESOURCES;
    if (typeFilter !== "all") rows = rows.filter(r => r.type === typeFilter);
    if (search) { const q = search.toLowerCase(); rows = rows.filter(r => r.name.toLowerCase().includes(q) || r.instance.toLowerCase().includes(q) || r.group.toLowerCase().includes(q)); }
    return rows;
  }, [typeFilter, search]);

  const sel = RESOURCES.find(r => r.id === selected);
  const counts: Record<ResType, number> = {} as any;
  (Object.keys(TYPE_CONFIG) as ResType[]).forEach(k => { counts[k] = RESOURCES.filter(r => r.type === k).length; });

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
            style={{width:"min(1060px,97vw)",height:"min(720px,92vh)",background:T.bgElevated,border:`1px solid ${T.border}`,boxShadow:`0 40px 80px rgba(0,0,0,0.7),inset 0 1px 0 rgba(255,255,255,0.04)`}}>

            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{background:`linear-gradient(90deg,transparent 5%,${T.cyan}80,${T.amber}80,transparent 95%)`}}/>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 flex-shrink-0" style={{borderBottom:`1px solid ${T.border}`}}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:`linear-gradient(135deg,${T.cyan}20,${T.amber}20)`,border:`1px solid ${T.borderSubtle}`}}>
                  <Database size={16} color={T.cyan}/>
                </div>
                <div>
                  <div style={{fontSize:15,fontWeight:700,color:T.textPrimary,fontFamily:T.display}}>Resource Browser</div>
                  <div style={{fontSize:10,color:T.textMuted,fontFamily:T.mono}}>Evil_Trait_Override.package · {RESOURCES.length} resources · {(RESOURCES.reduce((a,r)=>a+r.sizeKb,0)/1024).toFixed(1)} MB</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{background:T.bgInput,border:`1px solid ${T.borderSubtle}`}}>
                  <Search size={11} color={T.textMuted}/>
                  <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, key, group…"
                    className="bg-transparent outline-none w-40" style={{fontSize:11,color:T.textSecondary}}/>
                  {search && <button onClick={()=>setSearch("")}><X size={9} color={T.textMuted}/></button>}
                </div>
                <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all" style={{border:`1px solid ${T.borderSubtle}`}}>
                  <X size={14} color={T.textMuted}/>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex flex-1 min-h-0 overflow-hidden">
              {/* Left: type sidebar */}
              <div className="flex-shrink-0 overflow-y-auto" style={{width:180,borderRight:`1px solid ${T.border}`,background:T.bgPanel}}>
                <div className="p-2 space-y-0.5">
                  <button onClick={()=>setTypeFilter("all")}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all"
                    style={{background:typeFilter==="all"?T.bgActive:"transparent",color:typeFilter==="all"?T.textPrimary:T.textMuted}}>
                    <Package size={12} color={typeFilter==="all"?T.cyan:T.textMuted}/>
                    <span style={{fontSize:11,fontWeight:typeFilter==="all"?700:400}}>All Resources</span>
                    <span className="ml-auto" style={{fontSize:9,fontFamily:T.mono,color:T.textDim}}>{RESOURCES.length}</span>
                  </button>
                  {(Object.entries(TYPE_CONFIG) as [ResType,typeof TYPE_CONFIG.tuning][]).map(([type,cfg])=>{
                    const Icon = cfg.icon; const active = typeFilter === type;
                    return (
                      <button key={type} onClick={()=>setTypeFilter(type)}
                        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all"
                        style={{background:active?T.bgActive:"transparent"}}>
                        <Icon size={12} color={active?cfg.color:T.textMuted}/>
                        <span style={{fontSize:11,fontWeight:active?700:400,color:active?T.textPrimary:T.textMuted}}>{cfg.label}</span>
                        <span className="ml-auto" style={{fontSize:9,fontFamily:T.mono,color:active?cfg.color:T.textDim}}>{counts[type]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Middle: resource table */}
              <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                {/* Table header */}
                <div className="grid px-4 py-1.5 flex-shrink-0" style={{gridTemplateColumns:"30px 130px 130px 1fr 60px 70px",gap:8,background:T.bgSurface,borderBottom:`1px solid ${T.border}`}}>
                  {["","Type","Group","Name / Instance","KB","Modified"].map(h=>(
                    <span key={h} style={{fontSize:9,fontWeight:700,color:T.textMuted,letterSpacing:"0.06em",textTransform:"uppercase"}}>{h}</span>
                  ))}
                </div>
                {/* Rows */}
                <div className="flex-1 overflow-y-auto">
                  {filtered.map(r=>{
                    const cfg = TYPE_CONFIG[r.type]; const Icon = cfg.icon; const isSel = selected === r.id;
                    return (
                      <div key={r.id} className="grid items-center px-4 py-2 cursor-pointer transition-colors"
                        style={{gridTemplateColumns:"30px 130px 130px 1fr 60px 70px",gap:8,borderBottom:`1px solid ${T.borderSubtle}`,
                          background:isSel?`${T.cyan}08`:"transparent",borderLeft:`2px solid ${isSel?T.cyan:"transparent"}`}}
                        onMouseEnter={e=>{if(!isSel)e.currentTarget.style.background=T.bgHover;}}
                        onMouseLeave={e=>{e.currentTarget.style.background=isSel?`${T.cyan}08`:"transparent";}}
                        onClick={()=>setSelected(r.id)}>
                        <Icon size={12} color={isSel?cfg.color:T.textMuted}/>
                        <span style={{fontSize:10,color:isSel?cfg.color:T.textTertiary}}>{cfg.label}</span>
                        <code style={{fontSize:10,fontFamily:T.mono,color:T.textDim}}>:{r.group}</code>
                        <div className="min-w-0">
                          <div className="truncate" style={{fontSize:11,fontWeight:isSel?600:400,color:isSel?T.textPrimary:T.textSecondary}}>{r.name}</div>
                          <code style={{fontSize:9,fontFamily:T.mono,color:T.textDim}}>0x{r.instance}</code>
                        </div>
                        <span style={{fontSize:10,fontFamily:T.mono,color:T.textTertiary,textAlign:"right"}}>{r.sizeKb.toFixed(1)}</span>
                        <span style={{fontSize:9,fontFamily:T.mono,color:T.textDim}}>{r.modified.slice(5)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="px-4 py-1.5 flex-shrink-0" style={{borderTop:`1px solid ${T.borderSubtle}`,background:"rgba(0,0,0,0.1)"}}>
                  <span style={{fontSize:9,fontFamily:T.mono,color:T.textDim}}>{filtered.length} of {RESOURCES.length} resources shown</span>
                </div>
              </div>

              {/* Right: preview */}
              <div className="flex flex-col flex-shrink-0 overflow-hidden" style={{width:300,borderLeft:`1px solid ${T.border}`,background:"rgba(0,0,0,0.08)"}}>
                {sel ? (
                  <>
                    <div className="flex items-center justify-between px-4 py-2.5 flex-shrink-0" style={{borderBottom:`1px solid ${T.border}`}}>
                      <span style={{fontSize:10,fontWeight:700,color:T.textMuted,letterSpacing:"0.06em"}}>PREVIEW</span>
                      <div className="flex items-center gap-1">
                        <button onClick={()=>navigator.clipboard.writeText(`${sel.type.toUpperCase()}:${sel.group}:${sel.instance}`).then(()=>toast.success("Key copied"))}
                          className="p-1 rounded hover:bg-white/10 transition-all"><Copy size={10} color={T.textMuted}/></button>
                        <button onClick={()=>toast.success(`Exporting ${sel.name}`)} className="p-1 rounded hover:bg-white/10 transition-all"><Download size={10} color={T.textMuted}/></button>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {/* Meta */}
                      {[{l:"Type",v:TYPE_CONFIG[sel.type].label},{l:"Group",v:`0x${sel.group}`},{l:"Instance",v:`0x${sel.instance}`},{l:"Size",v:`${sel.sizeKb.toFixed(1)} KB`},{l:"Modified",v:sel.modified}].map(m=>(
                        <div key={m.l} className="flex items-center gap-2">
                          <span style={{fontSize:9,fontWeight:700,color:T.textMuted,minWidth:60}}>{m.l}</span>
                          <code style={{fontSize:10,fontFamily:T.mono,color:T.textSecondary,flex:1,wordBreak:"break-all"}}>{m.v}</code>
                        </div>
                      ))}
                      {/* Content preview */}
                      <div>
                        <div style={{fontSize:9,fontWeight:700,color:T.textMuted,marginBottom:6,letterSpacing:"0.06em"}}>
                          {sel.type==="image"?"IMAGE":sel.type==="audio"?"AUDIO":sel.type==="binary"||sel.type==="package"?"HEX DUMP":"SOURCE"}
                        </div>
                        {sel.type==="image" ? (
                          <div className="rounded-lg flex items-center justify-center" style={{height:80,background:`${T.amber}08`,border:`1px solid ${T.amber}20`}}>
                            <Image size={20} color={T.amber} strokeWidth={1.5}/>
                          </div>
                        ) : sel.type==="audio" ? (
                          <div className="rounded-lg flex items-center justify-center gap-2" style={{height:60,background:`${T.emerald}08`,border:`1px solid ${T.emerald}20`}}>
                            <Music size={16} color={T.emerald} strokeWidth={1.5}/>
                            <span style={{fontSize:11,color:T.emerald}}>{sel.sizeKb.toFixed(0)} KB audio</span>
                          </div>
                        ) : (
                          <pre className="rounded-lg p-3 overflow-x-auto" style={{fontSize:9,fontFamily:T.mono,color:T.textSecondary,background:T.bgDeep,border:`1px solid ${T.borderSubtle}`,lineHeight:1.6,whiteSpace:"pre-wrap",wordBreak:"break-all"}}>
                            {sel.preview ?? HEX_PREVIEW}
                          </pre>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center flex-1 gap-3">
                    <Eye size={20} color={T.textDim} strokeWidth={1.5}/>
                    <span style={{fontSize:11,color:T.textMuted}}>Select a resource to preview</span>
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

export default ResourceBrowser;

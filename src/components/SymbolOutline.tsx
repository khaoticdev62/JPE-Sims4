"use client";

/* ─────────────────────────────────────────────────────────────
   JPE Studio — Symbol Outline (Phase 17)
   Document symbol tree: XML nodes, string keys, tuning classes.
   Click-to-navigate with collapsible groups and search filter.
   ───────────────────────────────────────────────────────────── */
import { useState, useMemo } from "react";
import {
  X, Search, ChevronRight, ChevronDown, Hash, FileCode,
  List, Braces, Code2, Tag, AlignLeft,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "./jpe-motion";
import { T } from "./robust/jpe-theme";
import { toast } from "sonner";

/* ── Types ── */
type SymbolKind = "class" | "element" | "attribute" | "string-key" | "function" | "constant";

interface Symbol {
  id: string;
  kind: SymbolKind;
  name: string;
  detail?: string;
  line: number;
  children?: Symbol[];
}

/* ── Mock symbol tree for active file: trait_Evil.xml ── */
const SYMBOLS: Symbol[] = [
  { id:"s01",kind:"class",  name:"TunableSimData",    detail:"root element", line:1, children:[
    { id:"s02",kind:"attribute",name:"n",             detail:'"trait_Evil"',  line:1 },
    { id:"s03",kind:"attribute",name:"s",             detail:'"0x001B3FC2"',  line:1 },
    { id:"s04",kind:"element", name:"trait_type",     detail:"TraitType enum",line:3, children:[
      { id:"s05",kind:"constant",name:"PERSONALITY",  detail:"TraitType",    line:3 },
    ]},
    { id:"s06",kind:"element", name:"buffs_list",     detail:"TunableList",  line:4, children:[
      { id:"s07",kind:"string-key",name:"0x2B4F8A1C", detail:"buff_EvilGlee",line:5 },
      { id:"s08",kind:"string-key",name:"0x3A8CD201", detail:"buff_MeanSpirit",line:6 },
    ]},
    { id:"s09",kind:"element", name:"whim_set",       detail:"TunableReference",line:8 },
    { id:"s10",kind:"element", name:"interactions",   detail:"TunableList",  line:9, children:[
      { id:"s11",kind:"string-key",name:"interaction_MeanPrank",detail:"0x0014BC2F",line:10 },
      { id:"s12",kind:"string-key",name:"interaction_InsultSim", detail:"0x00203A1E",line:11 },
      { id:"s13",kind:"string-key",name:"interaction_HumanChesspiece",detail:"0x00A1BC30",line:12 },
    ]},
    { id:"s14",kind:"element", name:"loot_on_trait_add",detail:"TunableList",line:14 },
    { id:"s15",kind:"element", name:"loot_on_trait_remove",detail:"TunableList",line:15 },
    { id:"s16",kind:"element", name:"headline_icon",  detail:"ResourceKey", line:17 },
  ]},
];

const KIND_CFG: Record<SymbolKind,{color:string;label:string;Icon:typeof Hash}> = {
  class:      {color:T.violet,  label:"Class",    Icon:Braces},
  element:    {color:T.cyan,    label:"Element",  Icon:Tag},
  attribute:  {color:T.amber,   label:"Attr",     Icon:AlignLeft},
  "string-key":{color:T.emerald,label:"Ref",      Icon:Hash},
  function:   {color:T.rose,    label:"Fn",       Icon:Code2},
  constant:   {color:T.textMuted,label:"Const",   Icon:Zap},
};

/* ── Flatten for search ── */
function flatten(syms: Symbol[]): Symbol[] {
  return syms.flatMap(s=>[s,...flatten(s.children??[])]);
}

/* ── Symbol row ── */
function SymRow({ sym, depth, expanded, onToggle, onSelect }: {
  sym: Symbol; depth: number; expanded: Set<string>; onToggle:(id:string)=>void; onSelect:(s:Symbol)=>void;
}) {
  const cfg = KIND_CFG[sym.kind];
  const Icon = cfg.Icon;
  const hasChildren = (sym.children?.length ?? 0) > 0;
  const isOpen = expanded.has(sym.id);
  return (
    <>
      <div className="flex items-center gap-1 px-2 py-1 rounded-md cursor-pointer group transition-all"
        style={{paddingLeft: 8+depth*14}}
        onMouseEnter={e=>{e.currentTarget.style.background=T.bgHover;}}
        onMouseLeave={e=>{e.currentTarget.style.background="transparent";}}
        onClick={()=>{ if(hasChildren) onToggle(sym.id); onSelect(sym); }}>
        {hasChildren ? (
          <span className="flex-shrink-0" style={{color:T.textDim}}>
            {isOpen?<ChevronDown size={10}/>:<ChevronRight size={10}/>}
          </span>
        ) : <span style={{width:10,display:"inline-block"}}/>}
        <Icon size={10} color={cfg.color} className="flex-shrink-0"/>
        <span className="flex-1 truncate" style={{fontSize:11,fontFamily:T.mono,color:T.textSecondary,marginLeft:4}}>{sym.name}</span>
        {sym.detail&&<span className="truncate opacity-0 group-hover:opacity-100 transition-opacity" style={{fontSize:9,color:T.textDim,maxWidth:80}}>{sym.detail}</span>}
        <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-1" style={{fontSize:8,fontFamily:T.mono,color:T.textDim}}>:{sym.line}</span>
      </div>
      {isOpen && sym.children?.map(c=>(
        <SymRow key={c.id} sym={c} depth={depth+1} expanded={expanded} onToggle={onToggle} onSelect={onSelect}/>
      ))}
    </>
  );
}

/* ── Main ── */
export function SymbolOutline({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [search, setSearch]     = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["s01","s06","s10"]));
  const [activeFile, setActiveFile] = useState("trait_Evil.xml");

  const FILES = ["trait_Evil.xml","buff_EvilGlee.xml","interaction_Hug.xml","skill_Mischief.xml"];

  const allSymbols = flatten(SYMBOLS);
  const searchResults = useMemo(()=>{
    if(!search) return [];
    const q=search.toLowerCase();
    return allSymbols.filter(s=>s.name.toLowerCase().includes(q)||(s.detail??'').toLowerCase().includes(q));
  },[search]);

  const toggle = (id:string)=>setExpanded(prev=>{const n=new Set(prev);if(n.has(id))n.delete(id);else n.add(id);return n;});
  const select = (s:Symbol)=>toast.success(`Navigate to line ${s.line}`,{description:`${activeFile}:${s.line}`});

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-[200] flex items-center justify-center"
          initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
          style={{background:"rgba(0,0,0,0.78)",backdropFilter:"blur(10px)"}}
          onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
          <motion.div initial={{opacity:0,x:40}} animate={{opacity:1,x:0}} exit={{opacity:0,x:40}}
            transition={{duration:0.22,ease:[0.16,1,0.3,1]}}
            className="relative flex flex-col rounded-2xl overflow-hidden ml-auto mr-6"
            style={{width:"min(360px,90vw)",height:"min(680px,90vh)",background:T.bgElevated,border:`1px solid ${T.border}`,boxShadow:`-20px 0 60px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,255,255,0.04)`}}>

            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{background:`linear-gradient(90deg,transparent 10%,${T.violet}80,transparent 90%)`}}/>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{borderBottom:`1px solid ${T.border}`}}>
              <div className="flex items-center gap-2">
                <List size={14} color={T.violet}/>
                <span style={{fontSize:13,fontWeight:700,color:T.textPrimary,fontFamily:T.display}}>Symbol Outline</span>
              </div>
              <button onClick={onClose} className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all"><X size={12} color={T.textMuted}/></button>
            </div>

            {/* File selector */}
            <div className="px-3 py-2 flex-shrink-0 overflow-x-auto" style={{borderBottom:`1px solid ${T.borderSubtle}`,scrollbarWidth:"none"}}>
              <div className="flex items-center gap-1">
                {FILES.map(f=>(
                  <button key={f} onClick={()=>setActiveFile(f)}
                    className="flex items-center gap-1 px-2 py-1 rounded-md flex-shrink-0 transition-all"
                    style={{fontSize:9,fontFamily:T.mono,fontWeight:activeFile===f?700:400,color:activeFile===f?T.cyan:T.textMuted,background:activeFile===f?T.cyanDim:"transparent"}}>
                    <FileCode size={9}/>{f}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="px-3 py-2 flex-shrink-0">
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg" style={{background:T.bgInput,border:`1px solid ${T.borderSubtle}`}}>
                <Search size={11} color={T.textMuted}/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search symbols…"
                  className="bg-transparent outline-none flex-1" style={{fontSize:11,color:T.textSecondary}}/>
                {search&&<button onClick={()=>setSearch("")}><X size={9} color={T.textMuted}/></button>}
              </div>
            </div>

            {/* Kind legend */}
            <div className="flex items-center gap-2 px-3 pb-2 flex-shrink-0 flex-wrap">
              {(Object.entries(KIND_CFG) as [SymbolKind,typeof KIND_CFG.class][]).map(([k,c])=>(
                <div key={k} className="flex items-center gap-1">
                  <c.Icon size={9} color={c.color}/>
                  <span style={{fontSize:8,color:T.textDim}}>{c.label}</span>
                </div>
              ))}
            </div>

            {/* Symbol tree */}
            <div className="flex-1 overflow-y-auto px-1">
              {search ? (
                searchResults.length===0?(
                  <div className="flex items-center justify-center py-12">
                    <span style={{fontSize:11,color:T.textMuted}}>No symbols match "{search}"</span>
                  </div>
                ):(
                  <div>
                    {searchResults.map(s=>{
                      const cfg=KIND_CFG[s.kind]; const Icon=cfg.Icon;
                      return (
                        <div key={s.id} className="flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer transition-all"
                          onMouseEnter={e=>{e.currentTarget.style.background=T.bgHover;}}
                          onMouseLeave={e=>{e.currentTarget.style.background="transparent";}}
                          onClick={()=>select(s)}>
                          <Icon size={11} color={cfg.color}/>
                          <span style={{fontSize:11,fontFamily:T.mono,color:T.textSecondary,flex:1}}>{s.name}</span>
                          <span style={{fontSize:8,fontFamily:T.mono,color:T.textDim}}>:{s.line}</span>
                        </div>
                      );
                    })}
                  </div>
                )
              ):(
                SYMBOLS.map(s=>(
                  <SymRow key={s.id} sym={s} depth={0} expanded={expanded} onToggle={toggle} onSelect={select}/>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 flex-shrink-0 flex items-center gap-2" style={{borderTop:`1px solid ${T.borderSubtle}`,background:"rgba(0,0,0,0.1)"}}>
              <span style={{fontSize:9,fontFamily:T.mono,color:T.textDim}}>{allSymbols.length} symbols</span>
              <div className="flex-1"/>
              <button onClick={()=>{const all=new Set(allSymbols.map(s=>s.id));setExpanded(all);}} className="px-2 py-0.5 rounded text-xs hover:bg-white/5 transition-all" style={{fontSize:9,color:T.textMuted}}>Expand all</button>
              <button onClick={()=>setExpanded(new Set())} className="px-2 py-0.5 rounded hover:bg-white/5 transition-all" style={{fontSize:9,color:T.textMuted}}>Collapse</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SymbolOutline;

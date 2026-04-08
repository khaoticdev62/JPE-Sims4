/* ─────────────────────────────────────────────────────────────
   JPE Studio — Build Profile Manager (Phase 18)
   Named build configurations: Debug, Release, Distribution.
   Per-profile flags, output paths, signing, and activation.
   ───────────────────────────────────────────────────────────── */
import { useState } from "react";
import {
  X, Rocket, Play, Plus, Copy, Trash2, Check,
  RefreshCw, Settings, Zap, Shield, Package,
  FolderOpen, ChevronRight, AlertTriangle, Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "./jpe-motion";
import { T } from "../pages/jpe-theme";
import { toast } from "sonner";

/* ── Types ── */
interface BuildProfile {
  id: string;
  name: string;
  color: string;
  outputDir: string;
  optimize: boolean;
  minifyStbl: boolean;
  includeTests: boolean;
  signPackage: boolean;
  verboseLog: boolean;
  stripDebugInfo: boolean;
  targetGameVersion: string;
  buildArgs: string;
  isActive: boolean;
}

const INITIAL_PROFILES: BuildProfile[] = [
  { id:"debug",   name:"Debug",        color:T.amber,  outputDir:"dist/debug",        optimize:false, minifyStbl:false, includeTests:true,  signPackage:false, verboseLog:true,  stripDebugInfo:false, targetGameVersion:"1.107.x", buildArgs:"--debug --no-opt",                     isActive:false },
  { id:"release", name:"Release",      color:T.emerald,outputDir:"dist/release",      optimize:true,  minifyStbl:true,  includeTests:false, signPackage:false, verboseLog:false, stripDebugInfo:true,  targetGameVersion:"1.107.x", buildArgs:"--release",                           isActive:true  },
  { id:"dist",    name:"Distribution", color:T.violet, outputDir:"dist/distribution", optimize:true,  minifyStbl:true,  includeTests:false, signPackage:true,  verboseLog:false, stripDebugInfo:true,  targetGameVersion:"1.107.x", buildArgs:"--release --sign --package-manifest", isActive:false },
];

interface ToggleRowProps { label:string; desc:string; value:boolean; onChange:(v:boolean)=>void; warning?:boolean; }
function ToggleRow({ label, desc, value, onChange, warning }: ToggleRowProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all"
      style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${T.borderSubtle}`}}>
      <div className="flex-1">
        <div className="flex items-center gap-1.5">
          <span style={{fontSize:12,color:T.textSecondary}}>{label}</span>
          {warning&&<AlertTriangle size={10} color={T.amber}/>}
        </div>
        <span style={{fontSize:10,color:T.textDim}}>{desc}</span>
      </div>
      <button onClick={()=>onChange(!value)}
        className="w-8 h-4 rounded-full relative transition-all flex-shrink-0"
        style={{background:value?T.emerald:"rgba(255,255,255,0.08)"}}>
        <div className="absolute top-0.5 rounded-full transition-all"
          style={{width:12,height:12,background:"white",left:value?14:2,boxShadow:"0 1px 3px rgba(0,0,0,0.4)"}}/>
      </button>
    </div>
  );
}

export function BuildProfileManager({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [profiles, setProfiles] = useState<BuildProfile[]>(INITIAL_PROFILES);
  const [selectedId, setSelectedId] = useState("release");
  const [building, setBuilding]     = useState(false);
  const [buildDone, setBuildDone]   = useState(false);

  const selected = profiles.find(p => p.id === selectedId)!;
  const update = (patch: Partial<BuildProfile>) => setProfiles(prev => prev.map(p => p.id === selectedId ? { ...p, ...patch } : p));
  const activate = (id: string) => { setProfiles(prev => prev.map(p => ({ ...p, isActive: p.id === id }))); toast.success(`Active profile: ${profiles.find(p=>p.id===id)?.name}`); };

  const runBuild = async () => {
    setBuilding(true); setBuildDone(false);
    await new Promise(r => setTimeout(r, 1600 + Math.random() * 600));
    setBuilding(false); setBuildDone(true);
    toast.success(`${selected.name} build complete`, { description: `${selected.outputDir}/Evil_Trait_Override.package` });
    setTimeout(() => setBuildDone(false), 3000);
  };

  const duplicate = () => {
    const copy: BuildProfile = { ...selected, id: `profile_${Date.now()}`, name: `${selected.name} Copy`, isActive: false };
    setProfiles(prev => [...prev, copy]);
    setSelectedId(copy.id);
    toast.success("Profile duplicated");
  };

  const deleteProfile = (id: string) => {
    if (profiles.length <= 1) { toast.error("Cannot delete the last profile"); return; }
    setProfiles(prev => prev.filter(p => p.id !== id));
    if (selectedId === id) setSelectedId(profiles.find(p => p.id !== id)!.id);
    toast.success("Profile deleted");
  };

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
            className="relative flex rounded-2xl overflow-hidden"
            style={{width:"min(900px,97vw)",height:"min(660px,90vh)",background:T.bgElevated,border:`1px solid ${T.border}`,boxShadow:`0 40px 80px rgba(0,0,0,0.7),inset 0 1px 0 rgba(255,255,255,0.04)`}}>

            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{background:`linear-gradient(90deg,transparent 5%,${T.amber}80,${T.rose}80,transparent 95%)`}}/>

            {/* Left: profile list */}
            <div className="flex flex-col flex-shrink-0 overflow-hidden" style={{width:220,borderRight:`1px solid ${T.border}`,background:T.bgPanel}}>
              <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{borderBottom:`1px solid ${T.border}`}}>
                <div className="flex items-center gap-2">
                  <Rocket size={14} color={T.amber}/>
                  <span style={{fontSize:13,fontWeight:700,color:T.textPrimary,fontFamily:T.display}}>Profiles</span>
                </div>
                <button onClick={()=>toast.info("New profile",{description:"Duplicate an existing profile to customize"})} className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all">
                  <Plus size={12} color={T.textMuted}/>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {profiles.map(p=>{
                  const active = selectedId === p.id;
                  return (
                    <div key={p.id}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer group transition-all"
                      style={{background:active?T.bgActive:"transparent",borderLeft:`3px solid ${active?p.color:"transparent"}`}}
                      onMouseEnter={e=>{if(!active)e.currentTarget.style.background=T.bgHover;}}
                      onMouseLeave={e=>{e.currentTarget.style.background=active?T.bgActive:"transparent";}}
                      onClick={()=>setSelectedId(p.id)}>
                      <Rocket size={13} color={active?p.color:T.textMuted}/>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span style={{fontSize:12,fontWeight:active?700:400,color:active?T.textPrimary:T.textSecondary}}>{p.name}</span>
                          {p.isActive && <span className="px-1 py-0 rounded" style={{fontSize:7,fontWeight:800,color:p.color,background:`${p.color}15`}}>ACTIVE</span>}
                        </div>
                        <span style={{fontSize:9,fontFamily:T.mono,color:T.textDim}}>{p.outputDir}</span>
                      </div>
                      <button onClick={e=>{e.stopPropagation();deleteProfile(p.id);}}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-white/10">
                        <Trash2 size={9} color={T.rose}/>
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="p-2 flex-shrink-0" style={{borderTop:`1px solid ${T.borderSubtle}`}}>
                <button onClick={duplicate} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-white/5"
                  style={{fontSize:10,color:T.textMuted}}>
                  <Copy size={10}/> Duplicate "{selected.name}"
                </button>
              </div>
            </div>

            {/* Right: settings */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-3.5 flex-shrink-0" style={{borderBottom:`1px solid ${T.border}`}}>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:`${selected.color}15`}}>
                    <Rocket size={14} color={selected.color}/>
                  </div>
                  <div>
                    <div style={{fontSize:14,fontWeight:700,color:T.textPrimary}}>{selected.name}</div>
                    {selected.isActive && <div style={{fontSize:9,color:selected.color,fontWeight:700,letterSpacing:"0.06em"}}>CURRENTLY ACTIVE</div>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!selected.isActive && (
                    <button onClick={()=>activate(selected.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
                      style={{fontSize:11,color:T.textSecondary,background:"rgba(255,255,255,0.03)",border:`1px solid ${T.borderSubtle}`}}>
                      <Check size={11}/> Set Active
                    </button>
                  )}
                  <button onClick={runBuild} disabled={building}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition-all disabled:opacity-50"
                    style={{fontSize:11,fontWeight:700,color:"#fff",background:`linear-gradient(135deg,${selected.color}CC,${T.amber}CC)`}}>
                    {building?<><RefreshCw size={11} className="animate-spin"/>Building…</>:buildDone?<><Check size={11}/>Built!</>:<><Play size={11}/>Build</>}
                  </button>
                  <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all" style={{border:`1px solid ${T.borderSubtle}`}}>
                    <X size={14} color={T.textMuted}/>
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Output */}
                <section className="space-y-3">
                  <div style={{fontSize:10,fontWeight:700,color:T.textMuted,letterSpacing:"0.07em"}}>OUTPUT</div>
                  <div>
                    <label style={{fontSize:9,fontWeight:700,color:T.textMuted,display:"block",marginBottom:4}}>OUTPUT DIRECTORY</label>
                    <div className="flex items-center gap-2">
                      <input value={selected.outputDir} onChange={e=>update({outputDir:e.target.value})} className="flex-1 px-3 py-2 rounded-lg outline-none"
                        style={{fontSize:12,fontFamily:T.mono,color:T.textPrimary,background:T.bgInput,border:`1px solid ${T.borderSubtle}`}}/>
                      <button onClick={()=>toast.info("Browse for output directory")} className="p-2 rounded-lg hover:bg-white/5 transition-all" style={{border:`1px solid ${T.borderSubtle}`}}>
                        <FolderOpen size={13} color={T.textMuted}/>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={{fontSize:9,fontWeight:700,color:T.textMuted,display:"block",marginBottom:4}}>TARGET GAME VERSION</label>
                    <input value={selected.targetGameVersion} onChange={e=>update({targetGameVersion:e.target.value})} className="w-48 px-3 py-2 rounded-lg outline-none"
                      style={{fontSize:12,fontFamily:T.mono,color:T.textPrimary,background:T.bgInput,border:`1px solid ${T.borderSubtle}`}}/>
                  </div>
                </section>

                {/* Flags */}
                <section className="space-y-2">
                  <div style={{fontSize:10,fontWeight:700,color:T.textMuted,letterSpacing:"0.07em"}}>BUILD FLAGS</div>
                  <ToggleRow label="Optimize output"    desc="Enable STBL and XML compression passes"  value={selected.optimize}        onChange={v=>update({optimize:v})}/>
                  <ToggleRow label="Minify STBL"         desc="Remove whitespace from string tables"   value={selected.minifyStbl}      onChange={v=>update({minifyStbl:v})}/>
                  <ToggleRow label="Include test data"   desc="Bundle test fixtures in the package"    value={selected.includeTests}    onChange={v=>update({includeTests:v})} warning/>
                  <ToggleRow label="Sign package"        desc="Attach code signature to .package"      value={selected.signPackage}     onChange={v=>update({signPackage:v})}/>
                  <ToggleRow label="Verbose logging"     desc="Write detailed build log to console"    value={selected.verboseLog}      onChange={v=>update({verboseLog:v})}/>
                  <ToggleRow label="Strip debug info"    desc="Remove debug tuning nodes from output"  value={selected.stripDebugInfo}  onChange={v=>update({stripDebugInfo:v})}/>
                </section>

                {/* Build args */}
                <section className="space-y-2">
                  <div style={{fontSize:10,fontWeight:700,color:T.textMuted,letterSpacing:"0.07em"}}>ADDITIONAL BUILD ARGS</div>
                  <input value={selected.buildArgs} onChange={e=>update({buildArgs:e.target.value})} className="w-full px-3 py-2 rounded-lg outline-none"
                    style={{fontSize:11,fontFamily:T.mono,color:T.textSecondary,background:T.bgInput,border:`1px solid ${T.borderSubtle}`}}/>
                  <span style={{fontSize:9,color:T.textDim}}>These are passed directly to the jpebuild CLI.</span>
                </section>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default BuildProfileManager;

/* ─────────────────────────────────────────────────────────────
   JPE Studio — Live Preview (Phase 21)
   Simulated in-game effect visualizer. Choose a preview frame
   (CAS Trait card, buff moodlet, career level, interaction pie)
   and see live updates as tuning values change.
   ───────────────────────────────────────────────────────────── */
import { useState, useEffect, useRef } from "react";
import {
  X, Play, Pause, RefreshCw, Monitor, Maximize2, Minimize2,
  Star, Smile, Briefcase, Users, Zap, ChevronDown, ChevronUp,
  Circle, Activity, SlidersHorizontal, Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "./jpe-motion";
import { T } from "../pages/jpe-theme";
import { toast } from "sonner";

/* ── Frame types ── */
type FrameId = "trait-card" | "moodlet" | "career-level" | "interaction-pie" | "aspiration";

interface Frame {
  id: FrameId;
  label: string;
  icon: typeof Star;
  color: string;
}

const FRAMES: Frame[] = [
  { id:"trait-card",       label:"CAS Trait Card",   icon:Star,      color:T.violet  },
  { id:"moodlet",          label:"Buff Moodlet",      icon:Smile,     color:T.amber   },
  { id:"career-level",     label:"Career Level",      icon:Briefcase, color:T.cyan    },
  { id:"interaction-pie",  label:"Interaction Pie",   icon:Users,     color:T.emerald },
  { id:"aspiration",       label:"Aspiration Panel",  icon:Zap,       color:T.rose    },
];

/* ── Tunable sliders per frame ── */
interface Slider { key: string; label: string; min: number; max: number; value: number; unit?: string; }

const FRAME_SLIDERS: Record<FrameId, Slider[]> = {
  "trait-card": [
    { key:"trait_weight",   label:"Conflict Weight", min:0,  max:100, value:20 },
    { key:"whim_weight",    label:"Whim Weight",     min:0,  max:100, value:50 },
  ],
  "moodlet": [
    { key:"mood_weight",    label:"Mood Weight",     min:1,  max:6,   value:3  },
    { key:"duration",       label:"Duration (hrs)",  min:1,  max:24,  value:4, unit:"h" },
    { key:"decay_rate",     label:"Decay Rate",      min:0,  max:10,  value:2  },
  ],
  "career-level": [
    { key:"daily_task_pct", label:"Task Req (%)",    min:0,  max:100, value:60, unit:"%" },
    { key:"pay_per_hr",     label:"Pay / Hr (§)",    min:10, max:500, value:88, unit:"§" },
    { key:"hours_per_day",  label:"Hours / Day",     min:2,  max:12,  value:8, unit:"h" },
  ],
  "interaction-pie": [
    { key:"score_mult",     label:"Score Mult",      min:0,  max:4,   value:1  },
    { key:"autonomy",       label:"Autonomy Wt",     min:0,  max:100, value:40 },
  ],
  "aspiration": [
    { key:"milestone_pct",  label:"Milestone %",     min:0,  max:100, value:25, unit:"%" },
    { key:"reward_pts",     label:"Reward Pts",      min:0,  max:500, value:200 },
  ],
};

/* ── Simulated game frames ── */
function TraitCard({ sliders }: { sliders: Slider[] }) {
  const weight = sliders[0]?.value ?? 20;
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-48 rounded-2xl overflow-hidden" style={{background:"linear-gradient(160deg,#1a0a2e,#0d1b2a)",border:"1px solid rgba(139,92,246,0.3)",boxShadow:"0 8px 32px rgba(139,92,246,0.2)"}}>
        <div className="h-24 flex items-center justify-center" style={{background:"linear-gradient(135deg,rgba(139,92,246,0.3),rgba(99,179,237,0.1))"}}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{background:"rgba(139,92,246,0.3)",border:"2px solid rgba(139,92,246,0.5)"}}>
            <Star size={28} color="#A78BFA" fill="rgba(167,139,250,0.3)"/>
          </div>
        </div>
        <div className="p-3 space-y-1">
          <div style={{fontSize:14,fontWeight:800,color:"#E2E8F0",textAlign:"center"}}>Evil</div>
          <div style={{fontSize:9,color:"#718096",textAlign:"center",lineHeight:1.4}}>Your Sim delights in the misfortune of others</div>
          <div className="flex items-center justify-between mt-2 pt-2" style={{borderTop:"1px solid rgba(255,255,255,0.05)"}}>
            <span style={{fontSize:8,color:"#4A5568"}}>Conflict Wt</span>
            <span style={{fontSize:9,fontWeight:700,color:"#A78BFA"}}>{weight}</span>
          </div>
        </div>
      </div>
      <div className="flex gap-1">
        {["Grumpy","Mean","Lazy"].map(t=>(
          <span key={t} className="px-2 py-0.5 rounded-full" style={{fontSize:8,color:T.rose,background:T.roseDim,border:`1px solid ${T.rose}20`}}>{t}</span>
        ))}
      </div>
    </div>
  );
}

function MoodletFrame({ sliders }: { sliders: Slider[] }) {
  const weight = sliders[0]?.value ?? 3;
  const hrs    = sliders[1]?.value ?? 4;
  const MOODLETS = [
    { label:"Happy",     color:"#F6E05E", bg:"rgba(246,224,94,0.15)",  icon:"😊" },
    { label:"Evil Glee", color:"#A78BFA", bg:"rgba(167,139,250,0.15)", icon:"😈" },
    { label:"Inspired",  color:"#63B3ED", bg:"rgba(99,179,237,0.15)",  icon:"✨" },
  ];
  return (
    <div className="space-y-2 w-64">
      {MOODLETS.map((m,i)=>(
        <div key={m.label} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{background:m.bg,border:`1px solid ${m.color}25`}}>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{background:m.bg,fontSize:18}}>{m.icon}</div>
          <div className="flex-1">
            <div style={{fontSize:12,fontWeight:700,color:m.color}}>{m.label}</div>
            <div style={{fontSize:9,color:T.textMuted}}>
              {i===1?`Wt: ${weight} · ${hrs}h remaining`:i===0?"Wt: 1 · Permanent":"Wt: 2 · 2h remaining"}
            </div>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            {Array.from({length:Math.min(i===1?weight:i===0?1:2,5)}).map((_,j)=>(
              <div key={j} className="w-1 h-1 rounded-full" style={{background:m.color}}/>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function CareerLevelFrame({ sliders }: { sliders: Slider[] }) {
  const pay  = sliders[1]?.value ?? 88;
  const hrs  = sliders[2]?.value ?? 8;
  const pct  = sliders[0]?.value ?? 60;
  return (
    <div className="w-64 rounded-xl overflow-hidden" style={{background:"linear-gradient(160deg,#0a1628,#0f1e38)",border:"1px solid rgba(99,179,237,0.2)",boxShadow:"0 8px 24px rgba(99,179,237,0.1)"}}>
      <div className="px-4 py-3 flex items-center gap-2" style={{borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
        <Briefcase size={14} color={T.cyan}/>
        <span style={{fontSize:11,fontWeight:700,color:T.textPrimary}}>Villain · Level 5</span>
        <span className="ml-auto px-2 py-0.5 rounded" style={{fontSize:8,color:T.amber,background:T.amberDim}}>MON–FRI</span>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span style={{fontSize:10,color:T.textMuted}}>Pay</span>
          <span style={{fontSize:14,fontWeight:800,fontFamily:T.mono,color:T.cyan}}>§{pay}/hr</span>
        </div>
        <div className="flex items-center justify-between">
          <span style={{fontSize:10,color:T.textMuted}}>Hours</span>
          <span style={{fontSize:11,fontFamily:T.mono,color:T.textSecondary}}>{hrs}:00 AM → {(hrs+8)%24}:00 PM</span>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span style={{fontSize:9,color:T.textMuted}}>Daily Task</span>
            <span style={{fontSize:9,fontFamily:T.mono,color:T.emerald}}>{pct}% req.</span>
          </div>
          <div className="rounded-full overflow-hidden" style={{height:4,background:"rgba(255,255,255,0.06)"}}>
            <motion.div className="h-full rounded-full" style={{background:`linear-gradient(90deg,${T.cyan},${T.emerald})`}}
              animate={{width:`${pct}%`}} transition={{duration:0.4}}/>
          </div>
        </div>
        <div className="flex gap-1 flex-wrap">
          {["Mischief 3+","Charisma 5+"].map(s=>(
            <span key={s} className="px-2 py-0.5 rounded" style={{fontSize:8,color:T.violet,background:T.violetDim}}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function InteractionPieFrame({ sliders }: { sliders: Slider[] }) {
  const options = [
    { label:"Be Evil",       color:T.rose   },
    { label:"Scheme…",       color:T.violet },
    { label:"Boast",         color:T.amber  },
    { label:"Intimidate",    color:T.rose   },
    { label:"Backstab",      color:T.cyan   },
    { label:"Cancel",        color:T.textMuted },
  ];
  return (
    <div className="relative w-56 h-56">
      <div className="absolute inset-0 rounded-full" style={{background:"rgba(0,0,0,0.85)",border:"1px solid rgba(255,255,255,0.06)",boxShadow:"0 16px 48px rgba(0,0,0,0.6)"}}>
        {options.map((opt,i)=>{
          const angle = (i/options.length)*360;
          const rad   = (angle-90)*(Math.PI/180);
          const r     = 75;
          const x     = 112+r*Math.cos(rad);
          const y     = 112+r*Math.sin(rad);
          return (
            <div key={opt.label} className="absolute flex items-center justify-center" style={{left:x-32,top:y-12,width:64}}>
              <div className="px-2 py-1 rounded-lg text-center" style={{fontSize:8,fontWeight:700,color:opt.color,background:`${opt.color}15`,border:`1px solid ${opt.color}25`,whiteSpace:"nowrap"}}>
                {opt.label}
              </div>
            </div>
          );
        })}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{background:"rgba(0,0,0,0.8)",border:"1px solid rgba(255,255,255,0.1)"}}>
            <Users size={16} color={T.textMuted}/>
          </div>
        </div>
      </div>
    </div>
  );
}

function AspirationFrame({ sliders }: { sliders: Slider[] }) {
  const pct = sliders[0]?.value ?? 25;
  const pts = sliders[1]?.value ?? 200;
  const milestones = [
    { label:"Be mean 5×",         done:true  },
    { label:"Ruin 3 friendships", done:true  },
    { label:"Max Mischief skill", done:false },
    { label:"Be enemy of 10",     done:false },
  ];
  return (
    <div className="w-64 rounded-xl overflow-hidden" style={{background:"linear-gradient(160deg,#1a0a1a,#200d2a)",border:"1px solid rgba(252,129,129,0.2)"}}>
      <div className="px-4 py-3" style={{background:"rgba(252,129,129,0.06)",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
        <div style={{fontSize:12,fontWeight:700,color:T.rose}}>Public Enemy</div>
        <div style={{fontSize:9,color:T.textMuted,marginTop:1}}>Aspiration · {Math.round(pct)}% complete</div>
        <div className="mt-2 rounded-full overflow-hidden" style={{height:4,background:"rgba(255,255,255,0.06)"}}>
          <motion.div className="h-full rounded-full" style={{background:`linear-gradient(90deg,${T.rose},${T.amber})`}}
            animate={{width:`${pct}%`}} transition={{duration:0.5}}/>
        </div>
      </div>
      <div className="p-3 space-y-1.5">
        {milestones.map(m=>(
          <div key={m.label} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0" style={{background:m.done?T.emerald:"transparent",border:`1px solid ${m.done?T.emerald:T.borderSubtle}`}}>
              {m.done&&<span style={{fontSize:8,color:"#fff"}}>✓</span>}
            </div>
            <span style={{fontSize:10,color:m.done?T.textMuted:T.textSecondary,textDecoration:m.done?"line-through":"none"}}>{m.label}</span>
          </div>
        ))}
      </div>
      <div className="px-4 py-2 flex items-center justify-between" style={{borderTop:"1px solid rgba(255,255,255,0.04)"}}>
        <span style={{fontSize:9,color:T.textMuted}}>Reward</span>
        <span style={{fontSize:11,fontWeight:700,color:T.amber}}>§{pts} + Villain trait</span>
      </div>
    </div>
  );
}

/* ── Main ── */
export function LivePreview({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [activeFrame, setActiveFrame] = useState<FrameId>("trait-card");
  const [hotReload, setHotReload]     = useState(true);
  const [sliders, setSliders]         = useState<Record<FrameId, Slider[]>>({ ...FRAME_SLIDERS });
  const [pulse, setPulse]             = useState(false);
  const [zoom, setZoom]               = useState(1);

  // Simulate hot-reload flash when sliders change
  const triggerPulse = () => { setPulse(true); setTimeout(()=>setPulse(false),400); };
  const updateSlider = (frameId: FrameId, key: string, val: number) => {
    setSliders(prev => ({ ...prev, [frameId]: prev[frameId].map(s => s.key===key ? {...s,value:val} : s) }));
    if (hotReload) triggerPulse();
  };

  const frame = FRAMES.find(f => f.id === activeFrame)!;
  const frameSliders = sliders[activeFrame];

  const FrameComponent = {
    "trait-card":      TraitCard,
    "moodlet":         MoodletFrame,
    "career-level":    CareerLevelFrame,
    "interaction-pie": InteractionPieFrame,
    "aspiration":      AspirationFrame,
  }[activeFrame];

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
            style={{width:"min(920px,97vw)",height:"min(660px,90vh)",background:T.bgElevated,border:`1px solid ${T.border}`,boxShadow:`0 40px 80px rgba(0,0,0,0.7),inset 0 1px 0 rgba(255,255,255,0.04)`}}>

            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{background:`linear-gradient(90deg,transparent 5%,${T.violet}80,${T.cyan}80,transparent 95%)`}}/>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 flex-shrink-0" style={{borderBottom:`1px solid ${T.border}`}}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:`linear-gradient(135deg,${T.violet}20,${T.cyan}20)`,border:`1px solid ${T.borderSubtle}`}}>
                  <Monitor size={16} color={T.violet}/>
                </div>
                <div>
                  <div style={{fontSize:15,fontWeight:700,color:T.textPrimary,fontFamily:T.display}}>Live Preview</div>
                  <div style={{fontSize:10,color:T.textMuted,fontFamily:T.mono}}>Simulated in-game UI · trait_Evil.xml</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Hot reload toggle */}
                <button onClick={()=>setHotReload(p=>!p)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
                  style={{fontSize:10,fontWeight:hotReload?700:400,color:hotReload?T.emerald:T.textMuted,background:hotReload?T.emeraldDim:"rgba(255,255,255,0.02)",border:`1px solid ${hotReload?`${T.emerald}30`:T.borderSubtle}`}}>
                  <Activity size={11} className={hotReload?"animate-pulse":""}/> Live
                </button>
                {/* Zoom */}
                <div className="flex items-center gap-0 rounded-lg overflow-hidden" style={{border:`1px solid ${T.borderSubtle}`}}>
                  {[0.75,1,1.25,1.5].map(z=>(
                    <button key={z} onClick={()=>setZoom(z)} className="px-2.5 py-1.5 transition-all"
                      style={{fontSize:9,fontFamily:T.mono,fontWeight:zoom===z?700:400,color:zoom===z?T.cyan:T.textMuted,background:zoom===z?T.bgActive:"transparent"}}>
                      {z===1?"1×":`${z}×`}
                    </button>
                  ))}
                </div>
                <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all" style={{border:`1px solid ${T.borderSubtle}`}}>
                  <X size={14} color={T.textMuted}/>
                </button>
              </div>
            </div>

            <div className="flex flex-1 min-h-0 overflow-hidden">
              {/* Frame selector sidebar */}
              <div className="flex-shrink-0 p-2 space-y-1" style={{width:160,borderRight:`1px solid ${T.border}`,background:T.bgPanel}}>
                <div style={{fontSize:8,fontWeight:700,color:T.textMuted,letterSpacing:"0.06em",padding:"4px 8px"}}>FRAMES</div>
                {FRAMES.map(f=>{
                  const Icon=f.icon; const active=activeFrame===f.id;
                  return (
                    <button key={f.id} onClick={()=>setActiveFrame(f.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all"
                      style={{background:active?`${f.color}10`:"transparent",borderLeft:`2px solid ${active?f.color:"transparent"}`}}
                      onMouseEnter={e=>{if(!active)e.currentTarget.style.background=T.bgHover;}}
                      onMouseLeave={e=>{e.currentTarget.style.background=active?`${f.color}10`:"transparent";}}>
                      <Icon size={12} color={active?f.color:T.textMuted}/>
                      <span style={{fontSize:10,fontWeight:active?700:400,color:active?T.textPrimary:T.textMuted}}>{f.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Preview canvas */}
              <div className="flex-1 flex items-center justify-center relative overflow-hidden"
                style={{background:`radial-gradient(ellipse 60% 60% at 50% 50%, ${frame.color}06 0%, ${T.bgDeep} 80%)`}}>
                {/* Grid */}
                <div className="absolute inset-0 pointer-events-none" style={{backgroundImage:`linear-gradient(${T.borderSubtle} 1px,transparent 1px),linear-gradient(90deg,${T.borderSubtle} 1px,transparent 1px)`,backgroundSize:"24px 24px",opacity:0.5}}/>
                <motion.div animate={{scale:zoom}} transition={{duration:0.2}}>
                  <motion.div
                    animate={{opacity:pulse?0.4:1,scale:pulse?0.98:1}}
                    transition={{duration:0.15}}>
                    <FrameComponent sliders={frameSliders}/>
                  </motion.div>
                </motion.div>
                {/* Frame label */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full" style={{background:"rgba(0,0,0,0.6)",border:`1px solid ${T.borderSubtle}`}}>
                  <span style={{fontSize:9,color:T.textMuted,fontFamily:T.mono}}>{frame.label} · {Math.round(zoom*100)}%</span>
                </div>
                {hotReload && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full" style={{background:T.emeraldDim,border:`1px solid ${T.emerald}20`}}>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
                    <span style={{fontSize:8,color:T.emerald}}>LIVE</span>
                  </div>
                )}
              </div>

              {/* Controls panel */}
              <div className="flex-shrink-0 p-4 space-y-4 overflow-y-auto" style={{width:220,borderLeft:`1px solid ${T.border}`,background:"rgba(0,0,0,0.08)"}}>
                <div style={{fontSize:9,fontWeight:700,color:T.textMuted,letterSpacing:"0.06em"}}>TUNABLES</div>
                {frameSliders.map(s=>(
                  <div key={s.key} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label style={{fontSize:10,color:T.textSecondary}}>{s.label}</label>
                      <span style={{fontSize:10,fontWeight:700,fontFamily:T.mono,color:frame.color}}>{s.value}{s.unit??""}</span>
                    </div>
                    <input type="range" min={s.min} max={s.max} value={s.value}
                      onChange={e=>updateSlider(activeFrame, s.key, Number(e.target.value))}
                      className="w-full h-1 rounded-full outline-none appearance-none cursor-pointer"
                      style={{accentColor:frame.color}}/>
                    <div className="flex items-center justify-between">
                      <span style={{fontSize:8,color:T.textDim,fontFamily:T.mono}}>{s.min}</span>
                      <span style={{fontSize:8,color:T.textDim,fontFamily:T.mono}}>{s.max}</span>
                    </div>
                  </div>
                ))}
                <div className="pt-2">
                  <button onClick={()=>{ setSliders({...FRAME_SLIDERS}); toast.success("Sliders reset to defaults"); }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all hover:bg-white/5"
                    style={{fontSize:10,color:T.textMuted,border:`1px solid ${T.borderSubtle}`}}>
                    <RefreshCw size={10}/> Reset Defaults
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default LivePreview;

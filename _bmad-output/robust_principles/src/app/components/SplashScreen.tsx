/* ─────────────────────────────────────────────────────────────
   JPE Studio — Splash Screen (Phase 20)
   Animated boot sequence with version display, loading steps,
   tip of the day, and recent project quick-open. Auto-dismisses
   after 3 seconds; click anywhere to dismiss immediately.
   ───────────────────────────────────────────────────────────── */
import { useEffect, useState } from "react";
import { Code2, FileText, ChevronRight, Zap, X, Clock } from "lucide-react";
import { motion, AnimatePresence } from "./jpe-motion";
import { T } from "../pages/jpe-theme";

/* ── Tips ── */
const TIPS = [
  "Press Ctrl+Shift+T to open the String Table Manager and compute FNV-32a hashes instantly.",
  "Use Ctrl+Shift+V to run the Mod Validator and catch XML tuning errors before publishing.",
  "Ctrl+/ opens the full keyboard shortcuts overlay — every action has a key.",
  "Workspace Profiles (Ctrl+Shift+W) save and restore your entire panel layout.",
  "The Translation Memory (Ctrl+Shift+N) automatically suggests re-usable translations.",
  "Hold Ctrl and click any string key in the editor to jump to its STBL definition.",
  "The Mod Template Wizard scaffolds a complete trait, career, or aspiration in seconds.",
  "Drag the panel dividers to resize the editor, explorer, and inspector simultaneously.",
  "The Performance HUD (Ctrl+Shift+M) monitors memory, CPU, and render frame rate live.",
  "Right-click any file in the explorer to rename, duplicate, or move it instantly.",
];

const RECENT_PROJECTS = [
  { name:"Evil_Trait_Override",   path:"~/Sims4Mods/EvilTrait/",   modified:"today"       },
  { name:"VillainCareer_v2",      path:"~/Sims4Mods/VillainCareer/",modified:"2 days ago"  },
  { name:"HauntedLot_Expansion",  path:"~/Sims4Mods/HauntedLot/",  modified:"1 week ago"  },
  { name:"MischiefSkill_Overhaul",path:"~/Sims4Mods/Mischief/",    modified:"2 weeks ago" },
];

const LOAD_STEPS = [
  "Initializing workspace…",
  "Loading project index…",
  "Parsing STBL databases…",
  "Resolving dependency graph…",
  "Applying workspace profile…",
  "Ready.",
];

interface SplashScreenProps {
  onDismiss: () => void;
}

export function SplashScreen({ onDismiss }: SplashScreenProps) {
  const [step, setStep]       = useState(0);
  const [tip]                 = useState(()=>TIPS[Math.floor(Math.random()*TIPS.length)]);
  const [countdown, setCountdown] = useState(3);

  useEffect(()=>{
    // Step through loading messages
    let i = 0;
    const stepTimer = setInterval(()=>{ i++; setStep(s=>Math.min(s+1,LOAD_STEPS.length-1)); if(i>=LOAD_STEPS.length-1) clearInterval(stepTimer); }, 400);
    // Countdown timer
    const countTimer = setInterval(()=>setCountdown(c=>{if(c<=1){clearInterval(countTimer);return 0;}return c-1;}),1000);
    const dismissTimer = setTimeout(onDismiss, 3200);
    return ()=>{ clearInterval(stepTimer); clearInterval(countTimer); clearTimeout(dismissTimer); };
  },[onDismiss]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9000] flex items-center justify-center cursor-pointer"
        initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0,scale:1.02}} transition={{duration:0.3}}
        style={{background:`radial-gradient(ellipse 80% 60% at 50% 50%, rgba(99,179,237,0.06) 0%, ${T.bg} 70%)`}}
        onClick={onDismiss}>

        {/* Grid background */}
        <div className="absolute inset-0 pointer-events-none" style={{backgroundImage:`linear-gradient(${T.borderSubtle} 1px, transparent 1px), linear-gradient(90deg, ${T.borderSubtle} 1px, transparent 1px)`,backgroundSize:"40px 40px",opacity:0.3}}/>

        {/* Dismiss hint */}
        <div className="absolute top-4 right-4 flex items-center gap-2" style={{color:T.textDim,fontSize:10}}>
          <X size={11}/> click to skip · {countdown}s
        </div>

        <div className="relative flex flex-col items-center gap-8 max-w-lg w-full px-6" onClick={e=>e.stopPropagation()}>
          {/* Logo */}
          <motion.div initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}} transition={{duration:0.5,ease:[0.16,1,0.3,1]}}>
            <div className="relative">
              <motion.div
                animate={{opacity:[0.4,0.7,0.4]}} transition={{duration:3,repeat:Infinity}}
                className="absolute inset-0 rounded-3xl blur-xl"
                style={{background:`radial-gradient(circle, ${T.cyan}40 0%, transparent 70%)`,transform:"scale(1.4)"}}/>
              <div className="w-24 h-24 rounded-3xl flex items-center justify-center relative"
                style={{background:`linear-gradient(135deg, ${T.bgSurface}, ${T.bgPanel})`,border:`1px solid ${T.borderSubtle}`,boxShadow:`0 0 40px ${T.cyan}20, inset 0 1px 0 rgba(255,255,255,0.06)`}}>
                <Code2 size={40} color={T.cyan} strokeWidth={1.5}/>
              </div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.2,duration:0.4}}
            className="text-center space-y-1">
            <div style={{fontSize:32,fontWeight:900,color:T.textPrimary,fontFamily:T.display,letterSpacing:"-0.02em"}}>
              JPE Studio
            </div>
            <div style={{fontSize:11,color:T.cyan,fontFamily:T.mono,letterSpacing:"0.12em"}}>
              SIMS 4 MOD DEVELOPMENT ENVIRONMENT
            </div>
            <div style={{fontSize:10,color:T.textDim,fontFamily:T.mono}}>v4.2.0 · Phase 20 Complete</div>
          </motion.div>

          {/* Loading steps */}
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.3}}
            className="w-full space-y-1.5">
            {LOAD_STEPS.map((s,i)=>(
              <motion.div key={s} initial={{opacity:0,x:-8}} animate={{opacity:i<=step?1:0,x:i<=step?0:-8}} transition={{duration:0.2,delay:i*0.07}}
                className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{background:i<step?T.emerald:i===step?"rgba(99,179,237,0.2)":"transparent",border:`1px solid ${i<step?T.emerald:i===step?T.cyan:T.borderSubtle}`}}>
                  {i<step?<motion.div initial={{scale:0}} animate={{scale:1}}><span style={{fontSize:8,color:"#fff"}}>✓</span></motion.div>:
                   i===step?<motion.div animate={{opacity:[1,0.3,1]}} transition={{duration:0.8,repeat:Infinity}}><div className="w-1.5 h-1.5 rounded-full" style={{background:T.cyan}}/></motion.div>:null}
                </div>
                <span style={{fontSize:11,fontFamily:T.mono,color:i<step?T.textMuted:i===step?T.textSecondary:T.textDim}}>{s}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Progress bar */}
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.4}} className="w-full">
            <div className="relative rounded-full overflow-hidden" style={{height:2,background:"rgba(255,255,255,0.05)"}}>
              <motion.div className="absolute inset-y-0 left-0 rounded-full"
                style={{background:`linear-gradient(90deg,${T.cyan},${T.emerald})`}}
                animate={{width:`${((step+1)/LOAD_STEPS.length)*100}%`}} transition={{duration:0.4}}/>
            </div>
          </motion.div>

          {/* Recent projects */}
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.5}} className="w-full space-y-2">
            <div style={{fontSize:9,fontWeight:700,color:T.textMuted,letterSpacing:"0.07em"}}>RECENT PROJECTS</div>
            <div className="grid grid-cols-2 gap-2">
              {RECENT_PROJECTS.map(p=>(
                <button key={p.name} onClick={onDismiss}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all"
                  style={{background:"rgba(255,255,255,0.025)",border:`1px solid ${T.borderSubtle}`}}
                  onMouseEnter={e=>{e.currentTarget.style.background=T.bgHover;e.currentTarget.style.borderColor=T.borderSubtle;}}
                  onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.025)";}}>
                  <FileText size={12} color={T.cyan}/>
                  <div className="flex-1 min-w-0">
                    <div className="truncate" style={{fontSize:11,color:T.textSecondary,fontFamily:T.mono}}>{p.name}</div>
                    <div style={{fontSize:9,color:T.textDim}}>{p.modified}</div>
                  </div>
                  <ChevronRight size={10} color={T.textDim}/>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Tip of the day */}
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.7}} className="w-full">
            <div className="flex items-start gap-2 px-4 py-3 rounded-xl" style={{background:`${T.cyan}06`,border:`1px solid ${T.cyan}15`}}>
              <Zap size={12} color={T.cyan} className="flex-shrink-0 mt-0.5"/>
              <div>
                <div style={{fontSize:8,fontWeight:700,color:T.cyan,letterSpacing:"0.07em",marginBottom:3}}>TIP OF THE DAY</div>
                <p style={{fontSize:11,color:T.textMuted,lineHeight:1.6}}>{tip}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default SplashScreen;

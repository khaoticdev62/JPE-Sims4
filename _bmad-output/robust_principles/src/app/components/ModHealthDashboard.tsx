/* ─────────────────────────────────────────────────────────────
   JPE Studio — Mod Health Dashboard (Phase 19)
   Composite health score across validation, coverage, deps,
   code quality, and performance — with recharts breakdowns.
   ───────────────────────────────────────────────────────────── */
import { useState } from "react";
import {
  X, Shield, CheckCircle2, AlertTriangle, XCircle,
  TrendingUp, Zap, RefreshCw, ArrowRight, Info,
} from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  LineChart, Line, ResponsiveContainer,
} from "recharts";
import { SafeChartContainer } from "./SafeChartContainer";
import { motion, AnimatePresence } from "./jpe-motion";
import { T } from "../pages/jpe-theme";
import { toast } from "sonner";

/* ── Score data ── */
const CATEGORIES = [
  { name:"Validation",  score:67, icon:Shield,       color:T.rose,    issues:5,  desc:"2 errors, 3 warnings across XML tuning files" },
  { name:"Coverage",    score:78, icon:CheckCircle2, color:T.cyan,    issues:8,  desc:"22% of strings missing in 3+ locales" },
  { name:"Dependencies",score:90, icon:Zap,          color:T.emerald, issues:1,  desc:"1 missing EA base-game tuning reference" },
  { name:"Code Quality",score:85, icon:TrendingUp,   color:T.violet,  issues:3,  desc:"3 naming convention violations" },
  { name:"Performance", score:72, icon:AlertTriangle,color:T.amber,   issues:4,  desc:"3 large files (>1 MB), 1 overloaded loot" },
];

const RADAR_DATA = CATEGORIES.map(c => ({ subject: c.name, score: c.score, fullMark: 100 }));

const TREND_DATA = [
  { session:"S1", score:54 },
  { session:"S2", score:61 },
  { session:"S3", score:68 },
  { session:"S4", score:70 },
  { session:"S5", score:72 },
  { session:"S6", score:76 },
  { session:"S7", score:78 },
];

const BAR_DATA = CATEGORIES.map(c => ({ name: c.name.slice(0,4), score: c.score, color: c.color }));

const overallScore = Math.round(CATEGORIES.reduce((s,c)=>s+c.score,0)/CATEGORIES.length);

/* ── Gauge ── */
function ScoreGauge({ score }: { score: number }) {
  const color = score>=80?T.emerald:score>=65?T.amber:T.rose;
  const angle = (score/100)*180;
  const r = 60;
  const cx = 80, cy = 80;
  const toRad = (deg:number) => (deg-180)*(Math.PI/180);
  const x1 = cx + r*Math.cos(toRad(0));
  const y1 = cy + r*Math.sin(toRad(0));
  const x2 = cx + r*Math.cos(toRad(angle));
  const y2 = cy + r*Math.sin(toRad(angle));
  const large = angle > 90 ? 1 : 0;

  return (
    <div className="flex flex-col items-center">
      <svg width={160} height={100} viewBox="0 0 160 100">
        {/* Background arc */}
        <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={10} strokeLinecap="round"/>
        {/* Score arc */}
        <motion.path
          d={`M ${cx-r} ${cy} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`}
          fill="none" stroke={color} strokeWidth={10} strokeLinecap="round"
          initial={{pathLength:0}} animate={{pathLength:score/100}} transition={{duration:1.2,ease:[0.16,1,0.3,1]}}/>
        {/* Score text */}
        <text x={cx} y={cy+10} textAnchor="middle" style={{fontSize:28,fontWeight:800,fill:color,fontFamily:T.mono}}>{score}</text>
        <text x={cx} y={cy+24} textAnchor="middle" style={{fontSize:9,fill:T.textMuted,fontFamily:T.mono}}>/ 100</text>
      </svg>
      <div style={{fontSize:12,fontWeight:700,color,marginTop:-8}}>{score>=80?"Excellent":score>=65?"Good":score>=50?"Fair":"Needs Work"}</div>
    </div>
  );
}

/* ── Custom tooltip ── */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-lg" style={{background:T.bgElevated,border:`1px solid ${T.border}`,boxShadow:"0 8px 24px rgba(0,0,0,0.4)"}}>
      <div style={{fontSize:10,fontWeight:700,color:T.textMuted}}>{label}</div>
      <div style={{fontSize:14,fontWeight:800,color:T.cyan,fontFamily:T.mono}}>{payload[0].value}</div>
    </div>
  );
}

export function ModHealthDashboard({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    setRefreshing(true);
    await new Promise(r=>setTimeout(r,1000));
    setRefreshing(false);
    toast.success("Health scores refreshed");
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
            className="relative flex flex-col rounded-2xl overflow-hidden"
            style={{width:"min(1040px,97vw)",height:"min(720px,92vh)",background:T.bgElevated,border:`1px solid ${T.border}`,boxShadow:`0 40px 80px rgba(0,0,0,0.7),inset 0 1px 0 rgba(255,255,255,0.04)`}}>

            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{background:`linear-gradient(90deg,transparent 5%,${T.emerald}80,${T.cyan}80,transparent 95%)`}}/>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 flex-shrink-0" style={{borderBottom:`1px solid ${T.border}`}}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:`linear-gradient(135deg,${T.emerald}20,${T.cyan}20)`,border:`1px solid ${T.borderSubtle}`}}>
                  <Shield size={16} color={T.emerald}/>
                </div>
                <div>
                  <div style={{fontSize:15,fontWeight:700,color:T.textPrimary,fontFamily:T.display}}>Mod Health Dashboard</div>
                  <div style={{fontSize:10,color:T.textMuted,fontFamily:T.mono}}>Evil_Trait_Override.package · last scan: today 14:32</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={refresh} disabled={refreshing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                  style={{fontSize:11,color:T.textSecondary,background:"rgba(255,255,255,0.03)",border:`1px solid ${T.borderSubtle}`}}>
                  <RefreshCw size={11} className={refreshing?"animate-spin":""}/> Refresh
                </button>
                <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all" style={{border:`1px solid ${T.borderSubtle}`}}>
                  <X size={14} color={T.textMuted}/>
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
              {/* Top row: gauge + radar + trend */}
              <div className="grid grid-cols-3 gap-4">
                {/* Overall gauge */}
                <div className="flex flex-col items-center justify-center p-6 rounded-2xl" style={{background:T.bgSurface,border:`1px solid ${T.border}`}}>
                  <div style={{fontSize:9,fontWeight:700,color:T.textMuted,letterSpacing:"0.07em",marginBottom:8}}>OVERALL HEALTH</div>
                  <ScoreGauge score={overallScore}/>
                  <div style={{fontSize:10,color:T.textMuted,marginTop:8,textAlign:"center"}}>
                    {CATEGORIES.reduce((s,c)=>s+c.issues,0)} issues across 5 dimensions
                  </div>
                </div>

                {/* Radar chart */}
                <div className="rounded-2xl overflow-hidden p-4" style={{background:T.bgSurface,border:`1px solid ${T.border}`}}>
                  <div style={{fontSize:9,fontWeight:700,color:T.textMuted,letterSpacing:"0.07em",marginBottom:8}}>DIMENSION SCORES</div>
                  <div style={{height:200}}>
                    <SafeChartContainer className="w-full h-full">
                      <RadarChart data={RADAR_DATA} margin={{top:10,right:20,bottom:10,left:20}}>
                        <PolarGrid stroke={T.borderSubtle}/>
                        <PolarAngleAxis dataKey="subject" tick={{fontSize:8,fill:T.textMuted,fontFamily:T.mono}}/>
                        <Radar name="Score" dataKey="score" stroke={T.cyan} fill={T.cyan} fillOpacity={0.12}/>
                      </RadarChart>
                    </SafeChartContainer>
                  </div>
                </div>

                {/* Trend line */}
                <div className="rounded-2xl overflow-hidden p-4" style={{background:T.bgSurface,border:`1px solid ${T.border}`}}>
                  <div style={{fontSize:9,fontWeight:700,color:T.textMuted,letterSpacing:"0.07em",marginBottom:8}}>HEALTH TREND (7 SESSIONS)</div>
                  <div style={{height:200}}>
                    <SafeChartContainer className="w-full h-full">
                      <LineChart data={TREND_DATA} margin={{top:8,right:8,bottom:8,left:8}}>
                        <XAxis dataKey="session" tick={{fontSize:8,fill:T.textMuted}} axisLine={false} tickLine={false}/>
                        <YAxis domain={[40,100]} tick={{fontSize:8,fill:T.textMuted}} axisLine={false} tickLine={false}/>
                        <Tooltip content={<CustomTooltip/>}/>
                        <Line type="monotone" dataKey="score" stroke={T.emerald} strokeWidth={2} dot={{r:3,fill:T.emerald}} activeDot={{r:5}}/>
                      </LineChart>
                    </SafeChartContainer>
                  </div>
                </div>
              </div>

              {/* Category bar chart */}
              <div className="rounded-2xl overflow-hidden p-5" style={{background:T.bgSurface,border:`1px solid ${T.border}`}}>
                <div className="flex items-center justify-between mb-4">
                  <div style={{fontSize:9,fontWeight:700,color:T.textMuted,letterSpacing:"0.07em"}}>CATEGORY BREAKDOWN</div>
                </div>
                <div style={{height:100}}>
                  <SafeChartContainer className="w-full h-full">
                    <BarChart data={BAR_DATA} margin={{top:4,right:8,bottom:4,left:8}} barCategoryGap="30%">
                      <XAxis dataKey="name" tick={{fontSize:9,fill:T.textMuted}} axisLine={false} tickLine={false}/>
                      <YAxis domain={[0,100]} tick={{fontSize:8,fill:T.textMuted}} axisLine={false} tickLine={false}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Bar dataKey="score" radius={[4,4,0,0]}>
                        {BAR_DATA.map((entry,i)=><Cell key={`cell-${i}`} fill={entry.color}/>)}
                      </Bar>
                    </BarChart>
                  </SafeChartContainer>
                </div>
              </div>

              {/* Category cards */}
              <div className="grid grid-cols-5 gap-3">
                {CATEGORIES.map(cat=>{
                  const Icon=cat.icon;
                  const scoreColor = cat.score>=80?T.emerald:cat.score>=65?T.amber:T.rose;
                  return (
                    <div key={cat.name} className="rounded-xl p-4 space-y-3" style={{background:T.bgSurface,border:`1px solid ${T.border}`}}>
                      <div className="flex items-center justify-between">
                        <Icon size={14} color={cat.color}/>
                        <span style={{fontSize:16,fontWeight:800,fontFamily:T.mono,color:scoreColor}}>{cat.score}</span>
                      </div>
                      <div style={{fontSize:11,fontWeight:700,color:T.textSecondary}}>{cat.name}</div>
                      <div style={{fontSize:9,color:T.textDim,lineHeight:1.5}}>{cat.desc}</div>
                      <div className="relative rounded-full overflow-hidden" style={{height:3,background:"rgba(255,255,255,0.06)"}}>
                        <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{background:scoreColor}}
                          initial={{width:0}} animate={{width:`${cat.score}%`}} transition={{duration:0.8,delay:0.1,ease:[0.16,1,0.3,1]}}/>
                      </div>
                      {cat.issues>0&&(
                        <button onClick={()=>toast.info(`${cat.issues} issue${cat.issues!==1?"s":""} in ${cat.name}`,{description:"Open the relevant tool to fix them"})}
                          className="flex items-center gap-1 text-left w-full" style={{fontSize:9,color:scoreColor}}>
                          <AlertTriangle size={9}/>{cat.issues} issue{cat.issues!==1?"s":""} <ArrowRight size={8} className="ml-auto"/>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ModHealthDashboard;

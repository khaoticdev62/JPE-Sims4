/* ─────────────────────────────────────────────────────────────
   JPE Studio — Usage Analytics (Phase 19)
   Download trends, locale adoption, version distribution,
   and key engagement metrics — all with recharts visualizations.
   ───────────────────────────────────────────────────────────── */
import { useState } from "react";
import {
  X, TrendingUp, Globe, Users, Download, Star,
  BarChart3, RefreshCw, Calendar, ChevronDown,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend,
} from "recharts";
import { SafeChartContainer } from "./SafeChartContainer";
import { motion, AnimatePresence } from "./jpe-motion";
import { T } from "../pages/jpe-theme";
import { toast } from "sonner";

/* ── Mock data ── */
const MONTHLY_DOWNLOADS = [
  { month:"Apr",downloads:312, updates:41 },
  { month:"May",downloads:487, updates:63 },
  { month:"Jun",downloads:520, updates:78 },
  { month:"Jul",downloads:489, updates:55 },
  { month:"Aug",downloads:630, updates:92 },
  { month:"Sep",downloads:714, updates:105 },
  { month:"Oct",downloads:698, updates:88 },
  { month:"Nov",downloads:810, updates:117 },
  { month:"Dec",downloads:932, updates:134 },
  { month:"Jan",downloads:1042,updates:151 },
  { month:"Feb",downloads:1188,updates:178 },
  { month:"Mar",downloads:1304,updates:201 },
];

const LOCALE_DOWNLOADS = [
  { locale:"en-US", count:2847, pct:47 },
  { locale:"es-ES", count:1203, pct:20 },
  { locale:"fr-FR", count:612,  pct:10 },
  { locale:"de-DE", count:487,  pct:8  },
  { locale:"pt-BR", count:363,  pct:6  },
  { locale:"zh-CN", count:214,  pct:4  },
  { locale:"ko-KR", count:142,  pct:2  },
  { locale:"Other", count:168,  pct:3  },
];

const VERSION_PIE = [
  { name:"v1.0.0",value:12, color:T.textDim    },
  { name:"v1.1.0",value:18, color:T.amber      },
  { name:"v1.2.0",value:23, color:T.cyan       },
  { name:"v1.3.0",value:31, color:T.violet     },
  { name:"v1.4.0",value:16, color:T.emerald    },
];

const KPI = [
  { label:"Total Downloads", value:"6,036",  delta:"+12%",  positive:true,  icon:Download },
  { label:"Monthly Active",  value:"1,304",  delta:"+9.7%", positive:true,  icon:Users    },
  { label:"Avg Session",     value:"23 min", delta:"+3 min",positive:true,  icon:Calendar },
  { label:"5★ Ratings",     value:"4.8",    delta:"+0.1",  positive:true,  icon:Star     },
];

const LOCALE_COLORS = [T.cyan,T.violet,T.emerald,T.amber,T.rose,T.cyanBright,T.textMuted,T.textDim];

type Period = "7d" | "30d" | "90d" | "1y";

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2.5 rounded-xl" style={{background:T.bgElevated,border:`1px solid ${T.border}`,boxShadow:"0 8px 24px rgba(0,0,0,0.5)"}}>
      <div style={{fontSize:10,fontWeight:700,color:T.textMuted,marginBottom:4}}>{label}</div>
      {payload.map((p:any,i:number)=>(
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{background:p.color}}/>
          <span style={{fontSize:11,color:T.textSecondary,flex:1}}>{p.name}</span>
          <span style={{fontSize:11,fontWeight:700,fontFamily:T.mono,color:T.textPrimary}}>{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

export function UsageAnalytics({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [period, setPeriod] = useState<Period>("1y");
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    setRefreshing(true);
    await new Promise(r=>setTimeout(r,800));
    setRefreshing(false);
    toast.success("Analytics refreshed");
  };

  if (!isOpen) return null;

  const PERIODS: {id:Period;label:string}[] = [{id:"7d",label:"7 days"},{id:"30d",label:"30 days"},{id:"90d",label:"90 days"},{id:"1y",label:"1 year"}];

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
            style={{width:"min(1060px,97vw)",height:"min(740px,92vh)",background:T.bgElevated,border:`1px solid ${T.border}`,boxShadow:`0 40px 80px rgba(0,0,0,0.7),inset 0 1px 0 rgba(255,255,255,0.04)`}}>

            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{background:`linear-gradient(90deg,transparent 5%,${T.violet}80,${T.cyan}80,transparent 95%)`}}/>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 flex-shrink-0" style={{borderBottom:`1px solid ${T.border}`}}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:`linear-gradient(135deg,${T.violet}20,${T.cyan}20)`,border:`1px solid ${T.borderSubtle}`}}>
                  <BarChart3 size={16} color={T.violet}/>
                </div>
                <div>
                  <div style={{fontSize:15,fontWeight:700,color:T.textPrimary,fontFamily:T.display}}>Usage Analytics</div>
                  <div style={{fontSize:10,color:T.textMuted,fontFamily:T.mono}}>Evil_Trait_Override · ModTheSims + Curseforge · simulated</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Period selector */}
                <div className="flex items-center gap-0 rounded-lg overflow-hidden" style={{border:`1px solid ${T.borderSubtle}`}}>
                  {PERIODS.map(p=>(
                    <button key={p.id} onClick={()=>setPeriod(p.id)}
                      className="px-3 py-1.5 transition-all"
                      style={{fontSize:10,fontWeight:period===p.id?700:400,color:period===p.id?T.textPrimary:T.textMuted,background:period===p.id?T.bgActive:"transparent"}}>
                      {p.label}
                    </button>
                  ))}
                </div>
                <button onClick={refresh} disabled={refreshing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                  style={{fontSize:11,color:T.textSecondary,background:"rgba(255,255,255,0.03)",border:`1px solid ${T.borderSubtle}`}}>
                  <RefreshCw size={11} className={refreshing?"animate-spin":""}/>
                </button>
                <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all" style={{border:`1px solid ${T.borderSubtle}`}}>
                  <X size={14} color={T.textMuted}/>
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-5">
              {/* KPI row */}
              <div className="grid grid-cols-4 gap-4">
                {KPI.map(k=>{
                  const Icon=k.icon;
                  return (
                    <div key={k.label} className="p-4 rounded-xl" style={{background:T.bgSurface,border:`1px solid ${T.border}`}}>
                      <div className="flex items-center justify-between mb-2">
                        <Icon size={14} color={T.textMuted}/>
                        <span className="px-1.5 py-0.5 rounded" style={{fontSize:9,fontWeight:700,color:k.positive?T.emerald:T.rose,background:k.positive?T.emeraldDim:T.roseDim}}>{k.delta}</span>
                      </div>
                      <div style={{fontSize:22,fontWeight:800,color:T.textPrimary,fontFamily:T.mono}}>{k.value}</div>
                      <div style={{fontSize:10,color:T.textMuted}}>{k.label}</div>
                    </div>
                  );
                })}
              </div>

              {/* Downloads area chart */}
              <div className="rounded-2xl p-5 overflow-hidden" style={{background:T.bgSurface,border:`1px solid ${T.border}`}}>
                <div className="flex items-center justify-between mb-4">
                  <div style={{fontSize:10,fontWeight:700,color:T.textMuted,letterSpacing:"0.07em"}}>DOWNLOADS & UPDATES OVER TIME</div>
                  <div className="flex items-center gap-3">
                    {[{color:T.cyan,label:"Downloads"},{color:T.violet,label:"Updates"}].map(l=>(
                      <div key={l.label} className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{background:l.color}}/>
                        <span style={{fontSize:9,color:T.textMuted}}>{l.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{height:180}}>
                  <SafeChartContainer className="w-full h-full">
                    <AreaChart data={MONTHLY_DOWNLOADS} margin={{top:4,right:8,bottom:4,left:8}}>
                      <defs>
                        <linearGradient id="gradDl" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor={T.cyan}   stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={T.cyan}   stopOpacity={0.02}/>
                        </linearGradient>
                        <linearGradient id="gradUp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor={T.violet} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={T.violet} stopOpacity={0.02}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" tick={{fontSize:9,fill:T.textMuted}} axisLine={false} tickLine={false}/>
                      <YAxis tick={{fontSize:9,fill:T.textMuted}} axisLine={false} tickLine={false}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Area type="monotone" dataKey="downloads" stroke={T.cyan}   strokeWidth={2} fill="url(#gradDl)" name="Downloads"/>
                      <Area type="monotone" dataKey="updates"   stroke={T.violet} strokeWidth={2} fill="url(#gradUp)" name="Updates"/>
                    </AreaChart>
                  </SafeChartContainer>
                </div>
              </div>

              {/* Bottom row: locale + version */}
              <div className="grid grid-cols-2 gap-4">
                {/* Locale bar */}
                <div className="rounded-2xl p-5 overflow-hidden" style={{background:T.bgSurface,border:`1px solid ${T.border}`}}>
                  <div style={{fontSize:10,fontWeight:700,color:T.textMuted,letterSpacing:"0.07em",marginBottom:12}}>DOWNLOADS BY LOCALE</div>
                  <div style={{height:180}}>
                    <SafeChartContainer className="w-full h-full">
                      <BarChart data={LOCALE_DOWNLOADS} layout="vertical" margin={{top:4,right:24,bottom:4,left:4}}>
                        <XAxis type="number" tick={{fontSize:8,fill:T.textMuted}} axisLine={false} tickLine={false}/>
                        <YAxis type="category" dataKey="locale" width={44} tick={{fontSize:9,fill:T.textMuted,fontFamily:T.mono}} axisLine={false} tickLine={false}/>
                        <Tooltip content={<CustomTooltip/>}/>
                        <Bar dataKey="count" name="Downloads" radius={[0,4,4,0]}>
                          {LOCALE_DOWNLOADS.map((_,i)=><Cell key={`lc-${i}`} fill={LOCALE_COLORS[i%LOCALE_COLORS.length]}/>)}
                        </Bar>
                      </BarChart>
                    </SafeChartContainer>
                  </div>
                </div>

                {/* Version pie */}
                <div className="rounded-2xl p-5 overflow-hidden" style={{background:T.bgSurface,border:`1px solid ${T.border}`}}>
                  <div style={{fontSize:10,fontWeight:700,color:T.textMuted,letterSpacing:"0.07em",marginBottom:12}}>VERSION ADOPTION</div>
                  <div className="flex items-center gap-4">
                    <div style={{height:180,flex:1}}>
                      <SafeChartContainer className="w-full h-full">
                        <PieChart margin={{top:4,right:4,bottom:4,left:4}}>
                          <Pie data={VERSION_PIE} cx="50%" cy="50%" innerRadius="40%" outerRadius="70%" dataKey="value" paddingAngle={3}>
                            {VERSION_PIE.map((entry,i)=><Cell key={`vc-${i}`} fill={entry.color}/>)}
                          </Pie>
                          <Tooltip content={<CustomTooltip/>}/>
                        </PieChart>
                      </SafeChartContainer>
                    </div>
                    <div className="space-y-1.5 flex-shrink-0">
                      {VERSION_PIE.map(v=>(
                        <div key={v.name} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:v.color}}/>
                          <span style={{fontSize:9,fontFamily:T.mono,color:T.textMuted}}>{v.name}</span>
                          <span style={{fontSize:9,fontWeight:700,fontFamily:T.mono,color:T.textSecondary,marginLeft:"auto",paddingLeft:8}}>{v.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default UsageAnalytics;

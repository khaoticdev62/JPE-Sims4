"use client";
import * as React from "react";
import { 
  Play, Pause, RotateCcw, Terminal, 
  Activity, Database, Zap, Sparkles, 
  Settings, Save, Share2, ClipboardList
} from "lucide-react";
import { usePlaygroundStore } from "@/stores/usePlaygroundStore";
import { T } from "./robust/jpe-theme";
import { cn } from "./ui/utils";

export const JpePlaygroundView: React.FC = () => {
  const { 
    isSimulating, worldState, logs, 
    setSimulating, resetWorldState,
    addLog
  } = usePlaygroundStore();

  return (
    <div className="flex h-full bg-bgDeep text-textPrimary overflow-hidden font-sans border-t border-border/40 shadow-2xl relative">
      {/* Simulation Master Control */}
      <aside className="w-80 border-r border-border/60 bg-bgSurface/40 backdrop-blur-3xl flex flex-col z-20">
        <header className="p-6 border-b border-border/40 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald/10 border border-emerald/20 text-emerald animate-pulse">
                 <Activity className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xs font-bold tracking-widest text-white uppercase italic">Active Sim-Loop</h2>
                <div className="text-[8px] text-textTertiary font-mono uppercase tracking-tighter">Instance ID: #S4-7721</div>
              </div>
           </div>
        </header>

        {/* State Inspector */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
           <section className="space-y-4">
              <h3 className="text-[9px] font-bold text-textTertiary tracking-[0.2em] uppercase flex items-center gap-2">
                 <Database className="w-3 h-3" /> World State Snapshot
              </h3>
              <div className="space-y-3">
                 {Object.entries(worldState).map(([key, val]) => (
                    <div key={key} className="p-3 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between group hover:border-white/20 transition-all">
                       <span className="text-[10px] text-textSecondary font-mono">{key}</span>
                       <div className="flex items-center gap-3">
                          <span className="text-[10px] text-cyan font-bold">{String(val)}</span>
                          <Settings className="w-3 h-3 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity" />
                       </div>
                    </div>
                 ))}
              </div>
           </section>

           <section className="space-y-4">
              <h3 className="text-[9px] font-bold text-textTertiary tracking-[0.2em] uppercase flex items-center gap-2">
                 <Zap className="w-3 h-3" /> Event Triggers
              </h3>
              <div className="grid grid-cols-1 gap-2">
                 <TriggerButton label="sim.spawn" onClick={() => addLog('sim.spawn triggered', 'event')} color={T.emerald} />
                 <TriggerButton label="sim.death" onClick={() => addLog('sim.death triggered', 'event')} color={T.rose} />
                 <TriggerButton label="sim.mood_change" onClick={() => addLog('sim.mood_change triggered', 'event')} color={T.amber} />
                 <TriggerButton label="engine.heartbeat" onClick={() => addLog('engine.heartbeat triggered', 'event')} color={T.cyan} />
              </div>
           </section>
        </div>

        <footer className="p-6 border-t border-border/40 bg-black/20 flex gap-4">
           {!isSimulating ? (
             <button 
               onClick={() => setSimulating(true)}
               className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald/10 text-emerald border border-emerald/40 hover:bg-emerald hover:text-black font-bold text-[10px] tracking-widest uppercase transition-all shadow-xl active:scale-95"
             >
               <Play className="w-3.5 h-3.5" /> Start Cycle
             </button>
           ) : (
             <button 
               onClick={() => setSimulating(false)}
               className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-amber/10 text-amber border border-amber/40 hover:bg-amber hover:text-black font-bold text-[10px] tracking-widest uppercase transition-all shadow-xl active:scale-95"
             >
               <Pause className="w-3.5 h-3.5" /> Pause Loop
             </button>
           )}
           <button 
             onClick={resetWorldState}
             className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-textTertiary shadow-lg"
           >
              <RotateCcw className="w-4 h-4" />
           </button>
        </footer>
      </aside>

      {/* Simulation Dashboard & Console */}
      <main className="flex-1 flex flex-col relative z-10">
         <header className="h-16 px-8 flex items-center justify-between border-b border-border/40 bg-bgSurface/20 backdrop-blur-md">
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="text-[10px] font-bold text-white tracking-widest uppercase">Live Telemetry</span>
               </div>
               <div className="text-[9px] text-textTertiary font-mono opacity-50 uppercase tracking-tighter">
                  Load Average: 0.14 | Latency: 12ms
               </div>
            </div>
            <div className="flex gap-4">
               <button className="flex items-center gap-2 text-[9px] text-textTertiary hover:text-white uppercase tracking-widest font-bold transition-all"><Share2 className="w-3.5 h-3.5" /> Export Logs</button>
               <button className="flex items-center gap-2 text-[9px] text-textTertiary hover:text-white uppercase tracking-widest font-bold transition-all"><Save className="w-3.5 h-3.5" /> Save Scenario</button>
            </div>
         </header>

         {/* Spectral Viewport (Simulation Visualization) */}
         <div className="flex-1 p-8 grid grid-cols-2 gap-8 items-start overflow-y-auto bg-[radial-gradient(circle_at_center,_rgba(34,211,238,0.05)_0%,_transparent_70%)]">
            <div className="aspect-video rounded-2xl border border-border bg-bgSurface/40 overflow-hidden relative shadow-2xl group">
               <div className="absolute inset-0 bg-gradient-to-br from-cyan/10 to-transparent pointer-events-none" />
               <div className="absolute inset-0 flex items-center justify-center text-center p-12">
                  <div className="space-y-4">
                     <Sparkles className="w-12 h-12 text-cyan mx-auto opacity-30 group-hover:scale-110 transition-transform duration-700" />
                     <div>
                        <div className="text-[10px] font-bold text-white tracking-[0.3em] uppercase italic">Visual Logic Relay</div>
                        <div className="text-[9px] text-textTertiary mt-2 uppercase opacity-60">Engine Render Feed: Standby</div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="flex flex-col gap-8 h-full min-h-[400px]">
               {/* Terminal Output */}
               <div className="flex-1 rounded-2xl border border-border bg-black/60 shadow-2xl overflow-hidden flex flex-col p-1">
                  <div className="h-10 border-b border-white/5 bg-white/5 flex items-center px-4 gap-3">
                     <Terminal className="w-3.5 h-3.5 text-textTertiary" />
                     <span className="text-[9px] font-bold font-mono text-textTertiary tracking-widest uppercase">Simulation Console</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 font-mono text-[10px] space-y-1.5 scroll-smooth custom-scrollbar">
                     {logs.map((log, i) => (
                        <div key={i} className="flex gap-4 group">
                           <span className="opacity-20 text-[8px] mt-0.5">{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                           <span className={cn(
                             "flex-1 break-all",
                             log.type === 'error' ? "text-rose" : log.type === 'warn' ? "text-amber" : "text-textSecondary"
                           )}>
                              {log.message}
                           </span>
                        </div>
                     ))}
                     <div className="flex gap-4 animate-pulse">
                        <span className="opacity-20 text-[8px] mt-0.5">&gt;</span>
                        <div className="w-2.5 h-4 bg-cyan/50" />
                     </div>
                  </div>
               </div>

               {/* Metrics Overlay */}
               <div className="h-24 grid grid-cols-3 gap-4">
                  <MetricCard label="Tuning Exec" value="128" icon={ClipboardList} color={T.cyan} />
                  <MetricCard label="AST Nodes" value="4,921" icon={Zap} color={T.amber} />
                  <MetricCard label="Mem Offset" value="0xFF31" icon={Activity} color={T.emerald} />
               </div>
            </div>
         </div>
      </main>
    </div>
  );
};

const TriggerButton: React.FC<{ label: string, onClick: () => void, color: string }> = ({ label, onClick, color }) => (
  <button 
    onClick={onClick}
    className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-all group"
  >
     <span className="text-[10px] font-mono text-textSecondary uppercase tracking-tighter">{label}</span>
     <div 
      className="w-2 h-2 rounded-full transition-shadow duration-500 group-hover:shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
      style={{ backgroundColor: color }} 
     />
  </button>
);

const MetricCard: React.FC<{ label: string, value: string, icon: any, color: string }> = ({ label, value, icon: Icon, color }) => (
  <div className="rounded-xl border border-white/5 bg-white/5 p-3 flex flex-col justify-between group hover:border-white/20 transition-all">
     <div className="flex items-center justify-between opacity-50">
        <span className="text-[8px] font-bold tracking-widest uppercase">{label}</span>
        <Icon className="w-3 h-3" style={{ color }} />
     </div>
     <div className="text-xl font-bold tracking-tighter mt-1">{value}</div>
  </div>
);

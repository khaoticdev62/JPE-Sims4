"use client";
import * as React from "react";
import Editor from "@monaco-editor/react";
import {
  Gamepad2, Zap, Bug, Layout,
  Settings2, Activity, ShieldCheck, Terminal, ArrowLeft
} from "lucide-react";
import { cn } from "../ui/utils";
import { T } from "../robust/jpe-theme";
import { usePlaygroundStore } from "@/stores/usePlaygroundStore";
import { hub } from "@/services/HubService";
import { simulator } from "@/services/playground/JpeSimulator";
import { SimulationConsole } from "./SimulationConsole";
import { WorldStateInspector } from "./WorldStateInspector";
import { TriggerDeck } from "./TriggerDeck";

export const JpePlaygroundView: React.FC = () => {
  const [code, setCode] = React.useState<string>(`# JPE PLAYGROUND — REAL-TIME EMULATION
# Write reactive mod logic and fire events to test.

[WHEN sims.travel]
sim.energy = 80
sim.mood = "Happy"
LOG "Sim traveled — Refilling energy"

[WHEN interaction.start]
sim.hunger = 100
LOG "Interaction started"
`);

  const { isSimulating, setSimulating, logs } = usePlaygroundStore();
  const [activeTab, setActiveTab] = React.useState<'console' | 'world' | 'triggers'>('console');

  const handleFlash = () => {
    setSimulating(true);
    const result = simulator.loadCode(code);
    if (result.success) {
      setTimeout(() => setSimulating(false), 800);
    } else {
      setSimulating(false);
    }
  };

  return (
    <div data-testid="playground-view" className="flex-1 w-full flex flex-col h-full bg-bgDeep text-textPrimary overflow-hidden font-sans">
      {/* Top Header / Toolbar */}
      <header className="h-14 border-b border-border bg-bgSurface/60 backdrop-blur-xl flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => hub.navigate('dashboard')}
            className="p-2 hover:bg-white/5 rounded-full text-textTertiary hover:text-white transition-all mr-2"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 shadow-lg shadow-rose-500/5">
            <Gamepad2 className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-widest text-white uppercase italic">Advanced JPE Playground</h1>
            <div className="flex items-center gap-2 mt-0.5">
               <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-emerald-500/10 text-[9px] text-emerald font-bold tracking-tighter">
                  <Activity className="w-2.5 h-2.5" /> EMULATOR READY
               </div>
               <span className="text-[9px] text-textTertiary font-mono tracking-tighter opacity-50 uppercase">Phase 5.2 High-Fidelity Link</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <button 
             onClick={handleFlash}
             disabled={isSimulating}
             className={cn(
               "flex items-center gap-2 px-4 py-2 rounded-full font-bold text-[10px] tracking-widest uppercase transition-all shadow-lg",
               isSimulating 
                ? "bg-amber-500/20 text-amber-500 border border-amber-500/30 cursor-wait"
                : "bg-cyan/10 text-cyan border border-cyan/40 hover:bg-cyan hover:text-black hover:shadow-cyan/20 cursor-pointer"
             )}
           >
              {isSimulating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
              {isSimulating ? "Flashing Memory..." : "Flash Simulator"}
           </button>
           
           <div className="h-8 w-px bg-border mx-2" />
           
           <button className="text-textTertiary hover:text-white transition-colors p-2">
              <Settings2 className="w-5 h-5" />
           </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden p-0 gap-6 relative">
        {/* Background Gradients */}
        <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] bg-cyan-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] bg-rose-500/5 blur-[120px] pointer-events-none" />

        {/* Left Pane: Editor */}
        <section className="flex-1 flex flex-col bg-bgSurface/40 border border-border rounded-xl overflow-hidden backdrop-blur-md shadow-2xl group focus-within:border-cyan/30 transition-all">
           <div className="px-4 py-3 border-b border-border bg-bgSurface/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <Terminal className="w-4 h-4 text-cyan" />
                 <span className="text-[10px] font-bold tracking-widest text-textPrimary uppercase">Directive Source</span>
              </div>
              <div className="flex items-center gap-2">
                 <span className="text-[9px] text-textTertiary font-mono">INPUT.JPE</span>
              </div>
           </div>
           <div className="flex-1 pt-2">
              <Editor
                height="100%"
                defaultLanguage="ini"
                theme="vs-dark"
                value={code}
                onChange={(v) => setCode(v || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 12,
                  fontFamily: T.mono,
                  padding: { top: 10 },
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  renderLineHighlight: 'all'}}
              />
           </div>
        </section>

        {/* Right Pane: Simulator Dashboard */}
        <section className="w-[480px] flex flex-col gap-4 overflow-hidden">
           {/* Metrics Grid */}
           <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-bgSurface/40 border border-border backdrop-blur-md">
                 <div className="text-[10px] font-bold text-textTertiary tracking-widest mb-2 flex items-center gap-2">
                    <Zap className="w-3 h-3 text-amber-500" /> MATCHES
                 </div>
                 <div className="text-2xl font-bold font-mono tracking-tighter text-white">
                    {logs.filter(l => l.type === 'match').length}
                 </div>
              </div>
              <div className="p-4 rounded-xl bg-bgSurface/40 border border-border backdrop-blur-md">
                 <div className="text-[10px] font-bold text-textTertiary tracking-widest mb-2 flex items-center gap-2">
                    <Bug className="w-3 h-3 text-rose-500" /> EXCEPTIONS
                 </div>
                 <div className="text-2xl font-bold font-mono tracking-tighter text-white">
                    {logs.filter(l => l.type === 'error').length}
                 </div>
              </div>
           </div>

           {/* Dashboard Tabs & Content */}
           <div className="flex-1 flex flex-col bg-bgSurface/40 border border-border rounded-xl overflow-hidden backdrop-blur-md">
              <div className="flex border-b border-border bg-bgSurface/80 p-1 gap-1">
                 {[
                   { id: 'console', label: 'Console', icon: Terminal },
                   { id: 'triggers', label: 'Triggers', icon: Zap },
                   { id: 'world', label: 'World State', icon: Layout }
                 ].map(tab => (
                   <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id as 'console' | 'world' | 'triggers')}
                     className={cn(
                       "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all",
                       activeTab === tab.id ? "bg-cyan/10 text-cyan border border-cyan/20" : "text-textTertiary hover:bg-white/5"
                     )}
                   >
                     <tab.icon className="w-3.5 h-3.5" />
                     {tab.label}
                   </button>
                 ))}
              </div>
              
              <div className="flex-1 overflow-hidden p-3 relative">
                 {activeTab === 'console' && <SimulationConsole />}
                 {activeTab === 'triggers' && <TriggerDeck />}
                 {activeTab === 'world' && <WorldStateInspector />}
              </div>
           </div>
        </section>
      </main>

      {/* Footer / Status Bar Overlay */}
      <footer className="h-10 border-t border-border bg-bgSurface/80 backdrop-blur-xl flex items-center justify-between px-6 text-[10px] font-mono text-textTertiary">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
               <ShieldCheck className="w-4 h-4 text-emerald" />
               <span className="tracking-tighter uppercase font-bold">Spectral Shield Active</span>
            </div>
            <span className="opacity-30">|</span>
            <span>SIM_ENGINE_L1: v0.8.2-PLAYGROUND</span>
         </div>
         <div className="flex items-center gap-4">
            <span className="text-emerald">CONNECTION: SECURE_LINK</span>
            <span className="text-cyan">LATENCY: 4MS</span>
         </div>
      </footer>
    </div>
  );
};

// Internal Import helper
import { RefreshCw } from "lucide-react";

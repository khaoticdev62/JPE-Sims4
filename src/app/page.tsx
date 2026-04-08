import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  ChevronRight, 
  Cpu, 
  Terminal, 
  BookOpen, 
  ShieldAlert,
  ArrowUpRight 
} from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <div className="group p-6 rounded-2xl bg-muted/30 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
      <Icon className="w-5 h-5 text-primary" />
    </div>
    <h3 className="text-lg font-bold mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground leading-relaxed italic">{description}</p>
  </div>
);

export default function HomePage() {
  return (
    <div className="relative">
      {/* Abstract Background Decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-[radial-gradient(circle_at_center,_var(--jpe-cyan-deep)_0%,_transparent_70%)] opacity-10 pointer-events-none -z-10" />
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none -z-10" />
      <div className="absolute top-[10%] left-[10%] w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse" />
      <div className="absolute top-[20%] right-[10%] w-96 h-96 bg-jpe-secondary/20 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse" style={{ animationDelay: '2s' }} />

      <section className="container px-4 py-20 md:py-40 flex flex-col items-center text-center">
        <Badge variant="outline" className="mb-6 px-4 py-1.5 border-primary/30 bg-primary/10 text-primary flex gap-2 items-center animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
          <Sparkles className="w-3 h-3" />
          <span className="font-bold tracking-tight">v2.1 Industrial Edition</span>
        </Badge>
        
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 text-white bg-clip-text animate-in fade-in slide-in-from-bottom-8 duration-700 leading-[0.9]">
          Modding, written in <br />
          <span className="text-primary italic drop-shadow-[0_0_30px_rgba(99,102,241,0.6)]">Just Plain English.</span>
        </h1>
        
        <p className="max-w-[750px] text-lg md:text-2xl text-muted-foreground/80 mb-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 leading-relaxed">
          The high-fidelity IDE for Sims 4 creators. Bridge the gap between logic and creativity with a human-readable engine that compiles directly to tuned XML.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000">
          <Link href="/studio">
            <Button data-testid="launch-editor" size="lg" className="rounded-full px-8 gap-2 shadow-lg shadow-primary/25">
              Launch Web Editor <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/manual">
            <Button size="lg" variant="outline" className="rounded-full px-8 gap-2 border-border/50 bg-background/50 backdrop-blur">
              Read the Manual <BookOpen className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Floating Code Preview */}
        <div className="mt-20 w-full max-w-4xl relative group animate-in fade-in zoom-in duration-1000">
          <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
          <div className="relative bg-[#0f172a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden aspect-video flex flex-col items-stretch text-left">
            <div className="h-10 border-b border-white/10 bg-white/5 flex items-center px-4 gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-destructive/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
              </div>
              <div className="text-[10px] text-white/40 font-mono ml-4 uppercase tracking-widest italic">tutorial_mod.jpe</div>
            </div>
            <div className="flex-1 p-6 font-mono text-sm leading-relaxed overflow-hidden">
               <div className="flex gap-4">
                 <span className="text-white/20 select-none">1</span>
                 <p><span className="text-primary font-bold">WHEN</span> <span className="text-emerald-400">SIM_EATS</span></p>
               </div>
               <div className="flex gap-4">
                 <span className="text-white/20 select-none">2</span>
                 <p><span className="text-primary font-bold">ONLY_IF</span> <span className="text-white">SIM_HAS_TRAIT</span> <span className="text-yellow-400">"Foodie"</span></p>
               </div>
               <div className="flex gap-4">
                 <span className="text-white/20 select-none">3</span>
                 <p><span className="text-primary font-bold">DO</span> <span className="text-blue-400">ADD_BUFF</span> <span className="text-yellow-400">"CulinaryJoy"</span> <span className="text-purple-400 font-bold">Duration</span>: 240</p>
               </div>
               <div className="flex gap-4 mt-4">
                 <span className="text-white/20 select-none">4</span>
                 <p className="text-white/30 italic">// JPE translates this instantly to Sims 4 XML</p>
               </div>
            </div>
            {/* Visual feedback overlay */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 w-72 h-48 bg-jpe-surface/90 border border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-xl animate-bounce-slow">
               <div className="flex items-center gap-2 mb-3">
                 <div className="w-2 h-2 rounded-full bg-emerald-500" />
                 <span className="text-[10px] font-bold uppercase tracking-wider">Live XML Translation</span>
               </div>
               <div className="font-mono text-[9px] text-jpe-muted space-y-1 overflow-hidden">
                 <p>&lt;L n="tests"&gt;</p>
                 <p>&nbsp;&nbsp;&lt;V t="trait"&gt;</p>
                 <p>&nbsp;&nbsp;&nbsp;&nbsp;&lt;U n="whitelist"&gt;</p>
                 <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;T n="1337"&gt;Foodie&lt;/T&gt;</p>
                 <p className="animate-pulse">_</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container px-4 py-24 border-t border-border/50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={Terminal}
            title="Professional DevShell"
            description="A high-performance workspace with three-panel layout, resizable panes, and Fira Code integration."
          />
          <FeatureCard 
            icon={Cpu}
            title="Real-Time Engine"
            description="Watch your JPE syntax transform into ready-to-use Sims 4 XML as you type. No manual compiling."
          />
          <FeatureCard 
            icon={ShieldAlert}
            title="Mod Health Service"
            description="Integrated with Scarlet's Realm to track broken mods, update manifests, and parse error reports."
          />
        </div>
      </section>

      {/* Manual CTA */}
      <section className="container px-4 py-24 mb-24">
        <div className="relative rounded-3xl overflow-hidden bg-[#1e293b] p-8 md:p-16 border border-white/10 group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Master the Game Logic.</h2>
              <p className="text-muted-foreground mb-8 text-lg">Read the Just Plain Manual to unlock the full potential of modular script development, manifest patching, and industrial-grade mod building.</p>
              <Link href="/manual">
                <Button variant="default" className="gap-2 rounded-full group">
                  Open JPM <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Button>
              </Link>
            </div>
            <div className="relative flex justify-center">
               <div className="w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
               <BookOpen className="w-40 h-40 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

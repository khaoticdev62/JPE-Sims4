"use client";
import * as React from "react";
import { Sparkles, Send, Brain, Wand2, ShieldAlert, Zap, Layers } from "lucide-react";
import { useCopilotStore } from "@/stores/useCopilotStore";
import { motion, AnimatePresence } from "./jpe-motion";
import { cn } from "./ui/utils";

export const JpeCopilot: React.FC = () => {
  const { messages, isStreaming, sendMessage, clearHistory } = useCopilotStore();
  const [input, setInput] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-bgDeep text-textPrimary overflow-hidden font-sans border-l border-border/40 shadow-[-20px_0_40px_-20px_rgba(34,211,238,0.1)] relative">
      {/* Copilot Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-bgSurface/60 backdrop-blur-xl z-20">
        <div className="flex items-center gap-4">
          <div className="relative">
             <div className="absolute inset-0 bg-cyan blur-md opacity-20 animate-pulse" />
             <div className="relative p-2 rounded-lg bg-cyan/10 border border-cyan/20">
                <Brain className="w-5 h-5 text-cyan" />
             </div>
          </div>
          <div>
            <h2 className="text-xs font-bold tracking-widest text-white uppercase italic">
              Industrial Copilot
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
               <span className="w-1 h-1 rounded-full bg-emerald animate-pulse" />
               <span className="text-[9px] text-textTertiary font-mono tracking-tighter uppercase font-bold">Neural Engine v4.2 Online</span>
            </div>
          </div>
        </div>
        <button 
          onClick={clearHistory}
          className="p-2 hover:bg-white/5 rounded-lg text-textTertiary transition-colors"
          title="Clear Context"
        >
          <Layers className="w-4 h-4 opacity-50" />
        </button>
      </header>

      {/* Message Stream */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-[radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.03)_0%,_transparent_50%)]"
      >
        <AnimatePresence initial={false}>
          {messages.length === 0 && (
            <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30"
            >
               <Sparkles className="w-12 h-12 text-cyan" />
               <div className="text-[10px] font-bold tracking-widest uppercase">Initializing Cognitive Workspace...</div>
            </motion.div>
          )}
          {messages.map((msg, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "flex flex-col gap-2 max-w-[85%]",
                msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
               {/* Role Badge */}
               <div className={cn(
                 "text-[8px] font-bold tracking-[0.2em] uppercase",
                 msg.role === 'user' ? "text-textTertiary" : "text-cyan"
               )}>
                 {msg.role === 'user' ? 'Architect' : 'Industrial Core'}
               </div>
               
               {/* Message Body */}
               <div className={cn(
                 "p-4 rounded-2xl text-[11px] leading-relaxed shadow-sm border",
                 msg.role === 'user' ? 
                  "bg-white/5 border-white/5 text-textPrimary rounded-tr-none" : 
                  "bg-bgSurface/80 border-border/50 text-textSecondary rounded-tl-none backdrop-blur-md"
               )}>
                 {msg.content}
               </div>

               {/* Interaction Metadata */}
               {msg.role === 'assistant' && (
                 <div className="flex gap-4 mt-1 opacity-40">
                   <button className="hover:text-cyan transition-colors"><Zap className="w-3 h-3" /></button>
                   <button className="hover:text-amber transition-colors"><Wand2 className="w-3 h-3" /></button>
                 </div>
               )}
            </motion.div>
          ))}

          {isStreaming && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="flex items-center gap-3 italic text-[10px] text-cyan animate-pulse pl-4 font-mono font-bold"
            >
               <LoaderDots />
               Synthesizing Response...
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Module */}
      <footer className="p-6 bg-bgSurface/40 backdrop-blur-xl border-t border-border">
         <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan/20 to-violet/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
            <div className="relative flex items-center bg-bgDeep border border-border rounded-xl overflow-hidden focus-within:border-cyan/50 transition-all">
               <input 
                 type="text"
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                 placeholder="Message JPE Copilot..."
                 className="flex-1 bg-transparent px-4 py-3.5 text-xs text-textPrimary placeholder:text-textTertiary/50 focus:outline-none"
               />
               <button 
                onClick={handleSend}
                disabled={!input.trim() || isStreaming}
                className="px-4 py-3.5 text-cyan hover:bg-cyan/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
               >
                 <Send className="w-4 h-4" />
               </button>
            </div>
         </div>
         <div className="flex items-center justify-between mt-3 px-1">
            <div className="text-[8px] text-textTertiary font-bold tracking-widest uppercase flex items-center gap-1.5 opacity-50">
               <ShieldAlert className="w-2.5 h-2.5" /> Safety protocol engaged
            </div>
            <div className="text-[8px] text-textTertiary font-mono opacity-50">
               JPE-COMT v2.0
            </div>
         </div>
      </footer>
    </div>
  );
};

const LoaderDots: React.FC = () => (
  <div className="flex gap-1">
    {[0, 1, 2].map((i) => (
      <motion.span 
        key={i}
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
        className="w-1 h-1 bg-cyan rounded-full"
      />
    ))}
  </div>
);

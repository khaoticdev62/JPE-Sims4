"use client";
import * as React from "react";
import { useCopilotStore} from "@/stores/useCopilotStore";
import { useEditorStore } from "@/stores/useEditorStore";
import {
  Send, Trash2, BrainCircuit,
  ShieldCheck, HelpCircle,
  PlayCircle, Loader2
} from "lucide-react";
import { cn } from "../ui/utils";
import { motion, AnimatePresence } from "../jpe-motion";
import ReactMarkdown from "react-markdown";

export function JpeCopilotPane() {
  const { 
    messages, isStreaming, sendMessage, clearHistory, 
    performAudit, performExplanation 
  } = useCopilotStore();
  
  const { insertCodeToActiveTab } = useEditorStore();
  const [inputValue, setInputValue] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  const handleSend = async () => {
    if (!inputValue.trim() || isStreaming) return;
    const text = inputValue;
    setInputValue("");
    await sendMessage(text);
  };

  return (
    <div className="h-full flex flex-col bg-bgSurface/20 backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="p-1.5 rounded-lg bg-violet/10 border border-violet/20">
               <BrainCircuit className="w-4 h-4 text-violet" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald shadow-[0_0_8px_#10b981]" />
          </div>
          <div>
            <h2 className="text-[10px] font-black tracking-widest uppercase italic text-white leading-none">AI Copilot</h2>
            <p className="text-[8px] text-textMuted font-mono uppercase mt-0.5 tracking-tighter">Spectral v2</p>
          </div>
        </div>
        <button 
          onClick={clearHistory}
          className="p-1.5 hover:bg-white/5 rounded text-textMuted hover:text-red-400 transition-colors"
          title="Clear History"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Smart Actions */}
      <div className="px-4 py-3 flex gap-2 border-b border-border bg-black/10 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => performAudit()}
          className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan/10 border border-cyan/20 hover:bg-cyan/20 text-[9px] font-bold text-cyanBright transition-all uppercase"
        >
          <ShieldCheck className="w-2.5 h-2.5" /> Audit
        </button>
        <button 
          onClick={() => performExplanation()}
          className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet/10 border border-violet/20 hover:bg-violet/20 text-[9px] font-bold text-violet transition-all uppercase"
        >
          <HelpCircle className="w-2.5 h-2.5" /> Explain
        </button>
      </div>

      {/* Chat History */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex flex-col max-w-[95%]",
                msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              <div 
                className={cn(
                  "p-3 rounded-xl text-[12px] leading-relaxed shadow-md",
                  msg.role === "user" 
                    ? "bg-violet text-white rounded-tr-none" 
                    : "bg-bgPanel/60 backdrop-blur-md border border-white/5 text-textSecondary rounded-tl-none"
                )}
              >
                <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/5">
                  <ReactMarkdown 
                    components={{
                      code({_node, inline, className, children, ...props}: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        const isJpe = match?.[1] === 'jpe';
                        
                        if (!inline && isJpe) {
                          return (
                            <div className="relative group/code my-2">
                              <pre className="p-3 rounded-lg bg-black/60 border border-emerald/20 text-emerald-400 font-mono text-[10px] overflow-x-auto">
                                {String(children).replace(/\n$/, '')}
                              </pre>
                              <button 
                                onClick={() => insertCodeToActiveTab(String(children))}
                                className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-emerald/10 border border-emerald/20 opacity-0 group-hover/code:opacity-100 transition-opacity text-[8px] font-bold text-emerald uppercase flex items-center gap-1 hover:bg-emerald hover:text-black"
                              >
                                <PlayCircle className="w-2.5 h-2.5" /> Inject
                              </button>
                            </div>
                          );
                        }
                        return <code className={className} {...props}>{children}</code>;
                      }
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
              <span className="text-[8px] text-textMuted uppercase tracking-tighter mt-1 font-mono px-1 opacity-60">
                {msg.role === "user" ? "USER" : "AI"} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </motion.div>
          ))}
          {isStreaming && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-2 bg-white/5 rounded-lg w-fit"
            >
              <Loader2 className="w-3 h-3 text-violet animate-spin" />
              <span className="text-[10px] text-textMuted italic">Analyzing...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-black/20">
        <div className="relative group">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Logic intent..."
            className="w-full bg-black/40 border border-border rounded-lg py-2 pl-3 pr-10 text-[11px] font-medium focus:outline-none focus:border-violet/50 transition-all placeholder:text-textTertiary resize-none h-10 custom-scrollbar"
            rows={1}
          />
          <button 
            disabled={!inputValue.trim() || isStreaming}
            onClick={handleSend}
            className="absolute right-1 top-1 p-1.5 rounded-md bg-violet/10 hover:bg-violet text-violet hover:text-white disabled:opacity-30 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

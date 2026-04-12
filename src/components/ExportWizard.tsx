import { useState, useMemo } from "react";
import {
  X, Check, ChevronRight, ChevronLeft,
  Settings, Layers, Globe, Sparkles,
  ShieldCheck, AlertCircle, FileText, Share2, Rocket
} from "lucide-react";
import { motion, AnimatePresence } from "./jpe-motion";
import { T } from "./robust/jpe-theme";
import { toast } from "sonner";
import { useProjectStore } from "@/stores/useProjectStore";
import { JpeBundlerService } from "@/services/JpeBundlerService";
import { FileService } from "@/services/FileService";

type ExportStep = "config" | "resources" | "summary" | "publish";

export function ExportWizard({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { currentProject } = useProjectStore();
  const [step, setStep] = useState<ExportStep>("config");
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildResult, setBuildResult] = useState<any>(null);

  // Metadata State
  const [meta, setMeta] = useState({
    name: currentProject?.name ?? "My Mod",
    author: "JPE User",
    version: "1.0.0",
    description: "Exported from JPE Studio 2.1",
    tags: ["Translation", "JPE"],
  });

  // Resource Selection
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  useMemo(() => {
    if (currentProject && selectedFiles.size === 0) {
      const allIds = currentProject.files.map(f => f.id);
      setSelectedFiles(new Set(allIds));
    }
  }, [currentProject, selectedFiles.size]);

  const handleBuild = async () => {
    if (!currentProject) return;
    setIsBuilding(true);
    setBuildResult(null);

    try {
      // 1. Prepare sub-project with only selected files
      const filteredFiles = currentProject.files.filter(f => selectedFiles.has(f.id));
      const buildProject = { ...currentProject, files: filteredFiles, name: meta.name };

      // 2. Run Bundler
      const result = await JpeBundlerService.buildProject(buildProject);
      setBuildResult(result);

      if (result.success && result.packageBuffer) {
        // 3. Prompt Save (Desktop/Simulation)
        const suggestedName = `${meta.name.replace(/\s+/g, '_')}_v${meta.version}.package`;
        const savePath = await FileService.saveFile(suggestedName);
        
        if (savePath) {
          await FileService.writeFileBuffer(savePath, result.packageBuffer);
          toast.success("Production package saved successfully!");
        }
        setStep("publish");
      } else {
        toast.error("Build failed. Check logs in summary.");
        setStep("summary");
      }
    } catch (err) {
      toast.error("Critical build error");
      console.error(err);
    } finally {
      setIsBuilding(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-[720px] h-[540px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
          style={{ background: T.bgGlass, backgroundImage: T.noiseSvg }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" 
                style={{ background: `linear-gradient(135deg, ${T.cyan}20, ${T.violet}20)`, border: `1px solid ${T.cyan}30` }}>
                <Rocket size={18} color={T.cyan} />
              </div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: T.textPrimary, fontFamily: T.display }}>Production Export Wizard</h2>
                <p style={{ fontSize: 11, color: T.textMuted }}>Compile and package your mod for distribution</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
              <X size={20} color={T.textMuted} />
            </button>
          </div>

          {/* Stepper */}
          <div className="flex items-center gap-0 px-8 py-4 border-b border-white/5">
            {[
              { id: "config", label: "Metadata", icon: Settings },
              { id: "resources", label: "Resources", icon: Layers },
              { id: "publish", label: "Publish", icon: Globe },
              { id: "summary", label: "Build & Export", icon: Share2 },
            ].map((s, idx) => (
              <div key={s.id} className="flex items-center">
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full transition-all"
                  style={{ background: step === s.id ? `${T.cyan}15` : "transparent", color: step === s.id ? T.cyan : T.textMuted }}>
                  <s.icon size={12} />
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.05em" }}>{s.label.toUpperCase()}</span>
                </div>
                {idx < 2 && <div className="w-8 h-[1px] bg-white/5 mx-2" />}
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 p-8 overflow-y-auto" style={{ height: "calc(100% - 160px)" }}>
            <AnimatePresence mode="wait">
              {step === "config" && (
                <motion.div key="config" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label style={{ fontSize: 9, fontWeight: 700, color: T.textMuted }}>MOD NAME</label>
                      <input value={meta.name} onChange={e => setMeta({...meta, name: e.target.value})}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-cyan-500/50 transition-colors"
                        style={{ fontSize: 13, color: T.textPrimary }} />
                    </div>
                    <div className="space-y-2">
                      <label style={{ fontSize: 9, fontWeight: 700, color: T.textMuted }}>VERSION</label>
                      <input value={meta.version} onChange={e => setMeta({...meta, version: e.target.value})}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 outline-none"
                        style={{ fontSize: 13, color: T.textPrimary, fontFamily: T.mono }} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label style={{ fontSize: 9, fontWeight: 700, color: T.textMuted }}>AUTHOR</label>
                    <input value={meta.author} onChange={e => setMeta({...meta, author: e.target.value})}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 outline-none"
                      style={{ fontSize: 13, color: T.textPrimary }} />
                  </div>
                  <div className="p-4 rounded-2xl bg-cyan-700/5 border border-cyan-500/10 flex items-start gap-3">
                    <Sparkles size={16} color={T.cyan} className="mt-0.5" />
                    <div>
                      <p style={{ fontSize: 12, color: T.textSecondary, fontWeight: 500 }}>Smart Metadata</p>
                      <p style={{ fontSize: 11, color: T.textMuted }}>These details will be embedded in `mod-metadata.json` for vault automated sorting.</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === "resources" && (
                <motion.div key="resources" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: 11, color: T.textSecondary }}>Project currently contains {currentProject?.files.length} buildable resources.</span>
                    <button onClick={() => setSelectedFiles(new Set(currentProject?.files.map(f => f.id)))} style={{ fontSize: 10, color: T.cyan, fontWeight: 600 }}>Select All</button>
                  </div>
                  <div className="space-y-2 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
                    {currentProject?.files.map(file => (
                      <div key={file.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-colors cursor-pointer"
                        onClick={() => {
                          const next = new Set(selectedFiles);
                          if (next.has(file.id)) next.delete(file.id);
                          else next.add(file.id);
                          setSelectedFiles(next);
                        }}>
                        <div className="w-5 h-5 rounded border border-white/10 flex items-center justify-center transition-colors"
                          style={{ background: selectedFiles.has(file.id) ? T.cyan : "transparent", borderColor: selectedFiles.has(file.id) ? T.cyan : "rgba(255,255,255,0.1)" }}>
                          {selectedFiles.has(file.id) && <Check size={12} color={T.bg} strokeWidth={4} />}
                        </div>
                        <FileText size={14} color={file.type === 'stbl' ? T.emerald : T.cyan} />
                        <span style={{ fontSize: 12, color: T.textPrimary, flex: 1 }}>{file.name}</span>
                        <span style={{ fontSize: 10, color: T.textMuted, opacity: 0 }} className="group-hover:opacity-100 uppercase tracking-tighter">{file.type}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === "publish" && (
                <motion.div key="publish" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="flex flex-col items-center text-center space-y-4 py-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-violet-500/10 border border-violet-500/20">
                      <Globe size={24} color={T.violet} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: T.textPrimary }}>TS4Rebels Vault Integration</h3>
                      <p style={{ fontSize: 11, color: T.textMuted }}>Donate your translation to the community repository.</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-violet-900/10 border border-violet-500/20 space-y-3">
                    <div className="flex items-center gap-3">
                      <ShieldCheck size={16} color={T.violet} />
                      <span style={{ fontSize: 13, color: T.textSecondary, fontWeight: 600 }}>Vault Protection Active</span>
                    </div>
                    <p style={{ fontSize: 11, color: T.textMuted }}>
                      JPE Studio will automatically verify your credentials and package integrity before starting the upload.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-white/5 bg-white/5 space-y-1">
                      <span style={{ fontSize: 9, color: T.textMuted, fontWeight: 700 }}>DISTRIBUTION</span>
                      <span style={{ fontSize: 14, color: T.textPrimary, display: "block" }}>Public (Vault)</span>
                    </div>
                    <div className="p-4 rounded-xl border border-white/5 bg-white/5 space-y-1">
                      <span style={{ fontSize: 9, color: T.textMuted, fontWeight: 700 }}>LOCALE COUNT</span>
                      <span style={{ fontSize: 14, color: T.textPrimary, display: "block" }}>{meta.locales?.length || 1} Locales</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === "summary" && (
                <motion.div key="summary" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  {buildResult?.success ? (
                    <div className="text-center space-y-4 py-8">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto">
                        <ShieldCheck size={32} color={T.emerald} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: 20, color: T.textPrimary, fontWeight: 700 }}>Mod Built Successfully</h3>
                        <p style={{ fontSize: 12, color: T.textMuted }}>{buildResult.logs.length} build operations completed in {buildResult.duration}ms</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                       <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3">
                         <AlertCircle size={18} color={T.rose} />
                         <span style={{ fontSize: 13, color: T.rose, fontWeight: 700 }}>Build Failed</span>
                       </div>
                       <div className="bg-black/40 rounded-xl p-4 h-48 overflow-y-auto font-mono text-[10px] space-y-1">
                         {buildResult?.logs.map((log: any, i: number) => (
                           <div key={i} style={{ color: log.level === 'error' ? T.rose : log.level === 'warn' ? T.amber : T.textSecondary }}>
                             [{new Date(log.timestamp).toLocaleTimeString()}] {log.message}
                           </div>
                         ))}
                       </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-8 border-t border-white/5 flex items-center justify-between">
            <button 
              onClick={() => {
                if (step === "publish") setStep("resources");
                else if (step === "summary") setStep("publish");
                else if (step === "resources") setStep("config");
                else setStep("config");
              }}
              disabled={step === "config" || isBuilding}
              className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:bg-white/5 opacity-50 hover:opacity-100 disabled:opacity-0"
            >
              <ChevronLeft size={16} /> <span style={{ fontSize: 12, fontWeight: 600 }}>Back</span>
            </button>

            {step !== "summary" ? (
              <button 
                onClick={() => {
                  if (step === "config") setStep("resources");
                  else if (step === "resources") handleBuild();
                  else if (step === "publish") setStep("summary");
                }}
                disabled={isBuilding}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all shadow-lg active:scale-95 disabled:scale-100"
                style={{ background: `linear-gradient(135deg, ${T.cyan}, ${T.blue})`, color: T.bg, fontWeight: 800, fontSize: 13, opacity: isBuilding ? 0.7 : 1 }}
              >
                {isBuilding ? (
                  <>Building...</>
                ) : (
                  <>
                    {step === "config" ? "Next Strategy" : "Finalize & Build"} 
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
            ) : (
              <button 
                onClick={onClose}
                className="px-8 py-2.5 rounded-xl hover:bg-white/10 transition-all"
                style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary, border: `1px solid ${T.border}` }}
              >
                Close Wizard
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

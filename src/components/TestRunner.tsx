"use client";

/* ─────────────────────────────────────────────────────────────
   JPE Studio — Test Runner (Phase 23)
   Automated test suite mapped from the Mod Validator's rule
   engine. Pass / fail / skip counts, coverage bars, suite
   grouping, individual test results, and export report.
   ───────────────────────────────────────────────────────────── */
import { useState, useCallback, useMemo } from "react";
import {
  X, Play, RefreshCw, CheckCircle2, XCircle, AlertTriangle,
  Minus, ChevronDown, ChevronRight, Download,
  Zap, Shield, FileCode, FileText, Package, Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "./jpe-motion";
import { T } from "./robust/jpe-theme";
import { toast } from "sonner";

/* ── Types ── */
type TestResult = "pass" | "fail" | "skip" | "pending";
type SuiteId = "xml" | "stbl" | "resources" | "deps" | "best-practices";

interface TestCase {
  id: string;
  suite: SuiteId;
  name: string;
  desc: string;
  result: TestResult;
  duration?: number;
  detail?: string;
  line?: number;
  file?: string;
}

/* ── Suite config ── */
const SUITE_CFG: Record<SuiteId,{label:string;color:string;icon:typeof Shield}> = {
  xml:            { label:"XML Tuning",    color:T.cyan,    icon:FileCode  },
  stbl:           { label:"STBL Strings",  color:T.violet,  icon:FileText  },
  resources:      { label:"Resources",     color:T.amber,   icon:Package   },
  deps:           { label:"Dependencies",  color:T.emerald, icon:Layers    },
  "best-practices":{ label:"Best Practices",color:T.rose,   icon:Zap       },
};

/* ── Test cases (mirror Mod Validator rules) ── */
const INITIAL_TESTS: TestCase[] = [
  // XML
  { id:"t01",suite:"xml",     name:"XML well-formed",        desc:"All XML files are parseable",                result:"pending",file:"trait_Evil.xml" },
  { id:"t02",suite:"xml",     name:"Root element valid",      desc:"Root is TunableSimData with n and s attrs", result:"pending",file:"trait_Evil.xml" },
  { id:"t03",suite:"xml",     name:"No duplicate n attrs",    desc:"No sibling tunables share the same n",      result:"pending",file:"buff_EvilGlee.xml" },
  { id:"t04",suite:"xml",     name:"Tunable types match",     desc:"All t= values exist in known type registry",result:"pending",file:"interaction_Hug.xml" },
  { id:"t05",suite:"xml",     name:"Enum values valid",       desc:"All ev= values exist in enum definitions",  result:"pending",file:"trait_Evil.xml" },
  // STBL
  { id:"t06",suite:"stbl",    name:"STBL magic bytes",        desc:"All .stbl files start with 0x4D4E4D4E",    result:"pending",file:"strings_en-US.stbl" },
  { id:"t07",suite:"stbl",    name:"Hash uniqueness",         desc:"No two strings share the same FNV hash",   result:"pending",file:"strings_en-US.stbl" },
  { id:"t08",suite:"stbl",    name:"Locale completeness",     desc:"All keys present in en-US appear in es-ES",result:"pending",file:"strings_es-ES.stbl" },
  { id:"t09",suite:"stbl",    name:"Empty string check",      desc:"No string entry has empty value",          result:"pending",file:"strings_fr-FR.stbl" },
  // Resources
  { id:"t10",suite:"resources",name:"Resource key format",    desc:"All resource keys are valid TYPE:GRP:INST",  result:"pending",file:"catalog_EvilTrait.xml" },
  { id:"t11",suite:"resources",name:"Thumbnail resolution",   desc:"All DDS thumbnails are 256×256",           result:"pending",file:"thumbnail_trait_Evil.dds" },
  { id:"t12",suite:"resources",name:"No orphan resources",    desc:"Every resource key is referenced in tuning",result:"pending",file:"*.xml" },
  // Deps
  { id:"t13",suite:"deps",    name:"EA base refs resolve",    desc:"Referenced base-game instances exist",      result:"pending",file:"trait_Evil.xml" },
  { id:"t14",suite:"deps",    name:"Pack requirements declared",desc:"EP/GP refs have corresponding availability",result:"pending",file:"career_Villain.xml" },
  { id:"t15",suite:"deps",    name:"No circular references",  desc:"Dependency graph is acyclic",              result:"pending",file:"*.xml" },
  // Best practices
  { id:"t16",suite:"best-practices",name:"Naming convention", desc:"All n= values use snake_case",              result:"pending",file:"interaction_Hug.xml" },
  { id:"t17",suite:"best-practices",name:"Comment coverage",  desc:"All root elements have XML comments",       result:"pending",file:"*.xml" },
  { id:"t18",suite:"best-practices",name:"Version tag present",desc:"mod_manifest.json has a version field",   result:"pending",file:"mod_manifest.json" },
  { id:"t19",suite:"best-practices",name:"File size limit",    desc:"No single file exceeds 2 MB",             result:"pending",file:"*.package" },
  { id:"t20",suite:"best-practices",name:"Debug nodes removed",desc:"No <debug> tunable nodes in release build",result:"pending",file:"*.xml" },
];

// Simulate run results
function simulateRun(tests: TestCase[]): TestCase[] {
  const outcomes: Record<string,{result:TestResult;duration:number;detail?:string;line?:number}> = {
    t01:{result:"pass",duration:12},
    t02:{result:"pass",duration:8},
    t03:{result:"pass",duration:14},
    t04:{result:"fail",duration:22,detail:"Unknown tuning type 'TraitConflictType' at line 7",line:7},
    t05:{result:"pass",duration:9},
    t06:{result:"pass",duration:5},
    t07:{result:"fail",duration:18,detail:"Hash collision: 0x3FC2A1B0 appears in both 'trait_evil_buff_desc' and 'buff_glum_desc'",line:14},
    t08:{result:"skip",duration:0,detail:"es-ES locale has 2 missing keys — coverage 98%"},
    t09:{result:"pass",duration:7},
    t10:{result:"pass",duration:11},
    t11:{result:"skip",duration:0,detail:"DDS inspection not available in this environment"},
    t12:{result:"pass",duration:16},
    t13:{result:"fail",duration:25,detail:"Instance 0x00203A1E (interaction_InsultSim) not found in base-game registry",line:12},
    t14:{result:"pass",duration:13},
    t15:{result:"pass",duration:31},
    t16:{result:"fail",duration:8,detail:"'EvilGlee' should be 'evil_glee' — PascalCase found at 3 locations"},
    t17:{result:"skip",duration:0,detail:"Comment coverage: 62% (threshold: 80%)"},
    t18:{result:"pass",duration:4},
    t19:{result:"pass",duration:19},
    t20:{result:"pass",duration:6},
  };
  return tests.map(t=>({...t,...outcomes[t.id]}));
}

const RESULT_CFG: Record<TestResult,{color:string;label:string;icon:typeof CheckCircle2}> = {
  pass:    { color:T.emerald,  label:"PASS",    icon:CheckCircle2 },
  fail:    { color:T.rose,     label:"FAIL",    icon:XCircle      },
  skip:    { color:T.amber,    label:"SKIP",    icon:AlertTriangle},
  pending: { color:T.textDim,  label:"PENDING", icon:Minus        },
};

export function TestRunner({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [tests, setTests]       = useState<TestCase[]>(INITIAL_TESTS);
  const [running, setRunning]   = useState(false);
  const [expanded, setExpanded] = useState<Set<SuiteId>>(new Set());
  const [filter, setFilter]     = useState<TestResult | "all">("all");
  const [runCount, setRunCount] = useState(0);

  const suites = Object.keys(SUITE_CFG) as SuiteId[];

  const runAll = useCallback(async () => {
    setRunning(true);
    setTests(prev => prev.map(t => ({ ...t, result: "pending" as TestResult })));
    // Stagger updates to simulate progressive test execution
    const results = simulateRun(INITIAL_TESTS);
    for (let i = 0; i < results.length; i++) {
      await new Promise(r => setTimeout(r, 60 + Math.random() * 40));
      setTests(prev => prev.map(t => t.id === results[i].id ? results[i] : t));
    }
    setRunning(false);
    setRunCount(c => c + 1);
    const pass = results.filter(t=>t.result==="pass").length;
    const fail = results.filter(t=>t.result==="fail").length;
    toast[fail>0?"error":"success"](
      `Test run complete: ${pass} passed, ${fail} failed`,
      { description:`${results.filter(t=>t.result==="skip").length} skipped` }
    );
  }, []);

  const stats = useMemo(()=>({
    total:   tests.length,
    pass:    tests.filter(t=>t.result==="pass").length,
    fail:    tests.filter(t=>t.result==="fail").length,
    skip:    tests.filter(t=>t.result==="skip").length,
    pending: tests.filter(t=>t.result==="pending").length,
    pct:     Math.round(tests.filter(t=>t.result==="pass").length/tests.filter(t=>t.result!=="pending").length*100)||0,
  }),[tests]);

  const toggleSuite = (id: SuiteId) => setExpanded(prev => { const n=new Set(prev); if (n.has(id)) { n.delete(id); } else { n.add(id); } return n; });

  const filteredForSuite = (suite: SuiteId) => {
    let rows = tests.filter(t => t.suite === suite);
    if (filter !== "all") rows = rows.filter(t => t.result === filter);
    return rows;
  };

  const exportReport = () => {
    const lines = ["# Test Report", `Run #${runCount} · ${new Date().toLocaleString()}`, "",
      `Pass: ${stats.pass} | Fail: ${stats.fail} | Skip: ${stats.skip}`, "",
      ...tests.map(t=>`[${t.result.toUpperCase().padEnd(4)}] ${t.suite}/${t.name}${t.detail?` — ${t.detail}`:""}`)
    ];
    navigator.clipboard.writeText(lines.join("\n")).then(()=>toast.success("Test report copied to clipboard"));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-[200] flex items-center justify-center"
          initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
          style={{background:"rgba(0,0,0,0.82)",backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)"}}
          onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
          <motion.div initial={{opacity:0,scale:0.97,y:12}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.97,y:12}}
            transition={{duration:0.22,ease:[0.16,1,0.3,1]}}
            className="relative flex flex-col rounded-2xl overflow-hidden"
            style={{width:"min(920px,97vw)",height:"min(700px,90vh)",background:T.bgElevated,border:`1px solid ${T.border}`,boxShadow:`${T.shadow2Xl},inset 0 1px 0 rgba(255,255,255,0.04)`}}>

            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{background:`linear-gradient(90deg,transparent 5%,${stats.fail>0?T.rose:T.emerald}80,${T.cyan}80,transparent 95%)`}}/>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 flex-shrink-0" style={{borderBottom:`1px solid ${T.border}`}}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:`linear-gradient(135deg,${T.emerald}20,${T.cyan}20)`,border:`1px solid ${T.borderSubtle}`}}>
                  <Play size={16} color={T.emerald}/>
                </div>
                <div>
                  <div style={{fontSize:15,fontWeight:700,color:T.textPrimary,fontFamily:T.display}}>Test Runner</div>
                  <div style={{fontSize:10,color:T.textMuted,fontFamily:T.mono}}>{stats.total} tests · run #{runCount} · Evil_Trait_Override</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={exportReport} disabled={runCount===0} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all disabled:opacity-30"
                  style={{fontSize:10,color:T.textMuted,background:"rgba(255,255,255,0.02)",border:`1px solid ${T.borderSubtle}`}}>
                  <Download size={11}/> Export
                </button>
                <button onClick={runAll} disabled={running}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition-all disabled:opacity-60"
                  style={{fontSize:11,fontWeight:700,color:"#fff",background:`linear-gradient(135deg,${T.emerald}CC,${T.cyan}CC)`}}>
                  {running?<><RefreshCw size={12} className="animate-spin"/>Running…</>:<><Play size={12}/>Run All</>}
                </button>
                <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all" style={{border:`1px solid ${T.borderSubtle}`}}>
                  <X size={14} color={T.textMuted}/>
                </button>
              </div>
            </div>

            {/* Stats bar */}
            {runCount > 0 && (
              <div className="flex items-center gap-4 px-6 py-2.5 flex-shrink-0" style={{borderBottom:`1px solid ${T.borderSubtle}`,background:"rgba(0,0,0,0.1)"}}>
                {[{r:"pass" as TestResult,n:stats.pass},{r:"fail" as TestResult,n:stats.fail},{r:"skip" as TestResult,n:stats.skip}].map(s=>{
                  const cfg=RESULT_CFG[s.r]; const Icon=cfg.icon;
                  return (
                    <div key={s.r} className="flex items-center gap-1.5">
                      <Icon size={12} color={cfg.color}/>
                      <span style={{fontSize:12,fontWeight:800,fontFamily:T.mono,color:cfg.color}}>{s.n}</span>
                      <span style={{fontSize:9,color:T.textDim}}>{cfg.label}</span>
                    </div>
                  );
                })}
                <div className="flex-1 relative rounded-full overflow-hidden mx-2" style={{height:4,background:"rgba(255,255,255,0.05)"}}>
                  <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{background:`linear-gradient(90deg,${T.emerald},${T.cyan})`}}
                    animate={{width:`${stats.pct}%`}} transition={{duration:0.6}}/>
                </div>
                <span style={{fontSize:11,fontWeight:700,fontFamily:T.mono,color:stats.pct===100?T.emerald:stats.fail>0?T.rose:T.amber}}>{stats.pct}% pass</span>
                {/* Filter chips */}
                <div className="flex items-center gap-1 ml-2">
                  {(["all","fail","skip"] as const).map(f=>(
                    <button key={f} onClick={()=>setFilter(f)}
                      className="px-2 py-0.5 rounded-md transition-all"
                      style={{fontSize:9,fontWeight:filter===f?700:400,color:filter===f?T.textPrimary:T.textMuted,background:filter===f?T.bgActive:"transparent"}}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Test suites */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {suites.map(suiteId=>{
                const cfg=SUITE_CFG[suiteId]; const Icon=cfg.icon;
                const suiteTests=filteredForSuite(suiteId);
                const allTests=tests.filter(t=>t.suite===suiteId);
                const pass=allTests.filter(t=>t.result==="pass").length;
                const fail=allTests.filter(t=>t.result==="fail").length;
                const skip=allTests.filter(t=>t.result==="skip").length;
                const pend=allTests.filter(t=>t.result==="pending").length;
                const isOpen=expanded.has(suiteId);

                if (filter!=="all" && suiteTests.length===0) return null;

                return (
                  <div key={suiteId} className="rounded-xl overflow-hidden" style={{border:`1px solid ${fail>0?`${cfg.color}20`:T.borderSubtle}`}}>
                    {/* Suite header */}
                    <button onClick={()=>toggleSuite(suiteId)} className="w-full flex items-center gap-3 px-4 py-3 transition-all"
                      style={{background:fail>0?`${cfg.color}05`:T.bgSurface}}
                      onMouseEnter={e=>{e.currentTarget.style.background=T.bgHover;}}
                      onMouseLeave={e=>{e.currentTarget.style.background=fail>0?`${cfg.color}05`:T.bgSurface;}}>
                      <Icon size={14} color={cfg.color}/>
                      <span style={{fontSize:12,fontWeight:700,color:T.textPrimary,flex:1,textAlign:"left"}}>{cfg.label}</span>
                      {/* Mini result bars */}
                      <div className="flex items-center gap-2">
                        {pass>0&&<span style={{fontSize:10,fontFamily:T.mono,color:T.emerald}}>{pass}✓</span>}
                        {fail>0&&<span style={{fontSize:10,fontFamily:T.mono,color:T.rose}}>{fail}✗</span>}
                        {skip>0&&<span style={{fontSize:10,fontFamily:T.mono,color:T.amber}}>{skip}⚠</span>}
                        {pend>0&&<span style={{fontSize:10,fontFamily:T.mono,color:T.textDim}}>{pend}…</span>}
                      </div>
                      {/* Progress strip */}
                      <div className="flex gap-0.5">
                        {allTests.map(t=>{
                          const rc=RESULT_CFG[t.result];
                          return <div key={t.id} className="w-1.5 h-4 rounded-sm" style={{background:t.result==="pending"?"rgba(255,255,255,0.06)":rc.color}}/>;
                        })}
                      </div>
                      {isOpen?<ChevronDown size={12} color={T.textMuted}/>:<ChevronRight size={12} color={T.textMuted}/>}
                    </button>

                    {/* Test rows */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div initial={{height:0}} animate={{height:"auto"}} exit={{height:0}} className="overflow-hidden">
                          {suiteTests.map((test,i)=>{
                            const rc=RESULT_CFG[test.result]; const Icon=rc.icon;
                            return (
                              <motion.div key={test.id} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.03}}
                                className="flex items-start gap-3 px-4 py-2.5"
                                style={{borderTop:`1px solid ${T.borderSubtle}`,background:test.result==="fail"?`${T.rose}04`:"transparent"}}>
                                <Icon size={13} color={rc.color} className="flex-shrink-0 mt-0.5"/>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span style={{fontSize:11,fontWeight:600,color:T.textSecondary}}>{test.name}</span>
                                    {test.file&&<span style={{fontSize:9,fontFamily:T.mono,color:T.textDim}}>{test.file}{test.line?`:${test.line}`:""}</span>}
                                    {test.duration!==undefined&&test.duration>0&&<span style={{fontSize:8,fontFamily:T.mono,color:T.textDim}}>{test.duration}ms</span>}
                                  </div>
                                  <div style={{fontSize:10,color:T.textDim,marginTop:1}}>{test.desc}</div>
                                  {test.detail&&<div style={{fontSize:10,color:rc.color,marginTop:3,lineHeight:1.4}}>{test.detail}</div>}
                                </div>
                                <span className="px-1.5 py-0.5 rounded flex-shrink-0" style={{fontSize:7,fontWeight:800,letterSpacing:"0.08em",color:rc.color,background:`${rc.color}12`}}>{rc.label}</span>
                              </motion.div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {runCount===0&&(
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{background:T.bgSurface,border:`1px solid ${T.borderSubtle}`}}>
                    <Play size={28} color={T.textDim} strokeWidth={1.5}/>
                  </div>
                  <div className="text-center">
                    <div style={{fontSize:14,fontWeight:700,color:T.textSecondary}}>Ready to run</div>
                    <div style={{fontSize:11,color:T.textMuted,marginTop:4}}>{stats.total} tests across {suites.length} suites</div>
                  </div>
                  <button onClick={runAll}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl"
                    style={{fontSize:13,fontWeight:700,color:"#fff",background:`linear-gradient(135deg,${T.emerald}CC,${T.cyan}CC)`}}>
                    <Play size={14}/> Run All Tests
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default TestRunner;

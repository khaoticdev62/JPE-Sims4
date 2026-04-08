"use client";

import { useState, useMemo } from "react";
import {
  Code2, Lightbulb, Play,
  ChevronRight, Search, AlertTriangle,
  Wand2, Eye,
} from "lucide-react";
import { T } from "./robust/jpe-theme";
import { Eyebrow, Badge, GlowDot } from "./robust/jpe-shared";
import {
  jpeSourceLines, xmlPreviewLines, jpeDocumentation, jpeDocCategories,
  tokenizeJpeLine, jpeSuggestions, jpeSyntaxColors,
} from "./robust/jpe-data";
import { useJpeSettings } from "./jpe-settings-context";

export function JpeLanguageEditor() {
  const { settings: { fontScale } } = useJpeSettings();
  const docPanelW = Math.round(280 / Math.max(fontScale, 1));
  const [lines, setLines] = useState(jpeSourceLines);
  const [selectedLine, setSelectedLine] = useState<number | null>(3);
  const [cursorPos, setCursorPos] = useState({ line: 3, col: 0 });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [docSearch, setDocSearch] = useState("");
  const [selectedDocKeyword, setSelectedDocKeyword] = useState<string | null>("trait");
  const [activeDocCategory, setActiveDocCategory] = useState("all");
  const [previewTab, setPreviewTab] = useState<"xml" | "preview">("xml");
  const [compiling, setCompiling] = useState(false);

  const filteredDocs = useMemo(() => {
    let docs = jpeDocumentation;
    if (activeDocCategory !== "all") docs = docs.filter(d => d.category === activeDocCategory);
    if (docSearch) {
      const q = docSearch.toLowerCase();
      docs = docs.filter(d => d.keyword.toLowerCase().includes(q) || d.description.toLowerCase().includes(q));
    }
    return docs;
  }, [activeDocCategory, docSearch]);

  const selectedDoc = selectedDocKeyword ? jpeDocumentation.find(d => d.keyword === selectedDocKeyword) : null;

  return (
    <div className="flex flex-col h-full" style={{ background: T.bgDeep }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-1.5 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgPanel }}>
        <div className="flex items-center gap-3">
          <Code2 size={14} color={T.violet} />
          <Eyebrow color={T.textPrimary}>JPE LANGUAGE EDITOR</Eyebrow>
          <div className="w-px h-4" style={{ background: T.border }} />
          <Badge color={T.violet} bg={T.violetDim}>JPE v3.0</Badge>
          <Badge color={T.emerald} bg={T.emeraldDim}>{lines.length} lines</Badge>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1 rounded-lg"
            style={{ background: T.violetDim, border: `1px solid ${T.borderViolet}`, fontSize: 11, fontWeight: 600, color: T.violetBright }}
            onClick={() => setShowSuggestions(p => !p)}>
            <Wand2 size={11} /> Format
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1 rounded-lg"
            style={{ background: compiling ? T.emeraldDim : T.emeraldDim, border: `1px solid rgba(72,187,120,0.2)`, fontSize: 11, fontWeight: 600, color: T.emerald, opacity: compiling ? 0.6 : 1 }}
            onClick={() => { setCompiling(true); setPreviewTab("xml"); setTimeout(() => setCompiling(false), 1200); }}>
            <Play size={11} /> {compiling ? "Compiling..." : "Compile to XML"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left: JPE Editor */}
        <div className="flex-1 flex flex-col min-w-0" style={{ borderRight: `1px solid ${T.border}` }}>
          <div className="flex items-center px-3 py-1.5 gap-2 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgSurface }}>
            <Code2 size={12} color={T.violet} />
            <span style={{ fontSize: 11, fontWeight: 600, color: T.textPrimary }}>trait_Evil.jpe</span>
            <div className="w-1.5 h-1.5 rounded-full ml-1" style={{ background: T.cyan }} />
            <span className="ml-auto" style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>
              Ln {cursorPos.line}, Col {cursorPos.col}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto py-2 relative">
            {lines.map((line, idx) => {
              const tokens = tokenizeJpeLine(line.text);
              const isSelected = selectedLine === idx;
              const hasError = line.error;
              const hasWarning = line.warning;
              return (
                <div key={idx}
                  className="flex items-start group cursor-pointer"
                  style={{
                    background: isSelected ? "rgba(139,92,246,0.06)" : hasError ? "rgba(252,129,129,0.04)" : "transparent",
                    borderLeft: isSelected ? `2px solid ${T.violet}` : hasError ? `2px solid ${T.rose}` : "2px solid transparent",
                  }}
                  onClick={() => { setSelectedLine(idx); setCursorPos({ line: idx + 1, col: 0 }); }}
                  onMouseEnter={e => { if (!isSelected && !hasError) e.currentTarget.style.background = "rgba(255,255,255,0.015)"; }}
                  onMouseLeave={e => { if (!isSelected && !hasError) e.currentTarget.style.background = "transparent"; }}>
                  <span className="w-10 text-right pr-3 select-none flex-shrink-0 pt-[2px]"
                    style={{ fontSize: 12, fontFamily: T.mono, color: T.textDim }}>{line.num}</span>
                  <span className="flex-1 pt-[2px]" style={{ fontSize: 13, fontFamily: T.mono, whiteSpace: "pre", lineHeight: 1.6 }}>
                    {tokens.map((tok, ti) => (
                      <span key={ti} style={{ color: jpeSyntaxColors[tok.type] || T.textSecondary }}>{tok.text}</span>
                    ))}
                  </span>
                  {(hasError || hasWarning) && (
                    <div className="flex items-center gap-1 pr-3 pt-[2px] flex-shrink-0">
                      {hasError && <AlertTriangle size={10} color={T.rose} />}
                      {hasWarning && <AlertTriangle size={10} color={T.amber} />}
                    </div>
                  )}
                  {line.hint && (
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 pr-3 pt-[2px] flex-shrink-0 transition-opacity">
                      <Lightbulb size={10} color={T.amber} />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Autocomplete popup */}
            {showSuggestions && (
              <div 
                role="listbox"
                aria-label="Code suggestions"
                className="absolute left-16 rounded-xl overflow-hidden z-[100]"
                style={{ 
                  top: Math.max(0, (selectedLine || 0) * 22 + 40), 
                  background: T.bgSurface, 
                  border: `1px solid ${T.border}`, 
                  boxShadow: `0 8px 32px rgba(0,0,0,0.5)`, 
                  minWidth: 280 
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${T.violet}60, transparent)` }} />
                {jpeSuggestions.slice(0, 6).map((s, i) => (
                  <div 
                    key={i} 
                    role="option"
                    aria-selected={i === 0}
                    className="flex items-center gap-2 px-3 py-1.5 cursor-pointer transition-colors"
                    style={{ background: i === 0 ? T.bgHover : "transparent" }}
                    onMouseEnter={e => { e.currentTarget.style.background = T.bgHover; }}
                    onMouseLeave={e => { if (i !== 0) e.currentTarget.style.background = "transparent"; }}>
                    <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: `${s.color || T.violet}15` }}>
                      {s.icon && <s.icon size={10} color={s.color || T.violet} />}
                    </div>
                    <span style={{ fontSize: 11, fontFamily: T.mono, color: T.textPrimary, fontWeight: 600 }}>{s.completion}</span>
                    <span className="ml-auto" style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>{s.desc}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error/Warning bar */}
          {selectedLine !== null && lines[selectedLine]?.error && (
            <div className="flex items-center gap-2 px-4 py-2 flex-shrink-0" style={{ borderTop: `1px solid ${T.border}`, background: T.roseDim }}>
              <AlertTriangle size={12} color={T.rose} />
              <span style={{ fontSize: 11, color: T.rose }}>{lines[selectedLine].error}</span>
              {lines[selectedLine].quickFix && (
                <button className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-md"
                  onClick={() => {
                    const lineIdx = selectedLine!;
                    const fix = lines[lineIdx].quickFix!;
                    setLines(prev => prev.map((l, i) => i === lineIdx ? { ...l, text: fix.replacement.split("\n")[0], tokens: tokenizeJpeLine(fix.replacement.split("\n")[0]), error: undefined, warning: undefined, quickFix: undefined, validationStatus: "valid" as const } : l));
                  }}
                  style={{ background: "rgba(252,129,129,0.15)", border: `1px solid rgba(252,129,129,0.2)`, fontSize: 10, fontWeight: 700, color: T.rose }}>
                  <Wand2 size={9} /> Quick Fix
                </button>
              )}
            </div>
          )}
        </div>

        {/* Center: XML Preview */}
        <div className="flex flex-col" style={{ width: "35%", borderRight: `1px solid ${T.border}` }}>
          <div className="flex items-center gap-0 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgSurface }}>
            {(["xml", "preview"] as const).map(tab => (
              <button key={tab} onClick={() => setPreviewTab(tab)}
                className="px-4 py-2 transition-colors relative"
                style={{ fontSize: 11, fontWeight: previewTab === tab ? 700 : 500, color: previewTab === tab ? T.textPrimary : T.textTertiary }}>
                {tab === "xml" ? "XML Output" : "Visual Preview"}
                {previewTab === tab && <div className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full" style={{ background: T.cyan }} />}
              </button>
            ))}
            <span className="ml-auto pr-3" style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>
              {xmlPreviewLines.length} lines
            </span>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {previewTab === "xml" ? (
              xmlPreviewLines.map((line, idx) => {
                const isHighlighted = selectedLine !== null && line.sourceJpeLine === selectedLine;
                return (
                  <div key={idx} className="flex items-start"
                    style={{ background: isHighlighted ? "rgba(99,179,237,0.06)" : "transparent" }}>
                    <span className="w-8 text-right pr-2 select-none flex-shrink-0 pt-[2px]"
                      style={{ fontSize: 11, fontFamily: T.mono, color: T.textDim }}>{line.num}</span>
                    <span style={{
                      fontSize: 12, fontFamily: T.mono, whiteSpace: "pre", lineHeight: 1.6,
                      paddingLeft: line.indent * 12,
                      color: line.type === "tag" ? T.cyan : line.type === "attr" ? T.violet : line.type === "comment" ? T.textMuted : T.emerald,
                    }}>{line.text}</span>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-8">
                  <Eye size={28} color={T.textDim} className="mx-auto mb-3" />
                  <p style={{ fontSize: 13, color: T.textMuted }}>Visual Preview</p>
                  <p style={{ fontSize: 11, color: T.textDim, marginTop: 4 }}>Renders JPE as Sims 4 in-game UI mockup</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Documentation */}
        <div className="flex flex-col" style={{ width: docPanelW, background: T.bgPanel }}>
          <div className="px-3 py-2 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgSurface }}>
            <div className="relative">
              <Search size={12} color={T.textDim} className="absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input value={docSearch} onChange={e => setDocSearch(e.target.value)} placeholder="Search keywords..."
                className="w-full pl-7 pr-2 py-1.5 rounded-lg outline-none"
                style={{ fontSize: 11, fontFamily: T.mono, color: T.textPrimary, background: "rgba(255,255,255,0.04)", border: `1px solid ${T.borderSubtle}` }} />
            </div>
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-1 px-2 py-1.5 flex-shrink-0 flex-wrap" style={{ borderBottom: `1px solid ${T.border}` }}>
            {Object.entries(jpeDocCategories).map(([id, cat]) => (
              <button key={id} onClick={() => setActiveDocCategory(id)}
                className="px-2 py-0.5 rounded-md transition-colors"
                style={{
                  fontSize: 9, fontWeight: 700,
                  color: activeDocCategory === id ? cat.color : T.textDim,
                  background: activeDocCategory === id ? `${cat.color}12` : "transparent",
                  border: `1px solid ${activeDocCategory === id ? `${cat.color}25` : "transparent"}`,
                }}>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Keyword list / detail */}
          {selectedDoc ? (
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              <button onClick={() => setSelectedDocKeyword(null)} className="flex items-center gap-1 mb-1"
                style={{ fontSize: 10, color: T.cyan }}>
                <ChevronRight size={10} className="rotate-180" /> Back to list
              </button>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ fontSize: 16, fontFamily: T.mono, fontWeight: 700, color: T.violetBright }}>{selectedDoc.keyword}</span>
                  <Badge color={T.textMuted} bg="rgba(255,255,255,0.04)">{selectedDoc.category}</Badge>
                </div>
                <code className="block px-2 py-1.5 rounded-md mt-2" style={{ fontSize: 11, fontFamily: T.mono, color: T.cyan, background: "rgba(255,255,255,0.03)", border: `1px solid ${T.borderSubtle}` }}>
                  {selectedDoc.signature}
                </code>
              </div>
              <div>
                <Eyebrow color={T.textMuted}>DESCRIPTION</Eyebrow>
                <p className="mt-1.5" style={{ fontSize: 11, color: T.textSecondary, lineHeight: 1.6 }}>{selectedDoc.description}</p>
              </div>
              <div>
                <Eyebrow color={T.textMuted}>XML MAPPING</Eyebrow>
                <code className="block px-2 py-1.5 rounded-md mt-1.5" style={{ fontSize: 10, fontFamily: T.mono, color: T.cyan, background: "rgba(99,179,237,0.06)", border: `1px solid rgba(99,179,237,0.1)`, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                  {selectedDoc.xmlMapping}
                </code>
              </div>
              <div>
                <Eyebrow color={T.textMuted}>EXAMPLES</Eyebrow>
                <div className="mt-1.5 space-y-1">
                  {selectedDoc.examples.map((ex, i) => (
                    <code key={i} className="block px-2 py-1 rounded-md" style={{ fontSize: 10, fontFamily: T.mono, color: T.emerald, background: "rgba(72,187,120,0.06)", border: `1px solid rgba(72,187,120,0.08)` }}>
                      {ex}
                    </code>
                  ))}
                </div>
              </div>
              {selectedDoc.relatedKeywords && selectedDoc.relatedKeywords.length > 0 && (
                <div>
                  <Eyebrow color={T.textMuted}>RELATED</Eyebrow>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {selectedDoc.relatedKeywords.map(kw => (
                      <button key={kw} onClick={() => setSelectedDocKeyword(kw)}
                        className="px-2 py-0.5 rounded-md transition-colors hover:bg-white/5"
                        style={{ fontSize: 10, fontFamily: T.mono, color: T.violet, background: T.violetDim, border: `1px solid ${T.borderViolet}` }}>
                        {kw}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto py-1">
              {filteredDocs.map((doc) => (
                <button key={doc.keyword} onClick={() => setSelectedDocKeyword(doc.keyword)}
                  className="w-full flex items-center gap-2 px-3 py-2 transition-colors text-left"
                  onMouseEnter={e => { e.currentTarget.style.background = T.bgHover; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                  <span style={{ fontSize: 11, fontFamily: T.mono, fontWeight: 700, color: T.violetBright, minWidth: 80 }}>{doc.keyword}</span>
                  <span className="flex-1 truncate" style={{ fontSize: 10, color: T.textTertiary }}>{doc.description.slice(0, 60)}...</span>
                  <ChevronRight size={10} color={T.textDim} />
                </button>
              ))}
              {filteredDocs.length === 0 && (
                <div className="flex flex-col items-center py-8">
                  <Search size={18} color={T.textDim} />
                  <span style={{ fontSize: 11, color: T.textMuted, marginTop: 6 }}>No keywords found</span>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between px-3 py-1.5 flex-shrink-0" style={{ borderTop: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>JPE Docs v3.0</span>
            <div className="flex items-center gap-1.5">
              <GlowDot color={T.violet} />
              <span style={{ fontSize: 9, fontFamily: T.mono, color: T.violet }}>{jpeDocumentation.length} keywords</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

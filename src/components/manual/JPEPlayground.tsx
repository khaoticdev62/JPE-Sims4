"use client";

import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { tokenize, parse } from '../../engine/jpe';
import { jpeToXml } from '../../engine/translators/jpeToXml';
import { XMLParser } from '../../engine/parsers/XMLParser';
import './JustPlainManual.css';

interface JPEPlaygroundProps {
  initialCode?: string;
}

export const JPEPlayground: React.FC<JPEPlaygroundProps> = ({ initialCode = '' }) => {
  const [code, setCode] = useState(initialCode);
  const [xml, setXml] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (!code.trim()) {
        setXml('<!-- No JPE code provided -->');
        setError(null);
        return;
      }
      
      const tokens = tokenize(code);
      const ast = parse(tokens);
      const xmlAst = jpeToXml(ast);
      
      if (xmlAst) {
        const translatedXml = XMLParser.elementToString(xmlAst);
        setXml(translatedXml);
      } else {
        setXml('<!-- No output generated -->');
      }
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Translation error');
      setXml('<!-- Error in translation -->');
    }
  }, [code]);

  return (
    <div className="jpm-playground-container">
      <div className="jpm-playground-header">
        <span className="jpm-playground-label">Just Plain English Sandbox</span>
        <div className="flex gap-2">
          {error ? (
            <span className="jpm-badge" style={{ background: '#ef4444', color: '#fff' }}>Error</span>
          ) : (
            <span className="jpm-badge">Valid JPE</span>
          )}
        </div>
      </div>
      
      <div className="flex h-[320px] bg-[#0f172a]">
        {/* Editor Half */}
        <div className="flex-1 border-r border-[#1e293b]">
          <Editor
            height="100%"
            defaultLanguage="plaintext" // We can register JPE language later
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 12,
              fontFamily: 'Fira Code, monospace',
              scrollBeyondLastLine: false,
              lineNumbers: 'on',
              padding: { top: 10, bottom: 10 },
              folding: true,
              glyphMargin: false,
            }}
          />
        </div>

        {/* Preview Half */}
        <div className="flex-1 overflow-auto bg-[#020617] p-4 font-mono text-xs leading-relaxed text-[#94a3b8]">
          <div className="mb-2 text-[0.6rem] font-bold uppercase tracking-widest text-[#475569]">
            Sims 4 XML Output
          </div>
          <pre className="whitespace-pre-wrap">
            {xml}
          </pre>
          {error && (
            <div className="mt-4 border-t border-[#ef4444] pt-2 text-[#ef4444]">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

"use client";

import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Badge } from '@/components/ui/badge';
import { Play, Code, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTheme } from 'next-themes';

interface JPEPlaygroundProps {
  initialCode: string;
}

export const JPEPlayground: React.FC<JPEPlaygroundProps> = ({ initialCode }) => {
  const [code, setCode] = useState<string>(initialCode);
  const [xml, setXml] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    // Simple mock translation for playground
    // In a real app, this would call the CompilerService
    try {
      if (!code.trim()) {
        setXml('');
        setError(null);
        return;
      }

      // Basic regex-based "translation" for visual feedback
      const lines = code.split('\n');
      const xmlOutput = lines.map(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('WHEN')) return `<trigger type="${trimmed.split(' ')[1]}">`;
        if (trimmed.startsWith('ONLY_IF')) return `  <condition test="${trimmed.split(' ')[1]}">`;
        if (trimmed.startsWith('DO')) return `    <action name="${trimmed.split(' ')[1]}" />`;
        return `    <!-- ${trimmed} -->`;
      }).join('\n');

      setXml(`<I>\n${xmlOutput}\n</I>`);
      setError(null);
    } catch (_err) {
      setError('Syntax Error: Check your JPE keywords');
    }
  }, [code]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[350px] border border-jpe-border rounded-2xl overflow-hidden bg-jpe-bg/40 shadow-2xl">
      {/* Editor Side */}
      <div className="flex flex-col border-r border-jpe-border bg-jpe-surface/30">
        <div className="flex items-center justify-between px-4 py-2 border-b border-jpe-border bg-jpe-bg/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-jpe-primary">
            <Play className="w-3 h-3" />
            JPE Editor
          </div>
          <Badge variant="outline" className="text-[9px] uppercase border-jpe-primary/30 text-jpe-primary flex gap-1 items-center px-1.5 h-5">
            <CheckCircle2 className="w-2 h-2" /> Live
          </Badge>
        </div>
        <div className="flex-1 overflow-hidden p-1">
          <Editor
            height="100%"
            language="javascript" // Using JS for syntax highlights until custom JPE is registered
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            value={code}
            onChange={(val) => setCode(val || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 12,
              lineNumbers: 'off',
              padding: { top: 12 },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              scrollbar: {
                vertical: 'hidden',
                horizontal: 'hidden'
              }
            }}
          />
        </div>
      </div>

      {/* Preview Side */}
      <div className="flex flex-col bg-jpe-surface/60">
        <div className="flex items-center justify-between px-4 py-2 border-b border-jpe-border bg-jpe-bg/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-jpe-muted">
            <Code className="w-3 h-3" />
            Sims 4 XML Preview
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4 custom-scrollbar bg-jpe-surface/80">
          {error ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-80">
              <AlertCircle className="w-8 h-8 text-destructive" />
              <div className="text-xs font-medium text-destructive">{error}</div>
            </div>
          ) : (
            <pre className="text-[11px] font-mono text-jpe-muted selection:bg-jpe-primary/30 leading-relaxed">
              {xml || '<!-- Waiting for input... -->'}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};

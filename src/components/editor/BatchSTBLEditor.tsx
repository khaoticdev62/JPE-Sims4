"use client";

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Search, Replace, Download, Upload, Languages,
  CheckCircle2, AlertCircle, X, Plus, Trash2,
  ArrowLeftRight, FileText, Globe, Save
} from 'lucide-react';
import { T } from '@/components/robust/jpe-theme';
import { motion, AnimatePresence } from '@/components/jpe-motion';
import { JpeButton, JpeCard, JpeStatusBadge } from '@/components/jpe-design-system';
import { STBLParser } from '@/engine/parsers/STBLParser';
import { STBLCompiler } from '@/engine/compilers/STBLCompiler';
import { BatchSTBLUtility, STBLEntry as UtilityEntry, STBLFile as UtilityFile } from '@/utils/BatchSTBLUtility';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type STBLEntry = UtilityEntry;
type STBLFile = UtilityFile;

interface BatchOperation {
  type: 'find-replace' | 'delete-empty' | 'merge' | 'export';
  description: string;
}

// ---------------------------------------------------------------------------
// Language constants
// ---------------------------------------------------------------------------

const LANGUAGES = [
  { code: 'en_US', label: 'English (US)', flag: '🇺🇸' },
  { code: 'de_DE', label: 'German', flag: '🇩🇪' },
  { code: 'fr_FR', label: 'French', flag: '🇫🇷' },
  { code: 'es_ES', label: 'Spanish', flag: '🇪🇸' },
  { code: 'it_IT', label: 'Italian', flag: '🇮🇹' },
  { code: 'nl_NL', label: 'Dutch', flag: '🇳🇱' },
  { code: 'sv_SE', label: 'Swedish', flag: '🇸🇪' },
  { code: 'da_DK', label: 'Danish', flag: '🇩🇰' },
  { code: 'no_NO', label: 'Norwegian', flag: '🇳🇴' },
  { code: 'fi_FI', label: 'Finnish', flag: '🇫🇮' },
  { code: 'pt_BR', label: 'Portuguese (BR)', flag: '🇧🇷' },
  { code: 'ru_RU', label: 'Russian', flag: '🇷🇺' },
  { code: 'pl_PL', label: 'Polish', flag: '🇵🇱' },
  { code: 'cs_CZ', label: 'Czech', flag: '🇨🇿' },
  { code: 'ko_KR', label: 'Korean', flag: '🇰🇷' },
  { code: 'zh_TW', label: 'Chinese (TW)', flag: '🇹🇼' },
  { code: 'ja_JP', label: 'Japanese', flag: '🇯🇵' },
  { code: 'zh_CN', label: 'Chinese (CN)', flag: '🇨🇳' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface BatchSTBLEditorProps {
  isOpen: boolean;
  onClose: () => void;
  initialFiles?: STBLFile[];
}

export function BatchSTBLEditor({ isOpen, onClose, initialFiles = [] }: BatchSTBLEditorProps) {
  const [files, setFiles] = useState<STBLFile[]>(initialFiles);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());
  const [findQuery, setFindQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [isFindReplaceOpen, setIsFindReplaceOpen] = useState(false);
  const [operationResult, setOperationResult] = useState<{ success: number; failed: number; message: string } | null>(null);

  // Computed values
  const activeFile = useMemo(() => files.find(f => f.id === activeFileId), [files, activeFileId]);
  const totalEntries = useMemo(() => files.reduce((sum, f) => sum + f.entries.length, 0), [files]);
  const dirtyCount = useMemo(() => files.filter(f => f.isDirty).length, [files]);
  
  // Collision detection
  const collisions = useMemo(() => BatchSTBLUtility.detectCollisions(files), [files]);

  // Filtered entries for active file
  const filteredEntries = useMemo(() => {
    if (!activeFile) return [];
    if (!findQuery) return activeFile.entries;
    return activeFile.entries.filter(e =>
      e.hash.toLowerCase().includes(findQuery.toLowerCase()) ||
      e.value.toLowerCase().includes(findQuery.toLowerCase())
    );
  }, [activeFile, findQuery]);

  // Handlers
  const addFile = useCallback((languageCode: string) => {
    const lang = LANGUAGES.find(l => l.code === languageCode);
    if (!lang) return;

    const newFile: STBLFile = {
      id: `stbl-${Date.now()}-${languageCode}`,
      name: `strings_${languageCode}.stbl`,
      language: languageCode,
      entries: [],
      isDirty: true,
    };

    setFiles(prev => [...prev, newFile]);
    setActiveFileId(newFile.id);
  }, []);

  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    if (activeFileId === fileId) {
      setActiveFileId(null);
    }
  }, [activeFileId]);

  const updateEntry = useCallback((fileId: string, hash: string, newValue: string) => {
    setFiles(prev => prev.map(f => {
      if (f.id !== fileId) return f;
      return {
        ...f,
        isDirty: true,
        entries: f.entries.map(e => e.hash === hash ? { ...e, value: newValue } : e),
      };
    }));
  }, []);

  const addEntry = useCallback((fileId: string) => {
    const newHash = `0x${Math.floor(Math.random() * 0xFFFFFFFF).toString(16).padStart(8, '0').toUpperCase()}`;
    setFiles(prev => prev.map(f => {
      if (f.id !== fileId) return f;
      return {
        ...f,
        isDirty: true,
        entries: [...f.entries, { hash: newHash, value: '' }],
      };
    }));
  }, []);

  const deleteEntry = useCallback((fileId: string, hash: string) => {
    setFiles(prev => prev.map(f => {
      if (f.id !== fileId) return f;
      return {
        ...f,
        isDirty: true,
        entries: f.entries.filter(e => e.hash !== hash),
      };
    }));
  }, []);

  const handleFindReplace = useCallback(() => {
    if (!findQuery || !activeFileId) return;

    let successCount = 0;
    let failCount = 0;

    setFiles(prev => prev.map(f => {
      if (f.id !== activeFileId) return f;

      let fileChanged = false;
      const newEntries = f.entries.map(e => {
        if (e.value.includes(findQuery)) {
          fileChanged = true;
          successCount++;
          return { ...e, value: e.value.replaceAll(findQuery, replaceQuery) };
        }
        return e;
      });

      if (!fileChanged) failCount++;
      return fileChanged ? { ...f, isDirty: true, entries: newEntries } : f;
    }));

    setOperationResult({
      success: successCount,
      failed: failCount,
      message: `Find & Replace complete: ${successCount} entries updated.`,
    });

    setTimeout(() => setOperationResult(null), 3000);
  }, [findQuery, replaceQuery, activeFileId]);

  const handleImport = useCallback(async () => {
    try {
      // In Electron environment, we use the native dialog
      if (typeof window !== 'undefined' && window.electron?.file) {
        const result = await window.electron.file.openFile();
        if (!result || !result.content) return;

        const { name, content, path } = result;
        const isBinary = name.toLowerCase().endsWith('.stbl');
        
        // Strategy: Try to infer language from filename or default to en_US
        const langMatch = name.match(/([a-z]{2}_[A-Z]{2})/);
        const language = langMatch ? langMatch[1] : 'en_US';

        let newFile: STBLFile;
        if (isBinary) {
          // content is Buffer/ArrayBuffer from IPC
          newFile = BatchSTBLUtility.parseBinary(content, name, language);
        } else {
          // content is string from IPC
          newFile = BatchSTBLUtility.parseText(content, name, language);
        }

        newFile.path = path;
        setFiles(prev => [...prev, newFile]);
        setActiveFileId(newFile.id);
        
        toast.success(`Imported ${name} successfully`);
      }
    } catch (error: any) {
      setOperationResult({
        success: 0,
        failed: 1,
        message: `Import failed: ${error.message}`
      });
      setTimeout(() => setOperationResult(null), 3000);
    }
  }, []);

  const handleSyncKeys = useCallback(() => {
    const syncedFiles = BatchSTBLUtility.syncKeys(files);
    setFiles(syncedFiles);
    setOperationResult({
      success: files.length,
      failed: 0,
      message: `Synchronized keys across ${files.length} languages.`
    });
    setTimeout(() => setOperationResult(null), 3000);
  }, [files]);

  const handleDeleteEmpty = useCallback(() => {
    if (!activeFileId) return;

    let deletedCount = 0;

    setFiles(prev => prev.map(f => {
      if (f.id !== activeFileId) return f;
      const beforeCount = f.entries.length;
      const newEntries = f.entries.filter(e => e.value.trim() !== '');
      deletedCount = beforeCount - newEntries.length;
      return deletedCount > 0 ? { ...f, isDirty: true, entries: newEntries } : f;
    }));

    setOperationResult({
      success: deletedCount,
      failed: 0,
      message: deletedCount > 0 ? `Deleted ${deletedCount} empty entries.` : 'No empty entries found.',
    });

    setTimeout(() => setOperationResult(null), 3000);
  }, [activeFileId]);

  const handleExport = useCallback(async () => {
    if (!activeFile) return;

    try {
      // Compile STBL entries to JPE format
      const jpeContent = `// STBL File - ${activeFile.language}\n// Entries: ${activeFile.entries.length}\n\n` +
        activeFile.entries.map(e => `String ${e.hash}: "${e.value.replace(/"/g, '\\"')}"`).join('\n');

      // Download file
      const blob = new Blob([jpeContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = activeFile.name.replace('.stbl', '.jpe.txt');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setOperationResult({
        success: 1,
        failed: 0,
        message: `Exported ${activeFile.name} successfully.`,
      });

      setTimeout(() => setOperationResult(null), 3000);
    } catch (error) {
      setOperationResult({
        success: 0,
        failed: 1,
        message: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }, [activeFile]);

  const handleExportAll = useCallback(async () => {
    let successCount = 0;

    for (const file of files) {
      try {
        const jpeContent = `// STBL File - ${file.language}\n// Entries: ${file.entries.length}\n\n` +
          file.entries.map(e => `String ${e.hash}: "${e.value.replace(/"/g, '\\"')}"`).join('\n');

        const blob = new Blob([jpeContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name.replace('.stbl', '.jpe.txt');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        successCount++;
      } catch {
        // Continue with next file
      }
    }

    setOperationResult({
      success: successCount,
      failed: files.length - successCount,
      message: `Batch export complete: ${successCount}/${files.length} files exported.`,
    });

    setTimeout(() => setOperationResult(null), 3000);
  }, [files]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xl"
      />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="w-full max-w-7xl h-[85vh] relative z-10 flex flex-col rounded-2xl border overflow-hidden"
        style={{ background: T.bgPanel, borderColor: T.border }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: T.border }}>
          <div className="flex items-center gap-3">
            <Languages size={20} color={T.cyanBright} />
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 900, fontFamily: T.display, color: T.textPrimary }}>
                Batch STBL Editor
              </h2>
              <p style={{ fontSize: 10, fontFamily: T.mono, color: T.textMuted, marginTop: 2 }}>
                {files.length} files • {totalEntries} total entries • {dirtyCount} unsaved
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <JpeButton variant="secondary" size="xs" icon={Save} onClick={handleExportAll} disabled={files.length === 0}>
              Export All
            </JpeButton>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <X size={18} color={T.textSecondary} />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 px-6 py-3 border-b" style={{ borderColor: T.border }}>
          {/* File Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto flex-1">
            {files.map(file => {
              const lang = LANGUAGES.find(l => l.code === file.language);
              return (
                <button
                  key={file.id}
                  onClick={() => setActiveFileId(file.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-mono transition-all whitespace-nowrap ${
                    activeFileId === file.id
                      ? 'bg-cyan/10 text-cyan border border-cyan/30'
                      : 'bg-white/5 text-textMuted hover:bg-white/10'
                  }`}
                >
                  <span>{lang?.flag || '🌐'}</span>
                  <span>{file.language}</span>
                  {file.isDirty && <span className="w-1.5 h-1.5 rounded-full bg-amber" />}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                    className="p-0.5 hover:bg-white/10 rounded"
                  >
                    <X size={12} />
                  </button>
                </button>
              );
            })}

            {/* Add File Dropdown */}
            <select
              onChange={(e) => { if (e.target.value) addFile(e.target.value); e.target.value = ''; }}
              className="bg-white/5 border border-border rounded-lg px-2 py-1.5 text-[11px] font-mono text-textMuted outline-none focus:border-cyan/50"
              defaultValue=""
            >
              <option value="" disabled>+ Add Language</option>
              {LANGUAGES.filter(l => !files.find(f => f.language === l.code)).map(l => (
                <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
              ))}
            </select>
          </div>

          {/* Find/Replace Toggle */}
          <div className="flex items-center gap-1">
            <JpeButton variant="ghost" size="xs" icon={Upload} onClick={handleImport}>
              Import Files
            </JpeButton>
            <button
              onClick={() => setIsFindReplaceOpen(!isFindReplaceOpen)}
              className={`p-2 rounded-lg transition-colors ${isFindReplaceOpen ? 'bg-cyan/10 text-cyan' : 'hover:bg-white/5 text-textMuted'}`}
            >
              <ArrowLeftRight size={16} />
            </button>
          </div>
        </div>

        {/* Find/Replace Panel */}
        <AnimatePresence>
          {isFindReplaceOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b"
              style={{ borderColor: T.border }}
            >
              <div className="flex items-center gap-3 px-6 py-3">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" color={T.textMuted} />
                  <input
                    type="text"
                    placeholder="Find..."
                    value={findQuery}
                    onChange={(e) => setFindQuery(e.target.value)}
                    className="w-full bg-white/5 border border-border rounded-lg py-2 pl-9 pr-3 text-[11px] font-mono text-textPrimary outline-none focus:border-cyan/50 placeholder:text-textMuted/50"
                  />
                </div>

                <div className="relative flex-1">
                  <Replace size={14} className="absolute left-3 top-1/2 -translate-y-1/2" color={T.textMuted} />
                  <input
                    type="text"
                    placeholder="Replace with..."
                    value={replaceQuery}
                    onChange={(e) => setReplaceQuery(e.target.value)}
                    className="w-full bg-white/5 border border-border rounded-lg py-2 pl-9 pr-3 text-[11px] font-mono text-textPrimary outline-none focus:border-cyan/50 placeholder:text-textMuted/50"
                  />
                </div>

                <JpeButton variant="primary" size="xs" icon={ArrowLeftRight} onClick={handleFindReplace} disabled={!findQuery}>
                  Replace All
                </JpeButton>
                <JpeButton variant="secondary" size="xs" icon={Trash2} onClick={handleDeleteEmpty}>
                  Delete Empty
                </JpeButton>
                <JpeButton variant="ghost" size="xs" icon={Plus} onClick={handleSyncKeys} disabled={files.length < 2}>
                  Sync Keys
                </JpeButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {activeFile ? (
            <div className="p-6">
              {/* Entry Header */}
              <div className="grid grid-cols-[120px_1fr_80px] gap-3 mb-3 px-2">
                <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted, fontWeight: 700, letterSpacing: '0.1em' }}>
                  HASH
                </span>
                <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted, fontWeight: 700, letterSpacing: '0.1em' }}>
                  VALUE
                </span>
                <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted, fontWeight: 700, letterSpacing: '0.1em' }}>
                  ACTIONS
                </span>
              </div>

              {/* Entries */}
              <div className="space-y-1">
                {filteredEntries.map((entry) => {
                  const collision = collisions.get(entry.hash.toUpperCase());
                  const hasConflict = collision?.isConflict;
                  const hasOtherFiles = (collision?.files.length || 0) > 1;

                  return (
                    <div
                      key={entry.hash}
                      className={`grid grid-cols-[120px_1fr_80px] gap-3 items-center px-2 py-2 rounded-lg transition-colors ${
                        hasConflict ? 'bg-amber/5 hover:bg-amber/10' : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <span style={{ fontSize: 10, fontFamily: T.mono, color: hasConflict ? T.amber : T.cyan }}>
                          {entry.hash}
                        </span>
                        {hasConflict ? (
                          <AlertCircle size={10} color={T.amber} title="Conflict: Same hash has different values in other languages" />
                        ) : hasOtherFiles ? (
                          <CheckCircle2 size={10} color={T.emerald} title="Synced: Same value across other languages" />
                        ) : null}
                      </div>
                      <input
                        type="text"
                        value={entry.value}
                        onChange={(e) => updateEntry(activeFile.id, entry.hash, e.target.value)}
                        className={`bg-white/5 border rounded-lg px-3 py-1.5 text-[11px] font-mono text-textPrimary outline-none focus:border-cyan/50 ${
                          hasConflict ? 'border-amber/30' : 'border-border'
                        }`}
                      />
                      <div className="flex items-center gap-1">
                      <button
                        onClick={() => addEntry(activeFile.id)}
                        className="p-1.5 hover:bg-white/10 rounded transition-colors"
                        title="Add entry below"
                      >
                        <Plus size={12} color={T.emerald} />
                      </button>
                      <button
                        onClick={() => deleteEntry(activeFile.id, entry.hash)}
                        className="p-1.5 hover:bg-white/10 rounded transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 size={12} color={T.rose} />
                      </button>
                    </div>
                    </div>
                  );
                })}

                {filteredEntries.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <FileText size={32} color={T.textMuted} className="mb-4 opacity-20" />
                    <p style={{ fontSize: 12, color: T.textSecondary }}>No entries found</p>
                    <JpeButton variant="ghost" size="xs" icon={Plus} onClick={() => addEntry(activeFile.id)} className="mt-3">
                      Add First Entry
                    </JpeButton>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <Globe size={48} color={T.textMuted} className="mb-4 opacity-20" />
              <h3 style={{ fontSize: 16, fontWeight: 900, fontFamily: T.display, color: T.textPrimary, marginBottom: 8 }}>
                No STBL Files Loaded
              </h3>
              <p style={{ fontSize: 12, color: T.textSecondary, maxWidth: 300, marginBottom: 20 }}>
                Add language files using the dropdown above to start batch editing string tables.
              </p>
              <select
                onChange={(e) => { if (e.target.value) addFile(e.target.value); e.target.value = ''; }}
                className="bg-white/5 border border-border rounded-lg px-3 py-2 text-[11px] font-mono text-textMuted outline-none focus:border-cyan/50"
                defaultValue=""
              >
                <option value="" disabled>+ Select Language to Add</option>
                {LANGUAGES.map(l => (
                  <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Operation Result Toast */}
        <AnimatePresence>
          {operationResult && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20"
            >
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl ${
                operationResult.failed === 0
                  ? 'bg-emerald/10 border-emerald/30 text-emerald'
                  : 'bg-amber/10 border-amber/30 text-amber'
              }`}>
                {operationResult.failed === 0 ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <AlertCircle size={16} />
                )}
                <span style={{ fontSize: 11, fontFamily: T.mono, fontWeight: 700 }}>
                  {operationResult.message}
                </span>
                <button
                  onClick={() => setOperationResult(null)}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Stats */}
        <div className="flex items-center justify-between px-6 py-3 border-t text-[10px] font-mono" style={{ borderColor: T.border, color: T.textMuted }}>
          <div className="flex items-center gap-4">
            <span>FILE: {activeFile?.language || 'N/A'}</span>
            <span>ENTRIES: {filteredEntries.length}</span>
            <span>TOTAL: {totalEntries}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald" />
              {files.length} LANGUAGES
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default BatchSTBLEditor;

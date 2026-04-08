# JPE Mod Translator 2.0 — Code Gap Analysis

**Date**: 2026-04-05
**After**: Stories 1.1–1.5 completed

---

## Completed Stories

| # | Story | Title | Status | Tests |
|---|-------|-------|--------|-------|
| 1 | 1.1 | Create New Project | ✅ Done | 34 unit tests |
| 2 | 1.2 | Backend Wiring & Live Testing | ✅ Done | 23 unit + 47 integration + 6 E2E + 18 pytest |
| 3 | 1.3 | Open Project & File Management | ✅ Done | 49/56 unit tests |
| 4 | 1.4 | File Editor & JPE Translation | ✅ Done | 13 unit tests |
| 5 | 1.5 | Save & Real-Time Validation | ✅ Done | 7 unit tests |

---

## Code Gap Summary

### GAP 1: STBL (String Table) Files — HIGH PRIORITY

| Aspect | Status | Detail |
|--------|--------|--------|
| Binary STBL Parser (TS) | EXISTS | `src/engine/parsers/STBLParser.ts` — 134 lines, parses binary STBL to structured data |
| STBL Types | EXISTS | `src/engine/parsers/types/stbl.ts` — STBLFile, STBLEntry, LanguageCode types |
| STBL Tests | EXISTS | `src/__tests__/stbl.test.ts`, `src/services/translation/__tests__/story-2.3.test.ts` |
| STBL → JPE Converter | MISSING | Need to convert parsed STBL to JPE text for editor display |
| STBL Compiler (JPE → Binary) | MISSING | Critical gap — no way to write edited STBL back to binary format |
| useFileLoader STBL handling | MISSING | File loader doesn't handle STBL ArrayBuffer reading |
| Python STBL Parser | MISSING | `engine/sims4_file_support.py` has `NotImplementedError` |
| Python STBL Compiler | MISSING | No Python-side STBL compilation |
| Editor STBL mode | PARTIAL | Editor treats STBL as generic file type — no language-aware display |

**Next story**: `docs/stories/2.1.1.story.md` created.

---

### GAP 2: Package (.package) Files — MEDIUM PRIORITY

| Aspect | Status | Detail |
|--------|--------|--------|
| DBPF Parser (TS) | EXISTS | `src/engine/parsers/PackageParser.ts` — 335 lines, parses DBPF format |
| PackageService | EXISTS | `src/services/PackageService.ts` — loadPackage, getVirtualFiles, extractResourceFast, extractResourceAsBase64 |
| AssetList component | EXISTS | `src/components/editor/AssetList.tsx` — displays package contents |
| ResourcePreviewer | EXISTS | `src/components/editor/ResourcePreviewer.tsx` — previews resources |
| Package in Editor | EXISTS | EditorPane handles `type === 'package'` by showing AssetList |
| Package Compiler | MISSING | No way to write edited package back to .package binary |
| Python Package Parser | MISSING | `engine/sims4_file_support.py` has `NotImplementedError` |
| Resource editing | MISSING | Can view package contents but not edit individual resources |

---

### GAP 3: Config/JSON Files — LOW PRIORITY

| Aspect | Status | Detail |
|--------|--------|--------|
| ConfigParser (TS) | EXISTS | `src/engine/parsers/ConfigParser.ts` — 421 lines, handles JSON + YAML |
| Config Types | EXISTS | `src/engine/parsers/types/config.ts` |
| Config Compiler | MISSING | No ConfigCompiler to write JPE back to .cfg/JSON |
| Python Config Parser | EXISTS | Python handles JSON/YAML natively |

---

### GAP 4: Search & Replace — LOW PRIORITY

| Aspect | Status | Detail |
|--------|--------|--------|
| SearchReplace component | EXISTS | `src/components/editor/SearchReplace.tsx` — case-sensitive, regex, replace, replace-all |
| Integrated in editor | EXISTS | Wired in `IntegratedEditor.tsx` |
| Monaco native search | NOT USED | Monaco's built-in `addFindWidget` not used; current implementation works on raw string |
| In-editor highlighting | MISSING | No yellow highlights in editor for search matches |

---

### GAP 5: Auto-Complete — MEDIUM PRIORITY

| Aspect | Status | Detail |
|--------|--------|--------|
| Monaco completion provider | EXISTS | `src/utils/monaco-config.ts` — 3 hardcoded snippets (interaction, buff.apply, available_when) |
| SmartAutocompleteService | EXISTS | `src/services/editor/SmartAutocompleteService.ts` — 278 lines, pattern-based scoring |
| Wired into editor | MISSING | SmartAutocompleteService is NOT connected to Monaco's completion pipeline |
| Ctrl+Space binding | MISSING | No keyboard shortcut to trigger suggestions |
| Context-aware completions | MISSING | No file-type-specific completions |

---

### GAP 6: Undo/Redo History — LOW PRIORITY

| Aspect | Status | Detail |
|--------|--------|--------|
| Monaco native undo/redo | EXISTS | Built into Monaco editor |
| EditHistoryPanel | EXISTS | `src/components/EditHistoryPanel.tsx` — full timeline UI with undo/redo, search, filter, bookmarks |
| Keyboard shortcuts | EXISTS | Ctrl+Z undo, Ctrl+Shift+Z/Ctrl+Y redo in shortcut store |
| Real history tracking | MISSING | EditHistoryPanel seeded with demo data (`makeDemo()`), not real edits |
| History persistence | MISSING | History not saved to disk |
| 50-change limit | MISSING | No enforcement of max history size |

---

### GAP 7: Version History & Auto-Backup — MEDIUM PRIORITY

| Aspect | Status | Detail |
|--------|--------|--------|
| Backup on save | EXISTS | `FileServiceEnhanced.writeFile()` with `createBackup: true` → `filename.backup-{timestamp}` |
| Server save route | EXISTS | `/api/files/save` with backup support |
| Auto-save timer | MISSING | No periodic auto-save (architecture says "every 5 minutes") |
| Version diff UI | MISSING | No way to compare versions |
| Restore from version | MISSING | Can't revert to previous version |
| 20-version limit | MISSING | No cleanup of old backups |

---

### GAP 8: Export/Package Mod — LOW PRIORITY

| Aspect | Status | Detail |
|--------|--------|--------|
| PackageExportWizard | EXISTS | `src/components/PackageExportWizard.tsx` — 814 lines, 5-step wizard |
| File selection | EXISTS | Step 1: select files with checkboxes |
| Metadata entry | EXISTS | Step 2: name, version, author, description, category, tags, license |
| Compatibility flags | EXISTS | Step 3: expansion pack compatibility |
| Preview | EXISTS | Step 4: build preview |
| Actual .zip creation | MISSING | Export uses mock data and simulated progress |
| Real checksum generation | MISSING | Uses fake checksums |
| File bundling | MISSING | No actual archive creation |

---

### GAP 9: Educational Error Messages — LOW PRIORITY

| Aspect | Status | Detail |
|--------|--------|--------|
| Error messages exist | EXISTS | Validation returns diagnostic messages |
| Suggestions for fixes | MISSING | No "did you mean?" suggestions |
| Documentation links | MISSING | Errors don't link to docs |
| Example correct syntax | MISSING | No examples shown with errors |

---

### GAP 10: Customizable Interface — LOW PRIORITY

| Aspect | Status | Detail |
|--------|--------|--------|
| Panel resize | MISSING | Panels have fixed widths |
| Panel collapse | MISSING | Can't collapse sidebar panels |
| Save layout per project | MISSING | Layout not persisted |
| Full-screen editor | MISSING | No full-screen mode |
| Font size adjustment | MISSING | No font size controls |
| Show/hide line numbers | MISSING | Line numbers always shown in Monaco |

---

## What Works Well (No Gaps)

| Feature | Status |
|---------|--------|
| Project creation | ✅ Full — dialog, directory structure, metadata |
| Open project | ✅ Full — recent projects, file discovery |
| Add files to project | ✅ Full — file picker, preview, progress |
| File tree with icons | ✅ Full — grouped by type, context menu |
| Monaco editor with JPE language | ✅ Full — syntax highlighting, markers |
| XML → JPE translation | ✅ Full — via Python engine or TS translator |
| JPE → XML compilation | ✅ Full — via Python engine |
| Save (Ctrl+S) with JPE→XML compile | ✅ Full — atomic writes, backup |
| Save All (Ctrl+Shift+S) | ✅ Full — multi-file, progress toast |
| Real-time validation | ✅ Full — 300ms debounce, diagnostics, preview |
| Compile button | ✅ Full — Python engine, error display |
| Dark mode | ✅ Full — next-themes + Monaco theme |
| Tutorial/onboarding | ✅ Full — 8 steps, QuickStart checklist |
| Python engine health check | ✅ Full — discovery, version check, dependency check |
| AI services (Claude, OpenAI, Gemini, Qwen) | ✅ Full — 4 providers × 3 endpoints |
| Diagnostics panel | ✅ Full — errors, warnings, click-to-navigate |
| Keyboard navigation | ✅ Full — shortcuts for all major actions |

---

## Priority Recommendations

1. **HIGH**: STBL support (Story 2.1.1) — Most requested file type after XML, parser exists, needs compiler
2. **MEDIUM**: Auto-complete wiring — SmartAutocompleteService exists, just needs Monaco integration
3. **MEDIUM**: Package file editing — Parser works, needs resource editing capability
4. **LOW**: Search & Replace Monaco native — Current solution works, could be better
5. **LOW**: Undo/Redo history persistence — Monaco native works, panel exists but demo-only
6. **LOW**: Version history auto-save — Backup-on-save works, needs timer + diff UI
7. **LOW**: Export actual .zip creation — Wizard exists, needs real archive logic
8. **LOW**: Config/JSON compiler — Parser works, needs write-back
9. **LOW**: Educational error messages — Errors shown, could be more helpful
10. **LOW**: Customizable interface — Nice-to-have polish

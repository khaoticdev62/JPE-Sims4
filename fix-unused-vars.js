/**
 * Automated fixer for @typescript-eslint/no-unused-vars errors.
 * Parses ESLint output and fixes files by:
 * 1. Unused imports → remove from import
 * 2. Unused params → prefix with _
 * 3. Unused assigned vars → prefix with _
 * 4. Unused destructured properties → prefix with _
 */

const fs = require('fs');
const path = require('path');

// Parse lint output to extract errors
function parseLintErrors(lintOutput) {
  const lines = lintOutput.split('\n');
  const files = {};
  let currentFile = null;

  for (const line of lines) {
    // Match file path lines like: ./src/foo/bar.ts
    const fileMatch = line.match(/^\.(\/[\w\-/.]+)\.(tsx?|ts)$/);
    if (fileMatch) {
      currentFile = fileMatch[1] + '.' + fileMatch[2];
      if (!files[currentFile]) files[currentFile] = [];
      continue;
    }

    // Match error lines like: 12:5  Error: 'foo' is defined but never used. ... @typescript-eslint/no-unused-vars
    // Or: 12:5  Error: 'foo' is assigned a value but never used. ... @typescript-eslint/no-unused-vars
    const errMatch = line.match(/^(\d+):\d+\s+Error: '(\w+)' (is defined|is assigned a value) but never used\.\s*(Allowed unused (?:args|vars|caught errors) must match.*?\.  )?@typescript-eslint\/no-unused-vars/);
    if (errMatch && currentFile) {
      const col = parseInt(errMatch[1]);
      const name = errMatch[2];
      const errorType = errMatch[3]; // "is defined" or "is assigned a value"
      files[currentFile].push({ line: col, name, errorType, rawLine: line });
    }

    // Match: "Allowed unused args must match" → param error
    const isParam = line.includes('Allowed unused args must match');
    if (errMatch && isParam && currentFile) {
      const col = parseInt(errMatch[1]);
      const name = errMatch[2];
      const existing = files[currentFile].find(e => e.line === col && e.name === name);
      if (existing) existing.isParam = true;
    }
  }

  return files;
}

// Fix unused imports in a file
function fixUnusedImports(content, errors) {
  const importErrors = errors.filter(e => !e.isParam);
  
  for (const err of importErrors) {
    const { name } = err;
    
    // Pattern 1: import { name, ... } from '...'
    // Remove name from the destructured list
    const importRegex1 = new RegExp(`(import\\s+.*?\\{[^}]*)\\b${name}\\b,?\\s*`, 'g');
    if (importRegex1.test(content)) {
      content = content.replace(importRegex1, (match, before) => {
        // Check if this is the only import
        const fullMatch = match.trim();
        const afterImport = content.substring(content.indexOf(match) + match.length);
        const closeBraceIdx = afterImport.indexOf('}');
        const between = afterImport.substring(0, closeBraceIdx);
        
        // Remove name and clean up commas/whitespace
        let cleaned = match.replace(new RegExp(`\\b${name}\\b,?\\s*`), '');
        cleaned = cleaned.replace(/,\s*}/g, '}'); // trailing comma
        cleaned = cleaned.replace(/\{\s*,/g, '{'); // leading comma
        cleaned = cleaned.replace(/\{\s*\}/g, '{}'); // empty braces shouldn't happen
        
        // If the import becomes empty, we need to handle it
        const importStmtMatch = cleaned.match(/import\s+(.*)/);
        if (importStmtMatch) {
          const rest = importStmtMatch[1];
          if (rest.match(/^\{\s*\}\s*from\s+/)) {
            // Empty named import - remove entire statement
            return '';
          }
        }
        return cleaned;
      });
      continue;
    }

    // Pattern 2: import { name } from '...' (single import)
    const importRegex2 = new RegExp(`import\\s+\\{\\s*${name}\\s*\\}\\s+from\\s+['"][^'"]+['"]\\s*;?\\s*`, 'g');
    if (importRegex2.test(content)) {
      content = content.replace(importRegex2, '');
      continue;
    }
    
    // Pattern 3: import name from '...' (default import)
    const importRegex3 = new RegExp(`import\\s+${name}\\s+from\\s+['"][^'"]+['"]\\s*;?\\s*`, 'g');
    if (importRegex3.test(content)) {
      content = content.replace(importRegex3, '');
      continue;
    }

    // Pattern 4: name is in a multi-line import with others
    // Try removing just the name
    const nameRegex = new RegExp(`\\b${name}\\b,?\\s*`);
    const importLineMatch = content.match(new RegExp(`^.*import.*\\b${name}\\b.*$`, 'm'));
    if (importLineMatch) {
      const importLine = importLineMatch[0];
      // Check if it's in braces (named import)
      if (importLine.includes('{') && importLine.includes('}')) {
        // Find all names in the braces
        const braceMatch = importLine.match(/\{([^}]+)\}/);
        if (braceMatch) {
          const names = braceMatch[1].split(',').map(n => n.trim()).filter(Boolean);
          const filtered = names.filter(n => n !== name);
          if (filtered.length === 0) {
            // Remove entire import line
            content = content.replace(new RegExp(`^.*import.*\\b${name}\\b.*\\r?\\n?`, 'm'), '');
          } else {
            const newNames = filtered.join(', ');
            content = content.replace(braceMatch[0], `{ ${newNames} }`);
          }
        }
      }
    }
  }
  
  return content;
}

// Fix unused parameters/variables by prefixing with _
function fixUnusedVars(content, errors) {
  const varErrors = errors.filter(e => e.isParam || e.errorType === 'is assigned a value');
  
  for (const err of varErrors) {
    const { name } = err;
    const prefixed = '_' + name;
    
    if (err.isParam) {
      // Function parameter - replace in parameter list
      // Match: (name, ...) or (..., name, ...) or (..., name) or name => ...
      const paramPatterns = [
        // Arrow function: (name) => or (name, other) =>
        new RegExp(`(\\()\\s*${name}\\s*(,)`, 'g'),       // (name, ...)
        new RegExp(`(,)\\s*${name}\\s*(\\))`, 'g'),        // (..., name)
        new RegExp(`(,)\\s*${name}\\s*(,)`, 'g'),          // (..., name, ...)
        new RegExp(`(\\()\\s*${name}\\s*(\\))`, 'g'),      // (name)
        // Catch: catch (name)
        new RegExp(`(catch\\s*\\()\\s*${name}\\s*(\\))`, 'g'), // catch (name)
        // Function decl: function foo(name, ...) 
        new RegExp(`(function\\s+\\w+\\s*\\([^)]*?)\\b${name}\\b`, 'g'),
        // Method: methodName(name, ...)
        new RegExp(`(\\w+\\s*\\([^)]*?)\\b${name}\\b`, 'g'),
      ];
      
      let found = false;
      for (const pattern of paramPatterns) {
        if (pattern.test(content)) {
          content = content.replace(pattern, (match, g1, g2) => {
            if (g1 === '(' || g1 === 'catch (' || g1 === 'catch(') {
              // First param or catch
              return g1.includes('catch') ? `${g1}${prefixed}` : `${g1}${prefixed}`;
            }
            return `${g1}${prefixed}${g2 || ''}`;
          });
          found = true;
          break;
        }
      }
      
      if (!found) {
        // Try simple word boundary replacement for catch blocks
        const catchRegex = new RegExp(`(catch\\s*\\()\\s*${name}\\s*(\\))`, 'g');
        if (catchRegex.test(content)) {
          content = content.replace(catchRegex, `$1${prefixed}$2`);
        }
      }
    } else {
      // Unused assignment: let/const name = ...
      const assignRegex = new RegExp(`\\b(let|const|var)\\s+${name}\\b`, 'g');
      if (assignRegex.test(content)) {
        content = content.replace(assignRegex, `$1 ${prefixed}`);
      }
    }
  }
  
  return content;
}

// Better approach: for each file, read it and apply targeted fixes
function fixFile(filePath, errors) {
  // filePath looks like: /src/components/editor/AssetList.tsx
  const fullPath = path.join(__dirname, filePath.replace(/^\//, '').replace(/\//g, path.sep));
  if (!fs.existsSync(fullPath)) {
    console.log(`  SKIP: File not found: ${fullPath}`);
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf-8');
  const originalContent = content;

  // Categorize errors
  const importErrors = [];
  const paramErrors = [];
  const assignErrors = [];

  for (const err of errors) {
    // Determine if it's an import error (defined at top of file)
    const contentLines = content.split('\n');
    // Check if the name appears on an import line
    const isOnImportLine = contentLines.slice(0, Math.min(err.line + 2, contentLines.length)).some(line => 
      line.includes('import') && line.includes(err.name)
    );
    
    if (isOnImportLine && err.errorType === 'is defined') {
      importErrors.push(err);
    } else if (err.errorType === 'is assigned a value') {
      assignErrors.push(err);
    } else {
      paramErrors.push(err);
    }
  }

  // Fix 1: Remove unused imports
  for (const err of importErrors) {
    const { name } = err;
    
    // Multi-line import: { name, other } or { other, name }
    // Try removing name from named imports
    const patterns = [
      // { name } alone
      { regex: new RegExp(`(import\\s+\\{)\\s*${name}\\s*(\\}\\s+from\\s+)`, 'g'), replacer: '' },
      // { name, other } - name first
      { regex: new RegExp(`(import\\s+\\{)\\s*${name}\\s*,\\s*`, 'g'), replacer: '' },
      // { other, name } - name last
      { regex: new RegExp(`,\\s*${name}\\s*(\\}\\s+from\\s+)`, 'g'), replacer: '$1' },
      // { other, name, more } - name middle
      { regex: new RegExp(`,\\s*${name}\\s*,`, 'g'), replacer: ',' },
      // import name from '...' (default import)
      { regex: new RegExp(`^import\\s+${name}\\s+from\\s+['\"][^'\"]+['\"];?\\s*$`, 'gm'), replacer: '' },
      // import name, { other } from '...' (default + named)
      { regex: new RegExp(`^import\\s+${name},\\s*`, 'gm'), replacer: '' },
      // import { other }, name from '...' (named + default as)
      { regex: new RegExp(`,\\s*${name}\\s+from`, 'g'), replacer: ' from' },
    ];

    for (const { regex, replacer } of patterns) {
      if (regex.test(content)) {
        content = content.replace(regex, replacer);
        break;
      }
    }

    // Clean up empty import braces: import {} from '...'
    content = content.replace(/import\s+\{\s*\}\s+from\s+['"][^'"]+['"]\s*;?\s*\n?/g, '');
    // Clean up trailing commas: { a, } → { a }
    content = content.replace(/,\s*}/g, '}');
    // Clean up leading commas: { , b } → { b }
    content = content.replace(/\{\s*,/g, '{');
    // Clean up double commas
    content = content.replace(/,,/g, ',');
  }

  // Fix 2: Prefix unused parameters with _
  for (const err of paramErrors) {
    const { name } = err;
    const prefixed = '_' + name;
    
    // Avoid double-prefixing
    if (name.startsWith('_')) continue;
    
    // catch (name) => catch (_name)
    const catchRegex = new RegExp(`(catch\\s*\\(\\s*)${name}(\\s*\\))`, 'g');
    if (catchRegex.test(content)) {
      content = content.replace(catchRegex, `$1${prefixed}$2`);
      continue;
    }

    // For arrow functions: (name) => ..., (name, b) => ..., (a, name) => ..., (a, name, b) => ...
    // For regular functions: function fn(name) ..., fn(name) ...
    // Try matching within parentheses
    
    // Strategy: find the line containing the param and fix it
    const contentLines = content.split('\n');
    const targetLineIdx = err.line - 1; // 1-indexed to 0-indexed
    
    // Look around the target line for the parameter
    const searchStart = Math.max(0, targetLineIdx - 2);
    const searchEnd = Math.min(contentLines.length, targetLineIdx + 3);
    
    for (let i = searchStart; i < searchEnd; i++) {
      const line = contentLines[i];
      // Check if this line has the param in a function-like context
      if (line.match(/(=>|function|\w+\s*\(|catch\s*\()/) && line.includes(name)) {
        // Replace the parameter name
        // Match: (name) or (name, or , name) or , name,
        const newLine = line.replace(
          new RegExp(`([,(]\\s*)${name}(\\s*[,)=>])`, 'g'),
          `$1${prefixed}$2`
        ).replace(
          new RegExp(`(catch\\s*\\(\\s*)${name}(\\s*\\))`, 'g'),
          `$1${prefixed}$2`
        );
        if (newLine !== line) {
          contentLines[i] = newLine;
          break;
        }
      }
    }
    content = contentLines.join('\n');
  }

  // Fix 3: Prefix unused assignments with _
  for (const err of assignErrors) {
    const { name } = err;
    const prefixed = '_' + name;
    
    if (name.startsWith('_')) continue;
    
    // let/const/var name = ...
    const assignRegex = new RegExp(`\\b(let|const|var)\\s+${name}\\b`, 'g');
    if (assignRegex.test(content)) {
      content = content.replace(assignRegex, `$1 ${prefixed}`);
    }
  }

  // Only write if changed
  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf-8');
    return true;
  }
  return false;
}

// Main
const lintOutput = fs.readFileSync(path.join(__dirname, 'lint_full.txt'), 'utf-8');
const errors = parseLintErrors(lintOutput);

let fixedCount = 0;
let skippedCount = 0;

for (const [filePath, fileErrors] of Object.entries(errors)) {
  console.log(`Fixing ${filePath} (${fileErrors.length} errors)...`);
  const result = fixFile(filePath, fileErrors);
  if (result) {
    fixedCount++;
    console.log(`  ✓ Fixed`);
  } else {
    skippedCount++;
    console.log(`  - No changes needed (or regex didn't match)`);
  }
}

console.log(`\nDone! Fixed ${fixedCount} files, skipped ${skippedCount} files.`);
console.log(`Total errors processed: ${Object.values(errors).reduce((sum, arr) => sum + arr.length, 0)}`);

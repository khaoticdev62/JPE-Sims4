const fs = require('fs');
let c = fs.readFileSync('src/__tests__/unit/services/fixes/FixSuggestionEngine.test.ts', 'utf8');

c = c.split('\n').map(line => {
  if (line.startsWith('        startLine:')) return line.replace('startLine:', 'line:');
  if (line.startsWith('        startColumn:')) return line.replace('startColumn:', 'column:');
  return line;
}).join('\n');

c = c.replace('expect(results[1].newContent).toContain(\'"value"\')', 'expect(results[1].newContent).toContain(\'"value)"\')');
c = c.replace('import { FixApplier, fixApplier }', 'import { FixApplier }');

fs.writeFileSync('src/__tests__/unit/services/fixes/FixSuggestionEngine.test.ts', c);
console.log('Fixed file');

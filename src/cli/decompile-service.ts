import { JPEDecompiler } from '../services/translation/decompiler';
import * as fs from 'fs';
import * as path from 'path';

/**
 * CLI Bridge for JPEDecompiler
 * Usage: npx tsx src/cli/decompile-service.ts <xml_path> [output_path]
 */
async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: decompile-service <xml_path> [output_path]');
    process.exit(1);
  }

  const xmlPath = path.resolve(args[0]);
  const outputPath = args[1] ? path.resolve(args[1]) : null;

  try {
    if (!fs.existsSync(xmlPath)) {
      console.error(`Error: File not found at ${xmlPath}`);
      process.exit(1);
    }

    const xml = fs.readFileSync(xmlPath, 'utf8');
    const decompiler = new JPEDecompiler();
    const jpe = decompiler.decompile(xml);

    if (outputPath) {
      fs.writeFileSync(outputPath, jpe, 'utf8');
      console.log(`Decompiled to ${outputPath}`);
    } else {
      process.stdout.write(jpe);
    }
  } catch (error) {
    console.error(`Decompilation failed: ${error}`);
    process.exit(1);
  }
}

main();

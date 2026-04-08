/**
 * Web Worker for running compilation in background thread
 * Prevents UI blocking during project compilation
 */ // Real JPE Engine Imports
import { tokenize, parse } from '../engine/jpe';
import { jpeToXml } from '../engine/translators/jpeToXml';
import { XMLCompiler } from '../engine/compilers/XMLCompiler';
/**
 * Real Compilation Logic
 * Executes the full Lexing -> Parsing -> Translation -> Serialization pipeline
 */ function compileContent(content, fileType, targetFormat) {
    try {
        if (targetFormat === 'xml' && fileType === 'jpe') {
            // 1. JPE -> XML (Compilation)
            const tokens = tokenize(content);
            const ast = parse(tokens);
            const xmlElement = jpeToXml(ast);
            if (!xmlElement) throw new Error('Translation failed: Null XML AST');
            const xmlString = XMLCompiler.elementToXMLString(xmlElement, true, 0);
            return {
                success: true,
                output: xmlString,
                format: 'xml'
            };
        } else if (targetFormat === 'jpe' && fileType === 'xml') {
            // 2. XML -> JPE (Decompilation - Placeholder for now, can be expanded)
            return {
                success: false,
                output: '',
                format: 'jpe',
                error: 'Reverse compilation in workers not yet optimized'
            };
        }
        return {
            success: false,
            output: '',
            format: '',
            error: `Unsupported transformation: ${fileType} to ${targetFormat}`
        };
    } catch (error) {
        return {
            success: false,
            output: '',
            format: '',
            error: error instanceof Error ? error.message : 'Unknown compilation error'
        };
    }
}
// Handle incoming messages
self.onmessage = (event)=>{
    const { type, payload, _taskId } = event.data;
    if (type === 'compile') {
        const startTime = performance.now();
        const targetFormat = payload.fileType === 'xml' ? 'jpe' : 'xml';
        const result = compileContent(payload.fileContent, payload.fileType, targetFormat);
        const duration = performance.now() - startTime;
        if (result.success) {
            const message = {
                type: 'compile-complete',
                _taskId,
                result: {
                    fileId: payload.fileId,
                    success: true,
                    outputFormat: result.format,
                    compiledContent: result.output,
                    duration
                }
            };
            self.postMessage(message);
        } else {
            const errorMsg = {
                type: 'compile-error',
                _taskId,
                error: result.error || 'Compilation failed',
                fileId: payload.fileId
            };
            self.postMessage(errorMsg);
        }
    }
};
